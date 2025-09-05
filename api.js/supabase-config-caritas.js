// api.js/supabase-config-caritas.js — corregido y robusto
console.log("📌 supabase-config-caritas.js cargado");

(() => {
  'use strict';

  if (window.CARITAS?.supabase) {
    console.warn("⚠️ Supabase ya estaba inicializado");
    return;
  }

  const SUPABASE_URL = "https://qivjlsvcjyqymommfdke.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpdmpsc3ZjanlxeW1vbW1mZGtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNjA2MjUsImV4cCI6MjA2OTkzNjYyNX0.YN0W5miJeWwu96jhqKiGB-cA8t9TeIboQWURCjTFVbw";

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("❌ Configuración de Supabase incompleta.");
    return;
  }

  async function initSupabase(retries = 3) {
    try {
      const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      window.CARITAS = window.CARITAS || {};
      window.CARITAS.supabase = supabase;

      console.log("✅ Supabase inicializado (Caritas)");
      document.dispatchEvent(new Event("supabase:ready:caritas"));
    } catch (err) {
      console.error(`❌ Error cargando Supabase (intentos restantes: ${retries})`, err);
      if (retries > 0) {
        setTimeout(() => initSupabase(retries - 1), 1500);
      } else {
        console.error("❌ No se pudo inicializar Supabase tras varios intentos.");
        document.dispatchEvent(new Event("supabase:error:caritas"));
      }
    }
  }

  // 🚀 Inicializar Supabase
  initSupabase();
})();