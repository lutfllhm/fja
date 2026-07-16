const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

/**
 * Coordinates calibrated from the actual template (backend/templates/Form_Job_Application.pdf)
 * by extracting each label's (x, y) text position with pdfjs-dist and placing values just
 * to the right of the matching ":" on the same baseline. Page size: 595.2 x 841.68 pt (A4).
 * page index is 0-based; y is measured from the bottom (pdf-lib convention).
 */
const PDF_COORDS = {
  // PAGE 1 - header & SECTION A: DATA PRIBADI
  posisi_dilamar: { page: 0, x: 478.9, y: 779, size: 9 },
  nama_lengkap: { page: 0, x: 122, y: 713.4, size: 9 },
  ttl: { page: 0, x: 124, y: 702.9, size: 8 },
  agama: { page: 0, x: 467, y: 702.9, size: 8 },
  jenis_kelamin: { page: 0, x: 124, y: 692.5, size: 9 },
  gol_darah: { page: 0, x: 466, y: 692.5, size: 9 },
  no_ktp: { page: 0, x: 122, y: 682.1, size: 9 },
  no_npwp: { page: 0, x: 123, y: 671.6, size: 9 },
  no_bpjs_kesehatan: { page: 0, x: 407, y: 672.1, size: 9 },
  alamat_ktp: { page: 0, x: 122, y: 661.1, size: 8 },
  no_whatsapp: { page: 0, x: 404, y: 619.9, size: 9 },
  telepon_ktp: { page: 0, x: 469, y: 650.7, size: 9 },
  alamat_domisili: { page: 0, x: 122, y: 640.3, size: 8 },
  telepon_domisili: { page: 0, x: 469, y: 629.8, size: 9 },
  nomor_hp: { page: 0, x: 122, y: 619.4, size: 9 },
  email: { page: 0, x: 122, y: 609.0, size: 9 },
  facebook: { page: 0, x: 122, y: 598.5, size: 8 },
  twitter: { page: 0, x: 345, y: 598.5, size: 8 },
  instagram: { page: 0, x: 122, y: 588.1, size: 8 },
  sosmed_lainnya: { page: 0, x: 345, y: 588.1, size: 8 },
  tinggi_badan: { page: 0, x: 122, y: 577.6, size: 9 },
  no_sim: { page: 0, x: 407, y: 682.5, size: 9 },
  darurat_nama: { page: 0, x: 247, y: 567.2, size: 8 },
  darurat_hubungan: { page: 0, x: 412, y: 567.2, size: 8 },

  // PAGE 1 - SECTION B: LINGKUNGAN KELUARGA
  // status_perkawinan is marked via strikethrough on the printed "Menikah / Belum Menikah" label (see STRIKETHROUGH_CHOICES)

  // PAGE 1 - SECTION D: RIWAYAT KESEHATAN (top of page 1, lower y values)
  // sakit_lama / kecelakaan_berat are marked via strikethrough on the printed "Ya / Tidak" labels (see STRIKETHROUGH_CHOICES)
  sakit_lama_nama: { page: 0, x: 298, y: 543.8, size: 7 },
  sakit_lama_akibat: { page: 0, x: 148, y: 522.9, size: 7 },
  kecelakaan_nama: { page: 0, x: 298, y: 512.5, size: 7 },
  kecelakaan_akibat: { page: 0, x: 148, y: 491.6, size: 7 },

  // PAGE 1 - SECTION C: PENDIDIKAN (entry 1 lower block of page 1)
  pendidikan_0_jenjang: { page: 0, x: 122, y: 139.6, size: 8 },
  pendidikan_0_sekolah: { page: 0, x: 122, y: 129.1, size: 8 },
  pendidikan_0_lokasi: { page: 0, x: 122, y: 118.7, size: 8 },
  pendidikan_0_jurusan: { page: 0, x: 122, y: 108.2, size: 8 },
  pendidikan_0_tahun: { page: 0, x: 124, y: 97.8, size: 8 },
  pendidikan_0_no_ijazah: { page: 0, x: 299, y: 97.8, size: 8 },
  pendidikan_0_nem_ipk: { page: 0, x: 122, y: 87.4, size: 8 },
  pendidikan_1_jenjang: { page: 0, x: 122, y: 74.3, size: 8 },
  pendidikan_1_sekolah: { page: 0, x: 122, y: 63.8, size: 8 },
  pendidikan_1_lokasi: { page: 0, x: 122, y: 53.4, size: 8 },
  pendidikan_1_jurusan: { page: 0, x: 122, y: 43.0, size: 8 },

  // PAGE 2 - SECTION C continued (entry 2 tail)
  pendidikan_1_tahun: { page: 1, x: 124, y: 796.4, size: 8 },
  pendidikan_1_no_ijazah: { page: 1, x: 299, y: 796.4, size: 8 },
  pendidikan_1_nem_ipk: { page: 1, x: 122, y: 786.0, size: 8 },

  // PAGE 2 - SECTION F: KETERAMPILAN LAIN
  // maxWidth/maxLines keep long answers wrapped and shrunk within this section
  // instead of overflowing into RIWAYAT PEKERJAAN below (y=585.7).
  komputer: { page: 1, x: 122, y: 640.9, size: 8, maxWidth: 450, maxLines: 1 },
  keterampilan_lain: { page: 1, x: 122, y: 630.4, size: 8, maxWidth: 450, maxLines: 2, lineHeight: 8 },

  // PAGE 2 - SECTION G: RIWAYAT PEKERJAAN entry 1
  pekerjaan_0_jenis_perusahaan: { page: 1, x: 122, y: 585.7, size: 8, maxWidth: 200, maxLines: 1 },
  pekerjaan_0_nama_perusahaan: { page: 1, x: 122, y: 575.2, size: 8, maxWidth: 200, maxLines: 1 },
  pekerjaan_0_lokasi: { page: 1, x: 361, y: 575.2, size: 8, maxWidth: 200, maxLines: 1 },
  pekerjaan_0_jabatan: { page: 1, x: 122, y: 564.8, size: 8, maxWidth: 200, maxLines: 1 },
  pekerjaan_0_tgl_masuk: { page: 1, x: 122, y: 554.3, size: 8 },
  pekerjaan_0_tgl_keluar: { page: 1, x: 360, y: 554.8, size: 8 },
  pekerjaan_0_uraian: { page: 1, x: 122, y: 543.9, size: 7, maxWidth: 450, maxLines: 8, lineHeight: 10.4 },
  pekerjaan_0_gaji_terakhir: { page: 1, x: 122, y: 449.9, size: 8, maxWidth: 200, maxLines: 1 },
  pekerjaan_0_tunjangan: { page: 1, x: 122, y: 439.5, size: 7, maxWidth: 450, maxLines: 1 },
  pekerjaan_0_fasilitas: { page: 1, x: 122, y: 429.0, size: 7, maxWidth: 450, maxLines: 1 },
  pekerjaan_0_alasan_keluar: { page: 1, x: 122, y: 418.6, size: 7, maxWidth: 450, maxLines: 2, lineHeight: 8 },
  pekerjaan_0_pemberi_referensi: { page: 1, x: 122, y: 397.7, size: 8, maxWidth: 200, maxLines: 1 },
  pekerjaan_0_telepon_referensi: { page: 1, x: 361, y: 397.7, size: 8 },

  // PAGE 2 - SECTION G entry 2
  pekerjaan_1_jenis_perusahaan: { page: 1, x: 122, y: 384.6, size: 8, maxWidth: 200, maxLines: 1 },
  pekerjaan_1_nama_perusahaan: { page: 1, x: 122, y: 374.2, size: 8, maxWidth: 200, maxLines: 1 },
  pekerjaan_1_lokasi: { page: 1, x: 361, y: 374.2, size: 8, maxWidth: 200, maxLines: 1 },
  pekerjaan_1_jabatan: { page: 1, x: 122, y: 363.8, size: 8, maxWidth: 200, maxLines: 1 },
  pekerjaan_1_tgl_masuk: { page: 1, x: 122, y: 353.3, size: 8 },
  pekerjaan_1_tgl_keluar: { page: 1, x: 360, y: 353.8, size: 8 },
  pekerjaan_1_uraian: { page: 1, x: 122, y: 342.9, size: 7, maxWidth: 450, maxLines: 8, lineHeight: 10.4 },
  pekerjaan_1_gaji_terakhir: { page: 1, x: 122, y: 248.9, size: 8, maxWidth: 200, maxLines: 1 },
  pekerjaan_1_tunjangan: { page: 1, x: 122, y: 238.5, size: 7, maxWidth: 450, maxLines: 1 },
  pekerjaan_1_fasilitas: { page: 1, x: 122, y: 228.0, size: 7, maxWidth: 450, maxLines: 1 },
  pekerjaan_1_alasan_keluar: { page: 1, x: 122, y: 217.6, size: 7, maxWidth: 450, maxLines: 2, lineHeight: 8 },
  pekerjaan_1_pemberi_referensi: { page: 1, x: 122, y: 196.7, size: 8, maxWidth: 200, maxLines: 1 },
  pekerjaan_1_telepon_referensi: { page: 1, x: 361, y: 196.7, size: 8 },

  // PAGE 2 - SECTION H: MINAT TERHADAP PEKERJAAN (Q1-3 are on page 2)
  // Each question has ~20-21pt of clearance before the next one; wrap+shrink
  // instead of letting a long answer bleed into the row below.
  minat_sumber_lowongan: { page: 1, x: 24, y: 158, size: 7, maxWidth: 520, maxLines: 2, lineHeight: 8 },
  minat_tujuan_melamar: { page: 1, x: 24, y: 137, size: 7, maxWidth: 520, maxLines: 2, lineHeight: 8 },
  minat_tahu_perusahaan: { page: 1, x: 24, y: 116, size: 7, maxWidth: 520, maxLines: 2, lineHeight: 8 },
  minat_pernah_melamar: { page: 1, x: 24, y: 95, size: 7, maxWidth: 520, maxLines: 2, lineHeight: 8 },
  minat_bersedia_luar_kota: { page: 1, x: 24, y: 75, size: 7, maxWidth: 520, maxLines: 2, lineHeight: 8 },
  minat_bersedia_dinas_luar: { page: 1, x: 32, y: 54, size: 7, maxWidth: 512, maxLines: 2, lineHeight: 8 },
  minat_bidang_dikuasai: { page: 1, x: 24, y: 33, size: 7, maxWidth: 520, maxLines: 2, lineHeight: 8 },

  // PAGE 3 - SECTION H continued (Q7-10)
  minat_melamar_lain: { page: 2, x: 24, y: 763, size: 7, maxWidth: 520, maxLines: 2, lineHeight: 8 },
  minat_mulai_bekerja: { page: 2, x: 24, y: 742, size: 7, maxWidth: 520, maxLines: 2, lineHeight: 8 },
  minat_gaji_diharapkan: { page: 2, x: 24, y: 711, size: 7, maxWidth: 520, maxLines: 3, lineHeight: 8 },
  minat_kenal_karyawan: { page: 2, x: 24, y: 680, size: 7, maxWidth: 520, maxLines: 3, lineHeight: 8 },

  // PAGE 3 - SECTION I: LAIN-LAIN
  waktu_luang: { page: 2, x: 24, y: 562, size: 7, maxWidth: 520, maxLines: 10, lineHeight: 8 },
  strong_point: { page: 2, x: 24, y: 413, size: 7, maxWidth: 520, maxLines: 6, lineHeight: 8 },
  weak_point: { page: 2, x: 24, y: 361, size: 7, maxWidth: 520, maxLines: 6, lineHeight: 8 },
  rencana_5_tahun: { page: 2, x: 24, y: 309, size: 7, maxWidth: 520, maxLines: 10, lineHeight: 8 },

  // PAGE 3 - PENUTUP
  tempat_ttd: { page: 2, x: 430, y: 219.3, size: 8 },
  signature_name: { page: 2, x: 470, y: 145, size: 9, align: 'center', boxX: 446, boxWidth: 110, bold: true },
};

