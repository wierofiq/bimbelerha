import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Inisialisasi Supabase Client
const supabaseUrl = 'https://izifwpviqpyxauafdlge.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6aWZ3cHZpcXB5eGF1YWZkbGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NDA2ODYsImV4cCI6MjEwNjUxNjY4Nn0.XpJEgQ3vpGOYmPVi-nsjrSRJI9RfR5kWTN_XsL-TCUU';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  // ==========================================
  // 1. STATE MANAGEMENT GLOBAL
  // ==========================================
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('guru');
  const [currentMentorProfile, setCurrentMentorProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [appReady, setAppReady] = useState(false);

  // Navigasi
  const [adminTab, setAdminTab] = useState('dashboard'); 
  const [siswaSubTab, setSiswaSubTab] = useState('data'); 
  const [mentorSubTab, setMentorSubTab] = useState('daftar'); 
  const [guruTab, setGuruTab] = useState('beranda'); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Toast Notifikasi
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  // Master Data
  const [paketList, setPaketList] = useState([]);
  const [daftarSiswa, setDaftarSiswa] = useState([]);
  const [daftarMentor, setDaftarMentor] = useState([]);
  const [daftarPeriode, setDaftarPeriode] = useState([]);
  const [daftarPresensiSiswa, setDaftarPresensiSiswa] = useState([]);
  const [daftarPembayaran, setDaftarPembayaran] = useState([]);
  const [daftarPresensiMentor, setDaftarPresensiMentor] = useState([]);
  const [daftarInventaris, setDaftarInventaris] = useState([]);
  const [daftarKonten, setDaftarKonten] = useState([]);

  // Filter States
  const [filterBulanPresensiSiswa, setFilterBulanPresensiSiswa] = useState('');
  const [filterBulanPresensiMentor, setFilterBulanPresensiMentor] = useState(new Date().toISOString().slice(0, 7));
  const [filterBulanPembayaran, setFilterBulanPembayaran] = useState(new Date().toISOString().slice(0, 7));
  const [currentPagePembayaran, setCurrentPagePembayaran] = useState(1);

  // Web & Landing Page
  const [pengaturanWeb, setPengaturanWeb] = useState({ judul_utama: 'Bimbel ErHa', sub_judul: 'Rumah Hebat, Bersahabat & Berprestasi', logo_url: '', no_admin_wa: '6281915058297' });
  const [landingSections, setLandingSections] = useState([]);

  // Modals & UI States
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [expandedStudentId, setExpandedStudentId] = useState(null); // Untuk expanding row

  // Data Forms
  const [formDaftar, setFormDaftar] = useState({ nama_murid: '', nama_orang_tua: '', no_hp: '', alamat: '', jenjang_sekolah: 'SD' });
  const [selectedPaket, setSelectedPaket] = useState([]);

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveData, setApproveData] = useState({ siswa_id: '', nama_murid: '', paket_id: '', bulan_periode: new Date().toISOString().slice(0, 7), tanggal_mulai: new Date().toISOString().split('T')[0], tanggal_selesai: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0] });

  const [showEditPembayaranModal, setShowEditPembayaranModal] = useState(false);
  const [editPembayaranData, setEditPembayaranData] = useState({ id: '', jumlah_bayar: 0, item_bayar: '', catatan: '', tanggal_pembayaran: '' });

  const [showTransaksiModal, setShowTransaksiModal] = useState(false);
  const [formTransaksi, setFormTransaksi] = useState({ barang_id: '', nama_barang: '', tipe_transaksi: 'Masuk', jumlah: 0, keterangan: '' });

  // Presensi & Mentor
  const [formPresensiMentor, setFormPresensiMentor] = useState({ mentor_id: '', tanggal: new Date().toISOString().split('T')[0], total_jam: 0, kegiatan_pembelajaran: '' });
  const [formPembayaran, setFormPembayaran] = useState({ siswa_id: '', tanggal_pembayaran: new Date().toISOString().split('T')[0], items: [], total_bayar: 0, catatan: '' });
  
  // Presensi Guru
  const [searchSiswaPresensi, setSearchSiswaPresensi] = useState(''); 
  const [isDropdownPresensiOpen, setIsDropdownPresensiOpen] = useState(false);
  const [newPresensiSiswa, setNewPresensiSiswa] = useState({ periode_id: '', pertemuan_ke: 1, tanggal_pertemuan: new Date().toISOString().split('T')[0], status_kehadiran: 'Hadir', jurnal_materi: '' });

  // ==========================================
  // 2. EFFECTS & DATA FETCHING
  // ==========================================
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) determineUserRoleAndProfile(session.user).then(() => setAppReady(true));
      else setAppReady(true);
      fetchAllData();
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) determineUserRoleAndProfile(session.user);
      else { setUserRole('guru'); setCurrentMentorProfile(null); }
      fetchAllData();
    });

    fetchPaket();
    fetchPengaturanWeb();
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

  async function fetchPengaturanWeb() {
    try {
      const { data: setObj } = await supabase.from('pengaguran_web').select('*').eq('id', 1).single();
      if (setObj) setPengaturanWeb(setObj);
      const { data: secData } = await supabase.from('landing_sections').select('*').order('urutan', { ascending: true });
      if (secData) setLandingSections(secData);
    } catch(err) { console.error("Setting fetch error:", err); }
  }

  async function fetchAllData() {
    try {
      const [siswa, mentor, periode, presensiS, pemb, presensiM, logistik] = await Promise.all([
        supabase.from('siswa').select('*').order('created_at', { ascending: false }),
        supabase.from('mentor').select('*').order('created_at', { ascending: false }),
        supabase.from('periode_belajar').select('*, siswa(nama_murid, status, no_hp), paket_belajar(nama_paket)').order('created_at', { ascending: false }),
        supabase.from('presensi_siswa').select('*, mentor(nama_mentor), periode_belajar(siswa_id)').order('tanggal_pertemuan', { ascending: false }),
        supabase.from('pembayaran_siswa').select('*, siswa(nama_murid), periode_belajar(bulan_periode)').order('tanggal_pembayaran', { ascending: false }),
        supabase.from('presensi_mentor').select('*, mentor(nama_mentor)').order('tanggal', { ascending: false }),
        supabase.from('inventaris_logistik').select('*').order('nama_barang', { ascending: true })
      ]);
      if(siswa.data) setDaftarSiswa(siswa.data);
      if(mentor.data) setDaftarMentor(mentor.data);
      if(periode.data) setDaftarPeriode(periode.data);
      if(presensiS.data) setDaftarPresensiSiswa(presensiS.data);
      if(pemb.data) setDaftarPembayaran(pemb.data);
      if(presensiM.data) setDaftarPresensiMentor(presensiM.data);
      if(logistik.data) setDaftarInventaris(logistik.data);
    } catch(err) { console.error('Error fetch global:', err); }
  }

  // ==========================================
  // 3. HANDLERS - AUTH & PENDAFTARAN PUBLIK
  // ==========================================
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const email = e.target.email.value;
    const password = e.target.password.value;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) showToast('Login gagal: ' + error.message, 'error');
    else { setShowLoginModal(false); determineUserRoleAndProfile(data.user); showToast('Login berhasil!'); }
    setLoading(false);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); showToast('Berhasil keluar.'); };

  const handleDaftarSubmit = async (e) => {
    e.preventDefault();
    if (selectedPaket.length === 0) return showToast('Pilih minimal satu paket!', 'error');
    setLoading(true);
    try {
      // Insert Siswa
      const { data: siswaData } = await supabase.from('siswa').insert([{ ...formDaftar, status: 'pending' }]).select();
      if (siswaData && siswaData[0]) {
        // Insert Periode (Tanpa Tanggal)
        const inserts = selectedPaket.map(pId => ({ 
          siswa_id: siswaData[0].id, 
          paket_id: pId, 
          total_pertemuan: 12, 
          status_periode: 'pending',
          bulan_periode: null,
          tanggal_mulai: null,
          tanggal_selesai: null
        }));
        await supabase.from('periode_belajar').insert(inserts);
      }
      showToast('Pendaftaran berhasil! Mengalihkan ke WhatsApp...');
      const waText = `Halo Admin Bimbel ErHa, saya ${formDaftar.nama_orang_tua} mendaftarkan anak saya ${formDaftar.nama_murid} (Jenjang ${formDaftar.jenjang_sekolah}). Mohon info selanjutnya.`;
      window.open(`https://wa.me/${pengaturanWeb.no_admin_wa}?text=${encodeURIComponent(waText)}`, '_blank');
      setFormDaftar({ nama_murid: '', nama_orang_tua: '', no_hp: '', alamat: '', jenjang_sekolah: 'SD' });
      setSelectedPaket([]);
      fetchAllData();
    } catch(err) { showToast(err.message, 'error'); } finally { setLoading(false); }
  };

  // ==========================================
  // 4. HANDLERS - ADMIN (APPROVAL, SISWA, MENTOR)
  // ==========================================
  const openApproveModal = (siswa) => {
    const pPending = daftarPeriode.find(p => p.siswa_id === siswa.id && p.status_periode === 'pending');
    setApproveData({
      siswa_id: siswa.id,
      nama_murid: siswa.nama_murid,
      paket_id: pPending?.paket_id || '',
      bulan_periode: new Date().toISOString().slice(0, 7),
      tanggal_mulai: new Date().toISOString().split('T')[0],
      tanggal_selesai: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
    });
    setShowApproveModal(true);
  };

  const handleSimpanApproval = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await supabase.from('siswa').update({ status: 'aktif' }).eq('id', approveData.siswa_id);
      await supabase.from('periode_belajar').update({ 
        status_periode: 'berjalan',
        bulan_periode: approveData.bulan_periode,
        tanggal_mulai: approveData.tanggal_mulai,
        tanggal_selesai: approveData.tanggal_selesai
      }).eq('siswa_id', approveData.siswa_id).eq('status_periode', 'pending');
      
      // Auto-create initial tagihan
      await supabase.from('pembayaran_siswa').insert([{
        siswa_id: approveData.siswa_id,
        item_bayar: 'Pendaftaran & Paket Awal',
        jumlah_bayar: 0,
        status_pembayaran: 'Belum Lunas'
      }]);
      
      showToast('Siswa berhasil diaktifkan & Periode diset!');
      setShowApproveModal(false);
      fetchAllData();
    } catch (err) { showToast(err.message, 'error'); } finally { setLoading(false); }
  };

  // MENTOR PRESENSI
  const filteredPresensiMentor = daftarPresensiMentor.filter(pm => filterBulanPresensiMentor ? pm.tanggal?.startsWith(filterBulanPresensiMentor) : true);
  const totalJamMentorFiltered = filteredPresensiMentor.reduce((sum, pm) => sum + (Number(pm.total_jam) || 0), 0);

  const handleTambahPresensiMentor = async (e) => {
    e.preventDefault();
    await supabase.from('presensi_mentor').insert([formPresensiMentor]);
    showToast('Presensi mentor tersimpan!');
    setFormPresensiMentor({ ...formPresensiMentor, total_jam: 0, kegiatan_pembelajaran: '' });
    fetchAllData();
  };

  // ==========================================
  // 5. HANDLERS - PEMBAYARAN & PAGINASI
  // ==========================================
  const filteredPembayaran = daftarPembayaran.filter(pb => filterBulanPembayaran ? pb.tanggal_pembayaran?.startsWith(filterBulanPembayaran) : true);
  const totalPenerimaanBulanan = filteredPembayaran.reduce((sum, pb) => sum + (Number(pb.jumlah_bayar) || 0), 0);
  const itemsPerPage = 15;
  const totalPagesPembayaran = Math.ceil(filteredPembayaran.length / itemsPerPage);
  const paginatedPembayaran = filteredPembayaran.slice((currentPagePembayaran - 1) * itemsPerPage, currentPagePembayaran * itemsPerPage);

  const handleSimpanEditPembayaran = async (e) => {
    e.preventDefault();
    await supabase.from('pembayaran_siswa').update({
      jumlah_bayar: editPembayaranData.jumlah_bayar,
      item_bayar: editPembayaranData.item_bayar,
      catatan: editPembayaranData.catatan,
      tanggal_pembayaran: editPembayaranData.tanggal_pembayaran
    }).eq('id', editPembayaranData.id);
    showToast('Data pembayaran diperbarui!');
    setShowEditPembayaranModal(false);
    fetchAllData();
  };

  // ==========================================
  // 6. HANDLERS - INVENTARIS TRANSAKSI
  // ==========================================
  const openTransaksiModal = (barang, tipe) => {
    setFormTransaksi({ barang_id: barang.id, nama_barang: barang.nama_barang, tipe_transaksi: tipe, jumlah: 1, keterangan: '' });
    setShowTransaksiModal(true);
  };

  const handleSimpanTransaksiInventaris = async (e) => {
    e.preventDefault();
    const barang = daftarInventaris.find(b => b.id === formTransaksi.barang_id);
    if (!barang) return;
    const newStock = formTransaksi.tipe_transaksi === 'Masuk' ? barang.stok + formTransaksi.jumlah : barang.stok - formTransaksi.jumlah;
    
    if (newStock < 0) return showToast('Error: Stok tidak mencukupi untuk barang keluar!', 'error');

    try {
      await supabase.from('inventaris_logistik').update({ stok: newStock }).eq('id', barang.id);
      await supabase.from('transaksi_logistik').insert([{
        barang_id: barang.id, tipe_transaksi: formTransaksi.tipe_transaksi, jumlah: formTransaksi.jumlah, keterangan: formTransaksi.keterangan
      }]);
      showToast(`Transaksi ${formTransaksi.tipe_transaksi} berhasil dicatat.`);
      setShowTransaksiModal(false);
      fetchAllData();
    } catch(err) { showToast(err.message, 'error'); }
  };

  // ==========================================
  // RENDER APP UTAMA
  // ==========================================
  if (!appReady) return <div className="min-h-screen flex items-center justify-center font-bold text-[#581878] bg-purple-50">Memuat Portal ErHa...</div>;

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-gray-800 flex flex-col">
      {toast.show && (
        <div className={`fixed top-5 right-5 z-[200] px-5 py-3 rounded-2xl shadow-2xl text-sm font-bold text-white flex items-center space-x-2 animate-bounce ${toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
          <span>{toast.type === 'error' ? '❌' : '✅'}</span><span>{toast.message}</span>
        </div>
      )}

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-[#581878] shadow-md border-b-2 border-purple-900">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {user && <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden text-white focus:outline-none"><span className="text-2xl">☰</span></button>}
            <div className="flex items-center space-x-2.5">
              <div className="bg-white p-1 rounded-xl shadow-inner"><img src={pengaturanWeb.logo_url || "/logo.png"} alt="Logo" className="h-8 w-8 object-contain" /></div>
              <div><h1 className="text-white font-black text-base tracking-tight leading-none">{pengaturanWeb.judul_utama}</h1><p className="text-amber-400 font-bold text-[10px] tracking-wider uppercase">Rumah Hebat</p></div>
            </div>
          </div>
          <div>
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="hidden sm:block text-xs font-black text-amber-300 uppercase">{userRole === 'admin' ? '👑 Admin' : `Guru: ${currentMentorProfile?.nama_mentor?.split(' ')[0] || ''}`}</span>
                <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-1.5 px-4 rounded-xl text-xs shadow transition">Keluar</button>
              </div>
            ) : (
              <button onClick={() => setShowLoginModal(true)} className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-white font-black py-2 px-5 rounded-2xl text-xs shadow-lg transition flex items-center space-x-1.5"><span>🔐</span> <span>Login Portal</span></button>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {user ? (
          <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
            {/* SIDEBAR */}
            <aside className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-white shadow-xl md:shadow-none md:border-r border-gray-200 p-6 flex flex-col justify-between transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-200 ease-in-out`}>
              <div className="space-y-6 pt-12 md:pt-0">
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Menu Utama</p>
                <div className="space-y-1">
                  {userRole === 'admin' ? (
                    <>
                      {['dashboard','siswa','mentor','pembayaran','modul'].map(tab => (
                        <button key={tab} onClick={() => { setAdminTab(tab); setIsSidebarOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-sm transition capitalize ${adminTab === tab ? 'bg-purple-900 text-white shadow-lg' : 'text-gray-600 hover:bg-purple-50'}`}>
                          <span>{tab==='dashboard'?'📊':tab==='siswa'?'📋':tab==='mentor'?'👩‍🏫':tab==='pembayaran'?'💵':'📚'}</span> <span>{tab}</span>
                        </button>
                      ))}
                    </>
                  ) : (
                    <>
                      {['beranda','presensi','modul'].map(tab => (
                        <button key={tab} onClick={() => { setGuruTab(tab); setIsSidebarOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-sm transition capitalize ${guruTab === tab ? 'bg-purple-900 text-white shadow-lg' : 'text-gray-600 hover:bg-purple-50'}`}>
                          <span>{tab==='beranda'?'🏠':tab==='presensi'?'📝':'📦'}</span> <span>{tab}</span>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </aside>

            {/* DASHBOARD KONTEN */}
            <div className="flex-1 overflow-x-hidden space-y-6">
              
              {/* ======================= TAB ADMIN ======================= */}
              {userRole === 'admin' && (
                <>
                  {adminTab === 'dashboard' && (
                    <div className="space-y-6">
                      <div><h2 className="text-2xl font-black text-gray-900">Dashboard 📊</h2></div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100"><p className="text-xs font-bold text-gray-400 uppercase">Siswa Aktif</p><h4 className="text-2xl font-black">{daftarSiswa.filter(s => s.status === 'aktif').length}</h4></div>
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100"><p className="text-xs font-bold text-gray-400 uppercase">Mentor</p><h4 className="text-2xl font-black">{daftarMentor.length}</h4></div>
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100"><p className="text-xs font-bold text-gray-400 uppercase">Pending</p><h4 className="text-2xl font-black">{daftarSiswa.filter(s => s.status === 'pending').length}</h4></div>
                      </div>
                    </div>
                  )}

                  {adminTab === 'siswa' && (
                    <div className="space-y-6">
                      <div className="flex space-x-2 border-b border-gray-200 pb-3">
                        <button onClick={() => setSiswaSubTab('persetujuan')} className={`px-4 py-2 rounded-xl font-bold text-xs ${siswaSubTab === 'persetujuan' ? 'bg-amber-400 text-purple-950 shadow' : 'bg-white text-gray-600'}`}>Persetujuan Baru ({daftarSiswa.filter(s=>s.status==='pending').length})</button>
                        <button onClick={() => setSiswaSubTab('data')} className={`px-4 py-2 rounded-xl font-bold text-xs ${siswaSubTab === 'data' ? 'bg-purple-900 text-white shadow' : 'bg-white text-gray-600'}`}>Data Siswa Aktif</button>
                      </div>

                      {/* SISWA - PERSETUJUAN */}
                      {siswaSubTab === 'persetujuan' && (
                        <div className="bg-white rounded-3xl p-6 border shadow-sm">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-purple-50"><tr><th className="p-4">Nama Pendaftar</th><th className="p-4">Jenjang</th><th className="p-4 text-center">Aksi</th></tr></thead>
                            <tbody>
                              {daftarSiswa.filter(s => s.status === 'pending').map(s => (
                                <tr key={s.id} className="border-t">
                                  <td className="p-4 font-bold">{s.nama_murid} <span className="block text-xs font-normal text-gray-500">{s.no_hp}</span></td>
                                  <td className="p-4">{s.jenjang_sekolah}</td>
                                  <td className="p-4 text-center"><button onClick={() => openApproveModal(s)} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold">Setujui & Atur Periode</button></td>
                                </tr>
                              ))}
                              {daftarSiswa.filter(s => s.status === 'pending').length === 0 && <tr><td colSpan="3" className="text-center p-6 italic text-gray-400">Tidak ada pendaftaran pending.</td></tr>}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* SISWA - DATA AKTIF (EXPANDING ROW) */}
                      {siswaSubTab === 'data' && (
                        <div className="bg-white rounded-3xl p-6 border shadow-sm">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-purple-50"><tr><th className="p-4">Nama & Periode Aktif</th><th className="p-4 text-center">Aksi</th></tr></thead>
                            <tbody>
                              {daftarSiswa.filter(s => s.status === 'aktif').map(s => {
                                const pAktif = daftarPeriode.find(p => p.siswa_id === s.id && p.status_periode === 'berjalan');
                                const isExpanded = expandedStudentId === s.id;
                                const count = pAktif ? daftarPresensiSiswa.filter(ps => ps.periode_id === pAktif.id).length : 0;
                                const tglAkhir = pAktif?.tanggal_selesai ? new Date(pAktif.tanggal_selesai) : null;
                                const isLate = tglAkhir && new Date() > tglAkhir;

                                return (
                                  <React.Fragment key={s.id}>
                                    <tr className={`border-t cursor-pointer hover:bg-gray-50 ${isExpanded ? 'bg-purple-50' : ''}`} onClick={() => setExpandedStudentId(isExpanded ? null : s.id)}>
                                      <td className="p-4">
                                        <div className="font-bold">{s.nama_murid} <span className="text-xs bg-gray-200 px-2 rounded-full">{s.jenjang_sekolah}</span></div>
                                        {pAktif ? (
                                          <div className="text-xs text-gray-500 mt-1">
                                            {formatTanggalIndo(pAktif.tanggal_mulai)} s/d {formatTanggalIndo(pAktif.tanggal_selesai)} 
                                            {isLate && <span className="ml-2 text-red-500 font-bold">(Melewati Batas)</span>}
                                          </div>
                                        ) : <div className="text-xs text-amber-500 mt-1">Belum ada periode aktif.</div>}
                                      </td>
                                      <td className="p-4 text-center">
                                        <span className="text-xs bg-purple-100 text-purple-800 px-3 py-1 rounded-xl font-bold">{count}/12 Sesi ▼</span>
                                      </td>
                                    </tr>
                                    {isExpanded && pAktif && (
                                      <tr className="bg-gray-50 border-b-2 border-purple-200">
                                        <td colSpan="2" className="p-6">
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Panel Riwayat Sesi */}
                                            <div className="bg-white p-4 rounded-2xl shadow-sm border">
                                              <h5 className="font-black text-[#581878] mb-3 text-xs">📖 Riwayat Presensi Periode Ini</h5>
                                              <ul className="space-y-2 text-xs">
                                                {daftarPresensiSiswa.filter(ps => ps.periode_id === pAktif.id).map(ps => (
                                                  <li key={ps.id} className="flex justify-between border-b pb-1">
                                                    <span>Sesi {ps.pertemuan_ke} - {formatTanggalIndo(ps.tanggal_pertemuan)}</span>
                                                    <span className="font-bold text-gray-600 truncate max-w-[120px]">{ps.jurnal_materi}</span>
                                                  </li>
                                                ))}
                                                {count === 0 && <li className="text-gray-400 italic">Belum ada pertemuan.</li>}
                                              </ul>
                                            </div>
                                            {/* Panel Riwayat Pembayaran */}
                                            <div className="bg-white p-4 rounded-2xl shadow-sm border">
                                              <h5 className="font-black text-emerald-700 mb-3 text-xs">💵 Riwayat Pembayaran</h5>
                                              <ul className="space-y-2 text-xs">
                                                {daftarPembayaran.filter(pb => pb.siswa_id === s.id && pb.periode_id === pAktif.id).map(pb => (
                                                  <li key={pb.id} className="flex justify-between border-b pb-1">
                                                    <span>{formatTanggalIndo(pb.tanggal_pembayaran)} - {pb.item_bayar}</span>
                                                    <span className="font-bold text-emerald-600">Rp {(Number(pb.jumlah_bayar)||0).toLocaleString('id-ID')}</span>
                                                  </li>
                                                ))}
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
                    </div>
                  )}

                  {adminTab === 'mentor' && (
                    <div className="space-y-6">
                      <div className="flex space-x-2 border-b border-gray-200 pb-3">
                        <button onClick={() => setMentorSubTab('daftar')} className={`px-4 py-2 rounded-xl font-bold text-xs ${mentorSubTab === 'daftar' ? 'bg-purple-900 text-white' : 'bg-white text-gray-600'}`}>Daftar Mentor</button>
                        <button onClick={() => setMentorSubTab('presensi')} className={`px-4 py-2 rounded-xl font-bold text-xs ${mentorSubTab === 'presensi' ? 'bg-purple-900 text-white' : 'bg-white text-gray-600'}`}>Rekap Presensi & Jam</button>
                      </div>
                      
                      {mentorSubTab === 'presensi' && (
                        <div className="bg-white rounded-3xl p-6 shadow-sm border">
                          <div className="flex justify-between items-center mb-6">
                            <h3 className="font-extrabold text-gray-900">Input Jam Kerja Mentor</h3>
                            <input type="month" value={filterBulanPresensiMentor} onChange={e => setFilterBulanPresensiMentor(e.target.value)} className="border p-2 rounded-xl text-sm font-bold bg-purple-50 text-purple-900" />
                          </div>
                          
                          <form onSubmit={handleTambahPresensiMentor} className="grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded-2xl border mb-6">
                            <select required value={formPresensiMentor.mentor_id} onChange={e => setFormPresensiMentor({...formPresensiMentor, mentor_id: e.target.value})} className="border p-3 rounded-xl text-sm bg-white"><option value="">Pilih Mentor</option>{daftarMentor.map(m => <option key={m.id} value={m.id}>{m.nama_mentor}</option>)}</select>
                            <input type="date" required value={formPresensiMentor.tanggal} onChange={e => setFormPresensiMentor({...formPresensiMentor, tanggal: e.target.value})} className="border p-3 rounded-xl text-sm bg-white" />
                            <input type="number" step="0.5" placeholder="Total Jam" required value={formPresensiMentor.total_jam} onChange={e => setFormPresensiMentor({...formPresensiMentor, total_jam: parseFloat(e.target.value)})} className="border p-3 rounded-xl text-sm bg-white" />
                            <button type="submit" className="bg-[#581878] text-white rounded-xl font-bold text-sm">Catat Jam</button>
                          </form>

                          <div className="bg-purple-900 text-white p-4 rounded-2xl flex justify-between items-center mb-4 shadow">
                            <span className="font-bold">Total Rekap Jam Bulan Filtered:</span>
                            <span className="text-2xl font-black text-amber-400">{totalJamMentorFiltered} Jam</span>
                          </div>
                          <table className="w-full text-left text-sm">
                            <thead className="bg-gray-100"><tr><th className="p-3">Tanggal</th><th className="p-3">Mentor</th><th className="p-3 text-right">Total Jam</th></tr></thead>
                            <tbody>
                              {filteredPresensiMentor.map(pm => (
                                <tr key={pm.id} className="border-t"><td className="p-3">{formatTanggalIndo(pm.tanggal)}</td><td className="p-3 font-bold">{pm.mentor?.nama_mentor}</td><td className="p-3 text-right font-black">{pm.total_jam}</td></tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {adminTab === 'pembayaran' && (
                    <div className="bg-white rounded-3xl p-6 shadow-sm border space-y-6">
                      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                        <div>
                          <p className="text-xs font-bold text-emerald-800 uppercase">Total Penerimaan Bulan Ini</p>
                          <h2 className="text-3xl font-black text-emerald-600">Rp {totalPenerimaanBulanan.toLocaleString('id-ID')}</h2>
                        </div>
                        <input type="month" value={filterBulanPembayaran} onChange={e => {setFilterBulanPembayaran(e.target.value); setCurrentPagePembayaran(1);}} className="border p-3 rounded-xl text-sm font-bold bg-white shadow-sm" />
                      </div>

                      <table className="w-full text-left text-sm mt-4">
                        <thead className="bg-gray-100"><tr><th className="p-4 rounded-l-xl">Tanggal</th><th className="p-4">Siswa</th><th className="p-4">Item</th><th className="p-4">Nominal</th><th className="p-4 text-center rounded-r-xl">Aksi</th></tr></thead>
                        <tbody>
                          {paginatedPembayaran.map(pb => (
                            <tr key={pb.id} className="border-t hover:bg-gray-50">
                              <td className="p-4">{formatTanggalIndo(pb.tanggal_pembayaran)}</td>
                              <td className="p-4 font-bold">{pb.siswa?.nama_murid}</td>
                              <td className="p-4">{pb.item_bayar}</td>
                              <td className="p-4 text-emerald-600 font-bold">Rp {(Number(pb.jumlah_bayar)||0).toLocaleString('id-ID')}</td>
                              <td className="p-4 text-center flex justify-center gap-2">
                                <button onClick={() => { setEditPembayaranData(pb); setShowEditPembayaranModal(true); }} className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-xl text-xs font-bold">Edit</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      
                      {/* Paginasi Info */}
                      <div className="flex justify-between items-center text-xs text-gray-500 pt-4 border-t">
                        <span>Menampilkan Halaman {currentPagePembayaran} dari {totalPagesPembayaran || 1}</span>
                        <div className="space-x-2">
                          <button onClick={() => setCurrentPagePembayaran(Math.max(1, currentPagePembayaran - 1))} disabled={currentPagePembayaran === 1} className="px-3 py-1.5 bg-gray-200 rounded disabled:opacity-50">Sebelumnya</button>
                          <button onClick={() => setCurrentPagePembayaran(Math.min(totalPagesPembayaran, currentPagePembayaran + 1))} disabled={currentPagePembayaran === totalPagesPembayaran || totalPagesPembayaran === 0} className="px-3 py-1.5 bg-gray-200 rounded disabled:opacity-50">Selanjutnya</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {adminTab === 'modul' && (
                    <div className="bg-white rounded-3xl p-6 shadow-sm border">
                      <h3 className="text-2xl font-black mb-6">Inventaris & Logistik 📦</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {daftarInventaris.map(b => (
                          <div key={b.id} className="border p-5 rounded-2xl bg-gray-50 shadow-sm flex flex-col justify-between">
                            <div><span className="text-[10px] font-black uppercase text-emerald-600">{b.kategori}</span><h5 className="font-bold text-gray-900 mt-1">{b.nama_barang}</h5></div>
                            <div className="mt-4">
                              <p className="text-sm font-black text-center bg-white border p-2 rounded-xl mb-3">Stok: {b.stok}</p>
                              <div className="flex gap-2">
                                <button onClick={() => openTransaksiModal(b, 'Masuk')} className="flex-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold py-2 rounded-xl">[+] Masuk</button>
                                <button onClick={() => openTransaksiModal(b, 'Keluar')} className="flex-1 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold py-2 rounded-xl">[-] Keluar</button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          /* ======================================================= */
          /* LANDING PAGE PUBLIK (DIJAMIN TIDAK BLANK)               */
          /* ======================================================= */
          <div className="space-y-0 bg-[#FFFDF0]">
            {(() => {
              // FALLBACK LOGIC: Jika array kosong atau tidak ada data hero, paksakan layout default.
              let renderSections = landingSections && landingSections.length > 0 
                ? [...landingSections].filter(sec => sec.is_aktif).sort((a, b) => a.urutan - b.urutan) 
                : [];
              
              if (renderSections.length === 0) {
                renderSections = [
                  { id: 'fb1', section_key: 'hero' }, { id: 'fb2', section_key: 'tracking' },
                  { id: 'fb3', section_key: 'paket' }, { id: 'fb5', section_key: 'pendaftaran' }
                ];
              }

              return renderSections.map(sec => {
                const key = sec.section_key?.toLowerCase();

                if (key === 'hero') {
                  return (
                    <section key={sec.id} className="bg-gradient-to-b from-[#581878] to-[#8022B8] text-white pt-24 pb-32 px-4 text-center">
                      <div className="max-w-4xl mx-auto space-y-6">
                        <span className="inline-block bg-amber-400 text-purple-950 text-xs font-black px-5 py-2 rounded-full uppercase shadow-lg tracking-widest">Bimbingan Belajar Modern 🚀</span>
                        <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-tight drop-shadow-md">{pengaturanWeb.judul_utama}</h2>
                        <p className="text-xl text-purple-200 font-medium">{pengaturanWeb.sub_judul}</p>
                      </div>
                    </section>
                  );
                }

                if (key === 'tracking') {
                  return (
                    <section key={sec.id} className="max-w-4xl mx-auto px-4 -mt-16 relative z-20">
                      <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-8 text-center">
                        <h3 className="text-xl font-black text-[#581878] mb-4">Portal Cek Presensi Siswa 🔍</h3>
                        <div className="flex flex-col md:flex-row gap-3">
                          <input type="text" placeholder="Masukkan Nama atau No HP..." className="flex-1 border-2 p-4 rounded-2xl text-sm outline-none focus:border-purple-600 font-bold bg-gray-50" />
                          <button className="bg-[#581878] text-white font-black px-8 py-4 rounded-2xl shadow-lg transition">Cari Data</button>
                        </div>
                      </div>
                    </section>
                  );
                }

                if (key === 'paket') {
                  return (
                    <section key={sec.id} className="max-w-6xl mx-auto px-4 py-24">
                      <h3 className="text-4xl font-black text-center text-[#581878] mb-12">Pilihan Program Belajar</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {paketList.map(paket => (
                          <div key={paket.id} onClick={() => setSelectedPaket(prev => prev.includes(paket.id) ? prev.filter(p=>p!==paket.id) : [...prev, paket.id])} className={`cursor-pointer bg-white rounded-3xl p-8 transition-all duration-300 ${selectedPaket.includes(paket.id) ? 'border-4 border-amber-400 shadow-2xl bg-amber-50/10' : 'border border-gray-200 shadow-sm hover:shadow-xl'}`}>
                            <h4 className="text-2xl font-black text-gray-900 mb-3">{paket.nama_paket}</h4>
                            <p className="text-gray-500 text-sm">{paket.deskripsi}</p>
                            {selectedPaket.includes(paket.id) && <div className="mt-6 text-sm font-black text-amber-600 bg-amber-100 px-3 py-1.5 rounded-full inline-block">✓ Paket Dipilih</div>}
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                }

                if (key === 'pendaftaran') {
                  return (
                    <section key={sec.id} className="bg-purple-50 py-24 px-4">
                      <div className="max-w-3xl mx-auto bg-white rounded-[2.5rem] shadow-2xl p-10 md:p-14 border border-purple-100">
                        <div className="text-center mb-10"><h3 className="text-4xl font-black text-[#581878] mb-3">Daftar Sekarang</h3><p className="text-gray-500 text-sm">Isi data di bawah untuk melakukan pendaftaran awal.</p></div>
                        <form onSubmit={handleDaftarSubmit} className="space-y-5">
                          <input type="text" placeholder="Nama Lengkap Siswa" required value={formDaftar.nama_murid} onChange={e => setFormDaftar({...formDaftar, nama_murid: e.target.value})} className="w-full p-4 rounded-2xl border text-sm bg-gray-50 font-bold" />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <input type="text" placeholder="Nama Wali" required value={formDaftar.nama_orang_tua} onChange={e => setFormDaftar({...formDaftar, nama_orang_tua: e.target.value})} className="w-full p-4 rounded-2xl border text-sm bg-gray-50 font-bold" />
                            <select value={formDaftar.jenjang_sekolah} onChange={e => setFormDaftar({...formDaftar, jenjang_sekolah: e.target.value})} className="w-full p-4 rounded-2xl border text-sm bg-gray-50 font-bold"><option value="TK">Jenjang: TK</option><option value="SD">Jenjang: SD</option><option value="SMP">Jenjang: SMP</option></select>
                          </div>
                          <input type="tel" placeholder="No WhatsApp" required value={formDaftar.no_hp} onChange={e => setFormDaftar({...formDaftar, no_hp: e.target.value})} className="w-full p-4 rounded-2xl border text-sm bg-gray-50 font-bold" />
                          <textarea placeholder="Alamat Domisili" required value={formDaftar.alamat} onChange={e => setFormDaftar({...formDaftar, alamat: e.target.value})} className="w-full p-4 rounded-2xl border text-sm bg-gray-50" rows="2" />
                          <button type="submit" disabled={loading} className="w-full py-5 bg-[#581878] hover:bg-purple-900 text-white text-lg font-black rounded-2xl shadow-xl transition">Kirim Formulir ke WhatsApp 🚀</button>
                        </form>
                      </div>
                    </section>
                  );
                }

                return null;
              });
            })()}
          </div>
        )}
      </main>

      {/* ========================================== */}
      /* MODAL POPUPS                               */
      /* ========================================== */}
      
      {/* MODAL APPROVAL & SETTING PERIODE */}
      {showApproveModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <h3 className="font-black text-xl text-[#581878] mb-2">Setting Periode Siswa</h3>
            <p className="text-xs text-gray-500 mb-6">Tentukan tanggal aktif untuk <strong>{approveData.nama_murid}</strong>.</p>
            <form onSubmit={handleSimpanApproval} className="space-y-4">
              <div><label className="text-xs font-bold text-gray-600 mb-1 block">Bulan Periode (Acuan Laporan):</label><input type="month" required value={approveData.bulan_periode} onChange={e => setApproveData({...approveData, bulan_periode: e.target.value})} className="w-full border p-3.5 rounded-2xl text-sm bg-gray-50 font-bold" /></div>
              <div><label className="text-xs font-bold text-gray-600 mb-1 block">Tanggal Mulai Belajar:</label><input type="date" required value={approveData.tanggal_mulai} onChange={e => setApproveData({...approveData, tanggal_mulai: e.target.value})} className="w-full border p-3.5 rounded-2xl text-sm bg-gray-50" /></div>
              <div><label className="text-xs font-bold text-gray-600 mb-1 block">Tanggal Selesai (Otomatis +1 Bln):</label><input type="date" required value={approveData.tanggal_selesai} onChange={e => setApproveData({...approveData, tanggal_selesai: e.target.value})} className="w-full border p-3.5 rounded-2xl text-sm bg-gray-50" /></div>
              <div className="flex justify-end space-x-3 pt-4"><button type="button" onClick={() => setShowApproveModal(false)} className="px-5 py-3 bg-gray-200 rounded-2xl text-sm font-bold">Batal</button><button type="submit" className="px-6 py-3 bg-[#581878] text-white rounded-2xl text-sm font-black shadow">Simpan & Aktifkan</button></div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TRANSAKSI INVENTARIS */}
      {showTransaksiModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl">
            <h3 className="font-black text-xl text-[#581878] mb-2">Transaksi Stok</h3>
            <p className="text-xs text-gray-500 mb-6">{formTransaksi.tipe_transaksi} - <strong>{formTransaksi.nama_barang}</strong></p>
            <form onSubmit={handleSimpanTransaksiInventaris} className="space-y-4">
              <div><label className="text-xs font-bold block mb-1">Jumlah Barang {formTransaksi.tipe_transaksi}:</label><input type="number" min="1" required value={formTransaksi.jumlah} onChange={e => setFormTransaksi({...formTransaksi, jumlah: parseInt(e.target.value)})} className="w-full border p-3.5 rounded-2xl text-sm bg-gray-50 font-bold" /></div>
              <div><label className="text-xs font-bold block mb-1">Keterangan / Catatan:</label><input type="text" placeholder="Contoh: Diberikan ke siswa X" value={formTransaksi.keterangan} onChange={e => setFormTransaksi({...formTransaksi, keterangan: e.target.value})} className="w-full border p-3.5 rounded-2xl text-sm bg-gray-50" /></div>
              <div className="flex justify-end space-x-3 pt-4"><button type="button" onClick={() => setShowTransaksiModal(false)} className="px-5 py-3 bg-gray-200 rounded-2xl text-sm font-bold">Batal</button><button type="submit" className={`px-6 py-3 text-white rounded-2xl text-sm font-black shadow ${formTransaksi.tipe_transaksi === 'Masuk' ? 'bg-emerald-600' : 'bg-red-600'}`}>Simpan Transaksi</button></div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT PEMBAYARAN */}
      {showEditPembayaranModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl">
            <h3 className="font-black text-xl text-[#581878] mb-6">Edit Pembayaran</h3>
            <form onSubmit={handleSimpanEditPembayaran} className="space-y-4">
              <div><label className="text-xs font-bold block mb-1">Nominal (Rp):</label><input type="number" required value={editPembayaranData.jumlah_bayar} onChange={e => setEditPembayaranData({...editPembayaranData, jumlah_bayar: e.target.value})} className="w-full border p-3.5 rounded-2xl text-sm font-bold" /></div>
              <div><label className="text-xs font-bold block mb-1">Item Bayar:</label><input type="text" required value={editPembayaranData.item_bayar} onChange={e => setEditPembayaranData({...editPembayaranData, item_bayar: e.target.value})} className="w-full border p-3.5 rounded-2xl text-sm" /></div>
              <div><label className="text-xs font-bold block mb-1">Tanggal Bayar:</label><input type="date" required value={editPembayaranData.tanggal_pembayaran?.split('T')[0] || ''} onChange={e => setEditPembayaranData({...editPembayaranData, tanggal_pembayaran: e.target.value})} className="w-full border p-3.5 rounded-2xl text-sm" /></div>
              <div className="flex justify-end space-x-3 pt-4"><button type="button" onClick={() => setShowEditPembayaranModal(false)} className="px-5 py-3 bg-gray-200 rounded-2xl text-sm font-bold">Batal</button><button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black shadow">Simpan</button></div>
            </form>
          </div>
        </div>
      )}

      {showLoginModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-10 shadow-2xl relative">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-6 right-6 text-gray-400 font-bold">✕</button>
            <h3 className="text-3xl font-black text-[#581878] mb-8 text-center">Login Portal</h3>
            <form onSubmit={handleLogin} className="space-y-4">
              <input type="email" name="email" required className="w-full px-5 py-4 border rounded-2xl text-sm bg-gray-50 font-bold" placeholder="Email Akun" />
              <input type="password" name="password" required className="w-full px-5 py-4 border rounded-2xl text-sm bg-gray-50 font-bold" placeholder="Password" />
              <button type="submit" disabled={loading} className="w-full py-4 bg-[#581878] text-amber-300 font-black rounded-2xl shadow-xl transition">MASUK SEKARANG</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
