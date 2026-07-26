import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5cndra2hqZ2Rzc3dncXduZHF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5MjY3MjUsImV4cCI6MjEwMDUwMjcyNX0.OYWriWYrlapT53UTix-jbQbZXtVRG7ywNEu3b_6M57Q'; 
const supabaseAnonKey = 'https://eyrwkkhjgdsswgqwndqx.supabase.co';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
