const express = require('express');
const router = express.Router();
const Animal = require('../models/Animal');

// GET todos los animales
router.get('/', async (req, res) => {
    const animales = await Animal.find();
    res.json(animales);
});

// POST agregar animal
router.post('/', async (req, res) => {
    const nuevoAnimal = new Animal(req.body);
    await nuevoAnimal.save();
    res.json(nuevoAnimal);
});

// PUT actualizar animal
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const actualizado = await Animal.findByIdAndUpdate(id, req.body, { new: true });
    res.json(actualizado);
});

// DELETE eliminar animal
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    await Animal.findByIdAndDelete(id);
    res.json({ mensaje: 'Animal eliminado' });
});

module.exports = router;