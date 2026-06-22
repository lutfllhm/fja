const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../../db');

/**
 * Admin login - verify password and generate JWT
 */
async function login(username, password) {
  try {
    const [rows] = await pool.execute(
      'SELECT id, username, password_hash, name FROM admins WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      throw new Error('Username atau password salah');
    }

    const admin = rows[0];
    const passwordValid = await bcrypt.compare(password, admin.password_hash);

    if (!passwordValid) {
      throw new Error('Username atau password salah');
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, name: admin.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return { token, admin: { id: admin.id, username: admin.username, name: admin.name } };
  } catch (error) {
    throw error;
  }
}

/**
 * Hash password for admin creation/update
 */
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

module.exports = {
  login,
  hashPassword,
};
