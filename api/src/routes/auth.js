const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

// Limite rigoroso no login: 5 tentativas a cada 15 min por IP
const loginLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { erro: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
});

// POST /api/auth/login
router.post('/login', loginLimit, async (req, res) => {
  const { senha } = req.body;
  if (!senha) return res.status(400).json({ erro: 'Senha obrigatória' });

  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) return res.status(500).json({ erro: 'Servidor não configurado' });

  const valida = await bcrypt.compare(senha, hash);
  if (!valida) return res.status(401).json({ erro: 'Senha incorreta' });

  // Expira às 3h da madrugada (horário de Brasília = UTC-3)
  const agora = new Date();
  const expira = new Date();
  expira.setUTCHours(6, 0, 0, 0); // 03:00 BRT = 06:00 UTC
  if (expira <= agora) expira.setUTCDate(expira.getUTCDate() + 1);
  const exp = Math.floor(expira.getTime() / 1000);

  const token = jwt.sign({ role: 'admin', exp }, process.env.JWT_SECRET);
  res.json({ token, expira: expira.toISOString() });
});

module.exports = router;
