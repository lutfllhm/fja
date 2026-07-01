const pool = require('../../db');

const COLUMN_TYPES = {
  posisi_dilamar: 'VARCHAR(255)',
  nama_lengkap: 'VARCHAR(150) NOT NULL',
  tempat_lahir: 'VARCHAR(100)',
  tanggal_lahir: 'DATE',
  agama: 'VARCHAR(40)',
  jenis_kelamin: "ENUM('L','P')",
  gol_darah: 'VARCHAR(5)',
  no_ktp: 'VARCHAR(40)',
  no_npwp: 'VARCHAR(40)',
  alamat_ktp: 'TEXT',
  telepon_ktp: 'VARCHAR(30)',
  alamat_domisili: 'TEXT',
  telepon_domisili: 'VARCHAR(30)',
  nomor_hp: 'VARCHAR(30)',
  no_whatsapp: 'VARCHAR(30)',
  email: 'VARCHAR(150) NOT NULL',
  facebook: 'VARCHAR(120)',
  twitter: 'VARCHAR(120)',
  instagram: 'VARCHAR(120)',
  sosmed_lainnya: 'VARCHAR(120)',
  tinggi_badan: 'VARCHAR(20)',
  berat_badan: 'VARCHAR(20)',
  no_sim: 'VARCHAR(40)',
  no_bpjs_kesehatan: 'VARCHAR(40)',
  darurat_nama: 'VARCHAR(120)',
  darurat_hubungan: 'VARCHAR(60)',
  darurat_telepon: 'VARCHAR(30)',
  status_perkawinan: "ENUM('Menikah','Belum Menikah')",
  keluarga_inti: 'JSON',
  keluarga_asal: 'JSON',
  pendidikan: 'JSON',
  sakit_lama: "ENUM('Ya','Tidak')",
  sakit_lama_nama: 'VARCHAR(200)',
  sakit_lama_akibat: 'TEXT',
  kecelakaan_berat: "ENUM('Ya','Tidak')",
  kecelakaan_nama: 'VARCHAR(200)',
  kecelakaan_akibat: 'TEXT',
  bahasa: 'JSON',
  komputer: 'TEXT',
  keterampilan_lain: 'TEXT',
  pekerjaan: 'JSON',
  minat_sumber_lowongan: 'TEXT',
  minat_tujuan_melamar: 'TEXT',
  minat_tahu_perusahaan: 'TEXT',
  minat_pernah_melamar: 'TEXT',
  minat_bersedia_luar_kota: 'TEXT',
  minat_bersedia_dinas_luar: 'TEXT',
  minat_bidang_dikuasai: 'TEXT',
  minat_melamar_lain: 'TEXT',
  minat_mulai_bekerja: 'VARCHAR(100)',
  minat_gaji_diharapkan: 'TEXT',
  minat_kenal_karyawan: 'TEXT',
  referensi: 'JSON',
  waktu_luang: 'TEXT',
  aktivitas_sosial: 'JSON',
  strong_point: 'TEXT',
  weak_point: 'TEXT',
  rencana_5_tahun: 'TEXT',
  tempat_ttd: 'VARCHAR(100)',
  tanggal_ttd: 'DATE',
  foto_path: 'VARCHAR(255)',
  cv_path: 'VARCHAR(255)',
  ttd_path: 'VARCHAR(255)',
};

async function runMigrations() {
  console.log('Menjalankan migrasi database...');
  try {
    // 1. Cek apakah tabel applications ada
    const [tables] = await pool.query("SHOW TABLES LIKE 'applications'");
    if (tables.length === 0) {
      console.log('Tabel applications belum dibuat. Menunggu import schema.sql oleh docker entrypoint...');
      return;
    }

    // 2. Dapatkan kolom yang sudah ada di tabel
    const [columns] = await pool.query('SHOW COLUMNS FROM applications');
    const existingColumns = columns.map(c => c.Field);

    // 3. Tambahkan kolom yang kurang
    for (const [colName, colType] of Object.entries(COLUMN_TYPES)) {
      if (!existingColumns.includes(colName)) {
        console.log(`Menambahkan kolom baru: ${colName} (${colType}) ke tabel applications...`);
        await pool.query(`ALTER TABLE applications ADD COLUMN ${colName} ${colType}`);
        console.log(`Kolom ${colName} berhasil ditambahkan.`);
      }
    }
    console.log('Migrasi database selesai.');
  } catch (error) {
    console.error('Gagal menjalankan migrasi database:', error);
  }
}

module.exports = { runMigrations };
