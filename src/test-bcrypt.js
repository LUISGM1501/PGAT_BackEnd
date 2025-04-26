const bcrypt = require('bcrypt');

async function generateHash() {
  const password = 'admin';
  const saltRounds = 10;

  const hashedPassword = await bcrypt.hash(password, saltRounds);
  console.log('Hash generado:', hashedPassword);
}

generateHash();
