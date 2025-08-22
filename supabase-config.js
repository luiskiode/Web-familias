// supabase-config.js (modo global, sin imports)
const SUPABASE_URL = "https://qivjlsvcjyqymommfdke.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpdmpsc3ZjanlxeW1vbW1mZGtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNjA2MjUsImV4cCI6MjA2OTkzNjYyNX0.YN0W5miJeWwu96jhqKiGB-cA8t9TeIboQWURCjTFVbw";

// Crear cliente global
window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("✅ Supabase inicializado correctamente (UMD)");
