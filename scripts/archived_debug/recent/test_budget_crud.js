
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rnkyghovurnaizkhwgtv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testBudgetCrud() {
    const email = `test.budget.${Date.now()}@example.com`;
    const password = 'password123';

    console.log(`1. Creating user: ${email}`);
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password
    });

    if (signUpError) {
        console.error('SignUp failed:', signUpError);
        return;
    }
    console.log('User created:', user.id);

    // 2. Create (Insert)
    console.log('2. Creating budget item...');
    const newItem = {
        user_id: user.id,
        category: 'Venue',
        estimated_cost: 5000,
        actual_cost: 4500,
        paid_amount: 1000,
        notes: 'Initial deposit'
    };

    const { data: inserted, error: insertError } = await supabase
        .from('budget_items')
        .insert([newItem])
        .select()
        .single();

    if (insertError) {
        console.error('Insert failed:', insertError);
        return;
    }
    console.log('Item inserted:', inserted);

    // 3. Read
    console.log('3. Reading budget items...');
    const { data: items, error: readError } = await supabase
        .from('budget_items')
        .select('*')
        .eq('user_id', user.id);

    if (readError) {
        console.error('Read failed:', readError);
        return;
    }
    console.log('Items read:', items.length);

    // 4. Update
    console.log('4. Updating budget item...');
    const { data: updated, error: updateError } = await supabase
        .from('budget_items')
        .update({ paid_amount: 2000 })
        .eq('id', inserted.id)
        .select()
        .single();

    if (updateError) {
        console.error('Update failed:', updateError);
        return;
    }
    console.log('Item updated:', updated);

    // 5. Delete
    console.log('5. Deleting budget item...');
    const { error: deleteError } = await supabase
        .from('budget_items')
        .delete()
        .eq('id', inserted.id);

    if (deleteError) {
        console.error('Delete failed:', deleteError);
        return;
    }
    console.log('Item deleted successfully.');
    console.log('SUCCESS: Budget CRUD verified.');
}

testBudgetCrud();
