/**
 * Gera o hash bcrypt da senha do admin para colocar no .env
 * Uso: node src/scripts/gerarHash.js SUA_SENHA
 */
const bcrypt = require('bcryptjs');
const senha = process.argv[2];
if (!senha) { console.error('Uso: node src/scripts/gerarHash.js <senha>'); process.exit(1); }
bcrypt.hash(senha, 12).then(hash => {
  console.log('\nColoque isso no seu .env:\n');
  console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
});
