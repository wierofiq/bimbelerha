import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Inisialisasi Supabase Client
const supabaseUrl = 'https://izifwpviqpyxauafdlge.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6aWZ3cHZpcXB5eGF1YWZkbGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NDA2ODYsImV4cCI6MjEwNjUxNjY4Nn0.XpJEgQ3vpGOYmPVi-nsjrSRJI9RfR5kWTN_XsL-TCUU';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  // ==========================================
  // 1. STATE MANAGEMENT
  // ==========================================
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('guru');
  const [currentMentorProfile, setCurrentMentorProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Navigasi Admin
  const [adminTab, setAdminTab] = useState('siswa'); // 'siswa', 'mentor', 'pembayaran', 'modul'
  const [siswaSubTab, setSiswaSubTab] = useState('data'); // 'persetujuan', 'data', 'tambah_manual', 'presensi'
  const [mentorSubTab, setMentorSubTab] = useState('daftar'); // 'daftar', 'tambah', 'presensi', 'penggajian'
  
  // Navigasi Guru
  const [guruTab, setGuruTab] = useState('beranda'); // 'beranda', 'presensi', 'modul', 'profil'

  // Master Data
  const [paketList, setPaketList] = useState([]);
  const [daftarSiswa, setDaftarSiswa] = useState([]);
  const [daftarMentor, setDaftarMentor] = useState([]);
  const [daftarPeriode, setDaftarPeriode] = useState([]);
  const [daftarPresensiSiswa, setDaftarPresensiSiswa] = useState([]);
  const [daftarPembayaran, setDaftarPembayaran] = useState([]);
  const [daftarPresensiMentor, setDaftarPresensiMentor] = useState([]);
  const [daftarPenggajian, setDaftarPenggajian] = useState([]);
  const [daftarInventaris, setDaftarInventaris] = useState([]);

  // UI & Filter States
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showEditPasswordModal, setShowEditPasswordModal] = useState(false);
  const [expandedSiswaId, setExpandedSiswaId] = useState(null);
  const [filterBulanPresensi, setFilterBulanPresensi] = useState('');

  // Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [newPasswordGuru, setNewPasswordGuru] = useState('');

  const [formDaftar, setFormDaftar] = useState({ nama_murid: '', nama_orang_tua: '', no_hp: '', alamat: '', jenjang_sekolah: 'TK' });
  const [selectedPaket, setSelectedPaket] = useState([]);

  const [formSiswaManual, setFormSiswaManual] = useState({ nama_murid: '', nama_orang_tua: '', no_hp: '', alamat: '', jenjang_sekolah: 'TK' });
  const [selectedPaketManual, setSelectedPaketManual] = useState([]);

  const [newMentor, setNewMentor] = useState({ nama_mentor: '', email: '', password: '', no_hp: '', alamat: '', honor_per_jam: 25000, status: 'aktif' });
  const [formPresensiMentor, setFormPresensiMentor] = useState({ mentor_id: '', tanggal: new Date().toISOString().split('T')[0], total_jam: 0, kegiatan_pembelajaran: '' });
  const [formGaji, setFormGaji] = useState({ mentor_id: '', bulan_periode: new Date().toISOString().slice(0, 7), insentif: 0, bonus_kinerja: 0, potongan: 0, catatan: '' });
  
  const [formModul, setFormModul] = useState({ nama_barang: '', kategori: 'Buku', stok: 0, harga_satuan: 0, deskripsi: '', thumbnail: '' });
  
  const [formPembayaran, setFormPembayaran] = useState({ siswa_id: '', tanggal_pembayaran: new Date().toISOString().split('T')[0], items: [], total_bayar: 0, catatan: '' });
  const paymentItemOptions = ['Pendaftaran', 'Bulanan', 'Buku', 'Lainnya', 'Paket Belajar Bulanan'];

  const [newPresensiSiswa, setNewPresensiSiswa] = useState({ periode_id: '', pertemuan_ke: 1, tanggal_pertemuan: new Date().toISOString().split('T')[0], status_kehadiran: 'Hadir', jurnal_materi: '' });


  // ==========================================
  // 2. EFFECTS & DATA FETCHING
  // ==========================================
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) determineUserRoleAndProfile(session.user);
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
    return () => authListener.subscription.unsubscribe();
  }, []);

  async function determineUserRoleAndProfile(authUser) {
    if (authUser.email?.includes('admin')) {
      setUserRole('admin');
      setCurrentMentorProfile(null);
    } else {
      setUserRole('guru');
      const { data } = await supabase.from('mentor').select('*').eq('email', authUser.email).single();
      if (data) setCurrentMentorProfile(data);
    }
  }

  async function fetchPaket() {
    const { data } = await supabase.from('paket_belajar').select('*').order('created_at', { ascending: true });
    if (data) setPaketList(data);
  }

  async function fetchAllData() {
    const [siswa, mentor, periode, presensiS, pemb, presensiM, gaji, logistik] = await Promise.all([
      supabase.from('siswa').select('*').order('created_at', { ascending: false }),
      supabase.from('mentor').select('*').order('created_at', { ascending: false }),
      supabase.from('periode_belajar').select('*, siswa(nama_murid, status), paket_belajar(nama_paket)').order('created_at', { ascending: false }),
      supabase.from('presensi_siswa').select('*, mentor(nama_mentor), periode_belajar(siswa(nama_murid, siswa_id), paket_belajar(nama_paket))').order('tanggal_pertemuan', { ascending: false }),
      supabase.from('pembayaran_siswa').select('*, siswa(nama_murid)').order('tanggal_pembayaran', { ascending: false }),
      supabase.from('presensi_mentor').select('*, mentor(nama_mentor)').order('tanggal', { ascending: false }),
      supabase.from('penggajian_mentor').select('*, mentor(nama_mentor, honor_per_jam)').order('created_at', { ascending: false }),
      supabase.from('inventaris_logistik').select('*').order('nama_barang', { ascending: true })
    ]);

    setDaftarSiswa(siswa.data || []);
    setDaftarMentor(mentor.data || []);
    setDaftarPeriode(periode.data || []);
    setDaftarPresensiSiswa(presensiS.data || []);
    setDaftarPembayaran(pemb.data || []);
    setDaftarPresensiMentor(presensiM.data || []);
    setDaftarPenggajian(gaji.data || []);
    setDaftarInventaris(logistik.data || []);
  }

  // ==========================================
  // 3. HANDLERS - AUTHENTICATION
  // ==========================================
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    if (error) {
      setLoginError('Login gagal: ' + error.message);
    } else {
      setShowLoginModal(false);
      determineUserRoleAndProfile(data.user);
      setLoginEmail(''); setLoginPassword('');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null); setUserRole('guru'); setCurrentMentorProfile(null);
  };

  const handleGantiPasswordGuru = async (e) => {
    e.preventDefault();
    if (!newPasswordGuru || newPasswordGuru.length < 6) return alert('Password minimal 6 karakter!');
    const { error } = await supabase.auth.updateUser({ password: newPasswordGuru });
    if (error) alert('Gagal mengubah password: ' + error.message);
    else { alert('✅ Password berhasil diperbarui!'); setShowEditPasswordModal(false); setNewPasswordGuru(''); }
  };

  // ==========================================
  // 4. HANDLERS - ADMIN FUNCTIONS
  // ==========================================
  const handleTambahSiswaManual = async (e) => {
    e.preventDefault();
    if (selectedPaketManual.length === 0) return alert('Pilih minimal satu paket!');
    
    const { data: siswaData } = await supabase.from('siswa').insert([{ ...formSiswaManual, status: 'aktif' }]).select();
    if (siswaData && siswaData[0]) {
      const siswaId = siswaData[0].id;
      const currentBulan = new Date().toISOString().slice(0, 7);
      const periodeInserts = selectedPaketManual.map(pId => ({
        siswa_id: siswaId, paket_id: pId, bulan_periode: currentBulan, total_pertemuan: 12, status_periode: 'berjalan'
      }));
      await supabase.from('periode_belajar').insert(periodeInserts);
      alert('Siswa dan periode berhasil ditambahkan!');
      setFormSiswaManual({ nama_murid: '', nama_orang_tua: '', no_hp: '', alamat: '', jenjang_sekolah: 'TK' });
      setSelectedPaketManual([]);
      fetchAllData();
    }
  };

  const handleRolloverPeriode = async (periodeLama) => {
    if (!window.confirm(`Lakukan Rollover untuk ${periodeLama.siswa?.nama_murid}? Ini akan membuka periode baru 12 pertemuan.`)) return;
    try {
      await supabase.from('periode_belajar').update({ status_periode: 'selesai' }).eq('id', periodeLama.id);
      const nextMonth = new Date().toISOString().slice(0, 7);
      const { data: newP, error } = await supabase.from('periode_belajar').insert([{
        siswa_id: periodeLama.siswa_id, paket_id: periodeLama.paket_id, bulan_periode: nextMonth, total_pertemuan: 12, status_periode: 'berjalan'
      }]).select();
      if (error) throw error;
      if (newP && newP[0]) {
        await supabase.from('pembayaran_siswa').insert([{
          siswa_id: periodeLama.siswa_id, periode_id: newP[0].id, status_pembayaran: 'Belum Lunas', biaya_paket_belajar: 150000, item_bayar: 'Paket Belajar Bulanan'
        }]);
      }
      alert('✅ Rollover berhasil! Periode baru telah dibuat.');
      fetchAllData();
    } catch (err) { alert('Gagal rollover: ' + err.message); }
  };

  const handleTambahMentor = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error: errAuth } = await supabase.auth.signUp({ email: newMentor.email, password: newMentor.password, options: { data: { role: 'guru' } } });
      if (errAuth) console.warn(errAuth);

      const { error: errDb } = await supabase.from('mentor').insert([{
        nama_mentor: newMentor.nama_mentor, email: newMentor.email, no_hp: newMentor.no_hp, alamat: newMentor.alamat, honor_per_jam: newMentor.honor_per_jam, status: newMentor.status
      }]);
      if (errDb) throw errDb;

      alert('✅ Mentor berhasil didaftarkan! Mengarahkan ke WhatsApp...');
      const waText = `Halo Kak ${newMentor.nama_mentor},\nAkun Portal Pengajar Bimbel ErHa Anda telah aktif.\n\nLogin URL: ${window.location.origin}\nEmail: ${newMentor.email}\nPassword: ${newMentor.password}\n\nSilakan login dan ganti password Anda di menu profil. Terima kasih!`;
      window.open(`https://wa.me/${newMentor.no_hp.replace(/^0/, '62')}?text=${encodeURIComponent(waText)}`, '_blank');
      setNewMentor({ nama_mentor: '', email: '', password: '', no_hp: '', alamat: '', honor_per_jam: 25000, status: 'aktif' });
      fetchAllData();
    } catch (err) { alert('Gagal menambah mentor: ' + err.message); } finally { setLoading(false); }
  };

  const handleTambahPresensiMentor = async (e) => {
    e.preventDefault();
    await supabase.from('presensi_mentor').insert([{
        mentor_id: formPresensiMentor.mentor_id, tanggal: formPresensiMentor.tanggal, total_jam: formPresensiMentor.total_jam, kegiatan_pembelajaran: formPresensiMentor.kegiatan_pembelajaran
    }]);
    alert('Presensi mentor tersimpan!');
    setFormPresensiMentor({ ...formPresensiMentor, total_jam: 0, kegiatan_pembelajaran: '' });
    fetchAllData();
  };

  const handleSimpanGaji = async (e) => {
    e.preventDefault();
    const mentorRec = daftarMentor.find(m => m.id === formGaji.mentor_id);
    const totalJam = daftarPresensiMentor.filter(pm => pm.mentor_id === formGaji.mentor_id && pm.tanggal?.startsWith(formGaji.bulan_periode)).reduce((acc, curr) => acc + (Number(curr.total_jam) || 0), 0);
    const honorJam = mentorRec?.honor_per_jam || 25000;
    
    await supabase.from('penggajian_mentor').insert([{
      mentor_id: formGaji.mentor_id, bulan_periode: formGaji.bulan_periode, total_jam_mengajar: totalJam, honor_per_jam: honorJam, insentif: formGaji.insentif, bonus_kinerja: formGaji.bonus_kinerja, potongan: formGaji.potongan, catatan: formGaji.catatan, status_pembayaran: 'draft'
    }]);
    alert('✅ Rekap gaji bulanan berhasil digenerate!');
    fetchAllData();
  };

  const handleCatatPembayaran = async (e) => {
    e.preventDefault();
    if (formPembayaran.items.length === 0) return alert('Pilih minimal 1 item bayar!');
    const perItemValue = formPembayaran.total_bayar / formPembayaran.items.length;
    const inserts = formPembayaran.items.map(item => ({
      siswa_id: formPembayaran.siswa_id, item_bayar: item, jumlah_bayar: perItemValue, tanggal_pembayaran: formPembayaran.tanggal_pembayaran, catatan: formPembayaran.catatan, status_pembayaran: 'lunas'
    }));
    await supabase.from('pembayaran_siswa').insert(inserts);
    alert('✅ Pembayaran berhasil dicatat!');
    setFormPembayaran({ siswa_id: '', tanggal_pembayaran: new Date().toISOString().split('T')[0], items: [], total_bayar: 0, catatan: '' });
    fetchAllData();
  };

  const handleTambahModul = async (e) => {
    e.preventDefault();
    await supabase.from('inventaris_logistik').insert([formModul]);
    alert('✅ Modul/Inventaris ditambahkan!');
    setFormModul({ nama_barang: '', kategori: 'Buku', stok: 0, harga_satuan: 0, deskripsi: '', thumbnail: '' });
    fetchAllData();
  };

  // ==========================================
  // 5. HANDLERS - MENTOR / PUBLIC
  // ==========================================
  const handleUpdateProfilGuru = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('mentor').update({ no_hp: currentMentorProfile.no_hp, alamat: currentMentorProfile.alamat }).eq('id', currentMentorProfile.id);
    if (error) alert('Gagal memperbarui profil: ' + error.message);
    else { alert('✅ Profil berhasil diperbarui!'); fetchAllData(); }
  };

  const handleTambahPresensiSiswa = async (e) => {
    e.preventDefault();
    if (!newPresensiSiswa.periode_id) return alert('Pilih nama murid!');
    if (!currentMentorProfile) return alert('Sesi mentor tidak valid!');
    await supabase.from('presensi_siswa').insert([{
      periode_id: newPresensiSiswa.periode_id, mentor_id: currentMentorProfile.id, pertemuan_ke: newPresensiSiswa.pertemuan_ke, tanggal_pertemuan: newPresensiSiswa.tanggal_pertemuan,
      is_hadir: newPresensiSiswa.status_kehadiran === 'Hadir', is_kelas_pengganti: false, jurnal_materi: `[${newPresensiSiswa.status_kehadiran}] ${newPresensiSiswa.jurnal_materi}`
    }]);
    alert('✅ Presensi berhasil dicatat!');
    setNewPresensiSiswa(prev => ({ ...prev, jurnal_materi: '' }));
    fetchAllData();
  };

  const handleDaftarSubmit = async (e) => {
    e.preventDefault();
    if (selectedPaket.length === 0) return alert('Pilih minimal satu paket!');
    setLoading(true);
    try {
      const { data: siswaData } = await supabase.from('siswa').insert([{ ...formDaftar, status: 'pending' }]).select();
      if (siswaData && siswaData[0]) {
        const siswaId = siswaData[0].id;
        const currentBulan = new Date().toISOString().slice(0, 7);
        const periodeInserts = selectedPaket.map(pId => ({ siswa_id: siswaId, paket_id: pId, bulan_periode: currentBulan, total_pertemuan: 12, status_periode: 'berjalan' }));
        await supabase.from('periode_belajar').insert(periodeInserts);
        fetchAllData();
      }
    } finally {
      setLoading(false);
      alert('Pendaftaran Berhasil! Mengarahkan ke WhatsApp Admin...');
      const waText = `Halo Admin Bimbel ErHa,\nSaya ${formDaftar.nama_orang_tua} mendaftarkan ${formDaftar.nama_murid}. Mohon konfirmasi.`;
      window.open(`https://wa.me/6281915058297?text=${encodeURIComponent(waText)}`, '_blank');
      setFormDaftar({ nama_murid: '', nama_orang_tua: '', no_hp: '', alamat: '', jenjang_sekolah: 'TK' });
    }
  };

  const periodeSiswaAktif = daftarPeriode.filter(p => p.siswa?.status === 'aktif' && p.status_periode === 'berjalan');

  return (
    <div className="min-h-screen bg-[#FFFDF0] font-sans text-gray-800">
      
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-[#581878] shadow-lg border-b-4 border-[#F59E0B]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="Bimbel ErHa Logo" className="h-10 w-10 object-contain bg-white rounded-full p-1" />
            <div>
              <h1 className="text-white font-extrabold text-lg leading-none">Bimbel ErHa</h1>
              <p className="text-[#F59E0B] font-bold text-xs">Rumah Hebat</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-xs bg-amber-400 text-purple-950 font-black px-3 py-1 rounded-full shadow uppercase">
                  {userRole === 'admin' ? '👑 Admin' : `👩‍🏫 Guru: ${currentMentorProfile?.nama_mentor || ''}`}
                </span>
                <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-1.5 px-4 rounded-full text-sm transition shadow">Keluar</button>
              </div>
            ) : (
              <button onClick={() => setShowLoginModal(true)} className="bg-purple-900 hover:bg-purple-950 text-white font-bold py-1.5 px-4 rounded-full text-sm border border-purple-400 transition">🔐 Login Portal</button>
            )}
          </div>
        </div>
      </nav>

      {/* RENDER DASHBOARD BERDASARKAN ROLE */}
      {user ? (
        <div className="max-w-7xl mx-auto px-4 py-8">
          
          {/* ======================================================= */}
          {/* 👑 PORTAL ADMIN                                         */}
          {/* ======================================================= */}
          {userRole === 'admin' && (
            <div>
              <div className="flex overflow-x-auto border-b-2 border-purple-200 mb-6 space-x-2 pb-1">
                <button onClick={() => setAdminTab('siswa')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm ${adminTab === 'siswa' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600'}`}>📋 SISWA</button>
                <button onClick={() => setAdminTab('mentor')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm ${adminTab === 'mentor' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600'}`}>👩‍‍🏫 MENTOR</button>
                <button onClick={() => setAdminTab('pembayaran')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm ${adminTab === 'pembayaran' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600'}`}>💵 PEMBAYARAN</button>
                <button onClick={() => setAdminTab('modul')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm ${adminTab === 'modul' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600'}`}>📚 MODUL / INVENTARIS</button>
              </div>

              {/* ADMIN: TAB SISWA */}
              {adminTab === 'siswa' && (
                <div className="space-y-6">
                  <div className="flex space-x-2 border-b pb-3">
                    <button onClick={() => setSiswaSubTab('persetujuan')} className={`px-4 py-2 rounded-lg font-bold text-xs ${siswaSubTab === 'persetujuan' ? 'bg-amber-400 text-purple-950' : 'bg-white'}`}>Persetujuan (Pending)</button>
                    <button onClick={() => setSiswaSubTab('data')} className={`px-4 py-2 rounded-lg font-bold text-xs ${siswaSubTab === 'data' ? 'bg-purple-900 text-white' : 'bg-white'}`}>Data Siswa & Detail</button>
                    <button onClick={() => setSiswaSubTab('tambah_manual')} className={`px-4 py-2 rounded-lg font-bold text-xs ${siswaSubTab === 'tambah_manual' ? 'bg-purple-900 text-white' : 'bg-white'}`}>+ Tambah Manual</button>
                    <button onClick={() => setSiswaSubTab('presensi')} className={`px-4 py-2 rounded-lg font-bold text-xs ${siswaSubTab === 'presensi' ? 'bg-purple-900 text-white' : 'bg-white'}`}>Rekap Presensi</button>
                  </div>

                  {siswaSubTab === 'persetujuan' && (
                    <div className="bg-white rounded-2xl p-6 shadow-md">
                      <h3 className="text-lg font-bold text-[#581878] mb-4">Persetujuan Pendaftaran Siswa Baru</h3>
                      <table className="w-full text-left text-sm">
                        <thead className="bg-purple-50 text-[#581878] uppercase text-xs"><tr><th className="p-3">Nama</th><th className="p-3">Wali</th><th className="p-3">Status</th><th className="p-3 text-center">Aksi</th></tr></thead>
                        <tbody>
                          {daftarSiswa.filter(s => s.status === 'pending').map((s) => (
                            <tr key={s.id} className="border-b">
                              <td className="p-3 font-bold">{s.nama_murid}</td><td className="p-3">{s.nama_orang_tua}</td><td className="p-3"><span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded">Pending</span></td>
                              <td className="p-3 text-center"><button onClick={async () => { await supabase.from('siswa').update({status: 'aktif'}).eq('id', s.id); fetchAllData(); }} className="bg-emerald-600 text-white font-bold text-xs px-3 py-1.5 rounded">✓ Setujui Aktif</button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {siswaSubTab === 'tambah_manual' && (
                    <div className="bg-white rounded-2xl p-6 shadow-md">
                      <h3 className="text-lg font-bold text-[#581878] mb-4">Form Tambah Siswa Internal</h3>
                      <form onSubmit={handleTambahSiswaManual} className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="Nama Murid" required value={formSiswaManual.nama_murid} onChange={e => setFormSiswaManual({...formSiswaManual, nama_murid: e.target.value})} className="border p-3 rounded-xl" />
                        <input type="text" placeholder="Nama Wali" required value={formSiswaManual.nama_orang_tua} onChange={e => setFormSiswaManual({...formSiswaManual, nama_orang_tua: e.target.value})} className="border p-3 rounded-xl" />
                        <input type="text" placeholder="Kontak / WhatsApp" value={formSiswaManual.no_hp} onChange={e => setFormSiswaManual({...formSiswaManual, no_hp: e.target.value})} className="border p-3 rounded-xl" />
                        <div className="border p-3 rounded-xl bg-gray-50">
                          <p className="text-xs font-bold mb-2">Pilih Paket Belajar:</p>
                          <div className="grid grid-cols-2 gap-2">
                            {paketList.map(p => (
                              <label key={p.id} className="text-sm cursor-pointer"><input type="checkbox" className="mr-1" onChange={(e) => {
                                if(e.target.checked) setSelectedPaketManual([...selectedPaketManual, p.id]);
                                else setSelectedPaketManual(selectedPaketManual.filter(id => id !== p.id));
                              }} /> {p.nama_paket}</label>
                            ))}
                          </div>
                        </div>
                        <button type="submit" className="col-span-2 bg-[#581878] text-white py-3 rounded-xl font-bold shadow">Simpan Siswa & Generate Periode</button>
                      </form>
                    </div>
                  )}

                  {siswaSubTab === 'data' && (
                    <div className="bg-white rounded-2xl p-6 shadow-md">
                      <h3 className="text-lg font-bold text-[#581878] mb-4">Data Siswa Aktif & Rollover</h3>
                      <table className="w-full text-left text-sm">
                        <thead className="bg-purple-50 text-[#581878] uppercase text-xs"><tr><th className="p-3">Nama Murid</th><th className="p-3">Kontak Wali</th><th className="p-3 text-center">Aksi</th></tr></thead>
                        <tbody>
                          {daftarSiswa.filter(s => s.status === 'aktif').map(s => {
                            const isExpanded = expandedSiswaId === s.id;
                            const periodeAktif = daftarPeriode.find(p => p.siswa_id === s.id && p.status_periode === 'berjalan');
                            const presensiCount = periodeAktif ? daftarPresensiSiswa.filter(ps => ps.periode_id === periodeAktif.id).length : 0;
                            const butuhRollover = presensiCount >= 12;

                            return (
                              <React.Fragment key={s.id}>
                                <tr className="border-b hover:bg-gray-50 transition">
                                  <td className="p-3">
                                    <strong className="text-[15px]">{s.nama_murid}</strong>
                                    {butuhRollover && <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded shadow animate-pulse">⚠️ Siap Rollover (12/12)</span>}
                                  </td>
                                  <td className="p-3">{s.nama_orang_tua} <span className="text-gray-500 text-xs block">{s.no_hp}</span></td>
                                  <td className="p-3 text-center space-x-2">
                                    <button onClick={() => setExpandedSiswaId(isExpanded ? null : s.id)} className={`px-3 py-1.5 rounded text-xs font-bold transition ${isExpanded ? 'bg-[#581878] text-white' : 'bg-blue-100 text-blue-700'}`}>{isExpanded ? 'Tutup Detail' : 'Detail'}</button>
                                    <button className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded text-xs font-bold">Edit</button>
                                    <button className="bg-red-100 text-red-700 px-3 py-1.5 rounded text-xs font-bold">Hapus</button>
                                  </td>
                                </tr>
                                {isExpanded && (
                                  <tr className="bg-indigo-50/50 border-b-2 border-purple-200">
                                    <td colSpan="3" className="p-6">
                                      <div className="grid grid-cols-2 gap-6">
                                        <div className="bg-white p-4 rounded-xl shadow-sm border">
                                          <div className="flex justify-between items-center mb-3">
                                            <h5 className="font-bold text-[#581878]">Rekam Presensi Sesi (1-12)</h5>
                                            {butuhRollover && periodeAktif && (
                                              <button onClick={() => handleRolloverPeriode(periodeAktif)} className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded shadow">🔄 Eksekusi Rollover</button>
                                            )}
                                          </div>
                                          <ul className="text-xs space-y-2">
                                            {daftarPresensiSiswa.filter(ps => ps.periode_belajar?.siswa_id === s.id).map(ps => (
                                              <li key={ps.id} className="flex items-center gap-2">✅ <span className="font-semibold">{ps.tanggal_pertemuan}</span> <span>(Sesi ke-{ps.pertemuan_ke})</span></li>
                                            ))}
                                            {daftarPresensiSiswa.filter(ps => ps.periode_belajar?.siswa_id === s.id).length === 0 && <span className="text-gray-400">Belum ada data presensi.</span>}
                                          </ul>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl shadow-sm border">
                                          <h5 className="font-bold text-[#581878] mb-3">Riwayat Pembayaran</h5>
                                          <ul className="text-xs space-y-2">
                                            {daftarPembayaran.filter(pb => pb.siswa_id === s.id).map(pb => (
                                              <li key={pb.id} className="flex items-center gap-2">💰 <span className="font-semibold">{pb.tanggal_pembayaran}</span> <span>{pb.item_bayar} (Rp {Number(pb.jumlah_bayar).toLocaleString('id-ID')})</span></li>
                                            ))}
                                            {daftarPembayaran.filter(pb => pb.siswa_id === s.id).length === 0 && <span className="text-gray-400">Belum ada transaksi pembayaran.</span>}
                                          </ul>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {siswaSubTab === 'presensi' && (
                    <div className="bg-white rounded-2xl p-6 shadow-md">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-[#581878]">Rekap Presensi Seluruh Siswa</h3>
                        <div className="flex items-center space-x-2">
                          <label className="text-sm font-bold">Filter Bulan:</label>
                          <input type="month" value={filterBulanPresensi} onChange={e => setFilterBulanPresensi(e.target.value)} className="border px-3 py-1.5 rounded-lg text-sm outline-none" />
                        </div>
                      </div>
                      <table className="w-full text-left text-sm">
                        <thead className="bg-purple-50 text-[#581878] uppercase text-xs"><tr><th className="p-3">Tanggal</th><th className="p-3">Siswa</th><th className="p-3">Guru</th><th className="p-3">Pertemuan</th><th className="p-3">Jurnal</th></tr></thead>
                        <tbody>
                          {daftarPresensiSiswa.filter(ps => filterBulanPresensi ? ps.tanggal_pertemuan.startsWith(filterBulanPresensi) : true).map(ps => (
                            <tr key={ps.id} className="border-b">
                              <td className="p-3 font-semibold">{ps.tanggal_pertemuan}</td><td className="p-3 font-bold">{ps.periode_belajar?.siswa?.nama_murid}</td>
                              <td className="p-3 text-purple-900 font-bold">{ps.mentor?.nama_mentor}</td><td className="p-3 font-bold">Ke-{ps.pertemuan_ke}</td><td className="p-3 text-gray-600">{ps.jurnal_materi}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ADMIN: TAB MENTOR */}
              {adminTab === 'mentor' && (
                <div className="space-y-6">
                  <div className="flex space-x-2 border-b pb-3">
                    <button onClick={() => setMentorSubTab('daftar')} className={`px-4 py-2 rounded-lg font-bold text-xs ${mentorSubTab === 'daftar' ? 'bg-purple-900 text-white' : 'bg-white'}`}>Daftar Mentor</button>
                    <button onClick={() => setMentorSubTab('tambah')} className={`px-4 py-2 rounded-lg font-bold text-xs ${mentorSubTab === 'tambah' ? 'bg-purple-900 text-white' : 'bg-white'}`}>+ Tambah Mentor</button>
                    <button onClick={() => setMentorSubTab('presensi')} className={`px-4 py-2 rounded-lg font-bold text-xs ${mentorSubTab === 'presensi' ? 'bg-purple-900 text-white' : 'bg-white'}`}>Presensi Kerja</button>
                    <button onClick={() => setMentorSubTab('penggajian')} className={`px-4 py-2 rounded-lg font-bold text-xs ${mentorSubTab === 'penggajian' ? 'bg-purple-900 text-white' : 'bg-white'}`}>Penggajian (Payroll)</button>
                  </div>

                  {mentorSubTab === 'daftar' && (
                    <div className="bg-white rounded-2xl p-6 shadow-md">
                      <h4 className="text-lg font-bold text-[#581878] mb-4">Daftar Mentor Terdaftar</h4>
                      <table className="w-full text-left text-sm">
                        <thead className="bg-purple-50 text-[#581878] uppercase text-xs"><tr><th className="p-3">Nama</th><th className="p-3">Email Login</th><th className="p-3">Tarif / Jam</th><th className="p-3 text-center">Aksi</th></tr></thead>
                        <tbody>
                          {daftarMentor.map(m => (
                            <tr key={m.id} className="border-b">
                              <td className="p-3 font-bold">{m.nama_mentor}</td><td className="p-3 text-purple-800">{m.email}</td><td className="p-3">Rp {(m.honor_per_jam || 25000).toLocaleString('id-ID')}</td>
                              <td className="p-3 text-center"><button onClick={async () => { if(window.confirm('Hapus mentor?')) { await supabase.from('mentor').delete().eq('id', m.id); fetchAllData(); } }} className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">Hapus</button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {mentorSubTab === 'tambah' && (
                    <div className="bg-white rounded-2xl p-6 shadow-md">
                      <h4 className="text-lg font-bold text-[#581878] mb-4">Tambah Mentor Baru</h4>
                      <form onSubmit={handleTambahMentor} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Nama Lengkap Mentor" required value={newMentor.nama_mentor} onChange={(e) => setNewMentor({...newMentor, nama_mentor: e.target.value})} className="px-4 py-3 border rounded-xl" />
                        <input type="text" placeholder="No. WhatsApp (08...)" required value={newMentor.no_hp} onChange={(e) => setNewMentor({...newMentor, no_hp: e.target.value})} className="px-4 py-3 border rounded-xl" />
                        <input type="email" placeholder="Email Login Portal" required value={newMentor.email} onChange={(e) => setNewMentor({...newMentor, email: e.target.value})} className="px-4 py-3 border rounded-xl" />
                        <input type="password" placeholder="Password Login Sementara" required value={newMentor.password} onChange={(e) => setNewMentor({...newMentor, password: e.target.value})} className="px-4 py-3 border rounded-xl" />
                        <input type="number" placeholder="Tarif Honor per Jam (Rp)" required value={newMentor.honor_per_jam} onChange={(e) => setNewMentor({...newMentor, honor_per_jam: Number(e.target.value)})} className="px-4 py-3 border rounded-xl col-span-2" />
                        <button type="submit" disabled={loading} className="md:col-span-2 bg-[#581878] text-white font-bold py-3 rounded-xl shadow mt-2">{loading ? 'Memproses...' : 'Simpan Mentor & Kirim WA 🚀'}</button>
                      </form>
                    </div>
                  )}

                  {mentorSubTab === 'presensi' && (
                    <div className="bg-white p-6 rounded-xl shadow">
                       <h3 className="text-lg font-bold text-[#581878] mb-4">Input Jam Kerja Mentor</h3>
                       <form onSubmit={handleTambahPresensiMentor} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-gray-50 p-4 rounded-xl border">
                          <select required value={formPresensiMentor.mentor_id} onChange={e => setFormPresensiMentor({...formPresensiMentor, mentor_id: e.target.value})} className="border p-3 rounded-xl">
                             <option value="">-- Pilih Mentor --</option>
                             {daftarMentor.map(m => <option key={m.id} value={m.id}>{m.nama_mentor}</option>)}
                          </select>
                          <input type="date" required value={formPresensiMentor.tanggal} onChange={e => setFormPresensiMentor({...formPresensiMentor, tanggal: e.target.value})} className="border p-3 rounded-xl" />
                          <input type="number" step="0.5" placeholder="Total Jam Mengajar" required value={formPresensiMentor.total_jam} onChange={e => setFormPresensiMentor({...formPresensiMentor, total_jam: parseFloat(e.target.value)})} className="border p-3 rounded-xl" />
                          <button type="submit" className="bg-[#581878] text-white py-3 rounded-xl font-bold shadow">Catat Total Jam</button>
                       </form>
                       <table className="w-full text-left text-sm">
                          <thead className="bg-purple-50 text-[#581878]"><tr><th className="p-3">Tanggal</th><th className="p-3">Mentor</th><th className="p-3">Total Jam</th><th className="p-3 text-center">Aksi</th></tr></thead>
                          <tbody>
                            {daftarPresensiMentor.slice(0, 15).map(pm => (
                              <tr key={pm.id} className="border-b"><td className="p-3">{pm.tanggal}</td><td className="p-3 font-bold">{pm.mentor?.nama_mentor}</td><td className="p-3 font-semibold text-emerald-600">{pm.total_jam} Jam</td><td className="p-3 text-center"><button onClick={async () => { await supabase.from('presensi_mentor').delete().eq('id', pm.id); fetchAllData(); }} className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">Hapus</button></td></tr>
                            ))}
                          </tbody>
                       </table>
                    </div>
                  )}

                  {mentorSubTab === 'penggajian' && (
                    <div className="bg-white p-6 rounded-xl shadow space-y-6">
                       <h3 className="text-lg font-bold text-[#581878]">Hitung Gaji Bulanan</h3>
                       <form onSubmit={handleSimpanGaji} className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-6">
                          <select required value={formGaji.mentor_id} onChange={e => setFormGaji({...formGaji, mentor_id: e.target.value})} className="border p-3 rounded-xl"><option value="">-- Pilih Mentor --</option>{daftarMentor.map(m => <option key={m.id} value={m.id}>{m.nama_mentor}</option>)}</select>
                          <input type="month" required value={formGaji.bulan_periode} onChange={e => setFormGaji({...formGaji, bulan_periode: e.target.value})} className="border p-3 rounded-xl" />
                          <input type="number" placeholder="Insentif Tambahan (Rp)" value={formGaji.insentif} onChange={e => setFormGaji({...formGaji, insentif: Number(e.target.value)})} className="border p-3 rounded-xl" />
                          <input type="number" placeholder="Bonus Kinerja (Rp)" value={formGaji.bonus_kinerja} onChange={e => setFormGaji({...formGaji, bonus_kinerja: Number(e.target.value)})} className="border p-3 rounded-xl" />
                          <input type="number" placeholder="Potongan (Rp)" value={formGaji.potongan} onChange={e => setFormGaji({...formGaji, potongan: Number(e.target.value)})} className="border p-3 rounded-xl border-red-300 bg-red-50" />
                          <button type="submit" className="bg-emerald-600 text-white py-3 rounded-xl font-bold shadow">Proses Hitung Gaji</button>
                       </form>
                       
                       <table className="w-full text-sm mt-4">
                          <thead className="bg-purple-50 text-[#581878] uppercase text-xs"><tr className="text-left">
                            <th className="p-3">Bulan</th><th className="p-3">Mentor</th><th className="p-3 text-center">Jam</th><th className="p-3">Total Bersih</th><th className="p-3 text-center">Status</th><th className="p-3 text-center">Aksi</th>
                          </tr></thead>
                          <tbody>
                            {daftarPenggajian.map(g => {
                              const totalHonor = (g.total_jam_mengajar * g.honor_per_jam) + Number(g.insentif) + Number(g.bonus_kinerja) - Number(g.potongan);
                              return (
                                 <tr key={g.id} className="border-b text-left">
                                   <td className="p-3 font-semibold">{g.bulan_periode}</td><td className="p-3 font-bold">{g.mentor?.nama_mentor}</td>
                                   <td className="p-3 text-center">{g.total_jam_mengajar}</td>
                                   <td className="p-3 font-extrabold text-emerald-600">Rp {totalHonor.toLocaleString('id-ID')}</td>
                                   <td className="p-3 text-center"><span className={`px-2 py-1 rounded text-xs font-bold uppercase ${g.status_pembayaran === 'dibayar' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{g.status_pembayaran}</span></td>
                                   <td className="p-3 text-center space-x-1">
                                      <button className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">Detail</button>
                                      {g.status_pembayaran !== 'dibayar' && <button onClick={async () => { await supabase.from('penggajian_mentor').update({status_pembayaran: 'dibayar'}).eq('id', g.id); fetchAllData(); }} className="bg-emerald-600 text-white px-2 py-1 rounded text-xs font-bold shadow">✓ Bayar</button>}
                                      <button onClick={async () => { await supabase.from('penggajian_mentor').delete().eq('id', g.id); fetchAllData(); }} className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">Hapus</button>
                                   </td>
                                 </tr>
                              );
                            })}
                          </tbody>
                       </table>
                    </div>
                  )}
                </div>
              )}

              {/* ADMIN: TAB PEMBAYARAN */}
              {adminTab === 'pembayaran' && (
                 <div>
                    <div className="bg-white p-6 rounded-xl shadow mb-6 border-t-4 border-emerald-500">
                       <h3 className="text-xl font-bold text-[#581878] mb-4">Catat Penerimaan Pembayaran</h3>
                       <form onSubmit={handleCatatPembayaran} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <select required value={formPembayaran.siswa_id} onChange={e => setFormPembayaran({...formPembayaran, siswa_id: e.target.value})} className="w-full border p-3 rounded-xl font-medium">
                               <option value="">-- Pilih Siswa --</option>
                               {daftarSiswa.filter(s => s.status === 'aktif').map(s => <option key={s.id} value={s.id}>{s.nama_murid}</option>)}
                            </select>
                            <input type="date" required value={formPembayaran.tanggal_pembayaran} onChange={e => setFormPembayaran({...formPembayaran, tanggal_pembayaran: e.target.value})} className="w-full border p-3 rounded-xl font-medium" />
                            <input type="number" placeholder="Total Uang Diterima (Rp)" required value={formPembayaran.total_bayar} onChange={e => setFormPembayaran({...formPembayaran, total_bayar: Number(e.target.value)})} className="w-full border p-3 rounded-xl font-extrabold text-lg text-emerald-700 bg-emerald-50" />
                          </div>
                          
                          <div className="space-y-4">
                            <div className="border p-4 rounded-xl bg-gray-50">
                               <p className="text-sm font-bold mb-3 text-[#581878]">Centang Item Pembayaran (Bisa Lebih Dari Satu):</p>
                               <div className="grid grid-cols-2 gap-3">
                                 {paymentItemOptions.map(item => (
                                   <label key={item} className="text-sm font-medium cursor-pointer flex items-center">
                                     <input type="checkbox" className="mr-2 w-4 h-4 accent-[#581878]" onChange={(e) => {
                                       if(e.target.checked) setFormPembayaran({...formPembayaran, items: [...formPembayaran.items, item]});
                                       else setFormPembayaran({...formPembayaran, items: formPembayaran.items.filter(i => i !== item)});
                                     }} /> {item}
                                   </label>
                                 ))}
                               </div>
                            </div>
                            <button type="submit" className="w-full bg-[#581878] hover:bg-purple-900 text-white py-3 rounded-xl font-bold shadow-lg transition">Simpan & Pecah Transaksi</button>
                          </div>
                       </form>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow">
                      <h4 className="text-lg font-bold text-[#581878] mb-4">Riwayat Terakhir</h4>
                      <table className="w-full text-left text-sm">
                        <thead className="bg-purple-50 text-[#581878] uppercase text-xs"><tr><th className="p-3">Tanggal</th><th className="p-3">Siswa</th><th className="p-3">Item Bayar</th><th className="p-3">Proporsi Nominal</th></tr></thead>
                        <tbody>
                          {daftarPembayaran.slice(0, 15).map(pb => (
                             <tr key={pb.id} className="border-b"><td className="p-3">{pb.tanggal_pembayaran}</td><td className="p-3 font-bold">{pb.siswa?.nama_murid}</td><td className="p-3"><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">{pb.item_bayar}</span></td><td className="p-3 text-emerald-600 font-bold">Rp {Number(pb.jumlah_bayar).toLocaleString('id-ID')}</td></tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                 </div>
              )}

              {/* ADMIN: TAB MODUL */}
              {adminTab === 'modul' && (
                 <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow border border-emerald-200">
                       <h3 className="font-bold text-[#581878] mb-4">Tambah Modul / Bahan Ajar Baru</h3>
                       <form onSubmit={handleTambahModul} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input type="text" placeholder="Nama Item Modul" required value={formModul.nama_barang} onChange={e => setFormModul({...formModul, nama_barang: e.target.value})} className="border p-3 rounded-xl" />
                          <input type="number" placeholder="Stok Fisik Awal" required value={formModul.stok} onChange={e => setFormModul({...formModul, stok: Number(e.target.value)})} className="border p-3 rounded-xl" />
                          <input type="text" placeholder="URL Link Gambar/Thumbnail (Opsional)" value={formModul.thumbnail} onChange={e => setFormModul({...formModul, thumbnail: e.target.value})} className="border p-3 rounded-xl md:col-span-2" />
                          <textarea placeholder="Deskripsi Singkat Modul" value={formModul.deskripsi} onChange={e => setFormModul({...formModul, deskripsi: e.target.value})} className="border p-3 rounded-xl md:col-span-2" rows="2" />
                          <button type="submit" className="md:col-span-2 bg-[#581878] text-white py-3 rounded-xl font-bold shadow">Simpan Ke Inventaris</button>
                       </form>
                    </div>

                    {/* Alert Stok Menipis */}
                    {daftarInventaris.some(b => b.stok < 3) && (
                       <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl shadow-sm">
                          <h4 className="font-bold text-red-700">🚨 Peringatan Stok Menipis (Di Bawah 3 Unit)</h4>
                          <ul className="list-disc ml-5 text-sm mt-2 text-red-600 font-medium space-y-1">
                             {daftarInventaris.filter(b => b.stok < 3).map(b => <li key={b.id}>{b.nama_barang} - Sisa Stok: <strong>{b.stok}</strong></li>)}
                          </ul>
                       </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                       {daftarInventaris.map(b => (
                          <div key={b.id} className="bg-white p-4 rounded-xl shadow-sm border flex items-center space-x-4">
                             {b.thumbnail ? ( <img src={b.thumbnail} alt={b.nama_barang} className="w-16 h-16 object-cover rounded-lg bg-gray-100" /> ) : ( <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center text-2xl">📚</div> )}
                             <div className="flex-1">
                                <h5 className="font-bold text-gray-900 leading-tight">{b.nama_barang}</h5>
                                <p className="text-[10px] text-gray-500 my-1 truncate">{b.deskripsi || '-'}</p>
                                <p className={`text-xs font-black px-2 py-0.5 rounded inline-block ${b.stok > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>Stok: {b.stok}</p>
                             </div>
                             <div className="flex flex-col space-y-1">
                               <button onClick={async () => { await supabase.from('inventaris_logistik').update({stok: b.stok + 1}).eq('id', b.id); fetchAllData(); }} className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-bold">+</button>
                               <button onClick={async () => { await supabase.from('inventaris_logistik').update({stok: Math.max(0, b.stok - 1)}).eq('id', b.id); fetchAllData(); }} className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold">-</button>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              )}
            </div>
          )}

          {/* ======================================================= */}
          {/* 👩‍🏫 PORTAL GURU (MENTOR)                                */}
          {/* ======================================================= */}
          {userRole === 'guru' && (
            <div className="space-y-6">
              <div className="flex overflow-x-auto border-b-2 border-purple-200 space-x-2 pb-1">
                <button onClick={() => setGuruTab('beranda')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm ${guruTab === 'beranda' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600'}`}>🏠 Beranda</button>
                <button onClick={() => setGuruTab('presensi')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm ${guruTab === 'presensi' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600'}`}>📝 Presensi Siswa</button>
                <button onClick={() => setGuruTab('modul')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm ${guruTab === 'modul' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600'}`}>📚 Modul Ajar</button>
                <button onClick={() => setGuruTab('profil')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm ${guruTab === 'profil' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600'}`}>👤 Profil Akun</button>
              </div>

              {guruTab === 'beranda' && (
                <div className="bg-gradient-to-r from-purple-800 to-indigo-900 text-white p-6 rounded-2xl shadow-md relative overflow-hidden">
                  <div className="relative z-10">
                    <h2 className="text-2xl font-black mb-2">Selamat datang, Kak {currentMentorProfile?.nama_mentor || 'Guru'} 👋</h2>
                    <p className="text-purple-200 text-sm">Semangat menebar ilmu hari ini di Bimbel ErHa!</p>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                       <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                          <p className="text-sm font-bold text-purple-200">Total Sesi Diampu (Bulan Ini)</p>
                          <h3 className="text-3xl font-black mt-1">
                            {daftarPresensiSiswa.filter(ps => ps.mentor_id === currentMentorProfile?.id && ps.tanggal_pertemuan.startsWith(new Date().toISOString().slice(0, 7))).length} Sesi
                          </h3>
                       </div>
                       <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                          <p className="text-sm font-bold text-purple-200">Status Akun</p>
                          <h3 className="text-xl font-black mt-1 uppercase text-amber-300">{currentMentorProfile?.status || 'Aktif'}</h3>
                       </div>
                    </div>
                  </div>
                </div>
              )}

              {guruTab === 'presensi' && (
                <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-purple-200">
                  <h3 className="text-lg font-extrabold text-[#581878] mb-4">Catat Presensi Pertemuan Siswa</h3>
                  <form onSubmit={handleTambahPresensiSiswa} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                      <div className="md:col-span-2">
                        <select required value={newPresensiSiswa.periode_id} onChange={(e) => setNewPresensiSiswa({ ...newPresensiSiswa, periode_id: e.target.value })} className="w-full px-4 py-3 border rounded-xl font-medium text-sm">
                          <option value="">-- Pilih Murid & Paket --</option>
                          {daftarPeriode.filter(p => p.siswa?.status === 'aktif' && p.status_periode === 'berjalan').map(p => (
                            <option key={p.id} value={p.id}>{p.siswa?.nama_murid} — {p.paket_belajar?.nama_paket}</option>
                          ))}
                        </select>
                      </div>
                      <input type="number" min="1" max="12" placeholder="Pertemuan Ke-" required value={newPresensiSiswa.pertemuan_ke} onChange={(e) => setNewPresensiSiswa({ ...newPresensiSiswa, pertemuan_ke: Number(e.target.value) })} className="px-4 py-3 border rounded-xl text-sm font-bold" />
                      <input type="date" required value={newPresensiSiswa.tanggal_pertemuan} onChange={(e) => setNewPresensiSiswa({ ...newPresensiSiswa, tanggal_pertemuan: e.target.value })} className="px-4 py-3 border rounded-xl text-sm" />
                      <select value={newPresensiSiswa.status_kehadiran} onChange={(e) => setNewPresensiSiswa({ ...newPresensiSiswa, status_kehadiran: e.target.value })} className="px-4 py-3 border rounded-xl text-sm font-bold text-purple-900">
                        <option value="Hadir">✅ Hadir</option>
                        <option value="Izin">📩 Izin</option>
                        <option value="Alpha">❌ Alpha</option>
                      </select>
                      <input type="text" placeholder="Jurnal / Catatan Materi Hari Ini" required value={newPresensiSiswa.jurnal_materi} onChange={(e) => setNewPresensiSiswa({ ...newPresensiSiswa, jurnal_materi: e.target.value })} className="px-4 py-3 border rounded-xl text-sm md:col-span-3" />
                      <button type="submit" className="md:col-span-3 bg-[#581878] hover:bg-purple-900 text-white font-extrabold py-3 rounded-xl shadow mt-2 transition">Simpan Presensi Sesi</button>
                  </form>

                  <h3 className="text-md font-bold text-[#581878] mb-3 border-t pt-6">Riwayat Presensi Anda</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                       <thead className="bg-purple-50"><tr><th className="p-3">Tanggal</th><th className="p-3">Siswa</th><th className="p-3">Sesi</th><th className="p-3">Jurnal</th></tr></thead>
                       <tbody>
                          {daftarPresensiSiswa.filter(ps => ps.mentor_id === currentMentorProfile?.id).slice(0, 10).map(ps => (
                             <tr key={ps.id} className="border-b"><td className="p-3">{ps.tanggal_pertemuan}</td><td className="p-3 font-bold">{ps.periode_belajar?.siswa?.nama_murid}</td><td className="p-3 font-semibold text-[#581878]">Ke-{ps.pertemuan_ke}</td><td className="p-3 text-gray-600 truncate max-w-[200px]">{ps.jurnal_materi}</td></tr>
                          ))}
                       </tbody>
                    </table>
                  </div>
                </div>
              )}

              {guruTab === 'modul' && (
                <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-emerald-100">
                  <h3 className="text-lg font-extrabold text-emerald-800 mb-4">Daftar Modul & Bahan Ajar Tersedia</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {daftarInventaris.map(b => (
                        <div key={b.id} className="border border-emerald-100 p-4 rounded-xl flex items-start space-x-4 shadow-sm bg-emerald-50/30">
                           {b.thumbnail ? ( <img src={b.thumbnail} alt={b.nama_barang} className="w-16 h-16 object-cover rounded-lg shadow-sm" /> ) : ( <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center text-2xl shadow-sm">📚</div> )}
                           <div>
                              <h5 className="font-bold text-gray-900">{b.nama_barang}</h5>
                              <p className="text-[11px] text-gray-600 mt-1 leading-tight line-clamp-2">{b.deskripsi || 'Tidak ada detail deskripsi.'}</p>
                              <div className="mt-2 text-xs font-black px-2 py-1 rounded inline-block bg-emerald-100 text-emerald-800">Sisa Stok: {b.stok}</div>
                           </div>
                        </div>
                     ))}
                  </div>
                </div>
              )}

              {guruTab === 'profil' && (
                <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-purple-200">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                     <h3 className="text-lg font-extrabold text-[#581878]">Pengaturan Profil Pribadi</h3>
                     <button onClick={() => setShowEditPasswordModal(true)} className="bg-amber-400 hover:bg-amber-500 text-purple-950 font-bold py-2 px-4 rounded-xl text-sm transition shadow-sm w-full md:w-auto">
                        🔑 Ganti Kata Sandi Portal
                     </button>
                  </div>
                  <form onSubmit={handleUpdateProfilGuru} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Nama Lengkap (Terkunci)</label>
                        <input type="text" disabled value={currentMentorProfile?.nama_mentor || ''} className="w-full px-4 py-3 border rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed" />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Email Akun (Terkunci)</label>
                        <input type="email" disabled value={currentMentorProfile?.email || ''} className="w-full px-4 py-3 border rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed" />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">No. WhatsApp Aktif</label>
                        <input type="text" required value={currentMentorProfile?.no_hp || ''} onChange={(e) => setCurrentMentorProfile({...currentMentorProfile, no_hp: e.target.value})} className="w-full px-4 py-3 border rounded-xl focus:border-purple-500 outline-none" />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Alamat Tinggal</label>
                        <input type="text" required value={currentMentorProfile?.alamat || ''} onChange={(e) => setCurrentMentorProfile({...currentMentorProfile, alamat: e.target.value})} className="w-full px-4 py-3 border rounded-xl focus:border-purple-500 outline-none" />
                     </div>
                     <button type="submit" className="md:col-span-2 bg-[#581878] text-white font-extrabold py-3 rounded-xl shadow mt-2 hover:bg-purple-900 transition">Simpan Pembaruan Kontak</button>
                  </form>
                </div>
              )}
            </div>
          )}

        </div>
      ) : (
        /* ======================================================= */
        /* 🌍 PUBLIC LANDING PAGE & REGISTRATION                   */
        /* ======================================================= */
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
                Mendampingi putra-putri Anda menguasai Baca AHE, Berhitung ASE, hingga pelajaran sekolah secara intensif dan menyenangkan.
              </p>
            </div>
          </section>

          <section className="max-w-6xl mx-auto px-4 -mt-12 mb-16">
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
                      isSelected ? 'border-[#F59E0B] ring-4 ring-amber-200' : 'border-purple-100'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-xl font-bold text-gray-900">{paket.nama_paket}</h4>
                      {isSelected && <span className="bg-[#F59E0B] text-white text-xs font-bold px-2 py-1 rounded">Dipilih</span>}
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{paket.deskripsi || 'Program bimbingan intensif 12 pertemuan per bulan.'}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="max-w-3xl mx-auto px-4 mb-20">
            <div className="bg-white rounded-3xl shadow-xl border-2 border-purple-100 p-8">
              <h3 className="text-2xl font-black text-[#581878] mb-6 text-center">📝 Form Pendaftaran Siswa Baru</h3>
              <form onSubmit={handleDaftarSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nama Lengkap Murid</label>
                  <input type="text" required value={formDaftar.nama_murid} onChange={(e) => setFormDaftar({ ...formDaftar, nama_murid: e.target.value })} className="w-full px-4 py-3 rounded-xl border outline-none focus:border-[#581878]" placeholder="Contoh: Budi Pratama" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Nama Orang Tua / Wali</label>
                    <input type="text" required value={formDaftar.nama_orang_tua} onChange={(e) => setFormDaftar({ ...formDaftar, nama_orang_tua: e.target.value })} className="w-full px-4 py-3 rounded-xl border outline-none focus:border-[#581878]" placeholder="Ibu Rina" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">No. WhatsApp Aktif</label>
                    <input type="tel" required value={formDaftar.no_hp} onChange={(e) => setFormDaftar({ ...formDaftar, no_hp: e.target.value })} className="w-full px-4 py-3 rounded-xl border outline-none focus:border-[#581878]" placeholder="081234567890" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Alamat Domisili</label>
                  <textarea required value={formDaftar.alamat} onChange={(e) => setFormDaftar({ ...formDaftar, alamat: e.target.value })} className="w-full px-4 py-3 rounded-xl border outline-none focus:border-[#581878]" placeholder="Alamat lengkap..." rows="2" />
                </div>
                <button type="submit" disabled={loading} className="w-full py-4 bg-[#581878] hover:bg-purple-900 text-white font-extrabold text-lg rounded-xl shadow-lg transition">
                  {loading ? 'Memproses Pendaftaran...' : 'Kirim Pendaftaran Online 🚀'}
                </button>
              </form>
            </div>
          </section>
        </>
      )}

      {/* ======================================================= */}
      {/* MODALS GLOBALS                                          */}
      {/* ======================================================= */}
      {/* MODAL GANTI PASSWORD GURU */}
      {showEditPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative border-4 border-[#581878]">
            <button onClick={() => setShowEditPasswordModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-xl">✕</button>
            <h3 className="text-2xl font-black text-[#581878] mb-2 text-center">Ganti Kata Sandi</h3>
            <p className="text-xs text-gray-500 mb-6 text-center">Demi keamanan, gunakan kata sandi yang mudah diingat.</p>
            <form onSubmit={handleGantiPasswordGuru} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Kata Sandi Baru (Min. 6 Karakter)</label>
                <input type="password" required minLength={6} value={newPasswordGuru} onChange={(e) => setNewPasswordGuru(e.target.value)} className="w-full px-4 py-3 rounded-xl border outline-none focus:border-[#581878]" placeholder="••••••••" />
              </div>
              <button type="submit" className="w-full py-3 bg-[#581878] hover:bg-purple-900 text-white font-bold rounded-xl shadow-md transition">Simpan Sandi Baru 🔑</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL LOGIN */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative border-4 border-[#581878]">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-xl">✕</button>
            
            <div className="flex justify-center mb-4">
               <img src="/logo.png" alt="Logo" className="h-16 w-16 object-contain" />
            </div>
            
            <h3 className="text-2xl font-black text-[#581878] mb-1 text-center">Masuk Portal</h3>
            <p className="text-xs text-gray-500 mb-6 text-center font-medium">Khusus Admin dan Guru/Mentor Bimbel ErHa</p>

            {loginError && <div className="bg-red-100 text-red-700 text-xs p-3 rounded-xl mb-4 font-semibold text-center">{loginError}</div>}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email Pengguna</label>
                <input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border outline-none focus:border-[#581878]" placeholder="nama@email.com" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Kata Sandi</label>
                <input type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border outline-none focus:border-[#581878]" placeholder="••••••••" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3.5 bg-[#581878] hover:bg-purple-900 text-white font-black rounded-xl shadow-md transition text-lg mt-2">
                {loading ? 'Memverifikasi Akses...' : 'M A S U K'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-[#581878] text-white py-8 text-center border-t-4 border-[#F59E0B] mt-12">
        <p className="font-bold text-lg">Bimbel ErHa (Rumah Hebat)</p>
        <p className="text-purple-200 text-sm mt-1">Sistem Terpadu Akademik & Manajemen</p>
      </footer>
    </div>
  );
}
