const express = require('express');
const router = express.Router();
const app = require('../models/App');

//Insert
router.post('/insert', async (req, res) => {
  const { nombre, tipo_app } = req.body;
  try {
    const newApp = await app.create({
      nombre: nombre,
      tipo_app: tipo_app
    });
    if (newApp) {
      res.json({ message: 'app succesfully created', data: newApp });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'App not created' });
  }
});

//Update
router.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, tipo_app } = req.body;
  try {
    const result = await app.update(
      { nombre: nombre, tipo_app: tipo_app },
      { where: { id_app: id } }
    );
    res.json({
      message: 'app updated succesfully ',
      count: result[0]
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't update app" });
  }
});

//Delete
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRowCount = await app.destroy({
      where: {
        id_app: id
      }
    });
    res.json({
      message: 'app deleted succesfully ',
      count: deletedRowCount
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't delete app" });
  }
});

//Get
router.get('/get/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const resApp = await app.findOne({
      where: {
        id_app: id
      }
    });
    res.json({ data: resApp });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't retrieve app" });
  }
});

//GetAll
router.get('/getAll', async (req, res) => {
  try {
    const apps = await app.findAll();
    res.json({ data: apps });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't retrieve apps" });
  }
});
module.exports = router;
