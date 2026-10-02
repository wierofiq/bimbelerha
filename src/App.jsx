import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Inisialisasi Supabase Client
const supabaseUrl = 'https://izifwpviqpyxauafdlge.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6aWZ3cHZpcXB5eGF1YWZkbGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NDA2ODYsImV4cCI6MjEwNjUxNjY4Nn0.XpJEgQ3vpGOYmPVi-nsjrSRJI9RfR5kWTN_XsL-TCUU';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [activeTab, setActiveTab] = useState('pendaftaran');
  const [adminTab, setAdminTab] = useState('siswa'); 
  const [userRole, setUserRole] = useState('guru'); // 'admin' atau 'guru'
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
  const [daftarInventaris, setDaftarInventaris] = useState([]);

  // Form Presensi Guru
  const [newPresensiSiswa, setNewPresensiSiswa] = useState({
    periode_id: '',
    mentor_id: '',
    pertemuan_ke: 1,
    tanggal_pertemuan: new Date().toISOString().split('T')[0],
    is_hadir: true,
    is_kelas_pengganti: false,
    jurnal_materi: ''
  });

  // Form Admin & Public
  const [selectedSiswaIdFilter, setSelectedSiswaIdFilter] = useState('all');
  const [newMentor, setNewMentor] = useState({ nama_mentor: '', no_hp: '', alamat: '', honor_per_jam: 25000 });
  const [newPresensiMentor, setNewPresensiMentor] = useState({ mentor_id: '', tanggal: new Date().toISOString().split('T')[0], jam_masuk: '08:00', jam_selesai: '10:00', total_jam: 2, kegiatan_pembelajaran: '' });
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
        if (session.user.email?.includes('admin')) setUserRole('admin');
        else setUserRole('guru');
      }
      fetchAllData();
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        if (session.user.email?.includes('admin')) setUserRole('admin');
        else setUserRole('guru');
      }
      fetchAllData();
    });

    fetchPaket();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function fetchPaket() {
    const { data } = await supabase.from('paket_belajar').select('*').order('created_at', { ascending: true });
    if (data) setPaketList(data);
  }

  async function fetchAllData() {
    const { data: siswa } = await supabase.from('siswa').select('*').order('created_at', { ascending: false });
    const { data: mentor } = await supabase.from('mentor').select('*').order('created_at', { ascending: false });
    const { data: periode } = await supabase.from('periode_belajar').select('*, siswa(nama_murid, status), paket_belajar(nama_paket)').order('created_at', { ascending: false });
    const { data: presensiS } = await supabase.from('presensi_siswa').select('*, mentor(nama_mentor), periode_belajar(siswa(nama_murid), paket_belajar(nama_paket))').order('tanggal_pertemuan', { ascending: false });
    const { data: izin } = await supabase.from('perizinan_siswa').select('*, siswa(nama_murid)').order('created_at', { ascending: false });
    const { data: pemb } = await supabase.from('pembayaran_siswa').select('*').order('created_at', { ascending: false });
    const { data: presensiM } = await supabase.from('presensi_mentor').select('*, mentor(nama_mentor)').order('tanggal', { ascending: false });
    const { data: logistik } = await supabase.from('inventaris_logistik').select('*').order('nama_barang', { ascending: true });

    if (siswa) setDaftarSiswa(siswa);
    if (mentor) setDaftarMentor(mentor);
    if (periode) setDaftarPeriode(periode);
    if (presensiS) setDaftarPresensiSiswa(presensiS);
    if (izin) setDaftarPerizinan(izin);
    if (pemb) setDaftarPembayaran(pemb);
    if (presensiM) setDaftarPresensiMentor(presensiM);
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
      if (loginEmail.includes('admin')) setUserRole('admin');
      else setUserRole('guru');
      setLoginEmail('');
      setLoginPassword('');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // ADMIN ACTION: Approve Siswa (Pending -> Aktif / Non-Aktif)
  const handleUpdateStatusSiswa = async (siswaId, status) => {
    await supabase.from('siswa').update({ status }).eq('id', siswaId);
    fetchAllData();
  };

  // ADMIN ACTION: Update Status Pembayaran
  const handleUpdatePembayaran = async (periodeId, siswaId, status_pembayaran) => {
    const tglBayar = status_pembayaran === 'Lunas' ? new Date().toISOString() : null;
    
    // Check if record exists
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

  // GURU ACTION: Tambah Presensi Murid
  const handleTambahPresensiSiswa = async (e) => {
    e.preventDefault();
    if (!newPresensiSiswa.periode_id) { alert('Pilih nama murid dan paket!'); return; }
    if (!newPresensiSiswa.mentor_id) { alert('Pilih nama guru yang mengajar!'); return; }

    await supabase.from('presensi_siswa').insert([newPresensiSiswa]);
    alert('✅ Record presensi dan jurnal materi berhasil disimpan!');
    setNewPresensiSiswa({ ...newPresensiSiswa, jurnal_materi: '' });
    fetchAllData();
  };

  // Submit Pendaftaran Public (Status awal: Pending)
  const handleDaftarSubmit = async (e) => {
    e.preventDefault();
    if (selectedPaket.length === 0) { alert('Pilih minimal satu paket!'); return; }
    setLoading(true);

    try {
      // Status default pendaftaran: 'pending'
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

  // Filter siswa aktif untuk dropdown Guru
  const periodeSiswaAktif = daftarPeriode.filter(p => p.siswa?.status === 'aktif');

  // Filter Presensi berdasarkan pilihan
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
                  Role: {userRole}
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

      {/* JIKA LOGGED IN: TAMPILKAN PORTAL (GURU / ADMIN) */}
      {user ? (
        <div className="max-w-7xl mx-auto px-4 py-8">
          
          {/* ======================================================= */}
          {/* 👩‍🏫 PORTAL KHUSUS GURU (PRESENSI & REKAP PERTEMUAN)      */}
          {/* ======================================================= */}
          {userRole === 'guru' && (
            <div className="space-y-8">
              <div className="bg-gradient-to-r from-purple-800 to-indigo-900 text-white p-6 rounded-2xl shadow-md">
                <h2 className="text-2xl font-black">👩‍🏫 Portal Presensi & Jurnal Guru</h2>
                <p className="text-purple-200 text-sm mt-1">
                  Pilih murid berstatus <span className="font-bold text-amber-300">AKTIF</span> untuk menambah catatan pertemuan harian.
                </p>
              </div>

              {/* FORM PRESENSI MURID */}
              <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-purple-200">
                <h3 className="text-lg font-extrabold text-[#581878] mb-4">➕ Catat Kehadiran Pertemuan Siswa</h3>
                <form onSubmit={handleTambahPresensiSiswa} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Dropdown Guru / Mentor */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Guru yang Mengajar</label>
                    <select
                      required
                      value={newPresensiSiswa.mentor_id}
                      onChange={(e) => setNewPresensiSiswa({ ...newPresensiSiswa, mentor_id: e.target.value })}
                      className="w-full px-4 py-2.5 border rounded-xl outline-none bg-white font-medium text-sm"
                    >
                      <option value="">-- Pilih Nama Guru --</option>
                      {daftarMentor.map(m => (
                        <option key={m.id} value={m.id}>{m.nama_mentor}</option>
                      ))}
                    </select>
                  </div>

                  {/* Dropdown Murid Aktif */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Pilih Murid (Hanya Aktif)</label>
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

                  {/* Pertemuan Ke- & Tanggal */}
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

                  {/* Status Kehadiran */}
                  <div className="flex items-center space-x-6 pt-2">
                    <label className="flex items-center space-x-2 text-sm font-bold text-emerald-700">
                      <input type="checkbox" checked={newPresensiSiswa.is_hadir} onChange={(e) => setNewPresensiSiswa({ ...newPresensiSiswa, is_hadir: e.target.checked })} className="w-4 h-4" />
                      <span>Hadir</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm font-bold text-amber-700">
                      <input type="checkbox" checked={newPresensiSiswa.is_kelas_pengganti} onChange={(e) => setNewPresensiSiswa({ ...newPresensiSiswa, is_kelas_pengganti: e.target.checked })} className="w-4 h-4" />
                      <span>Kelas Pengganti</span>
                    </label>
                  </div>

                  {/* Catatan Jurnal */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Jurnal / Catatan Pembelajaran</label>
                    <input
                      type="text" placeholder="Contoh: Menguasai AHE Hal 10-15, Latihan baca lancar"
                      value={newPresensiSiswa.jurnal_materi}
                      onChange={(e) => setNewPresensiSiswa({ ...newPresensiSiswa, jurnal_materi: e.target.value })}
                      className="w-full px-4 py-2 border rounded-xl text-sm"
                    />
                  </div>

                  <button type="submit" className="md:col-span-3 bg-[#581878] hover:bg-purple-900 text-white font-extrabold py-3 rounded-xl shadow mt-2">
                    Simpan Presensi Pertemuan 🚀
                  </button>
                </form>
              </div>

              {/* REKAP RIWAYAT JURNAL TEREDAKSI PER SISWA */}
              <div className="bg-white rounded-2xl p-6 shadow-md border border-purple-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
                  <h3 className="text-lg font-bold text-[#581878]">📖 Riwayat Jurnal & Presensi Murid</h3>
                  
                  {/* Filter Per Siswa */}
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-gray-600">Filter Siswa:</span>
                    <select
                      value={selectedSiswaIdFilter}
                      onChange={(e) => setSelectedSiswaIdFilter(e.target.value)}
                      className="px-3 py-1.5 border rounded-xl text-xs font-bold bg-purple-50 text-[#581878] outline-none"
                    >
                      <option value="all">Semua Siswa</option>
                      {daftarSiswa.filter(s => s.status === 'aktif').map(s => (
                        <option key={s.id} value={s.id}>{s.nama_murid}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-purple-50 text-[#581878] uppercase text-xs">
                      <tr>
                        <th className="p-3">Tanggal</th>
                        <th className="p-3">Nama Siswa</th>
                        <th className="p-3">Guru Mengajar</th>
                        <th className="p-3">Pertemuan</th>
                        <th className="p-3">Kehadiran</th>
                        <th className="p-3">Jurnal Materi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPresensiSiswa.length > 0 ? (
                        filteredPresensiSiswa.map((ps) => (
                          <tr key={ps.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-semibold text-gray-600">{ps.tanggal_pertemuan}</td>
                            <td className="p-3 font-bold text-gray-900">{ps.periode_belajar?.siswa?.nama_murid || 'Siswa'}</td>
                            <td className="p-3 text-purple-900 font-bold">{ps.mentor?.nama_mentor || 'Guru'}</td>
                            <td className="p-3 font-bold text-[#581878]">Ke-{ps.pertemuan_ke}</td>
                            <td className="p-3">
                              <span className={`text-xs font-bold px-2 py-1 rounded ${ps.is_hadir ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                {ps.is_hadir ? '✅ Hadir' : '❌ Absen'}
                              </span>
                              {ps.is_kelas_pengganti && <span className="ml-1 text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">Pengganti</span>}
                            </td>
                            <td className="p-3 text-gray-600">{ps.jurnal_materi || '-'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="p-6 text-center text-gray-400">Belum ada riwayat pertemuan.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* 👑 PORTAL ADMIN (APPROVAL SISWA & MANAGEMENT LENGKAP)  */}
          {/* ======================================================= */}
          {userRole === 'admin' && (
            <div>
              {/* ADMIN NAVIGATION TABS */}
              <div className="flex overflow-x-auto border-b-2 border-purple-200 mb-6 space-x-2 pb-1">
                <button onClick={() => setAdminTab('siswa')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm whitespace-nowrap ${adminTab === 'siswa' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600'}`}>📋 Approval Siswa</button>
                <button onClick={() => setAdminTab('pembayaran')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm whitespace-nowrap ${adminTab === 'pembayaran' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600'}`}>💵 Pembayaran Siswa</button>
                <button onClick={() => setAdminTab('mentor')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm whitespace-nowrap ${adminTab === 'mentor' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600'}`}>👩‍🏫 Presensi Guru</button>
                <button onClick={() => setAdminTab('logistik')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm whitespace-nowrap ${adminTab === 'logistik' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600'}`}>📚 Inventaris Modul</button>
                <button onClick={() => setAdminTab('izin')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm whitespace-nowrap ${adminTab === 'izin' ? 'bg-[#D95338] text-white' : 'bg-white text-gray-600'}`}>📩 Perizinan Siswa</button>
              </div>

              {/* TAB APPROVAL SISWA (PENDING -> AKTIF / NON-AKTIF) */}
              {adminTab === 'siswa' && (
                <div className="bg-white rounded-2xl p-6 shadow-md border border-purple-100">
                  <h3 className="text-xl font-bold text-[#581878] mb-4">Persetujuan (Approval) Pendaftaran Siswa Baru</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead className="bg-purple-50 text-[#581878] uppercase text-xs">
                        <tr>
                          <th className="p-3">Nama Murid</th>
                          <th className="p-3">Orang Tua</th>
                          <th className="p-3">Kontak WA</th>
                          <th className="p-3">Status Saat Ini</th>
                          <th className="p-3 text-center">Aksi Approval Admin</th>
                        </tr>
                      </thead>
                      <tbody>
                        {daftarSiswa.map((s) => (
                          <tr key={s.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-bold text-gray-900">{s.nama_murid}</td>
                            <td className="p-3">{s.nama_orang_tua}</td>
                            <td className="p-3"><a href={`https://wa.me/${s.no_hp?.replace(/^0/, '62')}`} target="_blank" rel="noreferrer" className="text-emerald-600 font-bold hover:underline">💬 {s.no_hp}</a></td>
                            <td className="p-3">
                              <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${s.status === 'pending' ? 'bg-amber-100 text-amber-800' : s.status === 'aktif' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                                {s.status || 'pending'}
                              </span>
                            </td>
                            <td className="p-3 text-center space-x-2">
                              {s.status === 'pending' && (
                                <button onClick={() => handleUpdateStatusSiswa(s.id, 'aktif')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow">
                                  ✓ Approve (Aktifkan)
                                </button>
                              )}
                              {s.status === 'aktif' && (
                                <button onClick={() => handleUpdateStatusSiswa(s.id, 'non_aktif')} className="bg-red-500 hover:bg-red-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow">
                                  Set Non-Aktif
                                </button>
                              )}
                              {s.status === 'non_aktif' && (
                                <button onClick={() => handleUpdateStatusSiswa(s.id, 'aktif')} className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow">
                                  Re-Aktifkan
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB PEMBAYARAN PERIODE SISWA (BELUM LUNAS -> LUNAS) */}
              {adminTab === 'pembayaran' && (
                <div className="bg-white rounded-2xl p-6 shadow-md border border-purple-100">
                  <h3 className="text-xl font-bold text-[#581878] mb-4">Manajemen Pembayaran Periode Siswa</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead className="bg-purple-50 text-[#581878] uppercase text-xs">
                        <tr>
                          <th className="p-3">Nama Murid</th>
                          <th className="p-3">Paket & Periode</th>
                          <th className="p-3">Status Pembayaran</th>
                          <th className="p-3">Tanggal Bayar</th>
                          <th className="p-3 text-center">Ubah Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {daftarPeriode.map((p) => {
                          const recordPemb = daftarPembayaran.find(pb => pb.periode_id === p.id);
                          const isLunas = recordPemb?.status_pembayaran === 'Lunas';
                          return (
                            <tr key={p.id} className="border-b hover:bg-gray-50">
                              <td className="p-3 font-bold text-gray-900">{p.siswa?.nama_murid}</td>
                              <td className="p-3 font-semibold text-purple-900">{p.paket_belajar?.nama_paket} ({p.bulan_periode})</td>
                              <td className="p-3">
                                <span className={`text-xs font-bold px-2 py-1 rounded ${isLunas ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                  {isLunas ? '🟢 Lunas' : '🔴 Belum Lunas'}
                                </span>
                              </td>
                              <td className="p-3 text-xs font-semibold text-gray-600">
                                {recordPemb?.tanggal_pembayaran ? new Date(recordPemb.tanggal_pembayaran).toLocaleDateString('id-ID') : '-'}
                              </td>
                              <td className="p-3 text-center">
                                {isLunas ? (
                                  <button onClick={() => handleUpdatePembayaran(p.id, p.siswa_id, 'Belum Lunas')} className="bg-amber-100 text-amber-800 font-bold text-xs px-3 py-1 rounded hover:bg-amber-200">
                                    Set Belum Lunas
                                  </button>
                                ) : (
                                  <button onClick={() => handleUpdatePembayaran(p.id, p.siswa_id, 'Lunas')} className="bg-emerald-600 text-white font-bold text-xs px-3 py-1 rounded hover:bg-emerald-700 shadow">
                                    ✓ Tandai Lunas
                                  </button>
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
            </div>
          )}

        </div>
      ) : (
        /* PUBLIC LANDING PAGE */
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

          {/* PAKET BELAJAR SECTION */}
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

          {/* FORM PENDAFTARAN & IZIN PUBLIC */}
          <section className="max-w-3xl mx-auto px-4 mb-20">
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
          </section>
        </>
      )}

      {/* MODAL POPUP LOGIN */}
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
