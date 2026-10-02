import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Inisialisasi Supabase Client
// ✅ BENAR (Menggunakan URL dan Key asli Supabase Anda)
const supabaseUrl = 'https://izifwpviqpyxauafdlge.supabase.co'; // Ganti dengan Project URL Anda
const supabaseAnonKey = 'izifwpviqpyxauafdlge'; // Ganti dengan anon/public key Anda
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [activeTab, setActiveTab] = useState('pendaftaran');
  const [paketList, setPaketList] = useState([]);
  const [selectedPaket, setSelectedPaket] = useState([]);
  const [loading, setLoading] = useState(false);

  // Auth State (Login Admin)
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Data Dashboard Admin
  const [daftarSiswa, setDaftarSiswa] = useState([]);
  const [daftarIzin, setDaftarIzin] = useState([]);

  // Form State Pendaftaran
  const [formDaftar, setFormDaftar] = useState({
    nama_murid: '',
    nama_orang_tua: '',
    no_hp: '',
    alamat: '',
    jenjang_sekolah: 'PAUD/TK',
  });

  // Form State Izin
  const [formIzin, setFormIzin] = useState({
    nama_murid: '',
    no_hp: '',
    tanggal_izin: '',
    alasan: '',
  });

  // Cek Session Sesi Login & Ambil Paket
  useEffect(() => {
    // Cek user terautentikasi
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

  // Fetch Paket Belajar
  async function fetchPaket() {
    const { data, error } = await supabase.from('paket_belajar').select('*').eq('is_active', true);
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

  // Fetch Data untuk Dashboard Admin
  async function fetchAdminData() {
    const { data: siswa } = await supabase.from('siswa').select('*').order('created_at', { ascending: false });
    const { data: izin } = await supabase.from('izin_siswa').select('*').order('created_at', { ascending: false });
    if (siswa) setDaftarSiswa(siswa);
    if (izin) setDaftarIzin(izin);
  }

  // Handle Login Admin
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) {
      setLoginError('Email atau password salah: ' + error.message);
    } else {
      setShowLoginModal(false);
      setLoginEmail('');
      setLoginPassword('');
    }
    setLoading(false);
  };

  // Handle Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const handlePaketToggle = (id) => {
    if (selectedPaket.includes(id)) {
      setSelectedPaket(selectedPaket.filter((p) => p !== id));
    } else {
      setSelectedPaket([...selectedPaket, id]);
    }
  };

  const handleDaftarSubmit = async (e) => {
    e.preventDefault();
    if (selectedPaket.length === 0) {
      alert('Pilih minimal satu paket belajar!');
      return;
    }
    setLoading(true);

    try {
      const { data: siswaData } = await supabase.from('siswa').insert([formDaftar]).select();
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
        {/* Logo Bimbel ErHa dengan Path Aman Vite/GitHub Pages */}
<div className="flex items-center space-x-3">
  <div className="bg-white rounded-xl p-1.5 shadow-md flex items-center justify-center">
    <img 
      src={`${import.meta.env.BASE_URL}logo.png`} 
      alt="Logo Bimbel ErHa" 
      className="h-10 w-auto object-contain"
      onError={(e) => {
        // Fallback jika file logo.png tidak ditemukan
        e.target.onerror = null; 
        e.target.style.display = 'none';
      }}
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
      </nav>

      {/* JIKA ADMIN LOGGED IN: TAMPILKAN DASHBOARD ADMIN */}
      {user ? (
        <div className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-3xl font-black text-[#581878] mb-6">Panel Kelola Admin & Tentor</h2>
          
          {/* TABEL SISWA BARU */}
          <div className="bg-white rounded-2xl p-6 shadow-md mb-8 border border-purple-100">
            <h3 className="text-xl font-bold text-[#581878] mb-4">📋 Pendaftaran Siswa Baru</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-purple-50 text-[#581878] uppercase text-xs">
                  <tr>
                    <th className="p-3">Nama Murid</th>
                    <th className="p-3">Orang Tua</th>
                    <th className="p-3">Jenjang</th>
                    <th className="p-3">No. HP</th>
                    <th className="p-3">Alamat</th>
                  </tr>
                </thead>
                <tbody>
                  {daftarSiswa.length > 0 ? (
                    daftarSiswa.map((s, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-bold">{s.nama_murid}</td>
                        <td className="p-3">{s.nama_orang_tua}</td>
                        <td className="p-3">{s.jenjang_sekolah}</td>
                        <td className="p-3">{s.no_hp}</td>
                        <td className="p-3">{s.alamat}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="p-4 text-center text-gray-500">Belum ada data pendaftaran masuk.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* TABEL IZIN SISWA */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-purple-100">
            <h3 className="text-xl font-bold text-[#D95338] mb-4">📩 Daftar Izin Belajar Siswa</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-red-50 text-[#D95338] uppercase text-xs">
                  <tr>
                    <th className="p-3">Nama Murid</th>
                    <th className="p-3">Tanggal Izin</th>
                    <th className="p-3">Alasan</th>
                  </tr>
                </thead>
                <tbody>
                  {daftarIzin.length > 0 ? (
                    daftarIzin.map((i, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-bold">{i.nama_murid}</td>
                        <td className="p-3">{i.tanggal_izin}</td>
                        <td className="p-3">{i.alasan}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="p-4 text-center text-gray-500">Belum ada riwayat izin.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* TAMPILAN PUBLIK BISA DILIHAT WALI MURID */
        <>
          {/* HERO SECTION */}
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

      {/* MODAL POPUP LOGIN ADMIN */}
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
