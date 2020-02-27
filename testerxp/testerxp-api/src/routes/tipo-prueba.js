const express = require('express');
const router = express.Router();
const tipoPrueba = require('../models/TipoPrueba');

//Insert
router.post('/insert', async (req, res) => {
  const { descripcion, parametros, script } = req.body;
  try {
    const newTipoPrueba = await tipoPrueba.create({
      descripcion: descripcion,
      parametros: parametros,
      script: script
    });
    if (newTipoPrueba) {
      res.json({
        message: 'tipoPrueba succesfully created',
        data: newTipoPrueba
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'TipoPrueba not created' });
  }
});

//Update
router.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  const { descripcion, parametros, script } = req.body;
  try {
    const result = await tipoPrueba.update(
      { descripcion: descripcion, parametros: parametros, script: script },
      { where: { id_tipo: id } }
    );
    res.json({
      message: 'tipoPrueba updated succesfully ',
      count: result[0]
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't update tipoPrueba" });
  }
});

//Delete
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRowCount = await tipoPrueba.destroy({
      where: {
        id_tipo: id
      }
    });
    res.json({
      message: 'tipoPrueba deleted succesfully ',
      count: deletedRowCount
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't delete tipoPrueba" });
  }
});

//Get
router.get('/get/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const resTipoPrueba = await tipoPrueba.findOne({
      where: {
        id_tipo: id
      }
    });
    res.json({ data: resTipoPrueba });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't retrieve tipoPrueba" });
  }
});

//GetAll
router.get('/getAll', async (req, res) => {
  try {
    const tipoPruebas = await tipoPrueba.findAll();
    res.json({ data: tipoPruebas });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't retrieve tipoPruebas" });
  }
});
module.exports = router;
