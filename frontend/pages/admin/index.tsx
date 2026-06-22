import React, { useEffect, useMemo, useState } from 'react';
import Layout from '@/components/Layout';
import { useRouter } from 'next/router';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

const STATUS_META: Record<string, { label: string; bg: string; text: string; chart: string }> = {
  baru: { label: 'Baru', bg: '#EBF0FF', text: '#1E3A8A', chart: '#3B82F6' },
  direview: { label: 'Direview', bg: '#FEF3C7', text: '#92400E', chart: '#F59E0B' },
  shortlist: { label: 'Shortlist', bg: '#D1FAE5', text: '#065F46', chart: '#10B981' },
  diterima: { label: 'Diterima', bg: '#DCFCE7', text: '#14532D', chart: '#22C55E' },
  ditolak: { label: 'Ditolak', bg: '#FEE2E2', text: '#991B1B', chart: '#EF4444' },
};

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] || { label: status, bg: '#F1F5F9', text: '#64748B' };
  return (
    <span className="badge" style={{ background: meta.bg, color: meta.text }}>
      {meta.label}
    </span>
  );
}

const AVATAR_PALETTE = ['#EBF0FF', '#FEF3C7', '#D1FAE5', '#FBF6EC', '#FEE2E2', '#E0F2FE'];
const AVATAR_TEXT = ['#1E3A8A', '#92400E', '#065F46', '#A8872F', '#991B1B', '#075985'];

function hashName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return hash;
}

function Avatar({ name }: { name: string }) {
  const idx = hashName(name || '?') % AVATAR_PALETTE.length;
  const initials = (name || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <span
      className="w-7 h-7 rounded-full flex items-center justify-center font-semibold flex-shrink-0"
      style={{ background: AVATAR_PALETTE[idx], color: AVATAR_TEXT[idx], fontSize: 10 }}
    >
      {initials}
    </span>
  );
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon: string;
  dark?: boolean;
  trend?: string;
  trendColor?: string;
  delay?: number;
}