const TABLE_LAYOUTS = {
  keluarga_inti: {
    page: 0,
    startY: 426.3,
    rowHeight: 10.45,
    maxRows: 11,
    maxLinesPerRow: 1,
    minSize: 4.25,
    columns: [
      { key: 'nama', x: 125.7, width: 95 },
      { key: 'lp', x: 226.5, width: 38 },
      { key: 'ttl_umur', x: 270.4, width: 62 },
      { key: 'pendidikan', x: 338.5, width: 80 },
      { key: 'pekerjaan', x: 423.5, width: 44 },
      { key: 'jenis_perusahaan', x: 476.6, width: 50 },
      { key: 'jabatan', x: 532.9, width: 55 },
    ],
  },
  keluarga_asal: {
    page: 0,
    startY: 280.9,
    rowHeight: 10.45,
    maxRows: 12,
    maxLinesPerRow: 1,
    minSize: 4.25,
    columns: [
      { key: 'nama', x: 125.7, width: 95 },
      { key: 'lp', x: 226.5, width: 38 },
      { key: 'ttl_umur', x: 270.4, width: 62 },
      { key: 'pendidikan', x: 338.5, width: 80 },
      { key: 'pekerjaan', x: 423.5, width: 44 },
      { key: 'jenis_perusahaan', x: 476.6, width: 50 },
      { key: 'jabatan', x: 532.9, width: 55 },
    ],
  },
  bahasa: {
    page: 1,
    startY: 717.0,
    rowHeight: 10.45,
    maxRows: 5,
    // Rows 0-2 (Indonesia/Inggris/Mandarin) already have their language name
    // pre-printed on the template, so skip the 'bahasa' column for those rows
    // to avoid drawing overlapping text on top of it.
    columns: [
      { key: 'bahasa', x: 22.9, width: 95, skipRows: [0, 1, 2] },
      { key: 'bicara', x: 133, width: 95 },
      { key: 'membaca', x: 294, width: 95 },
      { key: 'menulis', x: 461, width: 95 },
    ],
  },
  referensi: {
    page: 2,
    startY: 637.2,
    rowHeight: 10.45,
    maxRows: 4,
    columns: [
      { key: 'nama', x: 63, width: 90 },
      { key: 'perusahaan', x: 166, width: 115 },
      { key: 'alamat', x: 295, width: 95 },
      { key: 'telepon', x: 398, width: 95 },
      { key: 'hubungan', x: 505, width: 90 },
    ],
  },
  aktivitas_sosial: {
    page: 2,
    startY: 501.5,
    rowHeight: 10.45,
    maxRows: 5,
    columns: [
      { key: 'nama_organisasi', x: 59, width: 110 },
      { key: 'tempat', x: 213, width: 95 },
      { key: 'jabatan', x: 370, width: 95 },
      { key: 'tahun', x: 511, width: 60 },
    ],
  },
};

