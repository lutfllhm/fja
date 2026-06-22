require('dotenv').config();

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET belum diset di .env. Server tidak bisa start tanpa ini.');
  process.exit(1);
}

const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const pool = require('./db');

const { fillPdf } = require('./src/services/pdfService');
const { generateCsvString, generateBulkCsvString } = require('./src/services/csvService');
const { login } = require('./src/services/adminService');
const authMiddleware = require('./src/middleware/auth');
const { applicationSchema, loginSchema, statusUpdateSchema } = require('./src/schemas/validations');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL || 'http://localhost:3000'
    : ['http://localhost:3000', 'http://localhost:3001', 'http://192.168.120.55:3000'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/uploads', express.static('uploads'));

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  },
});

const FILE_LIMITS = {
  foto: { types: /jpeg|jpg|png/, mime: /^image\/(jpeg|png)$/, maxSize: 2 * 1024 * 1024 },
  cv: { types: /pdf/, mime: /^application\/pdf$/, maxSize: 5 * 1024 * 1024 },
  ttd: { types: /png/, mime: /^image\/png$/, maxSize: 1 * 1024 * 1024 },
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const rule = FILE_LIMITS[file.fieldname];
    if (!rule) return cb(new Error('Field upload tidak dikenal'));
    const extOk = rule.types.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = rule.mime.test(file.mimetype);
    if (extOk && mimeOk) return cb(null, true);
    cb(new Error(`Tipe file tidak didukung untuk ${file.fieldname}`));
  },
});

const uploadFields = upload.fields([
  { name: 'foto', maxCount: 1 },
  { name: 'cv', maxCount: 1 },
  { name: 'ttd', maxCount: 1 },
]);

function safeJson(value, fallback) {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

const JSON_FIELDS = ['keluarga_inti', 'keluarga_asal', 'pendidikan', 'bahasa', 'pekerjaan', 'referensi', 'aktivitas_sosial'];

function parseApplicationRow(row) {
  const parsed = { ...row };
  JSON_FIELDS.forEach((field) => {
    parsed[field] = safeJson(row[field], []);
  });
  return parsed;
}

const INSERT_COLUMNS = [
  'posisi_dilamar', 'nama_lengkap', 'tempat_lahir', 'tanggal_lahir', 'agama', 'jenis_kelamin',
  'gol_darah', 'no_ktp', 'no_npwp', 'alamat_ktp', 'telepon_ktp', 'alamat_domisili', 'telepon_domisili',
  'nomor_hp', 'no_whatsapp', 'email', 'facebook', 'twitter', 'instagram', 'sosmed_lainnya',
  'tinggi_badan', 'berat_badan', 'no_sim', 'no_bpjs_kesehatan', 'darurat_nama', 'darurat_hubungan', 'darurat_telepon',
  'status_perkawinan', 'keluarga_inti', 'keluarga_asal', 'pendidikan',
  'sakit_lama', 'sakit_lama_nama', 'sakit_lama_akibat', 'kecelakaan_berat', 'kecelakaan_nama', 'kecelakaan_akibat',
  'bahasa', 'komputer', 'keterampilan_lain', 'pekerjaan',
  'minat_sumber_lowongan', 'minat_tujuan_melamar', 'minat_tahu_perusahaan', 'minat_pernah_melamar',
  'minat_bersedia_luar_kota', 'minat_bersedia_dinas_luar', 'minat_bidang_dikuasai', 'minat_melamar_lain',
  'minat_mulai_bekerja', 'minat_gaji_diharapkan', 'minat_kenal_karyawan',
  'referensi', 'waktu_luang', 'aktivitas_sosial', 'strong_point', 'weak_point', 'rencana_5_tahun',
  'tempat_ttd', 'tanggal_ttd', 'foto_path', 'cv_path', 'ttd_path',
];

function cleanupFiles(files) {
  Object.values(files || {}).flat().forEach((file) => {
    fs.unlink(file.path, () => {});
  });
}

const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Terlalu banyak permintaan. Silakan coba lagi nanti.' },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Terlalu banyak percobaan login. Silakan coba lagi nanti.' },
});

app.post('/api/applications', submitLimiter, uploadFields, async (req, res) => {
  const files = req.files || {};
  try {
    for (const [fieldname, fileArr] of Object.entries(files)) {
      const rule = FILE_LIMITS[fieldname];
      const file = fileArr[0];
      if (rule && file.size > rule.maxSize) {
        cleanupFiles(files);
        return res.status(400).json({ error: `Ukuran file ${fieldname} melebihi batas maksimum` });
      }
    }

    const body = { ...req.body };
    JSON_FIELDS.forEach((field) => {
      if (typeof body[field] === 'string') {
        body[field] = safeJson(body[field], []);
      }
    });

    const parsed = applicationSchema.parse(body);

    const fotoPath = files.foto ? `/uploads/${files.foto[0].filename}` : null;
    const cvPath = files.cv ? `/uploads/${files.cv[0].filename}` : null;
    const ttdPath = files.ttd ? `/uploads/${files.ttd[0].filename}` : null;

    const values = INSERT_COLUMNS.map((col) => {
      if (col === 'foto_path') return fotoPath;
      if (col === 'cv_path') return cvPath;
      if (col === 'ttd_path') return ttdPath;
      if (JSON_FIELDS.includes(col)) return JSON.stringify(parsed[col] || []);
      const value = parsed[col];
      return value === undefined || value === '' ? null : value;
    });

    const placeholders = INSERT_COLUMNS.map(() => '?').join(',');
    const [result] = await pool.execute(
      `INSERT INTO applications (${INSERT_COLUMNS.join(', ')}) VALUES (${placeholders})`,
      values
    );

    res.status(201).json({ id: result.insertId });
  } catch (error) {
    cleanupFiles(files);
    if (error.name === 'ZodError') {
      console.error('Validation error:', JSON.stringify(error.errors, null, 2));
      return res.status(400).json({ error: 'Data tidak valid', details: error.errors });
    }
    console.error(error);
    res.status(500).json({ error: 'Tidak dapat menyimpan data aplikasi.' });
  }
});

