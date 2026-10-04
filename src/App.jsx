import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// ==========================================
// INISIALISASI SUPABASE CLIENT
// ==========================================
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

  // Navigasi & Sidebar
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

  // Master Data State
  const [paketList, setPaketList] = useState([]);
  const [daftarSiswa, setDaftarSiswa] = useState([]);
  const [daftarMentor, setDaftarMentor] = useState([]);
  const [daftarPeriode, setDaftarPeriode] = useState([]);
  const [daftarPresensiSiswa, setDaftarPresensiSiswa] = useState([]);
  const [daftarPembayaran, setDaftarPembayaran] = useState([]);
  const [daftarPresensiMentor, setDaftarPresensiMentor] = useState([]);
  const [daftarInventaris, setDaftarInventaris] = useState([]);

  // Filter & Pagination States
  const [filterBulanPresensiMentor, setFilterBulanPresensiMentor] = useState(new Date().toISOString().slice(0, 7));
  const [filterBulanPembayaran, setFilterBulanPembayaran] = useState(new Date().toISOString().slice(0, 7));
  const [currentPagePembayaran, setCurrentPagePembayaran] = useState(1);
  const itemsPerPage = 15;

  // Web & Landing Page Setup
  const [pengaturanWeb, setPengaturanWeb] = useState({ 
    judul_utama: 'Bimbel ErHa', 
    sub_judul: 'Rumah Hebat, Bersahabat & Berprestasi', 
    logo_url: '', 
    no_admin_wa: '6281915058297' 
  });
  const [landingSections, setLandingSections] = useState([]);

  // UI & Modals States
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [expandedStudentId, setExpandedStudentId] = useState(null);

  // Form Data States
  const [formDaftar, setFormDaftar] = useState({ nama_murid: '', nama_orang_tua: '', no_hp: '', alamat: '', jenjang_sekolah: 'SD' });
  const [selectedPaket, setSelectedPaket] = useState([]);

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveData, setApproveData] = useState({ 
    siswa_id: '', nama_murid: '', paket_id: '', 
    bulan_periode: new Date().toISOString().slice(0, 7), 
    tanggal_mulai: new Date().toISOString().split('T')[0], 
    tanggal_selesai: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0] 
  });

  const [showEditPembayaranModal, setShowEditPembayaranModal] = useState(false);
  const [editPembayaranData, setEditPembayaranData] = useState({ id: '', jumlah_bayar: 0, item_bayar: '', catatan: '', tanggal_pembayaran: '' });

  const [showTransaksiModal, setShowTransaksiModal] = useState(false);
  const [formTransaksi, setFormTransaksi] = useState({ barang_id: '', nama_barang: '', tipe_transaksi: 'Masuk', jumlah: 1, keterangan: '' });

  const [formPresensiMentor, setFormPresensiMentor] = useState({ mentor_id: '', tanggal: new Date().toISOString().split('T')[0], total_jam: 0, kegiatan_pembelajaran: '' });
  const [formPembayaran, setFormPembayaran] = useState({ siswa_id: '', tanggal_pembayaran: new Date().toISOString().split('T')[0], items: [], total_bayar: 0, catatan: '' });
  
  // Presensi Guru States
  const [searchSiswaPresensi, setSearchSiswaPresensi] = useState(''); 
  const [isDropdownPresensiOpen, setIsDropdownPresensiOpen] = useState(false);
  const [newPresensiSiswa, setNewPresensiSiswa] = useState({ periode_id: '', pertemuan_ke: 1, tanggal_pertemuan: new Date().toISOString().split('T')[0], status_kehadiran: 'Hadir', jurnal_materi: '' });

  // Format Tanggal Utility
  const formatTanggalIndo = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  // ==========================================
  // 2. EFFECTS & DATA FETCHING
  // ==========================================
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        determineUserRoleAndProfile(session.user).then(() => setAppReady(true));
      } else {
        setAppReady(true);
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
    } catch(err) {
      console.error("Setting fetch error:", err);
    }
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
    } catch(err) {
      console.error('Error fetch global:', err);
    }
  }

  // ==========================================
  // 3. HANDLERS - AUTH & PENDAFTARAN
  // ==========================================
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const email = e.target.email.value;
    const password = e.target.password.value;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      showToast('Login gagal: ' + error.message, 'error');
    } else {
      setShowLoginModal(false);
      determineUserRoleAndProfile(data.user);
      showToast('Login berhasil!');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    showToast('Berhasil keluar.');
  };

  const handleDaftarSubmit = async (e) => {
    e.preventDefault();
    if (selectedPaket.length === 0) return showToast('Pilih minimal satu paket!', 'error');
    setLoading(true);
    try {
      const { data: siswaData } = await supabase.from('siswa').insert([{ ...formDaftar, status: 'pending' }]).select();
      if (siswaData && siswaData[0]) {
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
    } catch(err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 4. HANDLERS - ADMIN (APPROVAL & MENTOR)
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
      
      await supabase.from('pembayaran_siswa').insert([{
        siswa_id: approveData.siswa_id,
        item_bayar: 'Pendaftaran & Paket Awal',
        jumlah_bayar: 0,
        status_pembayaran: 'Belum Lunas'
      }]);
      
      showToast('Siswa berhasil diaktifkan & Periode diset!');
      setShowApproveModal(false);
      fetchAllData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

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
  // 5. HANDLERS - PEMBAYARAN & INVENTARIS
  // ==========================================
  const filteredPembayaran = daftarPembayaran.filter(pb => filterBulanPembayaran ? pb.tanggal_pembayaran?.startsWith(filterBulanPembayaran) : true);
  const totalPenerimaanBulanan = filteredPembayaran.reduce((sum, pb) => sum + (Number(pb.jumlah_bayar) || 0), 0);
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

  const handleCatatPembayaran = async (e) => {
    e.preventDefault();
    if (formPembayaran.items.length === 0) return showToast('Pilih minimal 1 item!', 'error');
    const gabunganItems = formPembayaran.items.join(', ');
    await supabase.from('pembayaran_siswa').insert([{ 
      siswa_id: formPembayaran.siswa_id, 
      item_bayar: gabunganItems, 
      jumlah_bayar: formPembayaran.total_bayar, 
      tanggal_pembayaran: formPembayaran.tanggal_pembayaran, 
      catatan: formPembayaran.catatan, 
      status_pembayaran: 'lunas' 
    }]);
    showToast('Pembayaran berhasil dicatat!');
    setFormPembayaran({ siswa_id: '', tanggal_pembayaran: new Date().toISOString().split('T')[0], items: [], total_bayar: 0, catatan: '' });
    fetchAllData();
  };

  const handleHapusPembayaran = async (id) => {
    if(!window.confirm('Hapus rekam pembayaran?')) return;
    await supabase.from('pembayaran_siswa').delete().eq('id', id);
    showToast('Data pembayaran dihapus.');
    fetchAllData();
  };

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
        barang_id: barang.id, 
        tipe_transaksi: formTransaksi.tipe_transaksi, 
        jumlah: formTransaksi.jumlah, 
        keterangan: formTransaksi.keterangan
      }]);
      showToast(`Transaksi ${formTransaksi.tipe_transaksi} berhasil dicatat.`);
      setShowTransaksiModal(false);
      fetchAllData();
    } catch(err) {
      showToast(err.message, 'error');
    }
  };

  // ==========================================
  // 6. HANDLERS - GURU PRESENSI SISWA
  // ==========================================
  const handlePilihSiswaPresensi = (periode) => {
    setSearchSiswaPresensi(`${periode.siswa?.nama_murid} (${periode.paket_belajar?.nama_paket})`);
    setIsDropdownPresensiOpen(false);
    const count = daftarPresensiSiswa.filter(ps => ps.periode_id === periode.id).length + 1;
    setNewPresensiSiswa(prev => ({ ...prev, periode_id: periode.id, pertemuan_ke: count }));
  };

  const handleTambahPresensiSiswa = async (e) => {
    e.preventDefault();
    if (!newPresensiSiswa.periode_id) return showToast('Pilih siswa aktif terlebih dahulu!', 'error');
    if (!currentMentorProfile || !currentMentorProfile.id) return showToast('Sesi login mentor tidak valid.', 'error');

    const { error } = await supabase.from('presensi_siswa').insert([{ 
      periode_id: newPresensiSiswa.periode_id, 
      mentor_id: currentMentorProfile.id, 
      pertemuan_ke: newPresensiSiswa.pertemuan_ke, 
      tanggal_pertemuan: newPresensiSiswa.tanggal_pertemuan, 
      is_hadir: newPresensiSiswa.status_kehadiran === 'Hadir', 
      jurnal_materi: `[${newPresensiSiswa.status_kehadiran}] ${newPresensiSiswa.jurnal_materi}` 
    }]);

    if (error) {
      showToast('Gagal menyimpan presensi: ' + error.message, 'error');
      return;
    }

    const periodeObj = daftarPeriode.find(p => p.id === newPresensiSiswa.periode_id);
    if (periodeObj?.siswa?.no_hp && window.confirm('Presensi berhasil dicatat! Ingin kirim laporan ke WhatsApp Wali?')) {
      const wa = periodeObj.siswa.no_hp.replace(/^0/, '62');
      const text = `Laporan ErHa: ${periodeObj.siswa.nama_murid}, Sesi ${newPresensiSiswa.pertemuan_ke}. Materi: ${newPresensiSiswa.jurnal_materi} (${newPresensiSiswa.status_kehadiran})`;
      window.open(`https://wa.me/${wa}?text=${encodeURIComponent(text)}`, '_blank');
    } else {
      showToast('Presensi berhasil dicatat!');
    }

    setNewPresensiSiswa(prev => ({ ...prev, jurnal_materi: '' }));
    setSearchSiswaPresensi('');
    fetchAllData();
  };
