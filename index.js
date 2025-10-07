const express = require("express");
const { MongoClient } = require("mongodb");
const app = express();
app.use(express.json());

// 🔗 Conexión a MongoDB Atlas
const uri = "mongodb+srv://fieldsmart25:Hidalgo0696@fieldsmart01.heru0rb.mongodb.net/?retryWrites=true&w=majority&appName=fieldsmart01";
const dbName = "prueba";
const collectionName = "lecturas";

let collection;

async function conectarDB() {
  const client = new MongoClient(uri);
  await client.connect();
  console.log("✅ Conectado a MongoDB Atlas");
  const db = client.db(dbName);
  collection = db.collection(collectionName);
}

conectarDB();

// 📥 Endpoint para recibir datos desde el ESP
app.post("/api/datos", async (req, res) => {
  try {
    const dato = req.body;
    dato.fecha = new Date();
    await collection.insertOne(dato);
    console.log("✅ Dato recibido y guardado:", dato);
    res.status(200).send({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Error al guardar" });
  }
});

app.listen(3000, () => console.log("🚀 Servidor corriendo en http://localhost:3000"));
