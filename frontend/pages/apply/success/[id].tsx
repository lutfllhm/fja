import React from 'react';
import Layout from '@/components/Layout';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function SuccessPage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <Layout>
      <div className="max-w-[480px] mx-auto px-6 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-navy-800 flex items-center justify-center mx-auto mb-6 animate-slideUp">
          <i className="ti ti-check text-gold-500" style={{ fontSize: 28 }} />
        </div>
        <h1 className="text-xl text-text-primary mb-2">Data Kamu Berhasil Disimpan!</h1>
        <p className="text-text-secondary text-sm mb-5">
          Terima kasih sudah mengisi formulir. Data ini akan diproses oleh tim HR.
        </p>
        {id && (
          <div className="bg-gold-100 border-l-[3px] border-gold-500 rounded-md px-4 py-3 mb-6 text-left">
            <p className="text-text-muted" style={{ fontSize: 10.5 }}>Nomor Referensi Data Kamu</p>
            <p className="text-navy-800 font-semibold font-mono text-sm mt-0.5">{id}</p>
          </div>
        )}
        <Link href="/" className="btn-secondary inline-flex">
          <i className="ti ti-home" />
          Kembali ke Beranda
        </Link>
      </div>
    </Layout>
  );
}
