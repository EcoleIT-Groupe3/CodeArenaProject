// src/config/database.js

const { Pool } = require('pg');
require('dotenv').config();

// Création du pool de connexions PostgreSQL
const pool = new Pool({
  host: process.env.DATABASE_HOST || 'postgres',           // Nom du service Docker
  port: parseInt(process.env.DATABASE_PORT, 10) || 5432,  // Convertir la variable d'environnement en nombre
  database: process.env.DATABASE_NAME || 'codearena',
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
});

// Event : connexion réussie
pool.on('connect', () => {
  console.log('✅ Database connected successfully');
});

// Event : erreur de connexion
pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
  process.exit(-1);
});

module.exports = pool;
