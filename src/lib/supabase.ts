import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ghwkbcjieqiziqvzidra.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdod2tiY2ppZXFpemlxdnppZHJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNzM2NDIsImV4cCI6MjA3OTY0OTY0Mn0.Zdestv7ovfORRl0LzBi9hAgzi7UmXMUzPr4QVPKiKR8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
