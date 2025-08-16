// supabase-config.js

// ✅ URL y clave pública de tu proyecto Supabase
const supabaseUrl = "https://qivjlsvcjyqymommfdke.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpdmpsc3ZjanlxeW1vbW1mZGtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNjA2MjUsImV4cCI6MjA2OTkzNjYyNX0.YN0W5miJeWwu96jhqKiGB-cA8t9TeIboQWURCjTFVbw";

// ✅ Crear cliente global (la librería supabase ya está cargada desde el CDN en index.html)
window.supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey);

console.log("✅ Supabase inicializado desde supabase-config.js");

