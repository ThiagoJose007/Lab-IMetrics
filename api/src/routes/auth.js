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

  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, expira: '8h' });
});

module.exports = router;
