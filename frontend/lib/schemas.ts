import { z } from 'zod';

/**
 * Frontend validation schemas using Zod
 * These are mirrored from the backend for client-side validation
 */

// Section A: Data Pribadi
export const sectionASchema = z.object({
  posisi_dilamar: z.string().optional(),
  nama_lengkap: z.string().min(3, 'Nama minimal 3 karakter').max(150),
  tempat_lahir: z.string().optional(),
  tanggal_lahir: z.string().optional(),
  agama: z.string().optional(),
  jenis_kelamin: z.enum(['L', 'P']).optional(),
  gol_darah: z.string().optional(),
  no_ktp: z.string().optional(),
  no_npwp: z.string().optional(),
  alamat_ktp: z.string().optional(),
  telepon_ktp: z.string().optional(),
  alamat_domisili: z.string().optional(),
  telepon_domisili: z.string().optional(),
  nomor_hp: z.string().min(10, 'No HP minimal 10 digit').optional(),
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
});

// Section B: Keluarga
export const sectionBSchema = z.object({
  status_perkawinan: z.enum(['Menikah', 'Belum Menikah']).optional(),
  keluarga_inti: z.array(z.object({}).passthrough()).optional(),
  keluarga_asal: z.array(z.object({}).passthrough()).optional(),
});

// Section C: Pendidikan
export const sectionCSchema = z.object({
  pendidikan: z.array(z.object({}).passthrough()).optional(),
});

// Section D: Kesehatan
export const sectionDSchema = z.object({
  sakit_lama: z.enum(['Ya', 'Tidak']).optional(),
  sakit_lama_nama: z.string().optional(),
  sakit_lama_akibat: z.string().optional(),
  kecelakaan_berat: z.enum(['Ya', 'Tidak']).optional(),
  kecelakaan_nama: z.string().optional(),
  kecelakaan_akibat: z.string().optional(),
});

// Section E: Bahasa
export const sectionESchema = z.object({
  bahasa: z.array(z.object({}).passthrough()).optional(),
});

// Section F: Keterampilan
export const sectionFSchema = z.object({
  komputer: z.string().optional(),
  keterampilan_lain: z.string().optional(),
});

// Section G: Pekerjaan
export const sectionGSchema = z.object({
  pekerjaan: z.array(z.object({}).passthrough()).optional(),
});

// Section H: Minat
export const sectionHSchema = z.object({
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
});

// Section I: Lain-lain
export const sectionISchema = z.object({
  referensi: z.array(z.object({}).passthrough()).optional(),
  waktu_luang: z.string().optional(),
  aktivitas_sosial: z.array(z.object({}).passthrough()).optional(),
  strong_point: z.string().optional(),
  weak_point: z.string().optional(),
  rencana_5_tahun: z.string().optional(),
});

// Complete form
export const completeFormSchema = sectionASchema
  .merge(sectionBSchema)
  .merge(sectionCSchema)
  .merge(sectionDSchema)
  .merge(sectionESchema)
  .merge(sectionFSchema)
  .merge(sectionGSchema)
  .merge(sectionHSchema)
  .merge(sectionISchema)
  .extend({
    tempat_ttd: z.string().optional(),
    tanggal_ttd: z.string().optional(),
  });

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, 'Username wajib diisi'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type FormData = z.infer<typeof completeFormSchema>;
