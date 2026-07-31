const router = require('express').Router();
const { pool } = require('../db');

// GET /api/publicacoes?ano=2023&tipo=artigo&linha=altmetria&q=busca
router.get('/', async (req, res) => {
  const { ano, tipo, linha, q } = req.query;
  const filtros = [];
  const valores = [];

  if (ano)  { valores.push(parseInt(ano));  filtros.push(`ano = $${valores.length}`); }
  if (tipo) { valores.push(tipo);           filtros.push(`tipo = $${valores.length}`); }
  if (linha){ valores.push(linha);          filtros.push(`linha = $${valores.length}`); }
  if (q)    { valores.push(`%${q}%`);       filtros.push(`(titulo ILIKE $${valores.length} OR resumo ILIKE $${valores.length})`); }

  const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';
  try {
    const { rows } = await pool.query(
      `SELECT * FROM publicacoes ${where} ORDER BY ano DESC, id DESC`,
      valores
    );
    res.json({ total: rows.length, dados: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar publicações' });
  }
});

// GET /api/publicacoes/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM publicacoes WHERE id = $1',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ erro: 'Publicação não encontrada' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar publicação' });
  }
});

module.exports = router;
