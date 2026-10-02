import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Inisialisasi Supabase Client
const supabaseUrl = 'https://izifwpviqpyxauafdlge.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6aWZ3cHZpcXB5eGF1YWZkbGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NDA2ODYsImV4cCI6MjEwNjUxNjY4Nn0.XpJEgQ3vpGOYmPVi-nsjrSRJI9RfR5kWTN_XsL-TCUU';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [activeTab, setActiveTab] = useState('pendaftaran');
  const [adminTab, setAdminTab] = useState('siswa'); 
  const [userRole, setUserRole] = useState('guru'); 
  const [currentMentorProfile, setCurrentMentorProfile] = useState(null);

  const [paketList, setPaketList] = useState([]);
  const [selectedPaket, setSelectedPaket] = useState([]);
  const [loading, setLoading] = useState(false);

  // Auth State
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Master Data Supabase
  const [daftarSiswa, setDaftarSiswa] = useState([]);
  const [daftarMentor, setDaftarMentor] = useState([]);
  const [daftarPeriode, setDaftarPeriode] = useState([]);
  const [daftarPresensiSiswa, setDaftarPresensiSiswa] = useState([]);
  const [daftarPerizinan, setDaftarPerizinan] = useState([]);
  const [daftarPembayaran, setDaftarPembayaran] = useState([]);
  const [daftarPresensiMentor, setDaftarPresensiMentor] = useState([]);
  const [daftarPenggajian, setDaftarPenggajian] = useState([]);
  const [daftarInventaris, setDaftarInventaris] = useState([]);

  // Form State Admin: Mentor Baru
  const [newMentor, setNewMentor] = useState({
    nama_mentor: '',
    email: '',
    password: '',
    no_hp: '',
    alamat: '',
    honor_per_jam: 25000,
    akses_inventaris: false,
    akses_perizinan: false,
    status: 'aktif'
  });

  // Form State Admin: Penggajian Kustom
  const [gajiForm, setGajiForm] = useState({
    mentor_id: '',
    bulan_periode: new Date().toISOString().slice(0, 7),
    insentif: 0,
    bonus_kinerja: 0
  });

  // Form Presensi Guru (Diperbarui dengan Opsi Status Disiplin Kuota)
  const [newPresensiSiswa, setNewPresensiSiswa] = useState({
    periode_id: '',
    mentor_id: '',
    pertemuan_ke: 1,
    tanggal_pertemuan: new Date().toISOString().split('T')[0],
    status_kehadiran: 'Hadir', // 'Hadir', 'Izin', 'Alpha', 'Kelas Pengganti'
    jurnal_materi: ''
  });

  const [selectedSiswaIdFilter, setSelectedSiswaIdFilter] = useState('all');
  const [newBarang, setNewBarang] = useState({ nama_barang: '', kategori: 'buku', stok: 10, harga_satuan: 15000 });
  
  const [formDaftar, setFormDaftar] = useState({
    nama_murid: '',
    nama_orang_tua: '',
    no_hp: '',
    alamat: '',
    jenjang_sekolah: 'TK',
  });

  const [formIzin, setFormIzin] = useState({
    siswa_id: '',
    tanggal_izin: new Date().toISOString().split('T')[0],
    alasan: '',
  });

  // Load Initial Session & Data
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        determineUserRoleAndProfile(session.user);
      }
      fetchAllData();
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        determineUserRoleAndProfile(session.user);
      } else {
        setUserRole('guru');
        setCurrentMentorProfile(null);
      }
      fetchAllData();
    });

    fetchPaket();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function determineUserRoleAndProfile(authUser) {
    if (authUser.email?.includes('admin')) {
      setUserRole('admin');
      setCurrentMentorProfile(null);
    } else {
      setUserRole('guru');
      const { data: mData } = await supabase.from('mentor').select('*').eq('email', authUser.email).single();
      if (mData) {
        setCurrentMentorProfile(mData);
        setNewPresensiSiswa(prev => ({ ...prev, mentor_id: mData.id }));
      }
    }
  }

  async function fetchPaket() {
    const { data } = await supabase.from('paket_belajar').select('*').order('created_at', { ascending: true });
    if (data) setPaketList(data);
  }

  async function fetchAllData() {
    const { data: siswa } = await supabase.from('siswa').select('*').order('created_at', { ascending: false });
    const { data: mentor } = await supabase.from('mentor').select('*').order('created_at', { ascending: false });
    const { data: periode } = await supabase.from('periode_belajar').select('*, siswa(nama_murid, status), paket_belajar(nama_paket)').order('created_at', { ascending: false });
    const { data: presensiS } = await supabase.from('presensi_siswa').select('*, mentor(nama_mentor), periode_belajar(siswa(nama_murid, siswa_id), paket_belajar(nama_paket))').order('tanggal_pertemuan', { ascending: false });
    const { data: izin } = await supabase.from('perizinan_siswa').select('*, siswa(nama_murid)').order('created_at', { ascending: false });
    const { data: pemb } = await supabase.from('pembayaran_siswa').select('*').order('created_at', { ascending: false });
    const { data: presensiM } = await supabase.from('presensi_mentor').select('*, mentor(nama_mentor)').order('tanggal', { ascending: false });
    const { data: gaji } = await supabase.from('penggajian_mentor').select('*, mentor(nama_mentor, honor_per_jam)').order('created_at', { ascending: false });
    const { data: logistik } = await supabase.from('inventaris_logistik').select('*').order('nama_barang', { ascending: true });

    if (siswa) setDaftarSiswa(siswa);
    if (mentor) setDaftarMentor(mentor);
    if (periode) setDaftarPeriode(periode);
    if (presensiS) setDaftarPresensiSiswa(presensiS);
    if (izin) setDaftarPerizinan(izin);
    if (pemb) setDaftarPembayaran(pemb);
    if (presensiM) setDaftarPresensiMentor(presensiM);
    if (gaji) setDaftarPenggajian(gaji);
    if (logistik) setDaftarInventaris(logistik);
  }

  // Auth Action
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) {
      setLoginError('Login gagal: ' + error.message);
    } else {
      setShowLoginModal(false);
      determineUserRoleAndProfile(data.user);
      setLoginEmail('');
      setLoginPassword('');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserRole('guru');
    setCurrentMentorProfile(null);
  };

  // 1. MANAJEMEN MENTOR (CRUD)
  const handleTambahMentor = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await supabase.auth.signUp({ email: newMentor.email, password: newMentor.password });
      const { error: errDb } = await supabase.from('mentor').insert([{
        nama_mentor: newMentor.nama_mentor,
        email: newMentor.email,
        no_hp: newMentor.no_hp,
        alamat: newMentor.alamat,
        honor_per_jam: newMentor.honor_per_jam,
        akses_inventaris: newMentor.akses_inventaris,
        akses_perizinan: newMentor.akses_perizinan,
        status: newMentor.status
      }]);

      if (errDb) throw errDb;

      alert('✅ Mentor baru berhasil didaftarkan!');
      setNewMentor({
        nama_mentor: '', email: '', password: '', no_hp: '', alamat: '',
        honor_per_jam: 25000, akses_inventaris: false, akses_perizinan: false, status: 'aktif'
      });
      fetchAllData();
    } catch (err) {
      alert('Gagal menambah mentor: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. CRUD GAJI
  const handleSimpanGaji = async (e) => {
    e.preventDefault();
    if (!gajiForm.mentor_id) { alert('Pilih mentor!'); return; }

    const mentorRec = daftarMentor.find(m => m.id === gajiForm.mentor_id);
    const totalJam = daftarPresensiMentor
      .filter(pm => pm.mentor_id === gajiForm.mentor_id && pm.tanggal.startsWith(gajiForm.bulan_periode))
      .reduce((acc, curr) => acc + (Number(curr.total_jam) || 0), 0);

    const honorJam = mentorRec?.honor_per_jam || 25000;

    await supabase.from('penggajian_mentor').insert([{
      mentor_id: gajiForm.mentor_id,
      bulan_periode: gajiForm.bulan_periode,
      total_jam_mengajar: totalJam,
      honor_per_jam: honorJam,
      insentif: gajiForm.insentif,
      bonus_kinerja: gajiForm.bonus_kinerja,
      status_pembayaran: 'draft'
    }]);

    alert('✅ Rekap gaji bulan ini berhasil dibuat!');
    fetchAllData();
  };

  const handleBayarGaji = async (gajiId) => {
    await supabase.from('penggajian_mentor').update({
      status_pembayaran: 'dibayar',
      tanggal_pembayaran: new Date().toISOString()
    }).eq('id', gajiId);
    fetchAllData();
  };

  // 3. ADMIN: APPROVAL SISWA & PEMBAYARAN
  const handleUpdateStatusSiswa = async (siswaId, status) => {
    await supabase.from('siswa').update({ status }).eq('id', siswaId);
    fetchAllData();
  };

  const handleUpdatePembayaran = async (periodeId, siswaId, status_pembayaran) => {
    const tglBayar = status_pembayaran === 'Lunas' ? new Date().toISOString() : null;
    const existing = daftarPembayaran.find(p => p.periode_id === periodeId);
    
    if (existing) {
      await supabase.from('pembayaran_siswa').update({ status_pembayaran, tanggal_pembayaran: tglBayar }).eq('id', existing.id);
    } else {
      await supabase.from('pembayaran_siswa').insert([{
        siswa_id: siswaId,
        periode_id: periodeId,
        status_pembayaran,
        tanggal_pembayaran: tglBayar,
        biaya_paket_belajar: 150000
      }]);
    }
    fetchAllData();
  };

  // 4. ADMIN / GURU BERWENANG: PERIZINAN
  const handleUpdateStatusIzin = async (izinId, status_izin) => {
    await supabase.from('perizinan_siswa').update({ status_izin }).eq('id', izinId);
    fetchAllData();
  };

  // GURU: TAMBAH PRESENSI SISWA (ATURAN KUOTA PERTEMUAN)
  const handleTambahPresensiSiswa = async (e) => {
    e.preventDefault();
    if (!newPresensiSiswa.periode_id) { alert('Pilih nama murid dan paket!'); return; }
    if (!newPresensiSiswa.mentor_id) { alert('Pilih nama guru yang mengajar!'); return; }

    // Simpan data presensi dengan status kehadiran disiplin (Hadir / Izin / Alpha / Kelas Pengganti)
    await supabase.from('presensi_siswa').insert([{
      periode_id: newPresensiSiswa.periode_id,
      mentor_id: newPresensiSiswa.mentor_id,
      pertemuan_ke: newPresensiSiswa.pertemuan_ke,
      tanggal_pertemuan: newPresensiSiswa.tanggal_pertemuan,
      is_hadir: newPresensiSiswa.status_kehadiran === 'Hadir' || newPresensiSiswa.status_kehadiran === 'Kelas Pengganti',
      is_kelas_pengganti: newPresensiSiswa.status_kehadiran === 'Kelas Pengganti',
      jurnal_materi: `[${newPresensiSiswa.status_kehadiran}] ${newPresensiSiswa.jurnal_materi}`
    }]);

    alert('✅ Presensi berhasil dicatat! Kuota 12 pertemuan telah disesuaikan.');
    setNewPresensiSiswa(prev => ({ ...prev, jurnal_materi: '' }));
    fetchAllData();
  };

  // Submit Pendaftaran Public
  const handleDaftarSubmit = async (e) => {
    e.preventDefault();
    if (selectedPaket.length === 0) { alert('Pilih minimal satu paket!'); return; }
    setLoading(true);

    try {
      const { data: siswaData } = await supabase.from('siswa').insert([{ ...formDaftar, status: 'pending' }]).select();

      if (siswaData && siswaData[0]) {
        const siswaId = siswaData[0].id;
        const currentBulan = new Date().toISOString().slice(0, 7);

        const periodeInserts = selectedPaket.map(pId => ({
          siswa_id: siswaId,
          paket_id: pId,
          bulan_periode: currentBulan,
          total_pertemuan: 12,
          status_periode: 'berjalan'
        }));

        await supabase.from('periode_belajar').insert(periodeInserts);
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      alert('Pendaftaran Berhasil! Status saat ini [Pending]. Mengarahkan ke WhatsApp Admin...');
      const waText = `Halo Admin Bimbel ErHa,\nSaya ${formDaftar.nama_orang_tua} mendaftarkan ${formDaftar.nama_murid} (${formDaftar.jenjang_sekolah}). Mohon konfirmasi approval.`;
      window.open(`https://wa.me/6281915058297?text=${encodeURIComponent(waText)}`, '_blank');
    }
  };

  const handleIzinSubmit = async (e) => {
    e.preventDefault();
    if (!formIzin.siswa_id) { alert('Pilih nama murid!'); return; }
    setLoading(true);

    try {
      const { data: pData } = await supabase.from('periode_belajar').select('id').eq('siswa_id', formIzin.siswa_id).eq('status_periode', 'berjalan').limit(1);
      
      await supabase.from('perizinan_siswa').insert([{
        siswa_id: formIzin.siswa_id,
        periode_id: pData && pData[0] ? pData[0].id : null,
        tanggal_izin: formIzin.tanggal_izin,
        alasan: formIzin.alasan,
        status_izin: 'pending'
      }]);
      alert('Pengajuan izin berhasil dikirim! Harap konfirmasi sebelum sesi belajar dimulai.');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const periodeSiswaAktif = daftarPeriode.filter(p => p.siswa?.status === 'aktif');
  const filteredPresensiSiswa = selectedSiswaIdFilter === 'all' 
    ? daftarPresensiSiswa 
    : daftarPresensiSiswa.filter(ps => ps.periode_belajar?.siswa_id === selectedSiswaIdFilter);

  return (
    <div className="min-h-screen bg-[#FFFDF0] font-sans text-gray-800">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-[#581878] shadow-lg border-b-4 border-[#F59E0B]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-white rounded-xl p-1.5 shadow-md flex items-center justify-center">
              <span className="text-2xl font-black tracking-wider text-[#581878]">
                Er<span className="text-[#D95338]">Ha</span>
              </span>
            </div>
            <div>
              <h1 className="text-white font-extrabold text-lg leading-none">Bimbel ErHa</h1>
              <p className="text-[#F59E0B] font-bold text-xs">Rumah Hebat</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-xs bg-amber-400 text-purple-950 font-black px-3 py-1 rounded-full shadow uppercase">
                  {userRole === 'admin' ? '👑 Admin' : `👩‍🏫 Guru: ${currentMentorProfile?.nama_mentor || 'Mentor'}`}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-1.5 px-4 rounded-full text-sm transition shadow"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="bg-purple-900 hover:bg-purple-950 text-white font-bold py-1.5 px-4 rounded-full text-sm border border-purple-400 transition"
              >
                🔐 Login Portal (Admin/Guru)
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* DASHBOARD USER (GURU / ADMIN) */}
      {user ? (
        <div className="max-w-7xl mx-auto px-4 py-8">
          
          {/* ======================================================= */}
          {/* 👩‍🏫 PORTAL GURU (PRESENSI & KONTROL KUOTA 12 SESI)       */}
          {/* ======================================================= */}
          {userRole === 'guru' && (
            <div className="space-y-8">
              <div className="bg-gradient-to-r from-purple-800 to-indigo-900 text-white p-6 rounded-2xl shadow-md">
                <h2 className="text-2xl font-black">👩‍🏫 Portal Pengajar: {currentMentorProfile?.nama_mentor || 'Guru'}</h2>
                <p className="text-purple-200 text-sm mt-1">
                  Catat kehadiran, status kuota, dan jurnal materi sesi harian siswa.
                </p>
              </div>

              {/* FORM PRESENSI MURID */}
              <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-purple-200">
                <h3 className="text-lg font-extrabold text-[#581878] mb-4">📝 Form Presensi & Kuota Pertemuan (12 Sesi)</h3>
                <form onSubmit={handleTambahPresensiSiswa} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Guru Pengajar</label>
                    <select
                      required
                      value={newPresensiSiswa.mentor_id}
                      onChange={(e) => setNewPresensiSiswa({ ...newPresensiSiswa, mentor_id: e.target.value })}
                      className="w-full px-4 py-2.5 border rounded-xl outline-none bg-gray-100 font-bold text-sm text-purple-900"
                    >
                      <option value="">-- Pilih Guru --</option>
                      {daftarMentor.map(m => (
                        <option key={m.id} value={m.id}>{m.nama_mentor}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Pilih Murid Aktif</label>
                    <select
                      required
                      value={newPresensiSiswa.periode_id}
                      onChange={(e) => setNewPresensiSiswa({ ...newPresensiSiswa, periode_id: e.target.value })}
                      className="w-full px-4 py-2.5 border rounded-xl outline-none bg-white font-medium text-sm"
                    >
                      <option value="">-- Pilih Murid & Paket --</option>
                      {periodeSiswaAktif.map(p => {
                        const isLunas = daftarPembayaran.some(pb => pb.periode_id === p.id && pb.status_pembayaran === 'Lunas');
                        return (
                          <option key={p.id} value={p.id}>
                            {p.siswa?.nama_murid} - Paket: {p.paket_belajar?.nama_paket} ({isLunas ? '🟢 Lunas' : '🔴 Belum Lunas'})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Pertemuan Ke-</label>
                      <input
                        type="number" min="1" max="12" required
                        value={newPresensiSiswa.pertemuan_ke}
                        onChange={(e) => setNewPresensiSiswa({ ...newPresensiSiswa, pertemuan_ke: Number(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-xl text-sm font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Tanggal</label>
                      <input
                        type="date" required
                        value={newPresensiSiswa.tanggal_pertemuan}
                        onChange={(e) => setNewPresensiSiswa({ ...newPresensiSiswa, tanggal_pertemuan: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Status Kehadiran / Disiplin Kuota</label>
                    <select
                      value={newPresensiSiswa.status_kehadiran}
                      onChange={(e) => setNewPresensiSiswa({ ...newPresensiSiswa, status_kehadiran: e.target.value })}
                      className="w-full px-4 py-2.5 border rounded-xl outline-none bg-white font-bold text-sm text-purple-900"
                    >
                      <option value="Hadir">✅ Hadir (Sesi Normal)</option>
                      <option value="Izin">📩 Izin Dikonfirmasi (Make-up Class)</option>
                      <option value="Alpha">❌ Alpha / Mangkir (Kuota Hangus)</option>
                      <option value="Kelas Pengganti">🔄 Kelas Pengganti (Make-up Selesai)</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Jurnal / Catatan Pembelajaran</label>
                    <input
                      type="text" placeholder="Contoh: Menguasai AHE Hal 10-15"
                      value={newPresensiSiswa.jurnal_materi}
                      onChange={(e) => setNewPresensiSiswa({ ...newPresensiSiswa, jurnal_materi: e.target.value })}
                      className="w-full px-4 py-2 border rounded-xl text-sm"
                    />
                  </div>

                  <button type="submit" className="md:col-span-3 bg-[#581878] hover:bg-purple-900 text-white font-extrabold py-3 rounded-xl shadow mt-2">
                    Simpan Presensi Sesi 🚀
                  </button>
                </form>
              </div>

              {/* JIKA GURU DIBERI HAK AKSES TAMBAHAN: INVENTARIS / PERIZINAN */}
              {currentMentorProfile?.akses_inventaris && (
                <div className="bg-emerald-50 rounded-2xl p-6 border-2 border-emerald-300">
                  <h3 className="text-lg font-extrabold text-emerald-900 mb-2">📚 Delegasi: Kelola Stok Inventaris Modul</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {daftarInventaris.map(b => (
                      <div key={b.id} className="bg-white p-4 rounded-xl shadow border flex justify-between items-center">
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{b.nama_barang}</p>
                          <p className="text-xs text-emerald-600 font-black mt-1">Stok: {b.stok} Unit</p>
                        </div>
                        <div className="space-x-1">
                          <button onClick={async () => { await supabase.from('inventaris_logistik').update({stok: b.stok + 1}).eq('id', b.id); fetchAllData(); }} className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-bold">+1</button>
                          <button onClick={async () => { await supabase.from('inventaris_logistik').update({stok: Math.max(0, b.stok - 1)}).eq('id', b.id); fetchAllData(); }} className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold">-1</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentMentorProfile?.akses_perizinan && (
                <div className="bg-amber-50 rounded-2xl p-6 border-2 border-amber-300">
                  <h3 className="text-lg font-extrabold text-amber-900 mb-2">📩 Delegasi: Verifikasi Perizinan Siswa</h3>
                  <div className="overflow-x-auto bg-white rounded-xl p-4 shadow">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-amber-100 text-amber-900 text-xs">
                        <tr><th className="p-2">Murid</th><th className="p-2">Tanggal</th><th className="p-2">Alasan</th><th className="p-2">Aksi</th></tr>
                      </thead>
                      <tbody>
                        {daftarPerizinan.map(i => (
                          <tr key={i.id} className="border-b">
                            <td className="p-2 font-bold">{i.siswa?.nama_murid}</td>
                            <td className="p-2">{i.tanggal_izin}</td>
                            <td className="p-2">{i.alasan}</td>
                            <td className="p-2 space-x-1">
                              <button onClick={() => handleUpdateStatusIzin(i.id, 'disetujui')} className="bg-emerald-600 text-white px-2 py-1 rounded text-xs font-bold">Setujui</button>
                              <button onClick={() => handleUpdateStatusIzin(i.id, 'ditolak')} className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">Tolak</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* REKAP JURNAL */}
              <div className="bg-white rounded-2xl p-6 shadow-md border border-purple-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-[#581878]">📖 Rekap Riwayat Sesi & Jurnal Belajar</h3>
                  <select value={selectedSiswaIdFilter} onChange={(e) => setSelectedSiswaIdFilter(e.target.value)} className="px-3 py-1.5 border rounded-xl text-xs font-bold bg-purple-50 text-[#581878]">
                    <option value="all">Semua Siswa</option>
                    {daftarSiswa.filter(s => s.status === 'aktif').map(s => <option key={s.id} value={s.id}>{s.nama_murid}</option>)}
                  </select>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-purple-50 text-[#581878] uppercase text-xs">
                      <tr><th className="p-3">Tanggal</th><th className="p-3">Nama Siswa</th><th className="p-3">Guru</th><th className="p-3">Pertemuan</th><th className="p-3">Status Sesi</th><th className="p-3">Jurnal</th></tr>
                    </thead>
                    <tbody>
                      {filteredPresensiSiswa.map((ps) => (
                        <tr key={ps.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-semibold text-gray-600">{ps.tanggal_pertemuan}</td>
                          <td className="p-3 font-bold text-gray-900">{ps.periode_belajar?.siswa?.nama_murid || 'Siswa'}</td>
                          <td className="p-3 text-purple-900 font-bold">{ps.mentor?.nama_mentor || 'Guru'}</td>
                          <td className="p-3 font-bold text-[#581878]">Ke-{ps.pertemuan_ke}</td>
                          <td className="p-3"><span className={`text-xs font-bold px-2 py-1 rounded ${ps.is_hadir ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{ps.is_hadir ? '✅ Hadir / Selesai' : '❌ Alpha / Hangus'}</span></td>
                          <td className="p-3 text-gray-600">{ps.jurnal_materi || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* 👑 PORTAL ADMIN (MANAJEMEN MENTOR, GAJI & APPROVAL)      */}
          {/* ======================================================= */}
          {userRole === 'admin' && (
            <div>
              <div className="flex overflow-x-auto border-b-2 border-purple-200 mb-6 space-x-2 pb-1">
                <button onClick={() => setAdminTab('siswa')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm whitespace-nowrap ${adminTab === 'siswa' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600'}`}>📋 Approval Siswa</button>
                <button onClick={() => setAdminTab('pembayaran')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm whitespace-nowrap ${adminTab === 'pembayaran' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600'}`}>💵 Pembayaran</button>
                <button onClick={() => setAdminTab('mentor')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm whitespace-nowrap ${adminTab === 'mentor' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600'}`}>👩‍🏫 Kelola Mentor & Akses</button>
                <button onClick={() => setAdminTab('gaji')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm whitespace-nowrap ${adminTab === 'gaji' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600'}`}>💰 Payroll & Rekap Gaji</button>
                <button onClick={() => setAdminTab('logistik')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm whitespace-nowrap ${adminTab === 'logistik' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600'}`}>📚 Inventaris Modul</button>
              </div>

              {/* TAB 1: APPROVAL SISWA */}
              {adminTab === 'siswa' && (
                <div className="bg-white rounded-2xl p-6 shadow-md border border-purple-100">
                  <h3 className="text-xl font-bold text-[#581878] mb-4">Persetujuan Pendaftaran Siswa Baru</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-purple-50 text-[#581878] uppercase text-xs">
                        <tr><th className="p-3">Nama Murid</th><th className="p-3">Orang Tua</th><th className="p-3">Kontak WA</th><th className="p-3">Status</th><th className="p-3 text-center">Aksi Admin</th></tr>
                      </thead>
                      <tbody>
                        {daftarSiswa.map((s) => (
                          <tr key={s.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-bold text-gray-900">{s.nama_murid}</td>
                            <td className="p-3">{s.nama_orang_tua}</td>
                            <td className="p-3"><a href={`https://wa.me/${s.no_hp?.replace(/^0/, '62')}`} target="_blank" rel="noreferrer" className="text-emerald-600 font-bold">💬 {s.no_hp}</a></td>
                            <td className="p-3"><span className={`text-xs font-bold px-2 py-1 rounded uppercase ${s.status === 'pending' ? 'bg-amber-100 text-amber-800' : s.status === 'aktif' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>{s.status}</span></td>
                            <td className="p-3 text-center space-x-2">
                              {s.status === 'pending' && <button onClick={() => handleUpdateStatusSiswa(s.id, 'aktif')} className="bg-emerald-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow">✓ Approve Aktif</button>}
                              {s.status === 'aktif' && <button onClick={() => handleUpdateStatusSiswa(s.id, 'non_aktif')} className="bg-red-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow">Non-Aktifkan</button>}
                              {s.status === 'non_aktif' && <button onClick={() => handleUpdateStatusSiswa(s.id, 'aktif')} className="bg-purple-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow">Re-Aktifkan</button>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: PEMBAYARAN */}
              {adminTab === 'pembayaran' && (
                <div className="bg-white rounded-2xl p-6 shadow-md border border-purple-100">
                  <h3 className="text-xl font-bold text-[#581878] mb-4">Manajemen Pembayaran Periode Siswa</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-purple-50 text-[#581878] uppercase text-xs">
                        <tr><th className="p-3">Murid</th><th className="p-3">Paket</th><th className="p-3">Status Pembayaran</th><th className="p-3">Tanggal Bayar</th><th className="p-3 text-center">Aksi</th></tr>
                      </thead>
                      <tbody>
                        {daftarPeriode.map((p) => {
                          const recordPemb = daftarPembayaran.find(pb => pb.periode_id === p.id);
                          const isLunas = recordPemb?.status_pembayaran === 'Lunas';
                          return (
                            <tr key={p.id} className="border-b">
                              <td className="p-3 font-bold">{p.siswa?.nama_murid}</td>
                              <td className="p-3">{p.paket_belajar?.nama_paket}</td>
                              <td className="p-3"><span className={`text-xs font-bold px-2 py-1 rounded ${isLunas ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>{isLunas ? '🟢 Lunas' : '🔴 Belum Lunas'}</span></td>
                              <td className="p-3 text-xs">{recordPemb?.tanggal_pembayaran ? new Date(recordPemb.tanggal_pembayaran).toLocaleDateString('id-ID') : '-'}</td>
                              <td className="p-3 text-center">
                                {isLunas ? (
                                  <button onClick={() => handleUpdatePembayaran(p.id, p.siswa_id, 'Belum Lunas')} className="bg-amber-100 text-amber-800 font-bold text-xs px-3 py-1 rounded">Set Belum Lunas</button>
                                ) : (
                                  <button onClick={() => handleUpdatePembayaran(p.id, p.siswa_id, 'Lunas')} className="bg-emerald-600 text-white font-bold text-xs px-3 py-1 rounded shadow">✓ Tandai Lunas</button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: MENTOR */}
              {adminTab === 'mentor' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-purple-200">
                    <h4 className="text-lg font-bold text-[#581878] mb-3">👩‍🏫 Tambah Mentor / Guru Baru</h4>
                    <form onSubmit={handleTambahMentor} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input type="text" placeholder="Nama Lengkap Mentor" required value={newMentor.nama_mentor} onChange={(e) => setNewMentor({...newMentor, nama_mentor: e.target.value})} className="px-4 py-2 border rounded-xl" />
                      <input type="email" placeholder="Email Login Guru" required value={newMentor.email} onChange={(e) => setNewMentor({...newMentor, email: e.target.value})} className="px-4 py-2 border rounded-xl" />
                      <input type="password" placeholder="Password Login" required value={newMentor.password} onChange={(e) => setNewMentor({...newMentor, password: e.target.value})} className="px-4 py-2 border rounded-xl" />
                      <input type="text" placeholder="No. WhatsApp" required value={newMentor.no_hp} onChange={(e) => setNewMentor({...newMentor, no_hp: e.target.value})} className="px-4 py-2 border rounded-xl" />
                      <input type="number" placeholder="Tarif Honor per Jam (Rp)" required value={newMentor.honor_per_jam} onChange={(e) => setNewMentor({...newMentor, honor_per_jam: Number(e.target.value)})} className="px-4 py-2 border rounded-xl" />
                      
                      <div className="md:col-span-3 flex flex-wrap gap-6 bg-purple-50 p-4 rounded-xl">
                        <label className="flex items-center space-x-2 text-sm font-bold text-purple-900">
                          <input type="checkbox" checked={newMentor.akses_inventaris} onChange={(e) => setNewMentor({...newMentor, akses_inventaris: e.target.checked})} className="w-4 h-4" />
                          <span>Berikan Akses Inventaris Modul</span>
                        </label>
                        <label className="flex items-center space-x-2 text-sm font-bold text-purple-900">
                          <input type="checkbox" checked={newMentor.akses_perizinan} onChange={(e) => setNewMentor({...newMentor, akses_perizinan: e.target.checked})} className="w-4 h-4" />
                          <span>Berikan Akses Perizinan Siswa</span>
                        </label>
                      </div>

                      <button type="submit" disabled={loading} className="md:col-span-3 bg-[#581878] text-white font-bold py-3 rounded-xl shadow">
                        {loading ? 'Menyimpan...' : 'Simpan Mentor & Buat Akun 🚀'}
                      </button>
                    </form>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-md">
                    <h4 className="text-lg font-bold text-[#581878] mb-4">Daftar Mentor Terdaftar</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-purple-50 text-[#581878] uppercase text-xs">
                          <tr><th className="p-3">Nama</th><th className="p-3">Email Login</th><th className="p-3">Tarif / Jam</th><th className="p-3">Akses Delegasi</th></tr>
                        </thead>
                        <tbody>
                          {daftarMentor.map(m => (
                            <tr key={m.id} className="border-b">
                              <td className="p-3 font-bold">{m.nama_mentor}</td>
                              <td className="p-3 text-purple-800">{m.email || '-'}</td>
                              <td className="p-3">Rp {(m.honor_per_jam || 25000).toLocaleString('id-ID')}</td>
                              <td className="p-3 text-xs space-x-1">
                                {m.akses_inventaris && <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">Inventaris</span>}
                                {m.akses_perizinan && <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">Perizinan</span>}
                                {!m.akses_inventaris && !m.akses_perizinan && <span className="text-gray-400">Guru Utama</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: GAJI */}
              {adminTab === 'gaji' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl p-6 shadow-md border border-purple-100">
                    <h4 className="text-lg font-bold text-[#581878] mb-3">💰 Generate Rekap Gaji Bulanan</h4>
                    <form onSubmit={handleSimpanGaji} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <select required value={gajiForm.mentor_id} onChange={(e) => setGajiForm({...gajiForm, mentor_id: e.target.value})} className="px-4 py-2 border rounded-xl bg-white">
                        <option value="">-- Pilih Mentor --</option>
                        {daftarMentor.map(m => <option key={m.id} value={m.id}>{m.nama_mentor}</option>)}
                      </select>
                      <input type="month" required value={gajiForm.bulan_periode} onChange={(e) => setGajiForm({...gajiForm, bulan_periode: e.target.value})} className="px-4 py-2 border rounded-xl" />
                      <input type="number" placeholder="Insentif Kustom (Rp)" value={gajiForm.insentif} onChange={(e) => setGajiForm({...gajiForm, insentif: Number(e.target.value)})} className="px-4 py-2 border rounded-xl" />
                      <button type="submit" className="bg-[#581878] text-white font-bold py-2 rounded-xl">Hitung & Simpan Rekap</button>
                    </form>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-md">
                    <h4 className="text-lg font-bold text-[#581878] mb-4">Riwayat Penggajian & Slip Gaji</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-purple-50 text-[#581878] uppercase text-xs">
                          <tr><th className="p-3">Bulan</th><th className="p-3">Mentor</th><th className="p-3">Total Jam</th><th className="p-3">Honor Total</th><th className="p-3">Status</th><th className="p-3 text-center">Aksi</th></tr>
                        </thead>
                        <tbody>
                          {daftarPenggajian.map(g => {
                            const totalHonor = (g.total_jam_mengajar * g.honor_per_jam) + (g.insentif || 0) + (g.bonus_kinerja || 0);
                            return (
                              <tr key={g.id} className="border-b">
                                <td className="p-3 font-semibold">{g.bulan_periode}</td>
                                <td className="p-3 font-bold">{g.mentor?.nama_mentor}</td>
                                <td className="p-3">{g.total_jam_mengajar} Jam</td>
                                <td className="p-3 font-extrabold text-emerald-600">Rp {totalHonor.toLocaleString('id-ID')}</td>
                                <td className="p-3"><span className={`text-xs font-bold px-2 py-1 rounded uppercase ${g.status_pembayaran === 'dibayar' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{g.status_pembayaran}</span></td>
                                <td className="p-3 text-center space-x-2">
                                  <button onClick={() => alert(`SLIP GAJI BIMBEL ERHA\nBulan: ${g.bulan_periode}\nMentor: ${g.mentor?.nama_mentor}\nTotal Jam: ${g.total_jam_mengajar} Jam\nTOTAL DITERIMA: Rp ${totalHonor.toLocaleString('id-ID')}`)} className="bg-purple-100 text-[#581878] font-bold text-xs px-3 py-1 rounded">🖨️ Cetak</button>
                                  {g.status_pembayaran !== 'dibayar' && <button onClick={() => handleBayarGaji(g.id)} className="bg-emerald-600 text-white font-bold text-xs px-3 py-1 rounded">Tandai Dibayar</button>}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: LOGISTIK */}
              {adminTab === 'logistik' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl p-6 shadow-md border border-emerald-100">
                    <h4 className="text-lg font-bold text-emerald-800 mb-3">➕ Tambah Barang Inventaris / Modul</h4>
                    <form onSubmit={async (e) => { e.preventDefault(); await supabase.from('inventaris_logistik').insert([newBarang]); setNewBarang({nama_barang:'', kategori:'buku', stok:10, harga_satuan:15000}); fetchAllData(); }} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <input type="text" placeholder="Nama Barang" required value={newBarang.nama_barang} onChange={(e) => setNewBarang({...newBarang, nama_barang: e.target.value})} className="px-4 py-2 border rounded-xl" />
                      <select value={newBarang.kategori} onChange={(e) => setNewBarang({...newBarang, kategori: e.target.value})} className="px-4 py-2 border rounded-xl bg-white"><option value="buku">Buku/Modul</option><option value="kartu">Kartu</option><option value="atk">ATK</option></select>
                      <input type="number" placeholder="Stok" value={newBarang.stok} onChange={(e) => setNewBarang({...newBarang, stok: Number(e.target.value)})} className="px-4 py-2 border rounded-xl" />
                      <button type="submit" className="bg-emerald-600 text-white font-bold py-2 rounded-xl">Simpan Barang</button>
                    </form>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {daftarInventaris.map(b => (
                      <div key={b.id} className="bg-white p-5 rounded-2xl shadow border flex justify-between items-center">
                        <div>
                          <h5 className="font-bold text-gray-900">{b.nama_barang}</h5>
                          <p className="text-sm font-black text-emerald-600 mt-1">Stok: {b.stok} Unit</p>
                        </div>
                        <div className="space-x-1">
                          <button onClick={async () => { await supabase.from('inventaris_logistik').update({stok: b.stok + 1}).eq('id', b.id); fetchAllData(); }} className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-bold">+1</button>
                          <button onClick={async () => { await supabase.from('inventaris_logistik').update({stok: Math.max(0, b.stok - 1)}).eq('id', b.id); fetchAllData(); }} className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold">-1</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      ) : (
        /* PUBLIC LANDING PAGE (PENDAFTARAN & IZIN) */
        <>
          <section className="bg-gradient-to-b from-[#581878] via-[#6B21A8] to-[#FFFDF0] text-white pt-12 pb-20 px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <span className="inline-block bg-[#F59E0B] text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider mb-4 shadow-sm">
                Bimbingan Belajar Ceria & Berprestasi 🚀
              </span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-4">
                Rumah Belajar Ceria Bersama <span className="text-[#F59E0B]">Bimbel ErHa</span>
              </h2>
              <p className="text-lg md:text-xl text-purple-100 max-w-2xl mx-auto mb-8 font-medium">
                Mendampingi putra-putri Anda menguasai Baca AHE, Berhitung ASE, hingga Mata Pelajaran Sekolah dengan metode ramah anak.
              </p>
            </div>
          </section>

          {/* PAKET BELAJAR */}
          <section className="max-w-6xl mx-auto px-4 -mt-12 mb-16">
            <div className="text-center mb-10">
              <h3 className="text-3xl font-extrabold text-[#581878]">Pilihan Paket Belajar</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {paketList.map((paket) => {
                const isSelected = selectedPaket.includes(paket.id);
                return (
                  <div
                    key={paket.id}
                    onClick={() => {
                      if (selectedPaket.includes(paket.id)) setSelectedPaket(selectedPaket.filter(p => p !== paket.id));
                      else setSelectedPaket([...selectedPaket, paket.id]);
                    }}
                    className={`cursor-pointer bg-white rounded-2xl p-6 border-2 transition-all duration-200 shadow-md relative overflow-hidden ${
                      isSelected ? 'border-[#F59E0B] ring-4 ring-amber-200' : 'border-purple-100 hover:border-[#D95338]'
                    }`}
                  >
                    {isSelected && <div className="absolute top-0 right-0 bg-[#F59E0B] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">✓ Dipilih</div>}
                    <div className="w-12 h-12 rounded-xl bg-purple-100 text-[#581878] flex items-center justify-center font-black text-xl mb-4">📚</div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{paket.nama_paket}</h4>
                    <p className="text-gray-600 text-sm mb-4">{paket.deskripsi || 'Program bimbingan intensif 12 pertemuan.'}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* FORM PENDAFTARAN & IZIN */}
          <section className="max-w-3xl mx-auto px-4 mb-20 space-y-8">
            <div className="bg-white rounded-3xl shadow-xl border-2 border-purple-100 p-8">
              <h3 className="text-2xl font-black text-[#581878] mb-6 text-center">📝 Form Pendaftaran Siswa Baru</h3>
              <form onSubmit={handleDaftarSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nama Lengkap Murid</label>
                  <input type="text" required value={formDaftar.nama_murid} onChange={(e) => setFormDaftar({ ...formDaftar, nama_murid: e.target.value })} className="w-full px-4 py-3 rounded-xl border outline-none" placeholder="Contoh: Budi Pratama" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Nama Orang Tua / Wali</label>
                    <input type="text" required value={formDaftar.nama_orang_tua} onChange={(e) => setFormDaftar({ ...formDaftar, nama_orang_tua: e.target.value })} className="w-full px-4 py-3 rounded-xl border outline-none" placeholder="Ibu Rina" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">No. WhatsApp</label>
                    <input type="tel" required value={formDaftar.no_hp} onChange={(e) => setFormDaftar({ ...formDaftar, no_hp: e.target.value })} className="w-full px-4 py-3 rounded-xl border outline-none" placeholder="081234567890" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full py-4 bg-[#581878] hover:bg-purple-900 text-white font-extrabold text-lg rounded-xl shadow-lg transition">
                  {loading ? 'Memproses...' : 'Kirim Pendaftaran Online 🚀'}
                </button>
              </form>
            </div>

            {/* FORM IZIN PUBLIC */}
            <div className="bg-white rounded-3xl shadow-xl border-2 border-red-100 p-8">
              <h3 className="text-2xl font-black text-[#D95338] mb-2 text-center">📩 Form Konfirmasi Izin Siswa</h3>
              <p className="text-xs text-gray-500 mb-6 text-center">Harap konfirmasi izin sebelum sesi belajar dimulai agar kuota tidak hangus.</p>
              <form onSubmit={handleIzinSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Pilih Nama Murid</label>
                  <select required value={formIzin.siswa_id} onChange={(e) => setFormIzin({ ...formIzin, siswa_id: e.target.value })} className="w-full px-4 py-3 rounded-xl border outline-none bg-white">
                    <option value="">-- Pilih Murid Terdaftar --</option>
                    {daftarSiswa.map(s => <option key={s.id} value={s.id}>{s.nama_murid}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Tanggal Izin</label>
                    <input type="date" required value={formIzin.tanggal_izin} onChange={(e) => setFormIzin({ ...formIzin, tanggal_izin: e.target.value })} className="w-full px-4 py-3 rounded-xl border outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Alasan Izin</label>
                    <input type="text" required placeholder="Sakit / Acara Keluarga" value={formIzin.alasan} onChange={(e) => setFormIzin({ ...formIzin, alasan: e.target.value })} className="w-full px-4 py-3 rounded-xl border outline-none" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full py-3 bg-[#D95338] hover:bg-red-700 text-white font-extrabold text-md rounded-xl shadow transition">
                  Kirim Konfirmasi Izin 📩
                </button>
              </form>
            </div>
          </section>
        </>
      )}

      {/* MODAL LOGIN */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative border-4 border-[#581878]">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-xl">✕</button>
            <h3 className="text-2xl font-black text-[#581878] mb-2 text-center">Login Portal</h3>
            <p className="text-xs text-gray-500 mb-6 text-center">Masuk sebagai Admin atau Guru/Mentor Bimbel ErHa</p>

            {loginError && <div className="bg-red-100 text-red-700 text-xs p-3 rounded-xl mb-4 font-semibold">{loginError}</div>}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
                <input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border outline-none" placeholder="admin@bimbelerha.com / guru@bimbelerha.com" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
                <input type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border outline-none" placeholder="••••••••" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 bg-[#581878] text-white font-bold rounded-xl shadow-md transition">
                {loading ? 'Memverifikasi...' : 'Masuk Portal'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-[#581878] text-white py-8 text-center border-t-4 border-[#F59E0B]">
        <p className="font-bold text-lg">Bimbel ErHa (Rumah Hebat)</p>
        <p className="text-purple-200 text-sm mt-1">Sistem Informasi Pendaftaran & Presensi Belajar</p>
      </footer>
    </div>
  );
}
