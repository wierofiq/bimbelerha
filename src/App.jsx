import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Inisialisasi Supabase Client
const supabaseUrl = 'https://izifwpviqpyxauafdlge.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6aWZ3cHZpcXB5eGF1YWZkbGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NDA2ODYsImV4cCI6MjEwNjUxNjY4Nn0.XpJEgQ3vpGOYmPVi-nsjrSRJI9RfR5kWTN_XsL-TCUU';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [activeTab, setActiveTab] = useState('pendaftaran');
  const [adminTab, setAdminTab] = useState('siswa'); // 'siswa', 'izin', 'paket'
  const [paketList, setPaketList] = useState([]);
  const [selectedPaket, setSelectedPaket] = useState([]);
  const [loading, setLoading] = useState(false);

  // State Auth Admin
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // State Data Admin
  const [daftarSiswa, setDaftarSiswa] = useState([]);
  const [daftarIzin, setDaftarIzin] = useState([]);

  // Form Tambah Paket (Admin)
  const [newPaket, setNewPaket] = useState({ nama_paket: '', kategori: 'mapel', deskripsi: '' });

  // State Form Pendaftaran & Izin
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

  // Load Session & Data
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchAdminData();
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchAdminData();
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
        { id: '1', nama_paket: 'Baca AHE', kategori: 'baca', deskripsi: 'Program membaca cepat & ramah anak', is_active: true },
        { id: '2', nama_paket: 'Berhitung ASE', kategori: 'berhitung', deskripsi: 'Aritmatika ceria dan cepat', is_active: true },
        { id: '3', nama_paket: 'Matematika SD/SMP', kategori: 'mapel', deskripsi: 'Konsep dasar & latihan soal', is_active: true },
        { id: '4', nama_paket: 'Bahasa Inggris', kategori: 'mapel', deskripsi: 'Vocab & percakapan dasar', is_active: true },
        { id: '5', nama_paket: 'IPAS & Agama', kategori: 'mapel', deskripsi: 'Pendampingan belajar sekolah', is_active: true },
        { id: '6', nama_paket: 'Bahasa Jawa & B. Indo', kategori: 'mapel', deskripsi: 'Membaca, menulis, & muatan lokal', is_active: true },
      ]);
    }
  }

  async function fetchAdminData() {
    const { data: siswa } = await supabase.from('siswa').select('*').order('created_at', { ascending: false });
    const { data: izin } = await supabase.from('izin_siswa').select('*').order('created_at', { ascending: false });
    if (siswa) setDaftarSiswa(siswa);
    if (izin) setDaftarIzin(izin);
  }

  // Auth Handler
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

  // Action Admin: Update Status Siswa
  const handleUpdateStatusSiswa = async (id, status) => {
    await supabase.from('siswa').update({ status }).eq('id', id);
    fetchAdminData();
  };

  // Action Admin: Hapus Siswa
  const handleHapusSiswa = async (id) => {
    if (confirm('Yakin ingin menghapus data siswa ini?')) {
      await supabase.from('siswa').delete().eq('id', id);
      fetchAdminData();
    }
  };

  // Action Admin: Tambah Paket Baru
  const handleTambahPaket = async (e) => {
    e.preventDefault();
    if (!newPaket.nama_paket) return;
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

  // Submit Pendaftaran Public
  const handleDaftarSubmit = async (e) => {
    e.preventDefault();
    if (selectedPaket.length === 0) {
      alert('Pilih minimal satu paket belajar!');
      return;
    }
    setLoading(true);

    try {
      const { data: siswaData, error: siswaErr } = await supabase.from('siswa').insert([{ ...formDaftar, status: 'Menunggu' }]).select();
      if (siswaErr) console.warn(siswaErr);

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

  // Submit Izin Public
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
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
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
                  Admin Active
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

      {/* ADMIN DASHBOARD PANELS */}
      {user ? (
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* STATISTIK CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-md border-l-8 border-[#581878]">
              <p className="text-xs font-bold text-gray-500 uppercase">Total Siswa Terdaftar</p>
              <h3 className="text-3xl font-black text-[#581878] mt-1">{daftarSiswa.length} <span className="text-sm font-semibold text-gray-600">Anak</span></h3>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md border-l-8 border-[#D95338]">
              <p className="text-xs font-bold text-gray-500 uppercase">Total Pengajuan Izin</p>
              <h3 className="text-3xl font-black text-[#D95338] mt-1">{daftarIzin.length} <span className="text-sm font-semibold text-gray-600">Izin</span></h3>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md border-l-8 border-[#F59E0B]">
              <p className="text-xs font-bold text-gray-500 uppercase">Paket Belajar Aktif</p>
              <h3 className="text-3xl font-black text-[#F59E0B] mt-1">{paketList.filter(p => p.is_active !== false).length} <span className="text-sm font-semibold text-gray-600">Paket</span></h3>
            </div>
          </div>

          {/* ADMIN TABS MENU */}
          <div className="flex border-b-2 border-purple-200 mb-6 space-x-2">
            <button
              onClick={() => setAdminTab('siswa')}
              className={`py-3 px-6 font-extrabold rounded-t-xl transition ${
                adminTab === 'siswa' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600 hover:bg-purple-50'
              }`}
            >
              📋 Kelola Siswa Baru
            </button>
            <button
              onClick={() => setAdminTab('izin')}
              className={`py-3 px-6 font-extrabold rounded-t-xl transition ${
                adminTab === 'izin' ? 'bg-[#D95338] text-white' : 'bg-white text-gray-600 hover:bg-red-50'
              }`}
            >
              📩 Rekap Izin Siswa
            </button>
            <button
              onClick={() => setAdminTab('paket')}
              className={`py-3 px-6 font-extrabold rounded-t-xl transition ${
                adminTab === 'paket' ? 'bg-[#F59E0B] text-white' : 'bg-white text-gray-600 hover:bg-amber-50'
              }`}
            >
              📚 Paket Belajar
            </button>
          </div>

          {/* TAB 1: KELOLA SISWA */}
          {adminTab === 'siswa' && (
            <div className="bg-white rounded-2xl p-6 shadow-md border border-purple-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-[#581878]">Data Pendaftaran Siswa</h3>
                <button onClick={fetchAdminData} className="text-xs bg-purple-100 text-[#581878] font-bold px-3 py-1.5 rounded-lg hover:bg-purple-200">
                  🔄 Refresh Data
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-purple-50 text-[#581878] uppercase text-xs">
                    <tr>
                      <th className="p-3 border-b">Nama Murid</th>
                      <th className="p-3 border-b">Orang Tua / Wali</th>
                      <th className="p-3 border-b">Jenjang</th>
                      <th className="p-3 border-b">Kontak WA</th>
                      <th className="p-3 border-b">Status</th>
                      <th className="p-3 border-b text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {daftarSiswa.length > 0 ? (
                      daftarSiswa.map((s) => (
                        <tr key={s.id || s.created_at} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-bold text-gray-900">{s.nama_murid}</td>
                          <td className="p-3">{s.nama_orang_tua}</td>
                          <td className="p-3"><span className="bg-purple-100 text-[#581878] text-xs font-bold px-2 py-1 rounded">{s.jenjang_sekolah}</span></td>
                          <td className="p-3">
                            <a
                              href={`https://wa.me/${s.no_hp?.replace(/^0/, '62')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-600 font-bold hover:underline flex items-center space-x-1"
                            >
                              💬 {s.no_hp}
                            </a>
                          </td>
                          <td className="p-3">
                            <select
                              value={s.status || 'Menunggu'}
                              onChange={(e) => handleUpdateStatusSiswa(s.id, e.target.value)}
                              className="text-xs font-bold px-2 py-1 rounded border bg-white outline-none"
                            >
                              <option value="Menunggu">🕒 Menunggu</option>
                              <option value="Aktif">✅ Aktif</option>
                              <option value="Selesai">🎓 Selesai</option>
                            </select>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleHapusSiswa(s.id)}
                              className="text-xs bg-red-100 text-red-600 font-bold px-2 py-1 rounded hover:bg-red-200"
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="p-6 text-center text-gray-500">Belum ada data pendaftaran masuk.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: REKAP IZIN */}
          {adminTab === 'izin' && (
            <div className="bg-white rounded-2xl p-6 shadow-md border border-purple-100">
              <h3 className="text-xl font-bold text-[#D95338] mb-4">Daftar Pengajuan Izin Siswa</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-red-50 text-[#D95338] uppercase text-xs">
                    <tr>
                      <th className="p-3 border-b">Nama Murid</th>
                      <th className="p-3 border-b">Tanggal Izin</th>
                      <th className="p-3 border-b">Alasan Tidak Masuk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {daftarIzin.length > 0 ? (
                      daftarIzin.map((i, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-bold text-gray-900">{i.nama_murid}</td>
                          <td className="p-3 font-semibold text-amber-600">{i.tanggal_izin}</td>
                          <td className="p-3">{i.alasan}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="p-6 text-center text-gray-500">Belum ada riwayat pengajuan izin.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: KELOLA PAKET BELAJAR */}
          {adminTab === 'paket' && (
            <div className="space-y-6">
              {/* FORM TAMBAH PAKET */}
              <div className="bg-white rounded-2xl p-6 shadow-md border border-amber-200">
                <h4 className="text-lg font-bold text-[#581878] mb-3">➕ Tambah Paket Belajar Baru</h4>
                <form onSubmit={handleTambahPaket} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Nama Paket (Misal: Coding Cilik)"
                    required
                    value={newPaket.nama_paket}
                    onChange={(e) => setNewPaket({ ...newPaket, nama_paket: e.target.value })}
                    className="px-4 py-2 border rounded-xl outline-none"
                  />
                  <select
                    value={newPaket.kategori}
                    onChange={(e) => setNewPaket({ ...newPaket, kategori: e.target.value })}
                    className="px-4 py-2 border rounded-xl outline-none bg-white"
                  >
                    <option value="baca">Baca</option>
                    <option value="berhitung">Berhitung</option>
                    <option value="mapel">Mata Pelajaran</option>
                    <option value="komputer">Komputer/Coding</option>
                  </select>
                  <button type="submit" className="bg-[#F59E0B] text-white font-bold py-2 px-4 rounded-xl hover:bg-amber-600">
                    Simpan Paket
                  </button>
                </form>
              </div>

              {/* LIST PAKET */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {paketList.map((p) => (
                  <div key={p.id} className="bg-white p-5 rounded-2xl shadow border border-purple-100 flex justify-between items-center">
                    <div>
                      <h5 className="font-bold text-gray-900">{p.nama_paket}</h5>
                      <p className="text-xs text-gray-500 uppercase mt-0.5">Kategori: {p.kategori}</p>
                    </div>
                    <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2.5 py-1 rounded-full">
                      Aktif
                    </span>
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

          {/* FORM PENDAFTARAN & IZIN */}
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

      {/* MODAL POPUP LOGIN */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative border-4 border-[#581878]">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-xl"
            >
              ✕
            </button>
            <h3 className="text-2xl font-black text-[#581878] mb-2 text-center">Login Admin Bimbel</h3>
            <p className="text-xs text-gray-500 mb-6 text-center">Khusus Pengelola & Mentor Bimbel ErHa</p>

            {loginError && (
              <div className="bg-red-100 text-red-700 text-xs p-3 rounded-xl mb-4 font-semibold">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email Admin</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#581878] outline-none"
                  placeholder="admin@bimbelerha.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#581878] outline-none"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#581878] hover:bg-purple-900 text-white font-bold rounded-xl shadow-md transition mt-2"
              >
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
