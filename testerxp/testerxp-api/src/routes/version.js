const express = require('express');
const router = express.Router();
const version = require('../models/Version');

//Insert
router.post('/insert', async (req, res) => {
  const { descripcion, ruta_app, app } = req.body;
  try {
    const newVersion = await version.create({
      descripcion: descripcion,
      ruta_app: ruta_app,
      app: app
    });
    if (newVersion) {
      res.json({
        message: 'version succesfully created',
        data: newVersion
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Version not created' });
  }
});

//Update
router.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  const { descripcion, ruta_app, app } = req.body;
  try {
    const result = await version.update(
      { descripcion: descripcion, ruta_app: ruta_app, app: app },
      { where: { id_version: id } }
    );
    res.json({
      message: 'version updated succesfully ',
      count: result[0]
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't update version" });
  }
});

//Delete
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRowCount = await version.destroy({
      where: {
        id_version: id
      }
    });
    res.json({
      message: 'version deleted succesfully ',
      count: deletedRowCount
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't delete version" });
  }
});

//Get
router.get('/get/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const resVersion = await version.findOne({
      where: {
        id_version: id
      }
    });
    res.json({ data: resVersion });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't retrieve version" });
  }
});

//GetAll
router.get('/getAll', async (req, res) => {
  try {
    const versions = await version.findAll();
    res.json({ data: versions });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't retrieve versions" });
  }
});
module.exports = router;
