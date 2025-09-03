(function () {
  // Evitar reinicializar si ya existe
  if (window.CARITAS?.supabase) {
    console.log("⚠️ Supabase ya estaba inicializado");
    return;
  }

  const SUPABASE_URL = "https://qivjlsvcjyqymommfdke.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpdmpsc3ZjanlxeW1vbW1mZGtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNjA2MjUsImV4cCI6MjA2OTkzNjYyNX0.YN0W5miJeWwu96jhqKiGB-cA8t9TeIboQWURCjTFVbw";

  if (!window.supabase) {
    console.error("❌ La librería de Supabase no está cargada. Revisa el <script src> en tu HTML.");
    return;
  }

  const { createClient } = window.supabase;
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Guardamos en global
  window.CARITAS = window.CARITAS || {};
  window.CARITAS.supabase = supabase;

  console.log("✅ Supabase inicializado (Caritas):", !!window.CARITAS.supabase);
})();