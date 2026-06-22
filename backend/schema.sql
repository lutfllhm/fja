CREATE DATABASE IF NOT EXISTS foa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE foa;

CREATE TABLE IF NOT EXISTS applications (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  posisi_dilamar VARCHAR(255),

  -- SECTION A: DATA PRIBADI
  nama_lengkap VARCHAR(150) NOT NULL,
  tempat_lahir VARCHAR(100),
  tanggal_lahir DATE,
  agama VARCHAR(40),
  jenis_kelamin ENUM('L','P'),
  gol_darah VARCHAR(5),
  no_ktp VARCHAR(40),
  no_npwp VARCHAR(40),
  alamat_ktp TEXT,
  telepon_ktp VARCHAR(30),
  alamat_domisili TEXT,
  telepon_domisili VARCHAR(30),
  nomor_hp VARCHAR(30),
  no_whatsapp VARCHAR(30),
  email VARCHAR(150) NOT NULL,
  facebook VARCHAR(120),
  twitter VARCHAR(120),
  instagram VARCHAR(120),
  sosmed_lainnya VARCHAR(120),
  tinggi_badan VARCHAR(20),
  berat_badan VARCHAR(20),
  no_sim VARCHAR(40),
  no_bpjs_kesehatan VARCHAR(40),
  darurat_nama VARCHAR(120),
  darurat_hubungan VARCHAR(60),

  -- SECTION B: LINGKUNGAN KELUARGA
  status_perkawinan ENUM('Menikah','Belum Menikah'),
  keluarga_inti JSON,
  keluarga_asal JSON,

  -- SECTION C: PENDIDIKAN (2 terakhir)
  pendidikan JSON,

  -- SECTION D: RIWAYAT KESEHATAN
  sakit_lama ENUM('Ya','Tidak'),
  sakit_lama_nama VARCHAR(200),
  sakit_lama_akibat TEXT,
  kecelakaan_berat ENUM('Ya','Tidak'),
  kecelakaan_nama VARCHAR(200),
  kecelakaan_akibat TEXT,

  -- SECTION E: KEMAMPUAN BAHASA
  bahasa JSON,

  -- SECTION F: KETERAMPILAN LAIN
  komputer TEXT,
  keterampilan_lain TEXT,

  -- SECTION G: RIWAYAT PEKERJAAN (2 terakhir)
  pekerjaan JSON,

  -- SECTION H: MINAT TERHADAP PEKERJAAN
  minat_sumber_lowongan TEXT,
  minat_tujuan_melamar TEXT,
  minat_tahu_perusahaan TEXT,
  minat_pernah_melamar TEXT,
  minat_bersedia_luar_kota TEXT,
  minat_bersedia_dinas_luar TEXT,
  minat_bidang_dikuasai TEXT,
  minat_melamar_lain TEXT,
  minat_mulai_bekerja VARCHAR(100),
  minat_gaji_diharapkan TEXT,
  minat_kenal_karyawan TEXT,

  -- SECTION I: LAIN-LAIN
  referensi JSON,
  waktu_luang TEXT,
  aktivitas_sosial JSON,
  strong_point TEXT,
  weak_point TEXT,
  rencana_5_tahun TEXT,

  -- PENUTUP & LAMPIRAN
  tempat_ttd VARCHAR(100),
  tanggal_ttd DATE,
  foto_path VARCHAR(255),
  cv_path VARCHAR(255),
  ttd_path VARCHAR(255),

  -- META ADMIN
  status ENUM('baru','direview','shortlist','ditolak','diterima') DEFAULT 'baru',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_created_at (created_at),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admin users table for dashboard/management
CREATE TABLE IF NOT EXISTS admins (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(60) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user (password: admin123)
INSERT INTO admins (username, password_hash, name)
VALUES ('admin', '$2a$10$Tm1Tji3MmmJilL9VwvqLmOS6ycrPGVcpXJMbR13WVuVKnpAnlxXjW', 'Administrator')
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash);
