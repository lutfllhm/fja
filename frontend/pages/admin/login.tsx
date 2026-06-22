import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const setToken = useAuthStore((state) => state.setToken);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.login(username, password);
      setToken(response.data.token, response.data.admin);
      toast.success('Berhasil masuk!');
      await router.push('/admin');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.error || 'Gagal masuk, coba lagi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="lg:w-[55%] bg-navy-800 relative overflow-hidden flex flex-col justify-between p-8 lg:p-12 min-h-[240px] lg:min-h-screen">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(circle at top right, rgba(226,35,26,0.14), transparent 60%)' }}
        />
        <div className="relative flex items-center gap-2.5">
          <Image
            src="/rbm-logo.png"
            alt="RBM Logo"
            width={28}
            height={28}
            className="h-7 w-auto flex-shrink-0"
            priority
          />
          <span className="text-white text-sm font-medium">Form Jobs Application</span>
        </div>

        <div className="relative hidden lg:block">
          <p className="text-white/70 text-lg leading-relaxed max-w-md">
            "Kami percaya bahwa orang yang tepat di posisi yang tepat adalah kunci
            pertumbuhan perusahaan."
          </p>
        </div>

        <p className="relative text-white/40 text-xs">© 2026 CV. Rajawali Bina Maju</p>
      </div>

      <div className="lg:w-[45%] bg-surface-card flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="text-text-muted text-sm inline-flex items-center gap-1.5 mb-6 hover:text-text-secondary transition-colors"
          >
            <i className="ti ti-arrow-left" />
            Kembali ke Beranda
          </Link>
          <p className="text-text-muted text-xs uppercase tracking-[1.5px] font-medium mb-1.5">
            Halo lagi
          </p>
          <h2 className="text-2xl text-text-primary mb-6">Masuk ke Dashboard</h2>

          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="field-label">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="form-input"
              />
            </div>

            <div>
              <label className="field-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full justify-center mt-2"
            >
              {isLoading ? 'Sedang masuk...' : 'Masuk'}
            </button>
          </form>

          <p className="text-center text-xs mt-5">
            <span className="text-text-muted">Lupa password? </span>
            <a href="#" className="text-gold-600 hover:underline">Hubungi admin aja</a>
          </p>
        </div>
      </div>
    </div>
  );
}
