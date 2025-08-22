import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS dinámico
const allowedOrigins = ["https://luiskiode.github.io","http://localhost:3000","http://127.0.0.1:3000"];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS no permitido para: ${origin}`), false);
  }
}));

const upload = multer({ storage: multer.memoryStorage() });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ SUPABASE_URL y SUPABASE_KEY deben estar definidas");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (_, res) => res.send("✅ Backend Cáritas CNC activo"));

// Obtener familias
app.get("/familias", async (_, res) => {
  try {
    const { data, error } = await supabase.from("familias").select("*").order("id",{ascending:false});
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("❌ Error al obtener familias:", err);
    res.status(500).json({ error: err.message || err });
  }
});

// Registrar familia
app.post("/familias", upload.single("archivo"), async (req, res) => {
  try {
    const required = ["nombres_apellidos","dni_solicitante","apellido_familia","direccion","fecha_registro","telefono_contacto"];
    for (const field of required) if (!req.body[field]?.trim()) return res.status(400).json({ error: `Falta: ${field}` });

    let archivoURL = null;
    if (req.file) {
      const safeName = `${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9._-]/g,"_")}`;
      const { error: uploadError } = await supabase.storage.from("documentosfamilias").upload(safeName, req.file.buffer, { contentType:req.file.mimetype, upsert:false });
      if (uploadError) throw uploadError;
      archivoURL = `${supabaseUrl}/storage/v1/object/public/documentosfamilias/${safeName}`;
    }

    const { error: dbError } = await supabase.from("familias").insert([{ ...req.body, archivo_url: archivoURL }]);
    if (dbError) throw dbError;

    res.status(200).json({ message:"✅ Familia registrada", archivo: archivoURL });
  } catch (err) {
    console.error("🔥 Error al registrar familia:", err);
    res.status(500).json({ error: err.message || err });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ API escuchando en http://localhost:${PORT}`));
