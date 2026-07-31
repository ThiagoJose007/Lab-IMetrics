/**
 * Importação em lote de publicações a partir de CSV.
 *
 * Colunas esperadas no CSV (separadas por vírgula):
 *   titulo, autores, ano, tipo, linha, resumo, doi, link, revista, volume, numero, paginas
 *
 * "autores" deve ser separado por ponto-e-vírgula dentro da célula:
 *   Ex: "Ronald Ferreira;Maria Silva"
 *
 * Uso:
 *   node src/scripts/importCSV.js caminho/para/arquivo.csv
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const { pool, initDB } = require('../db');

const arquivo = process.argv[2];
if (!arquivo) {
  console.error('Uso: node src/scripts/importCSV.js <arquivo.csv>');
  process.exit(1);
}

async function importar() {
  await initDB();

  const registros = [];
  const parser = fs.createReadStream(path.resolve(arquivo)).pipe(
    parse({ columns: true, trim: true, skip_empty_lines: true })
  );

  for await (const row of parser) {
    registros.push([
      row.titulo   || '',
      row.autores  ? row.autores.split(';').map(a => a.trim()) : [],
      row.ano      ? parseInt(row.ano) : null,
      row.tipo     || null,
      row.linha    || null,
      row.resumo   || null,
      row.doi      || null,
      row.link     || null,
      row.revista  || null,
      row.volume   || null,
      row.numero   || null,
      row.paginas  || null,
    ]);
  }

  let inseridos = 0;
  for (const valores of registros) {
    await pool.query(
      `INSERT INTO publicacoes (titulo,autores,ano,tipo,linha,resumo,doi,link,revista,volume,numero,paginas)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT DO NOTHING`,
      valores
    );
    inseridos++;
  }

  console.log(`✓ ${inseridos} publicações importadas com sucesso.`);
  await pool.end();
}

importar().catch(err => { console.error(err); process.exit(1); });
