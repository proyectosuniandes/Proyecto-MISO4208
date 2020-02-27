const express = require('express');
const router = express.Router();
const estadoPrueba = require('../models/EstadoPrueba');

//Insert
router.post('/insert', async (req, res) => {
  const { descripcion } = req.body;
  try {
    const newEstadoPrueba = await estadoPrueba.create({
      descripcion: descripcion
    });
    if (newEstadoPrueba) {
      res.json({
        message: 'estadoPrueba succesfully created',
        data: newEstadoPrueba
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'EstadoPrueba not created' });
  }
});

//Update
router.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  const { descripcion } = req.body;
  try {
    const result = await estadoPrueba.update(
      { descripcion: descripcion },
      { where: { id_estado: id } }
    );
    res.json({
      message: 'estadoPrueba updated succesfully ',
      count: result[0]
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't update estadoPrueba" });
  }
});

//Delete
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRowCount = await estadoPrueba.destroy({
      where: {
        id_estado: id
      }
    });
    res.json({
      message: 'estadoPrueba deleted succesfully ',
      count: deletedRowCount
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't delete estadoPrueba" });
  }
});

//Get
router.get('/get/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const resEstadoPrueba = await estadoPrueba.findOne({
      where: {
        id_estado: id
      }
    });
    res.json({ data: resEstadoPrueba });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't retrieve estadoPrueba" });
  }
});

//GetAll
router.get('/getAll', async (req, res) => {
  try {
    const estadoPruebas = await estadoPrueba.findAll();
    res.json({ data: estadoPruebas });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't retrieve estadoPruebas" });
  }
});
module.exports = router;
