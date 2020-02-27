const express = require('express');
const router = express.Router();
const script = require('../models/Script');

//Insert
router.post('/insert', async (req, res) => {
  const { descripcion, contenido } = req.body;
  try {
    const newScript = await script.create({
      descripcion: descripcion,
      contenido: contenido
    });
    if (newScript) {
      res.json({ message: 'script succesfully created', data: newScript });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Script not created' });
  }
});

//Update
router.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  const { descripcion, contenido } = req.body;
  try {
    const result = await script.update(
      { descripcion: descripcion, contenido: contenido },
      { where: { id_script: id } }
    );
    res.json({
      message: 'script updated succesfully ',
      count: result[0]
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't update script" });
  }
});

//Delete
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRowCount = await script.destroy({
      where: {
        id_script: id
      }
    });
    res.json({
      message: 'script deleted succesfully ',
      count: deletedRowCount
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't delete script" });
  }
});

//Get
router.get('/get/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const resScript = await script.findOne({
      where: {
        id_script: id
      }
    });
    res.json({ data: resScript });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't retrieve script" });
  }
});

//GetAll
router.get('/getAll', async (req, res) => {
  try {
    const scripts = await script.findAll();
    res.json({ data: scripts });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't retrieve scripts" });
  }
});
module.exports = router;
