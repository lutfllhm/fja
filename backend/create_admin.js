require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./db');

async function createAdmin(username, password, opts = {}) {
  if (!username || !password) {
    console.error('Usage: node create_admin.js <username> <password> [name]');
    process.exit(1);
  }
  const name = opts.name || null;
  try {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      'INSERT INTO admins (username, password_hash, name) VALUES (?,?,?)',
      [username, hash, name]
    );
    console.log('Admin created with id', result.insertId);
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin:', err.message);
    process.exit(2);
  }
}

if (require.main === module) {
  const [, , user, pass, name] = process.argv;
  createAdmin(user, pass, { name });
}

module.exports = createAdmin;