function StatCard({ label, value, icon, dark, trend, trendColor, delay = 0 }: StatCardProps) {
  return (
    <div
      className={`rounded-lg p-5 shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 animate-scaleIn ${
        dark ? 'bg-navy-800' : 'bg-surface-card border border-border-light'
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-3">
        <p
          className="text-[10px] font-medium uppercase tracking-wide"
          style={{ color: dark ? 'rgba(255,255,255,0.55)' : '#94A3B8', letterSpacing: '0.5px' }}
        >
          {label}
        </p>
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
          style={{ background: dark ? 'rgba(255,255,255,0.08)' : '#FDECEC' }}
        >
          <i
            className={`ti ti-${icon}`}
            style={{ fontSize: 15, color: dark ? '#fff' : '#E2231A' }}
          />
        </div>
      </div>
      <p className="text-[28px] font-semibold leading-none" style={{ color: dark ? '#fff' : '#0F1E3C' }}>
        {value}
      </p>
      {trend && (
        <p className="text-[10.5px] mt-2.5" style={{ color: dark ? '#E84545' : trendColor || '#64748B' }}>
          {trend}
        </p>
      )}
    </div>
  );
}

interface StatsData {
  total: number;
  byStatus: { status: string; count: number }[];
  trend: { date: string; count: number }[];
  topPositions: { posisi_dilamar: string; count: number }[];
}

function ChartCard({
  title,
  subtitle,
  children,
  delay = 0,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <div className="section-card p-5 animate-scaleIn" style={{ animationDelay: `${delay}ms` }}>
      <p className="text-sm font-semibold text-text-primary">{title}</p>
      {subtitle && <p className="text-text-muted text-xs mt-0.5 mb-4">{subtitle}</p>}
      {!subtitle && <div className="mb-4" />}
      {children}
    </div>
  );
}

function TrendChart({ trend }: { trend: StatsData['trend'] }) {
  const data = useMemo(() => {
    const map = new Map(trend.map((t) => [t.date, t.count]));
    const days: { label: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({
        label: d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
        count: map.get(key) || 0,
      });
    }
    return days;
  }, [trend]);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E2231A" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#E2231A" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10.5, fill: '#94A3B8' }}
          axisLine={false}
          tickLine={false}
          interval={1}
        />
        <YAxis tick={{ fontSize: 10.5, fill: '#94A3B8' }} axisLine={false} tickLine={false} allowDecimals={false} width={28} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}
          labelStyle={{ color: '#0F1E3C', fontWeight: 600 }}
          formatter={(value) => [`${value} lamaran`, '']}
        />
        <Area type="monotone" dataKey="count" stroke="#E2231A" strokeWidth={2} fill="url(#trendFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function StatusDonut({ byStatus }: { byStatus: StatsData['byStatus'] }) {
  const data = byStatus.map((s) => ({
    name: STATUS_META[s.status]?.label || s.status,
    value: s.count,
    color: STATUS_META[s.status]?.chart || '#94A3B8',
  }));

  if (!data.length) {
    return <p className="text-text-muted text-sm text-center py-12">Belum ada data</p>;
  }

  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={2}>
            {data.map((entry, idx) => (
              <Cell key={idx} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-col gap-1.5 flex-shrink-0">
        {data.map((entry, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: entry.color }} />
            <span className="text-text-secondary text-xs">{entry.name}</span>
            <span className="text-text-primary text-xs font-semibold">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopPositionsChart({ topPositions }: { topPositions: StatsData['topPositions'] }) {
  const data = topPositions.map((p) => ({
    name: p.posisi_dilamar.length > 14 ? `${p.posisi_dilamar.slice(0, 14)}…` : p.posisi_dilamar,
    count: p.count,
  }));

  if (!data.length) {
    return <p className="text-text-muted text-sm text-center py-12">Belum ada data</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 11, fill: '#64748B' }}
          axisLine={false}
          tickLine={false}
          width={100}
        />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
        <Bar dataKey="count" fill="#E2231A" radius={[0, 4, 4, 0]} barSize={16} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const { token, logout } = useAuthStore();
  const [applications, setApplications] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [mounted, setMounted] = useState(false);
  const limit = 10;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchApplications();
  }, [mounted, token, search, status, page]);

  useEffect(() => {
    if (!mounted || !token) return;
    fetchStats();
  }, [mounted, token]);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const response = await api.getApplications(page, limit, search, status);
      setApplications(response.data.data);
      setTotal(response.data.total ?? response.data.data.length);
    } catch (error: any) {
      console.error('Fetch error:', error);
      if (error.response?.status === 401) {
        logout();
        router.push('/admin/login');
      } else {
        toast.error('Gagal mengambil data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.getApplicationStats();
      setStats(response.data);
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  const handleDelete = async (id: number, nama: string) => {
    if (!window.confirm(`Yakin mau hapus lamaran "${nama}"? Data ini gak bisa dikembalikan lagi lho.`)) return;
    try {
      await api.deleteApplication(id);
      toast.success('Lamaran berhasil dihapus');
      fetchApplications();
      fetchStats();
    } catch (error) {
      toast.error('Gagal menghapus lamaran');
    }
  };

  const handleExportCsv = async () => {
    try {
      const response = await api.exportAllCsv();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'semua_lamaran.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success('CSV berhasil diunduh');
    } catch (error) {
      toast.error('Gagal mengunduh CSV');
    }
  };

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    (stats?.byStatus || []).forEach((s) => {
      counts[s.status] = s.count;
    });
    return counts;
  }, [stats]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  if (!mounted || !token) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-7 pt-8 pb-12">
        <div className="mb-6">
          <h1 className="text-2xl text-text-primary">Dashboard</h1>
          <p className="text-text-secondary text-sm mt-1">Pantau dan kelola semua lamaran yang masuk di sini.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Lamaran" value={stats?.total ?? total} icon="files" dark trend="Semua waktu" delay={0} />
          <StatCard label="Baru" value={statusCounts.baru || 0} icon="sparkles" trendColor="#1E3A8A" delay={60} />
          <StatCard label="Direview" value={statusCounts.direview || 0} icon="clock-hour-4" trendColor="#92400E" delay={120} />
          <StatCard label="Shortlist" value={statusCounts.shortlist || 0} icon="star" trendColor="#065F46" delay={180} />
        </div>

        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-10">
            <div className="lg:col-span-2">
              <ChartCard title="Tren Lamaran" subtitle="14 hari terakhir" delay={60}>
                <TrendChart trend={stats.trend} />
              </ChartCard>
            </div>
            <ChartCard title="Distribusi Status" delay={120}>
              <StatusDonut byStatus={stats.byStatus} />
            </ChartCard>
            <div className="lg:col-span-3">
              <ChartCard title="Posisi Paling Diminati" subtitle="Top 5 berdasarkan jumlah lamaran" delay={180}>
                <TopPositionsChart topPositions={stats.topPositions} />
              </ChartCard>
            </div>
          </div>
        )}

        <div className="section-card overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-5 border-b-[0.5px] border-border-light">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-text-primary">Data Lamaran</h2>
              <span className="badge" style={{ background: '#F1F5F9', color: '#64748B' }}>{total}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 sm:flex-initial">
                <i className="ti ti-search absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted text-sm" />
                <input
                  type="text"
                  placeholder="Cari nama/email..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="form-input w-full sm:w-[220px]"
                  style={{ paddingLeft: 32 }}
                />
              </div>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="form-select"
                style={{ width: 150 }}
              >
                <option value="">Semua Status</option>
                <option value="baru">Baru</option>
                <option value="direview">Direview</option>
                <option value="shortlist">Shortlist</option>
                <option value="diterima">Diterima</option>
                <option value="ditolak">Ditolak</option>
              </select>
              <button onClick={handleExportCsv} className="btn-primary">
                <i className="ti ti-download" />
                Export CSV
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-16">
              <p className="text-text-secondary text-sm">Memuat data...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-16">
              <i className="ti ti-inbox text-text-muted" style={{ fontSize: 32 }} />
              <p className="text-text-secondary text-sm mt-3">Belum ada lamaran yang masuk nih</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="admin-table min-w-[720px]">
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>Posisi</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Tanggal</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app: any) => (
                    <tr key={app.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <Avatar name={app.nama_lengkap} />
                          <span className="text-text-primary font-medium">{app.nama_lengkap}</span>
                        </div>
                      </td>
                      <td className="text-text-secondary">{app.posisi_dilamar}</td>
                      <td className="text-text-secondary">{app.email}</td>
                      <td>
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="text-text-secondary">
                        {new Date(app.created_at).toLocaleDateString('id-ID')}
                      </td>
                      <td>
                        <div className="flex gap-1.5">
                          <Link href={`/admin/${app.id}`} className="action-btn" title="Detail">
                            <i className="ti ti-eye" />
                          </Link>
                          <button
                            onClick={() => handleDelete(app.id, app.nama_lengkap)}
                            className="action-btn"
                            title="Hapus"
                          >
                            <i className="ti ti-trash" style={{ color: '#DC2626' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {!isLoading && applications.length > 0 && (
          <div className="flex justify-between items-center mt-4">
            <p className="text-text-muted text-xs">
              Halaman {page} dari {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary"
              >
                <i className="ti ti-chevron-left" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-secondary"
              >
                <i className="ti ti-chevron-right" />
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
