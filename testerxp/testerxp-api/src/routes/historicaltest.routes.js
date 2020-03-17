module.exports = app => {
  const HistoricalTests = require('../controllers/historicaltest.controller.js');

  // Create a new HistoricalTest
  app.post('/historicalTests', HistoricalTests.create);

  // Update a HistoricalTest with HistoricalTestId
  app.put('/historicalTests/:historicalTestId', HistoricalTests.update);

  // Delete a HistoricalTest with HistoricalTestId
  app.delete('/historicalTests/:historicalTestId', HistoricalTests.delete);

  // Retrieve a single HistoricalTest with HistoricalTestId
  app.get('/historicalTests/:historicalTestId', HistoricalTests.findOne);

  // Retrieve all Aplications
  app.get('/historicalTests', HistoricalTests.findAll);
};
