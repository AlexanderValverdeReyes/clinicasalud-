import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hjskngraiamrjcrpyaws.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhqc2tuZ3JhaWFtcmpjcnB5YXdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODA0NTksImV4cCI6MjA3Nzg1NjQ1OX0.kFSlgjHm5u35m9XF5veqy0LaEPYys1oADRKLiqOsz_M"; // 👈 tu clave pública

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
