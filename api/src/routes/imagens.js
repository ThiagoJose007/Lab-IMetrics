const router = require('express').Router();
const { pool } = require('../db');

// GET /api/imagens/:id — serve imagem armazenada como base64
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT dados, mime FROM imagens WHERE id = $1',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).end();
    const buf = Buffer.from(rows[0].dados, 'base64');
    res.set({
      'Content-Type': rows[0].mime,
      'Content-Length': buf.length,
      'Cache-Control': 'public, max-age=31536000, immutable',
    });
    res.send(buf);
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
});

module.exports = router;
