import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Inisialisasi Supabase Client
const supabaseUrl = 'https://izifwpviqpyxauafdlge.supabase.co';
const supabaseAnonKey = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6aWZ3cHZpcXB5eGF1YWZkbGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NDA2ODYsImV4cCI6MjEwNjUxNjY4Nn0.XpJEgQ3vpGOYmPVi-nsjrSRJI9RfR5kWTN_XsL-TCUU';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  // ==========================================
  // 1. STATE MANAGEMENT
  // ==========================================
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('guru');
  const [currentMentorProfile, setCurrentMentorProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [appReady, setAppReady] = useState(false);

  // Navigasi
  const [adminTab, setAdminTab] = useState('siswa'); 
  const [siswaSubTab, setSiswaSubTab] = useState('data'); 
  const [mentorSubTab, setMentorSubTab] = useState('daftar'); 
  const [modulSubTab, setModulSubTab] = useState('data_barang');
  const [guruTab, setGuruTab] = useState('beranda'); 

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
  const [daftarTransaksiLogistik, setDaftarTransaksiLogistik] = useState([]);

  // UI & Filter States
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showEditPasswordModal, setShowEditPasswordModal] = useState(false);
  const [expandedSiswaId, setExpandedSiswaId] = useState(null);
  const [filterBulanPresensi, setFilterBulanPresensi] = useState('');
  const [filterMentorPresensi, setFilterMentorPresensi] = useState('');
  const [searchSiswaBayar, setSearchSiswaBayar] = useState('');
  const [searchSiswaPresensi, setSearchSiswaPresensi] = useState(''); // Fitur Pencarian Presensi
  const [isDropdownPresensiOpen, setIsDropdownPresensiOpen] = useState(false);

  // Modals Data
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveData, setApproveData] = useState({ siswa_id: '', nama_murid: '', bulan_periode: '', tanggal_mulai: '', tanggal_selesai: '' });

  const [showEditSiswaModal, setShowEditSiswaModal] = useState(false);
  const [editSiswaData, setEditSiswaData] = useState({ id: '', nama_murid: '', nama_orang_tua: '', no_hp: '', alamat: '' });
  const [editPeriodeData, setEditPeriodeData] = useState({ id: null, bulan_periode: '', tanggal_mulai: '', tanggal_selesai: '' });

  const [showEditPembayaranModal, setShowEditPembayaranModal] = useState(false);
  const [editPembayaranData, setEditPembayaranData] = useState({ id: '', total_bayar: 0, tanggal_pembayaran: '', catatan: '', item_bayar: '' });

  // Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [newPasswordGuru, setNewPasswordGuru] = useState('');

  // Pendaftaran Public
  const [formDaftar, setFormDaftar] = useState({ nama_murid: '', nama_orang_tua: '', no_hp: '', alamat: '', jenjang_sekolah: 'TK' });
  const [selectedPaket, setSelectedPaket] = useState([]);

  // Pendaftaran Manual Admin
  const [formSiswaManual, setFormSiswaManual] = useState({ 
    nama_murid: '', nama_orang_tua: '', no_hp: '', alamat: '', jenjang_sekolah: 'TK',
    bulan_periode: new Date().toISOString().slice(0, 7),
    tanggal_mulai: new Date().toISOString().split('T')[0],
    tanggal_selesai: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
  });
  const [selectedPaketManual, setSelectedPaketManual] = useState([]);

  const [newMentor, setNewMentor] = useState({ nama_mentor: '', email: '', password: '', no_hp: '', alamat: '', honor_per_jam: 25000, status: 'aktif' });
  const [formPresensiMentor, setFormPresensiMentor] = useState({ mentor_id: '', tanggal: new Date().toISOString().split('T')[0], total_jam: 0, kegiatan_pembelajaran: '' });
  const [formGaji, setFormGaji] = useState({ mentor_id: '', bulan_periode: new Date().toISOString().slice(0, 7), insentif: 0, bonus_kinerja: 0, potongan: 0, catatan: '' });
  const [formModul, setFormModul] = useState({ nama_barang: '', kategori: 'Buku', stok: 0, harga_satuan: 0, deskripsi: '', thumbnail: '' });
  const [formTransaksi, setFormTransaksi] = useState({ barang_id: '', tipe_transaksi: 'masuk', jumlah: 1, keterangan: '' });
  const [formPembayaran, setFormPembayaran] = useState({ siswa_id: '', tanggal_pembayaran: new Date().toISOString().split('T')[0], items: [], total_bayar: 0, catatan: '' });
  const paymentItemOptions = ['Pendaftaran', 'Bulanan', 'Buku', 'Seragam', 'Lainnya', 'Paket Belajar Bulanan'];
  const [newPresensiSiswa, setNewPresensiSiswa] = useState({ periode_id: '', pertemuan_ke: 1, tanggal_pertemuan: new Date().toISOString().split('T')[0], status_kehadiran: 'Hadir', jurnal_materi: '' });

  // ==========================================
  // UTILS
  // ==========================================
  const formatTanggalIndo = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
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
    // BUG FIX: Hapus "siswa_id" dari dalam "siswa(...)" agar query berhasil
    const [siswa, mentor, periode, presensiS, pemb, presensiM, gaji, logistik, transaksi] = await Promise.all([
      supabase.from('siswa').select('*').order('created_at', { ascending: false }),
      supabase.from('mentor').select('*').order('created_at', { ascending: false }),
      supabase.from('periode_belajar').select('*, siswa(nama_murid, status), paket_belajar(nama_paket)').order('created_at', { ascending: false }),
      supabase.from('presensi_siswa').select('*, mentor(nama_mentor, id), periode_belajar(siswa(id, nama_murid, status), paket_belajar(nama_paket))').order('tanggal_pertemuan', { ascending: false }),
      supabase.from('pembayaran_siswa').select('*, siswa(nama_murid)').order('tanggal_pembayaran', { ascending: false }),
      supabase.from('presensi_mentor').select('*, mentor(nama_mentor)').order('tanggal', { ascending: false }),
      supabase.from('penggajian_mentor').select('*, mentor(nama_mentor, honor_per_jam)').order('created_at', { ascending: false }),
      supabase.from('inventaris_logistik').select('*').order('nama_barang', { ascending: true }),
      supabase.from('transaksi_logistik').select('*, inventaris_logistik(nama_barang, kategori)').order('created_at', { ascending: false })
    ]);

    if(siswa.data) setDaftarSiswa(siswa.data);
    if(mentor.data) setDaftarMentor(mentor.data);
    if(periode.data) setDaftarPeriode(periode.data);
    if(presensiS.data) setDaftarPresensiSiswa(presensiS.data);
    if(pemb.data) setDaftarPembayaran(pemb.data);
    if(presensiM.data) setDaftarPresensiMentor(presensiM.data);
    if(gaji.data) setDaftarPenggajian(gaji.data);
    if(logistik.data) setDaftarInventaris(logistik.data);
    if(transaksi.data) setDaftarTransaksiLogistik(transaksi.data);
  }

  // ==========================================
  // 3. HANDLERS - AUTH & UTILS
  // ==========================================
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError(''); setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    if (error) setLoginError('Login gagal: ' + error.message);
    else { setShowLoginModal(false); determineUserRoleAndProfile(data.user); setLoginEmail(''); setLoginPassword(''); }
    setLoading(false);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); setUser(null); setUserRole('guru'); setCurrentMentorProfile(null); };

  // ==========================================
  // 4. HANDLERS - ADMIN (SISWA & MENTOR)
  // ==========================================
  
  const handleTambahSiswaManual = async (e) => {
    e.preventDefault();
    if (selectedPaketManual.length === 0) return alert('Pilih minimal satu paket!');
    const { data: siswaData } = await supabase.from('siswa').insert([{ 
      nama_murid: formSiswaManual.nama_murid, 
      nama_orang_tua: formSiswaManual.nama_orang_tua, 
      no_hp: formSiswaManual.no_hp, 
      alamat: formSiswaManual.alamat, 
      jenjang_sekolah: formSiswaManual.jenjang_sekolah,
      status: 'aktif' 
    }]).select();

    if (siswaData && siswaData[0]) {
      const siswaId = siswaData[0].id;
      const periodeInserts = selectedPaketManual.map(pId => ({ 
        siswa_id: siswaId, 
        paket_id: pId, 
        bulan_periode: formSiswaManual.bulan_periode, 
        tanggal_mulai: formSiswaManual.tanggal_mulai,
        tanggal_selesai: formSiswaManual.tanggal_selesai,
        total_pertemuan: 12, 
        status_periode: 'berjalan' 
      }));
      await supabase.from('periode_belajar').insert(periodeInserts);
      alert('✅ Siswa manual dan periode tanggal berhasil ditambahkan!');
      setFormSiswaManual({ 
        nama_murid: '', nama_orang_tua: '', no_hp: '', alamat: '', jenjang_sekolah: 'TK',
        bulan_periode: new Date().toISOString().slice(0, 7),
        tanggal_mulai: new Date().toISOString().split('T')[0],
        tanggal_selesai: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
      });
      setSelectedPaketManual([]);
      fetchAllData();
    }
  };

  const openApproveModal = (siswa) => {
    setApproveData({
      siswa_id: siswa.id,
      nama_murid: siswa.nama_murid,
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
      alert('✅ Siswa berhasil di-approve dan periode diaktifkan!');
      setShowApproveModal(false);
      fetchAllData();
    } catch (err) { alert('Gagal menyetujui: ' + err.message); } finally { setLoading(false); }
  };

  const openEditSiswaModal = (siswa) => {
    setEditSiswaData({ id: siswa.id, nama_murid: siswa.nama_murid || '', nama_orang_tua: siswa.nama_orang_tua || '', no_hp: siswa.no_hp || '', alamat: siswa.alamat || '' });
    const periodeAktif = daftarPeriode.find(p => p.siswa_id === siswa.id && p.status_periode === 'berjalan');
    if (periodeAktif) {
      setEditPeriodeData({ id: periodeAktif.id, bulan_periode: periodeAktif.bulan_periode || '', tanggal_mulai: periodeAktif.tanggal_mulai || '', tanggal_selesai: periodeAktif.tanggal_selesai || '' });
    } else {
      setEditPeriodeData({ id: null, bulan_periode: '', tanggal_mulai: '', tanggal_selesai: '' });
    }
    setShowEditSiswaModal(true);
  };

  const handleSimpanEditSiswa = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await supabase.from('siswa').update({ nama_murid: editSiswaData.nama_murid, nama_orang_tua: editSiswaData.nama_orang_tua, no_hp: editSiswaData.no_hp, alamat: editSiswaData.alamat }).eq('id', editSiswaData.id);
      if (editPeriodeData.id) {
        await supabase.from('periode_belajar').update({ bulan_periode: editPeriodeData.bulan_periode, tanggal_mulai: editPeriodeData.tanggal_mulai, tanggal_selesai: editPeriodeData.tanggal_selesai }).eq('id', editPeriodeData.id);
      }
      alert('✅ Data siswa dan periode berhasil diperbarui!');
      setShowEditSiswaModal(false);
      fetchAllData();
    } catch (err) { alert('Gagal mengupdate data: ' + err.message); } finally { setLoading(false); }
  };


  const handleHapusSiswa = async (siswaId, namaSiswa) => {
    if (!window.confirm(`Hapus data siswa "${namaSiswa}" beserta seluruh riwayat periode, presensi, dan pembayarannya?`)) return;
    try {
      const periodeIds = daftarPeriode.filter(p => p.siswa_id === siswaId).map(p => p.id);
      if (periodeIds.length > 0) { await supabase.from('presensi_siswa').delete().in('periode_id', periodeIds); }
      await supabase.from('pembayaran_siswa').delete().eq('siswa_id', siswaId);
      await supabase.from('periode_belajar').delete().eq('siswa_id', siswaId);
      await supabase.from('siswa').delete().eq('id', siswaId);
      alert('✅ Data siswa dihapus secara permanen.');
      fetchAllData();
    } catch (err) { alert('Gagal menghapus siswa: ' + err.message); }
  };

  const handleRolloverPeriode = async (periodeLama) => {
    if (!window.confirm(`Lakukan Rollover untuk ${periodeLama.siswa?.nama_murid}?`)) return;
    try {
      await supabase.from('periode_belajar').update({ status_periode: 'selesai' }).eq('id', periodeLama.id);
      const nextMonth = new Date().toISOString().slice(0, 7);
      const tglMulaiBaru = new Date().toISOString().split('T')[0];
      const tglSelesaiBaru = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0];
      const { data: newP, error } = await supabase.from('periode_belajar').insert([{ 
        siswa_id: periodeLama.siswa_id, paket_id: periodeLama.paket_id, bulan_periode: nextMonth, 
        tanggal_mulai: tglMulaiBaru, tanggal_selesai: tglSelesaiBaru, total_pertemuan: 12, status_periode: 'berjalan' 
      }]).select();
      if (error) throw error;
      if (newP && newP[0]) { await supabase.from('pembayaran_siswa').insert([{ siswa_id: periodeLama.siswa_id, periode_id: newP[0].id, status_pembayaran: 'Belum Lunas', item_bayar: 'Paket Belajar Bulanan' }]); }
      alert('✅ Rollover berhasil! Periode baru telah dibuat.');
      fetchAllData();
    } catch (err) { alert('Gagal rollover: ' + err.message); }
  };

  // ==========================================
  // PEMBAYARAN HANDLERS
  // ==========================================
  const handleCatatPembayaran = async (e) => {
    e.preventDefault();
    if (formPembayaran.items.length === 0) return alert('Pilih minimal 1 item bayar!');
    if (!formPembayaran.total_bayar || formPembayaran.total_bayar <= 0) return alert('Nominal pembayaran wajib diisi!');
    const gabunganItems = formPembayaran.items.join(', ');
    await supabase.from('pembayaran_siswa').insert([{ siswa_id: formPembayaran.siswa_id, item_bayar: gabunganItems, jumlah_bayar: formPembayaran.total_bayar, tanggal_pembayaran: formPembayaran.tanggal_pembayaran, catatan: formPembayaran.catatan, status_pembayaran: 'lunas' }]);
    alert('✅ Pembayaran tercatat!');
    setFormPembayaran({ siswa_id: '', tanggal_pembayaran: new Date().toISOString().split('T')[0], items: [], total_bayar: 0, catatan: '' });
    setSearchSiswaBayar('');
    fetchAllData();
  };

  const handleHapusPembayaran = async (id) => {
    if(!window.confirm('Yakin ingin menghapus rekam pembayaran ini secara permanen?')) return;
    await supabase.from('pembayaran_siswa').delete().eq('id', id);
    alert('Rekam pembayaran dihapus.');
    fetchAllData();
  };

  const openEditPembayaran = (pb) => {
    setEditPembayaranData({
      id: pb.id,
      total_bayar: pb.jumlah_bayar,
      tanggal_pembayaran: pb.tanggal_pembayaran ? pb.tanggal_pembayaran.split('T')[0] : '',
      catatan: pb.catatan || '',
      item_bayar: pb.item_bayar || ''
    });
    setShowEditPembayaranModal(true);
  };

  const handleSimpanEditPembayaran = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await supabase.from('pembayaran_siswa').update({
        jumlah_bayar: editPembayaranData.total_bayar,
        tanggal_pembayaran: editPembayaranData.tanggal_pembayaran,
        catatan: editPembayaranData.catatan,
        item_bayar: editPembayaranData.item_bayar
      }).eq('id', editPembayaranData.id);
      alert('✅ Pembayaran berhasil diperbarui!');
      setShowEditPembayaranModal(false);
      fetchAllData();
    } catch(err) { alert(err.message); } finally { setLoading(false); }
  };

  // ==========================================
  // GURU PRESENSI HANDLERS
  // ==========================================
  const handlePilihSiswaPresensi = (periode) => {
    setSearchSiswaPresensi(`${periode.siswa?.nama_murid} (${periode.paket_belajar?.nama_paket})`);
    setIsDropdownPresensiOpen(false);
    
    // Auto-increment sesi
    const presensiSiswaIni = daftarPresensiSiswa.filter(ps => ps.periode_id === periode.id);
    const nextSesi = presensiSiswaIni.length + 1;

    setNewPresensiSiswa({ 
      ...newPresensiSiswa, 
      periode_id: periode.id, 
      pertemuan_ke: nextSesi 
    });
  };

  const handleTambahPresensiSiswa = async (e) => {
    e.preventDefault();
    if (!currentMentorProfile || !currentMentorProfile.id) return alert('Sesi Mentor Tidak Valid! Silakan login kembali.');
    if (!newPresensiSiswa.periode_id) return alert('Pilih nama murid!');
    
    await supabase.from('presensi_siswa').insert([{ 
      periode_id: newPresensiSiswa.periode_id, 
      mentor_id: currentMentorProfile.id, 
      pertemuan_ke: newPresensiSiswa.pertemuan_ke, 
      tanggal_pertemuan: newPresensiSiswa.tanggal_pertemuan, 
      is_hadir: newPresensiSiswa.status_kehadiran === 'Hadir', 
      jurnal_materi: `[${newPresensiSiswa.status_kehadiran}] ${newPresensiSiswa.jurnal_materi}` 
    }]);
    alert('✅ Presensi berhasil dicatat!');
    setNewPresensiSiswa(prev => ({ ...prev, jurnal_materi: '' }));
    setSearchSiswaPresensi(''); // Reset pencarian
    fetchAllData();
  };

  // ==========================================
  // RENDER UTAMA
  // ==========================================
  if (!appReady) return <div className="min-h-screen flex items-center justify-center font-bold text-[#581878]">Memuat Data Portal ErHa...</div>;

  return (
    <div className="min-h-screen bg-[#FFFDF0] font-sans text-gray-800">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-[#581878] shadow-lg border-b-4 border-[#F59E0B]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="Bimbel ErHa Logo" className="h-10 w-10 object-contain bg-white rounded-full p-1 shadow-sm" />
            <div>
              <h1 className="text-white font-extrabold text-lg leading-none">Bimbel ErHa</h1>
              <p className="text-[#F59E0B] font-bold text-xs">Rumah Hebat</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-xs bg-amber-400 text-purple-950 font-black px-3 py-1 rounded-full uppercase hidden md:inline-block">
                  {userRole === 'admin' ? '👑 Admin' : `Guru: ${currentMentorProfile?.nama_mentor?.split(' ')[0] || ''}`}
                </span>
                <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-1.5 px-4 rounded-full text-xs transition shadow">Keluar</button>
              </div>
            ) : (
              <button onClick={() => setShowLoginModal(true)} className="bg-purple-900 text-white font-bold py-1.5 px-4 rounded-full text-sm">🔐 Login Portal</button>
            )}
          </div>
        </div>
      </nav>

      {user ? (
        <div className="max-w-7xl mx-auto px-4 py-8">
          
          {/* ======================================================= */}
          {/* 👑 PORTAL ADMIN                                         */}
          {/* ======================================================= */}
          {userRole === 'admin' && (
            <div>
              <div className="flex overflow-x-auto border-b-2 border-purple-200 mb-6 space-x-2 pb-1">
                <button onClick={() => setAdminTab('siswa')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm whitespace-nowrap ${adminTab === 'siswa' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600'}`}>📋 SISWA</button>
                <button onClick={() => setAdminTab('mentor')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm whitespace-nowrap ${adminTab === 'mentor' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600'}`}>👩‍🏫 MENTOR</button>
                <button onClick={() => setAdminTab('pembayaran')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm whitespace-nowrap ${adminTab === 'pembayaran' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600'}`}>💵 PEMBAYARAN</button>
              </div>

              {/* ADMIN: TAB SISWA */}
              {adminTab === 'siswa' && (
                <div className="space-y-6">
                  <div className="flex space-x-2 border-b pb-3 overflow-x-auto">
                    <button onClick={() => setSiswaSubTab('persetujuan')} className={`px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap ${siswaSubTab === 'persetujuan' ? 'bg-amber-400 text-purple-950' : 'bg-white'}`}>Persetujuan Baru</button>
                    <button onClick={() => setSiswaSubTab('data')} className={`px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap ${siswaSubTab === 'data' ? 'bg-purple-900 text-white' : 'bg-white'}`}>Data Siswa & Rollover</button>
                    <button onClick={() => setSiswaSubTab('tambah_manual')} className={`px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap ${siswaSubTab === 'tambah_manual' ? 'bg-purple-900 text-white' : 'bg-white'}`}>+ Tambah Internal</button>
                    <button onClick={() => setSiswaSubTab('presensi')} className={`px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap ${siswaSubTab === 'presensi' ? 'bg-purple-900 text-white' : 'bg-white'}`}>Rekap Presensi</button>
                  </div>

                  {/* DATA SISWA */}
                  {siswaSubTab === 'data' && (
                    <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-purple-100">
                      <h3 className="text-lg font-bold text-[#581878] mb-4">Data Siswa Aktif</h3>
                      <table className="w-full text-left text-sm">
                        <thead className="bg-purple-50 text-[#581878]"><tr><th className="p-3">Siswa & Periode</th><th className="p-3 text-center">Aksi Lanjutan</th></tr></thead>
                        <tbody>
                          {daftarSiswa.filter(s => s.status === 'aktif').map(s => {
                            const isExpanded = expandedSiswaId === s.id;
                            const periodeAktif = daftarPeriode.find(p => p.siswa_id === s.id && p.status_periode === 'berjalan');
                            
                            return (
                              <React.Fragment key={s.id}>
                                <tr className="border-b hover:bg-gray-50 transition">
                                  <td className="p-3">
                                    <strong className="text-[15px]">{s.nama_murid}</strong>
                                    {periodeAktif && (
                                      <span className="block text-[11px] text-gray-500 mt-1">
                                        📅 <span className="font-bold text-gray-700">{periodeAktif.bulan_periode}</span> ({formatTanggalIndo(periodeAktif.tanggal_mulai)} - {formatTanggalIndo(periodeAktif.tanggal_selesai)})
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-3 text-center flex justify-center gap-1.5">
                                    <button onClick={() => setExpandedSiswaId(isExpanded ? null : s.id)} className={`px-2.5 py-1.5 rounded text-xs font-bold transition shadow ${isExpanded ? 'bg-[#581878] text-white' : 'bg-blue-100 text-blue-700'}`}>{isExpanded ? 'Tutup' : 'Detail'}</button>
                                    <button onClick={() => openEditSiswaModal(s)} className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-2.5 py-1.5 rounded text-xs font-bold transition shadow-sm">✏️ Edit</button>
                                    <button onClick={() => handleHapusSiswa(s.id, s.nama_murid)} className="bg-red-100 hover:bg-red-200 text-red-700 px-2.5 py-1.5 rounded text-xs font-bold transition shadow-sm">Hapus</button>
                                  </td>
                                </tr>
                                {isExpanded && (
                                  <tr className="bg-indigo-50/50 border-b-4 border-purple-200">
                                    <td colSpan="2" className="p-6">
                                      <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-100">
                                          <div className="flex justify-between items-center mb-3 border-b pb-2">
                                            <h5 className="font-bold text-[#581878]">Sesi Presensi Tercatat</h5>
                                            {periodeAktif && (
                                              <button onClick={() => handleRolloverPeriode(periodeAktif)} className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded shadow">🔄 Rollover Periode</button>
                                            )}
                                          </div>
                                          <ul className="text-xs space-y-2 max-h-48 overflow-y-auto pr-2">
                                            {daftarPresensiSiswa.filter(ps => ps.periode_belajar?.siswa_id === s.id).map(ps => (
                                              <li key={ps.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                                <span>✅ {formatTanggalIndo(ps.tanggal_pertemuan)} (Sesi {ps.pertemuan_ke})</span>
                                                <span className="text-gray-500 truncate max-w-[150px]">{ps.jurnal_materi}</span>
                                              </li>
                                            ))}
                                          </ul>
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

                  {/* REKAP PRESENSI ADMIN */}
                  {siswaSubTab === 'presensi' && (
                    <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-purple-100">
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                        <h3 className="text-lg font-bold text-[#581878]">Rekap Presensi Siswa Global</h3>
                        <div className="flex flex-wrap items-center gap-3">
                          <select value={filterMentorPresensi} onChange={e => setFilterMentorPresensi(e.target.value)} className="border px-3 py-1.5 rounded-xl text-sm outline-none bg-purple-50 text-purple-950 font-bold">
                            <option value="">-- Semua Guru --</option>
                            {daftarMentor.map(m => <option key={m.id} value={m.id}>{m.nama_mentor}</option>)}
                          </select>
                          <input type="month" value={filterBulanPresensi} onChange={e => setFilterBulanPresensi(e.target.value)} className="border px-3 py-1.5 rounded-xl text-sm outline-none" />
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                          <thead className="bg-purple-50 text-[#581878]"><tr><th className="p-3">Tanggal</th><th className="p-3">Nama Siswa</th><th className="p-3">Mentor</th><th className="p-3 text-center">Sesi</th><th className="p-3">Jurnal</th></tr></thead>
                          <tbody>
                            {daftarPresensiSiswa
                              .filter(ps => filterBulanPresensi ? ps.tanggal_pertemuan.startsWith(filterBulanPresensi) : true)
                              .filter(ps => filterMentorPresensi ? ps.mentor_id === filterMentorPresensi : true)
                              .map(ps => (
                              <tr key={ps.id} className="border-b">
                                <td className="p-3">{formatTanggalIndo(ps.tanggal_pertemuan)}</td>
                                <td className="p-3 font-bold">{ps.periode_belajar?.siswa?.nama_murid || 'Siswa N/A'}</td>
                                <td className="p-3 text-purple-900 font-bold">👩‍🏫 {ps.mentor?.nama_mentor || '-'}</td>
                                <td className="p-3 font-bold text-center bg-gray-50">{ps.pertemuan_ke}</td>
                                <td className="p-3 text-gray-600">{ps.jurnal_materi}</td>
                              </tr>
                            ))}
                            {daftarPresensiSiswa.length === 0 && (
                              <tr><td colSpan="5" className="p-6 text-center text-gray-400 italic">Data Presensi Kosong.</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  {/* END SUBTABS */}
                </div>
              )}

              {/* ADMIN: TAB PEMBAYARAN */}
              {adminTab === 'pembayaran' && (
                 <div>
                    <div className="bg-white p-6 rounded-2xl shadow-md mb-6 border-t-4 border-[#F59E0B]">
                       <h3 className="text-xl font-bold text-[#581878] mb-4">Catat Penerimaan Pembayaran</h3>
                       <form onSubmit={handleCatatPembayaran} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="border p-4 rounded-xl bg-gray-50 shadow-inner">
                               <input type="text" placeholder="Ketik nama siswa pembayar..." value={searchSiswaBayar} onChange={e => setSearchSiswaBayar(e.target.value)} className="w-full border p-3 rounded-xl mb-3 text-sm focus:border-[#581878] outline-none" />
                               <select required size="4" value={formPembayaran.siswa_id} onChange={e => setFormPembayaran({...formPembayaran, siswa_id: e.target.value})} className="w-full border p-2 rounded-xl bg-white text-sm focus:border-[#F59E0B] outline-none overflow-y-auto">
                                  {daftarSiswa.filter(s => s.status === 'aktif' && s.nama_murid?.toLowerCase().includes(searchSiswaBayar.toLowerCase())).map(s => <option key={s.id} value={s.id} className="p-2 border-b cursor-pointer hover:bg-purple-50">{s.nama_murid}</option>)}
                               </select>
                            </div>
                            <input type="date" required value={formPembayaran.tanggal_pembayaran} onChange={e => setFormPembayaran({...formPembayaran, tanggal_pembayaran: e.target.value})} className="w-full border p-3 rounded-xl" />
                          </div>
                          <div className="space-y-4">
                            <div className="border p-4 rounded-xl">
                               <div className="grid grid-cols-2 gap-3">
                                 {paymentItemOptions.map(item => (
                                   <label key={item} className="text-sm cursor-pointer flex items-center bg-gray-50 p-2 rounded hover:bg-purple-50">
                                     <input type="checkbox" className="mr-3 w-4 h-4" onChange={(e) => {
                                       if(e.target.checked) setFormPembayaran({...formPembayaran, items: [...formPembayaran.items, item]});
                                       else setFormPembayaran({...formPembayaran, items: formPembayaran.items.filter(i => i !== item)});
                                     }} /> {item}
                                   </label>
                                 ))}
                               </div>
                            </div>
                            <input type="number" placeholder="Total Uang Diterima (Rp)" required value={formPembayaran.total_bayar} onChange={e => setFormPembayaran({...formPembayaran, total_bayar: Number(e.target.value)})} className="w-full border p-4 rounded-xl font-black text-xl bg-emerald-50 text-emerald-800" />
                            <button type="submit" className="w-full bg-[#581878] text-white py-4 rounded-xl font-bold text-lg shadow-lg">Simpan Pembayaran</button>
                          </div>
                       </form>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-md border-2 border-purple-100">
                      <h4 className="text-lg font-bold text-[#581878] mb-4">Riwayat Terakhir</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                          <thead className="bg-purple-50 text-[#581878]"><tr><th className="p-3">Tanggal</th><th className="p-3">Nama Siswa</th><th className="p-3">Item Dibayar</th><th className="p-3">Nominal</th><th className="p-3 text-center">Aksi</th></tr></thead>
                          <tbody>
                            {daftarPembayaran.map(pb => (
                               <tr key={pb.id} className="border-b">
                                 <td className="p-3">{formatTanggalIndo(pb.tanggal_pembayaran)}</td>
                                 <td className="p-3 font-bold">{pb.siswa?.nama_murid}</td>
                                 <td className="p-3"><span className="text-[#581878] font-bold bg-purple-50 px-2 py-1 rounded whitespace-normal">{pb.item_bayar}</span></td>
                                 <td className="p-3 text-emerald-600 font-bold bg-emerald-50">Rp {Number(pb.jumlah_bayar).toLocaleString('id-ID')}</td>
                                 <td className="p-3 text-center space-x-2">
                                   <button onClick={() => openEditPembayaran(pb)} className="bg-amber-100 text-amber-800 px-3 py-1 rounded text-xs font-bold">Edit</button>
                                   <button onClick={() => handleHapusPembayaran(pb.id)} className="bg-red-100 text-red-700 px-3 py-1 rounded text-xs font-bold">Hapus</button>
                                 </td>
                               </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                 </div>
              )}
            </div>
          )}

          {/* ======================================================= */}
          {/* 👩‍‍🏫 PORTAL GURU (MENTOR)                                */}
          {/* ======================================================= */}
          {userRole === 'guru' && (
            <div className="space-y-6">
              <div className="flex overflow-x-auto border-b-2 border-purple-200 space-x-2 pb-1">
                <button onClick={() => setGuruTab('beranda')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm whitespace-nowrap ${guruTab === 'beranda' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600'}`}>🏠 Beranda</button>
                <button onClick={() => setGuruTab('presensi')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm whitespace-nowrap ${guruTab === 'presensi' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600'}`}>📝 Presensi Harian</button>
              </div>

              {guruTab === 'beranda' && (
                 <div className="space-y-6">
                    <div className="bg-gradient-to-r from-purple-800 to-indigo-900 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
                       <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                          <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-4xl border border-white/50 backdrop-blur">👤</div>
                          <div className="text-center md:text-left">
                            <h2 className="text-3xl font-black tracking-tight">Halo, {currentMentorProfile?.nama_mentor || 'Kakak Pengajar!'} 👋</h2>
                            <p className="text-amber-300 text-sm font-bold mt-2 border border-amber-300/30 inline-block px-3 py-1 rounded-full bg-black/20">
                              Tarif Dasar: Rp {(currentMentorProfile?.honor_per_jam || 0).toLocaleString('id-ID')} / Jam
                            </p>
                          </div>
                       </div>
                    </div>
                 </div>
              )}

              {guruTab === 'presensi' && (
                 <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-purple-200">
                    <h3 className="text-lg font-bold text-[#581878] mb-4">Catat Presensi Kelas Hari Ini</h3>
                    <form onSubmit={handleTambahPresensiSiswa} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-purple-50 p-4 rounded-xl border border-purple-100">
                        
                        {/* FITUR PENCARIAN SISWA (TIDAK DROPDOWN) */}
                        <div className="md:col-span-2 relative">
                           <input type="text" placeholder="Ketik nama siswa aktif..." value={searchSiswaPresensi} onFocus={() => setIsDropdownPresensiOpen(true)} onChange={(e) => { setSearchSiswaPresensi(e.target.value); setIsDropdownPresensiOpen(true); setNewPresensiSiswa({...newPresensiSiswa, periode_id: ''}); }} className="w-full px-4 py-3 border rounded-xl font-medium outline-none focus:ring-2 focus:ring-purple-300" />
                           {isDropdownPresensiOpen && searchSiswaPresensi && !newPresensiSiswa.periode_id && (
                              <div className="absolute z-10 w-full mt-1 bg-white border border-purple-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                                 {daftarPeriode.filter(p => p.siswa?.status === 'aktif' && p.status_periode === 'berjalan' && p.siswa?.nama_murid.toLowerCase().includes(searchSiswaPresensi.toLowerCase())).map(p => (
                                    <div key={p.id} onClick={() => handlePilihSiswaPresensi(p)} className="px-4 py-3 cursor-pointer hover:bg-purple-100 border-b last:border-b-0 text-sm">
                                       <span className="font-bold text-[#581878]">{p.siswa?.nama_murid}</span> - {p.paket_belajar?.nama_paket}
                                    </div>
                                 ))}
                              </div>
                           )}
                        </div>

                        {/* FITUR AUTO INCREMENT SESI */}
                        <div className="relative">
                           <input type="text" readOnly value={`Sesi Ke- ${newPresensiSiswa.pertemuan_ke}`} className="w-full px-4 py-3 border rounded-xl font-black text-center bg-gray-100 text-[#581878] outline-none cursor-not-allowed" />
                           <p className="absolute -bottom-5 left-0 text-[10px] text-gray-500 w-full text-center">Otomatis Dihitung</p>
                        </div>

                        <input type="date" required value={newPresensiSiswa.tanggal_pertemuan} onChange={(e) => setNewPresensiSiswa({ ...newPresensiSiswa, tanggal_pertemuan: e.target.value })} className="px-4 py-3 border rounded-xl" />
                        <select value={newPresensiSiswa.status_kehadiran} onChange={(e) => setNewPresensiSiswa({ ...newPresensiSiswa, status_kehadiran: e.target.value })} className="px-4 py-3 border rounded-xl text-sm font-bold text-purple-900 bg-white">
                          <option value="Hadir">✅ Murid Hadir</option>
                          <option value="Izin">📩 Murid Izin</option>
                        </select>
                        <input type="text" placeholder="Jurnal / Pencapaian Materi Sesi Ini" required value={newPresensiSiswa.jurnal_materi} onChange={(e) => setNewPresensiSiswa({ ...newPresensiSiswa, jurnal_materi: e.target.value })} className="px-4 py-3 border rounded-xl md:col-span-3" />
                        <button type="submit" disabled={!newPresensiSiswa.periode_id} className={`md:col-span-3 font-extrabold py-3 rounded-xl shadow transition ${newPresensiSiswa.periode_id ? 'bg-[#581878] hover:bg-purple-900 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>Simpan Presensi Kelas</button>
                    </form>

                    <h3 className="text-md font-bold text-gray-700 mb-3 border-t pt-4">Log Riwayat Mengajar Anda</h3>
                    <div className="overflow-x-auto">
                       <table className="w-full text-left text-sm whitespace-nowrap">
                          <thead className="bg-purple-50 text-[#581878]">
                            <tr><th className="p-3">Tanggal</th><th className="p-3">Nama Siswa</th><th className="p-3 text-center">Sesi</th><th className="p-3">Jurnal Materi</th></tr>
                          </thead>
                          <tbody>
                             {daftarPresensiSiswa.filter(ps => ps.mentor_id === currentMentorProfile?.id).map(ps => (
                                <tr key={ps.id} className="border-b hover:bg-gray-50">
                                  <td className="p-3 font-semibold">{formatTanggalIndo(ps.tanggal_pertemuan)}</td>
                                  <td className="p-3 font-bold text-[#581878]">{ps.periode_belajar?.siswa?.nama_murid || 'Siswa'}</td>
                                  <td className="p-3 font-black bg-gray-50 text-center">Ke-{ps.pertemuan_ke}</td>
                                  <td className="p-3 text-gray-600 max-w-[250px] whitespace-normal leading-tight">{ps.jurnal_materi}</td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* PUBLIC PAGE OMITTED FOR BREVITY (Kept Login Modal only) */
        <div className="min-h-screen flex items-center justify-center bg-purple-50">
           <button onClick={() => setShowLoginModal(true)} className="bg-purple-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg text-xl">Masuk Portal ErHa</button>
        </div>
      )}

      {/* MODAL GLOBAL AREA */}
      
      {/* Modal Edit Data Siswa */}
      {showEditSiswaModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
             <div className="bg-[#581878] p-4 text-white flex justify-between items-center shrink-0">
                <h3 className="font-bold text-lg">Edit Data & Periode Siswa</h3>
                <button onClick={() => setShowEditSiswaModal(false)} className="text-white font-bold text-xl">✕</button>
             </div>
             <div className="p-6 overflow-y-auto">
                <form id="form-edit-siswa" onSubmit={handleSimpanEditSiswa} className="space-y-6">
                   <div className="space-y-4 border-b pb-6">
                     <h4 className="text-sm font-extrabold text-[#581878] uppercase">1. Biodata Siswa</h4>
                     <input type="text" required value={editSiswaData.nama_murid} onChange={e => setEditSiswaData({...editSiswaData, nama_murid: e.target.value})} className="w-full border p-3 rounded-xl text-sm mb-3" placeholder="Nama Murid" />
                     <input type="text" required value={editSiswaData.nama_orang_tua} onChange={e => setEditSiswaData({...editSiswaData, nama_orang_tua: e.target.value})} className="w-full border p-3 rounded-xl text-sm mb-3" placeholder="Wali" />
                     <input type="text" required value={editSiswaData.no_hp} onChange={e => setEditSiswaData({...editSiswaData, no_hp: e.target.value})} className="w-full border p-3 rounded-xl text-sm" placeholder="No HP" />
                   </div>
                   <div className="space-y-4">
                     <h4 className="text-sm font-extrabold text-[#581878] uppercase">2. Periode Berjalan</h4>
                     {editPeriodeData.id && (
                       <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 space-y-4">
                         <input type="month" required value={editPeriodeData.bulan_periode} onChange={e => setEditPeriodeData({...editPeriodeData, bulan_periode: e.target.value})} className="w-full border p-3 rounded-lg text-sm bg-white" />
                         <input type="date" required value={editPeriodeData.tanggal_mulai} onChange={e => setEditPeriodeData({...editPeriodeData, tanggal_mulai: e.target.value})} className="w-full border p-3 rounded-lg text-sm bg-white" />
                         <input type="date" required value={editPeriodeData.tanggal_selesai} onChange={e => setEditPeriodeData({...editPeriodeData, tanggal_selesai: e.target.value})} className="w-full border p-3 rounded-lg text-sm bg-white" />
                       </div>
                     )}
                   </div>
                </form>
             </div>
             <div className="p-4 border-t flex justify-end space-x-3 bg-gray-50">
                <button type="button" onClick={() => setShowEditSiswaModal(false)} className="px-5 py-2.5 bg-gray-200 font-bold rounded-xl text-sm">Batal</button>
                <button type="submit" form="form-edit-siswa" className="px-6 py-2.5 bg-[#F59E0B] text-[#581878] font-black rounded-xl text-sm">Simpan Perubahan</button>
             </div>
          </div>
        </div>
      )}

      {/* Modal Edit Pembayaran */}
      {showEditPembayaranModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
             <div className="bg-[#F59E0B] p-4 text-[#581878] flex justify-between items-center">
                <h3 className="font-bold text-lg">Edit Record Pembayaran</h3>
                <button onClick={() => setShowEditPembayaranModal(false)} className="font-bold text-xl">✕</button>
             </div>
             <form onSubmit={handleSimpanEditPembayaran} className="p-6 space-y-4">
                <div>
                   <label className="text-xs font-bold text-gray-500 mb-1 block">Item Bayar</label>
                   <input type="text" required value={editPembayaranData.item_bayar} onChange={e => setEditPembayaranData({...editPembayaranData, item_bayar: e.target.value})} className="w-full border p-3 rounded-xl text-sm" />
                </div>
                <div>
                   <label className="text-xs font-bold text-gray-500 mb-1 block">Total Nominal (Rp)</label>
                   <input type="number" required value={editPembayaranData.total_bayar} onChange={e => setEditPembayaranData({...editPembayaranData, total_bayar: Number(e.target.value)})} className="w-full border p-3 rounded-xl text-sm font-bold bg-emerald-50 text-emerald-800" />
                </div>
                <div>
                   <label className="text-xs font-bold text-gray-500 mb-1 block">Tanggal</label>
                   <input type="date" required value={editPembayaranData.tanggal_pembayaran} onChange={e => setEditPembayaranData({...editPembayaranData, tanggal_pembayaran: e.target.value})} className="w-full border p-3 rounded-xl text-sm" />
                </div>
                <button type="submit" className="w-full bg-[#581878] text-white py-3 rounded-xl font-bold shadow mt-4">Simpan Perbaikan Data</button>
             </form>
          </div>
        </div>
      )}

      {/* Modal Login */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl relative p-8">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-gray-400 text-xl font-bold">✕</button>
            <h3 className="text-2xl font-black text-[#581878] mb-4 text-center tracking-tight">Portal Internal</h3>
            <form onSubmit={handleLogin} className="space-y-4">
               <input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 text-sm" placeholder="Email Login" />
               <input type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 text-sm" placeholder="Password" />
               <button type="submit" disabled={loading} className="w-full py-4 bg-[#581878] text-[#F59E0B] font-black rounded-xl shadow-lg mt-4">M A S U K</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
