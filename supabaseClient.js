import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL || 'https://wduxusyodnfqnhtdtltl.supabase.co';
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkdXh1c3lvZG5mcW5odGR0bHRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyNjg4MjAsImV4cCI6MjEwMTg0NDgyMH0.AqnZ5CmvMioiFQoID7yUstsG6TnsFT6v0W01ebHveoI';

export const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
