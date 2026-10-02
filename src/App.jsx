import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Inisialisasi Supabase Client
const supabaseUrl = 'https://izifwpviqpyxauafdlge.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6aWZ3cHZpcXB5eGF1YWZkbGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NDA2ODYsImV4cCI6MjEwNjUxNjY4Nn0.XpJEgQ3vpGOYmPVi-nsjrSRJI9RfR5kWTN_XsL-TCUU';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [activeTab, setActiveTab] = useState('pendaftaran');
  const [adminTab, setAdminTab] = useState('siswa'); // 'siswa', 'izin', 'presensi', 'mentor', 'gaji', 'stok', 'paket'
  const [paketList, setPaketList] = useState([]);
  const [selectedPaket, setSelectedPaket] = useState([]);
  const [loading, setLoading] = useState(false);

  // State Auth Admin
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // State Data Master Admin
  const [daftarSiswa, setDaftarSiswa] = useState([]);
  const [daftarIzin, setDaftarIzin] = useState([]);
  const [daftarMentor, setDaftarMentor] = useState([]);
  const [daftarPresensiMentor, setDaftarPresensiMentor] = useState([]);
  const [daftarPresensiSiswa, setDaftarPresensiSiswa] = useState([]);
  const [daftarStokBuku, setDaftarStokBuku] = useState([]);

  // Form State Admin Action
  const [newMentor, setNewMentor] = useState({ nama: '', no_hp: '', honor_per_jam: 25000 });
  const [newPresensiMentor, setNewPresensiMentor] = useState({ mentor_id: '', tanggal: new Date().toISOString().split('T')[0], durasi_jam: 1, materi_ajar: '' });
  const [newPresensiSiswa, setNewPresensiSiswa] = useState({ siswa_id: '', tanggal: new Date().toISOString().split('T')[0], status: 'Hadir', catatan: '' });
  const [newBuku, setNewBuku] = useState({ judul_buku: '', kategori: 'AHE', stok_tersedia: 10, stok_minimal: 3 });
  const [newPaket, setNewPaket] = useState({ nama_paket: '', kategori: 'mapel', deskripsi: '' });

  // Form State Public
  const [formDaftar, setFormDaftar] = useState({
    nama_murid: '',
    nama_orang_tua: '',
    no_hp: '',
    alamat: '',
    jenjang_sekolah: 'PAUD/TK',
  });

  const [formIzin, setFormIzin] = useState({
    nama_murid: '',
    no_hp: '',
    tanggal_izin: '',
    alasan: '',
  });

  // Load Session & All Data
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchAllAdminData();
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchAllAdminData();
    });

    fetchPaket();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function fetchPaket() {
    const { data, error } = await supabase.from('paket_belajar').select('*').order('created_at', { ascending: true });
    if (!error && data && data.length > 0) {
      setPaketList(data);
    } else {
      setPaketList([
        { id: '1', nama_paket: 'Baca AHE', kategori: 'baca', deskripsi: 'Program membaca cepat & ramah anak' },
        { id: '2', nama_paket: 'Berhitung ASE', kategori: 'berhitung', deskripsi: 'Aritmatika ceria dan cepat' },
        { id: '3', nama_paket: 'Matematika SD/SMP', kategori: 'mapel', deskripsi: 'Konsep dasar & latihan soal' },
        { id: '4', nama_paket: 'Bahasa Inggris', kategori: 'mapel', deskripsi: 'Vocab & percakapan dasar' },
        { id: '5', nama_paket: 'IPAS & Agama', kategori: 'mapel', deskripsi: 'Pendampingan belajar sekolah' },
        { id: '6', nama_paket: 'Bahasa Jawa & B. Indo', kategori: 'mapel', deskripsi: 'Membaca, menulis, & muatan lokal' },
      ]);
    }
  }

  async function fetchAllAdminData() {
    const { data: siswa } = await supabase.from('siswa').select('*').order('created_at', { ascending: false });
    const { data: izin } = await supabase.from('izin_siswa').select('*').order('created_at', { ascending: false });
    const { data: mentor } = await supabase.from('mentor').select('*').order('created_at', { ascending: false });
    const { data: presensiM } = await supabase.from('presensi_mentor').select('*, mentor(nama, honor_per_jam)').order('tanggal', { ascending: false });
    const { data: presensiS } = await supabase.from('presensi_siswa').select('*, siswa(nama_murid)').order('tanggal', { ascending: false });
    const { data: buku } = await supabase.from('stok_buku').select('*').order('judul_buku', { ascending: true });

    if (siswa) setDaftarSiswa(siswa);
    if (izin) setDaftarIzin(izin);
    if (mentor) setDaftarMentor(mentor);
    if (presensiM) setDaftarPresensiMentor(presensiM);
    if (presensiS) setDaftarPresensiSiswa(presensiS);
    if (buku) setDaftarStokBuku(buku);
  }

  // Auth Handlers
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) {
      setLoginError('Login gagal: ' + error.message);
    } else {
      setShowLoginModal(false);
      setLoginEmail('');
      setLoginPassword('');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // Actions Admin
  const handleTambahMentor = async (e) => {
    e.preventDefault();
    await supabase.from('mentor').insert([newMentor]);
    setNewMentor({ nama: '', no_hp: '', honor_per_jam: 25000 });
    fetchAllAdminData();
  };

  const handleTambahPresensiMentor = async (e) => {
    e.preventDefault();
    if (!newPresensiMentor.mentor_id) { alert('Pilih mentor terlebih dahulu!'); return; }
    await supabase.from('presensi_mentor').insert([newPresensiMentor]);
    setNewPresensiMentor({ ...newPresensiMentor, materi_ajar: '' });
    fetchAllAdminData();
  };

  const handleTambahPresensiSiswa = async (e) => {
    e.preventDefault();
    if (!newPresensiSiswa.siswa_id) { alert('Pilih siswa terlebih dahulu!'); return; }
    await supabase.from('presensi_siswa').insert([newPresensiSiswa]);
    setNewPresensiSiswa({ ...newPresensiSiswa, catatan: '' });
    fetchAllAdminData();
  };

  const handleTambahBuku = async (e) => {
    e.preventDefault();
    await supabase.from('stok_buku').insert([newBuku]);
    setNewBuku({ judul_buku: '', kategori: 'AHE', stok_tersedia: 10, stok_minimal: 3 });
    fetchAllAdminData();
  };

  const handleUpdateStokBuku = async (id, delta) => {
    const buku = daftarStokBuku.find(b => b.id === id);
    if (buku) {
      const updatedStok = Math.max(0, (buku.stok_tersedia || 0) + delta);
      await supabase.from('stok_buku').update({ stok_tersedia: updatedStok }).eq('id', id);
      fetchAllAdminData();
    }
  };

  const handleTambahPaket = async (e) => {
    e.preventDefault();
    await supabase.from('paket_belajar').insert([{ ...newPaket, is_active: true }]);
    setNewPaket({ nama_paket: '', kategori: 'mapel', deskripsi: '' });
    fetchPaket();
  };

  const handlePaketToggle = (id) => {
    if (selectedPaket.includes(id)) {
      setSelectedPaket(selectedPaket.filter((p) => p !== id));
    } else {
      setSelectedPaket([...selectedPaket, id]);
    }
  };

  // Submit Public
  const handleDaftarSubmit = async (e) => {
    e.preventDefault();
    if (selectedPaket.length === 0) {
      alert('Pilih minimal satu paket belajar!');
      return;
    }
    setLoading(true);

    try {
      const { data: siswaData } = await supabase.from('siswa').insert([{ ...formDaftar, status: 'Menunggu' }]).select();
      if (siswaData && siswaData[0]) {
        const relasiPaket = selectedPaket.map((pId) => ({
          siswa_id: siswaData[0].id,
          paket_id: pId,
        }));
        await supabase.from('siswa_paket').insert(relasiPaket);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      alert('Pendaftaran Berhasil! Mengarahkan ke WhatsApp Admin...');
      const waText = `Halo Admin Bimbel ErHa,\nSaya ${formDaftar.nama_orang_tua} mendaftarkan ${formDaftar.nama_murid} (${formDaftar.jenjang_sekolah}).`;
      window.open(`https://wa.me/6281234567890?text=${encodeURIComponent(waText)}`, '_blank');
    }
  };

  const handleIzinSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await supabase.from('izin_siswa').insert([formIzin]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      alert('Pengajuan izin berhasil dikirim!');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF0] font-sans text-gray-800">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-[#581878] shadow-lg border-b-4 border-[#F59E0B]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-white rounded-xl p-1.5 shadow-md flex items-center justify-center">
              <img 
                src={`${import.meta.env.BASE_URL}logo.png`} 
                alt="Logo" 
                className="h-9 w-auto object-contain"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <span className="text-2xl font-black tracking-wider text-[#581878] ml-1">
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
                <span className="text-xs bg-amber-400 text-purple-950 font-black px-3 py-1 rounded-full shadow">
                  Admin Logged In
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
                🔐 Login Admin
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ADMIN DASHBOARD LENGKAP */}
      {user ? (
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* STATISTIK CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-5 rounded-2xl shadow border-l-8 border-[#581878]">
              <p className="text-xs font-bold text-gray-500 uppercase">Siswa Terdaftar</p>
              <h3 className="text-2xl font-black text-[#581878] mt-1">{daftarSiswa.length} <span className="text-xs font-medium text-gray-500">Anak</span></h3>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow border-l-8 border-[#D95338]">
              <p className="text-xs font-bold text-gray-500 uppercase">Pengajuan Izin</p>
              <h3 className="text-2xl font-black text-[#D95338] mt-1">{daftarIzin.length} <span className="text-xs font-medium text-gray-500">Izin</span></h3>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow border-l-8 border-[#F59E0B]">
              <p className="text-xs font-bold text-gray-500 uppercase">Total Mentor</p>
              <h3 className="text-2xl font-black text-[#F59E0B] mt-1">{daftarMentor.length} <span className="text-xs font-medium text-gray-500">Pengajar</span></h3>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow border-l-8 border-emerald-500">
              <p className="text-xs font-bold text-gray-500 uppercase">Stok Buku Modul</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">
                {daftarStokBuku.reduce((acc, b) => acc + (b.stok_tersedia || 0), 0)} <span className="text-xs font-medium text-gray-500">Buku</span>
              </h3>
            </div>
          </div>

          {/* ADMIN NAVIGATION TABS */}
          <div className="flex overflow-x-auto border-b-2 border-purple-200 mb-6 space-x-2 pb-1">
            <button onClick={() => setAdminTab('siswa')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm whitespace-nowrap ${adminTab === 'siswa' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600 hover:bg-purple-50'}`}>📋 Siswa</button>
            <button onClick={() => setAdminTab('presensi')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm whitespace-nowrap ${adminTab === 'presensi' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600 hover:bg-purple-50'}`}>📝 Presensi Siswa</button>
            <button onClick={() => setAdminTab('mentor')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm whitespace-nowrap ${adminTab === 'mentor' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600 hover:bg-purple-50'}`}>👩‍🏫 Presensi Mentor</button>
            <button onClick={() => setAdminTab('gaji')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm whitespace-nowrap ${adminTab === 'gaji' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600 hover:bg-purple-50'}`}>💵 Payroll Gaji</button>
            <button onClick={() => setAdminTab('stok')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm whitespace-nowrap ${adminTab === 'stok' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600 hover:bg-purple-50'}`}>📚 Stok Buku</button>
            <button onClick={() => setAdminTab('izin')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm whitespace-nowrap ${adminTab === 'izin' ? 'bg-[#D95338] text-white' : 'bg-white text-gray-600 hover:bg-red-50'}`}>📩 Rekap Izin</button>
            <button onClick={() => setAdminTab('paket')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm whitespace-nowrap ${adminTab === 'paket' ? 'bg-[#F59E0B] text-white' : 'bg-white text-gray-600 hover:bg-amber-50'}`}>📚 Paket Belajar</button>
          </div>

          {/* TAB 1: KELOLA SISWA */}
          {adminTab === 'siswa' && (
            <div className="bg-white rounded-2xl p-6 shadow-md border border-purple-100">
              <h3 className="text-xl font-bold text-[#581878] mb-4">Pendaftaran Siswa Baru</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-purple-50 text-[#581878] uppercase text-xs">
                    <tr>
                      <th className="p-3">Nama Murid</th>
                      <th className="p-3">Orang Tua</th>
                      <th className="p-3">Jenjang</th>
                      <th className="p-3">Kontak WA</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {daftarSiswa.map((s) => (
                      <tr key={s.id || s.created_at} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-bold">{s.nama_murid}</td>
                        <td className="p-3">{s.nama_orang_tua}</td>
                        <td className="p-3"><span className="bg-purple-100 text-[#581878] text-xs font-bold px-2 py-1 rounded">{s.jenjang_sekolah}</span></td>
                        <td className="p-3"><a href={`https://wa.me/${s.no_hp?.replace(/^0/, '62')}`} target="_blank" rel="noreferrer" className="text-emerald-600 font-bold hover:underline">💬 {s.no_hp}</a></td>
                        <td className="p-3"><span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded">{s.status || 'Aktif'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: PRESENSI SISWA (PERTEMUAN) */}
          {adminTab === 'presensi' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-md border border-purple-100">
                <h4 className="text-lg font-bold text-[#581878] mb-3">➕ Catat Presensi Harian Siswa</h4>
                <form onSubmit={handleTambahPresensiSiswa} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <select
                    value={newPresensiSiswa.siswa_id}
                    onChange={(e) => setNewPresensiSiswa({ ...newPresensiSiswa, siswa_id: e.target.value })}
                    className="px-4 py-2 border rounded-xl outline-none bg-white"
                  >
                    <option value="">-- Pilih Siswa --</option>
                    {daftarSiswa.map(s => <option key={s.id} value={s.id}>{s.nama_murid}</option>)}
                  </select>
                  <input type="date" value={newPresensiSiswa.tanggal} onChange={(e) => setNewPresensiSiswa({ ...newPresensiSiswa, tanggal: e.target.value })} className="px-4 py-2 border rounded-xl" />
                  <select value={newPresensiSiswa.status} onChange={(e) => setNewPresensiSiswa({ ...newPresensiSiswa, status: e.target.value })} className="px-4 py-2 border rounded-xl bg-white">
                    <option value="Hadir">✅ Hadir</option>
                    <option value="Izin">📩 Izin</option>
                    <option value="Alpha">❌ Alpha</option>
                    <option value="Make-up Class">🔄 Make-up Class (Kelas Pengganti)</option>
                  </select>
                  <button type="submit" className="bg-[#581878] text-white font-bold py-2 rounded-xl">Simpan Presensi</button>
                </form>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-md border border-purple-100">
                <h3 className="text-xl font-bold text-[#581878] mb-4">Riwayat Kehadiran Siswa</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-purple-50 text-[#581878] uppercase text-xs">
                      <tr>
                        <th className="p-3">Tanggal</th>
                        <th className="p-3">Nama Siswa</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Catatan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {daftarPresensiSiswa.map((ps) => (
                        <tr key={ps.id} className="border-b">
                          <td className="p-3 font-semibold">{ps.tanggal}</td>
                          <td className="p-3 font-bold">{ps.siswa?.nama_murid || 'Siswa'}</td>
                          <td className="p-3">
                            <span className={`text-xs font-bold px-2 py-1 rounded ${ps.status === 'Hadir' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>
                              {ps.status}
                            </span>
                          </td>
                          <td className="p-3 text-gray-500">{ps.catatan || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DATA MENTOR & PRESENSI MENGAJAR */}
          {adminTab === 'mentor' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Form Tambah Mentor */}
                <div className="bg-white rounded-2xl p-6 shadow-md border border-purple-100">
                  <h4 className="text-lg font-bold text-[#581878] mb-3">👩‍🏫 Tambah Mentor Baru</h4>
                  <form onSubmit={handleTambahMentor} className="space-y-3">
                    <input type="text" placeholder="Nama Mentor" required value={newMentor.nama} onChange={(e) => setNewMentor({ ...newMentor, nama: e.target.value })} className="w-full px-4 py-2 border rounded-xl" />
                    <input type="text" placeholder="No. WhatsApp" required value={newMentor.no_hp} onChange={(e) => setNewMentor({ ...newMentor, no_hp: e.target.value })} className="w-full px-4 py-2 border rounded-xl" />
                    <input type="number" placeholder="Honor per Jam (Rp)" required value={newMentor.honor_per_jam} onChange={(e) => setNewMentor({ ...newMentor, honor_per_jam: Number(e.target.value) })} className="w-full px-4 py-2 border rounded-xl" />
                    <button type="submit" className="w-full bg-[#581878] text-white font-bold py-2 rounded-xl">Simpan Mentor</button>
                  </form>
                </div>

                {/* Form Input Jam Mengajar */}
                <div className="bg-white rounded-2xl p-6 shadow-md border border-purple-100">
                  <h4 className="text-lg font-bold text-[#581878] mb-3">⏱️ Catat Jam Mengajar Mentor</h4>
                  <form onSubmit={handleTambahPresensiMentor} className="space-y-3">
                    <select value={newPresensiMentor.mentor_id} onChange={(e) => setNewPresensiMentor({ ...newPresensiMentor, mentor_id: e.target.value })} className="w-full px-4 py-2 border rounded-xl bg-white">
                      <option value="">-- Pilih Mentor --</option>
                      {daftarMentor.map(m => <option key={m.id} value={m.id}>{m.nama}</option>)}
                    </select>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="date" value={newPresensiMentor.tanggal} onChange={(e) => setNewPresensiMentor({ ...newPresensiMentor, tanggal: e.target.value })} className="px-4 py-2 border rounded-xl" />
                      <input type="number" step="0.5" placeholder="Durasi (Jam)" value={newPresensiMentor.durasi_jam} onChange={(e) => setNewPresensiMentor({ ...newPresensiMentor, durasi_jam: Number(e.target.value) })} className="px-4 py-2 border rounded-xl" />
                    </div>
                    <input type="text" placeholder="Materi / Kelas (Misal: Baca AHE Kelas A)" value={newPresensiMentor.materi_ajar} onChange={(e) => setNewPresensiMentor({ ...newPresensiMentor, materi_ajar: e.target.value })} className="w-full px-4 py-2 border rounded-xl" />
                    <button type="submit" className="w-full bg-[#F59E0B] text-white font-bold py-2 rounded-xl">Simpan Kehadiran Mentor</button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PAYROLL GAJI MENTOR */}
          {adminTab === 'gaji' && (
            <div className="bg-white rounded-2xl p-6 shadow-md border border-purple-100">
              <h3 className="text-xl font-bold text-[#581878] mb-4">💵 Rekap Penggajian Mentor</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-purple-50 text-[#581878] uppercase text-xs">
                    <tr>
                      <th className="p-3">Nama Mentor</th>
                      <th className="p-3">Tarif / Jam</th>
                      <th className="p-3">Total Jam Mengajar</th>
                      <th className="p-3">Estimasi Total Honor</th>
                      <th className="p-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {daftarMentor.map((m) => {
                      const totalJam = daftarPresensiMentor.filter(pm => pm.mentor_id === m.id).reduce((acc, curr) => acc + (Number(curr.durasi_jam) || 0), 0);
                      const totalGaji = totalJam * (m.honor_per_jam || 25000);
                      return (
                        <tr key={m.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-bold text-gray-900">{m.nama}</td>
                          <td className="p-3">Rp {(m.honor_per_jam || 25000).toLocaleString('id-ID')}</td>
                          <td className="p-3 font-bold text-[#581878]">{totalJam} Jam</td>
                          <td className="p-3 font-extrabold text-emerald-600">Rp {totalGaji.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-center">
                            <button onClick={() => alert(`Cetak Slip Gaji ${m.nama}:\nTotal Jam: ${totalJam} Jam\nTotal Honor: Rp ${totalGaji.toLocaleString('id-ID')}`)} className="bg-purple-100 text-[#581878] font-bold text-xs px-3 py-1 rounded">
                              🖨️ Cetak Slip
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: LOGISTIK & STOK BUKU */}
          {adminTab === 'stok' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-md border border-emerald-100">
                <h4 className="text-lg font-bold text-emerald-800 mb-3">➕ Tambah Judul Buku / Modul</h4>
                <form onSubmit={handleTambahBuku} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input type="text" placeholder="Judul Modul (Misal: Modul AHE 1)" required value={newBuku.judul_buku} onChange={(e) => setNewBuku({ ...newBuku, judul_buku: e.target.value })} className="px-4 py-2 border rounded-xl" />
                  <select value={newBuku.kategori} onChange={(e) => setNewBuku({ ...newBuku, kategori: e.target.value })} className="px-4 py-2 border rounded-xl bg-white">
                    <option value="AHE">AHE (Membaca)</option>
                    <option value="ASE">ASE (Berhitung)</option>
                    <option value="Mapel">Mata Pelajaran</option>
                  </select>
                  <input type="number" placeholder="Jumlah Stok" value={newBuku.stok_tersedia} onChange={(e) => setNewBuku({ ...newBuku, stok_tersedia: Number(e.target.value) })} className="px-4 py-2 border rounded-xl" />
                  <button type="submit" className="bg-emerald-600 text-white font-bold py-2 rounded-xl">Simpan Buku</button>
                </form>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {daftarStokBuku.map((b) => (
                  <div key={b.id} className="bg-white p-5 rounded-2xl shadow border border-emerald-100 flex justify-between items-center">
                    <div>
                      <h5 className="font-bold text-gray-900">{b.judul_buku}</h5>
                      <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded">{b.kategori}</span>
                      <p className="text-sm font-black text-emerald-600 mt-2">Stok: {b.stok_tersedia} Eksemplar</p>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <button onClick={() => handleUpdateStokBuku(b.id, 1)} className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded text-xs">+ Tambah</button>
                      <button onClick={() => handleUpdateStokBuku(b.id, -1)} className="bg-red-100 text-red-800 font-bold px-3 py-1 rounded text-xs">- Kurang</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: REKAP IZIN */}
          {adminTab === 'izin' && (
            <div className="bg-white rounded-2xl p-6 shadow-md border border-purple-100">
              <h3 className="text-xl font-bold text-[#D95338] mb-4">Daftar Pengajuan Izin Siswa</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-red-50 text-[#D95338] uppercase text-xs">
                    <tr>
                      <th className="p-3">Nama Murid</th>
                      <th className="p-3">Tanggal Izin</th>
                      <th className="p-3">Alasan Tidak Masuk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {daftarIzin.map((i, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="p-3 font-bold">{i.nama_murid}</td>
                        <td className="p-3 font-semibold text-amber-600">{i.tanggal_izin}</td>
                        <td className="p-3">{i.alasan}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: PAKET BELAJAR */}
          {adminTab === 'paket' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-md border border-amber-200">
                <h4 className="text-lg font-bold text-[#581878] mb-3">➕ Tambah Paket Belajar Baru</h4>
                <form onSubmit={handleTambahPaket} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input type="text" placeholder="Nama Paket" required value={newPaket.nama_paket} onChange={(e) => setNewPaket({ ...newPaket, nama_paket: e.target.value })} className="px-4 py-2 border rounded-xl" />
                  <select value={newPaket.kategori} onChange={(e) => setNewPaket({ ...newPaket, kategori: e.target.value })} className="px-4 py-2 border rounded-xl bg-white">
                    <option value="baca">Baca</option>
                    <option value="berhitung">Berhitung</option>
                    <option value="mapel">Mata Pelajaran</option>
                  </select>
                  <button type="submit" className="bg-[#F59E0B] text-white font-bold py-2 rounded-xl">Simpan Paket</button>
                </form>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {paketList.map((p) => (
                  <div key={p.id} className="bg-white p-5 rounded-2xl shadow border border-purple-100 flex justify-between items-center">
                    <div>
                      <h5 className="font-bold text-gray-900">{p.nama_paket}</h5>
                      <p className="text-xs text-gray-500 uppercase mt-0.5">Kategori: {p.kategori}</p>
                    </div>
                    <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2.5 py-1 rounded-full">Aktif</span>
                  </div>
                ))}
              </div>
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
              <p className="text-gray-600 font-medium mt-1">Pilih program yang sesuai dengan kebutuhan belajar anak Anda</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {paketList.map((paket) => {
                const isSelected = selectedPaket.includes(paket.id);
                return (
                  <div
                    key={paket.id}
                    onClick={() => handlePaketToggle(paket.id)}
                    className={`cursor-pointer bg-white rounded-2xl p-6 border-2 transition-all duration-200 shadow-md relative overflow-hidden ${
                      isSelected
                        ? 'border-[#F59E0B] ring-4 ring-amber-200 transform scale-102'
                        : 'border-purple-100 hover:border-[#D95338]'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-0 right-0 bg-[#F59E0B] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                        ✓ Dipilih
                      </div>
                    )}
                    <div className="w-12 h-12 rounded-xl bg-purple-100 text-[#581878] flex items-center justify-center font-black text-xl mb-4">
                      📚
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{paket.nama_paket}</h4>
                    <p className="text-gray-600 text-sm mb-4">{paket.deskripsi || 'Program bimbingan intensif.'}</p>
                    <div className="text-xs font-semibold uppercase text-[#D95338] tracking-wider">
                      Kategori: {paket.kategori}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* FORM SECTION (PENDAFTARAN & IZIN) */}
          <section id="form-section" className="max-w-3xl mx-auto px-4 mb-20">
            <div className="bg-white rounded-3xl shadow-xl border-2 border-purple-100 overflow-hidden">
              <div className="flex border-b border-gray-100 bg-purple-50">
                <button
                  onClick={() => setActiveTab('pendaftaran')}
                  className={`flex-1 py-4 font-extrabold text-center transition ${
                    activeTab === 'pendaftaran'
                      ? 'bg-white text-[#581878] border-b-4 border-[#581878]'
                      : 'text-gray-500 hover:text-[#581878]'
                  }`}
                >
                  📝 Form Pendaftaran Siswa
                </button>
                <button
                  onClick={() => setActiveTab('izin')}
                  className={`flex-1 py-4 font-extrabold text-center transition ${
                    activeTab === 'izin'
                      ? 'bg-white text-[#D95338] border-b-4 border-[#D95338]'
                      : 'text-gray-500 hover:text-[#D95338]'
                  }`}
                >
                  📩 Form Izin Belajar
                </button>
              </div>

              <div className="p-8">
                {activeTab === 'pendaftaran' ? (
                  <form onSubmit={handleDaftarSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Nama Lengkap Murid</label>
                      <input
                        type="text"
                        required
                        value={formDaftar.nama_murid}
                        onChange={(e) => setFormDaftar({ ...formDaftar, nama_murid: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#581878] outline-none"
                        placeholder="Contoh: Budi Pratama"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Nama Orang Tua / Wali</label>
                        <input
                          type="text"
                          required
                          value={formDaftar.nama_orang_tua}
                          onChange={(e) => setFormDaftar({ ...formDaftar, nama_orang_tua: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#581878] outline-none"
                          placeholder="Contoh: Ibu Rina"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">No. WhatsApp (Aktif)</label>
                        <input
                          type="tel"
                          required
                          value={formDaftar.no_hp}
                          onChange={(e) => setFormDaftar({ ...formDaftar, no_hp: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#581878] outline-none"
                          placeholder="081234567890"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Jenjang Sekolah</label>
                        <select
                          value={formDaftar.jenjang_sekolah}
                          onChange={(e) => setFormDaftar({ ...formDaftar, jenjang_sekolah: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#581878] outline-none bg-white"
                        >
                          <option value="PAUD/TK">PAUD / TK</option>
                          <option value="SD Kelas 1-3">SD Kelas 1 - 3</option>
                          <option value="SD Kelas 4-6">SD Kelas 4 - 6</option>
                          <option value="SMP">SMP</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Alamat Domisili</label>
                        <input
                          type="text"
                          required
                          value={formDaftar.alamat}
                          onChange={(e) => setFormDaftar({ ...formDaftar, alamat: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#581878] outline-none"
                          placeholder="Alamat singkat"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-[#581878] hover:bg-purple-900 text-white font-extrabold text-lg rounded-xl shadow-lg transition duration-200"
                    >
                      {loading ? 'Memproses...' : 'Kirim Pendaftaran Online 🚀'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleIzinSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Nama Murid</label>
                      <input
                        type="text"
                        required
                        value={formIzin.nama_murid}
                        onChange={(e) => setFormIzin({ ...formIzin, nama_murid: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#D95338] outline-none"
                        placeholder="Nama lengkap murid"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Tanggal Izin Tidak Masuk</label>
                      <input
                        type="date"
                        required
                        value={formIzin.tanggal_izin}
                        onChange={(e) => setFormIzin({ ...formIzin, tanggal_izin: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#D95338] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Alasan Izin</label>
                      <textarea
                        rows="3"
                        required
                        value={formIzin.alasan}
                        onChange={(e) => setFormIzin({ ...formIzin, alasan: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#D95338] outline-none"
                        placeholder="Contoh: Sakit / Acara Keluarga"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-[#D95338] hover:bg-red-700 text-white font-extrabold text-lg rounded-xl shadow-lg transition duration-200"
                    >
                      {loading ? 'Mengirim...' : 'Kirim Pengajuan Izin 📩'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </section>
        </>
      )}

      {/* MODAL POPUP LOGIN ADMIN */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative border-4 border-[#581878]">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-xl">✕</button>
            <h3 className="text-2xl font-black text-[#581878] mb-2 text-center">Login Admin Bimbel</h3>
            <p className="text-xs text-gray-500 mb-6 text-center">Khusus Pengelola & Mentor Bimbel ErHa</p>

            {loginError && <div className="bg-red-100 text-red-700 text-xs p-3 rounded-xl mb-4 font-semibold">{loginError}</div>}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email Admin</label>
                <input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border outline-none" placeholder="admin@bimbelerha.com" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
                <input type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border outline-none" placeholder="••••••••" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 bg-[#581878] text-white font-bold rounded-xl shadow-md transition mt-2">
                {loading ? 'Memverifikasi...' : 'Masuk Sistem'}
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
