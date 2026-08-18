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
  await pool.query(`
    CREATE TABLE IF NOT EXISTS membros (
      id          SERIAL PRIMARY KEY,
      nome        TEXT NOT NULL,
      papel       TEXT,
      area        TEXT,
      categoria   TEXT NOT NULL DEFAULT 'doutor',
      nivel       TEXT,
      foto_url    TEXT,
      lattes_url  TEXT,
      orcid_url   TEXT,
      ativo       BOOLEAN NOT NULL DEFAULT TRUE,
      ordem       INTEGER NOT NULL DEFAULT 0,
      criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS imprensa (
      id               SERIAL PRIMARY KEY,
      titulo           TEXT NOT NULL,
      veiculo          TEXT,
      tipo             TEXT NOT NULL DEFAULT 'materia',
      data_publicacao  DATE,
      url              TEXT,
      descricao        TEXT,
      imagem_url       TEXT,
      destaque         BOOLEAN NOT NULL DEFAULT FALSE,
      ativo            BOOLEAN NOT NULL DEFAULT TRUE,
      criado_em        TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  // Migrações seguras: colunas adicionadas sem recriar a tabela
  await pool.query(`ALTER TABLE imprensa ADD COLUMN IF NOT EXISTS descricao_curta TEXT;`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS imagens (
      id        SERIAL PRIMARY KEY,
      dados     TEXT NOT NULL,
      mime      TEXT NOT NULL DEFAULT 'image/jpeg',
      nome      TEXT,
      criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  console.log('Banco de dados pronto.');
}

module.exports = { pool, initDB };
