import { createClient } from '@supabase/supabase-js';

// Ganti dengan URL dan Anon Key project Supabase Anda
const SUPABASE_URL = 'https://izifwpviqpyxauafdlge.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6aWZ3cHZpcXB5eGF1YWZkbGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NDA2ODYsImV4cCI6MjEwNjUxNjY4Nn0.XpJEgQ3vpGOYmPVi-nsjrSRJI9RfR5kWTN_XsL-TCUU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
