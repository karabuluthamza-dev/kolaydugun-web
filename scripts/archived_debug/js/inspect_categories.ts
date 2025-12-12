
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = 'https://rnkyghovurnaizkhwgtv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0'
const supabase = createClient(supabaseUrl, supabaseKey)

async function inspectCategories() {
    const { data, error } = await supabase
        .from('vendors')
        .select('category')
        .limit(100)

    if (error) {
        console.error('Error:', error)
        return
    }

    const categories = [...new Set(data.map(v => v.category))]
    console.log('Distinct Categories:', categories)
}

inspectCategories()
