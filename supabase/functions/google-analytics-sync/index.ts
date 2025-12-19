import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { JWT } from 'npm:google-auth-library@8.7.0'

const GA4_PROPERTY_ID = "514625017"
const GSC_SITE_URL = "https://kolaydugun.de/"

Deno.serve(async (req) => {
    try {
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { status: 401 })
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        if (!supabaseUrl || !supabaseServiceKey) {
            return new Response(JSON.stringify({ error: 'Supabase environment variables missing' }), { status: 500 })
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // 0. Fetch all vendor slugs for mapping
        const { data: vendors, error: vendorError } = await supabase
            .from('vendors')
            .select('id, slug')
            .is('deleted_at', null)

        if (vendorError) throw vendorError
        const vendorMap = new Map(vendors.map(v => [v.slug, v.id]))

        // 1. Get Google Credentials from Secrets
        const googleCredsRaw = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON')
        if (!googleCredsRaw) {
            return new Response(JSON.stringify({ error: 'GOOGLE_SERVICE_ACCOUNT_JSON not found' }), { status: 500 })
        }

        const creds = JSON.parse(googleCredsRaw)
        const client = new JWT({
            email: creds.client_email,
            key: creds.private_key,
            scopes: [
                'https://www.googleapis.com/auth/analytics.readonly',
                'https://www.googleapis.com/auth/webmasters.readonly',
            ],
        })

        await client.authorize()

        // 2. Fetch GA4 Page Data (Last 30 days)
        const gaResponse = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runReport`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${client.credentials.access_token}` },
            body: JSON.stringify({
                dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
                dimensions: [{ name: 'pagePath' }],
                metrics: [
                    { name: 'activeUsers' },
                    { name: 'screenPageViews' }
                ],
            })
        })
        const gaData = await gaResponse.json()
        if (gaData.error) throw new Error(`GA4 API: ${gaData.error.message}`)

        // 3. Fetch GSC Page Data (Last 30 days)
        const gscResponse = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(GSC_SITE_URL)}/searchAnalytics/query`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${client.credentials.access_token}` },
            body: JSON.stringify({
                startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                endDate: new Date().toISOString().split('T')[0],
                dimensions: ['page'],
                rowLimit: 500
            })
        })
        const gscData = await gscResponse.json()
        if (gscData.error) throw new Error(`GSC API: ${gscData.error.message}`)

        // 4. Map and Aggregate Data
        const today = new Date().toISOString().split('T')[0]
        const performanceData: any[] = []

        // Map GA4 Results
        gaData.rows?.forEach((row: any) => {
            const path = row.dimensionValues[0].value
            const match = path.match(/\/vendors\/([^\/\?]+)/)
            const slug = match ? match[1] : null
            const vendorId = slug ? vendorMap.get(slug) : null

            if (vendorId) {
                performanceData.push({
                    vendor_id: vendorId,
                    snapshot_date: today,
                    page_path: path,
                    unique_users: parseInt(row.metricValues[0].value || '0'),
                    views: parseInt(row.metricValues[1].value || '0'),
                    updated_at: new Date().toISOString()
                })
            }
        })

        // Update with GSC Results (Search performance)
        gscData.rows?.forEach((row: any) => {
            const url = row.keys[0] // Full URL
            const pathMatch = url.match(/https?:\/\/[^\/]+(\/vendors\/[^\/\?]+)/)
            const path = pathMatch ? pathMatch[1] : null
            const slugMatch = path?.match(/\/vendors\/([^\/\?]+)/)
            const slug = slugMatch ? slugMatch[1] : null
            const vendorId = slug ? vendorMap.get(slug) : null

            if (vendorId) {
                const existing = performanceData.find(d => d.vendor_id === vendorId)
                if (existing) {
                    existing.clicks = (existing.clicks || 0) + (row.clicks || 0)
                    existing.impressions = (existing.impressions || 0) + (row.impressions || 0)
                } else {
                    performanceData.push({
                        vendor_id: vendorId,
                        snapshot_date: today,
                        page_path: path,
                        clicks: row.clicks || 0,
                        impressions: row.impressions || 0,
                        updated_at: new Date().toISOString()
                    })
                }
            }
        })

        // 5. Save Global Snapshot (Legacy support for Dashboard)
        // For global, we keep the previous logic but slightly modified
        const gaGlobalResponse = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runReport`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${client.credentials.access_token}` },
            body: JSON.stringify({
                dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
                metrics: [{ name: 'totalUsers' }, { name: 'sessions' }, { name: 'bounceRate' }]
            })
        })
        const gaGlobal = await gaGlobalResponse.json()
        const globalMetrics = gaGlobal.rows?.[0]?.metricValues || []

        await supabase.from('google_analytics_snapshots').upsert({
            snapshot_date: today,
            total_users: parseInt(globalMetrics[0]?.value || '0'),
            sessions: parseInt(globalMetrics[1]?.value || '0'),
            bounce_rate: parseFloat(globalMetrics[2]?.value || '0'),
            updated_at: new Date().toISOString()
        })

        // 6. Save Vendor Snapshots
        if (performanceData.length > 0) {
            const { error: perfError } = await supabase
                .from('vendor_performance_snapshots')
                .upsert(performanceData, { onConflict: 'vendor_id,snapshot_date' })

            if (perfError) throw perfError
        }

        // 7. 🔥 NEW: Trigger Batch AI Insight Generation
        // This runs the Postgres function we just created to refresh all vendor reports
        const { error: rpcError } = await supabase.rpc('generate_all_active_vendor_reports')
        if (rpcError) console.error('Batch Insight Link Error:', rpcError)

        return new Response(JSON.stringify({
            success: true,
            message: `Sync complete. Processed ${performanceData.length} vendor snapshots and refreshed AI insights.`
        }), {
            headers: { 'Content-Type': 'application/json' },
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }
})
