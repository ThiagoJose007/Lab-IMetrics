const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { pool } = require('../db');
const { salvarImagem } = require('../lib/salvarImagem');

// A equipe inteira pode estar atrás do mesmo IP (rede da universidade),
// então o limite é por hora e mais folgado que o do login — mas fecha a porta
// para quem quiser usar o formulário público como spam ou hospedagem de imagem.
const limiteEnvio = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { erro: 'Muitos cadastros a partir deste endereço. Tente novamente em 1 hora.' },
});

const limiteUpload = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: { erro: 'Muitos envios de imagem. Tente novamente em 1 hora.' },
});

const CATEGORIAS = ['coordenador', 'doutor', 'estudante', 'tecnico'];
const TITULOS = ['doutor', 'mestre', 'graduando'];

function texto(v, max) {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s.slice(0, max) : null;
}

function link(v) {
  const s = texto(v, 400);
  if (!s) return null;
  return /^https?:\/\//i.test(s) ? s : null;
}

// Um convite só vale se não foi revogado, não expirou e ainda tem usos disponíveis.
async function conviteValido(token) {
  const { rows } = await pool.query(
    `SELECT id, rotulo, categoria_sugerida FROM convites
      WHERE token = $1 AND revogado = FALSE AND expira_em > NOW()
        AND (usos_max IS NULL OR usos < usos_max)`,
    [token]
  );
  return rows[0] || null;
}

// GET /api/convites/:token — a página de cadastro usa para saber se o link ainda vale
router.get('/:token', async (req, res) => {
  try {
    const convite = await conviteValido(req.params.token);
    if (!convite) {
      return res.status(404).json({ erro: 'Convite inválido, expirado ou já encerrado' });
    }
    res.json({ rotulo: convite.rotulo, categoria_sugerida: convite.categoria_sugerida });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao validar convite' });
  }
});

// POST /api/convites/:token/upload — foto de perfil; só funciona com convite válido
router.post('/:token/upload', limiteUpload, async (req, res) => {
  try {
    const convite = await conviteValido(req.params.token);
    if (!convite) return res.status(404).json({ erro: 'Convite inválido ou expirado' });

    const resultado = await salvarImagem(req.body.dados, req.body.nome);
    if (resultado.erro) return res.status(resultado.status).json({ erro: resultado.erro });
    res.status(201).json(resultado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao salvar imagem' });
  }
});

// POST /api/convites/:token/membro — entra na fila como pendente, nunca direto no site
router.post('/:token/membro', limiteEnvio, async (req, res) => {
  try {
    const convite = await conviteValido(req.params.token);
    if (!convite) return res.status(404).json({ erro: 'Convite inválido ou expirado' });

    const nome = texto(req.body.nome, 200);
    if (!nome) return res.status(400).json({ erro: 'Nome obrigatório' });

    const categoria = CATEGORIAS.includes(req.body.categoria)
      ? req.body.categoria
      : (CATEGORIAS.includes(convite.categoria_sugerida) ? convite.categoria_sugerida : 'doutor');

    // Só aceita foto que passou pelo nosso próprio upload — evita hotlink de URL externa
    const foto = texto(req.body.foto_url, 300);
    const fotoUrl = foto && foto.startsWith('/api/imagens/') ? foto : null;

    await pool.query(
      `INSERT INTO membros
         (nome, papel, area, categoria, titulo, nivel, foto_url, lattes_url, orcid_url, ativo, status, origem_convite)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, FALSE, 'pendente', $10)`,
      [
        nome,
        texto(req.body.papel, 150),
        texto(req.body.area, 300),
        categoria,
        TITULOS.includes(req.body.titulo) ? req.body.titulo : null,
        texto(req.body.nivel, 150),
        fotoUrl,
        link(req.body.lattes_url),
        link(req.body.orcid_url),
        convite.id,
      ]
    );
    await pool.query('UPDATE convites SET usos = usos + 1 WHERE id = $1', [convite.id]);

    res.status(201).json({ mensagem: 'Cadastro enviado para aprovação' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao enviar cadastro' });
  }
});

module.exports = router;
