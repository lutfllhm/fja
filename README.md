# Job Application Form System

Sistem web untuk pengisian **Form Lamaran Pekerjaan** (Job Application Form) yang komprehensif dengan multi-step form, admin dashboard, dan export PDF/CSV.

## 📋 Fitur Utama

✅ **Form Multi-Step** - 10 tahap pengisian data sesuai struktur formulir resmi  
✅ **Data Validasi** - Validasi client & server menggunakan Zod  
✅ **Admin Dashboard** - Kelola semua lamaran dengan search, filter, pagination  
✅ **PDF Export** - Unduh lamaran sebagai PDF dengan overlay teks ke template asli  
✅ **CSV Export** - Export satu atau semua lamaran ke format CSV  
✅ **File Upload** - Upload foto, CV, tanda tangan  
✅ **JWT Auth** - Keamanan admin dengan token JWT + bcrypt  
✅ **MySQL Database** - Penyimpanan data terstruktur dengan JSON fields untuk tabel dinamis  

## 🏗️ Tech Stack

### Frontend
- **Next.js 14+** (React framework)
- **TypeScript** (Type safety)
- **Tailwind CSS** (Styling)
- **Zod** (Validation)
- **Zustand** (State management)
- **Axios** (HTTP client)
- **React Hot Toast** (Notifications)

### Backend
- **Node.js + Express** (REST API)
- **MySQL2** (Database)
- **Zod** (Validation)
- **pdf-lib** (PDF manipulation)
- **json2csv** (CSV export)
- **bcryptjs** (Password hashing)
- **jsonwebtoken** (JWT auth)
- **multer** (File upload)

### Database
- **MySQL** (managed via phpMyAdmin)

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MySQL 5.7+
- npm atau yarn

### 1. Clone & Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Setup Database

```bash
# Import schema via phpMyAdmin atau command line
mysql -u root -p foa < backend/schema.sql

# Default admin credentials:
# Username: admin
# Password: admin123  (ganti setelah first login)
```

### 3. Configure Environment Variables

**Backend** (`backend/.env`):
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=foa
PORT=4000
NODE_ENV=development
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

