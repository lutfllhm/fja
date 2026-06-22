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


---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Production Ready
