import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FormStore {
  formData: Record<string, any>;
  currentStep: number;
  setFormData: (data: Record<string, any>) => void;
  updateField: (field: string, value: any) => void;
  setCurrentStep: (step: number) => void;
  resetForm: () => void;
}

const DEFAULT_FORM_DATA: Record<string, any> = {
  posisi_dilamar: '',
  nama_lengkap: '',
  tempat_lahir: '',
  tanggal_lahir: '',
  agama: '',
  jenis_kelamin: '',
  gol_darah: '',
  no_ktp: '',
  no_npwp: '',
  alamat_ktp: '',
  telepon_ktp: '',
  alamat_domisili: '',
  telepon_domisili: '',
  nomor_hp: '',
  no_whatsapp: '',
  email: '',
  facebook: '',
  twitter: '',
  instagram: '',
  sosmed_lainnya: '',
  tinggi_badan: '',
  berat_badan: '',
  no_sim: '',
  no_bpjs_kesehatan: '',
  darurat_nama: '',
  darurat_hubungan: '',
  darurat_telepon: '',
  status_perkawinan: 'Belum Menikah',
  keluarga_inti: [
    { status: 'Suami / Istri', nama: '', lp: '', ttl_umur: '', pendidikan: '', pekerjaan: '', jenis_perusahaan: '', jabatan: '' },
  ],
  keluarga_asal: [
    { status: 'Ayah', nama: '', lp: 'L', ttl_umur: '', pendidikan: '', pekerjaan: '', jenis_perusahaan: '', jabatan: '' },
    { status: 'Ibu', nama: '', lp: 'P', ttl_umur: '', pendidikan: '', pekerjaan: '', jenis_perusahaan: '', jabatan: '' },
  ],
  pendidikan: [
    { jenjang: '', sekolah: '', lokasi: '', jurusan: '', tahun_mulai: '', tahun_selesai: '', no_ijazah: '', nem_ipk: '' },
    { jenjang: '', sekolah: '', lokasi: '', jurusan: '', tahun_mulai: '', tahun_selesai: '', no_ijazah: '', nem_ipk: '' },
  ],
  sakit_lama: 'Tidak',
  sakit_lama_nama: '',
  sakit_lama_akibat: '',
  kecelakaan_berat: 'Tidak',
  kecelakaan_nama: '',
  kecelakaan_akibat: '',
  bahasa: [
    { bahasa: 'Indonesia', bicara: '', membaca: '', menulis: '' },
    { bahasa: 'Inggris', bicara: '', membaca: '', menulis: '' },
    { bahasa: 'Mandarin', bicara: '', membaca: '', menulis: '' },
  ],
  komputer: '',
  keterampilan_lain: '',
  pekerjaan: [
    { jenis_perusahaan: '', nama_perusahaan: '', lokasi: '', jabatan: '', tgl_masuk: '', tgl_keluar: '', uraian: '', gaji_terakhir: '', tunjangan: '', fasilitas: '', alasan_keluar: '', pemberi_referensi: '', telepon_referensi: '' },
    { jenis_perusahaan: '', nama_perusahaan: '', lokasi: '', jabatan: '', tgl_masuk: '', tgl_keluar: '', uraian: '', gaji_terakhir: '', tunjangan: '', fasilitas: '', alasan_keluar: '', pemberi_referensi: '', telepon_referensi: '' },
  ],
  minat_sumber_lowongan: '',
  minat_tujuan_melamar: '',
  minat_tahu_perusahaan: '',
  minat_pernah_melamar: '',
  minat_bersedia_luar_kota: '',
  minat_bersedia_dinas_luar: '',
  minat_bidang_dikuasai: '',
  minat_melamar_lain: '',
  minat_mulai_bekerja: '',
  minat_gaji_diharapkan: '',
  minat_kenal_karyawan: '',
  referensi: [{ nama: '', perusahaan: '', alamat: '', telepon: '', hubungan: '' }],
  waktu_luang: '',
  aktivitas_sosial: [{ nama_organisasi: '', tempat: '', jabatan: '', tahun: '' }],
  strong_point: '',
  weak_point: '',
  rencana_5_tahun: '',
  tempat_ttd: '',
  tanggal_ttd: '',
};

export const useFormStore = create<FormStore>()(
  persist(
    (set) => ({
      formData: DEFAULT_FORM_DATA,
      currentStep: 1,

      setFormData: (data) =>
        set({ formData: data }),

      updateField: (field, value) =>
        set((state) => ({
          formData: { ...state.formData, [field]: value },
        })),

      setCurrentStep: (step) =>
        set({ currentStep: step }),

      resetForm: () =>
        set({
          formData: structuredClone(DEFAULT_FORM_DATA),
          currentStep: 1,
        }),
    }),
    { name: 'foa-apply-form' }
  )
);

interface AuthStore {
  token: string | null;
  admin: any;
  setToken: (token: string, admin: any) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  token: typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null,
  admin: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('admin_data') || 'null') : null,

  setToken: (token, admin) => {
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_data', JSON.stringify(admin));
    set({ token, admin });
  },

  logout: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_data');
    set({ token: null, admin: null });
  },

  isAuthenticated: () => {
    const { token } = get();
    return token !== null && token !== '';
  },
}));
