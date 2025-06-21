const mongoose = require('mongoose');

const AnimalSchema = new mongoose.Schema({
    codigo: String,
    tipo: String,
    fechaNacimiento: String,
    edadEnMeses: Number,
    esTernero: Boolean,
    tiempoAmamantado: Number,
    numeroDePartos: Number,
    intervaloParto: [String]
});

module.exports = mongoose.model('Animal', AnimalSchema);
