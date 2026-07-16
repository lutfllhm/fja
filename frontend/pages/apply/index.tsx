import React, { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import ProgressStepper from '@/components/ProgressStepper';
import DynamicTable from '@/components/DynamicTable';
import { useFormStore } from '@/lib/store';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';

const STEPS = [
  'Data Pribadi',
  'Keluarga',
  'Pendidikan',
  'Kesehatan',
  'Bahasa',
  'Keterampilan',
  'Riwayat',
  'Minat',
  'Lain-lain',
  'Penutup',
];

interface SectionCardProps {
  icon: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

function SectionCard({ icon, title, subtitle, children }: SectionCardProps) {
  return (
    <div className="section-card mb-4">
      <div className="section-card-header">
        <div className="section-card-icon">
          <i className={`ti ti-${icon}`} />
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary">{title}</p>
          {subtitle && <p className="text-text-muted" style={{ fontSize: 11 }}>{subtitle}</p>}
        </div>
      </div>
      <div className="section-card-body space-y-3">{children}</div>
    </div>
  );
}

type FieldFormat = 'email' | 'phone' | 'numeric' | 'alpha';

const FORMAT_VALIDATORS: Record<FieldFormat, { pattern: RegExp; message: string }> = {
  email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Format email tidak sesuai, contoh: nama@email.com' },
  phone: { pattern: /^[0-9+\s-]{10,}$/, message: 'Nomor HP hanya boleh angka, minimal 10 digit' },
  numeric: { pattern: /^[0-9]+$/, message: 'Hanya boleh berisi angka' },
  alpha: { pattern: /^[A-Za-z\s.'-]+$/, message: 'Hanya boleh berisi huruf' },
};

interface TextInputProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  value: any;
  onChange: (value: any) => void;
  required?: boolean;
  format?: FieldFormat;
  description?: string;
  disabled?: boolean;
}

function TextInput({ label, name, type = 'text', placeholder, value, onChange, required, format, description, disabled }: TextInputProps) {
  const [error, setError] = useState('');

  const validate = (val: string) => {
    if (!format || !val) {
      setError('');
      return;
    }
    const { pattern, message } = FORMAT_VALIDATORS[format];
    setError(pattern.test(val) ? '' : message);
  };

  return (
    <div>
      <label className="field-label mb-0.5">
        {label}
        {required && <span className="required">*</span>}
      </label>
      {description && (
        <p className="text-text-muted mb-1" style={{ fontSize: 11, marginTop: -2 }}>
          {description}
        </p>
      )}
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={(e) => validate(e.target.value)}
        disabled={disabled}
        className={`form-input ${value ? 'filled' : ''} ${error ? 'error' : ''}`}
      />
      {error && (
        <p className="field-error">
          <i className="ti ti-alert-circle" />
          {error}
        </p>
      )}
    </div>
  );
}

interface CheckboxInputProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function CheckboxInput({ label, name, checked, onChange }: CheckboxInputProps) {
  return (
    <label className="flex items-center gap-1.5 mt-1" style={{ fontSize: 13, cursor: 'pointer' }}>
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}

interface TextAreaProps {
  label: string;
  name: string;
  value: any;
  onChange: (value: any) => void;
  rows?: number;
  required?: boolean;
  maxLength?: number;
}

function TextAreaInput({ label, name, value, onChange, rows = 3, required, maxLength }: TextAreaProps) {
  const length = (value || '').length;
  const nearLimit = maxLength ? length > maxLength * 0.9 : false;
  return (
    <div>
      <label className="field-label">
        {label}
        {required && <span className="required">*</span>}
      </label>
      <textarea
        name={name}
        rows={rows}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="form-textarea"
        maxLength={maxLength}
      />
      {maxLength && (
        <p
          className="text-text-muted"
          style={{ fontSize: 11, textAlign: 'right', marginTop: 2, color: nearLimit ? '#dc2626' : undefined }}
        >
          {length}/{maxLength} karakter — agar tidak terpotong saat dicetak ke PDF
        </p>
      )}
    </div>
  );
}

interface SelectInputProps {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  value: any;
  onChange: (value: any) => void;
}

function SelectInput({ label, name, options, value, onChange }: SelectInputProps) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <select
        name={name}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="form-select"
      >
        <option value="">-- Pilih --</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface SelectWithOtherInputProps {
  label: string;
  name: string;
  options: string[];
  value: any;
  onChange: (value: any) => void;
  required?: boolean;
}

function SelectWithOtherInput({ label, name, options, value, onChange, required }: SelectWithOtherInputProps) {
  const isOther = !!value && !options.includes(value);
  const [selected, setSelected] = useState(isOther ? 'Lainnya' : value || '');

  const handleSelectChange = (val: string) => {
    setSelected(val);
    onChange(val === 'Lainnya' ? '' : val);
  };

  return (
    <div>
      <label className="field-label">
        {label}
        {required && <span className="required">*</span>}
      </label>
      <select
        name={name}
        value={selected}
        onChange={(e) => handleSelectChange(e.target.value)}
        className="form-select"
      >
        <option value="">-- Pilih --</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
        <option value="Lainnya">Lainnya</option>
      </select>
      {selected === 'Lainnya' && (
        <input
          type="text"
          placeholder={`Tulis ${label.toLowerCase()} kamu`}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={`form-input mt-1.5 ${value ? 'filled' : ''}`}
        />
      )}
    </div>
  );
}

interface PillSelectProps {
  label: string;
  value: any;
  options: string[];
  onChange: (value: any) => void;
}

function PillSelect({ label, value, options, onChange }: PillSelectProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-text-muted mr-1" style={{ fontSize: 11 }}>{label}</span>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`pill ${value === opt ? 'active' : ''}`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

interface FileInputProps {
  label: string;
  accept: string;
  onChange: (file: File | undefined) => void;
}

function FileInput({ label, accept, onChange }: FileInputProps) {
  const [fileName, setFileName] = useState<string>('');
  return (
    <div>
      <label className="field-label">{label}</label>
      <label className="upload-zone block">
        <i className="ti ti-cloud-upload text-gold-500" style={{ fontSize: 22 }} />
        <p className="text-text-secondary text-sm mt-1.5">
          {fileName || 'Klik untuk pilih file'}
        </p>
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            setFileName(file?.name || '');
            onChange(file);
          }}
        />
      </label>
    </div>
  );
}

interface SignaturePadProps {
  label: string;
  onChange: (file: File | undefined) => void;
}

const SIG_MIN_WIDTH = 3;
const SIG_MAX_WIDTH = 6;
const SIG_CSS_HEIGHT = 160;

function SignaturePad({ label, onChange }: SignaturePadProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const drawingRef = React.useRef(false);
  const pointsRef = React.useRef<{ x: number; y: number; t: number }[]>([]);
  const lastWidthRef = React.useRef(SIG_MIN_WIDTH);
  const [hasDrawn, setHasDrawn] = useState(false);

  const getContext = () => canvasRef.current?.getContext('2d') || null;

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const dpr = window.devicePixelRatio || 1;
    const cssWidth = container.clientWidth;
    canvas.width = cssWidth * dpr;
    canvas.height = SIG_CSS_HEIGHT * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);
  }, []);

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, t: Date.now() };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top, t: Date.now() };
  };

  const exportToFile = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      onChange(new File([blob], 'tanda-tangan.png', { type: 'image/png' }));
    }, 'image/png');
  };

  const widthForSpeed = (p1: { x: number; y: number; t: number }, p2: { x: number; y: number; t: number }) => {
    const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const dt = Math.max(p2.t - p1.t, 1);
    const speed = dist / dt;
    const target = SIG_MAX_WIDTH - Math.min(speed * 6, SIG_MAX_WIDTH - SIG_MIN_WIDTH);
    return Math.max(SIG_MIN_WIDTH, Math.min(SIG_MAX_WIDTH, target));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    drawingRef.current = true;
    lastWidthRef.current = SIG_MIN_WIDTH;
    pointsRef.current = [getPoint(e)];
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const ctx = getContext();
    if (!ctx) return;

    const point = getPoint(e);
    const points = pointsRef.current;
    points.push(point);
    if (points.length < 3) return;

    const [p0, p1, p2] = points.slice(-3);
    const width = widthForSpeed(p1, p2);
    const smoothedWidth = (lastWidthRef.current + width) / 2;
    lastWidthRef.current = smoothedWidth;

    const midA = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
    const midB = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = smoothedWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(midA.x, midA.y);
    ctx.quadraticCurveTo(p1.x, p1.y, midB.x, midB.y);
    ctx.stroke();

    if (!hasDrawn) setHasDrawn(true);
  };

  const handlePointerUp = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    pointsRef.current = [];
    exportToFile();
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = getContext();
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    onChange(undefined);
  };

  return (
    <div>
      <label className="field-label">{label}</label>
      <div
        ref={containerRef}
        className="rounded-lg border-[1.5px] border-dashed border-border-hover bg-surface-input overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          className="w-full block touch-none cursor-crosshair"
          style={{ height: SIG_CSS_HEIGHT, background: '#fff' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
      </div>
      <div className="flex justify-between items-center mt-1.5">
        <p className="text-text-muted" style={{ fontSize: 11 }}>
          Gambar tanda tangan Anda di area putih menggunakan jari atau mouse
        </p>
        {hasDrawn && (
          <button type="button" onClick={handleClear} className="text-gold-600 text-xs hover:underline flex-shrink-0 ml-2">
            <i className="ti ti-eraser mr-1" />
            Hapus
          </button>
        )}
      </div>
    </div>
  );
}

const FAMILY_COLUMNS = [
  { key: 'status', label: 'Status', locked: true },
  { key: 'nama', label: 'Nama Lengkap' },
  { key: 'lp', label: 'L/P' },
  { key: 'ttl_umur', label: 'TTL / Umur' },
  { key: 'pendidikan', label: 'Pendidikan Terakhir' },
  { key: 'pekerjaan', label: 'Pekerjaan' },
  { key: 'jenis_perusahaan', label: 'Jenis Perusahaan' },
  { key: 'jabatan', label: 'Jabatan / Posisi' },
];

const REFERENSI_COLUMNS = [
  { key: 'nama', label: 'Nama' },
  { key: 'perusahaan', label: 'Perusahaan' },
  { key: 'alamat', label: 'Alamat' },
  { key: 'telepon', label: 'No. Telepon' },
  { key: 'hubungan', label: 'Hubungan' },
];

const AKTIVITAS_COLUMNS = [
  { key: 'nama_organisasi', label: 'Nama Organisasi' },
  { key: 'tempat', label: 'Tempat' },
  { key: 'jabatan', label: 'Jabatan' },
  { key: 'tahun', label: 'Tahun' },
];

const SKILL_LEVELS = ['Baik', 'Cukup', 'Kurang'];

// Step Components
function StepDataPribadi({ formData, updateField, files, setFiles }: any) {
  return (
    <>
      <SectionCard icon="id" title="Data Pribadi" subtitle="Identitas kamu dan posisi yang dilamar">
        <TextInput label="Posisi yang Dilamar" name="posisi_dilamar" value={formData.posisi_dilamar} onChange={(v) => updateField('posisi_dilamar', v)} required />
        <TextInput label="Nama Lengkap" name="nama_lengkap" value={formData.nama_lengkap} onChange={(v) => updateField('nama_lengkap', v)} required format="alpha" />
        <div className="field-row">
          <TextInput label="Tempat Lahir" name="tempat_lahir" value={formData.tempat_lahir} onChange={(v) => updateField('tempat_lahir', v)} />
          <TextInput label="Tanggal Lahir" name="tanggal_lahir" type="date" value={formData.tanggal_lahir} onChange={(v) => updateField('tanggal_lahir', v)} />
        </div>
        <div className="field-row-3">
          <SelectWithOtherInput
            label="Agama"
            name="agama"
            options={['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu']}
            value={formData.agama}
            onChange={(v) => updateField('agama', v)}
          />
          <SelectInput
            label="Jenis Kelamin"
            name="jenis_kelamin"
            options={[{ value: 'L', label: 'Laki-laki' }, { value: 'P', label: 'Perempuan' }]}
            value={formData.jenis_kelamin}
            onChange={(v) => updateField('jenis_kelamin', v)}
          />
          <TextInput label="Golongan Darah" name="gol_darah" value={formData.gol_darah} onChange={(v) => updateField('gol_darah', v)} />
        </div>
        <TextInput label="No. KTP" name="no_ktp" value={formData.no_ktp} onChange={(v) => updateField('no_ktp', v)} format="numeric" />
        <TextInput label="No. NPWP" name="no_npwp" value={formData.no_npwp} onChange={(v) => updateField('no_npwp', v)} format="numeric" />
      </SectionCard>

      <SectionCard icon="map-pin" title="Alamat & Kontak" subtitle="Alamat tinggal dan cara menghubungi kamu">
        <TextAreaInput label="Alamat sesuai KTP" name="alamat_ktp" value={formData.alamat_ktp} onChange={(v) => updateField('alamat_ktp', v)} />
        <TextAreaInput label="Alamat Domisili" name="alamat_domisili" value={formData.alamat_domisili} onChange={(v) => updateField('alamat_domisili', v)} />
        <TextInput label="Telepon Domisili" name="telepon_domisili" value={formData.telepon_domisili} onChange={(v) => updateField('telepon_domisili', v)} format="phone" />
        <div className="field-row">
          <TextInput label="Nomor HP" name="nomor_hp" type="tel" value={formData.nomor_hp} onChange={(v) => updateField('nomor_hp', v)} required format="phone" />
          <TextInput label="No. WhatsApp" name="no_whatsapp" type="tel" value={formData.no_whatsapp} onChange={(v) => updateField('no_whatsapp', v)} format="phone" />
        </div>
        <TextInput label="Email" name="email" type="email" value={formData.email} onChange={(v) => updateField('email', v)} required format="email" />
        <div className="field-row-3">
          <TextInput label="Facebook" name="facebook" value={formData.facebook} onChange={(v) => updateField('facebook', v)} />
          <TextInput label="Twitter" name="twitter" value={formData.twitter} onChange={(v) => updateField('twitter', v)} />
          <TextInput label="Instagram" name="instagram" value={formData.instagram} onChange={(v) => updateField('instagram', v)} />
        </div>
        <TextInput label="Sosial Media Lainnya" name="sosmed_lainnya" value={formData.sosmed_lainnya} onChange={(v) => updateField('sosmed_lainnya', v)} />
      </SectionCard>

      <SectionCard icon="heartbeat" title="Data Fisik & Lainnya" subtitle="Info tambahan dan kontak darurat">
        <div className="field-row">
          <TextInput label="Tinggi Badan" name="tinggi_badan" placeholder="cm" value={formData.tinggi_badan} onChange={(v) => updateField('tinggi_badan', v)} format="numeric" />
          <TextInput label="Berat Badan" name="berat_badan" placeholder="kg" value={formData.berat_badan} onChange={(v) => updateField('berat_badan', v)} format="numeric" />
        </div>
        <TextInput label="No. SIM" name="no_sim" value={formData.no_sim} onChange={(v) => updateField('no_sim', v)} />
        <TextInput label="No. BPJS Kesehatan" name="no_bpjs_kesehatan" value={formData.no_bpjs_kesehatan} onChange={(v) => updateField('no_bpjs_kesehatan', v)} />
        <div className="field-row-3">
          <TextInput label="Nama Kontak Darurat" name="darurat_nama" value={formData.darurat_nama} onChange={(v) => updateField('darurat_nama', v)} />
          <TextInput label="Hubungan Kontak Darurat" name="darurat_hubungan" value={formData.darurat_hubungan} onChange={(v) => updateField('darurat_hubungan', v)} />
          <TextInput label="Telepon Kontak Darurat" name="darurat_telepon" type="tel" value={formData.darurat_telepon} onChange={(v) => updateField('darurat_telepon', v)} format="phone" />
        </div>
      </SectionCard>

      <SectionCard icon="paperclip" title="Dokumen" subtitle="Upload foto dan CV terbaru kamu">
        <div className="field-row">
          <FileInput label="Foto (JPG/PNG, maks 2MB)" accept="image/jpeg,image/png" onChange={(file) => setFiles((prev: any) => ({ ...prev, foto: file }))} />
          <FileInput label="CV (PDF, maks 5MB)" accept="application/pdf" onChange={(file) => setFiles((prev: any) => ({ ...prev, cv: file }))} />
        </div>
      </SectionCard>
    </>
  );
}

function StepKeluarga({ formData, updateField }: any) {
  return (
    <>
      <SectionCard icon="users" title="Status Perkawinan">
        <SelectInput
          label="Status Perkawinan"
          name="status_perkawinan"
          options={[{ value: 'Belum Menikah', label: 'Belum Menikah' }, { value: 'Menikah', label: 'Menikah' }]}
          value={formData.status_perkawinan}
          onChange={(v) => updateField('status_perkawinan', v)}
        />
      </SectionCard>

      <SectionCard icon="home" title="Susunan Keluarga Inti" subtitle="Suami/istri dan anak-anak, isi kalau sudah menikah">
        <DynamicTable
          rows={formData.keluarga_inti}
          onChange={(rows) => updateField('keluarga_inti', rows)}
          columns={FAMILY_COLUMNS}
          minRows={1}
          addLabel="Tambah Anak"
          emptyRow={{ status: `Anak ${formData.keluarga_inti.length}`, nama: '', lp: '', ttl_umur: '', pendidikan: '', pekerjaan: '', jenis_perusahaan: '', jabatan: '' }}
        />
      </SectionCard>

      <SectionCard icon="users-group" title="Susunan Keluarga Asal" subtitle="Ayah, Ibu, saudara kandung, termasuk kamu sendiri">
        <DynamicTable
          rows={formData.keluarga_asal}
          onChange={(rows) => updateField('keluarga_asal', rows)}
          columns={FAMILY_COLUMNS}
          minRows={2}
          addLabel="Tambah Saudara"
          emptyRow={{ status: `Saudara ${formData.keluarga_asal.filter((r: any) => r.status?.startsWith('Saudara')).length + 1}`, nama: '', lp: '', ttl_umur: '', pendidikan: '', pekerjaan: '', jenis_perusahaan: '', jabatan: '' }}
        />
      </SectionCard>
    </>
  );
}

function StepPendidikan({ formData, updateField }: any) {
  function updateEntry(index: number, next: Record<string, any>) {
    updateField('pendidikan', formData.pendidikan.map((e: any, i: number) => (i === index ? next : e)));
  }
  return (
    <>
      {formData.pendidikan.map((entry: any, index: number) => (
        <SectionCard key={index} icon="school" title={`Pendidikan ${index + 1}`} subtitle={index === 0 ? 'Terakhir' : undefined}>
          <div className="field-row">
            <TextInput label="Jenjang Pendidikan" name="jenjang" value={entry.jenjang} onChange={(v) => updateEntry(index, { ...entry, jenjang: v })} />
            <TextInput label="Sekolah / Pendidikan Tinggi" name="sekolah" value={entry.sekolah} onChange={(v) => updateEntry(index, { ...entry, sekolah: v })} />
            <TextInput label="Lokasi" name="lokasi" value={entry.lokasi} onChange={(v) => updateEntry(index, { ...entry, lokasi: v })} />
            <TextInput label="Jurusan" name="jurusan" value={entry.jurusan} onChange={(v) => updateEntry(index, { ...entry, jurusan: v })} />
            <TextInput label="Tahun Mulai" name="tahun_mulai" value={entry.tahun_mulai} onChange={(v) => updateEntry(index, { ...entry, tahun_mulai: v })} />
            <TextInput label="Tahun Selesai" name="tahun_selesai" value={entry.tahun_selesai} onChange={(v) => updateEntry(index, { ...entry, tahun_selesai: v })} />
            <TextInput label="No. Ijazah" name="no_ijazah" value={entry.no_ijazah} onChange={(v) => updateEntry(index, { ...entry, no_ijazah: v })} />
            <TextInput label="NEM / IPK" name="nem_ipk" value={entry.nem_ipk} onChange={(v) => updateEntry(index, { ...entry, nem_ipk: v })} />
          </div>
        </SectionCard>
      ))}
    </>
  );
}

function StepKesehatan({ formData, updateField }: any) {
  return (
    <SectionCard icon="heartbeat" title="Riwayat Kesehatan">
      <SelectInput
        label="Apakah anda sakit dalam jangka waktu yang lama?"
        name="sakit_lama"
        options={[{ value: 'Tidak', label: 'Tidak' }, { value: 'Ya', label: 'Ya' }]}
        value={formData.sakit_lama}
        onChange={(v) => updateField('sakit_lama', v)}
      />
      {formData.sakit_lama === 'Ya' && (
        <div className="field-row">
          <TextInput label="Nama Penyakit" name="sakit_lama_nama" value={formData.sakit_lama_nama} onChange={(v) => updateField('sakit_lama_nama', v)} />
          <TextInput label="Akibat / Keluhan yang Dirasakan" name="sakit_lama_akibat" value={formData.sakit_lama_akibat} onChange={(v) => updateField('sakit_lama_akibat', v)} />
        </div>
      )}
      <SelectInput
        label="Apakah anda pernah mengalami kecelakaan berat?"
        name="kecelakaan_berat"
        options={[{ value: 'Tidak', label: 'Tidak' }, { value: 'Ya', label: 'Ya' }]}
        value={formData.kecelakaan_berat}
        onChange={(v) => updateField('kecelakaan_berat', v)}
      />
      {formData.kecelakaan_berat === 'Ya' && (
        <div className="field-row">
          <TextInput label="Nama / Jenis Kecelakaan" name="kecelakaan_nama" value={formData.kecelakaan_nama} onChange={(v) => updateField('kecelakaan_nama', v)} />
          <TextInput label="Akibat / Keluhan yang Dirasakan" name="kecelakaan_akibat" value={formData.kecelakaan_akibat} onChange={(v) => updateField('kecelakaan_akibat', v)} />
        </div>
      )}
    </SectionCard>
  );
}

function StepBahasa({ formData, updateField }: any) {
  function updateRow(index: number, key: string, value: string) {
    const next = formData.bahasa.map((row: any, i: number) => (i === index ? { ...row, [key]: value } : row));
    updateField('bahasa', next);
  }
  function addRow() {
    updateField('bahasa', [...formData.bahasa, { bahasa: '', bicara: '', membaca: '', menulis: '' }]);
  }
  function removeRow(index: number) {
    updateField('bahasa', formData.bahasa.filter((_: any, i: number) => i !== index));
  }
  return (
    <SectionCard icon="language" title="Kemampuan Bahasa" subtitle="Pilih level kamu: Baik, Cukup, atau Kurang">
      <div className="flex flex-col gap-3">
        {formData.bahasa.map((row: any, index: number) => (
          <div key={index} className="rounded-md border border-border-light p-3">
            <div className="flex items-center justify-between mb-2">
              <input
                value={row.bahasa}
                onChange={(e) => updateRow(index, 'bahasa', e.target.value)}
                placeholder="Nama Bahasa"
                className="form-input"
                style={{ maxWidth: 200, height: 30 }}
              />
              {index >= 3 && (
                <button type="button" onClick={() => removeRow(index)} className="text-[#DC2626]" style={{ fontSize: 11 }}>
                  <i className="ti ti-trash" />
                </button>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <PillSelect label="Bicara" value={row.bicara} options={SKILL_LEVELS} onChange={(v) => updateRow(index, 'bicara', v)} />
              <PillSelect label="Membaca" value={row.membaca} options={SKILL_LEVELS} onChange={(v) => updateRow(index, 'membaca', v)} />
              <PillSelect label="Menulis" value={row.menulis} options={SKILL_LEVELS} onChange={(v) => updateRow(index, 'menulis', v)} />
            </div>
          </div>
        ))}
        <button type="button" onClick={addRow} className="btn-add-row">
          <i className="ti ti-plus mr-1" />
          Tambah Bahasa Lain
        </button>
      </div>
    </SectionCard>
  );
}

function StepKeterampilan({ formData, updateField }: any) {
  return (
    <SectionCard icon="tools" title="Keterampilan Lain yang Dikuasai">
      <TextAreaInput label="Komputer" name="komputer" value={formData.komputer} onChange={(v) => updateField('komputer', v)} maxLength={140} />
      <TextAreaInput label="Keterampilan Lain" name="keterampilan_lain" value={formData.keterampilan_lain} onChange={(v) => updateField('keterampilan_lain', v)} maxLength={280} />
    </SectionCard>
  );
}

function StepPekerjaan({ formData, updateField }: any) {
  function updateEntry(index: number, next: Record<string, any>) {
    updateField('pekerjaan', formData.pekerjaan.map((e: any, i: number) => (i === index ? next : e)));
  }
  return (
    <>
      {formData.pekerjaan.map((entry: any, index: number) => (
        <SectionCard key={index} icon="briefcase" title={`Pekerjaan ${index + 1}`} subtitle={index === 0 ? 'Terakhir' : undefined}>
          <div className="field-row">
            <TextInput label="Jenis Perusahaan" name="jenis_perusahaan" value={entry.jenis_perusahaan} onChange={(v) => updateEntry(index, { ...entry, jenis_perusahaan: v })} />
            <TextInput label="Nama Perusahaan" name="nama_perusahaan" value={entry.nama_perusahaan} onChange={(v) => updateEntry(index, { ...entry, nama_perusahaan: v })} />
            <TextInput label="Lokasi" name="lokasi" value={entry.lokasi} onChange={(v) => updateEntry(index, { ...entry, lokasi: v })} />
            <TextInput label="Jabatan" name="jabatan" value={entry.jabatan} onChange={(v) => updateEntry(index, { ...entry, jabatan: v })} />
            <TextInput label="Tanggal Masuk" name="tgl_masuk" type="date" value={entry.tgl_masuk} onChange={(v) => updateEntry(index, { ...entry, tgl_masuk: v })} />
            <div>
              <TextInput
                label="Tanggal Keluar"
                name="tgl_keluar"
                type="date"
                value={entry.tgl_keluar}
                onChange={(v) => updateEntry(index, { ...entry, tgl_keluar: v })}
                disabled={entry.masih_aktif}
              />
              <CheckboxInput
                label="Masih aktif bekerja"
                name="masih_aktif"
                checked={!!entry.masih_aktif}
                onChange={(checked) => updateEntry(index, { ...entry, masih_aktif: checked, tgl_keluar: checked ? '' : entry.tgl_keluar })}
              />
            </div>
          </div>
          <TextAreaInput label="Uraian Pekerjaan" name="uraian" value={entry.uraian} onChange={(v) => updateEntry(index, { ...entry, uraian: v })} />
          <div className="field-row">
            <TextInput label="Gaji Terakhir" name="gaji_terakhir" value={entry.gaji_terakhir} onChange={(v) => updateEntry(index, { ...entry, gaji_terakhir: v })} />
            <TextInput label="Tunjangan yang Diperoleh" name="tunjangan" value={entry.tunjangan} onChange={(v) => updateEntry(index, { ...entry, tunjangan: v })} />
            <TextInput label="Fasilitas yang Diperoleh" name="fasilitas" value={entry.fasilitas} onChange={(v) => updateEntry(index, { ...entry, fasilitas: v })} />
            <TextInput label="Alasan Keluar" name="alasan_keluar" value={entry.alasan_keluar} onChange={(v) => updateEntry(index, { ...entry, alasan_keluar: v })} />
            <TextInput label="Pemberi Referensi" name="pemberi_referensi" value={entry.pemberi_referensi} onChange={(v) => updateEntry(index, { ...entry, pemberi_referensi: v })} />
            <TextInput label="Telepon Referensi" name="telepon_referensi" value={entry.telepon_referensi} onChange={(v) => updateEntry(index, { ...entry, telepon_referensi: v })} />
          </div>
        </SectionCard>
      ))}
    </>
  );
}

const MINAT_QUESTIONS: [string, string, number][] = [
  ['minat_sumber_lowongan', '1. Darimana anda mengetahui lowongan yang ada di Perusahaan kami?', 280],
  ['minat_tujuan_melamar', '2. Apakah tujuan anda melamar pekerjaan di Perusahaan?', 280],
  ['minat_tahu_perusahaan', '3. Apakah yang anda ketahui mengenai Perusahaan kami?', 280],
  ['minat_pernah_melamar', '4. Pernahkah anda melamar di Perusahaan kami? Bila pernah sebutkan kapan dan apa jabatan/posisinya?', 280],
  ['minat_bersedia_luar_kota', '5. Apakah anda bersedia ditempatkan diluar kota? Jika tidak, jelaskan!', 280],
  ['minat_bersedia_dinas_luar', '   Apakah anda bersedia dinas keluar kota? Jika tidak, jelaskan!', 280],
  ['minat_bidang_dikuasai', '6. Bidang pekerjaan apa saja yang anda kuasai?', 280],
  ['minat_melamar_lain', '7. Apakah saat ini anda juga sedang melamar pekerjaan di perusahaan lain? Jika ya, sebutkan!', 280],
  ['minat_mulai_bekerja', '8. Kapankah anda dapat mulai bekerja di Perusahaan kami?', 280],
  ['minat_gaji_diharapkan', '9. Berapakah gaji yang anda harapkan (gaji pokok dan tunjangan)?', 420],
  ['minat_kenal_karyawan', '10. Adakah karyawan kami yang anda kenal? Sebutkan posisi/bagian dan hubungannya.', 420],
];

function StepMinat({ formData, updateField }: any) {
  return (
    <SectionCard icon="bulb" title="Minat Terhadap Pekerjaan">
      {MINAT_QUESTIONS.map(([key, label, maxLength]) => (
        <TextAreaInput key={key} label={label} name={key} rows={2} value={formData[key]} onChange={(v) => updateField(key, v)} maxLength={maxLength} />
      ))}
    </SectionCard>
  );
}

function StepLainLain({ formData, updateField }: any) {
  return (
    <>
      <SectionCard icon="address-book" title="Referensi" subtitle="Orang yang bisa dimintai keterangan soal kamu">
        <DynamicTable
          rows={formData.referensi}
          onChange={(rows) => updateField('referensi', rows)}
          columns={REFERENSI_COLUMNS}
          addLabel="Tambah Referensi"
          emptyRow={{ nama: '', perusahaan: '', alamat: '', telepon: '', hubungan: '' }}
        />
      </SectionCard>

      <SectionCard icon="notes" title="Lain-lain">
        <TextAreaInput label="Bagaimana cara anda mengisi waktu luang?" name="waktu_luang" value={formData.waktu_luang} onChange={(v) => updateField('waktu_luang', v)} rows={4} maxLength={1500} />
      </SectionCard>

      <SectionCard icon="users-group" title="Aktivitas Sosial" subtitle="Organisasi apa saja yang pernah Anda ikuti?">
        <DynamicTable
          rows={formData.aktivitas_sosial}
          onChange={(rows) => updateField('aktivitas_sosial', rows)}
          columns={AKTIVITAS_COLUMNS}
          addLabel="Tambah Aktivitas"
          emptyRow={{ nama_organisasi: '', tempat: '', jabatan: '', tahun: '' }}
        />
      </SectionCard>

      <SectionCard icon="target" title="Refleksi Diri">
        <TextAreaInput label="Strong Point (kelebihan Anda)" name="strong_point" value={formData.strong_point} onChange={(v) => updateField('strong_point', v)} rows={4} maxLength={900} />
        <TextAreaInput label="Weak Point (kelemahan Anda)" name="weak_point" value={formData.weak_point} onChange={(v) => updateField('weak_point', v)} rows={4} maxLength={900} />
        <TextAreaInput label="Rencana 5 Tahun Ke Depan" name="rencana_5_tahun" value={formData.rencana_5_tahun} onChange={(v) => updateField('rencana_5_tahun', v)} rows={4} maxLength={1500} />
      </SectionCard>
    </>
  );
}

function StepPenutup({ formData, updateField, setFiles }: any) {
  return (
    <SectionCard icon="signature" title="Penutup" subtitle="Terakhir, konfirmasi dan tanda tangan kamu">
      <p className="text-text-secondary text-sm">
        Demikian saya isi dengan sebenar-benarnya, apabila terdapat pemalsuan ataupun data yang tidak benar,
        maka saya bersedia menerima sanksi sesuai ketentuan perusahaan.
      </p>
      <div className="field-row">
        <TextInput label="Tempat" name="tempat_ttd" value={formData.tempat_ttd} onChange={(v) => updateField('tempat_ttd', v)} required />
        <TextInput label="Tanggal" name="tanggal_ttd" type="date" value={formData.tanggal_ttd} onChange={(v) => updateField('tanggal_ttd', v)} required />
      </div>
      <SignaturePad label="Tanda Tangan" onChange={(file) => setFiles((prev: any) => ({ ...prev, ttd: file }))} />
    </SectionCard>
  );
}

function isStep1Complete(formData: any) {
  return Boolean(formData.posisi_dilamar && formData.nama_lengkap && formData.email && formData.nomor_hp);
}

export default function ApplyPage() {
  const router = useRouter();
  const { formData, currentStep, updateField, setCurrentStep, resetForm } = useFormStore();
  const [files, setFiles] = useState<{ foto?: File; cv?: File; ttd?: File }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxReachableStep = isStep1Complete(formData) ? STEPS.length : 1;

  const handleNextStep = () => {
    if (currentStep === 1 && !isStep1Complete(formData)) {
      toast.error('Posisi, nama, email, dan nomor HP wajib diisi dulu ya');
      return;
    }
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (step: number) => {
    if (step > 1 && !isStep1Complete(formData)) {
      toast.error('Lengkapi dulu Data Pribadi sebelum lanjut');
      return;
    }
    setCurrentStep(step);
  };

  const handleSubmit = async () => {
    if (!formData.nama_lengkap || !formData.email) {
      toast.error('Nama dan email belum diisi nih');
      return;
    }
    if (!formData.tempat_ttd || !formData.tanggal_ttd) {
      toast.error('Tempat dan tanggal belum diisi nih');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.submitApplication(formData, files);
      toast.success('Data kamu berhasil disimpan!');
      resetForm();
      await router.push(`/apply/success/${response.data.id}`);
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(error.response?.data?.error || 'Gagal menyimpan data, coba lagi ya');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepDataPribadi formData={formData} updateField={updateField} files={files} setFiles={setFiles} />;
      case 2:
        return <StepKeluarga formData={formData} updateField={updateField} />;
      case 3:
        return <StepPendidikan formData={formData} updateField={updateField} />;
      case 4:
        return <StepKesehatan formData={formData} updateField={updateField} />;
      case 5:
        return <StepBahasa formData={formData} updateField={updateField} />;
      case 6:
        return <StepKeterampilan formData={formData} updateField={updateField} />;
      case 7:
        return <StepPekerjaan formData={formData} updateField={updateField} />;
      case 8:
        return <StepMinat formData={formData} updateField={updateField} />;
      case 9:
        return <StepLainLain formData={formData} updateField={updateField} />;
      case 10:
        return <StepPenutup formData={formData} updateField={updateField} setFiles={setFiles} />;
      default:
        return null;
    }
  };

  const progressPct = Math.round((currentStep / STEPS.length) * 100);

  return (
    <div className="min-h-screen bg-surface-page flex flex-col">
      <Head>
        <title>{`${STEPS[currentStep - 1]} - Form Jobs Application`}</title>
      </Head>
      <header className="sticky top-0 z-40 bg-navy-800/90 backdrop-blur-md h-16 flex-shrink-0 border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto h-full px-4 sm:px-8 flex justify-between items-center">
          <a href="/" className="flex items-center gap-3">
            <Image
              src="/rbm-logo.png"
              alt="RBM Logo"
              width={32}
              height={32}
              className="h-8 w-auto flex-shrink-0"
              priority
            />
            <span className="text-white text-base font-medium hidden sm:inline">Form Jobs Application</span>
          </a>
          <Link
            href="/"
            className="text-white/70 text-sm border border-white/25 rounded-md px-3 py-1.5 hover:bg-white/10 hover:text-white transition-colors inline-flex items-center gap-1.5"
          >
            <i className="ti ti-arrow-left" />
            <span className="hidden sm:inline">Kembali</span>
          </Link>
        </div>
      </header>

      <ProgressStepper
        steps={STEPS}
        currentStep={currentStep}
        maxReachableStep={maxReachableStep}
        onStepClick={handleStepClick}
      />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-8 py-8">
        <div key={currentStep} className="step-content">
          {renderStep()}
        </div>

        <div className="section-card mt-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 p-5">
            <div>
              <p className="text-text-muted text-sm">
                Langkah {currentStep} dari {STEPS.length} —{' '}
                <span className="text-text-primary font-medium">{STEPS[currentStep - 1]}</span>
              </p>
              <div className="h-1.5 w-[160px] rounded-full bg-surface-subtle mt-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-[width] duration-300"
                  style={{
                    width: `${progressPct}%`,
                    background: 'linear-gradient(90deg, #0F1E3C, #C9A84C)',
                  }}
                />
              </div>
            </div>
            <div className="flex gap-2 sm:flex-shrink-0">
              <button
                onClick={handlePreviousStep}
                disabled={currentStep === 1}
                className="btn-secondary flex-1 sm:flex-initial justify-center"
              >
                <i className="ti ti-arrow-left" />
                Sebelumnya
              </button>

              {currentStep < STEPS.length ? (
                <button onClick={handleNextStep} className="btn-primary flex-1 sm:flex-initial justify-center">
                  Lanjut
                  <i className="ti ti-arrow-right" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`btn-accent flex-1 sm:flex-initial justify-center ${isSubmitting ? 'loading' : ''}`}
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
                  {!isSubmitting && <i className="ti ti-send" />}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
