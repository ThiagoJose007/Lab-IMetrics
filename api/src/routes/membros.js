const router = require('express').Router();
const { pool } = require('../db');

// GET /api/membros — lista membros ativos (público)
router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, nome, papel, area, categoria, nivel, foto_url, lattes_url, orcid_url
       FROM membros WHERE ativo = TRUE ORDER BY categoria, ordem, nome`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar membros' });
  }
});

module.exports = router;
