const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// ✅ Conexión a MongoDB
mongoose
  .connect("mongodb+srv://fieldsmart25:Hidalgo0696@fieldsmart01.heru0rb.mongodb.net/sistemaRiego?retryWrites=true&w=majority&appName=fieldsmart01", 
    { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch(err => console.log("❌ Error MongoDB:", err));

// ✅ Schema para historial
const HistorialSchema = new mongoose.Schema({
  temperatura: Number,
  humedad: Number,
  estado: String,
  deteccion: String,
  fecha: { type: Date, default: Date.now }
});

// ✅ Schema para sensor actual
const SensorSchema = new mongoose.Schema({
  temperatura: Number,
  humedad: Number,
  estado: String,
  deteccion: String,
  fecha: { type: Date, default: Date.now }
});

// ✅ Modelos
const Historial = mongoose.model("historial", HistorialSchema);
const Sensor = mongoose.model("sensor", SensorSchema);

// ✅ Endpoint para recibir datos del ESP
app.post("/api/datos", async (req, res) => {
  try {
    // Guardar en historial
    const nuevoHistorial = new Historial(req.body);
    await nuevoHistorial.save();

    // Actualizar (o crear) último sensor
    await Sensor.findOneAndUpdate({}, req.body, { upsert: true, new: true });

    res.status(201).send("✅ Dato guardado correctamente");
  } catch (e) {
    console.log(e);
    res.status(500).send("❌ Error al guardar dato");
  }
});

// ✅ Ver historial completo
app.get("/api/historial", async (req, res) => {
  const datos = await Historial.find().sort({ fecha: -1 });
  res.json(datos);
});

// ✅ Ver último dato del sensor
app.get("/api/sensor", async (req, res) => {
  const sensor = await Sensor.findOne();
  res.json(sensor);
});

// ✅ Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 Servidor funcionando en puerto ${PORT}`));
