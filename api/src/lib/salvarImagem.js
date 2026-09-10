const { pool } = require('../db');

// ~256 KB de imagem real depois da compressão feita no navegador
const LIMITE_BASE64 = 350000;

// Recebe um data URI, valida e grava na tabela `imagens`.
// Devolve { url } em caso de sucesso ou { erro, status } se a entrada for inválida.
async function salvarImagem(dados, nome) {
  if (!dados || typeof dados !== 'string' || !dados.startsWith('data:')) {
    return { erro: 'Campo "dados" deve ser um data URI válido', status: 400 };
  }
  const match = dados.match(/^data:([^;]+);base64,(.+)$/s);
  if (!match) return { erro: 'Formato de data URI inválido', status: 400 };

  const mime = match[1];
  const base64 = match[2];
  if (!mime.startsWith('image/')) {
    return { erro: 'O arquivo precisa ser uma imagem', status: 400 };
  }
  if (base64.length > LIMITE_BASE64) {
    return { erro: 'Imagem muito grande (máx ~256 KB após compressão)', status: 413 };
  }

  const { rows } = await pool.query(
    `INSERT INTO imagens (dados, mime, nome) VALUES ($1,$2,$3) RETURNING id`,
    [base64, mime, nome || null]
  );
  return { url: '/api/imagens/' + rows[0].id };
}

module.exports = { salvarImagem };
