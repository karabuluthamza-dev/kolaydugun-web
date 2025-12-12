
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rnkyghovurnaizkhwgtv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mzc0NDI5MiwiZXhwIjoyMDc5MzIwMjkyfQ.7qPfWVPQPXNhxLNVWQxdqKXjUODHLDfhgEPDPBVuTWM'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkNotifications() {
    const userId = 'cc61b0f2-d0f4-46ef-a323-a0546f85e36a'; // Dj34Istanbul

    console.log('Checking user_notifications for:', userId)

    const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error:', error)
        return
    }

    console.log('Found notifications:', data.length)
    console.log('Notifications:', JSON.stringify(data, null, 2))
}

checkNotifications()
