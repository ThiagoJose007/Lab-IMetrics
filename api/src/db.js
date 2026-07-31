const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS publicacoes (
      id          SERIAL PRIMARY KEY,
      titulo      TEXT NOT NULL,
      autores     TEXT[] NOT NULL DEFAULT '{}',
      ano         INTEGER,
      tipo        TEXT,
      linha       TEXT,
      resumo      TEXT,
      doi         TEXT,
      link        TEXT,
      revista     TEXT,
      volume      TEXT,
      numero      TEXT,
      paginas     TEXT,
      criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  console.log('Banco de dados pronto.');
}

module.exports = { pool, initDB };
