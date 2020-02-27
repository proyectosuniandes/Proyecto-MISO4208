const express = require('express');
const router = express.Router();
const prueba = require('../models/Prueba');

//Insert
router.post('/insert', async (req, res) => {
  const { tipo, app } = req.body;
  try {
    const newPrueba = await prueba.create({
      tipo: tipo,
      app: app
    });
    if (newPrueba) {
      res.json({
        message: 'prueba succesfully created',
        data: newPrueba
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Prueba not created' });
  }
});

//Update
router.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  const { tipo, app } = req.body;
  try {
    const result = await prueba.update(
      {
        tipo: tipo,
        app: app
      },
      { where: { id_prueba: id } }
    );
    res.json({
      message: 'prueba updated succesfully ',
      count: result[0]
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't update prueba" });
  }
});

//Delete
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRowCount = await prueba.destroy({
      where: {
        id_prueba: id
      }
    });
    res.json({
      message: 'prueba deleted succesfully ',
      count: deletedRowCount
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't delete prueba" });
  }
});

//Get
router.get('/get/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const resPrueba = await prueba.findOne({
      where: {
        id_prueba: id
      }
    });
    res.json({ data: resPrueba });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't retrieve prueba" });
  }
});

//GetAll
router.get('/getAll', async (req, res) => {
  try {
    const pruebas = await prueba.findAll();
    res.json({ data: pruebas });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't retrieve pruebas" });
  }
});
module.exports = router;
