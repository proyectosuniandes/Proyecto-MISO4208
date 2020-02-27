const express = require('express');
const router = express.Router();
const historicoPrueba = require('../models/HistoricoPrueba');

//Insert
router.post('/insert', async (req, res) => {
  const { prueba, estado, fecha_inicio, fecha_fin } = req.body;
  try {
    const newHistoricoPrueba = await historicoPrueba.create({
      prueba: prueba,
      estado: estado,
      fecha_inicio: fecha_inicio,
      fecha_fin: fecha_fin
    });
    if (newHistoricoPrueba) {
      res.json({
        message: 'historicoPrueba succesfully created',
        data: newHistoricoPrueba
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'HistoricoPrueba not created' });
  }
});

//Update
router.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  const { prueba, estado, fecha_inicio, fecha_fin } = req.body;
  try {
    const result = await historicoPrueba.update(
      {
        prueba: prueba,
        estado: estado,
        fecha_inicio: fecha_inicio,
        fecha_fin: fecha_fin
      },
      { where: { id_his: id } }
    );
    res.json({
      message: 'historicoPrueba updated succesfully ',
      count: result[0]
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't update historicoPrueba" });
  }
});

//Delete
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRowCount = await historicoPrueba.destroy({
      where: {
        id_his: id
      }
    });
    res.json({
      message: 'historicoPrueba deleted succesfully ',
      count: deletedRowCount
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't delete historicoPrueba" });
  }
});

//Get
router.get('/get/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const resHistoricoPrueba = await historicoPrueba.findOne({
      where: {
        id_his: id
      }
    });
    res.json({ data: resHistoricoPrueba });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't retrieve historicoPrueba" });
  }
});

//GetAll
router.get('/getAll', async (req, res) => {
  try {
    const historicoPruebas = await historicoPrueba.findAll();
    res.json({ data: historicoPruebas });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't retrieve historicoPruebas" });
  }
});
module.exports = router;
