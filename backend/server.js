require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
const animalesRoutes = require('./routes/animales');
app.use('/api/animales', animalesRoutes);

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI, {
}).then(() => {
    console.log('Conectado a MongoDB');
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Error conectando a MongoDB', err);
});

app.get('/', (req, res) => {
  res.send('¡El backend está funcionando!');
});