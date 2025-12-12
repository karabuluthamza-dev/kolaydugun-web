import dotenv from 'dotenv';
dotenv.config();

console.log('Has Service Key:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log('Has Anon Key:', !!process.env.VITE_SUPABASE_ANON_KEY);
