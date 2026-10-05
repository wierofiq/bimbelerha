import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// ==========================================
// INISIALISASI SUPABASE CLIENT
// ==========================================
const supabaseUrl = 'https://izifwpviqpyxauafdlge.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6aWZ3cHZpcXB5eGF1YWZkbGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NDA2ODYsImV4cCI6MjEwNjUxNjY4Nn0.XpJEgQ3vpGOYmPVi-nsjrSRJI9RfR5kWTN_XsL-TCUU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  // 1. STATE MANAGEMENT GLOBAL & AUTH
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
  const [daftarTransaksiLogistik, setDaftarTransaksiLogistik] = useState([]);

  // Filter & Search
  const [filterBulanPresensiMentor, setFilterBulanPresensiMentor] = useState(new Date().toISOString().slice(0, 7));
  const [filterBulanPembayaran, setFilterBulanPembayaran] = useState(new Date().toISOString().slice(0, 7));
  const [searchSiswaPembayaranFilter, setSearchSiswaPembayaranFilter] = useState(''); 
  const [filterStatusPembayaran, setFilterStatusPembayaran] = useState('semua');
  const [filterStatusMentor, setFilterStatusMentor] = useState('aktif');
  const [currentPagePembayaran, setCurrentPagePembayaran] = useState(1);
  const itemsPerPage = 15;

  const [searchSiswaInputPembayaran, setSearchSiswaInputPembayaran] = useState('');
  const [isDropdownPembayaranOpen, setIsDropdownPembayaranOpen] = useState(false);
  const [customTanggalPresensiGuru, setCustomTanggalPresensiGuru] = useState(new Date().toISOString().split('T')[0]);

  // Web Setup
  const [pengaturanWeb, setPengaturanWeb] = useState({ id: 1, judul_utama: 'Bimbel ErHa', sub_judul: 'Rumah Hebat, Bersahabat & Berprestasi', logo_url: '', no_admin_wa: '6281915058297' });
  const [landingSections, setLandingSections] = useState([]);
  const [searchOrtuQuery, setSearchOrtuQuery] = useState('');
  const [ortuSearchResult, setOrtuSearchResult] = useState(null);

  // UI Modals
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showTambahSiswaModal, setShowTambahSiswaModal] = useState(false);
  const [showTambahMentorModal, setShowTambahMentorModal] = useState(false);
  const [showEditMentorModal, setShowEditMentorModal] = useState(false);
  const [showTambahBarangModal, setShowTambahBarangModal] = useState(false);
  const [showEditSectionModal, setShowEditSectionModal] = useState(false);
  const [showTambahSectionModal, setShowTambahSectionModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showTransaksiModal, setShowTransaksiModal] = useState(false);
  
  // Modal Siswa
  const [showDetailSiswaModal, setShowDetailSiswaModal] = useState(false);
  const [selectedDetailSiswa, setSelectedDetailSiswa] = useState(null);
  const [showEditPeriodeModal, setShowEditPeriodeModal] = useState(false);
  const [editPeriodeData, setEditPeriodeData] = useState({ periode_id: '', siswa_id: '', nama_murid: '', tanggal_mulai: '', tanggal_selesai: '' });

  // Forms
  const [formDaftar, setFormDaftar] = useState({ nama_murid: '', nama_orang_tua: '', no_hp: '', alamat: '', jenjang_sekolah: 'SD' });
  const [selectedPaket, setSelectedPaket] = useState([]);
  
  const [formSiswaManual, setFormSiswaManual] = useState({ 
    nama_murid: '', nama_orang_tua: '', no_hp: '', alamat: '', jenjang_sekolah: 'SD', paket_ids: [],
    bulan_periode: new Date().toISOString().slice(0, 7), tanggal_mulai: new Date().toISOString().split('T')[0], tanggal_selesai: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
  });

  const [approveData, setApproveData] = useState({ 
    siswa_id: '', nama_murid: '', paket_ids: [], bulan_periode: new Date().toISOString().slice(0, 7), tanggal_mulai: new Date().toISOString().split('T')[0], tanggal_selesai: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0] 
  });

  const [formTambahMentor, setFormTambahMentor] = useState({ nama_mentor: '', email: '', no_hp: '', alamat: '', password: '', honor_per_jam: 35000, akses_inventaris: false, delegasi_inventaris: false, akses_perizinan: false, delegasi_perizinan: false, akses_konten: false, delegasi_konten: false });
  const [editMentorData, setEditMentorData] = useState({ id: '', nama_mentor: '', no_hp: '', alamat: '', honor_per_jam: 35000, akses_inventaris: false, delegasi_inventaris: false, akses_perizinan: false, delegasi_perizinan: false, akses_konten: false, delegasi_konten: false });
  const [editSectionData, setEditSectionData] = useState({ id: '', section_key: '', nama_section: '', deskripsi_section: '', urutan: 0, is_aktif: true });
  const [formTambahSection, setFormTambahSection] = useState({ section_key: '', nama_section: '', deskripsi_section: '', urutan: 1, is_aktif: true });
  const [formBarangBaru, setFormBarangBaru] = useState({ nama_barang: '', kategori: 'Modul', stok: 0, harga_satuan: 0, deskripsi: '' });
  const [formGantiPassword, setFormGantiPassword] = useState({ passwordBaru: '', konfirmasiPassword: '' });
  const [formTransaksi, setFormTransaksi] = useState({ barang_id: '', nama_barang: '', tipe_transaksi: 'Masuk', jumlah: 1, keterangan: '' });
  const [formPresensiMentor, setFormPresensiMentor] = useState({ mentor_id: '', tanggal: new Date().toISOString().split('T')[0], total_jam: 0, kegiatan_pembelajaran: '' });
  const [formPembayaran, setFormPembayaran] = useState({ siswa_id: '', tanggal_pembayaran: new Date().toISOString().split('T')[0], items: [], total_bayar: 0, catatan: '' });
  
  const [searchSiswaPresensi, setSearchSiswaPresensi] = useState(''); 
  const [isDropdownPresensiOpen, setIsDropdownPresensiOpen] = useState(false);
  const [newPresensiSiswa, setNewPresensiSiswa] = useState({ periode_id: '', pertemuan_ke: 1, tanggal_pertemuan: new Date().toISOString().split('T')[0], status_kehadiran: 'Hadir', jurnal_materi: '' });

  const formatTanggalIndo = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  };
  const canMentorTransactInventory = currentMentorProfile && (currentMentorProfile.akses_inventaris || currentMentorProfile.delegasi_inventaris);

  // 2. EFFECTS & PROFILE RESOLUTION
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
      if (session?.user) determineUserRoleAndProfile(session.user);
      else { setUserRole('guru'); setCurrentMentorProfile(null); }
      fetchAllData();
    });

    fetchPaket();
    fetchPengaturanWeb();
    return () => authListener.subscription.unsubscribe();
  }, []);

  async function determineUserRoleAndProfile(authUser) {
    if (!authUser || !authUser.email) return;
    
    if (authUser.email.toLowerCase().includes('admin')) {
      setUserRole('admin');
      setCurrentMentorProfile(null);
    } else {
      setUserRole('guru');
      const { data } = await supabase
        .from('mentor')
        .select('*')
        .ilike('email', authUser.email.trim())
        .maybeSingle();
        
      if (data) setCurrentMentorProfile(data);
      else setCurrentMentorProfile(null);
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
      const [siswa, mentor, periode, presensiS, pemb, presensiM, logistik, transLog] = await Promise.all([
        supabase.from('siswa').select('*').order('created_at', { ascending: false }),
        supabase.from('mentor').select('*').order('created_at', { ascending: false }),
        supabase.from('periode_belajar').select('*, siswa(nama_murid, status, no_hp), paket_belajar(nama_paket)').order('created_at', { ascending: false }),
        supabase.from('presensi_siswa').select('*, mentor(nama_mentor), periode_belajar(siswa_id)').order('tanggal_pertemuan', { ascending: false }),
        supabase.from('pembayaran_siswa').select('*, siswa(nama_murid), periode_belajar(bulan_periode)').order('tanggal_pembayaran', { ascending: false }),
        supabase.from('presensi_mentor').select('*, mentor(nama_mentor)').order('tanggal', { ascending: false }),
        supabase.from('inventaris_logistik').select('*').order('nama_barang', { ascending: true }),
        supabase.from('transaksi_logistik').select('*, inventaris_logistik(nama_barang)').order('created_at', { ascending: false })
      ]);

      if(siswa.data) setDaftarSiswa(siswa.data);
      if(mentor.data) setDaftarMentor(mentor.data);
      if(periode.data) setDaftarPeriode(periode.data);
      if(presensiS.data) setDaftarPresensiSiswa(presensiS.data);
      if(pemb.data) setDaftarPembayaran(pemb.data);
      if(presensiM.data) setDaftarPresensiMentor(presensiM.data);
      if(logistik.data) setDaftarInventaris(logistik.data);
      if(transLog.data) setDaftarTransaksiLogistik(transLog.data);
    } catch(err) { console.error('Error fetch global:', err); }
  }

  // Fungsi Inisialisasi Section Default Jika Database Masih Kosong
  const handleInisialisasiDefaultSections = async () => {
    try {
      const defaults = [
        { section_key: 'hero', nama_section: 'Bimbingan Belajar Modern', deskripsi_section: 'Rumah Hebat, Bersahabat & Berprestasi', urutan: 1, is_aktif: true },
        { section_key: 'cek_laporan', nama_section: 'Cek Rekap Laporan & Presensi Siswa', deskripsi_section: 'Masukkan Nama Siswa atau No. HP Orang Tua yang terdaftar untuk melihat perkembangan belajar.', urutan: 2, is_aktif: true },
        { section_key: 'paket', nama_section: 'Program Belajar Unggulan', deskripsi_section: 'Pilih paket bimbingan yang tepat untuk buah hati Anda.', urutan: 3, is_aktif: true },
        { section_key: 'pendaftaran', nama_section: 'Daftar Sekarang', deskripsi_section: 'Isi formulir singkat di bawah untuk mendaftar secara online.', urutan: 4, is_aktif: true }
      ];
      await supabase.from('landing_sections').insert(defaults);
      showToast('Section default berhasil dimuat!');
      fetchPengaturanWeb();
    } catch(err) { showToast('Gagal inisialisasi: ' + err.message, 'error'); }
  };

  const handleCariLaporanOrtu = (e) => {
    e.preventDefault();
    if (!searchOrtuQuery.trim()) return showToast('Masukkan Nama Siswa atau Nomor HP.', 'error');
    const query = searchOrtuQuery.toLowerCase().trim();
    const matchedSiswa = daftarSiswa.find(s => s.nama_murid?.toLowerCase().includes(query) || (s.no_hp && s.no_hp.includes(query)));
    
    if (!matchedSiswa) { setOrtuSearchResult(null); return showToast('Data siswa/ortu tidak ditemukan.', 'error'); }

    let pAktif = daftarPeriode.find(p => p.siswa_id === matchedSiswa.id && p.status_periode === 'berjalan');
    if (!pAktif) pAktif = daftarPeriode.find(p => p.siswa_id === matchedSiswa.id);

    setOrtuSearchResult({
      siswa: matchedSiswa, periode: pAktif,
      presensi: pAktif ? daftarPresensiSiswa.filter(ps => ps.periode_id === pAktif.id) : [],
      pembayaran: daftarPembayaran.filter(pb => pb.siswa_id === matchedSiswa.id)
    });
    showToast(`Data untuk ${matchedSiswa.nama_murid} berhasil ditemukan!`);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: e.target.email.value, password: e.target.password.value });
    if (error) showToast('Login gagal: ' + error.message, 'error');
    else { setShowLoginModal(false); determineUserRoleAndProfile(data.user); showToast('Login berhasil!'); }
    setLoading(false);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); showToast('Berhasil keluar.'); };

  const handleGantiPasswordMentor = async (e) => {
    e.preventDefault();
    if (formGantiPassword.passwordBaru !== formGantiPassword.konfirmasiPassword) return showToast('Konfirmasi tidak cocok!', 'error');
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: formGantiPassword.passwordBaru });
    if (error) showToast('Gagal mengubah password: ' + error.message, 'error');
    else { showToast('Password diperbarui!'); setFormGantiPassword({ passwordBaru: '', konfirmasiPassword: '' }); }
    setLoading(false);
  };

  // HANDLERS - SISWA & PENDAFTARAN
  const handleDaftarSubmit = async (e) => {
    e.preventDefault();
    if (selectedPaket.length === 0) return showToast('Pilih minimal satu paket!', 'error');
    setLoading(true);
    try {
      const { data: siswaData } = await supabase.from('siswa').insert([{ ...formDaftar, status: 'pending' }]).select();
      if (siswaData && siswaData[0]) {
        const inserts = selectedPaket.map(pId => ({ 
          siswa_id: siswaData[0].id, paket_id: pId, total_pertemuan: 12, status_periode: 'pending', bulan_periode: null, tanggal_mulai: null, tanggal_selesai: null
        }));
        await supabase.from('periode_belajar').insert(inserts);
      }
      showToast('Pendaftaran berhasil! Mengalihkan ke WhatsApp...');
      window.open(`https://wa.me/${pengaturanWeb.no_admin_wa}?text=${encodeURIComponent(`Halo Admin Bimbel ErHa, saya ${formDaftar.nama_orang_tua} mendaftarkan anak saya ${formDaftar.nama_murid} (Jenjang ${formDaftar.jenjang_sekolah}). Mohon info selanjutnya.`)}`, '_blank');
      setFormDaftar({ nama_murid: '', nama_orang_tua: '', no_hp: '', alamat: '', jenjang_sekolah: 'SD' });
      setSelectedPaket([]);
      fetchAllData();
    } catch(err) { showToast(err.message, 'error'); } finally { setLoading(false); }
  };

  const handleTambahSiswaManual = async (e) => {
    e.preventDefault();
    if (formSiswaManual.paket_ids.length === 0) return showToast('Pilih minimal 1 paket belajar!', 'error');
    setLoading(true);
    try {
      const { data: sData, error: sErr } = await supabase.from('siswa').insert([{
        nama_murid: formSiswaManual.nama_murid, nama_orang_tua: formSiswaManual.nama_orang_tua,
        no_hp: formSiswaManual.no_hp, alamat: formSiswaManual.alamat, jenjang_sekolah: formSiswaManual.jenjang_sekolah, status: 'aktif'
      }]).select();

      if (sErr) throw sErr;
      if (sData && sData[0]) {
        const inserts = formSiswaManual.paket_ids.map(pId => ({
          siswa_id: sData[0].id, paket_id: pId, bulan_periode: formSiswaManual.bulan_periode,
          tanggal_mulai: formSiswaManual.tanggal_mulai, tanggal_selesai: formSiswaManual.tanggal_selesai,
          status_periode: 'berjalan', total_pertemuan: 12
        }));
        await supabase.from('periode_belajar').insert(inserts);
        await supabase.from('pembayaran_siswa').insert([{ siswa_id: sData[0].id, item_bayar: 'Paket Belajar Bulanan Awal', jumlah_bayar: 0, status_pembayaran: 'Belum Lunas' }]);
      }
      showToast('Siswa berhasil ditambahkan & Multi-Periode Aktif!');
      setShowTambahSiswaModal(false);
      setFormSiswaManual({ nama_murid: '', nama_orang_tua: '', no_hp: '', alamat: '', jenjang_sekolah: 'SD', paket_ids: [], bulan_periode: new Date().toISOString().slice(0, 7), tanggal_mulai: new Date().toISOString().split('T')[0], tanggal_selesai: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0] });
      fetchAllData();
    } catch(err) { showToast('Gagal tambah siswa: ' + err.message, 'error'); } finally { setLoading(false); }
  };

  const openApproveModal = (siswa) => {
    const pPendings = daftarPeriode.filter(p => p.siswa_id === siswa.id && p.status_periode === 'pending');
    setApproveData({
      siswa_id: siswa.id, nama_murid: siswa.nama_murid, 
      paket_ids: pPendings.map(p => p.paket_id),
      bulan_periode: new Date().toISOString().slice(0, 7), tanggal_mulai: new Date().toISOString().split('T')[0], 
      tanggal_selesai: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
    });
    setShowApproveModal(true);
  };

  const handleSimpanApproval = async (e) => {
    e.preventDefault();
    if (approveData.paket_ids.length === 0) return showToast('Pilih minimal 1 paket belajar!', 'error');
    setLoading(true);
    try {
      await supabase.from('siswa').update({ status: 'aktif' }).eq('id', approveData.siswa_id);
      await supabase.from('periode_belajar').delete().eq('siswa_id', approveData.siswa_id).eq('status_periode', 'pending');
      
      const inserts = approveData.paket_ids.map(pId => ({
        siswa_id: approveData.siswa_id, paket_id: pId, status_periode: 'berjalan', 
        bulan_periode: approveData.bulan_periode, tanggal_mulai: approveData.tanggal_mulai, 
        tanggal_selesai: approveData.tanggal_selesai, total_pertemuan: 12
      }));
      await supabase.from('periode_belajar').insert(inserts);
      await supabase.from('pembayaran_siswa').insert([{ siswa_id: approveData.siswa_id, item_bayar: 'Pendaftaran & Paket Awal', jumlah_bayar: 0, status_pembayaran: 'Belum Lunas' }]);
      
      showToast('Siswa berhasil disetujui & diaktifkan!');
      setShowApproveModal(false);
      fetchAllData();
    } catch (err) { showToast(err.message, 'error'); } finally { setLoading(false); }
  };

  const handleTolakSiswa = async (siswaId) => {
    if (!window.confirm('Tolak dan hapus pendaftaran siswa ini?')) return;
    try {
      await supabase.from('periode_belajar').delete().eq('siswa_id', siswaId);
      await supabase.from('siswa').delete().eq('id', siswaId);
      showToast('Pendaftaran siswa ditolak & dihapus.');
      fetchAllData();
    } catch(err) { showToast('Gagal menolak siswa: ' + err.message, 'error'); }
  };

  const handleHapusSiswa = async (siswaId) => {
    if (!window.confirm('Hapus data siswa ini beserta periode dan riwayat terkait?')) return;
    try {
      await supabase.from('periode_belajar').delete().eq('siswa_id', siswaId);
      await supabase.from('pembayaran_siswa').delete().eq('siswa_id', siswaId);
      await supabase.from('siswa').delete().eq('id', siswaId);
      showToast('Data siswa berhasil dihapus.');
      fetchAllData();
    } catch(err) { showToast('Gagal menghapus siswa: ' + err.message, 'error'); }
  };

  const openDetailSiswa = (siswa) => {
    setSelectedDetailSiswa(siswa);
    setShowDetailSiswaModal(true);
  };

  const openEditPeriodeModal = (siswa) => {
    const pAktif = daftarPeriode.find(p => p.siswa_id === siswa.id && p.status_periode === 'berjalan');
    if (!pAktif) return showToast('Siswa ini tidak memiliki periode aktif yang bisa diedit.', 'error');
    setEditPeriodeData({
      periode_id: pAktif.id,
      siswa_id: siswa.id,
      nama_murid: siswa.nama_murid,
      tanggal_mulai: pAktif.tanggal_mulai || '',
      tanggal_selesai: pAktif.tanggal_selesai || ''
    });
    setShowEditPeriodeModal(true);
  };

  const handleSimpanEditPeriode = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('periode_belajar').update({
        tanggal_mulai: editPeriodeData.tanggal_mulai,
        tanggal_selesai: editPeriodeData.tanggal_selesai,
        bulan_periode: editPeriodeData.tanggal_mulai ? editPeriodeData.tanggal_mulai.slice(0, 7) : undefined
      }).eq('id', editPeriodeData.periode_id);
      if (error) throw error;
      showToast('Masa aktif periode berhasil diperbarui!');
      setShowEditPeriodeModal(false);
      fetchAllData();
    } catch(err) { showToast('Gagal edit periode: ' + err.message, 'error'); }
  };

  const handleRolloverPeriode = async (siswa, pLama) => {
    if (!window.confirm(`Lanjutkan (Rollover) periode belajar untuk ${siswa.nama_murid}?`)) return;
    setLoading(true);
    try {
      await supabase.from('periode_belajar').update({ status_periode: 'selesai', status_rollover: 'selesai' }).eq('id', pLama.id);
      const tglMulaiBaru = pLama.tanggal_selesai ? pLama.tanggal_selesai : new Date().toISOString().split('T')[0];
      const dSelesai = new Date(tglMulaiBaru); dSelesai.setMonth(dSelesai.getMonth() + 1);
      
      await supabase.from('periode_belajar').insert([{
        siswa_id: siswa.id, paket_id: pLama.paket_id, bulan_periode: tglMulaiBaru.slice(0, 7),
        tanggal_mulai: tglMulaiBaru, tanggal_selesai: dSelesai.toISOString().split('T')[0],
        status_periode: 'berjalan', total_pertemuan: 12
      }]);
      showToast('Rollover periode berhasil dibuat!');
      fetchAllData();
    } catch(err) { showToast('Gagal rollover: ' + err.message, 'error'); } finally { setLoading(false); }
  };

  // HANDLERS - MENTOR
  const handleTambahMentorSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error: authErr } = await supabase.auth.signUp({ email: formTambahMentor.email, password: formTambahMentor.password });
      if (authErr) throw authErr;
      const { error: mErr } = await supabase.from('mentor').insert([{ ...formTambahMentor, status: 'aktif' }]);
      if (mErr) throw mErr;
      showToast('Mentor baru berhasil didaftarkan!');
      setShowTambahMentorModal(false);
      setFormTambahMentor({ nama_mentor: '', email: '', no_hp: '', alamat: '', password: '', honor_per_jam: 35000, akses_inventaris: false, delegasi_inventaris: false, akses_perizinan: false, delegasi_perizinan: false, akses_konten: false, delegasi_konten: false });
      fetchAllData();
    } catch(err) { showToast('Gagal registrasi mentor: ' + err.message, 'error'); } finally { setLoading(false); }
  };

  const openEditMentorModal = (mentor) => {
    setEditMentorData({
      id: mentor.id, nama_mentor: mentor.nama_mentor || '', no_hp: mentor.no_hp || '', alamat: mentor.alamat || '', honor_per_jam: mentor.honor_per_jam || 35000,
      akses_inventaris: mentor.akses_inventaris || false, delegasi_inventaris: mentor.delegasi_inventaris || false, akses_perizinan: mentor.akses_perizinan || false,
      delegasi_perizinan: mentor.delegasi_perizinan || false, akses_konten: mentor.akses_konten || false, delegasi_konten: mentor.delegasi_konten || false
    });
    setShowEditMentorModal(true);
  };

  const handleSimpanEditMentor = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('mentor').update({ ...editMentorData }).eq('id', editMentorData.id);
      if (error) throw error;
      showToast('Data mentor & delegasi tugas berhasil diperbarui!');
      setShowEditMentorModal(false);
      fetchAllData();
    } catch(err) { showToast('Gagal edit mentor: ' + err.message, 'error'); } finally { setLoading(false); }
  };

  const handleHapusMentor = async (id) => {
    if(!window.confirm('Yakin ingin menghapus mentor ini permanen?')) return;
    try {
      const { error } = await supabase.from('mentor').delete().eq('id', id);
      if (error) throw error;
      showToast('Mentor berhasil dihapus.');
      fetchAllData();
    } catch(err) { showToast('Gagal menghapus: ' + err.message, 'error'); }
  };

  const filteredPresensiMentor = daftarPresensiMentor.filter(pm => filterBulanPresensiMentor ? pm.tanggal?.startsWith(filterBulanPresensiMentor) : true);
  const totalJamMentorFiltered = filteredPresensiMentor.reduce((sum, pm) => sum + (Number(pm.total_jam) || 0), 0);

  const handleTambahPresensiMentor = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('presensi_mentor').insert([formPresensiMentor]);
      if (error) throw error;
      showToast('Presensi mentor tersimpan!');
      setFormPresensiMentor({ ...formPresensiMentor, total_jam: 0, kegiatan_pembelajaran: '' });
      fetchAllData();
    } catch (err) { showToast('Gagal menyimpan presensi mentor: ' + err.message, 'error'); }
  };

  // PEMBAYARAN, LOGISTIK & SETUP
  const filteredPembayaran = daftarPembayaran.filter(pb => {
    const matchBulan = filterBulanPembayaran ? pb.tanggal_pembayaran?.startsWith(filterBulanPembayaran) : true;
    const matchNama = searchSiswaPembayaranFilter ? pb.siswa?.nama_murid?.toLowerCase().includes(searchSiswaPembayaranFilter.toLowerCase()) : true;
    const matchStatus = filterStatusPembayaran !== 'semua' ? pb.status_pembayaran === filterStatusPembayaran : true;
    return matchBulan && matchNama && matchStatus;
  });

  const totalPenerimaanBulanan = filteredPembayaran.reduce((sum, pb) => sum + (Number(pb.jumlah_bayar) || 0), 0);
  const paginatedPembayaran = filteredPembayaran.slice((currentPagePembayaran - 1) * itemsPerPage, currentPagePembayaran * itemsPerPage);

  const handleCatatPembayaran = async (e) => {
    e.preventDefault();
    if (formPembayaran.items.length === 0) return showToast('Pilih minimal 1 item!', 'error');
    if (!formPembayaran.siswa_id) return showToast('Pastikan siswa dipilih dari hasil pencarian dropdown!', 'error');
    
    const gabunganItems = formPembayaran.items.join(', ');
    await supabase.from('pembayaran_siswa').insert([{ 
      siswa_id: formPembayaran.siswa_id, item_bayar: gabunganItems, jumlah_bayar: formPembayaran.total_bayar, 
      tanggal_pembayaran: formPembayaran.tanggal_pembayaran, catatan: formPembayaran.catatan, status_pembayaran: 'lunas' 
    }]);
    showToast('Pembayaran berhasil dicatat!');
    setFormPembayaran({ siswa_id: '', tanggal_pembayaran: new Date().toISOString().split('T')[0], items: [], total_bayar: 0, catatan: '' });
    setSearchSiswaInputPembayaran('');
    fetchAllData();
  };

  const handleHapusPembayaran = async (id) => {
    if(!window.confirm('Hapus rekam pembayaran?')) return;
    await supabase.from('pembayaran_siswa').delete().eq('id', id);
    showToast('Data pembayaran dihapus.');
    fetchAllData();
  };

  const handleTambahBarangBaru = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('inventaris_logistik').insert([formBarangBaru]);
      if (error) throw error;
      showToast('Barang inventaris baru ditambahkan!');
      setShowTambahBarangModal(false);
      setFormBarangBaru({ nama_barang: '', kategori: 'Modul', stok: 0, harga_satuan: 0, deskripsi: '' });
      fetchAllData();
    } catch(err) { showToast('Gagal tambah barang: ' + err.message, 'error'); } finally { setLoading(false); }
  };

  const openTransaksiModal = (barang, tipe) => {
    setFormTransaksi({ barang_id: barang.id, nama_barang: barang.nama_barang, tipe_transaksi: tipe, jumlah: 1, keterangan: '' });
    setShowTransaksiModal(true);
  };

  const handleSimpanTransaksiInventaris = async (e) => {
    e.preventDefault();
    const barang = daftarInventaris.find(b => b.id === formTransaksi.barang_id);
    if (!barang) return showToast('Barang tidak valid.', 'error');
    
    const jumlahTrans = Number(formTransaksi.jumlah) || 0;
    const newStock = formTransaksi.tipe_transaksi === 'Masuk' ? barang.stok + jumlahTrans : barang.stok - jumlahTrans;
    if (newStock < 0) return showToast('Error: Stok tidak mencukupi untuk barang keluar!', 'error');
    
    setLoading(true);
    try {
      const { error: errInv } = await supabase.from('inventaris_logistik').update({ stok: newStock }).eq('id', barang.id);
      if (errInv) throw errInv;

      const { error: errTrans } = await supabase.from('transaksi_logistik').insert([{ 
        barang_id: barang.id, tipe_transaksi: formTransaksi.tipe_transaksi, jumlah: jumlahTrans, keterangan: formTransaksi.keterangan || '-' 
      }]);
      if (errTrans) throw errTrans;

      showToast(`Transaksi ${formTransaksi.tipe_transaksi} (${jumlahTrans} Pcs) berhasil dicatat.`);
      setShowTransaksiModal(false);
      fetchAllData();
    } catch(err) { showToast('Gagal transaksi: ' + err.message, 'error'); } finally { setLoading(false); }
  };

  const handleSimpanPengaturanWeb = async (e) => {
    e.preventDefault();
    await supabase.from('pengaguran_web').upsert([pengaturanWeb]);
    showToast('Pengaturan website & logo berhasil disimpan!');
    fetchPengaturanWeb();
  };

  const openEditSectionModal = (sec) => {
    setEditSectionData({ id: sec.id, section_key: sec.section_key, nama_section: sec.nama_section, deskripsi_section: sec.deskripsi_section || '', urutan: sec.urutan || 0, is_aktif: sec.is_aktif ?? true });
    setShowEditSectionModal(true);
  };

  const handleSimpanEditSection = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('landing_sections').update({ 
        nama_section: editSectionData.nama_section, 
        deskripsi_section: editSectionData.deskripsi_section, 
        urutan: editSectionData.urutan, 
        is_aktif: editSectionData.is_aktif 
      }).eq('id', editSectionData.id);
      
      if (error) throw error;
      showToast('Section landing page diperbarui!');
      setShowEditSectionModal(false);
      await fetchPengaturanWeb();
    } catch(err) { showToast('Gagal memperbarui section: ' + err.message, 'error'); } finally { setLoading(false); }
  };

  const handleUpdateUrutanSection = async (secId, newUrutan) => {
    await supabase.from('landing_sections').update({ urutan: parseInt(newUrutan) || 1 }).eq('id', secId);
    showToast('Urutan section diperbarui!');
    fetchPengaturanWeb();
  };

  const handleToggleSection = async (secId, currentStatus) => {
    await supabase.from('landing_sections').update({ is_aktif: !currentStatus }).eq('id', secId);
    showToast('Status visibilitas section diperbarui!');
    fetchPengaturanWeb();
  };

  const handleTambahSectionBaru = async (e) => {
    e.preventDefault();
    if (!formTambahSection.section_key || !formTambahSection.nama_section) return showToast('Isi Key dan Nama Section terlebih dahulu!', 'error');
    await supabase.from('landing_sections').insert([formTambahSection]);
    showToast('Section landing page baru ditambahkan!');
    setShowTambahSectionModal(false);
    setFormTambahSection({ section_key: '', nama_section: '', deskripsi_section: '', urutan: landingSections.length + 1, is_aktif: true });
    fetchPengaturanWeb();
  };

  const handleHapusSection = async (secId) => {
    if(!window.confirm('Hapus section landing page ini?')) return;
    await supabase.from('landing_sections').delete().eq('id', secId);
    showToast('Section berhasil dihapus.');
    fetchPengaturanWeb();
  };

  const handlePilihSiswaPresensi = (periodeObj) => {
    const jumlahHadirSebelumnya = daftarPresensiSiswa.filter(ps => ps.periode_id === periodeObj.id).length;
    setNewPresensiSiswa(prev => ({ ...prev, periode_id: periodeObj.id, pertemuan_ke: jumlahHadirSebelumnya + 1 }));
    setSearchSiswaPresensi(periodeObj.siswa?.nama_murid || '');
    setIsDropdownPresensiOpen(false);
  };

  const handleTambahPresensiSiswa = async (e) => {
    e.preventDefault();
    if (!newPresensiSiswa.periode_id) return showToast('Pilih siswa aktif dari dropdown!', 'error');
    if (!currentMentorProfile?.id) return showToast('Sesi login mentor tidak valid.', 'error');
    const { error } = await supabase.from('presensi_siswa').insert([{ periode_id: newPresensiSiswa.periode_id, mentor_id: currentMentorProfile.id, pertemuan_ke: newPresensiSiswa.pertemuan_ke, tanggal_pertemuan: newPresensiSiswa.tanggal_pertemuan, is_hadir: newPresensiSiswa.status_kehadiran === 'Hadir', jurnal_materi: `[${newPresensiSiswa.status_kehadiran}] ${newPresensiSiswa.jurnal_materi}` }]);
    if (error) { showToast('Gagal presensi: ' + error.message, 'error'); return; }
    showToast('Presensi berhasil dicatat!');
    setNewPresensiSiswa(prev => ({ ...prev, jurnal_materi: '' }));
    setSearchSiswaPresensi('');
    fetchAllData();
  };

  const jamBulanIniCurrentMentor = daftarPresensiMentor.filter(pm => pm.mentor_id === currentMentorProfile?.id && pm.tanggal?.startsWith(new Date().toISOString().slice(0, 7))).reduce((sum, pm) => sum + (Number(pm.total_jam) || 0), 0);
  const estimasiPenghasilanBulanIni = jamBulanIniCurrentMentor * (Number(currentMentorProfile?.honor_per_jam) || 0);

  // ==========================================
  // RENDER UTAMA
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
            {user && (
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden text-white focus:outline-none"><span className="text-2xl">☰</span></button>
            )}
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
                    ['dashboard','siswa','mentor','pembayaran','modul','setup'].map(tab => (
                      <button key={tab} onClick={() => { setAdminTab(tab); setIsSidebarOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-sm transition capitalize ${adminTab === tab ? 'bg-purple-900 text-white shadow-lg' : 'text-gray-600 hover:bg-purple-50'}`}>
                        <span>{tab==='dashboard'?'📊':tab==='siswa'?'📋':tab==='mentor'?'👩‍🏫':tab==='pembayaran'?'💵':tab==='modul'?'📦':'⚙'}</span> 
                        <span>{tab==='setup'?'Setup & Konten':tab}</span>
                      </button>
                    ))
                  ) : (
                    ['beranda','presensi','modul','profil'].map(tab => (
                      <button key={tab} onClick={() => { setGuruTab(tab); setIsSidebarOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-sm transition capitalize ${guruTab === tab ? 'bg-purple-900 text-white shadow-lg' : 'text-gray-600 hover:bg-purple-50'}`}>
                        <span>{tab==='beranda'?'🏠':tab==='presensi'?'📝':tab==='modul'?'📦':'👤'}</span> 
                        <span>{tab==='profil'?'Profil & Keamanan':tab}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </aside>

            {/* DASHBOARD KONTEN UTAMA */}
            <div className="flex-1 overflow-x-hidden space-y-6">
              
              {/* PORTAL ADMIN */}
              {userRole === 'admin' && (
                <>
                  {adminTab === 'dashboard' && (
                    <div className="space-y-6">
                      <div><h2 className="text-2xl font-black text-gray-900">Dashboard 📊</h2><p className="text-xs text-gray-500">Ringkasan aktivitas Bimbingan Belajar ErHa.</p></div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100"><p className="text-xs font-bold text-gray-400 uppercase">Siswa Aktif</p><h4 className="text-3xl font-black text-purple-900">{daftarSiswa.filter(s => s.status === 'aktif').length}</h4></div>
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100"><p className="text-xs font-bold text-gray-400 uppercase">Mentor Aktif</p><h4 className="text-3xl font-black text-emerald-600">{daftarMentor.filter(m => m.status === 'aktif').length}</h4></div>
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100"><p className="text-xs font-bold text-gray-400 uppercase">Pending Approval</p><h4 className="text-3xl font-black text-amber-500">{daftarSiswa.filter(s => s.status === 'pending').length}</h4></div>
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100"><p className="text-xs font-bold text-gray-400 uppercase">Total Logistik</p><h4 className="text-3xl font-black text-blue-600">{daftarInventaris.length}</h4></div>
                      </div>
                    </div>
                  )}

                  {adminTab === 'siswa' && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                        <div className="flex space-x-2">
                          <button onClick={() => setSiswaSubTab('persetujuan')} className={`px-4 py-2 rounded-xl font-bold text-xs ${siswaSubTab === 'persetujuan' ? 'bg-amber-400 text-purple-950 shadow' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Persetujuan Baru ({daftarSiswa.filter(s=>s.status==='pending').length})</button>
                          <button onClick={() => setSiswaSubTab('data')} className={`px-4 py-2 rounded-xl font-bold text-xs ${siswaSubTab === 'data' ? 'bg-purple-900 text-white shadow' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Data Siswa Aktif</button>
                        </div>
                        <button onClick={() => setShowTambahSiswaModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-black shadow">+ Tambah Siswa Manual</button>
                      </div>

                      {siswaSubTab === 'persetujuan' && (
                        <div className="bg-white rounded-3xl p-6 border shadow-sm overflow-x-auto">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-purple-50">
                              <tr>
                                <th className="p-4 rounded-tl-xl">Nama Siswa</th>
                                <th className="p-4">Nama Orang Tua</th>
                                <th className="p-4">No HP</th>
                                <th className="p-4">Jenjang</th>
                                <th className="p-4">Alamat</th>
                                <th className="p-4 text-center rounded-tr-xl">Aksi</th>
                              </tr>
                            </thead>
                            <tbody>
                              {daftarSiswa.filter(s => s.status === 'pending').map(s => (
                                <tr key={s.id} className="border-t hover:bg-purple-50/50">
                                  <td className="p-4 font-bold text-gray-900">{s.nama_murid}</td>
                                  <td className="p-4">{s.nama_orang_tua || '-'}</td>
                                  <td className="p-4">{s.no_hp || '-'}</td>
                                  <td className="p-4 font-bold"><span className="bg-gray-100 px-2 py-1 rounded text-xs">{s.jenjang_sekolah}</span></td>
                                  <td className="p-4 text-xs text-gray-500 max-w-xs truncate">{s.alamat || '-'}</td>
                                  <td className="p-4 text-center space-x-2">
                                    <button onClick={() => openApproveModal(s)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow">Setujui</button>
                                    <button onClick={() => handleTolakSiswa(s.id)} className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-xl text-xs font-bold">Tolak</button>
                                  </td>
                                </tr>
                              ))}
                              {daftarSiswa.filter(s => s.status === 'pending').length === 0 && (
                                <tr><td colSpan="6" className="text-center p-8 italic text-gray-400">Tidak ada pendaftaran baru yang menunggu persetujuan.</td></tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {siswaSubTab === 'data' && (
                        <div className="bg-white rounded-3xl p-6 border shadow-sm overflow-x-auto">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-purple-50">
                              <tr>
                                <th className="p-4 rounded-tl-xl">Nama & Periode Aktif</th>
                                <th className="p-4 text-center">Progress Sesi</th>
                                <th className="p-4 text-center">Aksi (Detail / Periode / Hapus)</th>
                                <th className="p-4 text-center rounded-tr-xl">Rollover</th>
                              </tr>
                            </thead>
                            <tbody>
                              {daftarSiswa.filter(s => s.status === 'aktif').map(s => {
                                const pAktif = daftarPeriode.find(p => p.siswa_id === s.id && p.status_periode === 'berjalan');
                                const count = pAktif ? daftarPresensiSiswa.filter(ps => ps.periode_id === pAktif.id).length : 0;
                                const isLate = pAktif?.tanggal_selesai ? new Date() > new Date(pAktif.tanggal_selesai) : false;

                                return (
                                  <tr key={s.id} className="border-t hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                      <div className="font-bold text-gray-900">{s.nama_murid} <span className="text-[10px] font-black bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full uppercase">{s.jenjang_sekolah}</span></div>
                                      {pAktif ? (
                                        <div className="text-xs text-gray-500 mt-1">
                                          {formatTanggalIndo(pAktif.tanggal_mulai)} s/d {formatTanggalIndo(pAktif.tanggal_selesai)} 
                                          {isLate && <span className="ml-2 text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded">(Lewat Tempo)</span>}
                                        </div>
                                      ) : <div className="text-xs text-amber-500 font-bold mt-1">Belum ada periode aktif.</div>}
                                    </td>
                                    <td className="p-4 text-center">
                                      <span className="text-xs bg-purple-50 text-purple-900 px-3 py-1.5 rounded-xl font-bold border border-purple-200">{count}/12 Sesi</span>
                                    </td>
                                    <td className="p-4 text-center space-x-1.5">
                                      <button onClick={() => openDetailSiswa(s)} className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold">Detail</button>
                                      <button onClick={() => openEditPeriodeModal(s)} className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-1.5 rounded-lg text-xs font-bold">Edit Periode</button>
                                      <button onClick={() => handleHapusSiswa(s.id)} className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold">Hapus</button>
                                    </td>
                                    <td className="p-4 text-center">
                                      {pAktif && (count >= 12 || isLate) && (
                                        <button onClick={() => handleRolloverPeriode(s, pAktif)} className="bg-gradient-to-r from-amber-500 to-amber-600 text-purple-950 font-black px-3 py-1.5 rounded-xl text-xs shadow">🔄 Rollover</button>
                                      )}
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

                  {adminTab === 'mentor' && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                        <div className="flex space-x-2">
                          <button onClick={() => setMentorSubTab('daftar')} className={`px-4 py-2 rounded-xl font-bold text-xs ${mentorSubTab === 'daftar' ? 'bg-purple-900 text-white' : 'bg-white text-gray-600'}`}>Daftar Mentor</button>
                          <button onClick={() => setMentorSubTab('presensi')} className={`px-4 py-2 rounded-xl font-bold text-xs ${mentorSubTab === 'presensi' ? 'bg-purple-900 text-white' : 'bg-white text-gray-600'}`}>Presensi & Hitung Jam</button>
                        </div>
                        {mentorSubTab === 'daftar' && (<button onClick={() => setShowTambahMentorModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-black shadow">+ Tambah Mentor Baru</button>)}
                      </div>
                      
                      {mentorSubTab === 'daftar' && (
                        <div className="bg-white rounded-3xl p-6 shadow-sm border space-y-4">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50"><tr><th className="p-3">Mentor</th><th className="p-3">Honor/Jam</th><th className="p-3">Delegasi Tugas</th><th className="p-3 text-center">Aksi</th></tr></thead>
                            <tbody>
                              {daftarMentor.filter(m => m.status === filterStatusMentor).map(m => (
                                <tr key={m.id} className="border-t hover:bg-gray-50">
                                  <td className="p-3 font-bold">{m.nama_mentor} <span className="block text-xs font-normal text-gray-500">{m.email}</span></td>
                                  <td className="p-3 font-bold text-emerald-600">Rp {(Number(m.honor_per_jam)||0).toLocaleString('id-ID')}</td>
                                  <td className="p-3 text-xs">
                                    <div className="flex flex-wrap gap-1">
                                      {(m.akses_inventaris || m.delegasi_inventaris) && <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-black">📦 Logistik</span>}
                                      {(m.akses_perizinan || m.delegasi_perizinan) && <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-black">📩 Perizinan</span>}
                                      {(m.akses_konten || m.delegasi_konten) && <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-black">📝 Konten</span>}
                                    </div>
                                  </td>
                                  <td className="p-3 text-center space-x-2">
                                    <button onClick={() => openEditMentorModal(m)} className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-xl text-xs font-bold">Edit / Delegasi</button>
                                    <button onClick={() => handleHapusMentor(m.id)} className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-xl text-xs font-bold">Hapus</button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {mentorSubTab === 'presensi' && (
                        <div className="bg-white rounded-3xl p-6 shadow-sm border space-y-6">
                          <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                            <h3 className="font-black text-purple-900 mb-4">Catat Jam Kerja Mentor</h3>
                            <form onSubmit={handleTambahPresensiMentor} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <select required value={formPresensiMentor.mentor_id} onChange={e => setFormPresensiMentor({...formPresensiMentor, mentor_id: e.target.value})} className="border p-3 rounded-xl text-sm bg-white font-bold"><option value="">Pilih Mentor</option>{daftarMentor.filter(m=>m.status==='aktif').map(m => <option key={m.id} value={m.id}>{m.nama_mentor}</option>)}</select>
                              <input type="date" required value={formPresensiMentor.tanggal} onChange={e => setFormPresensiMentor({...formPresensiMentor, tanggal: e.target.value})} className="border p-3 rounded-xl text-sm bg-white" />
                              <input type="number" step="0.5" placeholder="Total Jam (Contoh: 1.5)" required value={formPresensiMentor.total_jam} onChange={e => setFormPresensiMentor({...formPresensiMentor, total_jam: parseFloat(e.target.value)})} className="border p-3 rounded-xl text-sm bg-white font-bold" />
                              <button type="submit" className="bg-[#581878] hover:bg-purple-900 text-white rounded-xl font-black text-sm shadow transition">Simpan Jam</button>
                            </form>
                          </div>
                          
                          <div className="pt-4 border-t border-gray-100">
                            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                              <h3 className="font-extrabold text-gray-900 text-lg">Rekapitulasi Jam Kerja</h3>
                              <input type="month" value={filterBulanPresensiMentor} onChange={e => setFilterBulanPresensiMentor(e.target.value)} className="border p-2.5 rounded-xl text-sm font-bold bg-white shadow-sm" />
                            </div>
                            <div className="bg-gradient-to-r from-[#581878] to-purple-800 text-white p-5 rounded-2xl flex justify-between items-center mb-6 shadow-md">
                              <div><span className="font-bold text-sm block">Total Seluruh Jam Mengajar</span><span className="text-xs text-purple-300">Pada bulan terpilih</span></div>
                              <span className="text-3xl font-black text-amber-400">{totalJamMentorFiltered} Jam</span>
                            </div>
                            <table className="w-full text-left text-sm">
                              <thead className="bg-gray-50"><tr><th className="p-3 rounded-tl-xl">Tanggal</th><th className="p-3">Mentor</th><th className="p-3 text-right rounded-tr-xl">Total Jam</th></tr></thead>
                              <tbody>
                                {filteredPresensiMentor.length > 0 ? filteredPresensiMentor.map(pm => (
                                  <tr key={pm.id} className="border-t hover:bg-gray-50">
                                    <td className="p-3">{formatTanggalIndo(pm.tanggal)}</td><td className="p-3 font-bold">{pm.mentor?.nama_mentor}</td><td className="p-3 text-right font-black text-purple-700">{pm.total_jam}</td>
                                  </tr>
                                )) : <tr><td colSpan="3" className="p-6 text-center text-gray-400 italic">Belum ada data presensi mentor tercatat pada bulan ini.</td></tr>}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {adminTab === 'pembayaran' && (
                    <div className="bg-white rounded-3xl p-6 shadow-sm border space-y-6">
                      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                        <h3 className="font-black text-gray-900 mb-4">Form Input Pembayaran</h3>
                        <form onSubmit={handleCatatPembayaran} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="relative">
                            <input type="text" placeholder="Cari & Pilih Siswa (Wajib)..." value={searchSiswaInputPembayaran} onFocus={() => setIsDropdownPembayaranOpen(true)} onChange={e => { setSearchSiswaInputPembayaran(e.target.value); setIsDropdownPembayaranOpen(true); setFormPembayaran(prev => ({...prev, siswa_id: ''})); }} className="border p-3.5 rounded-xl w-full text-sm bg-white font-bold outline-none focus:border-purple-600" />
                            {isDropdownPembayaranOpen && (
                              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                                {daftarSiswa.filter(s => s.nama_murid.toLowerCase().includes(searchSiswaInputPembayaran.toLowerCase())).map(s => (
                                  <div key={s.id} onClick={() => { setSearchSiswaInputPembayaran(s.nama_murid); setFormPembayaran(prev => ({...prev, siswa_id: s.id})); setIsDropdownPembayaranOpen(false); }} className="p-3 cursor-pointer hover:bg-purple-50 border-b text-sm font-bold text-gray-800">{s.nama_murid} <span className="text-xs font-normal text-gray-500">({s.jenjang_sekolah})</span></div>
                                ))}
                              </div>
                            )}
                          </div>
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

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-purple-50 p-4 rounded-2xl border border-purple-100">
                        <input type="text" placeholder="🔍 Cari nama siswa (Tabel)..." value={searchSiswaPembayaranFilter} onChange={e => setSearchSiswaPembayaranFilter(e.target.value)} className="border p-3 rounded-xl text-xs font-bold bg-white" />
                        <select value={filterStatusPembayaran} onChange={e => setFilterStatusPembayaran(e.target.value)} className="border p-3 rounded-xl text-xs font-bold bg-white"><option value="semua">Semua Status</option><option value="lunas">Lunas</option><option value="Belum Lunas">Belum Lunas</option></select>
                        <input type="month" value={filterBulanPembayaran} onChange={e => {setFilterBulanPembayaran(e.target.value); setCurrentPagePembayaran(1);}} className="border p-3 rounded-xl text-xs font-bold bg-white" />
                      </div>

                      <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                        <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Total Penerimaan Filtered</p>
                        <h2 className="text-4xl font-black text-emerald-600 mt-1">Rp {totalPenerimaanBulanan.toLocaleString('id-ID')}</h2>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-gray-100"><tr><th className="p-4 rounded-tl-xl">Tanggal</th><th className="p-4">Siswa</th><th className="p-4">Item</th><th className="p-4">Nominal</th><th className="p-4 text-center rounded-tr-xl">Aksi</th></tr></thead>
                          <tbody>
                            {paginatedPembayaran.map(pb => (
                              <tr key={pb.id} className="border-t hover:bg-gray-50">
                                <td className="p-4 font-medium">{formatTanggalIndo(pb.tanggal_pembayaran)}</td>
                                <td className="p-4 font-bold text-gray-900">{pb.siswa?.nama_murid}</td>
                                <td className="p-4">{pb.item_bayar}</td>
                                <td className="p-4 text-emerald-600 font-black">Rp {(Number(pb.jumlah_bayar)||0).toLocaleString('id-ID')}</td>
                                <td className="p-4 text-center flex justify-center gap-2">
                                  <button onClick={() => handleHapusPembayaran(pb.id)} className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold">Hapus</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {adminTab === 'modul' && (
                    <div className="space-y-6">
                      <div className="bg-white rounded-3xl p-6 shadow-sm border space-y-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-2xl font-black text-gray-900">Inventaris & Modul 📦</h3>
                            <p className="text-xs text-gray-500 mt-1">Kelola stok barang dan modul pembelajaran bimbel.</p>
                          </div>
                          <button onClick={() => setShowTambahBarangModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-black shadow transition">+ Barang Baru</button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                          {daftarInventaris.map(b => (
                            <div key={b.id} className="border border-gray-100 p-6 rounded-3xl bg-white shadow-sm flex flex-col justify-between hover:shadow-xl transition-shadow">
                              <div>
                                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full">{b.kategori}</span>
                                <h5 className="font-bold text-gray-900 mt-4 text-lg leading-tight">{b.nama_barang}</h5>
                                {b.deskripsi && <p className="text-xs text-gray-500 mt-1">{b.deskripsi}</p>}
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
                    </div>
                  )}

                  {adminTab === 'setup' && (
                    <div className="space-y-8">
                      <div className="bg-white rounded-3xl p-6 shadow-sm border space-y-4">
                        <h3 className="text-xl font-black text-[#581878]">Pengaturan Website & Branding</h3>
                        <form onSubmit={handleSimpanPengaturanWeb} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input type="text" placeholder="Judul Utama Website" required value={pengaturanWeb.judul_utama || ''} onChange={e => setPengaturanWeb({...pengaturanWeb, judul_utama: e.target.value})} className="border p-3.5 rounded-2xl text-sm font-bold bg-gray-50" />
                          <input type="text" placeholder="Sub Judul Website" required value={pengaturanWeb.sub_judul || ''} onChange={e => setPengaturanWeb({...pengaturanWeb, sub_judul: e.target.value})} className="border p-3.5 rounded-2xl text-sm bg-gray-50" />
                          <input type="text" placeholder="URL Gambar Logo (Cth: /logo.png)" value={pengaturanWeb.logo_url || ''} onChange={e => setPengaturanWeb({...pengaturanWeb, logo_url: e.target.value})} className="border p-3.5 rounded-2xl text-sm bg-gray-50" />
                          <input type="text" placeholder="No WA Admin WA (Cth: 628123...)" required value={pengaturanWeb.no_admin_wa || ''} onChange={e => setPengaturanWeb({...pengaturanWeb, no_admin_wa: e.target.value})} className="border p-3.5 rounded-2xl text-sm font-bold bg-gray-50" />
                          <button type="submit" className="md:col-span-2 bg-[#581878] text-white py-3.5 rounded-2xl font-black text-sm shadow">Simpan Pengaturan Branding</button>
                        </form>
                      </div>

                      <div className="bg-white rounded-3xl p-6 shadow-sm border space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div>
                            <h3 className="text-xl font-black text-gray-900">Pengaturan Tampilan & Urutan Landing Page</h3>
                            <p className="text-xs text-gray-500">Kelola visibilitas (tampil/sembunyi) dan urutan section publik.</p>
                          </div>
                          <div className="flex gap-2">
                            {landingSections.length === 0 && (
                              <button onClick={handleInisialisasiDefaultSections} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-black shadow">⚡ Load Default Sections</button>
                            )}
                            <button onClick={() => setShowTambahSectionModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-black shadow">+ Tambah Section Landing</button>
                          </div>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-purple-50"><tr><th className="p-3 text-center">Urutan</th><th className="p-3">Key & Nama Section</th><th className="p-3 text-center">Status Tampil</th><th className="p-3 text-center rounded-tr-xl">Aksi</th></tr></thead>
                            <tbody>
                              {[...landingSections].sort((a,b) => (a.urutan||0) - (b.urutan||0)).map(sec => (
                                <tr key={sec.id} className="border-t hover:bg-gray-50 transition-colors">
                                  <td className="p-3 text-center"><input type="number" value={sec.urutan} onChange={(e) => { const val = e.target.value; setLandingSections(prev => prev.map(s => s.id === sec.id ? { ...s, urutan: val } : s)); }} onBlur={(e) => handleUpdateUrutanSection(sec.id, e.target.value)} className="w-12 text-center border p-1 rounded-lg font-black text-purple-900 bg-purple-50" /></td>
                                  <td className="p-3">
                                    <span className="text-[10px] font-black uppercase bg-gray-100 text-gray-600 px-2 py-0.5 rounded mr-2">{sec.section_key}</span>
                                    <span className="font-bold text-gray-900">{sec.nama_section}</span>
                                    <p className="text-xs text-gray-400 truncate max-w-sm mt-0.5">{sec.deskripsi_section}</p>
                                  </td>
                                  <td className="p-3 text-center"><button onClick={() => handleToggleSection(sec.id, sec.is_aktif)} className={`px-3 py-1 rounded-full text-xs font-black transition ${sec.is_aktif ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'}`}>{sec.is_aktif ? '✓ Aktif' : '✕ Non-Aktif'}</button></td>
                                  <td className="p-3 text-center space-x-2"><button onClick={() => openEditSectionModal(sec)} className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-xl text-xs font-bold">Edit</button> <button onClick={() => handleHapusSection(sec.id)} className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-xl text-xs font-bold">Hapus</button></td>
                                </tr>
                              ))}
                              {landingSections.length === 0 && (
                                <tr><td colSpan="4" className="text-center p-8 text-gray-400 italic">Belum ada data section. Klik tombol "Load Default Sections" di atas.</td></tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* PORTAL GURU / MENTOR */}
              {userRole === 'guru' && (
                <>
                  {!currentMentorProfile ? (
                    <div className="bg-white p-8 rounded-3xl shadow-sm border text-center space-y-3">
                      <p className="text-amber-600 font-bold">⚠️ Perhatian: Email akun Anda belum terdaftar pada tabel database `mentor`.</p>
                      <p className="text-xs text-gray-500">Silakan minta Administrator untuk mendaftarkan email Anda melalui menu Manajemen Mentor.</p>
                    </div>
                  ) : (
                    <>
                      {guruTab === 'beranda' && (
                        <div className="space-y-6">
                          <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
                            <div>
                              <span className="bg-amber-400 text-purple-950 font-black text-[10px] px-3 py-1 rounded-full uppercase">Portal Pengajar</span>
                              <h2 className="text-3xl font-black mt-2">Selamat Datang, {currentMentorProfile?.nama_mentor || 'Pengajar'} 👋</h2>
                              <p className="text-purple-200 text-sm mt-1">Sistem Informasi & Administrasi ErHa</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-100 flex justify-between items-center">
                              <div>
                                <p className="text-xs font-bold text-gray-400 uppercase">Perkiraan Penghasilan Bulan Ini</p>
                                <h3 className="text-3xl font-black text-emerald-600 mt-1">Rp {estimasiPenghasilanBulanIni.toLocaleString('id-ID')}</h3>
                                <p className="text-[10px] text-gray-400 mt-1">*Tarif: Rp {(Number(currentMentorProfile?.honor_per_jam)||0).toLocaleString('id-ID')}/jam</p>
                              </div>
                              <span className="text-4xl">💰</span>
                            </div>

                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-purple-100 flex justify-between items-center">
                              <div>
                                <p className="text-xs font-bold text-gray-400 uppercase">Total Mengajar Bulan Ini</p>
                                <h3 className="text-3xl font-black text-purple-900 mt-1">{jamBulanIniCurrentMentor} Jam</h3>
                                <p className="text-[10px] text-purple-600 font-bold mt-1">Terisi otomatis dari rekap harian</p>
                              </div>
                              <span className="text-4xl">⏰</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {guruTab === 'presensi' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-5">
                            <h3 className="text-xl font-black text-[#581878]">Input Presensi Kelas</h3>
                            <form onSubmit={handleTambahPresensiSiswa} className="space-y-4">
                              <div className="relative">
                                <label className="text-xs font-bold text-gray-600 mb-1 block">Cari / Pilih Siswa Aktif:</label>
                                <input type="text" placeholder="Ketik nama siswa..." value={searchSiswaPresensi} onFocus={() => setIsDropdownPresensiOpen(true)} onChange={e => { setSearchSiswaPresensi(e.target.value); setIsDropdownPresensiOpen(true); setNewPresensiSiswa(prev => ({...prev, periode_id: ''})); }} className="w-full border p-4 rounded-2xl text-sm outline-none focus:border-purple-600 bg-gray-50 font-bold" />
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
                              <div><label className="text-xs font-bold text-gray-600 mb-1 block">Jurnal Materi (Singkat):</label><input type="text" placeholder="Contoh: Operasi Hitung Campuran" required value={newPresensiSiswa.jurnal_materi} onChange={e => setNewPresensiSiswa({...newPresensiSiswa, jurnal_materi: e.target.value})} className="border p-4 rounded-2xl w-full text-sm bg-gray-50 font-bold" /></div>
                              <button type="submit" className="w-full bg-[#581878] hover:bg-purple-900 text-white py-4 rounded-2xl font-black shadow-lg transition">Simpan Presensi Kelas</button>
                            </form>
                          </div>

                          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-5">
                            <div className="flex justify-between items-center">
                              <h3 className="text-lg font-black text-gray-900">Rekap Siswa Harian</h3>
                              <input type="date" value={customTanggalPresensiGuru} onChange={e => setCustomTanggalPresensiGuru(e.target.value)} className="border p-2 rounded-xl text-xs font-bold bg-purple-50 text-purple-900" />
                            </div>

                            <div className="space-y-3">
                              {daftarPresensiSiswa.filter(ps => ps.tanggal_pertemuan === customTanggalPresensiGuru).map(ps => (
                                <div key={ps.id} className="border p-4 rounded-2xl bg-gray-50 flex justify-between items-center">
                                  <div>
                                    <h5 className="font-bold text-sm text-gray-900">{ps.jurnal_materi}</h5>
                                    <p className="text-xs text-gray-400 mt-0.5">Sesi Ke-{ps.pertemuan_ke} | Oleh: {ps.mentor?.nama_mentor}</p>
                                  </div>
                                  <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">{ps.is_hadir ? 'Hadir' : 'Izin'}</span>
                                </div>
                              ))}
                              {daftarPresensiSiswa.filter(ps => ps.tanggal_pertemuan === customTanggalPresensiGuru).length === 0 && (
                                <p className="text-xs text-gray-400 italic text-center py-8">Belum ada presensi tercatat pada tanggal {formatTanggalIndo(customTanggalPresensiGuru)}.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {guruTab === 'modul' && (
                        <div className="bg-white rounded-3xl p-6 shadow-sm border space-y-6">
                          <div>
                            <h3 className="text-2xl font-black text-gray-900">Modul & Stok Logistik 📦</h3>
                            <p className="text-xs text-gray-500 mt-1">
                              {canMentorTransactInventory 
                                ? '✅ Anda memiliki hak akses khusus untuk mengatur transaksi stok barang.' 
                                : 'ℹ️ Anda berada dalam mode lihat stok (Hak akses transaksi belum didelegasikan).'}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {daftarInventaris.map(b => (
                              <div key={b.id} className="border p-5 rounded-3xl bg-gray-50 flex flex-col justify-between">
                                <div>
                                  <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">{b.kategori}</span>
                                  <h5 className="font-bold text-gray-900 mt-2">{b.nama_barang}</h5>
                                </div>
                                <div className="mt-4">
                                  <p className="text-lg font-black text-gray-800 text-center bg-white border p-2 rounded-xl mb-3">Stok: {b.stok}</p>
                                  {canMentorTransactInventory && (
                                    <div className="flex gap-2">
                                      <button onClick={() => openTransaksiModal(b, 'Masuk')} className="flex-1 bg-emerald-600 text-white text-xs font-bold py-2 rounded-xl">[+] IN</button>
                                      <button onClick={() => openTransaksiModal(b, 'Keluar')} className="flex-1 bg-red-600 text-white text-xs font-bold py-2 rounded-xl">[-] OUT</button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {guruTab === 'profil' && (
                        <div className="max-w-xl mx-auto space-y-6">
                          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                            <h3 className="text-xl font-black text-gray-900">Profil Mentor</h3>
                            <div className="space-y-2 text-sm">
                              <p><strong>Nama:</strong> {currentMentorProfile?.nama_mentor}</p>
                              <p><strong>Email:</strong> {currentMentorProfile?.email}</p>
                              <p><strong>No HP:</strong> {currentMentorProfile?.no_hp}</p>
                              <p><strong>Honor Per Jam:</strong> Rp {(Number(currentMentorProfile?.honor_per_jam)||0).toLocaleString('id-ID')}</p>
                            </div>
                          </div>

                          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                            <h3 className="text-xl font-black text-[#581878]">Ganti Password Akun</h3>
                            <form onSubmit={handleGantiPasswordMentor} className="space-y-4">
                              <input type="password" placeholder="Password Baru" required value={formGantiPassword.passwordBaru} onChange={e => setFormGantiPassword({...formGantiPassword, passwordBaru: e.target.value})} className="w-full border p-4 rounded-2xl text-sm font-bold bg-gray-50" />
                              <input type="password" placeholder="Konfirmasi Password Baru" required value={formGantiPassword.konfirmasiPassword} onChange={e => setFormGantiPassword({...formGantiPassword, konfirmasiPassword: e.target.value})} className="w-full border p-4 rounded-2xl text-sm font-bold bg-gray-50" />
                              <button type="submit" disabled={loading} className="w-full bg-[#581878] hover:bg-purple-900 text-white py-4 rounded-2xl font-black shadow-lg">Perbarui Password Supabase Auth</button>
                            </form>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

            </div>
          </div>
        ) : (
          /* LANDING PAGE PUBLIK (Murni berdasarkan tabel landing_sections dan is_aktif/urutan) */
          <div className="space-y-0 bg-[#FFFDF0]">
            {(() => {
              const renderSections = landingSections && landingSections.length > 0 
                ? [...landingSections].filter(sec => sec.is_aktif).sort((a, b) => (a.urutan || 0) - (b.urutan || 0)) 
                : [];

              return renderSections.map(sec => {
                const key = sec.section_key?.toLowerCase().trim();
                
                if (key === 'hero') {
                  return (
                    <section key={sec.id} className="bg-gradient-to-b from-[#581878] to-[#8022B8] text-white pt-24 pb-32 px-4 text-center">
                      <div className="max-w-4xl mx-auto space-y-6">
                        <span className="inline-block bg-amber-400 text-purple-950 text-xs font-black px-5 py-2 rounded-full uppercase shadow-lg tracking-widest">Bimbingan Belajar Modern 🚀</span>
                        <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-tight drop-shadow-md">{sec.nama_section || pengaturanWeb.judul_utama}</h2>
                        <p className="text-xl text-purple-200 font-medium whitespace-pre-wrap">{sec.deskripsi_section || pengaturanWeb.sub_judul}</p>
                      </div>
                    </section>
                  );
                }
                else if (key === 'cek_laporan') {
                  return (
                    <section key={sec.id} className="max-w-4xl mx-auto px-4 py-12 -mt-16 relative z-30">
                      <div className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-purple-200">
                        <div className="text-center mb-6">
                          <span className="bg-purple-100 text-[#581878] text-[10px] font-black px-3 py-1 rounded-full uppercase">Fitur Wali Murid 👨‍👩‍👧‍👦</span>
                          <h3 className="text-2xl font-black text-gray-900 mt-2">{sec.nama_section || 'Cek Rekap Laporan & Presensi Siswa'}</h3>
                          <p className="text-xs text-gray-500 whitespace-pre-wrap">{sec.deskripsi_section || 'Masukkan Nama Siswa atau No. HP Orang Tua yang terdaftar untuk melihat perkembangan belajar.'}</p>
                        </div>
                        <form onSubmit={handleCariLaporanOrtu} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
                          <input type="text" placeholder="Ketik Nama Siswa atau Nomor HP Wali..." value={searchOrtuQuery} onChange={e => setSearchOrtuQuery(e.target.value)} className="flex-1 p-4 rounded-2xl border border-gray-300 text-sm font-bold bg-gray-50 outline-none focus:border-purple-600 transition" />
                          <button type="submit" className="bg-[#581878] hover:bg-purple-900 text-white font-black px-6 py-4 rounded-2xl text-sm shadow-md transition">🔍 Cari Laporan</button>
                        </form>
                        
                        {ortuSearchResult && (
                          <div className="mt-8 pt-6 border-t border-gray-100 space-y-6 animate-fade-in">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-purple-50 p-5 rounded-2xl border border-purple-100">
                              <div>
                                <span className="text-[10px] font-black bg-purple-200 text-purple-900 px-2.5 py-1 rounded-full uppercase">Status: {ortuSearchResult.siswa.status}</span>
                                <h4 className="text-xl font-black text-gray-900 mt-2">{ortuSearchResult.siswa.nama_murid}</h4>
                                <p className="text-xs text-gray-500">Jenjang: {ortuSearchResult.siswa.jenjang_sekolah} | Wali: {ortuSearchResult.siswa.nama_orang_tua || '-'}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="border p-5 rounded-2xl bg-gray-50">
                                <h5 className="font-black text-[#581878] text-xs uppercase mb-3 flex items-center gap-1.5"><span>📚</span> <span>Riwayat Kehadiran ({ortuSearchResult.presensi.length} Sesi)</span></h5>
                                <div className="space-y-2 max-h-48 overflow-y-auto text-xs">
                                  {ortuSearchResult.presensi.length > 0 ? (
                                    ortuSearchResult.presensi.map(ps => (
                                      <div key={ps.id} className="bg-white p-3 rounded-xl border flex justify-between items-center">
                                        <div><p className="font-bold text-gray-900">Sesi {ps.pertemuan_ke} ({formatTanggalIndo(ps.tanggal_pertemuan)})</p><p className="text-[10px] text-gray-500">{ps.jurnal_materi}</p></div>
                                        <span className={`px-2.5 py-1 rounded-full font-black text-[10px] ${ps.is_hadir ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{ps.is_hadir ? 'Hadir' : 'Izin'}</span>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-gray-400 italic text-center py-6">Belum ada catatan presensi untuk periode ini.</p>
                                  )}
                                </div>
                              </div>
                              <div className="border p-5 rounded-2xl bg-gray-50">
                                <h5 className="font-black text-emerald-700 text-xs uppercase mb-3 flex items-center gap-1.5"><span>💳</span> <span>Riwayat & Status Pembayaran</span></h5>
                                <div className="space-y-2 max-h-48 overflow-y-auto text-xs">
                                  {ortuSearchResult.pembayaran.length > 0 ? (
                                    ortuSearchResult.pembayaran.map(pb => (
                                      <div key={pb.id} className="bg-white p-3 rounded-xl border flex justify-between items-center">
                                        <div><p className="font-bold text-gray-900">{pb.item_bayar}</p><p className="text-[10px] text-gray-400">{formatTanggalIndo(pb.tanggal_pembayaran)}</p></div>
                                        <div className="text-right"><p className="font-black text-emerald-600 text-xs">Rp {(Number(pb.jumlah_bayar)||0).toLocaleString('id-ID')}</p></div>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-gray-400 italic text-center py-6">Belum ada catatan pembayaran tercatat.</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </section>
                  );
                }
                else if (key === 'paket') {
                  return (
                    <section key={sec.id} className="max-w-6xl mx-auto px-4 py-20 relative z-20">
                      <div className="text-center mb-12">
                        <h3 className="text-4xl font-black text-[#581878] drop-shadow-sm">{sec.nama_section || 'Program Belajar Unggulan'}</h3>
                        <p className="text-gray-500 mt-2 whitespace-pre-wrap">{sec.deskripsi_section || 'Pilih paket bimbingan yang tepat untuk buah hati Anda.'}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {paketList.map(paket => (
                          <div key={paket.id} onClick={() => setSelectedPaket(prev => prev.includes(paket.id) ? prev.filter(p=>p!==paket.id) : [...prev, paket.id])} className={`cursor-pointer bg-white rounded-3xl p-8 transition-all duration-300 transform hover:-translate-y-1 ${selectedPaket.includes(paket.id) ? 'border-4 border-amber-400 shadow-2xl bg-amber-50/20' : 'border border-gray-200 shadow-lg'}`}>
                            <h4 className="text-2xl font-black text-gray-900 mb-3">{paket.nama_paket}</h4><p className="text-gray-500 text-sm leading-relaxed">{paket.deskripsi}</p>
                            {selectedPaket.includes(paket.id) && <div className="mt-6 text-xs font-black text-amber-700 bg-amber-100 px-4 py-2 rounded-full inline-block uppercase tracking-wider">✓ Paket Terpilih</div>}
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                }
                else if (key === 'pendaftaran') {
                  return (
                    <section key={sec.id} className="bg-purple-50 py-20 px-4">
                      <div className="max-w-3xl mx-auto bg-white rounded-[2.5rem] shadow-2xl p-10 md:p-14 border border-purple-100 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-amber-400 to-[#581878]"></div>
                        <div className="text-center mb-10">
                          <h3 className="text-4xl font-black text-[#581878] mb-3">{sec.nama_section || 'Daftar Sekarang'}</h3>
                          <p className="text-gray-500 text-sm whitespace-pre-wrap">{sec.deskripsi_section || 'Isi formulir singkat di bawah untuk mendaftar secara online.'}</p>
                        </div>
                        <form onSubmit={handleDaftarSubmit} className="space-y-5">
                          <input type="text" placeholder="Nama Lengkap Siswa" required value={formDaftar.nama_murid} onChange={e => setFormDaftar({...formDaftar, nama_murid: e.target.value})} className="w-full p-4 rounded-2xl border text-sm bg-gray-50 font-bold outline-none focus:border-purple-500 transition" />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <input type="text" placeholder="Nama Wali Siswa" required value={formDaftar.nama_orang_tua} onChange={e => setFormDaftar({...formDaftar, nama_orang_tua: e.target.value})} className="w-full p-4 rounded-2xl border text-sm bg-gray-50 font-bold outline-none focus:border-purple-500 transition" />
                            <select value={formDaftar.jenjang_sekolah} onChange={e => setFormDaftar({...formDaftar, jenjang_sekolah: e.target.value})} className="w-full p-4 rounded-2xl border text-sm bg-gray-50 font-bold outline-none focus:border-purple-500 cursor-pointer"><option value="TK">Jenjang: TK</option><option value="SD">Jenjang: SD</option><option value="SMP">Jenjang: SMP</option></select>
                          </div>
                          <input type="tel" placeholder="Nomor WhatsApp Aktif" required value={formDaftar.no_hp} onChange={e => setFormDaftar({...formDaftar, no_hp: e.target.value})} className="w-full p-4 rounded-2xl border text-sm bg-gray-50 font-bold outline-none focus:border-purple-500 transition" />
                          <textarea placeholder="Alamat Domisili Lengkap" required value={formDaftar.alamat} onChange={e => setFormDaftar({...formDaftar, alamat: e.target.value})} className="w-full p-4 rounded-2xl border text-sm bg-gray-50 outline-none focus:border-purple-500 transition" rows="2" />
                          <button type="submit" disabled={loading} className="w-full py-5 mt-2 bg-gradient-to-r from-[#581878] to-purple-800 hover:from-purple-900 hover:to-indigo-900 text-white text-lg font-black rounded-2xl shadow-xl transition transform hover:-translate-y-0.5">Kirim Formulir via WhatsApp 🚀</button>
                        </form>
                      </div>
                    </section>
                  );
                }
                else {
                  // RENDER DINAMIS SECTION CUSTOM DENGAN FORMATTING TEKS
                  return (
                    <section key={sec.id} className="py-20 px-4 bg-white text-center border-b border-gray-100">
                      <div className="max-w-4xl mx-auto space-y-4">
                        <h3 className="text-4xl font-black text-[#581878] drop-shadow-sm">{sec.nama_section}</h3>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-base text-left md:text-center px-4">{sec.deskripsi_section}</p>
                      </div>
                    </section>
                  );
                }
              });
            })()}
          </div>
        )}
      </main>

      {/* MODAL APPROVAL MULTI-PAKET */}
      {showApproveModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl">
            <h3 className="font-black text-2xl text-[#581878] mb-1">Setujui Siswa</h3>
            <p className="text-xs text-gray-500 mb-6 border-b pb-4">Aktivasi akun & tentukan masa aktif untuk <strong>{approveData.nama_murid}</strong>.</p>
            <form onSubmit={handleSimpanApproval} className="space-y-5">
              <div className="border p-4 rounded-2xl bg-gray-50 space-y-2">
                <p className="text-xs font-bold text-gray-600 uppercase mb-2">Paket Belajar (Bisa > 1):</p>
                {paketList.map(p => (
                  <label key={p.id} className="text-xs flex items-center cursor-pointer font-bold">
                    <input type="checkbox" className="mr-2 accent-purple-700 w-4 h-4" checked={approveData.paket_ids.includes(p.id)} onChange={e => { const checked = e.target.checked; setApproveData(prev => ({ ...prev, paket_ids: checked ? [...prev.paket_ids, p.id] : prev.paket_ids.filter(id => id !== p.id) })); }} />
                    {p.nama_paket}
                  </label>
                ))}
              </div>
              <div><label className="text-xs font-bold text-gray-600 mb-1.5 block">Bulan Rekap (Acuan Laporan):</label><input type="month" required value={approveData.bulan_periode} onChange={e => setApproveData({...approveData, bulan_periode: e.target.value})} className="w-full border p-4 rounded-2xl text-sm bg-gray-50 font-bold" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-gray-600 mb-1.5 block">Tanggal Mulai:</label><input type="date" required value={approveData.tanggal_mulai} onChange={e => setApproveData({...approveData, tanggal_mulai: e.target.value})} className="w-full border p-4 rounded-2xl text-xs bg-gray-50 font-bold" /></div>
                <div><label className="text-xs font-bold text-gray-600 mb-1.5 block">Selesai (+1 Bln):</label><input type="date" required value={approveData.tanggal_selesai} onChange={e => setApproveData({...approveData, tanggal_selesai: e.target.value})} className="w-full border p-4 rounded-2xl text-xs bg-gray-50 font-bold" /></div>
              </div>
              <div className="flex justify-end space-x-3 pt-4"><button type="button" onClick={() => setShowApproveModal(false)} className="px-6 py-3.5 bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition">Batal</button><button type="submit" className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-black shadow-lg">Simpan & Aktifkan</button></div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETAIL SISWA */}
      {showDetailSiswaModal && selectedDetailSiswa && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl space-y-4">
            <h3 className="font-black text-2xl text-[#581878] border-b pb-3">Detail Data Siswa</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Nama Lengkap:</strong> {selectedDetailSiswa.nama_murid}</p>
              <p><strong>Nama Orang Tua / Wali:</strong> {selectedDetailSiswa.nama_orang_tua || '-'}</p>
              <p><strong>Nomor WhatsApp:</strong> {selectedDetailSiswa.no_hp || '-'}</p>
              <p><strong>Jenjang Sekolah:</strong> {selectedDetailSiswa.jenjang_sekolah}</p>
              <p><strong>Alamat Domisili:</strong> {selectedDetailSiswa.alamat || '-'}</p>
              <p><strong>Status Akun:</strong> <span className="uppercase font-bold text-emerald-600">{selectedDetailSiswa.status}</span></p>
            </div>
            <div className="flex justify-end pt-4"><button onClick={() => setShowDetailSiswaModal(false)} className="px-6 py-2.5 bg-[#581878] text-white rounded-xl text-xs font-black shadow">Tutup</button></div>
          </div>
        </div>
      )}

      {/* MODAL EDIT PERIODE SISWA */}
      {showEditPeriodeModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 shadow-2xl">
            <h3 className="font-black text-xl text-[#581878] mb-2">Edit Masa Aktif Periode</h3>
            <p className="text-xs text-gray-500 mb-4">Siswa: <strong>{editPeriodeData.nama_murid}</strong></p>
            <form onSubmit={handleSimpanEditPeriode} className="space-y-4">
              <div><label className="text-xs font-bold block mb-1">Tanggal Mulai:</label><input type="date" required value={editPeriodeData.tanggal_mulai} onChange={e => setEditPeriodeData({...editPeriodeData, tanggal_mulai: e.target.value})} className="w-full border p-3 rounded-xl text-sm font-bold bg-gray-50" /></div>
              <div><label className="text-xs font-bold block mb-1">Tanggal Selesai (Batas Tempo):</label><input type="date" required value={editPeriodeData.tanggal_selesai} onChange={e => setEditPeriodeData({...editPeriodeData, tanggal_selesai: e.target.value})} className="w-full border p-3 rounded-xl text-sm font-bold bg-gray-50" /></div>
              <div className="flex justify-end space-x-2 pt-4"><button type="button" onClick={() => setShowEditPeriodeModal(false)} className="px-4 py-2.5 bg-gray-200 rounded-xl text-xs font-bold">Batal</button><button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black shadow">Simpan</button></div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH SISWA MANUAL */}
      {showTambahSiswaModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-black text-2xl text-[#581878] mb-4">Tambah Siswa Manual</h3>
            <form onSubmit={handleTambahSiswaManual} className="space-y-4">
              <input type="text" placeholder="Nama Siswa" required value={formSiswaManual.nama_murid} onChange={e => setFormSiswaManual({...formSiswaManual, nama_murid: e.target.value})} className="w-full border p-3.5 rounded-2xl text-sm bg-gray-50 font-bold" />
              <input type="text" placeholder="Nama Orang Tua" required value={formSiswaManual.nama_orang_tua} onChange={e => setFormSiswaManual({...formSiswaManual, nama_orang_tua: e.target.value})} className="w-full border p-3.5 rounded-2xl text-sm bg-gray-50" />
              <div className="grid grid-cols-2 gap-3">
                <input type="tel" placeholder="No HP/WA" required value={formSiswaManual.no_hp} onChange={e => setFormSiswaManual({...formSiswaManual, no_hp: e.target.value})} className="border p-3.5 rounded-2xl text-sm bg-gray-50" />
                <select value={formSiswaManual.jenjang_sekolah} onChange={e => setFormSiswaManual({...formSiswaManual, jenjang_sekolah: e.target.value})} className="border p-3.5 rounded-2xl text-sm bg-gray-50 font-bold"><option value="TK">TK</option><option value="SD">SD</option><option value="SMP">SMP</option></select>
              </div>
              <textarea placeholder="Alamat" required value={formSiswaManual.alamat} onChange={e => setFormSiswaManual({...formSiswaManual, alamat: e.target.value})} className="w-full border p-3.5 rounded-2xl text-sm bg-gray-50" rows="2" />
              
              <div className="border p-4 rounded-2xl bg-gray-50 space-y-2">
                <p className="text-xs font-bold text-gray-600 uppercase mb-2">Pilih Paket Belajar (Bisa Lebih dari 1):</p>
                {paketList.map(p => (
                  <label key={p.id} className="text-xs flex items-center cursor-pointer font-bold">
                    <input type="checkbox" className="mr-2 accent-purple-700 w-4 h-4" checked={formSiswaManual.paket_ids.includes(p.id)} onChange={e => { const checked = e.target.checked; setFormSiswaManual(prev => ({ ...prev, paket_ids: checked ? [...prev.paket_ids, p.id] : prev.paket_ids.filter(id => id !== p.id) })); }} />
                    {p.nama_paket}
                  </label>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[10px] font-bold block mb-1">Mulai:</label><input type="date" required value={formSiswaManual.tanggal_mulai} onChange={e => setFormSiswaManual({...formSiswaManual, tanggal_mulai: e.target.value})} className="w-full border p-3 rounded-xl text-xs" /></div>
                <div><label className="text-[10px] font-bold block mb-1">Selesai:</label><input type="date" required value={formSiswaManual.tanggal_selesai} onChange={e => setFormSiswaManual({...formSiswaManual, tanggal_selesai: e.target.value})} className="w-full border p-3 rounded-xl text-xs" /></div>
              </div>
              <div className="flex justify-end space-x-3 pt-4"><button type="button" onClick={() => setShowTambahSiswaModal(false)} className="px-5 py-3 bg-gray-200 rounded-xl text-xs font-bold">Batal</button><button type="submit" className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-xs font-black shadow">Simpan Siswa</button></div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT MENTOR */}
      {showEditMentorModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-black text-2xl text-[#581878] mb-4">Edit Profile & Delegasi Mentor</h3>
            <form onSubmit={handleSimpanEditMentor} className="space-y-4">
              <div><label className="text-xs font-bold text-gray-600 mb-1 block">Nama Mentor:</label><input type="text" required value={editMentorData.nama_mentor} onChange={e => setEditMentorData({...editMentorData, nama_mentor: e.target.value})} className="w-full border p-3.5 rounded-2xl text-sm bg-gray-50 font-bold" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-bold text-gray-600 mb-1 block">No HP:</label><input type="tel" required value={editMentorData.no_hp} onChange={e => setEditMentorData({...editMentorData, no_hp: e.target.value})} className="w-full border p-3.5 rounded-2xl text-sm bg-gray-50" /></div>
                <div><label className="text-xs font-bold text-gray-600 mb-1 block">Honor / Jam (Rp):</label><input type="number" required value={editMentorData.honor_per_jam} onChange={e => setEditMentorData({...editMentorData, honor_per_jam: Number(e.target.value)})} className="w-full border p-3.5 rounded-2xl text-sm bg-gray-50 font-bold text-emerald-700" /></div>
              </div>
              <div><label className="text-xs font-bold text-gray-600 mb-1 block">Alamat:</label><textarea value={editMentorData.alamat} onChange={e => setEditMentorData({...editMentorData, alamat: e.target.value})} className="w-full border p-3 rounded-2xl text-sm bg-gray-50" rows="2" /></div>
              
              <div className="border p-4 rounded-2xl bg-purple-50 space-y-2">
                <p className="text-xs font-black text-purple-900 uppercase mb-2">Pendelegasian Tugas Tambahan:</p>
                <label className="text-xs flex items-center cursor-pointer font-bold"><input type="checkbox" checked={editMentorData.delegasi_inventaris} onChange={e => setEditMentorData({...editMentorData, delegasi_inventaris: e.target.checked, akses_inventaris: e.target.checked})} className="mr-2 accent-purple-700 w-4 h-4" /> Akses Transaksi Logistik (Modul)</label>
                <label className="text-xs flex items-center cursor-pointer font-bold"><input type="checkbox" checked={editMentorData.delegasi_perizinan} onChange={e => setEditMentorData({...editMentorData, delegasi_perizinan: e.target.checked, akses_perizinan: e.target.checked})} className="mr-2 accent-purple-700 w-4 h-4" /> Manajemen Perizinan</label>
                <label className="text-xs flex items-center cursor-pointer font-bold"><input type="checkbox" checked={editMentorData.delegasi_konten} onChange={e => setEditMentorData({...editMentorData, delegasi_konten: e.target.checked, akses_konten: e.target.checked})} className="mr-2 accent-purple-700 w-4 h-4" /> Manajemen Konten Publik</label>
              </div>

              <div className="flex justify-end space-x-3 pt-4"><button type="button" onClick={() => setShowEditMentorModal(false)} className="px-5 py-3 bg-gray-200 rounded-xl text-xs font-bold">Batal</button><button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-black shadow">Simpan</button></div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT SECTION LANDING PAGE DENGAN FORMATTING TEKS */}
      {showEditSectionModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-lg p-8 shadow-2xl">
            <h3 className="font-black text-xl text-[#581878] mb-2">Edit Konten & Section Landing</h3>
            <p className="text-xs text-gray-500 mb-4">Gunakan tombol Enter untuk membuat paragraf atau baris baru.</p>
            
            <form onSubmit={handleSimpanEditSection} className="space-y-4">
              <div>
                <label className="text-xs font-bold block mb-1">Key Section:</label>
                <input type="text" readOnly value={editSectionData.section_key} className="w-full border p-3 rounded-2xl text-xs bg-gray-200 font-bold text-gray-600" />
              </div>
              <div>
                <label className="text-xs font-bold block mb-1">Judul Section Utama:</label>
                <input type="text" required value={editSectionData.nama_section} onChange={e => setEditSectionData({...editSectionData, nama_section: e.target.value})} className="w-full border p-3.5 rounded-2xl text-sm font-bold bg-gray-50 outline-none focus:border-purple-600" />
              </div>
              <div>
                <label className="text-xs font-bold block mb-1">Isi Konten / Deskripsi (Mendukung Multi-paragraf & Enter):</label>
                <textarea 
                  value={editSectionData.deskripsi_section} 
                  onChange={e => setEditSectionData({...editSectionData, deskripsi_section: e.target.value})} 
                  className="w-full border p-3.5 rounded-2xl text-sm bg-gray-50 outline-none focus:border-purple-600 font-sans" 
                  rows="6" 
                  placeholder="Tulis deskripsi atau isi konten di sini..."
                ></textarea>
                <p className="text-[10px] text-gray-400 mt-1">💡 Tips: Teks yang dienter ke bawah akan otomatis tampil terformat rapi di halaman utama publik.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold block mb-1">Urutan Tampilan:</label>
                  <input type="number" required value={editSectionData.urutan} onChange={e => setEditSectionData({...editSectionData, urutan: parseInt(e.target.value)})} className="w-full border p-3 rounded-2xl text-sm font-bold bg-gray-50" />
                </div>
                <div className="flex items-center pt-5">
                  <label className="text-xs flex items-center font-bold cursor-pointer">
                    <input type="checkbox" checked={editSectionData.is_aktif} onChange={e => setEditSectionData({...editSectionData, is_aktif: e.target.checked})} className="mr-2 accent-purple-700 w-4 h-4" /> 
                    Tampilkan Section
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button type="button" onClick={() => setShowEditSectionModal(false)} className="px-5 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl text-xs font-bold">Batal</button>
                <button type="submit" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH SECTION BARU */}
      {showTambahSectionModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 shadow-2xl">
            <h3 className="font-black text-xl text-[#581878] mb-4">Tambah Section Landing Baru</h3>
            <form onSubmit={handleTambahSectionBaru} className="space-y-4">
              <div><label className="text-xs font-bold block mb-1">Key Identifikasi:</label><input type="text" required placeholder="cek_laporan / pendaftaran / custom_key" value={formTambahSection.section_key} onChange={e => setFormTambahSection({...formTambahSection, section_key: e.target.value})} className="w-full border p-3.5 rounded-2xl text-sm font-bold bg-gray-50" /></div>
              <div><label className="text-xs font-bold block mb-1">Judul Section:</label><input type="text" required value={formTambahSection.nama_section} onChange={e => setFormTambahSection({...formTambahSection, nama_section: e.target.value})} className="w-full border p-3.5 rounded-2xl text-sm font-bold bg-gray-50" /></div>
              <div><label className="text-xs font-bold block mb-1">Teks / Isian Konten:</label><textarea value={formTambahSection.deskripsi_section} onChange={e => setFormTambahSection({...formTambahSection, deskripsi_section: e.target.value})} className="w-full border p-3.5 rounded-2xl text-sm bg-gray-50" rows="3"></textarea></div>
              <div><label className="text-xs font-bold block mb-1">Urutan Ke-:</label><input type="number" required value={formTambahSection.urutan} onChange={e => setFormTambahSection({...formTambahSection, urutan: parseInt(e.target.value)})} className="w-full border p-3.5 rounded-2xl text-sm font-bold bg-gray-50" /></div>
              <div className="flex justify-end space-x-3 pt-4"><button type="button" onClick={() => setShowTambahSectionModal(false)} className="px-5 py-3 bg-gray-200 rounded-xl text-xs font-bold">Batal</button><button type="submit" className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-xs font-black shadow">Simpan</button></div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH BARANG INVENTARIS */}
      {showTambahBarangModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl">
            <h3 className="font-black text-2xl text-[#581878] mb-4">Tambah Barang Inventaris Baru</h3>
            <form onSubmit={handleTambahBarangBaru} className="space-y-4">
              <input type="text" placeholder="Nama Barang / Modul" required value={formBarangBaru.nama_barang} onChange={e => setFormBarangBaru({...formBarangBaru, nama_barang: e.target.value})} className="w-full border p-3.5 rounded-2xl text-sm bg-gray-50 font-bold" />
              <select value={formBarangBaru.kategori} onChange={e => setFormBarangBaru({...formBarangBaru, kategori: e.target.value})} className="w-full border p-3.5 rounded-2xl text-sm bg-gray-50 font-bold">
                <option value="Modul">Kategori: Modul</option>
                <option value="Buku">Kategori: Buku</option>
                <option value="Alat Tulis">Kategori: Alat Tulis</option>
                <option value="Lainnya">Kategori: Lainnya</option>
              </select>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-bold block mb-1">Stok Awal:</label><input type="number" required value={formBarangBaru.stok} onChange={e => setFormBarangBaru({...formBarangBaru, stok: parseInt(e.target.value)})} className="w-full border p-3 rounded-2xl text-sm bg-gray-50 font-bold" /></div>
                <div><label className="text-xs font-bold block mb-1">Harga Satuan (Rp):</label><input type="number" value={formBarangBaru.harga_satuan} onChange={e => setFormBarangBaru({...formBarangBaru, harga_satuan: Number(e.target.value)})} className="w-full border p-3 rounded-2xl text-sm bg-gray-50 font-bold" /></div>
              </div>
              <textarea placeholder="Deskripsi atau catatan barang..." value={formBarangBaru.deskripsi} onChange={e => setFormBarangBaru({...formBarangBaru, deskripsi: e.target.value})} className="w-full border p-3.5 rounded-2xl text-sm bg-gray-50" rows="2"></textarea>
              <div className="flex justify-end space-x-3 pt-4"><button type="button" onClick={() => setShowTambahBarangModal(false)} className="px-5 py-3 bg-gray-200 rounded-xl text-xs font-bold">Batal</button><button type="submit" className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-xs font-black shadow">Simpan Barang</button></div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TRANSAKSI INVENTARIS (MASUK / KELUAR) */}
      {showTransaksiModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 shadow-2xl">
            <h3 className="font-black text-xl text-[#581878] mb-2">Transaksi Stok Barang</h3>
            <p className="text-xs text-gray-500 mb-4">Barang: <strong>{formTransaksi.nama_barang}</strong> ({formTransaksi.tipe_transaksi})</p>
            <form onSubmit={handleSimpanTransaksiInventaris} className="space-y-4">
              <div>
                <label className="text-xs font-bold block mb-1">Jumlah Pcs ({formTransaksi.tipe_transaksi}):</label>
                <input type="number" min="1" required value={formTransaksi.jumlah} onChange={e => setFormTransaksi({...formTransaksi, jumlah: parseInt(e.target.value)})} className="w-full border p-3.5 rounded-2xl text-sm font-bold bg-gray-50" />
              </div>
              <div>
                <label className="text-xs font-bold block mb-1">Keterangan / Keperluan:</label>
                <input type="text" placeholder="Contoh: Penambahan cetakan baru" value={formTransaksi.keterangan} onChange={e => setFormTransaksi({...formTransaksi, keterangan: e.target.value})} className="w-full border p-3.5 rounded-2xl text-sm bg-gray-50" />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={() => setShowTransaksiModal(false)} className="px-4 py-2.5 bg-gray-200 rounded-xl text-xs font-bold">Batal</button>
                <button type="submit" className="px-5 py-2.5 bg-[#581878] text-white rounded-xl text-xs font-black shadow">Simpan Transaksi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLoginModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-10 shadow-2xl relative">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-6 right-6 text-gray-400 font-bold">✕</button>
            <div className="text-center mb-8"><h3 className="text-3xl font-black text-[#581878]">Login Portal</h3></div>
            <form onSubmit={handleLogin} className="space-y-4">
              <input type="email" name="email" required className="w-full px-5 py-4 border rounded-2xl text-sm bg-gray-50 font-bold" placeholder="Alamat Email" />
              <input type="password" name="password" required className="w-full px-5 py-4 border rounded-2xl text-sm bg-gray-50 font-bold" placeholder="Kata Sandi" />
              <button type="submit" disabled={loading} className="w-full py-4 mt-2 bg-gradient-to-r from-[#581878] to-purple-800 text-amber-300 font-black rounded-2xl">MASUK SEKARANG</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
