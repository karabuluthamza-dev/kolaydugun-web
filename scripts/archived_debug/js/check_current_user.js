
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rnkyghovurnaizkhwgtv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkCurrentUser() {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
        console.log('No active session')
        return
    }

    console.log('Current User ID:', session.user.id)
    console.log('Current User Email:', session.user.email)
    console.log('Current User Role:', session.user.user_metadata?.role || session.user.app_metadata?.role)

    // Check if this user has a vendor profile
    const { data: vendor } = await supabase
        .from('vendors')
        .select('business_name, category')
        .eq('user_id', session.user.id)
        .single()

    if (vendor) {
        console.log('Vendor Profile:', vendor)
    } else {
        console.log('No vendor profile found for this user')
    }
}

checkCurrentUser()
