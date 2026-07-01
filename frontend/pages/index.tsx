import React, { useRef, useState } from 'react';
import Layout from '@/components/Layout';
import Link from 'next/link';
import toast from 'react-hot-toast';

const FEATURES = [
  { icon: 'forms', title: 'Formulir Lengkap', desc: 'Data diri, riwayat sekolah, pekerjaan, dan lainnya dalam satu formulir' },
  { icon: 'file-export', title: 'Unduh PDF & CSV', desc: 'Data yang sudah diisi bisa diunduh dalam format PDF atau CSV' },
  { icon: 'bolt', title: 'Proses Instan', desc: 'Lamaran langsung terkirim dan diproses oleh tim HRD secara real-time' },
];

const KETENTUAN_LIST = [
  'Pastikan seluruh data yang diisikan adalah benar, lengkap, akurat, dan sesuai dengan kondisi yang sebenarnya.',
  'Seluruh informasi yang diberikan harus dapat dipertanggungjawabkan. Dengan mengirimkan formulir ini, Anda menyatakan bahwa data yang disampaikan merupakan data yang sah dan valid.',
  'Apabila di kemudian hari ditemukan adanya ketidaksesuaian, pemalsuan, atau informasi yang tidak benar, perusahaan berhak mengambil tindakan sesuai dengan kebijakan dan ketentuan yang berlaku.',
  'Seluruh data yang Anda berikan hanya akan digunakan untuk keperluan proses rekrutmen, administrasi calon karyawan, serta kebutuhan perusahaan yang berkaitan dengan proses seleksi.',
  'Perusahaan berkomitmen untuk menjaga keamanan, kerahasiaan, dan perlindungan data pribadi yang Anda berikan.',
];

export default function Home() {
  const [agreed, setAgreed] = useState(false);
  const ketentuanRef = useRef<HTMLDivElement>(null);

  const handleStartClick = (e: React.MouseEvent) => {
    if (agreed) return;
    e.preventDefault();
    toast.error('Mohon baca dan setujui ketentuan pengisian data terlebih dahulu');
    ketentuanRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-7 py-10 sm:py-14">
        <div className="relative bg-navy-800 rounded-2xl overflow-hidden px-6 sm:px-12 py-16 sm:py-20 text-center mb-12 animate-scaleIn">
          <div
            className="absolute inset-0 pointer-events-none animate-floatSlow"
            style={{ background: 'radial-gradient(circle at top right, rgba(226,35,26,0.18), transparent 55%)' }}
          />
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.06]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
          <h1 className="relative text-white text-3xl sm:text-4xl font-semibold mb-4 tracking-tight">
            Form Jobs Application
          </h1>
          <p className="relative text-white/70 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Untuk pelamar kerja, silakan isi formulir lamaran secara lengkap dan akurat.
          </p>
        </div>

        <div ref={ketentuanRef} className="max-w-3xl mx-auto mb-14 section-card p-6 sm:p-8">
          <h2 className="text-xl text-text-primary font-semibold mb-3 text-center">
            Ketentuan Pengisian Data Calon Karyawan
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed mb-4">
            Selamat datang pada formulir Data Calon Karyawan RBM. Mohon luangkan waktu untuk membaca
            ketentuan berikut sebelum mengisi formulir. Informasi yang Anda berikan akan menjadi dasar
            dalam proses rekrutmen dan administrasi perusahaan, sehingga diharapkan seluruh data diisi
            dengan benar dan sesuai kondisi yang sebenarnya.
          </p>
          <ul className="space-y-2.5 mb-5">
            {KETENTUAN_LIST.map((item, idx) => (
              <li key={idx} className="flex gap-2.5 text-text-secondary text-sm leading-relaxed">
                <i className="ti ti-point-filled text-gold-500 flex-shrink-0 mt-0.5" style={{ fontSize: 14 }} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <label className="flex items-start gap-2.5 rounded-lg bg-surface-subtle p-3.5 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 flex-shrink-0"
              style={{ width: 16, height: 16 }}
            />
            <span className="text-text-primary text-sm leading-relaxed">
              Dengan melanjutkan pengisian formulir ini, Anda menyatakan telah membaca, memahami, dan
              menyetujui seluruh ketentuan yang tercantum di atas.
            </span>
          </label>
        </div>

        <div
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-surface-subtle border border-border-light flex flex-col sm:flex-row sm:items-center gap-6 p-6 sm:p-8 mb-14 animate-scaleIn shadow-card hover:shadow-card-hover transition-shadow duration-300"
          style={{ animationDelay: '80ms' }}
        >
          <div className="relative flex-shrink-0 flex items-center justify-center" style={{ width: 64, height: 64 }}>
            <div
              className="absolute inset-0 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(226,35,26,0.14), transparent 70%)' }}
            />
            <i
              className="ti ti-file-text relative"
              style={{
                fontSize: 44,
                backgroundImage: 'linear-gradient(135deg, #E2231A, #B91C1C)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            />
          </div>
          <div className="flex-1">
            <p className="text-base font-semibold text-text-primary mb-1">Isi Form Jobs Application</p>
            <p className="text-text-secondary text-sm">
              Pastikan semua data diisi lengkap dan benar untuk keperluan rekrutmen.
            </p>
          </div>
          <Link
            href="/apply"
            onClick={handleStartClick}
            aria-disabled={!agreed}
            className={`btn-primary flex-shrink-0 justify-center group w-full sm:w-auto ${!agreed ? 'opacity-50' : ''}`}
          >
            Mulai Isi Formulir
            <i className="ti ti-arrow-right transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="border-t border-border-light pt-12">
          <div className="text-center mb-10">
            <h3 className="text-2xl text-text-primary font-semibold mb-2">Yang Bisa Dilakukan di Sini</h3>
            <p className="text-text-secondary text-sm">Beberapa hal yang bisa kamu lakukan lewat sistem ini</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {FEATURES.map((feature, idx) => (
              <div
                key={idx}
                className="section-card p-6 text-center animate-scaleIn group hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200"
                style={{ animationDelay: `${160 + idx * 90}ms` }}
              >
                <div className="relative mx-auto mb-4 flex items-center justify-center" style={{ width: 48, height: 48 }}>
                  <div
                    className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: 'radial-gradient(circle, rgba(226,35,26,0.12), transparent 70%)' }}
                  />
                  <i
                    className={`ti ti-${feature.icon} relative transition-transform duration-200 group-hover:scale-110 group-hover:-translate-y-0.5`}
                    style={{
                      fontSize: 34,
                      backgroundImage: 'linear-gradient(135deg, #E2231A, #B91C1C)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      color: 'transparent',
                    }}
                  />
                </div>
                <h4 className="text-sm font-semibold text-text-primary mb-1.5">{feature.title}</h4>
                <p className="text-text-secondary text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
