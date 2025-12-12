import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function inspectSchema() {
    console.log('Inspecting leads table...');
    const { data, error } = await supabase
        .from('leads')
        .select('*')
        .limit(1)

    if (error) {
        console.error('Error:', error)
    } else if (data && data.length > 0) {
        console.log('Leads columns:', Object.keys(data[0]))
    } else {
        console.log('Leads table found but empty. Cannot infer columns easily via select.');
    }
}

inspectSchema()
