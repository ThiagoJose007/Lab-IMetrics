const router = require('express').Router();
const crypto = require('crypto');
const { pool } = require('../db');
const autenticar = require('../middleware/auth');
const { salvarImagem } = require('../lib/salvarImagem');

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

// POST /api/admin/publicacoes/importar — importar em lote
router.post('/publicacoes/importar', async (req, res) => {
  const { itens } = req.body;
  if (!Array.isArray(itens) || !itens.length) {
    return res.status(400).json({ erro: 'Nenhum item para importar' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    let inseridos = 0;
    for (const item of itens) {
      if (!item.titulo) continue;
      const autores = Array.isArray(item.autores)
        ? item.autores
        : (item.autores ? String(item.autores).split(';').map(a => a.trim()).filter(Boolean) : []);
      const ano = item.ano ? parseInt(item.ano) : null;
      await client.query(
        `INSERT INTO publicacoes (titulo, autores, ano, tipo, linha, resumo, doi, link, revista, volume, numero, paginas)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [item.titulo, autores, isNaN(ano) ? null : ano,
         item.tipo || null, item.linha || null, item.resumo || null,
         item.doi || null, item.link || null, item.revista || null,
         item.volume || null, item.numero || null, item.paginas || null]
      );
      inseridos++;
    }
    await client.query('COMMIT');
    res.json({ inseridos });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ erro: 'Erro ao importar: ' + err.message });
  } finally {
    client.release();
  }
});

// POST /api/admin/publicacoes/excluir-em-lote — excluir publicações selecionadas
router.post('/publicacoes/excluir-em-lote', async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || !ids.length) {
    return res.status(400).json({ erro: 'Nenhum ID fornecido' });
  }
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM publicacoes WHERE id = ANY($1::int[])',
      [ids]
    );
    res.json({ removidos: rowCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao excluir publicações' });
  }
});

// DELETE /api/admin/publicacoes — limpar todas as publicações
router.delete('/publicacoes', async (_req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM publicacoes');
    res.json({ removidos: rowCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao limpar publicações' });
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

// ── MEMBROS ──

// GET /api/admin/membros — lista todos (incluindo inativos)
router.get('/membros', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM membros ORDER BY categoria, ordem, nome`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar membros' });
  }
});

// POST /api/admin/membros
router.post('/membros', async (req, res) => {
  const { nome, papel, area, categoria, titulo, nivel, foto_url, lattes_url, orcid_url, ativo, ordem } = req.body;
  if (!nome) return res.status(400).json({ erro: 'Nome obrigatório' });
  try {
    const { rows } = await pool.query(
      `INSERT INTO membros (nome, papel, area, categoria, titulo, nivel, foto_url, lattes_url, orcid_url, ativo, ordem)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [nome, papel, area, categoria || 'doutor', titulo || null, nivel, foto_url, lattes_url, orcid_url, ativo !== false, ordem || 0]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao cadastrar membro' });
  }
});

// PUT /api/admin/membros/:id
router.put('/membros/:id', async (req, res) => {
  const { nome, papel, area, categoria, titulo, nivel, foto_url, lattes_url, orcid_url, ativo, ordem } = req.body;
  if (!nome) return res.status(400).json({ erro: 'Nome obrigatório' });
  try {
    const { rows } = await pool.query(
      `UPDATE membros SET nome=$1, papel=$2, area=$3, categoria=$4, titulo=$5, nivel=$6,
        foto_url=$7, lattes_url=$8, orcid_url=$9, ativo=$10, ordem=$11,
        status = CASE WHEN $10 THEN 'aprovado' ELSE status END
       WHERE id=$12 RETURNING *`,
      [nome, papel, area, categoria || 'doutor', titulo || null, nivel, foto_url, lattes_url, orcid_url, ativo !== false, ordem || 0, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ erro: 'Membro não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao atualizar membro' });
  }
});

// DELETE /api/admin/membros/:id
router.delete('/membros/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM membros WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ erro: 'Membro não encontrado' });
    res.json({ mensagem: 'Membro removido com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao remover membro' });
  }
});

// PATCH /api/admin/membros/:id/aprovar — publica um cadastro vindo de convite
router.patch('/membros/:id/aprovar', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE membros SET status = 'aprovado', ativo = TRUE WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ erro: 'Membro não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao aprovar membro' });
  }
});

// ── CONVITES (auto-cadastro da equipe) ──

// GET /api/admin/convites — lista com o estado já calculado
router.get('/convites', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.*,
              (c.revogado OR c.expira_em <= NOW()
                OR (c.usos_max IS NOT NULL AND c.usos >= c.usos_max)) AS encerrado,
              (SELECT COUNT(*) FROM membros m
                WHERE m.origem_convite = c.id AND m.status = 'pendente') AS pendentes
         FROM convites c ORDER BY c.criado_em DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar convites' });
  }
});

// POST /api/admin/convites — gera um link multi-uso
router.post('/convites', async (req, res) => {
  const dias = Math.min(Math.max(parseInt(req.body.dias, 10) || 7, 1), 90);
  const usosMax = parseInt(req.body.usos_max, 10);
  try {
    const { rows } = await pool.query(
      `INSERT INTO convites (token, rotulo, categoria_sugerida, expira_em, usos_max)
       VALUES ($1, $2, $3, NOW() + ($4 || ' days')::INTERVAL, $5) RETURNING *`,
      [
        crypto.randomBytes(18).toString('base64url'),
        req.body.rotulo || null,
        req.body.categoria_sugerida || null,
        String(dias),
        usosMax > 0 ? usosMax : null,
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao gerar convite' });
  }
});

// DELETE /api/admin/convites/:id — revoga na hora, mas mantém o histórico
router.delete('/convites/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'UPDATE convites SET revogado = TRUE WHERE id = $1',
      [req.params.id]
    );
    if (!rowCount) return res.status(404).json({ erro: 'Convite não encontrado' });
    res.json({ mensagem: 'Convite revogado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao revogar convite' });
  }
});

// ── IMPRENSA ──

// GET /api/admin/imprensa — todos (incluindo inativos)
router.get('/imprensa', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM imprensa ORDER BY destaque DESC, data_publicacao DESC NULLS LAST, criado_em DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar imprensa' });
  }
});

// POST /api/admin/imprensa
router.post('/imprensa', async (req, res) => {
  const { titulo, veiculo, tipo, data_publicacao, url, descricao, descricao_curta, imagem_url, destaque, ativo } = req.body;
  if (!titulo) return res.status(400).json({ erro: 'Título obrigatório' });
  try {
    const { rows } = await pool.query(
      `INSERT INTO imprensa (titulo, veiculo, tipo, data_publicacao, url, descricao, descricao_curta, imagem_url, destaque, ativo)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [titulo, veiculo, tipo || 'materia', data_publicacao || null, url, descricao, descricao_curta || null, imagem_url, destaque === true, ativo !== false]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao cadastrar item' });
  }
});

// PUT /api/admin/imprensa/:id
router.put('/imprensa/:id', async (req, res) => {
  const { titulo, veiculo, tipo, data_publicacao, url, descricao, descricao_curta, imagem_url, destaque, ativo } = req.body;
  if (!titulo) return res.status(400).json({ erro: 'Título obrigatório' });
  try {
    const { rows } = await pool.query(
      `UPDATE imprensa SET titulo=$1, veiculo=$2, tipo=$3, data_publicacao=$4, url=$5,
        descricao=$6, descricao_curta=$7, imagem_url=$8, destaque=$9, ativo=$10
       WHERE id=$11 RETURNING *`,
      [titulo, veiculo, tipo || 'materia', data_publicacao || null, url, descricao, descricao_curta || null, imagem_url, destaque === true, ativo !== false, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ erro: 'Item não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao atualizar item' });
  }
});

// DELETE /api/admin/imprensa/:id
router.delete('/imprensa/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM imprensa WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ erro: 'Item não encontrado' });
    res.json({ mensagem: 'Item removido com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao remover item' });
  }
});

// POST /api/admin/upload — armazena imagem como base64 no banco
router.post('/upload', async (req, res) => {
  try {
    const resultado = await salvarImagem(req.body.dados, req.body.nome);
    if (resultado.erro) return res.status(resultado.status).json({ erro: resultado.erro });
    res.status(201).json(resultado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao salvar imagem' });
  }
});

module.exports = router;
