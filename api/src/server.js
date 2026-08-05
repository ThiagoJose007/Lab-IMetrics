require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { initDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : '*',
}));
app.use(express.json());

// Limite global: 100 requisições por IP a cada 15 min
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
}));

app.use('/api/publicacoes', require('./routes/publicacoes'));
app.use('/api/membros',     require('./routes/membros'));
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/admin',       require('./routes/admin'));

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use((_req, res) => res.status(404).json({ erro: 'Rota não encontrada' }));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

initDB()
  .then(() => app.listen(PORT, () => console.log(`API rodando na porta ${PORT}`)))
  .catch(err => { console.error('Falha ao conectar ao banco:', err); process.exit(1); });
