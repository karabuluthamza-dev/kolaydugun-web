import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    let step = 'init'

    try {
        step = 'supabase_init'
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseKey)

        // 🔒 SECURITY: Verify admin role
        step = 'auth_check'
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Unauthorized - No auth token' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)

        if (authError || !user) {
            return new Response(JSON.stringify({ error: 'Unauthorized - Invalid token' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // Check if user is admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'admin') {
            console.warn(`⚠️ SECURITY: Non-admin user ${user.id} attempted to trigger AI brain`)
            return new Response(JSON.stringify({ error: 'Forbidden - Admin access required' }), {
                status: 403,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        step = 'get_settings'
        // Get settings
        const { data: settingsData, error: settingsError } = await supabase
            .from('shop_amazon_settings')
            .select('*')

        const settings: Record<string, string> = {}
        settingsData?.forEach((s: any) => { settings[s.key] = s.value })

        if (settingsError) {
            console.error('Settings error:', settingsError)
        }

        step = 'get_products'
        // Gather analytics data - SIMPLIFIED QUERY
        const { data: products, error: productsError } = await supabase
            .from('shop_products')
            .select('id, name_de, name_tr, category_id, product_type, created_at')
            .eq('product_type', 'amazon')
            .order('created_at', { ascending: false })
            .limit(20)

        if (productsError) {
            throw new Error(`Products error: ${productsError.message}`)
        }

        step = 'get_all_products'
        const { data: allProducts } = await supabase
            .from('shop_products')
            .select('id, status')
            .eq('product_type', 'amazon')

        const totalProducts = allProducts?.length || 0
        const activeProducts = allProducts?.filter((p: any) => p.status === 'active').length || 0
        const totalClicks = 0 // Assuming click tracking is not yet set up
        const totalViews = 0

        const avgClickRate = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : 0

        // Recent trends
        const topPerformers = products?.slice(0, 3) || []
        const lowPerformers = products?.slice(-3) || []

        const analyticsContext = `
Analiz Tarihi: ${new Date().toLocaleDateString('tr-TR')}
Toplam Ürün: ${totalProducts}
Aktif Ürün: ${activeProducts}
Toplam Tıklama: ${totalClicks}
Toplam Görüntülenme: ${totalViews}
Ortalama Tıklama Oranı: %${avgClickRate}

En İyi Ürünler:
${topPerformers.map((p: any, i: number) => `${i + 1}. ${p.name_tr || p.name_de} (${p.category_id})`).join('\n')}

Düşük Performanslılar:
${lowPerformers.map((p: any, i: number) => `${i + 1}. ${p.name_tr || p.name_de}`).join('\n')}
`

        step = 'call_gemini'
        let aiResponse;

        // Try to generate AI content, fallback to mock if fails
        try {
            if (!settings.gemini_api_key) {
                throw new Error('Gemini API key not configured')
            }

            const genAI = new GoogleGenerativeAI(settings.gemini_api_key)
            // Use 1.5-flash as it is generally stable, or 2.0-flash-exp if preferred
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

            const prompt = `Sen bir e-ticaret uzmanısın. Aşağıdaki düğün ürünleri sitesinin verilerini analiz et ve Türkçe olarak öneriler ver.

"${analyticsContext}"

Şu formatta SAF JSON yanıt ver (Markdown yok):
{
  "daily_tasks": [
    {"title": "Görev başlığı", "description": "Kısa açıklama", "priority": 1, "type": "add_products"}
  ],
  "insights": [
    {"title": "İçgörü başlığı", "message": "Kısa açıklama", "type": "info"}
  ],
  "recommendations": [
    {"title": "Öneri başlığı", "description": "Detaylı açıklama", "priority": 1, "action_type": "add_product"}
  ],
  "performance_score": 75,
  "performance_summary": "Kısa performans özeti"
}`

            const result = await model.generateContent(prompt)
            const aiText = result.response.text()

            // Clean markdown syntax if present (```json ... ```)
            const jsonText = aiText.replace(/```json|```/g, '').trim()

            const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
            if (!jsonMatch) {
                throw new Error('Invalid AI response - no JSON found')
            }

            aiResponse = JSON.parse(jsonMatch[0])

        } catch (aiError: any) {
            console.error('Gemini API call failed:', aiError)

            // FALLBACK RESPONSE
            aiResponse = {
                "daily_tasks": [
                    { "title": "Veri Analizi (Fallback)", "description": `AI servisine ulaşılamadı. ${totalProducts} ürün analiz edildi.`, "priority": 1, "type": "analyze_stats" },
                    { "title": "Manuel Kontrol", "description": "Lütfen ürün fiyatlarını ve stoklarını manuel kontrol edin.", "priority": 2, "type": "check_products" }
                ],
                "insights": [
                    { "title": "AI Servis Hatası", "message": `Gemini yanıt vermedi: ${aiError.message}. Sistem yedek modda çalışıyor.`, "type": "warning" },
                    { "title": "Durum", "message": `${activeProducts} adet aktif ürününüz var.`, "type": "info" }
                ],
                "recommendations": [
                    { "title": "API Key Kontrolü", "description": "Lütfen Gemini API anahtarınızı ayarlardan kontrol edin.", "priority": 1, "action_type": "check_settings" }
                ],
                "performance_score": 60,
                "performance_summary": "AI analizi yapılamadı, ancak sistem verileri güncel."
            }
        }


        step = 'save_tasks'
        // Save daily tasks to database
        const today = new Date().toISOString().split('T')[0]

        try {
            if (aiResponse.daily_tasks && aiResponse.daily_tasks.length > 0) {
                // Delete old tasks for today
                await supabase
                    .from('shop_daily_tasks')
                    .delete()
                    .eq('task_date', today)

                const tasksToInsert = aiResponse.daily_tasks.map((task: any) => ({
                    task_date: today,
                    task_type: task.type || 'custom',
                    title: task.title,
                    description: task.description,
                    target_count: 1,
                    current_count: 0,
                    ai_generated: true,
                    is_completed: false
                }))

                const { error: tasksError } = await supabase
                    .from('shop_daily_tasks')
                    .insert(tasksToInsert)

                if (tasksError) console.error('Error saving tasks:', tasksError)
            }
        } catch (e) {
            console.error('Failed to save tasks:', e)
        }

        step = 'save_recommendations'
        // Save recommendations
        try {
            if (aiResponse.recommendations && aiResponse.recommendations.length > 0) {
                // Clear old 'new' recommendations
                await supabase
                    .from('shop_ai_recommendations')
                    .delete()
                    .eq('status', 'new')

                const recsToInsert = aiResponse.recommendations.map((rec: any) => ({
                    type: rec.action_type || 'task',
                    title: rec.title,
                    description: rec.description || rec.title,
                    priority: rec.priority || 3,
                    status: 'new',
                    action_type: rec.action_type,
                    action_data: {}
                }))

                const { error: recsError } = await supabase
                    .from('shop_ai_recommendations')
                    .insert(recsToInsert)

                if (recsError) console.error('Error saving recommendations:', recsError)
            }
        } catch (e) {
            console.error('Failed to save recommendations:', e)
        }

        return new Response(
            JSON.stringify(aiResponse),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            }
        )

    } catch (error: any) {
        console.error(`AI Brain error at step [${step}]:`, error)
        return new Response(JSON.stringify({
            error: error.message,
            step: step
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
})