function formatValue(value) {
  if (value === null || value === undefined || value === '') return '';
  if (typeof value === 'boolean') return value ? 'Ya' : 'Tidak';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value).substring(0, 300);
}

// Breaks a single word wider than `maxWidth` into character chunks that each fit.
// Needed for text pasted without spaces (e.g. "Mengelolaoperasionalmarketplace...").
function breakLongWord(word, font, size, maxWidth) {
  const chunks = [];
  let current = '';
  for (const ch of word) {
    const candidate = current + ch;
    if (current && font.widthOfTextAtSize(candidate, size) > maxWidth) {
      chunks.push(current);
      current = ch;
    } else {
      current = candidate;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

// Greedy word-wrap: splits `text` into lines that each fit within `maxWidth` at `size`.
// Words longer than `maxWidth` on their own are hard-broken so they still wrap.
function wrapLines(text, font, size, maxWidth) {
  const words = text.split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const lines = [];
  let current = '';
  words.forEach((word) => {
    const wordChunks = font.widthOfTextAtSize(word, size) > maxWidth
      ? breakLongWord(word, font, size, maxWidth)
      : [word];
    wordChunks.forEach((chunk) => {
      const candidate = current ? `${current} ${chunk}` : chunk;
      if (current && font.widthOfTextAtSize(candidate, size) > maxWidth) {
        lines.push(current);
        current = chunk;
      } else {
        current = candidate;
      }
    });
  });
  if (current) lines.push(current);
  return lines;
}

/**
 * Draws `text` inside a bounded box, wrapping onto multiple lines and shrinking
 * the font size as needed so it never overflows into the next section/row.
 * - coord.maxWidth: box width in pt (defaults to no wrap, single line, as before)
 * - coord.maxLines: how many lines are available before the next section (defaults to 1)
 * - coord.lineHeight: vertical spacing between lines (defaults to size * 1.15)
 */
function drawAt(page, text, coord, font, boldFont) {
  if (!text) return;
  const value = formatValue(text);
  let size = coord.size || 8;
  const useFont = coord.bold && boldFont ? boldFont : font;

  if (!coord.maxWidth) {
    let x = coord.x;
    if (coord.align === 'center' && coord.boxWidth) {
      const textWidth = useFont.widthOfTextAtSize(value, size);
      x = coord.boxX + (coord.boxWidth - textWidth) / 2;
    }
    page.drawText(value, {
      x,
      y: coord.y,
      size,
      font: useFont,
      color: rgb(0, 0, 0),
    });
    return;
  }

  const maxLines = coord.maxLines || 1;
  const minSize = coord.minSize || 6;
  let lines = wrapLines(value, useFont, size, coord.maxWidth);
  while (lines.length > maxLines && size > minSize) {
    size -= 0.5;
    lines = wrapLines(value, useFont, size, coord.maxWidth);
  }
  if (lines.length > maxLines) {
    lines = lines.slice(0, maxLines);
    const last = lines[maxLines - 1];
    let truncated = last;
    while (truncated.length > 1 && useFont.widthOfTextAtSize(`${truncated}…`, size) > coord.maxWidth) {
      truncated = truncated.slice(0, -1);
    }
    lines[maxLines - 1] = `${truncated}…`;
  }

  const lineHeight = coord.lineHeight || size * 1.15;
  lines.forEach((line, i) => {
    page.drawText(line, {
      x: coord.x,
      y: coord.y - i * lineHeight,
      size,
      font: useFont,
      color: rgb(0, 0, 0),
    });
  });
}

/**
 * These template labels print both choices as static text (e.g. "Ya / Tidak").
 * Instead of writing the answer on top of the label (which overlaps the printed text),
 * draw a strikethrough line over the choice that was NOT selected, like a hand-marked form.
 */
const STRIKETHROUGH_CHOICES = {
  status_perkawinan: {
    page: 0,
    y: 467.7,
    choices: {
      Menikah: { x: 123.98, width: 28.25 },
      'Belum Menikah': { x: 158.47, width: 51.52 },
    },
  },
  sakit_lama: {
    page: 0,
    y: 543.8,
    choices: {
      Ya: { x: 189.45, width: 7.7 },
      Tidak: { x: 202.42, width: 17.36 },
    },
  },
  kecelakaan_berat: {
    page: 0,
    y: 512.5,
    choices: {
      Ya: { x: 186.43, width: 7.7 },
      Tidak: { x: 199.4, width: 17.36 },
    },
  },
};

function drawStrikethroughChoices(pages, data) {
  Object.entries(STRIKETHROUGH_CHOICES).forEach(([field, config]) => {
    const selected = data[field];
    const page = pages[config.page];
    if (!page || !selected || !config.choices[selected]) return;
    Object.entries(config.choices).forEach(([choice, box]) => {
      if (choice === selected) return;
      page.drawLine({
        start: { x: box.x - 1, y: config.y + 2.8 },
        end: { x: box.x + box.width + 1, y: config.y + 2.8 },
        thickness: 0.8,
        color: rgb(0, 0, 0),
      });
    });
  });
}

function flattenArrayFields(data) {
  const flat = { ...data };
  (data.pendidikan || []).slice(0, 2).forEach((entry, i) => {
    flat[`pendidikan_${i}_jenjang`] = entry.jenjang;
    flat[`pendidikan_${i}_sekolah`] = entry.sekolah;
    flat[`pendidikan_${i}_lokasi`] = entry.lokasi;
    flat[`pendidikan_${i}_jurusan`] = entry.jurusan;
    flat[`pendidikan_${i}_tahun`] = entry.tahun_mulai || entry.tahun_selesai
      ? `${entry.tahun_mulai || ''} - ${entry.tahun_selesai || ''}`
      : '';
    flat[`pendidikan_${i}_no_ijazah`] = entry.no_ijazah;
    flat[`pendidikan_${i}_nem_ipk`] = entry.nem_ipk;
  });
  (data.pekerjaan || []).slice(0, 2).forEach((entry, i) => {
    flat[`pekerjaan_${i}_jenis_perusahaan`] = entry.jenis_perusahaan;
    flat[`pekerjaan_${i}_nama_perusahaan`] = entry.nama_perusahaan;
    flat[`pekerjaan_${i}_lokasi`] = entry.lokasi;
    flat[`pekerjaan_${i}_jabatan`] = entry.jabatan;
    flat[`pekerjaan_${i}_tgl_masuk`] = entry.tgl_masuk;
    flat[`pekerjaan_${i}_tgl_keluar`] = entry.tgl_keluar;
    flat[`pekerjaan_${i}_uraian`] = entry.uraian;
    flat[`pekerjaan_${i}_gaji_terakhir`] = entry.gaji_terakhir;
    flat[`pekerjaan_${i}_tunjangan`] = entry.tunjangan;
    flat[`pekerjaan_${i}_fasilitas`] = entry.fasilitas;
    flat[`pekerjaan_${i}_alasan_keluar`] = entry.alasan_keluar;
    flat[`pekerjaan_${i}_pemberi_referensi`] = entry.pemberi_referensi;
    flat[`pekerjaan_${i}_telepon_referensi`] = entry.telepon_referensi;
  });
  return flat;
}

// Wraps `value` to fit `col.width`, capped at `maxLines` lines with the last
// line truncated + "…" if it doesn't fit — never returns more than `maxLines`.
function wrapCell(value, font, size, width, maxLines) {
  let lines = wrapLines(value, font, size, width);
  if (lines.length > maxLines) {
    lines = lines.slice(0, maxLines);
    const last = lines[maxLines - 1];
    let truncated = last;
    while (truncated.length > 1 && font.widthOfTextAtSize(`${truncated}…`, size) > width) {
      truncated = truncated.slice(0, -1);
    }
    lines[maxLines - 1] = `${truncated}…`;
  }
  return lines;
}

/**
 * Draws a table whose rows sit on the fixed grid lines printed on the template
 * (rowHeight apart). Each cell shrinks its font size (down to `minSize`) to try
 * to fit on one line first — this table's rows are only ~10.4pt tall, so a second
 * wrapped line would visually collide with the row below rather than sit cleanly
 * inside the row band. Only once shrinking bottoms out does it fall back to
 * wrapping up to `maxLinesPerRow` lines and truncating with "…".
 */
function drawTable(pages, font, layoutKey, rows) {
  const layout = TABLE_LAYOUTS[layoutKey];
  if (!layout || !Array.isArray(rows) || !rows.length) return;
  const page = pages[layout.page];
  if (!page) return;

  const baseSize = 7;
  const minSize = layout.minSize || 5.5;
  const maxLinesPerRow = layout.maxLinesPerRow || 2;

  rows.slice(0, layout.maxRows).forEach((row, i) => {
    const y = layout.startY - i * layout.rowHeight;
    layout.columns.forEach((col) => {
      if (col.skipRows?.includes(i)) return;
      const value = formatValue(row[col.key]);
      if (!value) return;

      let size = baseSize;
      while (size > minSize && font.widthOfTextAtSize(value, size) > col.width) {
        size -= 0.5;
      }
      const lineHeight = Math.min(size * 1.05, layout.rowHeight / maxLinesPerRow - 0.5);
      const lines = wrapCell(value, font, size, col.width, maxLinesPerRow);
      lines.forEach((line, lineIdx) => {
        page.drawText(line, {
          x: col.x,
          y: y - lineIdx * lineHeight,
          size,
          font,
          color: rgb(0, 0, 0),
        });
      });
    });
  });
}

async function fillPdf(applicationData) {
  const templatePath = path.join(__dirname, '../../templates/Form_Job_Application.pdf');

  if (!fs.existsSync(templatePath)) {
    throw new Error('PDF template tidak ditemukan di backend/templates/Form_Job_Application.pdf');
  }

  const bytes = fs.readFileSync(templatePath);
  const pdf = await PDFDocument.load(bytes);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  const pages = pdf.getPages();

  const flatData = flattenArrayFields(applicationData);

  flatData.signature_name = applicationData.nama_lengkap;

  // "Tempat / Tanggal Lahir" is a single label on the template, so combine
  // them into one "Sidoarjo, 05/06/2003" value instead of two separate fields.
  if (flatData.tanggal_lahir) {
    const dobObj = flatData.tanggal_lahir instanceof Date
      ? flatData.tanggal_lahir
      : new Date(flatData.tanggal_lahir);
    if (!Number.isNaN(dobObj.getTime())) {
      const day = String(dobObj.getUTCDate()).padStart(2, '0');
      const month = String(dobObj.getUTCMonth() + 1).padStart(2, '0');
      const year = dobObj.getUTCFullYear();
      flatData.ttl = flatData.tempat_lahir
        ? `${flatData.tempat_lahir}, ${day}/${month}/${year}`
        : `${day}/${month}/${year}`;
    } else {
      flatData.ttl = flatData.tempat_lahir || '';
    }
  } else {
    flatData.ttl = flatData.tempat_lahir || '';
  }

  const JENIS_KELAMIN_LABELS = { L: 'Laki-laki', P: 'Perempuan' };
  if (flatData.jenis_kelamin) {
    flatData.jenis_kelamin = JENIS_KELAMIN_LABELS[flatData.jenis_kelamin] || flatData.jenis_kelamin;
  }
  if (flatData.darurat_telepon) {
    flatData.darurat_hubungan = flatData.darurat_hubungan
      ? `${flatData.darurat_hubungan} / ${flatData.darurat_telepon}`
      : flatData.darurat_telepon;
  }

  Object.entries(PDF_COORDS).forEach(([key, coord]) => {
    const page = pages[coord.page];
    if (page && flatData[key] !== undefined) {
      drawAt(page, flatData[key], coord, font, boldFont);
    }
  });

  drawStrikethroughChoices(pages, flatData);

  // Tanggal TTD ("Tempat, dd / mm / 20yy") is split across fixed slash positions on page 3.
  if (applicationData.tanggal_ttd) {
    const dateValue = applicationData.tanggal_ttd;
    const dateObj = dateValue instanceof Date ? dateValue : new Date(dateValue);
    const page = pages[2];
    if (page && !Number.isNaN(dateObj.getTime())) {
      const day = String(dateObj.getUTCDate()).padStart(2, '0');
      const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
      const year = String(dateObj.getUTCFullYear()).slice(2);
      page.drawText(day, { x: 487, y: 219.3, size: 8, font, color: rgb(0, 0, 0) });
      page.drawText(month, { x: 503, y: 219.3, size: 8, font, color: rgb(0, 0, 0) });
      page.drawText(year, { x: 529, y: 219.3, size: 8, font, color: rgb(0, 0, 0) });
    }
  }

  if (applicationData.ttd_path) {
    const sigPath = path.join(__dirname, '../..', applicationData.ttd_path.replace(/^\//, ''));
    if (fs.existsSync(sigPath)) {
      const sigBytes = fs.readFileSync(sigPath);
      const sigImage = await pdf.embedPng(sigBytes);
      const sigDims = sigImage.scaleToFit(105, 50);
      const sigBoxX = 446;
      const sigBoxWidth = 110;
      pages[2].drawImage(sigImage, {
        x: sigBoxX + (sigBoxWidth - sigDims.width) / 2,
        y: 160,
        width: sigDims.width,
        height: sigDims.height,
      });
    }
  }

  drawTable(pages, font, 'keluarga_inti', applicationData.keluarga_inti);
  drawTable(pages, font, 'keluarga_asal', applicationData.keluarga_asal);
  drawTable(pages, font, 'bahasa', applicationData.bahasa);
  drawTable(pages, font, 'referensi', applicationData.referensi);
  drawTable(pages, font, 'aktivitas_sosial', applicationData.aktivitas_sosial);

  return pdf.save();
}

module.exports = {
  fillPdf,
  PDF_COORDS,
  TABLE_LAYOUTS,
};
