
import { createClient } from '@supabase/supabase-js';

// User provided credentials
const supabaseUrl = 'https://ircbhwmxsnnnzeodzadm.supabase.co';
// WARNING: The user provided key 'sb_publishable_...' seems unusual. 
// Standard keys start with 'ey...'. 
// I am using it as requested, but it might fail if it's not the correct 'anon public' key.
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyY2Jod214c25ubnplb2R6YWRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MjM4ODIsImV4cCI6MjA4NDQ5OTg4Mn0.1xfUXm17L8YIwX9VMh0gRj4SlJWF3NWfwEQ8a7LYt8E';

export const supabase = createClient(supabaseUrl, supabaseKey);