app.post('/api/auth/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = loginSchema.parse(req.body);
    const result = await login(username, password);
    res.json(result);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Data tidak valid', details: error.errors });
    }
    res.status(401).json({ error: error.message || 'Login gagal' });
  }
});

app.get('/api/applications', authMiddleware, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const offset = (page - 1) * limit;
    const { search, status } = req.query;

    const where = [];
    const params = [];
    if (search) {
      where.push('(nama_lengkap LIKE ? OR email LIKE ? OR posisi_dilamar LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (status) {
      where.push('status = ?');
      params.push(status);
    }
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `SELECT id, posisi_dilamar, nama_lengkap, email, nomor_hp, status, created_at
       FROM applications ${whereClause}
       ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM applications ${whereClause}`,
      params
    );

    res.json({ data: rows, total: countRows[0].total, page, limit });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Tidak dapat mengambil data aplikasi.' });
  }
});

app.get('/api/applications/stats', authMiddleware, async (req, res) => {
  try {
    const [statusRows] = await pool.query(
      'SELECT status, COUNT(*) AS count FROM applications GROUP BY status'
    );
    const [trendRows] = await pool.query(
      `SELECT DATE(created_at) AS date, COUNT(*) AS count
       FROM applications
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 13 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
    );
    const [positionRows] = await pool.query(
      `SELECT posisi_dilamar, COUNT(*) AS count
       FROM applications
       GROUP BY posisi_dilamar
       ORDER BY count DESC
       LIMIT 5`
    );
    const [totalRows] = await pool.query('SELECT COUNT(*) AS total FROM applications');

    res.json({
      total: totalRows[0].total,
      byStatus: statusRows,
      trend: trendRows.map((row) => ({
        date: row.date instanceof Date ? row.date.toISOString().slice(0, 10) : row.date,
        count: row.count,
      })),
      topPositions: positionRows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Tidak dapat mengambil statistik.' });
  }
});

app.get('/api/applications/export/csv', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM applications ORDER BY created_at DESC');
    const csv = generateBulkCsvString(rows);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="lamaran-semua.csv"');
    res.send(csv);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Tidak dapat membuat CSV.' });
  }
});

app.get('/api/applications/:id', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM applications WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Aplikasi tidak ditemukan.' });
    res.json(parseApplicationRow(rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Tidak dapat mengambil aplikasi.' });
  }
});

app.patch('/api/applications/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = statusUpdateSchema.parse(req.body);
    const [result] = await pool.execute('UPDATE applications SET status = ? WHERE id = ?', [status, req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Aplikasi tidak ditemukan.' });
    res.json({ ok: true });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Status tidak valid', details: error.errors });
    }
    console.error(error);
    res.status(500).json({ error: 'Tidak dapat memperbarui status.' });
  }
});

app.delete('/api/applications/:id', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT foto_path, cv_path, ttd_path FROM applications WHERE id = ?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Aplikasi tidak ditemukan.' });

    await pool.execute('DELETE FROM applications WHERE id = ?', [req.params.id]);

    [rows[0].foto_path, rows[0].cv_path, rows[0].ttd_path].forEach((filePath) => {
      if (!filePath) return;
      const fullPath = path.join(__dirname, filePath.replace(/^\//, ''));
      fs.unlink(fullPath, () => {});
    });

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Tidak dapat menghapus aplikasi.' });
  }
});

app.get('/api/applications/:id/csv', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM applications WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Aplikasi tidak ditemukan.' });
    const csv = generateCsvString(rows[0]);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="lamaran-${rows[0].id}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Tidak dapat membuat CSV.' });
  }
});

app.get('/api/applications/:id/pdf', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM applications WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Aplikasi tidak ditemukan.' });
    const appData = parseApplicationRow(rows[0]);
    const pdfBytes = await fillPdf(appData);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="lamaran-${appData.id}.pdf"`);
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Tidak dapat membuat PDF.' });
  }
});

const server = app.listen(PORT, () => {
  console.log(`Backend berjalan di http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} sudah digunakan. Silakan hentikan proses lain yang memakai port ini atau jalankan dengan PORT lain.`);
    console.error(`Contoh: set PORT=4001 && npm run dev`);
    process.exit(1);
  }
  console.error(err);
  process.exit(1);
});