**Frontend** (`frontend/.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 4. Setup PDF Template

1. Letakkan file `Form_Job_Application.pdf` di `backend/templates/` folder
2. **PENTING**: Lakukan kalibrasi koordinat PDF (lihat bagian "PDF Calibration" di bawah)

### 5. Run Aplikasi

```bash
# Terminal 1 - Backend
cd backend
npm run dev
# Server akan jalan di http://localhost:4000

# Terminal 2 - Frontend
cd frontend
npm run dev
# Aplikasi akan buka di http://localhost:3000
```

## 📝 Form Structure (9 Sections + Penutup)

### Section A: Data Pribadi
Nama lengkap, tempat/tanggal lahir, agama, jenis kelamin, gol. darah, KTP, NPWP, alamat KTP/domisili, telepon, email, social media, tinggi/berat badan, SIM, BPJS, kontak darurat.

### Section B: Lingkungan Keluarga
Status perkawinan, susunan keluarga inti (suami/istri, anak), susunan keluarga asal (ayah, ibu, saudara).

### Section C: Pendidikan
2 entri terakhir: jenjang, sekolah, lokasi, jurusan, tahun mulai-selesai, ijazah, NEM/IPK.

### Section D: Riwayat Kesehatan
Sakit lama (Y/N), kecelakaan berat (Y/N), dengan deskripsi.

### Section E: Kemampuan Bahasa
Indonesia, Inggris, Mandarin + custom bahasa. Kolom: bicara, membaca, menulis.

### Section F: Keterampilan Lain
Komputer, keterampilan lain.

### Section G: Riwayat Pekerjaan
2 entri terakhir: jenis perusahaan, nama, lokasi, jabatan, tanggal masuk-keluar, uraian, gaji, tunjangan, fasilitas, alasan keluar, referensi.

### Section H: Minat Terhadap Pekerjaan
10 pertanyaan esai: sumber lowongan, tujuan, pengetahuan perusahaan, pernah melamar, bersedia luar kota/dinas, bidang dikuasai, lamaran lain, mulai bekerja, gaji diharapkan, kenal karyawan.

### Section I: Lain-lain & Penutup
Referensi, waktu luang, organisasi, aktivitas sosial, strong/weak point, rencana 5 tahun, tempat/tanggal TTD, tanda tangan (upload gambar).

## 📊 API Endpoints

### Public
```
POST   /api/auth/login                      # Admin login → JWT token
POST   /api/applications                    # Submit lamaran (multipart)
```

### Admin (Protected)
```
GET    /api/applications                    # List dengan pagination/search
GET    /api/applications/:id                # Detail satu lamaran
PATCH  /api/applications/:id/status         # Update status
GET    /api/applications/:id/pdf            # Download PDF
GET    /api/applications/:id/csv            # Download CSV
GET    /api/applications/export/csv         # Download semua CSV
```

## 🔐 Admin Dashboard

**Login:**  
Username: `admin` | Password: `admin123`

**Fitur:**
- Lihat daftar semua lamaran dengan status badge
- Search by nama/email
- Filter by status (baru, direview, shortlist, diterima, ditolak)
- Pagination (10 per halaman)
- Sort by tanggal masuk
- Ubah status lamaran
- Download PDF individual / bulk CSV
- Preview detail lamaran

## 📄 PDF Generation

### Metode: Overlay Teks ke Koordinat

`pdf-lib` digunakan untuk menggambar teks di atas PDF template asli (`backend/templates/Form_Job_Application.pdf`) pada koordinat tertentu. Koordinat di `backend/src/services/pdfService.js` (`PDF_COORDS` untuk field flat, `TABLE_LAYOUTS` untuk tabel dinamis) sudah dikalibrasi terhadap label asli di template ini menggunakan ekstraksi posisi teks (lihat Langkah Alternatif di bawah), bukan tebakan manual — jadi seharusnya sudah pas tanpa kerja tambahan.

### Jika Mengganti Template PDF atau Field Baru

**Langkah 1 (direkomendasikan): Ekstrak posisi teks asli dengan pdfjs-dist**
```bash
cd backend
node -e "
const fs = require('fs');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.mjs');
(async () => {
  const data = new Uint8Array(fs.readFileSync('templates/Form_Job_Application.pdf'));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    console.log('=== PAGE', i);
    content.items.forEach((item) => {
      console.log(item.transform[4].toFixed(1), item.transform[5].toFixed(1), JSON.stringify(item.str));
    });
  }
})();
"
```
Ini mencetak x/y (dari kiri-bawah, satuan pt) setiap label di PDF asli — jauh lebih akurat daripada mengukur pixel dari screenshot.

**Langkah 2: Tentukan posisi value**
Value biasanya ditaruh tepat di kanan tanda ":" pada baris label yang sama (x lebih besar, y sama). Untuk blok esai (Section H, I) tanpa ":", value ditaruh ~12pt di bawah baris pertanyaan.

**Langkah 3: Update `PDF_COORDS` / `TABLE_LAYOUTS` di `src/services/pdfService.js`**
```javascript
const PDF_COORDS = {
  nama_lengkap: { page: 0, x: 122, y: 713.4, size: 9 },
  email: { page: 0, x: 122, y: 609.0, size: 9 },
  // ... tambah field lainnya
};
```

**Langkah 4: Test**
1. Submit form dengan data test
2. Download PDF (`GET /api/applications/:id/pdf`)
3. Verifikasi posisi teks sesuai garis isian
4. Adjust koordinat ±2-3 pt sampai pas

**Alternatif tanpa pdfjs-dist:** render halaman ke gambar (`pdftoppm -png -r 150 templates/Form_Job_Application.pdf page`), ukur pixel di editor gambar, lalu konversi `x_pt = x_pixel * 72/150`, `y_pt = page_height_pt - (y_pixel * 72/150)` (tinggi A4 = 841.68pt). Lebih lambat dan kurang presisi dibanding Langkah 1.

## 📦 Database Schema Highlights

**applications** table:
- Flat fields: nama_lengkap, email, no_ktp, etc.
- JSON fields (dynamic arrays):
  - `keluarga_inti` - suami/istri, anak
  - `keluarga_asal` - ayah, ibu, saudara
  - `pendidikan` - riwayat pendidikan
  - `bahasa` - kemampuan bahasa
  - `pekerjaan` - riwayat kerja
  - `referensi` - kontak referensi
  - `aktivitas_sosial` - organisasi/aktivitas
- Status: enum('baru','direview','shortlist','ditolak','diterima')

**admins** table:
- username, password_hash (bcrypt), name
- JWT auth, no role hierarchy (single admin role)

## 🔒 Security

✅ Input validation dengan Zod (frontend & backend)  
✅ Password hashing dengan bcryptjs (cost: 10)  
✅ JWT token dengan expiry 7 hari  
✅ File upload type/size restrictions  
✅ CORS configured untuk frontend origin  
✅ Rate limiting pada submit (10/15min) dan login (20/15min) via express-rate-limit  
✅ SQL injection prevention dengan parameterized queries  

## 🎨 UI/UX Design

- **Mobile-first** - Responsive di HP, tablet, desktop
- **Tailwind CSS** - Utility-first, modern design
- **Progress Stepper** - Visual indicator untuk langkah form
- **Inline validation** - Error message per field
- **Toast notifications** - Success/error feedback
- **Status badges** - Warna berbeda per status lamaran
- **Accessible** - Semantic HTML, label associations

## 📝 Example Workflows

### 1. Submit Lamaran
1. Buka http://localhost:3000/apply
2. Isi form step by step (1-10)
3. Klik "Kirim Lamaran"
4. Lihat success page dengan ID lamaran

### 2. Admin Review
1. Buka http://localhost:3000/admin/login
2. Login (admin / admin123)
3. Lihat dashboard dengan list lamaran
4. Klik "Lihat Detail" untuk melihat lengkap
5. Update status → klik "Update Status"
6. Download PDF / CSV

### 3. Export Bulk
1. Di dashboard, klik tombol "Export Semua (CSV)"
2. File CSV dengan semua lamaran otomatis download
3. Buka di Excel/Sheets untuk analisis

## 🐛 Troubleshooting

### Backend tidak bisa connect ke MySQL
```
Error: connect ECONNREFUSED 127.0.0.1:3306
→ Pastikan MySQL sudah running
→ Check DB_HOST, DB_USER, DB_PASSWORD di .env
```

### JWT Error pada API admin
```
Error: Token tidak ditemukan / Token tidak valid
→ Pastikan token disimpan di localStorage setelah login
→ Check JWT_SECRET sama antara backend dan di request
```

### PDF koordinat tidak sesuai
```
→ Lakukan ulang kalibrasi (lihat PDF Calibration section)
→ Verify DPI (150 DPI) konsisten
→ Test dengan page dan field berbeda
```

### Upload file error
```
Error: Tipe file tidak didukung
→ Hanya jpg, jpeg, png, pdf yang dibolehkan
→ Max size 5MB
```

## 📚 Folder Structure

```
job-application/
├── backend/
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── services/
│   │   │   ├── pdfService.js
│   │   │   ├── csvService.js
│   │   │   └── adminService.js
│   │   └── schemas/
│   │       └── validations.js
│   ├── templates/
│   │   └── Form_Job_Application.pdf
│   ├── uploads/
│   ├── db.js
│   ├── server.js
│   ├── create_admin.js
│   ├── schema.sql
│   └── .env
│
├── frontend/
│   ├── pages/
│   │   ├── _app.tsx
│   │   ├── index.tsx
│   │   ├── apply/
│   │   │   ├── index.tsx
│   │   │   └── success/[id].tsx
│   │   └── admin/
│   │       ├── login.tsx
│   │       ├── index.tsx
│   │       └── [id].tsx
│   ├── components/
│   │   ├── Layout.tsx
│   │   ├── ProgressStepper.tsx
│   │   └── DynamicTable.tsx
│   ├── lib/
│   │   ├── api.ts
│   │   ├── schemas.ts
│   │   └── store.ts
│   ├── styles/
│   │   └── globals.css
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── .env.local
│
└── README.md
```

## 📞 Support & Customization

- **Form sections**: Modifikasi schema + frontend components
- **Email notifications**: Integrate Nodemailer di backend
- **Advanced filters**: Tambah dashboard filter logic
- **Multi-language**: Gunakan next-i18next
- **Dark mode**: Extend Tailwind theme config

## 📄 License

Proprietary - Iware & Team

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Production Ready
