const express = require('express');
const router = express.Router();
const tipoApp = require('../models/TipoApp');

//Insert
router.post('/insert', async (req, res) => {
  const { descripcion } = req.body;
  try {
    const newTipoApp = await tipoApp.create({
      descripcion: descripcion
    });
    if (newTipoApp) {
      res.json({ message: 'tipoApp succesfully created', data: newTipoApp });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'TipoApp not created' });
  }
});

//Update
router.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  const { descripcion } = req.body;
  try {
    const result = await tipoApp.update(
      { descripcion: descripcion },
      { where: { id_tipo_app: id } }
    );
    res.json({
      message: 'tipoApp updated succesfully ',
      count: result[0]
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't update tipoApp" });
  }
});

//Delete
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRowCount = await tipoApp.destroy({
      where: {
        id_tipo_app: id
      }
    });
    res.json({
      message: 'tipoApp deleted succesfully ',
      count: deletedRowCount
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't delete tipoApp" });
  }
});

//Get
router.get('/get/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const resTipoApp = await tipoApp.findOne({
      where: {
        id_tipo_app: id
      }
    });
    res.json({ data: resTipoApp });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't retrieve tipoApp" });
  }
});

//GetAll
router.get('/getAll', async (req, res) => {
  try {
    const tipoApps = await tipoApp.findAll();
    res.json({ data: tipoApps });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't retrieve tipoApps" });
  }
});
module.exports = router;
