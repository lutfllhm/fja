import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { useRouter } from 'next/router';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';
import Link from 'next/link';

const STATUS_META: Record<string, { label: string; bg: string; text: string }> = {
  baru: { label: 'Baru', bg: '#EBF0FF', text: '#1E3A8A' },
  direview: { label: 'Direview', bg: '#FEF3C7', text: '#92400E' },
  shortlist: { label: 'Shortlist', bg: '#D1FAE5', text: '#065F46' },
  diterima: { label: 'Diterima', bg: '#DCFCE7', text: '#14532D' },
  ditolak: { label: 'Ditolak', bg: '#FEE2E2', text: '#991B1B' },
};

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] || { label: status, bg: '#F1F5F9', text: '#64748B' };
  return (
    <span className="badge" style={{ background: meta.bg, color: meta.text }}>
      {meta.label}
    </span>
  );
}

interface InfoSectionProps {
  icon: string;
  title: string;
  children: React.ReactNode;
}

function InfoSection({ icon, title, children }: InfoSectionProps) {
  return (
    <div className="section-card mb-4">
      <div className="section-card-header">
        <div className="section-card-icon">
          <i className={`ti ti-${icon}`} />
        </div>
        <p className="text-sm font-semibold text-text-primary">{title}</p>
      </div>
      <div className="section-card-body">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <p className="text-text-muted" style={{ fontSize: 11 }}>{label}</p>
      <p className="text-text-primary text-sm mt-0.5">{value || '-'}</p>
    </div>
  );
}

export default function ApplicationDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { token } = useAuthStore();
  const [application, setApplication] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!token) {
      router.push('/admin/login');
      return;
    }
    if (id) {
      fetchApplication();
    }
  }, [id, token]);

  const fetchApplication = async () => {
    try {
      setIsLoading(true);
      const response = await api.getApplicationDetail(Number(id));
      setApplication(response.data);
      setStatus(response.data.status);
    } catch (error: any) {
      console.error('Fetch error:', error);
      toast.error('Gagal mengambil data lamaran');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async () => {
    try {
      await api.updateApplicationStatus(Number(id), status);
      toast.success('Status berhasil diperbarui');
      fetchApplication();
    } catch (error) {
      toast.error('Gagal memperbarui status');
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const response = await api.downloadPdf(Number(id));
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Lamaran_${application.nama_lengkap}_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success('PDF berhasil diunduh');
    } catch (error) {
      toast.error('Gagal mengunduh PDF');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Yakin mau hapus lamaran "${application.nama_lengkap}"? Data ini gak bisa dikembalikan lagi lho.`)) return;
    try {
      await api.deleteApplication(Number(id));
      toast.success('Lamaran berhasil dihapus');
      router.push('/admin');
    } catch (error) {
      toast.error('Gagal menghapus lamaran');
    }
  };

  const handleDownloadCsv = async () => {
    try {
      const response = await api.downloadCsv(Number(id));
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Lamaran_${application.nama_lengkap}_${id}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success('CSV berhasil diunduh');
    } catch (error) {
      toast.error('Gagal mengunduh CSV');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-7 text-center py-12">
          <p className="text-text-secondary text-sm">Memuat data...</p>
        </div>
      </Layout>
    );
  }

  if (!application) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-7">
          <div className="section-card text-center py-12">
            <p className="text-[#991B1B] text-sm">Lamaran tidak ditemukan</p>
            <Link href="/admin" className="text-gold-600 mt-3 inline-block text-sm hover:underline">
              Kembali ke Dashboard
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-7 pb-10">
        <div className="flex justify-between items-start mb-5">
          <div>
            <h2 className="text-2xl text-text-primary">{application.nama_lengkap}</h2>
            <p className="text-text-secondary text-sm mt-1">Posisi: {application.posisi_dilamar}</p>
          </div>
          <Link href="/admin" className="btn-secondary">
            <i className="ti ti-arrow-left" />
            Kembali
          </Link>
        </div>

        <div className="section-card mb-4">
          <div className="section-card-body">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button onClick={handleDownloadPdf} className="btn-secondary flex-1 justify-center">
                <i className="ti ti-file-type-pdf" />
                Unduh PDF
              </button>
              <button onClick={handleDownloadCsv} className="btn-secondary flex-1 justify-center">
                <i className="ti ti-file-spreadsheet" />
                Unduh CSV
              </button>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="form-select flex-1"
              >
                <option value="baru">Baru</option>
                <option value="direview">Direview</option>
                <option value="shortlist">Shortlist</option>
                <option value="diterima">Diterima</option>
                <option value="ditolak">Ditolak</option>
              </select>
              <button onClick={handleStatusChange} className="btn-primary flex-1 justify-center">
                <i className="ti ti-check" />
                Update Status
              </button>
              <button
                onClick={handleDelete}
                className="border border-[#FCA5A5] text-[#DC2626] rounded-md px-5 py-3 text-sm inline-flex items-center justify-center gap-2 transition-colors duration-150 hover:bg-[#FFF5F5]"
              >
                <i className="ti ti-trash" />
                Hapus
              </button>
            </div>
          </div>
        </div>

        <InfoSection icon="id" title="Identitas">
          <Field label="Email" value={application.email} />
          <Field label="Telepon HP" value={application.nomor_hp} />
          <Field label="Tanggal Lahir" value={application.tanggal_lahir} />
          <Field label="Jenis Kelamin" value={application.jenis_kelamin === 'L' ? 'Laki-laki' : application.jenis_kelamin === 'P' ? 'Perempuan' : '-'} />
        </InfoSection>

        <InfoSection icon="map-pin" title="Alamat">
          <Field label="Alamat KTP" value={application.alamat_ktp} />
          <Field label="Alamat Domisili" value={application.alamat_domisili} />
        </InfoSection>

        <InfoSection icon="info-circle" title="Informasi Lainnya">
          <Field label="Gol. Darah" value={application.gol_darah} />
          <Field label="Status Perkawinan" value={application.status_perkawinan} />
        </InfoSection>

        <div className="section-card">
          <div className="section-card-header">
            <div className="section-card-icon">
              <i className="ti ti-history" />
            </div>
            <p className="text-sm font-semibold text-text-primary">Meta</p>
          </div>
          <div className="section-card-body">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-text-muted" style={{ fontSize: 11 }}>Status Saat Ini</p>
                <div className="mt-1">
                  <StatusBadge status={application.status} />
                </div>
              </div>
              <Field label="Tanggal Masuk" value={new Date(application.created_at).toLocaleDateString('id-ID')} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
