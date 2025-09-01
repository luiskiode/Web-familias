import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";

dotenv.config();

const app = express();

// === Middlewares globales ===
app.disable("x-powered-by");
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(morgan("dev"));

// === CORS dinámico ===
const allowedOrigins = [
  "https://luiskiode.github.io",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.warn(`❌ Bloqueado por CORS: ${origin}`);
      return callback(new Error(`CORS no permitido para: ${origin}`), false);
    },
  })
);

// === Multer (memoria) ===
const upload = multer({ storage: multer.memoryStorage() });

// === Supabase config ===
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error("❌ SUPABASE_URL y SUPABASE_KEY deben estar definidas en .env");
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

// === Static ===
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

// === Rutas API ===
app.get("/health", (_, res) => res.json({ ok: true }));
app.get("/", (_, res) =>
  res.json({ status: "ok", message: "✅ Backend Cáritas CNC activo" })
);

// === Familias ===

// 1) Obtener familias
app.get("/familias", async (_, res) => {
  try {
    const { data, error } = await supabase
      .from("familias")
      .select("*")
      .order("id", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("❌ Error al obtener familias:", err);
    res.status(500).json({ error: err.message || "Error interno" });
  }
});

// 2) Registrar familia
app.post("/familias", upload.single("archivo"), async (req, res) => {
  try {
    const required = [
      "nombres_apellidos",
      "dni_solicitante",
      "apellido_familia",
      "direccion",
      "fecha_registro",
      "telefono_contacto",
    ];
    const faltantes = required.filter((f) => !String(req.body[f] || "").trim());
    if (faltantes.length > 0) {
      return res
        .status(400)
        .json({ error: `Faltan campos: ${faltantes.join(", ")}` });
    }

    // === Subida de archivo opcional ===
    let archivoURL = null;
    if (req.file) {
      const safeName = `${Date.now()}_${req.file.originalname
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .slice(0, 80)}`;

      const { error: uploadError } = await supabase.storage
        .from("documentosfamilias")
        .upload(safeName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false,
        });
      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from("documentosfamilias")
        .getPublicUrl(safeName);
      archivoURL = publicData?.publicUrl || null;
    }

    const { error: dbError } = await supabase.from("familias").insert([
      {
        ...req.body,
        archivo_url: archivoURL,
        creado_en: new Date().toISOString(),
      },
    ]);
    if (dbError) throw dbError;

    res.json({ message: "✅ Familia registrada", archivo: archivoURL });
  } catch (err) {
    console.error("🔥 Error al registrar familia:", err);
    res.status(500).json({ error: err.message || "Error interno" });
  }
});

// === Middleware 404 ===
app.use((_, res) => res.status(404).json({ error: "No encontrado" }));

// === Error handler global ===
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("🔥 Unhandled error:", err);
  res.status(500).json({ error: err.message || "Error interno" });
});

// === Start ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ API escuchando en http://localhost:${PORT}`)
);