// ==========================================
  // RENDER UTAMA
  // ==========================================
  if (!appReady) return <div className="min-h-screen flex items-center justify-center font-bold text-[#581878] bg-purple-50">Memuat Portal ErHa...</div>;

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-gray-800 flex flex-col">
      
      {/* Toast Notifikasi */}
      {toast.show && (
        <div className={`fixed top-5 right-5 z-[200] px-5 py-3 rounded-2xl shadow-2xl text-sm font-bold text-white flex items-center space-x-2 animate-bounce ${toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
          <span>{toast.type === 'error' ? '❌' : '✅'}</span><span>{toast.message}</span>
        </div>
      )}

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-[#581878] shadow-md border-b-2 border-purple-900">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {user && (
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden text-white focus:outline-none">
                <span className="text-2xl">☰</span>
              </button>
            )}
            <div className="flex items-center space-x-2.5">
              <div className="bg-white p-1 rounded-xl shadow-inner">
                <img src={pengaturanWeb.logo_url || "/logo.png"} alt="Logo" className="h-8 w-8 object-contain" />
              </div>
              <div>
                <h1 className="text-white font-black text-base tracking-tight leading-none">{pengaturanWeb.judul_utama}</h1>
                <p className="text-amber-400 font-bold text-[10px] tracking-wider uppercase">Rumah Hebat</p>
              </div>
            </div>
          </div>
          <div>
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="hidden sm:block text-xs font-black text-amber-300 uppercase">{userRole === 'admin' ? '👑 Admin' : `Guru: ${currentMentorProfile?.nama_mentor?.split(' ')[0] || ''}`}</span>
                <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-1.5 px-4 rounded-xl text-xs shadow transition">Keluar</button>
              </div>
            ) : (
              <button onClick={() => setShowLoginModal(true)} className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-white font-black py-2 px-5 rounded-2xl text-xs shadow-lg transition flex items-center space-x-1.5">
                <span>🔐</span> <span>Login Portal</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {user ? (
          <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
            
            {/* SIDEBAR DASHBOARD */}
            <aside className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-white shadow-xl md:shadow-none md:border-r border-gray-200 p-6 flex flex-col justify-between transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-200 ease-in-out`}>
              <div className="space-y-6 pt-12 md:pt-0">
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Menu Utama</p>
                <div className="space-y-1">
                  {userRole === 'admin' ? (
                    <>
                      {['dashboard','siswa','mentor','pembayaran','modul'].map(tab => (
                        <button key={tab} onClick={() => { setAdminTab(tab); setIsSidebarOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-sm transition capitalize ${adminTab === tab ? 'bg-purple-900 text-white shadow-lg' : 'text-gray-600 hover:bg-purple-50'}`}>
                          <span>{tab==='dashboard'?'📊':tab==='siswa'?'📋':tab==='mentor'?'👩‍🏫':tab==='pembayaran'?'💵':'📦'}</span> 
                          <span>{tab}</span>
                        </button>
                      ))}
                    </>
                  ) : (
                    <>
                      {['beranda','presensi','modul'].map(tab => (
                        <button key={tab} onClick={() => { setGuruTab(tab); setIsSidebarOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-sm transition capitalize ${guruTab === tab ? 'bg-purple-900 text-white shadow-lg' : 'text-gray-600 hover:bg-purple-50'}`}>
                          <span>{tab==='beranda'?'🏠':tab==='presensi'?'📝':'📦'}</span> 
                          <span>{tab}</span>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </aside>

            {/* DASHBOARD KONTEN UTAMA */}
            <div className="flex-1 overflow-x-hidden space-y-6">
              
              {/* PORTAL ADMIN */}
              {userRole === 'admin' && (
                <>
                  {/* TAB DASHBOARD */}
                  {adminTab === 'dashboard' && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-black text-gray-900">Dashboard 📊</h2>
                        <p className="text-xs text-gray-500">Ringkasan aktivitas Bimbingan Belajar ErHa.</p>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                          <p className="text-xs font-bold text-gray-400 uppercase">Siswa Aktif</p>
                          <h4 className="text-3xl font-black text-purple-900">{daftarSiswa.filter(s => s.status === 'aktif').length}</h4>
                        </div>
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                          <p className="text-xs font-bold text-gray-400 uppercase">Total Mentor</p>
                          <h4 className="text-3xl font-black text-emerald-600">{daftarMentor.length}</h4>
                        </div>
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                          <p className="text-xs font-bold text-gray-400 uppercase">Pending Approval</p>
                          <h4 className="text-3xl font-black text-amber-500">{daftarSiswa.filter(s => s.status === 'pending').length}</h4>
                        </div>
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                          <p className="text-xs font-bold text-gray-400 uppercase">Total Logistik</p>
                          <h4 className="text-3xl font-black text-blue-600">{daftarInventaris.length}</h4>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB SISWA */}
                  {adminTab === 'siswa' && (
                    <div className="space-y-6">
                      <div className="flex space-x-2 border-b border-gray-200 pb-3">
                        <button onClick={() => setSiswaSubTab('persetujuan')} className={`px-4 py-2 rounded-xl font-bold text-xs ${siswaSubTab === 'persetujuan' ? 'bg-amber-400 text-purple-950 shadow' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Persetujuan Baru ({daftarSiswa.filter(s=>s.status==='pending').length})</button>
                        <button onClick={() => setSiswaSubTab('data')} className={`px-4 py-2 rounded-xl font-bold text-xs ${siswaSubTab === 'data' ? 'bg-purple-900 text-white shadow' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Data Siswa Aktif</button>
                      </div>

                      {/* SUBTAB: PERSETUJUAN */}
                      {siswaSubTab === 'persetujuan' && (
                        <div className="bg-white rounded-3xl p-6 border shadow-sm">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-purple-50">
                              <tr><th className="p-4 rounded-tl-xl">Pendaftar</th><th className="p-4">Jenjang & Kontak</th><th className="p-4 text-center rounded-tr-xl">Aksi</th></tr>
                            </thead>
                            <tbody>
                              {daftarSiswa.filter(s => s.status === 'pending').map(s => (
                                <tr key={s.id} className="border-t hover:bg-purple-50/50">
                                  <td className="p-4 font-bold">{s.nama_murid}</td>
                                  <td className="p-4">{s.jenjang_sekolah} <span className="block text-xs text-gray-500">{s.no_hp}</span></td>
                                  <td className="p-4 text-center">
                                    <button onClick={() => openApproveModal(s)} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow hover:bg-emerald-700">✓ Setujui & Atur Periode</button>
                                  </td>
                                </tr>
                              ))}
                              {daftarSiswa.filter(s => s.status === 'pending').length === 0 && <tr><td colSpan="3" className="text-center p-8 italic text-gray-400">Tidak ada pendaftaran pending.</td></tr>}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* SUBTAB: DATA AKTIF (EXPANDING ROW) */}
                      {siswaSubTab === 'data' && (
                        <div className="bg-white rounded-3xl p-6 border shadow-sm">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-purple-50">
                              <tr><th className="p-4 rounded-tl-xl">Nama & Periode Aktif</th><th className="p-4 text-center rounded-tr-xl">Progress Sesi</th></tr>
                            </thead>
                            <tbody>
                              {daftarSiswa.filter(s => s.status === 'aktif').map(s => {
                                const pAktif = daftarPeriode.find(p => p.siswa_id === s.id && p.status_periode === 'berjalan');
                                const isExpanded = expandedStudentId === s.id;
                                const count = pAktif ? daftarPresensiSiswa.filter(ps => ps.periode_id === pAktif.id).length : 0;
                                const tglAkhir = pAktif?.tanggal_selesai ? new Date(pAktif.tanggal_selesai) : null;
                                const isLate = tglAkhir && new Date() > tglAkhir;

                                return (
                                  <React.Fragment key={s.id}>
                                    <tr className={`border-t cursor-pointer hover:bg-gray-50 transition-colors ${isExpanded ? 'bg-purple-50/50' : ''}`} onClick={() => setExpandedStudentId(isExpanded ? null : s.id)}>
                                      <td className="p-4">
                                        <div className="font-bold text-gray-900">{s.nama_murid} <span className="text-[10px] font-black bg-gray-200 px-2 py-0.5 rounded-full uppercase">{s.jenjang_sekolah}</span></div>
                                        {pAktif ? (
                                          <div className="text-xs text-gray-500 mt-1">
                                            {formatTanggalIndo(pAktif.tanggal_mulai)} s/d {formatTanggalIndo(pAktif.tanggal_selesai)} 
                                            {isLate && <span className="ml-2 text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded">(Melewati Batas)</span>}
                                          </div>
                                        ) : <div className="text-xs text-amber-500 font-bold mt-1">Belum ada periode aktif.</div>}
                                      </td>
                                      <td className="p-4 text-center">
                                        <span className="text-xs bg-purple-100 text-purple-800 px-3 py-1.5 rounded-xl font-bold border border-purple-200">{count}/12 Sesi ▼</span>
                                      </td>
                                    </tr>
                                    {isExpanded && pAktif && (
                                      <tr className="bg-gray-50 border-b-2 border-purple-200">
                                        <td colSpan="2" className="p-6">
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-purple-100">
                                              <h5 className="font-black text-[#581878] mb-3 text-xs uppercase">📖 Riwayat Presensi Periode Ini</h5>
                                              <ul className="space-y-2 text-xs">
                                                {daftarPresensiSiswa.filter(ps => ps.periode_id === pAktif.id).map(ps => (
                                                  <li key={ps.id} className="flex justify-between border-b border-gray-100 pb-1.5">
                                                    <span>Sesi {ps.pertemuan_ke} - {formatTanggalIndo(ps.tanggal_pertemuan)}</span>
                                                    <span className="font-bold text-gray-600 truncate max-w-[140px]">{ps.jurnal_materi}</span>
                                                  </li>
                                                ))}
                                                {count === 0 && <li className="text-gray-400 italic">Belum ada pertemuan.</li>}
                                              </ul>
                                            </div>
                                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-100">
                                              <h5 className="font-black text-emerald-700 mb-3 text-xs uppercase">💵 Riwayat Pembayaran</h5>
                                              <ul className="space-y-2 text-xs">
                                                {daftarPembayaran.filter(pb => pb.siswa_id === s.id && pb.periode_id === pAktif.id).map(pb => (
                                                  <li key={pb.id} className="flex justify-between border-b border-gray-100 pb-1.5">
                                                    <span>{formatTanggalIndo(pb.tanggal_pembayaran)} - {pb.item_bayar}</span>
                                                    <span className="font-black text-emerald-600">Rp {(Number(pb.jumlah_bayar)||0).toLocaleString('id-ID')}</span>
                                                  </li>
                                                ))}
                                                {daftarPembayaran.filter(pb => pb.siswa_id === s.id && pb.periode_id === pAktif.id).length === 0 && <li className="text-gray-400 italic">Belum ada rekam pembayaran.</li>}
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

                  {/* TAB MENTOR & PRESENSI */}
                  {adminTab === 'mentor' && (
                    <div className="space-y-6">
                      <div className="flex space-x-2 border-b border-gray-200 pb-3">
                        <button onClick={() => setMentorSubTab('daftar')} className={`px-4 py-2 rounded-xl font-bold text-xs ${mentorSubTab === 'daftar' ? 'bg-purple-900 text-white' : 'bg-white text-gray-600'}`}>Daftar Mentor</button>
                        <button onClick={() => setMentorSubTab('presensi')} className={`px-4 py-2 rounded-xl font-bold text-xs ${mentorSubTab === 'presensi' ? 'bg-purple-900 text-white' : 'bg-white text-gray-600'}`}>Presensi & Hitung Jam</button>
                      </div>
                      
                      {mentorSubTab === 'presensi' && (
                        <div className="bg-white rounded-3xl p-6 shadow-sm border space-y-6">
                          <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                            <h3 className="font-black text-purple-900 mb-4">Catat Jam Kerja Mentor</h3>
                            <form onSubmit={handleTambahPresensiMentor} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <select required value={formPresensiMentor.mentor_id} onChange={e => setFormPresensiMentor({...formPresensiMentor, mentor_id: e.target.value})} className="border p-3 rounded-xl text-sm bg-white font-bold"><option value="">Pilih Mentor</option>{daftarMentor.map(m => <option key={m.id} value={m.id}>{m.nama_mentor}</option>)}</select>
                              <input type="date" required value={formPresensiMentor.tanggal} onChange={e => setFormPresensiMentor({...formPresensiMentor, tanggal: e.target.value})} className="border p-3 rounded-xl text-sm bg-white" />
                              <input type="number" step="0.5" placeholder="Total Jam" required value={formPresensiMentor.total_jam} onChange={e => setFormPresensiMentor({...formPresensiMentor, total_jam: parseFloat(e.target.value)})} className="border p-3 rounded-xl text-sm bg-white font-bold" />
                              <button type="submit" className="bg-[#581878] hover:bg-purple-900 text-white rounded-xl font-black text-sm shadow transition">Simpan Jam</button>
                            </form>
                          </div>

                          <div className="pt-4 border-t border-gray-100">
                            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                              <h3 className="font-extrabold text-gray-900 text-lg">Rekapitulasi Jam Kerja</h3>
                              <input type="month" value={filterBulanPresensiMentor} onChange={e => setFilterBulanPresensiMentor(e.target.value)} className="border p-2.5 rounded-xl text-sm font-bold bg-white shadow-sm" />
                            </div>
                            
                            <div className="bg-gradient-to-r from-[#581878] to-purple-800 text-white p-5 rounded-2xl flex justify-between items-center mb-6 shadow-md">
                              <div>
                                <span className="font-bold text-sm block">Total Seluruh Jam Mengajar</span>
                                <span className="text-xs text-purple-300">Pada bulan terpilih</span>
                              </div>
                              <span className="text-3xl font-black text-amber-400">{totalJamMentorFiltered} Jam</span>
                            </div>

                            <table className="w-full text-left text-sm">
                              <thead className="bg-gray-50"><tr><th className="p-3 rounded-tl-xl">Tanggal</th><th className="p-3">Mentor</th><th className="p-3 text-right rounded-tr-xl">Total Jam</th></tr></thead>
                              <tbody>
                                {filteredPresensiMentor.map(pm => (
                                  <tr key={pm.id} className="border-t hover:bg-gray-50">
                                    <td className="p-3">{formatTanggalIndo(pm.tanggal)}</td>
                                    <td className="p-3 font-bold">{pm.mentor?.nama_mentor}</td>
                                    <td className="p-3 text-right font-black text-purple-700">{pm.total_jam}</td>
                                  </tr>
                                ))}
                                {filteredPresensiMentor.length === 0 && <tr><td colSpan="3" className="text-center p-6 text-gray-400 italic">Tidak ada data presensi pada bulan ini.</td></tr>}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB PEMBAYARAN */}
                  {adminTab === 'pembayaran' && (
                    <div className="bg-white rounded-3xl p-6 shadow-sm border space-y-6">
                      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                        <h3 className="font-black text-gray-900 mb-4">Form Input Pembayaran</h3>
                        <form onSubmit={handleCatatPembayaran} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <select required value={formPembayaran.siswa_id} onChange={e => setFormPembayaran({...formPembayaran, siswa_id: e.target.value})} className="border p-3.5 rounded-xl text-sm bg-white font-bold"><option value="">Pilih Siswa</option>{daftarSiswa.map(s => <option key={s.id} value={s.id}>{s.nama_murid}</option>)}</select>
                          <input type="number" placeholder="Nominal Bayar (Rp)" required value={formPembayaran.total_bayar} onChange={e => setFormPembayaran({...formPembayaran, total_bayar: Number(e.target.value)})} className="border p-3.5 rounded-xl text-sm font-bold bg-white text-emerald-700" />
                          <div className="md:col-span-2 border p-4 rounded-xl bg-white shadow-sm">
                            <p className="text-xs font-bold mb-2 text-gray-600 uppercase">Pilih Item Pembayaran:</p>
                            <div className="flex flex-wrap gap-3">
                              {['Pendaftaran', 'Paket Bulanan', 'Buku', 'Seragam', 'Lainnya'].map(item => (
                                <label key={item} className="text-xs flex items-center cursor-pointer font-bold bg-gray-50 px-3 py-2 rounded-lg border border-gray-100"><input type="checkbox" className="mr-2 accent-purple-700 w-4 h-4" onChange={e => e.target.checked ? setFormPembayaran({...formPembayaran, items: [...formPembayaran.items, item]}) : setFormPembayaran({...formPembayaran, items: formPembayaran.items.filter(i => i !== item)}) } /> {item}</label>
                              ))}
                            </div>
                          </div>
                          <button type="submit" className="md:col-span-2 bg-[#581878] hover:bg-purple-900 text-white py-4 rounded-xl font-black shadow transition">Simpan Rekam Pembayaran</button>
                        </form>
                      </div>

                      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                        <div>
                          <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Total Penerimaan Filtered</p>
                          <h2 className="text-4xl font-black text-emerald-600 mt-1">Rp {totalPenerimaanBulanan.toLocaleString('id-ID')}</h2>
                        </div>
                        <input type="month" value={filterBulanPembayaran} onChange={e => {setFilterBulanPembayaran(e.target.value); setCurrentPagePembayaran(1);}} className="border p-3 rounded-xl text-sm font-bold bg-white shadow-sm" />
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-gray-100">
                            <tr><th className="p-4 rounded-tl-xl">Tanggal</th><th className="p-4">Siswa</th><th className="p-4">Item</th><th className="p-4">Nominal</th><th className="p-4 text-center rounded-tr-xl">Aksi</th></tr>
                          </thead>
                          <tbody>
                            {paginatedPembayaran.map(pb => (
                              <tr key={pb.id} className="border-t hover:bg-gray-50">
                                <td className="p-4 font-medium">{formatTanggalIndo(pb.tanggal_pembayaran)}</td>
                                <td className="p-4 font-bold text-gray-900">{pb.siswa?.nama_murid}</td>
                                <td className="p-4">{pb.item_bayar}</td>
                                <td className="p-4 text-emerald-600 font-black">Rp {(Number(pb.jumlah_bayar)||0).toLocaleString('id-ID')}</td>
                                <td className="p-4 text-center flex justify-center gap-2">
                                  <button onClick={() => { setEditPembayaranData({id: pb.id, jumlah_bayar: pb.jumlah_bayar, item_bayar: pb.item_bayar, catatan: pb.catatan, tanggal_pembayaran: pb.tanggal_pembayaran}); setShowEditPembayaranModal(true); }} className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold">Edit</button>
                                  <button onClick={() => handleHapusPembayaran(pb.id)} className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold">Hapus</button>
                                </td>
                              </tr>
                            ))}
                            {paginatedPembayaran.length === 0 && <tr><td colSpan="5" className="text-center p-6 italic text-gray-400">Tidak ada rekam pembayaran di bulan ini.</td></tr>}
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="flex justify-between items-center text-xs text-gray-500 pt-4 border-t">
                        <span className="font-bold">Halaman {currentPagePembayaran} dari {totalPagesPembayaran || 1}</span>
                        <div className="space-x-2">
                          <button onClick={() => setCurrentPagePembayaran(Math.max(1, currentPagePembayaran - 1))} disabled={currentPagePembayaran === 1} className="px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg disabled:opacity-50">Prev</button>
                          <button onClick={() => setCurrentPagePembayaran(Math.min(totalPagesPembayaran, currentPagePembayaran + 1))} disabled={currentPagePembayaran === totalPagesPembayaran || totalPagesPembayaran === 0} className="px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg disabled:opacity-50">Next</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB INVENTARIS LOGISTIK */}
                  {adminTab === 'modul' && (
                    <div className="bg-white rounded-3xl p-6 shadow-sm border">
                      <div className="mb-6">
                        <h3 className="text-2xl font-black text-gray-900">Inventaris & Logistik 📦</h3>
                        <p className="text-xs text-gray-500">Gunakan tombol masuk/keluar untuk mencatat transaksi stok.</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {daftarInventaris.map(b => (
                          <div key={b.id} className="border border-gray-100 p-6 rounded-3xl bg-white shadow-sm flex flex-col justify-between hover:shadow-xl transition-shadow">
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full">{b.kategori}</span>
                              <h5 className="font-bold text-gray-900 mt-4 text-lg leading-tight">{b.nama_barang}</h5>
                            </div>
                            <div className="mt-6">
                              <div className="bg-gray-50 border p-3 rounded-2xl mb-4 text-center">
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Stok Gudang</p>
                                <p className="text-2xl font-black text-gray-800">{b.stok}</p>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => openTransaksiModal(b, 'Masuk')} className="flex-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-black py-2.5 rounded-xl transition">IN [+]</button>
                                <button onClick={() => openTransaksiModal(b, 'Keluar')} className="flex-1 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-black py-2.5 rounded-xl transition">OUT [-]</button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* PORTAL GURU */}
              {userRole === 'guru' && (
                <>
                  {guruTab === 'beranda' && (
                    <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
                      <div>
                        <span className="bg-amber-400 text-purple-950 font-black text-[10px] px-3 py-1 rounded-full uppercase">Portal Pengajar</span>
                        <h2 className="text-3xl font-black mt-2">Selamat Datang, {currentMentorProfile?.nama_mentor || 'Pengajar'} 👋</h2>
                        <p className="text-purple-200 text-sm mt-1">Sistem Manajemen Akademik ErHa</p>
                      </div>
                    </div>
                  )}

                  {guruTab === 'presensi' && (
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-xl mx-auto space-y-5">
                      <h3 className="text-xl font-black text-[#581878]">Catat Presensi Kelas Hari Ini</h3>
                      <form onSubmit={handleTambahPresensiSiswa} className="space-y-5">
                        <div className="relative">
                          <label className="text-xs font-bold text-gray-600 mb-1 block">Cari / Pilih Siswa Aktif:</label>
                          <input type="text" placeholder="Ketik nama siswa aktif..." value={searchSiswaPresensi} onFocus={() => setIsDropdownPresensiOpen(true)} onChange={e => { setSearchSiswaPresensi(e.target.value); setIsDropdownPresensiOpen(true); setNewPresensiSiswa(prev => ({...prev, periode_id: ''})); }} className="w-full border p-4 rounded-2xl text-sm outline-none focus:border-purple-600 bg-gray-50 font-bold" />
                          {isDropdownPresensiOpen && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-purple-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto">
                              {daftarPeriode.filter(p => p.siswa?.status === 'aktif' && p.status_periode === 'berjalan').filter(p => p.siswa?.nama_murid?.toLowerCase().includes((searchSiswaPresensi || '').toLowerCase())).map(p => (
                                <div key={p.id} onClick={() => handlePilihSiswaPresensi(p)} className="p-4 cursor-pointer hover:bg-purple-50 border-b text-sm font-bold text-[#581878]">{p.siswa?.nama_murid} <span className="text-xs font-normal text-gray-500">({p.paket_belajar?.nama_paket})</span></div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div><label className="text-xs font-bold text-gray-600 mb-1 block">Sesi Pertemuan Ke-:</label><input type="text" readOnly value={`Pertemuan Ke- ${newPresensiSiswa.pertemuan_ke}`} className="border p-4 rounded-2xl w-full bg-gray-200 font-black text-center text-sm text-[#581878]" /></div>
                        <div><label className="text-xs font-bold text-gray-600 mb-1 block">Tanggal Pertemuan:</label><input type="date" required value={newPresensiSiswa.tanggal_pertemuan} onChange={e => setNewPresensiSiswa({...newPresensiSiswa, tanggal_pertemuan: e.target.value})} className="border p-4 rounded-2xl w-full text-sm bg-gray-50 font-bold" /></div>
                        <div>
                          <label className="text-xs font-bold text-gray-600 mb-1 block">Kehadiran:</label>
                          <select value={newPresensiSiswa.status_kehadiran} onChange={e => setNewPresensiSiswa({...newPresensiSiswa, status_kehadiran: e.target.value})} className="border p-4 rounded-2xl w-full text-sm font-bold bg-gray-50">
                            <option value="Hadir">✅ Hadir</option>
                            <option value="Izin">📩 Izin</option>
                          </select>
                        </div>
                        <div><label className="text-xs font-bold text-gray-600 mb-1 block">Jurnal Materi (Singkat):</label><input type="text" placeholder="Contoh: Pecahan Senilai" required value={newPresensiSiswa.jurnal_materi} onChange={e => setNewPresensiSiswa({...newPresensiSiswa, jurnal_materi: e.target.value})} className="border p-4 rounded-2xl w-full text-sm bg-gray-50 font-bold" /></div>
                        <button type="submit" className="w-full bg-[#581878] hover:bg-purple-900 text-white py-4 rounded-2xl font-black shadow-lg transition">Simpan Presensi Kelas</button>
                      </form>
                    </div>
                  )}

                  {guruTab === 'modul' && (
                    <div className="bg-white rounded-3xl p-6 shadow-sm border max-w-4xl mx-auto">
                      <h3 className="text-2xl font-black text-gray-900 mb-6">Cek Ketersediaan Logistik</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {daftarInventaris.map(b => (
                          <div key={b.id} className="border p-4 rounded-2xl bg-gray-50 shadow-sm text-center">
                            <h5 className="font-bold text-gray-900 text-sm">{b.nama_barang}</h5>
                            <p className="text-xl font-black text-emerald-600 mt-2">{b.stok} <span className="text-xs font-bold text-gray-400">Item</span></p>
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
          /* LANDING PAGE PUBLIK */
          <div className="space-y-0 bg-[#FFFDF0]">
            {(() => {
              let renderSections = landingSections && landingSections.length > 0 
                ? [...landingSections].filter(sec => sec.is_aktif).sort((a, b) => a.urutan - b.urutan) 
                : [];
              
              if (renderSections.length === 0) {
                renderSections = [
                  { id: 'fb1', section_key: 'hero' }, 
                  { id: 'fb3', section_key: 'paket' }, 
                  { id: 'fb5', section_key: 'pendaftaran' }
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

                if (key === 'paket') {
                  return (
                    <section key={sec.id} className="max-w-6xl mx-auto px-4 py-24 -mt-10 relative z-20">
                      <div className="text-center mb-12">
                        <h3 className="text-4xl font-black text-[#581878] drop-shadow-sm">Program Belajar Unggulan</h3>
                        <p className="text-gray-500 mt-2">Pilih paket bimbingan yang tepat untuk buah hati Anda.</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {paketList.map(paket => (
                          <div key={paket.id} onClick={() => setSelectedPaket(prev => prev.includes(paket.id) ? prev.filter(p=>p!==paket.id) : [...prev, paket.id])} className={`cursor-pointer bg-white rounded-3xl p-8 transition-all duration-300 transform hover:-translate-y-1 ${selectedPaket.includes(paket.id) ? 'border-4 border-amber-400 shadow-2xl bg-amber-50/20' : 'border border-gray-200 shadow-lg'}`}>
                            <h4 className="text-2xl font-black text-gray-900 mb-3">{paket.nama_paket}</h4>
                            <p className="text-gray-500 text-sm leading-relaxed">{paket.deskripsi}</p>
                            {selectedPaket.includes(paket.id) && <div className="mt-6 text-xs font-black text-amber-700 bg-amber-100 px-4 py-2 rounded-full inline-block uppercase tracking-wider">✓ Paket Terpilih</div>}
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                }

                if (key === 'pendaftaran') {
                  return (
                    <section key={sec.id} className="bg-purple-50 py-24 px-4">
                      <div className="max-w-3xl mx-auto bg-white rounded-[2.5rem] shadow-2xl p-10 md:p-14 border border-purple-100 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-amber-400 to-[#581878]"></div>
                        <div className="text-center mb-10">
                          <h3 className="text-4xl font-black text-[#581878] mb-3">Daftar Sekarang</h3>
                          <p className="text-gray-500 text-sm">Isi formulir singkat di bawah untuk mendaftar secara online.</p>
                        </div>
                        <form onSubmit={handleDaftarSubmit} className="space-y-5">
                          <input type="text" placeholder="Nama Lengkap Siswa" required value={formDaftar.nama_murid} onChange={e => setFormDaftar({...formDaftar, nama_murid: e.target.value})} className="w-full p-4 rounded-2xl border text-sm bg-gray-50 font-bold outline-none focus:border-purple-500 transition" />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <input type="text" placeholder="Nama Wali Siswa" required value={formDaftar.nama_orang_tua} onChange={e => setFormDaftar({...formDaftar, nama_orang_tua: e.target.value})} className="w-full p-4 rounded-2xl border text-sm bg-gray-50 font-bold outline-none focus:border-purple-500 transition" />
                            <select value={formDaftar.jenjang_sekolah} onChange={e => setFormDaftar({...formDaftar, jenjang_sekolah: e.target.value})} className="w-full p-4 rounded-2xl border text-sm bg-gray-50 font-bold outline-none focus:border-purple-500 cursor-pointer">
                              <option value="TK">Jenjang: TK</option>
                              <option value="SD">Jenjang: SD</option>
                              <option value="SMP">Jenjang: SMP</option>
                            </select>
                          </div>
                          <input type="tel" placeholder="Nomor WhatsApp Aktif" required value={formDaftar.no_hp} onChange={e => setFormDaftar({...formDaftar, no_hp: e.target.value})} className="w-full p-4 rounded-2xl border text-sm bg-gray-50 font-bold outline-none focus:border-purple-500 transition" />
                          <textarea placeholder="Alamat Domisili Lengkap" required value={formDaftar.alamat} onChange={e => setFormDaftar({...formDaftar, alamat: e.target.value})} className="w-full p-4 rounded-2xl border text-sm bg-gray-50 outline-none focus:border-purple-500 transition" rows="2" />
                          <button type="submit" disabled={loading} className="w-full py-5 mt-2 bg-gradient-to-r from-[#581878] to-purple-800 hover:from-purple-900 hover:to-indigo-900 text-white text-lg font-black rounded-2xl shadow-xl transition transform hover:-translate-y-0.5">Kirim Formulir via WhatsApp 🚀</button>
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

      {/* MODAL APPROVAL & SETTING PERIODE */}
      {showApproveModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl">
            <h3 className="font-black text-2xl text-[#581878] mb-1">Setujui Siswa</h3>
            <p className="text-xs text-gray-500 mb-6 border-b pb-4">Aktivasi akun & tentukan masa aktif untuk <strong>{approveData.nama_murid}</strong>.</p>
            <form onSubmit={handleSimpanApproval} className="space-y-5">
              <div><label className="text-xs font-bold text-gray-600 mb-1.5 block">Bulan Rekap (Acuan Laporan):</label><input type="month" required value={approveData.bulan_periode} onChange={e => setApproveData({...approveData, bulan_periode: e.target.value})} className="w-full border p-4 rounded-2xl text-sm bg-gray-50 font-bold" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-gray-600 mb-1.5 block">Tanggal Mulai:</label><input type="date" required value={approveData.tanggal_mulai} onChange={e => setApproveData({...approveData, tanggal_mulai: e.target.value})} className="w-full border p-4 rounded-2xl text-xs bg-gray-50 font-bold" /></div>
                <div><label className="text-xs font-bold text-gray-600 mb-1.5 block">Selesai (+1 Bln):</label><input type="date" required value={approveData.tanggal_selesai} onChange={e => setApproveData({...approveData, tanggal_selesai: e.target.value})} className="w-full border p-4 rounded-2xl text-xs bg-gray-50 font-bold" /></div>
              </div>
              <div className="flex justify-end space-x-3 pt-4"><button type="button" onClick={() => setShowApproveModal(false)} className="px-6 py-3.5 bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition hover:bg-gray-300">Batal</button><button type="submit" className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-black shadow-lg transition">Simpan & Aktifkan</button></div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TRANSAKSI INVENTARIS */}
      {showTransaksiModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 shadow-2xl">
            <h3 className="font-black text-2xl text-gray-900 mb-1">Transaksi Stok</h3>
            <p className="text-xs text-gray-500 mb-6 border-b pb-4">Tipe: <strong className={formTransaksi.tipe_transaksi === 'Masuk' ? 'text-emerald-600' : 'text-red-600'}>{formTransaksi.tipe_transaksi}</strong> | <strong>{formTransaksi.nama_barang}</strong></p>
            <form onSubmit={handleSimpanTransaksiInventaris} className="space-y-5">
              <div><label className="text-xs font-bold block mb-1.5 text-gray-600">Jumlah Barang {formTransaksi.tipe_transaksi}:</label><input type="number" min="1" required value={formTransaksi.jumlah} onChange={e => setFormTransaksi({...formTransaksi, jumlah: parseInt(e.target.value)})} className="w-full border p-4 rounded-2xl text-lg text-center bg-gray-50 font-black" /></div>
              <div><label className="text-xs font-bold block mb-1.5 text-gray-600">Catatan (Opsional):</label><input type="text" placeholder="Cth: Penambahan dari supplier" value={formTransaksi.keterangan} onChange={e => setFormTransaksi({...formTransaksi, keterangan: e.target.value})} className="w-full border p-4 rounded-2xl text-sm bg-gray-50" /></div>
              <div className="flex justify-end space-x-3 pt-2"><button type="button" onClick={() => setShowTransaksiModal(false)} className="px-6 py-3.5 bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition hover:bg-gray-300">Batal</button><button type="submit" className={`px-6 py-3.5 text-white rounded-xl text-sm font-black shadow-lg transition ${formTransaksi.tipe_transaksi === 'Masuk' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>Simpan Stok</button></div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT PEMBAYARAN */}
      {showEditPembayaranModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 shadow-2xl">
            <h3 className="font-black text-2xl text-[#581878] mb-6">Edit Pembayaran</h3>
            <form onSubmit={handleSimpanEditPembayaran} className="space-y-4">
              <div><label className="text-xs font-bold block mb-1.5 text-gray-600">Nominal Bayar (Rp):</label><input type="number" required value={editPembayaranData.jumlah_bayar} onChange={e => setEditPembayaranData({...editPembayaranData, jumlah_bayar: e.target.value})} className="w-full border p-4 rounded-2xl text-sm font-black bg-gray-50 text-emerald-700" /></div>
              <div><label className="text-xs font-bold block mb-1.5 text-gray-600">Keterangan Item:</label><input type="text" required value={editPembayaranData.item_bayar} onChange={e => setEditPembayaranData({...editPembayaranData, item_bayar: e.target.value})} className="w-full border p-4 rounded-2xl text-sm bg-gray-50 font-bold" /></div>
              <div><label className="text-xs font-bold block mb-1.5 text-gray-600">Tanggal Rekam:</label><input type="date" required value={editPembayaranData.tanggal_pembayaran?.split('T')[0] || ''} onChange={e => setEditPembayaranData({...editPembayaranData, tanggal_pembayaran: e.target.value})} className="w-full border p-4 rounded-2xl text-sm bg-gray-50 font-bold" /></div>
              <div className="flex justify-end space-x-3 pt-4"><button type="button" onClick={() => setShowEditPembayaranModal(false)} className="px-6 py-3.5 bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition hover:bg-gray-300">Batal</button><button type="submit" className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black shadow-lg transition">Simpan Edit</button></div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL LOGIN */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-10 shadow-2xl relative">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 font-bold text-lg">✕</button>
            <div className="text-center mb-8">
              <h3 className="text-3xl font-black text-[#581878]">Login Portal</h3>
              <p className="text-xs text-gray-500 mt-2">Sistem Informasi Akademik ErHa</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <input type="email" name="email" required className="w-full px-5 py-4 border rounded-2xl text-sm bg-gray-50 font-bold outline-none focus:border-purple-500 transition" placeholder="Alamat Email" />
              <input type="password" name="password" required className="w-full px-5 py-4 border rounded-2xl text-sm bg-gray-50 font-bold outline-none focus:border-purple-500 transition" placeholder="Kata Sandi" />
              <button type="submit" disabled={loading} className="w-full py-4 mt-2 bg-gradient-to-r from-[#581878] to-purple-800 text-amber-300 font-black rounded-2xl shadow-xl transition transform hover:-translate-y-0.5">MASUK SEKARANG</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
