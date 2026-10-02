-- ==========================================
-- 1. TABEL MENTOR / GURU
-- ==========================================
create table mentor (
  id uuid primary key default gen_random_uuid(),
  nama_mentor text not null,
  no_hp text not null,
  alamat text,
  foto_url text, -- URL file foto dari Supabase Storage
  honor_per_jam numeric not null default 0, -- Tarif dasar individu per jam
  tanggal_bergabung date not null default current_date,
  status text not null default 'aktif', -- Pilihan: 'aktif', 'non_aktif'
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- ==========================================
-- 2. TABEL MASTER PAKET BELAJAR
-- ==========================================
create table paket_belajar (
  id uuid primary key default gen_random_uuid(),
  nama_paket text not null, -- Contoh: 'Baca AHE', 'Berhitung ASE', 'Matematika', dll.
  kategori text not null,   -- Contoh: 'baca', 'berhitung', 'mapel'
  deskripsi text,
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- ==========================================
-- 3. TABEL DATA SISWA
-- ==========================================
create table siswa (
  id uuid primary key default gen_random_uuid(),
  nama_murid text not null,
  nama_orang_tua text not null,
  no_hp text not null,
  alamat text,
  jenjang_sekolah text, -- Contoh: 'TK', 'SD Kelas 1', 'SMP Kelas 7'
  status text not null default 'aktif', -- Pilihan: 'aktif', 'non_aktif'
  tanggal_daftar timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- ==========================================
-- 4. TABEL PERIODE BELAJAR (KUOTA 12 PERTEMUAN)
-- ==========================================
create table periode_belajar (
  id uuid primary key default gen_random_uuid(),
  siswa_id uuid not null references siswa(id) on delete cascade,
  paket_id uuid not null references paket_belajar(id) on delete cascade,
  mentor_id uuid references mentor(id) on delete set null,
  bulan_periode text not null, -- Format YYYY-MM
  total_pertemuan integer not null default 12,
  status_periode text not null default 'berjalan', -- Pilihan: 'berjalan', 'selesai'
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- ==========================================
-- 5. TABEL PRESENSI SISWA (CENTANG KEHADIRAN)
-- ==========================================
create table presensi_siswa (
  id uuid primary key default gen_random_uuid(),
  periode_id uuid not null references periode_belajar(id) on delete cascade,
  pertemuan_ke integer not null, -- Pertemuan ke 1 s/d 12 (termasuk kelas pengganti)
  tanggal_pertemuan date not null default current_date,
  is_hadir boolean not null default true, -- Centang kehadiran oleh mentor
  is_kelas_pengganti boolean not null default false, -- Tandai jika kelas pengganti akibat izin
  jurnal_materi text, -- Catatan materi/kegiatan pembelajaran
  mentor_id uuid references mentor(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- ==========================================
-- 6. TABEL PERIZINAN SISWA (DIISI ORANG TUA)
-- ==========================================
create table perizinan_siswa (
  id uuid primary key default gen_random_uuid(),
  siswa_id uuid not null references siswa(id) on delete cascade,
  periode_id uuid not null references periode_belajar(id) on delete cascade,
  tanggal_izin date not null,
  alasan text not null,
  status_izin text not null default 'pending', -- Pilihan: 'pending', 'disetujui', 'ditolak'
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- ==========================================
-- 7. TABEL PEMBAYARAN SISWA (RINCIAN BIAYA KUSTOM)
-- ==========================================
create table pembayaran_siswa (
  id uuid primary key default gen_random_uuid(),
  siswa_id uuid not null references siswa(id) on delete cascade,
  periode_id uuid references periode_belajar(id) on delete cascade,
  biaya_pendaftaran numeric default 0,
  biaya_buku numeric default 0,
  biaya_paket_belajar numeric default 0, -- Nominal paket 12 pertemuan (kustom)
  total_bayar numeric generated always as (biaya_pendaftaran + biaya_buku + biaya_paket_belajar) stored,
  tanggal_pembayaran timestamp with time zone default timezone('utc'::text, now()),
  metode_pembayaran text, -- Contoh: 'tunai', 'transfer'
  status_pembayaran text not null default 'lunas', -- Pilihan: 'lunas', 'pending'
  catatan text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- ==========================================
-- 8. TABEL MASTER INVENTARIS LOGISTIK
-- ==========================================
create table inventaris_logistik (
  id uuid primary key default gen_random_uuid(),
  nama_barang text not null, -- Contoh: 'Buku Modul Baca AHE Level 1', 'Kartu Tanda Siswa', 'Pensil ErHa'
  kategori text not null,   -- Pilihan: 'buku', 'kartu', 'atk'
  stok integer not null default 0 check (stok >= 0),
  harga_satuan numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- ==========================================
-- 9. TABEL TRANSAKSI LOGISTIK (MASUK & KELUAR)
-- ==========================================
create table transaksi_logistik (
  id uuid primary key default gen_random_uuid(),
  barang_id uuid not null references inventaris_logistik(id) on delete cascade,
  siswa_id uuid references siswa(id) on delete set null,
  tipe_transaksi text not null, -- Pilihan: 'masuk', 'keluar'
  jumlah integer not null check (jumlah > 0),
  keterangan text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- ==========================================
-- 10. TABEL PRESENSI HARIAN MENTOR (TOTAL JAM MANUAL)
-- ==========================================
create table presensi_mentor (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references mentor(id) on delete cascade,
  tanggal date not null default current_date,
  jam_masuk time not null,
  jam_selesai time not null,
  total_jam numeric not null default 0, -- Input manual jumlah jam mengajar
  kegiatan_pembelajaran text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- ==========================================
-- 11. TABEL PENGGAJIAN MENTOR
-- ==========================================
create table penggajian_mentor (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references mentor(id) on delete cascade,
  bulan_periode text not null, -- Format YYYY-MM
  total_jam_mengajar numeric not null default 0,
  honor_per_jam numeric not null default 0,      -- Snapshot tarif dasar mentor
  gaji_pokok numeric generated always as (total_jam_mengajar * honor_per_jam) stored,
  insentif numeric not null default 0,            -- Tambahan insentif kustom
  bonus_kinerja numeric not null default 0,       -- Bonus penilaian kinerja
  total_gaji numeric generated always as ((total_jam_mengajar * honor_per_jam) + insentif + bonus_kinerja) stored,
  status_pembayaran text not null default 'draft', -- Pilihan: 'draft', 'dibayar'
  tanggal_pembayaran timestamp with time zone,
  catatan text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- ==========================================
-- 12. TABEL PENGUMUMAN & PEMBERITAHUAN
-- ==========================================
create table pengumuman (
  id uuid primary key default gen_random_uuid(),
  judul text not null,
  konten text not null,
  target_audience text not null default 'semua', -- Pilihan: 'semua', 'siswa', 'mentor'
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- ==========================================
-- SEED DATA AWAL PAKET BELAJAR
-- ==========================================
insert into paket_belajar (nama_paket, kategori) values
  ('Baca AHE', 'baca'),
  ('Berhitung ASE', 'berhitung'),
  ('Matematika', 'mapel'),
  ('Bahasa Inggris', 'mapel'),
  ('IPAS', 'mapel'),
  ('Agama', 'mapel'),
  ('Bahasa Indonesia', 'mapel'),
  ('Bahasa Jawa', 'mapel');
