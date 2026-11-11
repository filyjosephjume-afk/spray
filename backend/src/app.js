// src/app.js : configuration d'Express
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const routes = require('./routes'); // Mampiditra ny routes rehetra
const { notFound, errorHandler } = require('./middlewares/error.middleware');

const app = express();

// Origines autorisées : localhost + CORS_ORIGIN
const extraOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

const allowedOrigins = ['http://localhost:5173', ...extraOrigins];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const ok =
      allowedOrigins.includes(origin) ||
      /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin);

    return ok ? callback(null, true) : callback(new Error('Origine non autorisée par CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());

// Vérification rapide que l'API tourne : /api/health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', date: new Date().toISOString() });
});

// Ampidirina eto ny routes rehetra (mandeha ho an'ny /api sy ny / mivantana):
app.use('/api', routes);
app.use('/', routes);

// Toujours en dernier
app.use(notFound);
app.use(errorHandler);

module.exports = app;