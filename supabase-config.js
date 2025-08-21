// supabase-config.js

<<<<<<< HEAD
<<<<<<< HEAD
// ✅ URL y clave pública de tu proyecto Supabase
const supabaseUrl = "https://qivjlsvcjyqymommfdke.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpdmpsc3ZjanlxeW1vbW1mZGtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNjA2MjUsImV4cCI6MjA2OTkzNjYyNX0.YN0W5miJeWwu96jhqKiGB-cA8t9TeIboQWURCjTFVbw";

// ✅ Crear cliente global (la librería supabase ya está cargada desde el CDN en index.html)
window.supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey);

console.log("✅ Supabase inicializado desde supabase-config.js");

=======
=======
>>>>>>> 2f6b862eaadeaae75197048f29d1c96d4bcf7495
// ✅ Importar createClient desde el CDN de Supabase
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/esm/index.js';

// ✅ URL y clave pública de tu proyecto Supabase
const SUPABASE_URL = "https://qivjlsvcjyqymommfdke.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpdmpsc3ZjanlxeW1vbW1mZGtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNjA2MjUsImV4cCI6MjA2OTkzNjYyNX0.YN0W5miJeWwu96jhqKiGB-cA8t9TeIboQWURCjTFVbw";

// ✅ Crear cliente Supabase solo una vez
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("✅ Supabase inicializado correctamente");
<<<<<<< HEAD
>>>>>>> a0338b9 (Actualizaci├│n r├ípida desde script)
=======
>>>>>>> 2f6b862eaadeaae75197048f29d1c96d4bcf7495
