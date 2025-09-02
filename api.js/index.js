// index.js — API Cáritas CNC (Familias + Credenciales)
import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(cors());
app.use(express.json());

// ================== Supabase Client ==================
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ⚠️ usa la service_role key SOLO en backend
);

// ================== Helpers ==================
function handleError(res, error, context = "") {
  console.error(`❌ Error en ${context}:`, error);
  res.status(500).json({ error: error.message || error });
}

// ================== Rutas de Familias ==================

// Obtener todas las familias
app.get("/api/familias", async (req, res) => {
  try {
    const { data, error } = await supabase.from("familias").select("*").order("id", { ascending: true });
    if (error) return handleError(res, error, "GET /familias");
    res.json(data);
  } catch (err) {
    handleError(res, err, "GET /familias");
  }
});

// Insertar una familia
app.post("/api/familias", async (req, res) => {
  try {
    const payload = req.body;
    const { data, error } = await supabase.from("familias").insert(payload).select();
    if (error) return handleError(res, error, "POST /familias");
    res.status(201).json(data);
  } catch (err) {
    handleError(res, err, "POST /familias");
  }
});

// Actualizar familia
app.patch("/api/familias/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const { data, error } = await supabase.from("familias").update(payload).eq("id", id).select();
    if (error) return handleError(res, error, "PATCH /familias/:id");
    res.json(data);
  } catch (err) {
    handleError(res, err, "PATCH /familias/:id");
  }
});

// Eliminar familia
app.delete("/api/familias/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from("familias").delete().eq("id", id);
    if (error) return handleError(res, error, "DELETE /familias/:id");
    res.status(204).send();
  } catch (err) {
    handleError(res, err, "DELETE /familias/:id");
  }
});

// ================== Rutas de Credenciales ==================

// Obtener credencial de un usuario por user_id
app.get("/api/credenciales/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const { data, error } = await supabase.from("credenciales").select("*").eq("user_id", user_id).single();
    if (error) return handleError(res, error, "GET /credenciales/:user_id");
    res.json(data);
  } catch (err) {
    handleError(res, err, "GET /credenciales/:user_id");
  }
});

// Crear credencial
app.post("/api/credenciales", async (req, res) => {
  try {
    const payload = req.body;
    const { data, error } = await supabase.from("credenciales").insert(payload).select();
    if (error) return handleError(res, error, "POST /credenciales");
    res.status(201).json(data);
  } catch (err) {
    handleError(res, err, "POST /credenciales");
  }
});

// Actualizar credencial
app.patch("/api/credenciales/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const payload = req.body;
    const { data, error } = await supabase.from("credenciales").update(payload).eq("user_id", user_id).select();
    if (error) return handleError(res, error, "PATCH /credenciales/:user_id");
    res.json(data);
  } catch (err) {
    handleError(res, err, "PATCH /credenciales/:user_id");
  }
});

// ================== Healthcheck ==================
app.get("/", (req, res) => {
  res.send("✅ API Cáritas CNC funcionando en Render");
});

// ================== Start ==================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});