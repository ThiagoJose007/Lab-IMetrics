const router = require('express').Router();
const { pool } = require('../db');
const autenticar = require('../middleware/auth');

// Todas as rotas abaixo exigem token JWT válido
router.use(autenticar);

// POST /api/admin/publicacoes — cadastrar nova pesquisa
router.post('/publicacoes', async (req, res) => {
  const { titulo, autores, ano, tipo, linha, resumo, doi, link, revista, volume, numero, paginas } = req.body;
  if (!titulo) return res.status(400).json({ erro: 'Título obrigatório' });

  try {
    const { rows } = await pool.query(
      `INSERT INTO publicacoes (titulo, autores, ano, tipo, linha, resumo, doi, link, revista, volume, numero, paginas)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [titulo, autores || [], ano, tipo, linha, resumo, doi, link, revista, volume, numero, paginas]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao cadastrar publicação' });
  }
});

// PUT /api/admin/publicacoes/:id — editar pesquisa
router.put('/publicacoes/:id', async (req, res) => {
  const { titulo, autores, ano, tipo, linha, resumo, doi, link, revista, volume, numero, paginas } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE publicacoes SET
        titulo=$1, autores=$2, ano=$3, tipo=$4, linha=$5, resumo=$6,
        doi=$7, link=$8, revista=$9, volume=$10, numero=$11, paginas=$12,
        atualizado_em=NOW()
       WHERE id=$13 RETURNING *`,
      [titulo, autores || [], ano, tipo, linha, resumo, doi, link, revista, volume, numero, paginas, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ erro: 'Publicação não encontrada' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao atualizar publicação' });
  }
});

// DELETE /api/admin/publicacoes/:id — remover pesquisa
router.delete('/publicacoes/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM publicacoes WHERE id = $1',
      [req.params.id]
    );
    if (!rowCount) return res.status(404).json({ erro: 'Publicação não encontrada' });
    res.json({ mensagem: 'Publicação removida com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao remover publicação' });
  }
});

module.exports = router;
