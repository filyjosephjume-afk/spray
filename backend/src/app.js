// src/app.js : configuration d'Express
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middlewares/error.middleware');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

// Vérification rapide que l'API tourne : http://localhost:5000/api/health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', date: new Date().toISOString() });
});

app.use('/api', routes);

// Toujours en dernier
app.use(notFound);
app.use(errorHandler);

module.exports = app;
