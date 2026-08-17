const router = require('express').Router();
const { pool } = require('../db');

// GET /api/imprensa — lista itens ativos (público)
router.get('/', async (req, res) => {
  try {
    const { tipo } = req.query;
    let q = `SELECT id, titulo, veiculo, tipo, data_publicacao, url, descricao, imagem_url, destaque
             FROM imprensa WHERE ativo = TRUE`;
    const params = [];
    if (tipo) { params.push(tipo); q += ` AND tipo = $${params.length}`; }
    q += ` ORDER BY destaque DESC, data_publicacao DESC NULLS LAST, criado_em DESC`;
    const { rows } = await pool.query(q, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar itens de imprensa' });
  }
});

module.exports = router;
