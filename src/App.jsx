import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Inisialisasi Supabase Client
const supabaseUrl = 'https://izifwpviqpyxauafdlge.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6aWZ3cHZpcXB5eGF1YWZkbGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NDA2ODYsImV4cCI6MjEwNjUxNjY4Nn0.XpJEgQ3vpGOYmPVi-nsjrSRJI9RfR5kWTN_XsL-TCUU';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [activeTab, setActiveTab] = useState('pendaftaran');
  const [adminTab, setAdminTab] = useState('siswa'); // 'siswa', 'presensi_s', 'mentor', 'gaji', 'logistik', 'izin', 'paket'
  const [paketList, setPaketList] = useState([]);
  const [selectedPaket, setSelectedPaket] = useState([]);
  const [loading, setLoading] = useState(false);

  // Auth State
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // State Data Master
  const [daftarSiswa, setDaftarSiswa] = useState([]);
  const [daftarMentor, setDaftarMentor] = useState([]);
  const [daftarPeriode, setDaftarPeriode] = useState([]);
  const [daftarPresensiSiswa, setDaftarPresensiSiswa] = useState([]);
  const [daftarPerizinan, setDaftarPerizinan] = useState([]);
  const [daftarPresensiMentor, setDaftarPresensiMentor] = useState([]);
  const [daftarInventaris, setDaftarInventaris] = useState([]);

  // Form State Action
  const [newMentor, setNewMentor] = useState({ nama_mentor: '', no_hp: '', alamat: '', honor_per_jam: 25000 });
  const [newPresensiMentor, setNewPresensiMentor] = useState({ mentor_id: '', tanggal: new Date().toISOString().split('T')[0], jam_masuk: '08:00', jam_selesai: '10:00', total_jam: 2, kegiatan_pembelajaran: '' });
  const [newPresensiSiswa, setNewPresensiSiswa] = useState({ periode_id: '', pertemuan_ke: 1, tanggal_pertemuan: new Date().toISOString().split('T')[0], is_hadir: true, is_kelas_pengganti: false, jurnal_materi: '' });
  const [newBarang, setNewBarang] = useState({ nama_barang: '', kategori: 'buku', stok: 10, harga_satuan: 15000 });
  const [newPaket, setNewPaket] = useState({ nama_paket: '', kategori: 'mapel', deskripsi: '' });

  // Form State Public
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

  // Fetch Data
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      fetchAllAdminData();
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      fetchAllAdminData();
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

  async function fetchAllAdminData() {
    const { data: siswa } = await supabase.from('siswa').select('*').order('created_at', { ascending: false });
    const { data: mentor } = await supabase.from('mentor').select('*').order('created_at', { ascending: false });
    const { data: periode } = await supabase.from('periode_belajar').select('*, siswa(nama_murid), paket_belajar(nama_paket)').order('created_at', { ascending: false });
    const { data: presensiS } = await supabase.from('presensi_siswa').select('*, periode_belajar(siswa(nama_murid))').order('tanggal_pertemuan', { ascending: false });
    const { data: izin } = await supabase.from('perizinan_siswa').select('*, siswa(nama_murid)').order('created_at', { ascending: false });
    const { data: presensiM } = await supabase.from('presensi_mentor').select('*, mentor(nama_mentor, honor_per_jam)').order('tanggal', { ascending: false });
    const { data: logistik } = await supabase.from('inventaris_logistik').select('*').order('nama_barang', { ascending: true });

    if (siswa) setDaftarSiswa(siswa);
    if (mentor) setDaftarMentor(mentor);
    if (periode) setDaftarPeriode(periode);
    if (presensiS) setDaftarPresensiSiswa(presensiS);
    if (izin) setDaftarPerizinan(izin);
    if (presensiM) setDaftarPresensiMentor(presensiM);
    if (logistik) setDaftarInventaris(logistik);
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

  // Action Admin & Mentor
  const handleTambahMentor = async (e) => {
    e.preventDefault();
    await supabase.from('mentor').insert([newMentor]);
    setNewMentor({ nama_mentor: '', no_hp: '', alamat: '', honor_per_jam: 25000 });
    fetchAllAdminData();
  };

  const handleTambahPresensiMentor = async (e) => {
    e.preventDefault();
    if (!newPresensiMentor.mentor_id) { alert('Pilih mentor!'); return; }
    await supabase.from('presensi_mentor').insert([newPresensiMentor]);
    setNewPresensiMentor({ ...newPresensiMentor, kegiatan_pembelajaran: '' });
    fetchAllAdminData();
  };

  // GURU / MENTOR MELAKUKAN PRESENSI PADA SISWA
  const handleTambahPresensiSiswa = async (e) => {
    e.preventDefault();
    if (!newPresensiSiswa.periode_id) { alert('Pilih nama murid dan paket belajar!'); return; }
    await supabase.from('presensi_siswa').insert([newPresensiSiswa]);
    alert('✅ Presensi & Jurnal Materi berhasil dicatat!');
    setNewPresensiSiswa({ ...newPresensiSiswa, jurnal_materi: '' });
    fetchAllAdminData();
  };

  const handleTambahBarang = async (e) => {
    e.preventDefault();
    await supabase.from('inventaris_logistik').insert([newBarang]);
    setNewBarang({ nama_barang: '', kategori: 'buku', stok: 10, harga_satuan: 15000 });
    fetchAllAdminData();
  };

  const handleUpdateStokBarang = async (id, delta) => {
    const barang = daftarInventaris.find(b => b.id === id);
    if (barang) {
      const updatedStok = Math.max(0, (barang.stok || 0) + delta);
      await supabase.from('inventaris_logistik').update({ stok: updatedStok }).eq('id', id);
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

  // Submit Pendaftaran Public
  const handleDaftarSubmit = async (e) => {
    e.preventDefault();
    if (selectedPaket.length === 0) {
      alert('Pilih minimal satu paket belajar!');
      return;
    }
    setLoading(true);

    try {
      // 1. Simpan Siswa Baru
      const { data: siswaData, error: errSiswa } = await supabase.from('siswa').insert([formDaftar]).select();
      
      if (errSiswa) {
        console.error('Error insert siswa:', errSiswa);
      }

      if (siswaData && siswaData[0]) {
        const siswaId = siswaData[0].id;
        const currentBulan = new Date().toISOString().slice(0, 7); // YYYY-MM

        // 2. Buat otomatis Periode Belajar (12 Pertemuan)
        const periodeInserts = selectedPaket.map(pId => ({
          siswa_id: siswaId,
          paket_id: pId,
          bulan_periode: currentBulan,
          total_pertemuan: 12,
          status_periode: 'berjalan'
        }));

        await supabase.from('periode_belajar').insert(periodeInserts);
        fetchAllAdminData(); // Refresh Data Dashboard
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      alert('Pendaftaran Berhasil! Mengarahkan ke WhatsApp Admin...');
      const waText = `Halo Admin Bimbel ErHa,\nSaya ${formDaftar.nama_orang_tua} mendaftarkan ${formDaftar.nama_murid} (${formDaftar.jenjang_sekolah}).`;
      window.open(`https://wa.me/6281915058297?text=${encodeURIComponent(waText)}`, '_blank');
    }
  };

  // Submit Izin Public
  const handleIzinSubmit = async (e) => {
    e.preventDefault();
    if (!formIzin.siswa_id) {
      alert('Silakan pilih nama murid!');
      return;
    }
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
      fetchAllAdminData();
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
                  Admin/Guru Active
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
                🔐 Login Admin / Guru
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* DASHBOARD UTAMA ADMIN / GURU */}
      {user ? (
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* STATISTIK CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-5 rounded-2xl shadow border-l-8 border-[#581878]">
              <p className="text-xs font-bold text-gray-500 uppercase">Siswa Terdaftar</p>
              <h3 className="text-2xl font-black text-[#581878] mt-1">{daftarSiswa.length} <span className="text-xs font-medium text-gray-500">Anak</span></h3>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow border-l-8 border-[#D95338]">
              <p className="text-xs font-bold text-gray-500 uppercase">Perizinan Pending</p>
              <h3 className="text-2xl font-black text-[#D95338] mt-1">{daftarPerizinan.filter(i => i.status_izin === 'pending').length} <span className="text-xs font-medium text-gray-500">Izin</span></h3>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow border-l-8 border-[#F59E0B]">
              <p className="text-xs font-bold text-gray-500 uppercase">Mentor/Guru</p>
              <h3 className="text-2xl font-black text-[#F59E0B] mt-1">{daftarMentor.length} <span className="text-xs font-medium text-gray-500">Pengajar</span></h3>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow border-l-8 border-emerald-500">
              <p className="text-xs font-bold text-gray-500 uppercase">Stok Modul</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">
                {daftarInventaris.reduce((acc, b) => acc + (b.stok || 0), 0)} <span className="text-xs font-medium text-gray-500">Unit</span>
              </h3>
            </div>
          </div>

          {/* ADMIN TABS NAVIGATION */}
          <div className="flex overflow-x-auto border-b-2 border-purple-200 mb-6 space-x-2 pb-1">
            <button onClick={() => setAdminTab('siswa')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm whitespace-nowrap ${adminTab === 'siswa' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600'}`}>📋 Data Siswa</button>
            <button onClick={() => setAdminTab('presensi_s')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm whitespace-nowrap ${adminTab === 'presensi_s' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600'}`}>📝 Presensi Murid (Guru)</button>
            <button onClick={() => setAdminTab('mentor')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm whitespace-nowrap ${adminTab === 'mentor' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600'}`}>👩‍🏫 Presensi Guru</button>
            <button onClick={() => setAdminTab('gaji')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm whitespace-nowrap ${adminTab === 'gaji' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600'}`}>💵 Payroll Gaji</button>
            <button onClick={() => setAdminTab('logistik')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm whitespace-nowrap ${adminTab === 'logistik' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600'}`}>📚 Inventaris Modul</button>
            <button onClick={() => setAdminTab('izin')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm whitespace-nowrap ${adminTab === 'izin' ? 'bg-[#D95338] text-white' : 'bg-white text-gray-600'}`}>📩 Perizinan Siswa</button>
            <button onClick={() => setAdminTab('paket')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm whitespace-nowrap ${adminTab === 'paket' ? 'bg-[#F59E0B] text-white' : 'bg-white text-gray-600'}`}>📚 Master Paket</button>
          </div>

          {/* TAB 1: DATA SISWA TERDAFTAR */}
          {adminTab === 'siswa' && (
            <div className="bg-white rounded-2xl p-6 shadow-md border border-purple-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-[#581878]">Data Pendaftaran Siswa Baru</h3>
                <button onClick={fetchAllAdminData} className="text-xs bg-purple-100 text-[#581878] font-bold px-3 py-1.5 rounded-lg hover:bg-purple-200">
                  🔄 Refresh Data
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-purple-50 text-[#581878] uppercase text-xs">
                    <tr>
                      <th className="p-3">Nama Murid</th>
                      <th className="p-3">Orang Tua / Wali</th>
                      <th className="p-3">Jenjang</th>
                      <th className="p-3">Kontak WA</th>
                      <th className="p-3">Paket Belajar (12 Pertemuan)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {daftarSiswa.length > 0 ? (
                      daftarSiswa.map((s) => {
                        const periodeSiswa = daftarPeriode.filter(p => p.siswa_id === s.id);
                        return (
                          <tr key={s.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-bold text-gray-900">{s.nama_murid}</td>
                            <td className="p-3">{s.nama_orang_tua}</td>
                            <td className="p-3"><span className="bg-purple-100 text-[#581878] text-xs font-bold px-2 py-1 rounded">{s.jenjang_sekolah}</span></td>
                            <td className="p-3"><a href={`https://wa.me/${s.no_hp?.replace(/^0/, '62')}`} target="_blank" rel="noreferrer" className="text-emerald-600 font-bold hover:underline">💬 {s.no_hp}</a></td>
                            <td className="p-3">
                              {periodeSiswa.length > 0 ? (
                                periodeSiswa.map(p => (
                                  <div key={p.id} className="text-xs bg-amber-50 text-amber-900 border border-amber-200 p-1 rounded mb-1 font-semibold">
                                    📚 {p.paket_belajar?.nama_paket} ({p.bulan_periode})
                                  </div>
                                ))
                              ) : (
                                <span className="text-xs text-gray-400">Belum ada paket aktif</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="5" className="p-6 text-center text-gray-500">Belum ada pendaftaran siswa masuk.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: PRESENSI SISWA OLEH GURU/MENTOR */}
          {adminTab === 'presensi_s' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-purple-200">
                <h4 className="text-lg font-bold text-[#581878] mb-3">📝 Form Presensi Murid (Diisi oleh Guru/Mentor)</h4>
                <form onSubmit={handleTambahPresensiSiswa} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Pilih Murid & Paket</label>
                    <select
                      required
                      value={newPresensiSiswa.periode_id}
                      onChange={(e) => setNewPresensiSiswa({ ...newPresensiSiswa, periode_id: e.target.value })}
                      className="w-full px-4 py-2 border rounded-xl outline-none bg-white font-medium text-sm"
                    >
                      <option value="">-- Pilih Murid Terdaftar --</option>
                      {daftarPeriode.map(p => (
                        <option key={p.id} value={p.id}>{p.siswa?.nama_murid} - Paket: {p.paket_belajar?.nama_paket}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Pertemuan Ke (1-12)</label>
                    <input type="number" min="1" max="12" required value={newPresensiSiswa.pertemuan_ke} onChange={(e) => setNewPresensiSiswa({ ...newPresensiSiswa, pertemuan_ke: Number(e.target.value) })} className="w-full px-4 py-2 border rounded-xl" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Tanggal Pertemuan</label>
                    <input type="date" required value={newPresensiSiswa.tanggal_pertemuan} onChange={(e) => setNewPresensiSiswa({ ...newPresensiSiswa, tanggal_pertemuan: e.target.value })} className="w-full px-4 py-2 border rounded-xl" />
                  </div>

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

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Jurnal / Catatan Materi</label>
                    <input type="text" placeholder="Contoh: Membaca AHE Halaman 12-15" value={newPresensiSiswa.jurnal_materi} onChange={(e) => setNewPresensiSiswa({ ...newPresensiSiswa, jurnal_materi: e.target.value })} className="w-full px-4 py-2 border rounded-xl" />
                  </div>

                  <button type="submit" className="md:col-span-3 bg-[#581878] hover:bg-purple-900 text-white font-bold py-3 rounded-xl shadow mt-2">
                    Simpan Presensi Murid 🚀
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-md border border-purple-100">
                <h3 className="text-xl font-bold text-[#581878] mb-4">Riwayat Kehadiran & Jurnal Materi</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-purple-50 text-[#581878] uppercase text-xs">
                      <tr>
                        <th className="p-3">Tanggal</th>
                        <th className="p-3">Nama Siswa</th>
                        <th className="p-3">Pertemuan</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Jurnal Materi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {daftarPresensiSiswa.map((ps) => (
                        <tr key={ps.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-semibold">{ps.tanggal_pertemuan}</td>
                          <td className="p-3 font-bold">{ps.periode_belajar?.siswa?.nama_murid || 'Siswa'}</td>
                          <td className="p-3 font-bold text-[#581878]">Ke-{ps.pertemuan_ke}</td>
                          <td className="p-3">
                            <span className={`text-xs font-bold px-2 py-1 rounded ${ps.is_hadir ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                              {ps.is_hadir ? '✅ Hadir' : '❌ Absen'}
                            </span>
                            {ps.is_kelas_pengganti && <span className="ml-1 text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">Pengganti</span>}
                          </td>
                          <td className="p-3 text-gray-600">{ps.jurnal_materi || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MENTOR & PRESENSI HARIAN MENTOR */}
          {adminTab === 'mentor' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-md border border-purple-100">
                  <h4 className="text-lg font-bold text-[#581878] mb-3">👩‍🏫 Tambah Mentor Baru</h4>
                  <form onSubmit={handleTambahMentor} className="space-y-3">
                    <input type="text" placeholder="Nama Mentor" required value={newMentor.nama_mentor} onChange={(e) => setNewMentor({ ...newMentor, nama_mentor: e.target.value })} className="w-full px-4 py-2 border rounded-xl" />
                    <input type="text" placeholder="No. WhatsApp" required value={newMentor.no_hp} onChange={(e) => setNewMentor({ ...newMentor, no_hp: e.target.value })} className="w-full px-4 py-2 border rounded-xl" />
                    <input type="number" placeholder="Honor per Jam (Rp)" required value={newMentor.honor_per_jam} onChange={(e) => setNewMentor({ ...newMentor, honor_per_jam: Number(e.target.value) })} className="w-full px-4 py-2 border rounded-xl" />
                    <button type="submit" className="w-full bg-[#581878] text-white font-bold py-2 rounded-xl">Simpan Mentor</button>
                  </form>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-md border border-purple-100">
                  <h4 className="text-lg font-bold text-[#581878] mb-3">⏱️ Input Jam Mengajar Mentor</h4>
                  <form onSubmit={handleTambahPresensiMentor} className="space-y-3">
                    <select value={newPresensiMentor.mentor_id} onChange={(e) => setNewPresensiMentor({ ...newPresensiMentor, mentor_id: e.target.value })} className="w-full px-4 py-2 border rounded-xl bg-white">
                      <option value="">-- Pilih Mentor --</option>
                      {daftarMentor.map(m => <option key={m.id} value={m.id}>{m.nama_mentor}</option>)}
                    </select>
                    <div className="grid grid-cols-3 gap-2">
                      <input type="date" value={newPresensiMentor.tanggal} onChange={(e) => setNewPresensiMentor({ ...newPresensiMentor, tanggal: e.target.value })} className="px-2 py-2 border rounded-xl text-xs" />
                      <input type="time" value={newPresensiMentor.jam_masuk} onChange={(e) => setNewPresensiMentor({ ...newPresensiMentor, jam_masuk: e.target.value })} className="px-2 py-2 border rounded-xl text-xs" />
                      <input type="time" value={newPresensiMentor.jam_selesai} onChange={(e) => setNewPresensiMentor({ ...newPresensiMentor, jam_selesai: e.target.value })} className="px-2 py-2 border rounded-xl text-xs" />
                    </div>
                    <input type="number" step="0.5" placeholder="Total Jam Mengajar" value={newPresensiMentor.total_jam} onChange={(e) => setNewPresensiMentor({ ...newPresensiMentor, total_jam: Number(e.target.value) })} className="w-full px-4 py-2 border rounded-xl" />
                    <input type="text" placeholder="Kegiatan Pembelajaran" value={newPresensiMentor.kegiatan_pembelajaran} onChange={(e) => setNewPresensiMentor({ ...newPresensiMentor, kegiatan_pembelajaran: e.target.value })} className="w-full px-4 py-2 border rounded-xl" />
                    <button type="submit" className="w-full bg-[#F59E0B] text-white font-bold py-2 rounded-xl">Simpan Presensi Mentor</button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PAYROLL PENGGAJIAN MENTOR */}
          {adminTab === 'gaji' && (
            <div className="bg-white rounded-2xl p-6 shadow-md border border-purple-100">
              <h3 className="text-xl font-bold text-[#581878] mb-4">💵 Rekapitulasi Penggajian Mentor</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-purple-50 text-[#581878] uppercase text-xs">
                    <tr>
                      <th className="p-3">Nama Mentor</th>
                      <th className="p-3">Tarif / Jam</th>
                      <th className="p-3">Total Jam Mengajar</th>
                      <th className="p-3">Estimasi Gaji Pokok</th>
                      <th className="p-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {daftarMentor.map((m) => {
                      const totalJam = daftarPresensiMentor.filter(pm => pm.mentor_id === m.id).reduce((acc, curr) => acc + (Number(curr.total_jam) || 0), 0);
                      const totalGaji = totalJam * (m.honor_per_jam || 25000);
                      return (
                        <tr key={m.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-bold text-gray-900">{m.nama_mentor}</td>
                          <td className="p-3">Rp {(m.honor_per_jam || 25000).toLocaleString('id-ID')}</td>
                          <td className="p-3 font-bold text-[#581878]">{totalJam} Jam</td>
                          <td className="p-3 font-extrabold text-emerald-600">Rp {totalGaji.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-center">
                            <button onClick={() => alert(`Slip Gaji ${m.nama_mentor}:\nTotal Jam: ${totalJam} Jam\nTotal Diterima: Rp ${totalGaji.toLocaleString('id-ID')}`)} className="bg-purple-100 text-[#581878] font-bold text-xs px-3 py-1 rounded">
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

          {/* TAB 5: INVENTARIS LOGISTIK */}
          {adminTab === 'logistik' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-md border border-emerald-100">
                <h4 className="text-lg font-bold text-emerald-800 mb-3">➕ Tambah Inventaris Barang / Modul</h4>
                <form onSubmit={handleTambahBarang} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input type="text" placeholder="Nama Barang (Misal: Modul AHE 1)" required value={newBarang.nama_barang} onChange={(e) => setNewBarang({ ...newBarang, nama_barang: e.target.value })} className="px-4 py-2 border rounded-xl" />
                  <select value={newBarang.kategori} onChange={(e) => setNewBarang({ ...newBarang, kategori: e.target.value })} className="px-4 py-2 border rounded-xl bg-white">
                    <option value="buku">Buku / Modul</option>
                    <option value="kartu">Kartu Tanda Siswa</option>
                    <option value="atk">ATK</option>
                  </select>
                  <input type="number" placeholder="Stok Awal" value={newBarang.stok} onChange={(e) => setNewBarang({ ...newBarang, stok: Number(e.target.value) })} className="px-4 py-2 border rounded-xl" />
                  <button type="submit" className="bg-emerald-600 text-white font-bold py-2 rounded-xl">Simpan Logistik</button>
                </form>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {daftarInventaris.map((b) => (
                  <div key={b.id} className="bg-white p-5 rounded-2xl shadow border border-emerald-100 flex justify-between items-center">
                    <div>
                      <h5 className="font-bold text-gray-900">{b.nama_barang}</h5>
                      <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded uppercase">{b.kategori}</span>
                      <p className="text-sm font-black text-emerald-600 mt-2">Stok: {b.stok} Unit</p>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <button onClick={() => handleUpdateStokBarang(b.id, 1)} className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded text-xs">+ Tambah</button>
                      <button onClick={() => handleUpdateStokBarang(b.id, -1)} className="bg-red-100 text-red-800 font-bold px-3 py-1 rounded text-xs">- Kurang</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: PERIZINAN SISWA */}
          {adminTab === 'izin' && (
            <div className="bg-white rounded-2xl p-6 shadow-md border border-purple-100">
              <h3 className="text-xl font-bold text-[#D95338] mb-4">Daftar Pengajuan Perizinan Siswa</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-red-50 text-[#D95338] uppercase text-xs">
                    <tr>
                      <th className="p-3">Nama Murid</th>
                      <th className="p-3">Tanggal Izin</th>
                      <th className="p-3">Alasan</th>
                      <th className="p-3">Status Izin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {daftarPerizinan.map((i) => (
                      <tr key={i.id} className="border-b">
                        <td className="p-3 font-bold">{i.siswa?.nama_murid || 'Siswa'}</td>
                        <td className="p-3 font-semibold text-amber-600">{i.tanggal_izin}</td>
                        <td className="p-3">{i.alasan}</td>
                        <td className="p-3">
                          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded uppercase">
                            {i.status_izin}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: MASTER PAKET */}
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
                    <p className="text-gray-600 text-sm mb-4">{paket.deskripsi || 'Program bimbingan intensif 12 pertemuan.'}</p>
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
                          <option value="TK">PAUD / TK</option>
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
                      <label className="block text-sm font-bold text-gray-700 mb-1">Pilih Nama Murid</label>
                      <select
                        required
                        value={formIzin.siswa_id}
                        onChange={(e) => setFormIzin({ ...formIzin, siswa_id: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#D95338] outline-none bg-white"
                      >
                        <option value="">-- Pilih Nama Murid Terdaftar --</option>
                        {daftarSiswa.map(s => (
                          <option key={s.id} value={s.id}>{s.nama_murid} (Orang Tua: {s.nama_orang_tua})</option>
                        ))}
                      </select>
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

      {/* MODAL POPUP LOGIN ADMIN / GURU */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative border-4 border-[#581878]">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-xl">✕</button>
            <h3 className="text-2xl font-black text-[#581878] mb-2 text-center">Login Admin / Guru</h3>
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
