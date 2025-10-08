const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Conexión a MongoDB Atlas
mongoose
  .connect("mongodb+srv://fieldsmart25:Hidalgo0696@fieldsmart01.heru0rb.mongodb.net/sistemaRiego?retryWrites=true&w=majority")
  .then(() => console.log("✅ Conectado a MongoDB Atlas"))
  .catch(err => console.error("❌ Error al conectar con MongoDB:", err));


const dataSchema = new mongoose.Schema({
  temperatura: Number,
  humedad: Number,
  estado: String,
  deteccion: String,
  fecha: { type: Date, default: Date.now }
});

const Historial = mongoose.model("Historial", dataSchema);
const Sensor = mongoose.model("Sensor", dataSchema);

//  Endpoint para recibir datos
app.post("/api/datos", async (req, res) => {
  try {
    console.log("📩 Dato recibido:", req.body);

    // Guardar en historial
    const nuevoHistorial = new Historial(req.body);
    await nuevoHistorial.save();

    // Actualizar el sensor actual
    await Sensor.findOneAndUpdate({}, req.body, { upsert: true, new: true });

    console.log("✅ Dato guardado correctamente en MongoDB");
    res.status(201).send("✅ Dato guardado correctamente");
  } catch (error) {
    console.error("❌ Error al guardar dato:", error);
    res.status(500).send("❌ Error en el servidor");
  }
});

//  Endpoint para ver todos los datos
app.get("/api/historial", async (req, res) => {
  try {
    const datos = await Historial.find().sort({ fecha: -1 });
    res.json(datos);
  } catch (error) {
    res.status(500).send("❌ Error al obtener historial");
  }
});

//  Endpoint para ver último dato
app.get("/api/sensor", async (req, res) => {
  try {
    const sensor = await Sensor.findOne();
    res.json(sensor || {});
  } catch (error) {
    res.status(500).send("❌ Error al obtener sensor actual");
  }
});


app.get("/", (req, res) => {
  res.send("🚀 Servidor de sistema de riego activo en Render");
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 Servidor corriendo en puerto ${PORT}`));
