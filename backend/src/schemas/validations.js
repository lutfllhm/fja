const { z } = require('zod');

// Validation schemas for form submission

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD');
const optionalEnum = (values) => z.union([z.enum(values), z.literal('')]).optional();

const applicationSchema = z.object({
  posisi_dilamar: z.string().min(1, 'Posisi wajib diisi'),

  // SECTION A: DATA PRIBADI
  nama_lengkap: z.string().min(3, 'Nama minimal 3 karakter').max(150),
  tempat_lahir: z.string().optional(),
  tanggal_lahir: z.union([dateOnly, z.literal('')]).optional(),
  agama: z.string().optional(),
  jenis_kelamin: optionalEnum(['L', 'P']),
  gol_darah: z.string().optional(),
  no_ktp: z.string().optional(),
  no_npwp: z.string().optional(),
  alamat_ktp: z.string().optional(),
  telepon_ktp: z.string().optional(),
  alamat_domisili: z.string().optional(),
  telepon_domisili: z.string().optional(),
  nomor_hp: z.union([z.string().min(10, 'No HP minimal 10 digit'), z.literal('')]).optional(),
  no_whatsapp: z.string().optional(),
  email: z.string().email('Email tidak valid'),
  facebook: z.string().optional(),
  twitter: z.string().optional(),
  instagram: z.string().optional(),
  sosmed_lainnya: z.string().optional(),
  tinggi_badan: z.string().optional(),
  berat_badan: z.string().optional(),
  no_sim: z.string().optional(),
  no_bpjs_kesehatan: z.string().optional(),
  darurat_nama: z.string().optional(),
  darurat_hubungan: z.string().optional(),

  // SECTION B: LINGKUNGAN KELUARGA
  status_perkawinan: optionalEnum(['Menikah', 'Belum Menikah']),
  keluarga_inti: z.array(z.object({}).passthrough()).optional(),
  keluarga_asal: z.array(z.object({}).passthrough()).optional(),

  // SECTION C: PENDIDIKAN
  pendidikan: z.array(z.object({}).passthrough()).optional(),

  // SECTION D: RIWAYAT KESEHATAN
  sakit_lama: optionalEnum(['Ya', 'Tidak']),
  sakit_lama_nama: z.string().optional(),
  sakit_lama_akibat: z.string().optional(),
  kecelakaan_berat: optionalEnum(['Ya', 'Tidak']),
  kecelakaan_nama: z.string().optional(),
  kecelakaan_akibat: z.string().optional(),

  // SECTION E: KEMAMPUAN BAHASA
  bahasa: z.array(z.object({}).passthrough()).optional(),

  // SECTION F: KETERAMPILAN
  komputer: z.string().optional(),
  keterampilan_lain: z.string().optional(),

  // SECTION G: RIWAYAT PEKERJAAN
  pekerjaan: z.array(z.object({}).passthrough()).optional(),

  // SECTION H: MINAT
  minat_sumber_lowongan: z.string().optional(),
  minat_tujuan_melamar: z.string().optional(),
  minat_tahu_perusahaan: z.string().optional(),
  minat_pernah_melamar: z.string().optional(),
  minat_bersedia_luar_kota: z.string().optional(),
  minat_bersedia_dinas_luar: z.string().optional(),
  minat_bidang_dikuasai: z.string().optional(),
  minat_melamar_lain: z.string().optional(),
  minat_mulai_bekerja: z.string().optional(),
  minat_gaji_diharapkan: z.string().optional(),
  minat_kenal_karyawan: z.string().optional(),

  // SECTION I: LAIN-LAIN
  referensi: z.array(z.object({}).passthrough()).optional(),
  waktu_luang: z.string().optional(),
  aktivitas_sosial: z.array(z.object({}).passthrough()).optional(),
  strong_point: z.string().optional(),
  weak_point: z.string().optional(),
  rencana_5_tahun: z.string().optional(),

  // PENUTUP
  tempat_ttd: z.string().min(1, 'Tempat wajib diisi'),
  tanggal_ttd: dateOnly,
});

const loginSchema = z.object({
  username: z.string().min(1, 'Username wajib diisi'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

const statusUpdateSchema = z.object({
  status: z.enum(['baru', 'direview', 'shortlist', 'ditolak', 'diterima']),
});

module.exports = {
  applicationSchema,
  loginSchema,
  statusUpdateSchema,
};
