// supabase-config.js
const SUPABASE_URL = "https://qivjlsvcjyqymommfdke.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...."; // tu anon key

window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("✅ Supabase inicializado correctamente (UMD)");
