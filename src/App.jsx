import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Inisialisasi Supabase Client
const supabaseUrl = 'https://izifwpviqpyxauafdlge.supabase.co';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
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

  // Toast Notifikasi Mengapung
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  // Navigasi & Sidebar Toggle (Mobile)
  const [adminTab, setAdminTab] = useState('dashboard'); 
  const [siswaSubTab, setSiswaSubTab] = useState('data'); 
  const [mentorSubTab, setMentorSubTab] = useState('daftar'); 
  const [guruTab, setGuruTab] = useState('beranda'); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Master Data & Konfigurasi Web (Starter Default Aman)
  const [paketList, setPaketList] = useState([
    { id: 1, nama_paket: 'Paket Regular SD', deskripsi: 'Bimbingan belajar intensif kurikulum merdeka untuk tingkat Sekolah Dasar (12 Pertemuan).' },
    { id: 2, nama_paket: 'Paket Intensif SMP', deskripsi: 'Pendampingan khusus persiapan ujian, PR, dan pemahaman konsep sains & matematika.' }
  ]);
  const [daftarSiswa, setDaftarSiswa] = useState([]);
  const [daftarMentor, setDaftarMentor] = useState([]);
  const [daftarPeriode, setDaftarPeriode] = useState([]);
  const [daftarPresensiSiswa, setDaftarPresensiSiswa] = useState([]);
  const [daftarPembayaran, setDaftarPembayaran] = useState([]);
  const [daftarPresensiMentor, setDaftarPresensiMentor] = useState([]);
  const [daftarInventaris, setDaftarInventaris] = useState([]);
  const [daftarKonten, setDaftarKonten] = useState([]);
  
  // Konfigurasi Web & Section Landing Page
  const [pengaturanWeb, setPengaturanWeb] = useState({ 
    judul_utama: 'Rumah Belajar Ceria Bersama Bimbel ErHa', 
    sub_judul: 'Bimbingan Belajar Ceria, Bersahabat & Berprestasi', 
    logo_url: '', 
    no_admin_wa: '6281915058297' 
  });
  
  const [landingSections, setLandingSections] = useState([
    { id: 1, section_key: 'hero', nama_section: 'Banner Utama (Hero Section)', urutan: 1, is_aktif: true },
    { id: 2, section_key: 'tracking', nama_section: 'Portal Cek Orang Tua', urutan: 2, is_aktif: true },
    { id: 3, section_key: 'paket', nama_section: 'Pilihan Paket Belajar', urutan: 3, is_aktif: true },
    { id: 4, section_key: 'konten', nama_section: 'Artikel & Video Edukasi', urutan: 4, is_aktif: true },
    { id: 5, section_key: 'pendaftaran', nama_section: 'Formulir Pendaftaran Siswa', urutan: 5, is_aktif: true }
  ]);

  // UI States & Modals
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showTambahSiswaModal, setShowTambahSiswaModal] = useState(false);
  const [showTambahMentorModal, setShowTambahMentorModal] = useState(false);
  const [showTambahBarangModal, setShowTambahBarangModal] = useState(false);
  
  const [filterBulanPresensi, setFilterBulanPresensi] = useState('');

  // Fitur Tracking Publik (Orang Tua)
  const [trackingQuery, setTrackingQuery] = useState('');
  const [trackingResult, setTrackingResult] = useState(null);
  const [trackingError, setTrackingError] = useState('');

  // Fitur Presensi Guru
  const [searchSiswaPresensi, setSearchSiswaPresensi] = useState(''); 
  const [isDropdownPresensiOpen, setIsDropdownPresensiOpen] = useState(false);

  // Modals Data Admin
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveData, setApproveData] = useState({ siswa_id: '', nama_murid: '', bulan_periode: '', tanggal_mulai: '', tanggal_selesai: '' });

  const [showEditSiswaModal, setShowEditSiswaModal] = useState(false);
  const [editSiswaData, setEditSiswaData] = useState({ id: '', nama_murid: '', nama_orang_tua: '', no_hp: '', alamat: '' });
  const [editPeriodeData, setEditPeriodeData] = useState({ id: null, bulan_periode: '', tanggal_mulai: '', tanggal_selesai: '' });

  // Form States Auth & Pendaftaran
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [formDaftar, setFormDaftar] = useState({ nama_murid: '', nama_orang_tua: '', no_hp: '', alamat: '', jenjang_sekolah: 'TK' });
  const [selectedPaket, setSelectedPaket] = useState([]);

  // Form Admin
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
  const [formPembayaran, setFormPembayaran] = useState({ siswa_id: '', tanggal_pembayaran: new Date().toISOString().split('T')[0], items: [], total_bayar: 0, catatan: '' });
  const paymentItemOptions = ['Pendaftaran', 'Bulanan', 'Buku', 'Seragam', 'Lainnya', 'Paket Belajar Bulanan'];
  
  // State Form Presensi Siswa (Guru)
  const [newPresensiSiswa, setNewPresensiSiswa] = useState({ periode_id: '', pertemuan_ke: 1, tanggal_pertemuan: new Date().toISOString().split('T')[0], status_kehadiran: 'Hadir', jurnal_materi: '' });
  
  const [formKonten, setFormKonten] = useState({ judul: '', tipe: 'artikel', isi: '', video_url: '' });

  // ==========================================
  // UTILS
  // ==========================================
  const formatTanggalIndo = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  // ==========================================
  // EFFECTS & DATA FETCHING
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
    try {
      const { data } = await supabase.from('paket_belajar').select('*').order('created_at', { ascending: true });
      if (data && data.length > 0) setPaketList(data);
    } catch(err) { /* Gunakan default starter */ }
  }

  async function fetchPengaturanWeb() {
    try {
      const { data: settingData } = await supabase.from('pengaguran_web').select('*').eq('id', 1).single();
      if (settingData) setPengaturanWeb(settingData);

      const { data: secData } = await supabase.from('landing_sections').select('*').order('urutan', { ascending: true });
      if (secData && secData.length > 0) {
        setLandingSections(secData);
      }
    } catch(err) { /* Gunakan default */ }
  }

  async function fetchAllData() {
    try {
      const [siswa, mentor, periode, presensiS, pemb, presensiM, gaji, logistik, konten] = await Promise.all([
        supabase.from('siswa').select('*').order('created_at', { ascending: false }),
        supabase.from('mentor').select('*').order('created_at', { ascending: false }),
        supabase.from('periode_belajar').select('*, siswa(nama_murid, status, no_hp), paket_belajar(nama_paket)').order('created_at', { ascending: false }),
        supabase.from('presensi_siswa').select('*, mentor(nama_mentor, id), periode_belajar(siswa(id, nama_murid, status), paket_belajar(nama_paket))').order('tanggal_pertemuan', { ascending: false }),
        supabase.from('pembayaran_siswa').select('*, siswa(nama_murid)').order('tanggal_pembayaran', { ascending: false }),
        supabase.from('presensi_mentor').select('*, mentor(nama_mentor)').order('tanggal', { ascending: false }),
        supabase.from('penggajian_mentor').select('*, mentor(nama_mentor, honor_per_jam)').order('created_at', { ascending: false }),
        supabase.from('inventaris_logistik').select('*').order('nama_barang', { ascending: true }),
        supabase.from('konten_publik').select('*, mentor(nama_mentor)').order('created_at', { ascending: false })
      ]);

      if(siswa.data) setDaftarSiswa(siswa.data);
      if(mentor.data) setDaftarMentor(mentor.data);
      if(periode.data) setDaftarPeriode(periode.data);
      if(presensiS.data) setDaftarPresensiSiswa(presensiS.data);
      if(pemb.data) setDaftarPembayaran(pemb.data);
      if(presensiM.data) setDaftarPresensiMentor(presensiM.data);
      if(gaji.data) setDaftarPenggajian(gaji.data);
      if(logistik.data) setDaftarInventaris(logistik.data);
      if(konten.data) setDaftarKonten(konten.data);
    } catch(err) {
      console.error('Error fetching data:', err);
    }
  }

  // ==========================================
  // HANDLERS - AUTH
  // ==========================================
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError(''); setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    if (error) setLoginError('Login gagal: ' + error.message);
    else { setShowLoginModal(false); determineUserRoleAndProfile(data.user); setLoginEmail(''); setLoginPassword(''); showToast('Login berhasil!'); }
    setLoading(false);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); setUser(null); setUserRole('guru'); setCurrentMentorProfile(null); showToast('Berhasil keluar portal.'); };

  // ==========================================
  // HANDLERS - ADMIN & WEB SETUP
  // ==========================================
  const handleSimpanPengaturanWeb = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await supabase.from('pengaguran_web').update({
        judul_utama: pengaturanWeb.judul_utama,
        sub_judul: pengaturanWeb.sub_judul,
        logo_url: pengaturanWeb.logo_url,
        no_admin_wa: pengaturanWeb.no_admin_wa
      }).eq('id', 1);
      showToast('Pengaturan web berhasil diperbarui!');
      fetchPengaturanWeb();
    } catch(err) { showToast(err.message, 'error'); } finally { setLoading(false); }
  };

  const handleUpdateUrutanSection = async (sectionId, newUrutan, newStatus) => {
    try {
      await supabase.from('landing_sections').update({ urutan: newUrutan, is_aktif: newStatus }).eq('id', sectionId);
      setLandingSections(landingSections.map(sec => sec.id === sectionId ? { ...sec, urutan: newUrutan, is_aktif: newStatus } : sec));
      showToast('Urutan section diperbarui.');
    } catch(err) {
      showToast('Gagal memperbarui urutan: ' + err.message, 'error');
    }
  };

  const handleTambahSiswaManual = async (e) => {
    e.preventDefault();
    if (selectedPaketManual.length === 0) return showToast('Pilih minimal satu paket!', 'error');
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
      showToast('Siswa berhasil ditambahkan!');
      setShowTambahSiswaModal(false);
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
      showToast('Siswa berhasil disetujui & diaktifkan!');
      setShowApproveModal(false);
      fetchAllData();
    } catch (err) { showToast(err.message, 'error'); } finally { setLoading(false); }
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
      showToast('Data siswa diperbarui!');
      setShowEditSiswaModal(false);
      fetchAllData();
    } catch (err) { showToast(err.message, 'error'); } finally { setLoading(false); }
  };

  const handleHapusSiswa = async (siswaId, namaSiswa) => {
    if (!window.confirm(`Hapus data siswa "${namaSiswa}"?`)) return;
    try {
      const periodeIds = daftarPeriode.filter(p => p.siswa_id === siswaId).map(p => p.id);
      if (periodeIds.length > 0) { await supabase.from('presensi_siswa').delete().in('periode_id', periodeIds); }
      await supabase.from('pembayaran_siswa').delete().eq('siswa_id', siswaId);
      await supabase.from('periode_belajar').delete().eq('siswa_id', siswaId);
      await supabase.from('siswa').delete().eq('id', siswaId);
      showToast('Siswa berhasil dihapus.');
      fetchAllData();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleRolloverPeriode = async (periodeLama) => {
    if (!window.confirm(`Lakukan Rollover untuk ${periodeLama.siswa?.nama_murid}?`)) return;
    try {
      await supabase.from('periode_belajar').update({ status_periode: 'selesai' }).eq('id', periodeLama.id);
      const nextMonth = new Date().toISOString().slice(0, 7);
      const tglMulaiBaru = new Date().toISOString().split('T')[0];
      const tglSelesaiBaru = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0];
      const { data: newP } = await supabase.from('periode_belajar').insert([{ 
        siswa_id: periodeLama.siswa_id, paket_id: periodeLama.paket_id, bulan_periode: nextMonth, 
        tanggal_mulai: tglMulaiBaru, tanggal_selesai: tglSelesaiBaru, total_pertemuan: 12, status_periode: 'berjalan' 
      }]).select();
      if (newP && newP[0]) { await supabase.from('pembayaran_siswa').insert([{ siswa_id: periodeLama.siswa_id, periode_id: newP[0].id, status_pembayaran: 'Belum Lunas', item_bayar: 'Paket Belajar Bulanan' }]); }
      showToast('Rollover periode berhasil!');
      fetchAllData();
    } catch (err) { showToast(err.message, 'error'); }
  };

  // MENTOR & DELEGASI
  const handleTambahMentor = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await supabase.auth.signUp({ email: newMentor.email, password: newMentor.password, options: { data: { role: 'guru' } } });
      await supabase.from('mentor').insert([newMentor]);
      showToast('Mentor berhasil ditambahkan!');
      setShowTambahMentorModal(false);
      setNewMentor({ nama_mentor: '', email: '', password: '', no_hp: '', alamat: '', honor_per_jam: 25000, status: 'aktif' });
      fetchAllData();
    } catch (err) { showToast(err.message, 'error'); } finally { setLoading(false); }
  };

  const handleToggleDelegasiMentor = async (mentorId, fieldKey, currentValue) => {
    await supabase.from('mentor').update({ [fieldKey]: !currentValue }).eq('id', mentorId);
    showToast('Hak akses delegasi diperbarui.');
    fetchAllData();
  };

  const handleTambahPresensiMentor = async (e) => {
    e.preventDefault();
    await supabase.from('presensi_mentor').insert([formPresensiMentor]);
    showToast('Presensi mentor tersimpan!');
    setFormPresensiMentor({ ...formPresensiMentor, total_jam: 0, kegiatan_pembelajaran: '' });
    fetchAllData();
  };

  const handleSimpanGaji = async (e) => {
    e.preventDefault();
    const mentorRec = daftarMentor.find(m => m.id === formGaji.mentor_id);
    const totalJam = daftarPresensiMentor.filter(pm => pm.mentor_id === formGaji.mentor_id && pm.tanggal?.startsWith(formGaji.bulan_periode)).reduce((acc, curr) => acc + (Number(curr.total_jam) || 0), 0);
    await supabase.from('penggajian_mentor').insert([{ ...formGaji, total_jam_mengajar: totalJam, honor_per_jam: mentorRec?.honor_per_jam || 25000, status_pembayaran: 'draft' }]);
    showToast('Slip gaji berhasil digenerate!');
    fetchAllData();
  };

  // PEMBAYARAN
  const handleCatatPembayaran = async (e) => {
    e.preventDefault();
    if (formPembayaran.items.length === 0) return showToast('Pilih minimal 1 item!', 'error');
    const gabunganItems = formPembayaran.items.join(', ');
    await supabase.from('pembayaran_siswa').insert([{ siswa_id: formPembayaran.siswa_id, item_bayar: gabunganItems, jumlah_bayar: formPembayaran.total_bayar, tanggal_pembayaran: formPembayaran.tanggal_pembayaran, catatan: formPembayaran.catatan, status_pembayaran: 'lunas' }]);
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

  // INVENTARIS
  const handleTambahModul = async (e) => {
    e.preventDefault();
    await supabase.from('inventaris_logistik').insert([formModul]);
    showToast('Barang inventaris ditambahkan!');
    setShowTambahBarangModal(false);
    setFormModul({ nama_barang: '', kategori: 'Buku', stok: 0, harga_satuan: 0, deskripsi: '', thumbnail: '' });
    fetchAllData();
  };

  // KONTEN
  const handleSimpanKonten = async (e) => {
    e.preventDefault();
    await supabase.from('konten_publik').insert([{ mentor_id: currentMentorProfile?.id || null, ...formKonten }]);
    showToast('Konten berhasil dipublikasikan!');
    setFormKonten({ judul: '', tipe: 'artikel', isi: '', video_url: '' });
    fetchAllData();
  };

  const handleHapusKonten = async (id) => {
    if(!window.confirm('Hapus konten?')) return;
    await supabase.from('konten_publik').delete().eq('id', id);
    showToast('Konten dihapus.');
    fetchAllData();
  };

  // GURU & PRESENSI HANDLERS
  const handlePilihSiswaPresensi = (periode) => {
    setSearchSiswaPresensi(`${periode.siswa?.nama_murid} (${periode.paket_belajar?.nama_paket})`);
    setIsDropdownPresensiOpen(false);
    const count = daftarPresensiSiswa.filter(ps => ps.periode_id === periode.id).length + 1;
    setNewPresensiSiswa(prev => ({ ...prev, periode_id: periode.id, pertemuan_ke: count }));
  };

  const handleTambahPresensiSiswa = async (e) => {
    e.preventDefault();
    if (!newPresensiSiswa.periode_id) return showToast('Pilih siswa dari daftar terlebih dahulu!', 'error');
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
    if (periodeObj?.siswa?.no_hp && window.confirm('Presensi berhasil dicatat! Ingin kirim rekap ke WhatsApp Wali?')) {
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

  const handleCekTrackingOrangTua = (e) => {
    e.preventDefault();
    setTrackingError('');
    setTrackingResult(null);
    const q = trackingQuery.trim().toLowerCase();
    if (!q) return;

    const foundSiswa = daftarSiswa.find(s => s.nama_murid?.toLowerCase().includes(q) || s.no_hp?.includes(q));
    if (!foundSiswa) {
      setTrackingError('Data siswa tidak ditemukan. Pastikan Nama atau No HP benar.');
      return;
    }

    const periodeAktif = daftarPeriode.find(p => p.siswa_id === foundSiswa.id && p.status_periode === 'berjalan');
    setTrackingResult({
      siswa: foundSiswa,
      periode: periodeAktif,
      presensi: periodeAktif ? daftarPresensiSiswa.filter(ps => ps.periode_id === periodeAktif.id) : [],
      pembayaran: daftarPembayaran.filter(pb => pb.siswa_id === foundSiswa.id)
    });
  };

  const handleDaftarSubmit = async (e) => {
    e.preventDefault();
    if (selectedPaket.length === 0) return showToast('Pilih minimal satu paket!', 'error');
    setLoading(true);
    try {
      const { data: siswaData } = await supabase.from('siswa').insert([{ ...formDaftar, status: 'pending' }]).select();
      if (siswaData && siswaData[0]) {
        const inserts = selectedPaket.map(pId => ({ siswa_id: siswaData[0].id, paket_id: pId, total_pertemuan: 12, status_periode: 'pending' }));
        await supabase.from('periode_belajar').insert(inserts);
      }
    } finally {
      setLoading(false);
      const waText = `Halo Admin Bimbel ErHa, saya ${formDaftar.nama_orang_tua} mendaftarkan ${formDaftar.nama_murid}.`;
      window.open(`https://wa.me/${pengaturanWeb.no_admin_wa || '6281915058297'}?text=${encodeURIComponent(waText)}`, '_blank');
      showToast('Pendaftaran dikirim via WhatsApp!');
      setFormDaftar({ nama_murid: '', nama_orang_tua: '', no_hp: '', alamat: '', jenjang_sekolah: 'TK' });
      setSelectedPaket([]);
      fetchAllData();
    }
  };

  if (!appReady) return <div className="min-h-screen flex items-center justify-center font-bold text-[#581878] bg-purple-50">Memuat Portal ErHa...</div>;

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-gray-800 flex flex-col justify-between relative">
      
      {/* TOAST NOTIFICATION */}
      {toast.show && (
        <div className={`fixed top-5 right-5 z-[200] px-5 py-3 rounded-2xl shadow-2xl text-sm font-bold text-white flex items-center space-x-2 transition-all transform animate-bounce ${toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
          <span>{toast.type === 'error' ? '❌' : '✅'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* NAVBAR UTAMA */}
      <nav className="sticky top-0 z-50 bg-[#581878] shadow-md border-b-2 border-purple-900">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {user && (
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden text-white focus:outline-none p-1 rounded-lg hover:bg-purple-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
              </button>
            )}
            <div className="flex items-center space-x-2.5">
              <div className="bg-white p-1 rounded-xl shadow-inner">
                <img src={pengaturanWeb.logo_url || "/logo.png"} alt="Logo" className="h-8 w-8 object-contain" />
              </div>
              <div>
                <h1 className="text-white font-black text-base tracking-tight leading-none">Bimbel ErHa</h1>
                <p className="text-amber-400 font-bold text-[10px] tracking-wider uppercase">Rumah Hebat</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <span className="text-xs text-purple-200 block">Masuk sebagai</span>
                  <span className="text-xs font-black text-amber-300 uppercase">{userRole === 'admin' ? '👑 Admin Pusat' : `Guru: ${currentMentorProfile?.nama_mentor?.split(' ')[0] || ''}`}</span>
                </div>
                <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-1.5 px-4 rounded-xl text-xs shadow transition">Keluar</button>
              </div>
            ) : (
              <button onClick={() => setShowLoginModal(true)} className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black py-2 px-5 rounded-2xl text-xs shadow-lg transition flex items-center space-x-1.5">
                <span>🔐</span> <span>Login Portal</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* KONTEN UTAMA */}
      <main className="flex-grow">
        {user ? (
          /* ======================================================= */
          /* DASHBOARD LAYOUT (ADMIN & GURU DENGAN MODERN SIDEBAR)   */
          /* ======================================================= */
          <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
            
            {/* SIDEBAR NAVIGATION (DESKTOP & MOBILE RESPONSIVE) */}
            <aside className={`fixed md:static inset-y-0 left-0 z-45 w-64 bg-white shadow-xl md:shadow-none md:border-r border-gray-200 p-6 flex flex-col justify-between transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-200 ease-in-out`}>
              <div className="space-y-6 pt-12 md:pt-0">
                <div>
                  <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Menu Utama</p>
                  <div className="space-y-1">
                    {userRole === 'admin' ? (
                      <>
                        <button onClick={() => { setAdminTab('dashboard'); setIsSidebarOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-sm transition ${adminTab === 'dashboard' ? 'bg-purple-900 text-white shadow-lg' : 'text-gray-600 hover:bg-purple-50 hover:text-purple-900'}`}><span>📊</span> <span>Dashboard</span></button>
                        <button onClick={() => { setAdminTab('siswa'); setIsSidebarOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-sm transition ${adminTab === 'siswa' ? 'bg-purple-900 text-white shadow-lg' : 'text-gray-600 hover:bg-purple-50 hover:text-purple-900'}`}><span>📋</span> <span>Manajemen Siswa</span></button>
                        <button onClick={() => { setAdminTab('mentor'); setIsSidebarOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-sm transition ${adminTab === 'mentor' ? 'bg-purple-900 text-white shadow-lg' : 'text-gray-600 hover:bg-purple-50 hover:text-purple-900'}`}><span>👩‍🏫</span> <span>Mentor & Payroll</span></button>
                        <button onClick={() => { setAdminTab('pembayaran'); setIsSidebarOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-sm transition ${adminTab === 'pembayaran' ? 'bg-purple-900 text-white shadow-lg' : 'text-gray-600 hover:bg-purple-50 hover:text-purple-900'}`}><span>💵</span> <span>Pembayaran</span></button>
                        <button onClick={() => { setAdminTab('modul'); setIsSidebarOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-sm transition ${adminTab === 'modul' ? 'bg-purple-900 text-white shadow-lg' : 'text-gray-600 hover:bg-purple-50 hover:text-purple-900'}`}><span>📚</span> <span>Inventaris Logistik</span></button>
                        <button onClick={() => { setAdminTab('setup_web'); setIsSidebarOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-sm transition ${adminTab === 'setup_web' ? 'bg-purple-900 text-white shadow-lg' : 'text-gray-600 hover:bg-purple-50 hover:text-purple-900'}`}><span>⚙️</span> <span>Setup & Konten</span></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setGuruTab('beranda'); setIsSidebarOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-sm transition ${guruTab === 'beranda' ? 'bg-purple-900 text-white shadow-lg' : 'text-gray-600 hover:bg-purple-50 hover:text-purple-900'}`}><span>🏠</span> <span>Beranda Guru</span></button>
                        <button onClick={() => { setGuruTab('presensi'); setIsSidebarOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-sm transition ${guruTab === 'presensi' ? 'bg-purple-900 text-white shadow-lg' : 'text-gray-600 hover:bg-purple-50 hover:text-purple-900'}`}><span>📝</span> <span>Presensi Kelas</span></button>
                        {currentMentorProfile?.akses_konten && <button onClick={() => { setGuruTab('konten'); setIsSidebarOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-sm transition ${guruTab === 'konten' ? 'bg-purple-900 text-white shadow-lg' : 'text-gray-600 hover:bg-purple-50 hover:text-purple-900'}`}><span>🎥</span> <span>Publikasi Konten</span></button>}
                        <button onClick={() => { setGuruTab('modul'); setIsSidebarOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-sm transition ${guruTab === 'modul' ? 'bg-purple-900 text-white shadow-lg' : 'text-gray-600 hover:bg-purple-50 hover:text-purple-900'}`}><span>📦</span> <span>Cek Inventaris</span></button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 mt-6">
                <p className="text-[11px] font-bold text-purple-900">Bimbel ErHa v3.5</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Sistem Manajemen Terpadu</p>
              </div>
            </aside>

            {/* KONTEN UTAMA DASHBOARD */}
            <div className="flex-1 overflow-x-hidden space-y-6">
              
              {/* ======================================================= */}
              {/* PORTAL ADMIN                                            */}
              {/* ======================================================= */}
              {userRole === 'admin' && (
                <div>
                  {/* TAB: DASHBOARD OVERVIEW (METRIC CARDS) */}
                  {adminTab === 'dashboard' && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-black text-gray-900">Dashboard Admin 📊</h2>
                        <p className="text-xs text-gray-500">Ringkasan aktivitas dan operasional Bimbingan Belajar ErHa.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-4">
                          <div className="p-4 bg-purple-50 text-purple-700 rounded-2xl text-2xl font-bold">👩‍🎓</div>
                          <div><p className="text-xs text-gray-400 font-bold uppercase">Siswa Aktif</p><h4 className="text-2xl font-black text-gray-900">{daftarSiswa.filter(s => s.status === 'aktif').length}</h4></div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-4">
                          <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl text-2xl font-bold">👩‍🏫</div>
                          <div><p className="text-xs text-gray-400 font-bold uppercase">Total Mentor</p><h4 className="text-2xl font-black text-gray-900">{daftarMentor.length}</h4></div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-4">
                          <div className="p-4 bg-amber-50 text-amber-700 rounded-2xl text-2xl font-bold">⏳</div>
                          <div><p className="text-xs text-gray-400 font-bold uppercase">Pending Daftar</p><h4 className="text-2xl font-black text-gray-900">{daftarSiswa.filter(s => s.status === 'pending').length}</h4></div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-4">
                          <div className="p-4 bg-blue-50 text-blue-700 rounded-2xl text-2xl font-bold">📚</div>
                          <div><p className="text-xs text-gray-400 font-bold uppercase">Total Barang</p><h4 className="text-2xl font-black text-gray-900">{daftarInventaris.length}</h4></div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                          <span className="bg-amber-400 text-purple-950 font-black text-[10px] px-3 py-1 rounded-full uppercase">Pintasan Cepat</span>
                          <h3 className="text-2xl font-black mt-2">Kelola Data Lebih Cepat</h3>
                          <p className="text-xs text-purple-200 mt-1">Gunakan tombol di samping untuk menambahkan siswa baru atau mencatat pembayaran secara instan.</p>
                        </div>
                        <div className="flex gap-3">
                          <button onClick={() => setAdminTab('siswa')} className="bg-white text-purple-900 hover:bg-purple-50 font-black px-5 py-3 rounded-2xl text-xs shadow transition">Kelola Siswa</button>
                          <button onClick={() => setAdminTab('pembayaran')} className="bg-amber-500 hover:bg-amber-600 text-white font-black px-5 py-3 rounded-2xl text-xs shadow transition">Catat Bayar</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB: SISWA */}
                  {adminTab === 'siswa' && (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div><h2 className="text-2xl font-black text-gray-900">Manajemen Siswa 📋</h2><p className="text-xs text-gray-500">Persetujuan online, progres belajar 12 sesi, dan rekap presensi.</p></div>
                        <button onClick={() => setShowTambahSiswaModal(true)} className="bg-[#581878] hover:bg-purple-900 text-white font-black px-5 py-3 rounded-2xl text-xs shadow-lg transition">+ Tambah Siswa Baru</button>
                      </div>

                      <div className="flex space-x-2 border-b border-gray-200 pb-3 overflow-x-auto">
                        <button onClick={() => setSiswaSubTab('persetujuan')} className={`px-4 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition ${siswaSubTab === 'persetujuan' ? 'bg-amber-400 text-purple-950 shadow' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>Persetujuan Baru ({daftarSiswa.filter(s => s.status === 'pending').length})</button>
                        <button onClick={() => setSiswaSubTab('data')} className={`px-4 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition ${siswaSubTab === 'data' ? 'bg-purple-900 text-white shadow' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>Data & Bar Progress</button>
                        <button onClick={() => setSiswaSubTab('presensi')} className={`px-4 py-2 rounded-xl font-bold text-xs whitespace-nowrap ${siswaSubTab === 'presensi' ? 'bg-purple-900 text-white shadow' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>Rekap Presensi Global</button>
                      </div>

                      {siswaSubTab === 'persetujuan' && (
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-purple-50 text-purple-900"><tr><th className="p-4 rounded-l-2xl">Nama Siswa</th><th className="p-4">Wali & Kontak</th><th className="p-4 text-center rounded-r-2xl">Aksi</th></tr></thead>
                            <tbody className="divide-y divide-gray-100">
                              {daftarSiswa.filter(s => s.status === 'pending').map(s => (
                                <tr key={s.id} className="hover:bg-purple-50/50">
                                  <td className="p-4 font-bold text-gray-900">{s.nama_murid} <span className="text-xs font-normal text-gray-500 block">Jenjang: {s.jenjang_sekolah}</span></td>
                                  <td className="p-4">{s.nama_orang_tua} <span className="text-xs text-gray-400 block">{s.no_hp}</span></td>
                                  <td className="p-4 text-center"><button onClick={() => openApproveModal(s)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow transition">✓ Setujui & Aktifkan</button></td>
                                </tr>
                              ))}
                              {daftarSiswa.filter(s => s.status === 'pending').length === 0 && (
                                <tr><td colSpan="3" className="text-center py-10 text-gray-400 italic">Tidak ada pendaftaran baru yang menunggu persetujuan.</td></tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {siswaSubTab === 'data' && (
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
                          <div className="flex justify-between items-center"><h3 className="font-extrabold text-gray-900">Daftar Siswa Aktif</h3><button onClick={() => window.print()} className="bg-gray-800 text-white text-xs font-bold px-4 py-2 rounded-xl shadow">🖨️ Cetak PDF</button></div>
                          <table className="w-full text-left text-sm">
                            <thead className="bg-purple-50 text-purple-900"><tr><th className="p-4 rounded-l-2xl">Nama Siswa & Progres Sesi</th><th className="p-4 text-center rounded-r-2xl">Aksi Kelola</th></tr></thead>
                            <tbody className="divide-y divide-gray-100">
                              {daftarSiswa.filter(s => s.status === 'aktif').map(s => {
                                const periodeAktif = daftarPeriode.find(p => p.siswa_id === s.id && p.status_periode === 'berjalan');
                                const count = periodeAktif ? daftarPresensiSiswa.filter(ps => ps.periode_id === periodeAktif.id).length : 0;
                                const percent = Math.min(Math.round((count / 12) * 100), 100);
                                return (
                                  <tr key={s.id} className="hover:bg-purple-50/50">
                                    <td className="p-4">
                                      <div className="flex justify-between font-bold text-gray-900 mb-1.5"><span>{s.nama_murid}</span><span className="text-xs text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full">{count}/12 Sesi</span></div>
                                      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden"><div className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div></div>
                                    </td>
                                    <td className="p-4 text-center space-x-2">
                                      {count >= 12 && <button onClick={() => handleRolloverPeriode(periodeAktif)} className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow animate-bounce">Rollover</button>}
                                      <button onClick={() => openEditSiswaModal(s)} className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-1.5 rounded-xl text-xs font-bold">Edit</button>
                                      <button onClick={() => handleHapusSiswa(s.id, s.nama_murid)} className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-xl text-xs font-bold">Hapus</button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {siswaSubTab === 'presensi' && (
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
                          <div className="flex justify-between items-center"><h3 className="font-extrabold text-gray-900">Rekap Presensi Siswa Global</h3><input type="month" value={filterBulanPresensi} onChange={e => setFilterBulanPresensi(e.target.value)} className="border px-4 py-2 rounded-xl text-sm bg-gray-50 font-bold" /></div>
                          <table className="w-full text-left text-sm">
                            <thead className="bg-purple-50 text-purple-900"><tr><th className="p-4 rounded-l-2xl">Tanggal</th><th className="p-4">Siswa</th><th className="p-4">Mentor</th><th className="p-4 text-center">Sesi</th><th className="p-4 rounded-r-2xl">Jurnal Materi</th></tr></thead>
                            <tbody className="divide-y divide-gray-100">
                              {daftarPresensiSiswa.filter(ps => filterBulanPresensi ? ps.tanggal_pertemuan?.startsWith(filterBulanPresensi) : true).map(ps => (
                                <tr key={ps.id} className="hover:bg-purple-50/50">
                                  <td className="p-4 font-medium">{formatTanggalIndo(ps.tanggal_pertemuan)}</td>
                                  <td className="p-4 font-bold text-gray-900">{ps.periode_belajar?.siswa?.nama_murid}</td>
                                  <td className="p-4 text-purple-900 font-bold">{ps.mentor?.nama_mentor}</td>
                                  <td className="p-4 text-center font-bold">{ps.pertemuan_ke}</td>
                                  <td className="p-4 text-gray-600">{ps.jurnal_materi}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB: MENTOR & PAYROLL */}
                  {adminTab === 'mentor' && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <div><h2 className="text-2xl font-black text-gray-900">Manajemen Mentor & Payroll 👩‍🏫</h2><p className="text-xs text-gray-500">Atur hak akses delegasi, presensi jam kerja, dan hitung gaji pengajar.</p></div>
                        <button onClick={() => setShowTambahMentorModal(true)} className="bg-[#581878] hover:bg-purple-900 text-white font-black px-5 py-3 rounded-2xl text-xs shadow-lg transition">+ Tambah Mentor</button>
                      </div>

                      <div className="flex space-x-2 border-b border-gray-200 pb-3 overflow-x-auto">
                        <button onClick={() => setMentorSubTab('daftar')} className={`px-4 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition ${mentorSubTab === 'daftar' ? 'bg-purple-900 text-white shadow' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>Daftar & Delegasi</button>
                        <button onClick={() => setMentorSubTab('presensi')} className={`px-4 py-2 rounded-xl font-bold text-xs whitespace-nowrap ${mentorSubTab === 'presensi' ? 'bg-purple-900 text-white shadow' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>Presensi Mentor</button>
                        <button onClick={() => setMentorSubTab('penggajian')} className={`px-4 py-2 rounded-xl font-bold text-xs whitespace-nowrap ${mentorSubTab === 'penggajian' ? 'bg-purple-900 text-white shadow' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>Hitung Payroll</button>
                      </div>

                      {mentorSubTab === 'daftar' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {daftarMentor.map(m => (
                            <div key={m.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center">
                              <div>
                                <h5 className="font-black text-gray-900 text-base">{m.nama_mentor}</h5>
                                <p className="text-xs text-gray-400">{m.email} | HP: {m.no_hp}</p>
                                <p className="text-xs font-bold text-emerald-600 mt-1">Tarif: Rp {(m.honor_per_jam || 25000).toLocaleString('id-ID')}/jam</p>
                              </div>
                              <div className="space-y-1.5 text-right bg-purple-50 p-3 rounded-2xl border border-purple-100">
                                <label className="text-[11px] font-bold block cursor-pointer text-purple-900"><input type="checkbox" checked={!!m.akses_inventaris} onChange={() => handleToggleDelegasiMentor(m.id, 'akses_inventaris', m.akses_inventaris)} className="mr-1.5 accent-purple-700" /> Akses Inv</label>
                                <label className="text-[11px] font-bold block cursor-pointer text-purple-900"><input type="checkbox" checked={!!m.akses_konten} onChange={() => handleToggleDelegasiMentor(m.id, 'akses_konten', m.akses_konten)} className="mr-1.5 accent-purple-700" /> Akses Konten</label>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {mentorSubTab === 'presensi' && (
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
                          <h3 className="font-extrabold text-gray-900">Input Total Jam Kerja Mentor</h3>
                          <form onSubmit={handleTambahPresensiMentor} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-purple-50/50 p-5 rounded-2xl border border-purple-100">
                            <select required value={formPresensiMentor.mentor_id} onChange={e => setFormPresensiMentor({...formPresensiMentor, mentor_id: e.target.value})} className="border p-3 rounded-xl bg-white text-sm font-bold"><option value="">-- Pilih Mentor --</option>{daftarMentor.map(m => <option key={m.id} value={m.id}>{m.nama_mentor}</option>)}</select>
                            <input type="date" required value={formPresensiMentor.tanggal} onChange={e => setFormPresensiMentor({...formPresensiMentor, tanggal: e.target.value})} className="border p-3 rounded-xl text-sm bg-white font-bold" />
                            <input type="number" step="0.5" placeholder="Total Jam Mengajar" required value={formPresensiMentor.total_jam} onChange={e => setFormPresensiMentor({...formPresensiMentor, total_jam: parseFloat(e.target.value)} )} className="border p-3 rounded-xl text-sm font-bold bg-white" />
                            <button type="submit" className="bg-[#581878] hover:bg-purple-900 text-white py-3 rounded-xl font-bold shadow transition">Simpan Jam</button>
                          </form>
                        </div>
                      )}

                      {mentorSubTab === 'penggajian' && (
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
                          <h3 className="font-extrabold text-gray-900">Kalkulator Payroll / Gaji Bulanan</h3>
                          <form onSubmit={handleSimpanGaji} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-purple-50/50 p-5 rounded-2xl border border-purple-100">
                            <select required value={formGaji.mentor_id} onChange={e => setFormGaji({...formGaji, mentor_id: e.target.value})} className="border p-3 rounded-xl bg-white text-sm font-bold"><option value="">-- Pilih Mentor --</option>{daftarMentor.map(m => <option key={m.id} value={m.id}>{m.nama_mentor}</option>)}</select>
                            <input type="month" required value={formGaji.bulan_periode} onChange={e => setFormGaji({...formGaji, bulan_periode: e.target.value})} className="border p-3 rounded-xl text-sm bg-white font-bold" />
                            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold shadow transition">Generate Slip Gaji</button>
                          </form>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB: PEMBAYARAN */}
                  {adminTab === 'pembayaran' && (
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
                      <h2 className="text-2xl font-black text-gray-900">Penerimaan Pembayaran 💵</h2>
                      <form onSubmit={handleCatatPembayaran} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-purple-50/50 p-5 rounded-2xl border border-purple-100">
                        <select required value={formPembayaran.siswa_id} onChange={e => setFormPembayaran({...formPembayaran, siswa_id: e.target.value})} className="border p-3 rounded-xl text-sm bg-white font-bold"><option value="">-- Pilih Siswa --</option>{daftarSiswa.map(s => <option key={s.id} value={s.id}>{s.nama_murid}</option>)}</select>
                        <input type="number" placeholder="Nominal Bayar (Rp)" required value={formPembayaran.total_bayar} onChange={e => setFormPembayaran({...formPembayaran, total_bayar: Number(e.target.value)})} className="border p-3 rounded-xl text-sm font-bold bg-white text-emerald-700" />
                        <div className="md:col-span-2 border p-4 rounded-xl bg-white">
                          <p className="text-xs font-bold mb-2 text-purple-900">Item Pembayaran:</p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {paymentItemOptions.map(item => (
                              <label key={item} className="text-xs flex items-center cursor-pointer font-medium"><input type="checkbox" className="mr-2 accent-purple-700 w-4 h-4" onChange={e => e.target.checked ? setFormPembayaran({...formPembayaran, items: [...formPembayaran.items, item]}) : setFormPembayaran({...formPembayaran, items: formPembayaran.items.filter(i => i !== item)}) } /> {item}</label>
                            ))}
                          </div>
                        </div>
                        <button type="submit" className="md:col-span-2 bg-[#581878] hover:bg-purple-900 text-white py-3.5 rounded-xl font-bold shadow transition">Simpan & Rekam Pembayaran</button>
                      </form>

                      <table className="w-full text-left text-sm">
                        <thead className="bg-purple-50 text-purple-900"><tr><th className="p-4 rounded-l-2xl">Tanggal</th><th className="p-4">Siswa</th><th className="p-4">Item Pembayaran</th><th className="p-4">Nominal</th><th className="p-4 text-center rounded-r-2xl">Aksi</th></tr></thead>
                        <tbody className="divide-y divide-gray-100">
                          {daftarPembayaran.map(pb => (
                            <tr key={pb.id} className="hover:bg-purple-50/50">
                              <td className="p-4 font-medium">{formatTanggalIndo(pb.tanggal_pembayaran)}</td>
                              <td className="p-4 font-bold text-gray-900">{pb.siswa?.nama_murid}</td>
                              <td className="p-4">{pb.item_bayar}</td>
                              <td className="p-4 text-emerald-600 font-black">Rp {Number(pb.jumlah_bayar).toLocaleString('id-ID')}</td>
                              <td className="p-4 text-center"><button onClick={() => handleHapusPembayaran(pb.id)} className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-xl text-xs font-bold">Hapus</button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* TAB: INVENTARIS */}
                  {adminTab === 'modul' && <ModulManager adminView={true} />}

                  {/* TAB: SETUP WEB & KONTEN */}
                  {adminTab === 'setup_web' && (
                    <div className="space-y-6 max-w-3xl mx-auto">
                      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-black text-[#581878] mb-4">Live Edit Pengaturan Halaman Utama</h3>
                        <form onSubmit={handleSimpanPengaturanWeb} className="space-y-4">
                          <div><label className="text-xs font-bold text-gray-600 block mb-1">Judul Utama:</label><input type="text" value={pengaturanWeb.judul_utama} onChange={e => setPengaturanWeb({...pengaturanWeb, judul_utama: e.target.value})} className="border p-3 rounded-2xl w-full text-sm bg-gray-50 font-bold" /></div>
                          <div><label className="text-xs font-bold text-gray-600 block mb-1">Sub-Judul:</label><input type="text" value={pengaturanWeb.sub_judul} onChange={e => setPengaturanWeb({...pengaturanWeb, sub_judul: e.target.value})} className="border p-3 rounded-2xl w-full text-sm bg-gray-50 font-bold" /></div>
                          <div><label className="text-xs font-bold text-gray-600 block mb-1">URL Logo Web:</label><input type="text" value={pengaturanWeb.logo_url} onChange={e => setPengaturanWeb({...pengaturanWeb, logo_url: e.target.value})} className="border p-3 rounded-2xl w-full text-sm bg-gray-50" /></div>
                          <div><label className="text-xs font-bold text-gray-600 block mb-1">No WhatsApp Admin:</label><input type="text" value={pengaturanWeb.no_admin_wa} onChange={e => setPengaturanWeb({...pengaturanWeb, no_admin_wa: e.target.value})} className="border p-3 rounded-2xl w-full text-sm bg-gray-50 font-bold" /></div>
                          <button type="submit" className="w-full bg-[#581878] hover:bg-purple-900 text-white font-bold py-3.5 rounded-2xl shadow transition">Simpan Perubahan Web</button>
                        </form>
                      </div>

                      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-black text-[#581878] mb-2">Pengaturan Urutan & Visibilitas Landing Page</h3>
                        <p className="text-xs text-gray-500 mb-4">Atur nomor urut dan centang untuk menampilkan blok di halaman utama.</p>
                        <div className="space-y-3">
                          {landingSections.map(sec => (
                            <div key={sec.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
                              <div><span className="font-bold text-gray-900">{sec.nama_section}</span><span className="text-xs text-gray-400 block">Key: {sec.section_key}</span></div>
                              <div className="flex items-center space-x-3">
                                <label className="text-xs font-bold flex items-center cursor-pointer"><input type="checkbox" checked={sec.is_aktif} onChange={(e) => handleUpdateUrutanSection(sec.id, sec.urutan, e.target.checked)} className="mr-1.5 w-4 h-4 accent-purple-700" /> Tampil</label>
                                <input type="number" value={sec.urutan} onChange={(e) => handleUpdateUrutanSection(sec.id, parseInt(e.target.value) || 0, sec.is_aktif)} className="w-16 border p-2 rounded-xl text-center font-bold text-sm bg-white" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-black text-[#581878] mb-4">Publikasi Artikel & Video Edukasi</h3>
                        <form onSubmit={handleSimpanKonten} className="space-y-4">
                          <input type="text" placeholder="Judul Artikel / Video" required value={formKonten.judul} onChange={e => setFormKonten({...formKonten, judul: e.target.value})} className="border p-3 rounded-2xl w-full text-sm bg-gray-50 font-bold" />
                          <select value={formKonten.tipe} onChange={e => setFormKonten({...formKonten, tipe: e.target.value})} className="border p-3 rounded-2xl w-full text-sm bg-gray-50 font-bold"><option value="artikel">📝 Artikel</option><option value="video">🎥 Video YouTube</option></select>
                          <input type="text" placeholder="URL Video YouTube" value={formKonten.video_url} onChange={e => setFormKonten({...formKonten, video_url: e.target.value})} className="border p-3 rounded-2xl w-full text-sm bg-gray-50" />
                          <textarea placeholder="Isi Konten..." required value={formKonten.isi} onChange={e => setFormKonten({...formKonten, isi: e.target.value})} className="border p-3 rounded-2xl w-full text-sm bg-gray-50" rows="3" />
                          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl shadow transition">Terbitkan Konten</button>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ======================================================= */}
              {/* PORTAL GURU                                             */}
              {/* ======================================================= */}
              {userRole === 'guru' && (
                <div className="space-y-6">
                  {guruTab === 'beranda' && (
                    <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
                      <div>
                        <span className="bg-amber-400 text-purple-950 font-black text-[10px] px-3 py-1 rounded-full uppercase">Portal Pengajar</span>
                        <h2 className="text-3xl font-black mt-2">Selamat Datang, {currentMentorProfile?.nama_mentor || 'Pengajar'} 👋</h2>
                        <p className="text-purple-200 text-sm mt-1">Tarif Mengajar: Rp {(currentMentorProfile?.honor_per_jam || 0).toLocaleString('id-ID')} / Jam</p>
                      </div>
                      <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/20 text-center">
                        <p className="text-xs text-purple-200 uppercase font-bold">Status Akun</p>
                        <p className="text-lg font-black text-amber-300">Aktif & Terverifikasi</p>
                      </div>
                    </div>
                  )}

                  {guruTab === 'presensi' && (
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-xl mx-auto space-y-6">
                      <h3 className="text-xl font-black text-[#581878]">Catat Presensi Kelas Hari Ini</h3>
                      <form onSubmit={handleTambahPresensiSiswa} className="space-y-4">
                        <div className="relative">
                          <label className="text-xs font-bold text-gray-600 mb-1 block">Cari / Pilih Siswa Aktif:</label>
                          <input type="text" placeholder="Ketik nama siswa aktif..." value={searchSiswaPresensi} onFocus={() => setIsDropdownPresensiOpen(true)} onChange={e => { setSearchSiswaPresensi(e.target.value); setIsDropdownPresensiOpen(true); setNewPresensiSiswa(prev => ({...prev, periode_id: ''})); }} className="w-full border p-3.5 rounded-2xl text-sm outline-none focus:border-purple-600 bg-gray-50 font-bold" />
                          {isDropdownPresensiOpen && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-purple-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto">
                              {daftarPeriode.filter(p => p.siswa?.status === 'aktif' && p.status_periode === 'berjalan').filter(p => p.siswa?.nama_murid?.toLowerCase().includes((searchSiswaPresensi || '').toLowerCase())).map(p => (
                                <div key={p.id} onClick={() => handlePilihSiswaPresensi(p)} className="p-3.5 cursor-pointer hover:bg-purple-50 border-b text-sm font-bold text-[#581878]">{p.siswa?.nama_murid} <span className="text-xs font-normal text-gray-500">({p.paket_belajar?.nama_paket})</span></div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div><label className="text-xs font-bold text-gray-600 mb-1 block">Pertemuan Ke-:</label><input type="text" readOnly value={`Sesi Ke- ${newPresensiSiswa.pertemuan_ke}`} className="border p-3.5 rounded-2xl w-full bg-gray-100 font-black text-center text-sm text-[#581878]" /></div>
                        <div><label className="text-xs font-bold text-gray-600 mb-1 block">Tanggal Pertemuan:</label><input type="date" required value={newPresensiSiswa.tanggal_pertemuan} onChange={e => setNewPresensiSiswa({...newPresensiSiswa, tanggal_pertemuan: e.target.value})} className="border p-3.5 rounded-2xl w-full text-sm bg-gray-50 font-bold" /></div>
                        <div>
                          <label className="text-xs font-bold text-gray-600 mb-1 block">Status Kehadiran:</label>
                          <select value={newPresensiSiswa.status_kehadiran} onChange={e => setNewPresensiSiswa({...newPresensiSiswa, status_kehadiran: e.target.value})} className="border p-3.5 rounded-2xl w-full text-sm font-bold bg-gray-50">
                            <option value="Hadir">✅ Hadir</option>
                            <option value="Izin">📩 Izin</option>
                          </select>
                        </div>
                        <div><label className="text-xs font-bold text-gray-600 mb-1 block">Jurnal Materi:</label><input type="text" placeholder="Contoh: Pecahan Senilai & Latihan Soal..." required value={newPresensiSiswa.jurnal_materi} onChange={e => setNewPresensiSiswa({...newPresensiSiswa, jurnal_materi: e.target.value})} className="border p-3.5 rounded-2xl w-full text-sm bg-gray-50" /></div>
                        <button type="submit" className="w-full bg-[#581878] hover:bg-purple-900 text-white py-4 rounded-2xl font-black shadow-lg transition">Simpan Presensi 🚀</button>
                      </form>
                    </div>
                  )}

                  {guruTab === 'konten' && currentMentorProfile?.akses_konten && (
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-xl mx-auto space-y-6">
                      <h3 className="text-xl font-black text-[#581878]">Buat Artikel / Video Publik</h3>
                      <form onSubmit={handleSimpanKonten} className="space-y-4">
                        <input type="text" placeholder="Judul" required value={formKonten.judul} onChange={e => setFormKonten({...formKonten, judul: e.target.value})} className="border p-3.5 rounded-2xl w-full text-sm bg-gray-50 font-bold" />
                        <select value={formKonten.tipe} onChange={e => setFormKonten({...formKonten, tipe: e.target.value})} className="border p-3.5 rounded-2xl w-full text-sm bg-gray-50 font-bold"><option value="artikel">Artikel</option><option value="video">Video YouTube</option></select>
                        <input type="text" placeholder="URL Video (Opsional)" value={formKonten.video_url} onChange={e => setFormKonten({...formKonten, video_url: e.target.value})} className="border p-3.5 rounded-2xl w-full text-sm bg-gray-50" />
                        <textarea placeholder="Isi..." required value={formKonten.isi} onChange={e => setFormKonten({...formKonten, isi: e.target.value})} className="border p-3.5 rounded-2xl w-full text-sm bg-gray-50" rows="3" />
                        <button type="submit" className="w-full bg-[#581878] hover:bg-purple-900 text-white py-4 rounded-2xl font-black shadow-lg transition">Publikasikan</button>
                      </form>
                    </div>
                  )}

                  {guruTab === 'modul' && <ModulManager adminView={currentMentorProfile?.akses_inventaris} />}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ======================================================= */
          /* LANDING PAGE PUBLIK (MODERN SAAS STYLE)                 */
          /* ======================================================= */
          <div className="space-y-16 pb-20">
            {(() => {
              const activeSections = (landingSections && landingSections.length > 0) 
                ? [...landingSections].filter(sec => sec.is_aktif).sort((a, b) => a.urutan - b.urutan)
                : [
                    { id: 1, section_key: 'hero' },
                    { id: 2, section_key: 'tracking' },
                    { id: 3, section_key: 'paket' },
                    { id: 4, section_key: 'konten' },
                    { id: 5, section_key: 'pendaftaran' }
                  ];

              return activeSections.map(sec => {
                if (sec.section_key === 'hero') {
                  return (
                    <section key={sec.id || 'hero'} className="bg-gradient-to-b from-[#581878] via-[#6B21A8] to-[#FFFDF0] text-white pt-20 pb-28 px-4 text-center">
                      <div className="max-w-4xl mx-auto space-y-6">
                        <span className="inline-block bg-amber-400 text-purple-950 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">Bimbingan Belajar Ceria & Berprestasi 🚀</span>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">{pengaturanWeb.judul_utama}</h2>
                        <p className="text-lg text-purple-200 max-w-2xl mx-auto">{pengaturanWeb.sub_judul}</p>
                      </div>
                    </section>
                  );
                }

                if (sec.section_key === 'tracking') {
                  return (
                    <section key={sec.id || 'tracking'} className="max-w-3xl mx-auto px-4 -mt-16 relative z-20">
                      <div className="bg-white rounded-3xl shadow-2xl border-2 border-purple-100 p-8">
                        <h3 className="text-xl font-black text-[#581878] mb-2 text-center">🔍 Portal Cek Kehadiran Orang Tua</h3>
                        <p className="text-xs text-gray-500 text-center mb-6">Masukkan <strong>Nama Lengkap Siswa</strong> atau <strong>No WhatsApp Wali</strong> untuk melihat presensi.</p>
                        <form onSubmit={handleCekTrackingOrangTua} className="flex gap-3">
                          <input type="text" placeholder="Ketik Nama Siswa atau No HP..." value={trackingQuery} onChange={e => setTrackingQuery(e.target.value)} className="flex-1 border p-4 rounded-2xl text-sm outline-none focus:border-purple-600 bg-gray-50 font-bold" />
                          <button type="submit" className="bg-[#581878] hover:bg-purple-900 text-white font-black px-6 py-4 rounded-2xl shadow-lg text-sm transition">Cek Data</button>
                        </form>
                        {trackingError && <p className="text-red-500 text-xs font-bold mt-4 text-center bg-red-50 p-3 rounded-2xl">{trackingError}</p>}
                        
                        {trackingResult && (
                          <div className="mt-6 pt-6 border-t space-y-4">
                            <div className="bg-purple-50 p-5 rounded-2xl border border-purple-100">
                              <h4 className="font-black text-[#581878] text-lg">{trackingResult.siswa.nama_murid}</h4>
                              <p className="text-xs text-gray-600 mt-1">Wali: {trackingResult.siswa.nama_orang_tua} | Status: <span className="text-emerald-600 font-black uppercase">{trackingResult.siswa.status}</span></p>
                              {trackingResult.periode && <p className="text-xs text-purple-900 font-bold mt-2">Periode Aktif: {trackingResult.periode.bulan_periode} ({trackingResult.presensi.length}/12 Sesi Selesai)</p>}
                            </div>
                          </div>
                        )}
                      </div>
                    </section>
                  );
                }

                if (sec.section_key === 'paket') {
                  return (
                    <section key={sec.id || 'paket'} className="max-w-6xl mx-auto px-4">
                      <h3 className="text-3xl font-black text-center text-[#581878] mb-10">Pilihan Program Belajar</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {paketList.map((paket) => {
                          const isSelected = selectedPaket.includes(paket.id);
                          return (
                            <div key={paket.id} onClick={() => isSelected ? setSelectedPaket(selectedPaket.filter(p => p !== paket.id)) : setSelectedPaket([...selectedPaket, paket.id])} className={`cursor-pointer bg-white rounded-3xl p-8 shadow-xl relative transition-all duration-300 ${isSelected ? 'border-4 border-amber-500 -translate-y-2 shadow-2xl bg-amber-50/20' : 'border border-purple-100 hover:shadow-2xl'}`}>
                              {isSelected && <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs font-black px-4 py-1.5 rounded-bl-2xl shadow">✓ Terpilih</div>}
                              <h4 className="text-2xl font-black text-gray-900 mb-3">{paket.nama_paket}</h4>
                              <p className="text-gray-600 text-sm leading-relaxed">{paket.deskripsi}</p>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  );
                }

                if (sec.section_key === 'konten') {
                  return (
                    <section key={sec.id || 'konten'} className="max-w-6xl mx-auto px-4">
                      <h3 className="text-3xl font-black text-center text-[#581878] mb-10">Artikel & Video Edukasi</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {(daftarKonten || []).map(k => (
                          <div key={k.id} className="bg-white p-6 rounded-3xl shadow-sm border border-purple-100 flex flex-col justify-between">
                            <div>
                              <span className="text-[10px] font-black uppercase bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full">{k.tipe}</span>
                              <h4 className="text-xl font-bold text-gray-900 mt-3 mb-2">{k.judul}</h4>
                              <p className="text-xs text-gray-600 leading-relaxed">{k.isi}</p>
                            </div>
                          </div>
                        ))}
                        {(!daftarKonten || daftarKonten.length === 0) && <div className="col-span-full text-center py-10 text-gray-400 bg-white rounded-3xl border border-gray-100">Belum ada konten publik yang dipublikasikan.</div>}
                      </div>
                    </section>
                  );
                }

                if (sec.section_key === 'pendaftaran') {
                  return (
                    <section key={sec.id || 'pendaftaran'} className="max-w-3xl mx-auto px-4">
                      <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border-2 border-purple-100">
                        <div className="text-center mb-8"><h3 className="text-3xl font-black text-[#581878] mb-2">Pendaftaran Siswa Baru</h3><p className="text-xs text-gray-500">Isi formulir singkat di bawah untuk mendaftar secara online.</p></div>
                        <form onSubmit={handleDaftarSubmit} className="space-y-4">
                          <input type="text" placeholder="Nama Lengkap Murid" required value={formDaftar.nama_murid} onChange={e => setFormDaftar({...formDaftar, nama_murid: e.target.value})} className="w-full p-4 rounded-2xl border text-sm bg-gray-50 font-bold" />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" placeholder="Nama Wali" required value={formDaftar.nama_orang_tua} onChange={e => setFormDaftar({...formDaftar, nama_orang_tua: e.target.value})} className="w-full p-4 rounded-2xl border text-sm bg-gray-50 font-bold" />
                            <input type="tel" placeholder="No WhatsApp Wali" required value={formDaftar.no_hp} onChange={e => setFormDaftar({...formDaftar, no_hp: e.target.value})} className="w-full p-4 rounded-2xl border text-sm bg-gray-50 font-bold" />
                          </div>
                          <textarea placeholder="Alamat Domisili" required value={formDaftar.alamat} onChange={e => setFormDaftar({...formDaftar, alamat: e.target.value})} className="w-full p-4 rounded-2xl border text-sm bg-gray-50" rows="2" />
                          <button type="submit" disabled={loading} className="w-full py-4.5 bg-[#581878] hover:bg-purple-900 text-white font-black rounded-2xl shadow-xl transition">Kirim Pendaftaran via WhatsApp 🚀</button>
                        </form>
                      </div>
                    </section>
                  );
                }

                return null;
              });
            })}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-[#581878] text-white py-8 text-center border-t-4 border-amber-400 mt-20">
        <p className="font-black text-lg">Bimbel ErHa (Rumah Hebat)</p>
        <p className="text-xs text-purple-300 mt-1">© {new Date().getFullYear()} Bimbel ErHa. All rights reserved.</p>
      </footer>

      {/* ========================================== */}
      /* MODAL POPUPS (CLEAN & MODERN DESIGN)       */
      /* ========================================== */}

      {/* MODAL TAMBAH SISWA MANUAL */}
      {showTambahSiswaModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowTambahSiswaModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 font-bold text-lg">✕</button>
            <h3 className="text-2xl font-black text-[#581878] mb-4">Tambah Siswa Internal</h3>
            <form onSubmit={handleTambahSiswaManual} className="space-y-4">
              <input type="text" placeholder="Nama Lengkap Murid" required value={formSiswaManual.nama_murid} onChange={e => setFormSiswaManual({...formSiswaManual, nama_murid: e.target.value})} className="w-full p-3.5 rounded-2xl border text-sm bg-gray-50 font-bold" />
              <input type="text" placeholder="Nama Wali" required value={formSiswaManual.nama_orang_tua} onChange={e => setFormSiswaManual({...formSiswaManual, nama_orang_tua: e.target.value})} className="w-full p-3.5 rounded-2xl border text-sm bg-gray-50 font-bold" />
              <input type="text" placeholder="No HP Wali" value={formSiswaManual.no_hp} onChange={e => setFormSiswaManual({...formSiswaManual, no_hp: e.target.value})} className="w-full p-3.5 rounded-2xl border text-sm bg-gray-50" />
              <div className="grid grid-cols-2 gap-3">
                <input type="month" required value={formSiswaManual.bulan_periode} onChange={e => setFormSiswaManual({...formSiswaManual, bulan_periode: e.target.value})} className="border p-3.5 rounded-2xl text-sm bg-gray-50 font-bold" />
                <select value={formSiswaManual.jenjang_sekolah} onChange={e => setFormSiswaManual({...formSiswaManual, jenjang_sekolah: e.target.value})} className="border p-3.5 rounded-2xl text-sm bg-gray-50 font-bold"><option value="TK">TK</option><option value="SD">SD</option><option value="SMP">SMP</option></select>
              </div>
              <div className="border p-4 rounded-2xl bg-purple-50/50">
                <p className="text-xs font-bold mb-2 text-[#581878]">Pilih Paket Belajar:</p>
                {paketList.map(p => (
                  <label key={p.id} className="text-sm block mb-1.5 font-medium"><input type="checkbox" className="mr-2.5 accent-purple-700 w-4 h-4" onChange={e => e.target.checked ? setSelectedPaketManual([...selectedPaketManual, p.id]) : setSelectedPaketManual(selectedPaketManual.filter(id => id !== p.id))} /> {p.nama_paket}</label>
                ))}
              </div>
              <button type="submit" className="w-full bg-[#581878] text-white py-4 rounded-2xl font-black shadow-lg">Simpan Siswa</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH MENTOR */}
      {showTambahMentorModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl relative">
            <button onClick={() => setShowTambahMentorModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 font-bold text-lg">✕</button>
            <h3 className="text-2xl font-black text-[#581878] mb-4">Pendaftaran Mentor Baru</h3>
            <form onSubmit={handleTambahMentor} className="space-y-4">
              <input type="text" placeholder="Nama Lengkap" required value={newMentor.nama_mentor} onChange={e => setNewMentor({...newMentor, nama_mentor: e.target.value})} className="w-full p-3.5 rounded-2xl border text-sm bg-gray-50 font-bold" />
              <input type="email" placeholder="Email Login" required value={newMentor.email} onChange={e => setNewMentor({...newMentor, email: e.target.value})} className="w-full p-3.5 rounded-2xl border text-sm bg-gray-50" />
              <input type="password" placeholder="Password (Min 6 karakter)" required value={newMentor.password} onChange={e => setNewMentor({...newMentor, password: e.target.value})} className="w-full p-3.5 rounded-2xl border text-sm bg-gray-50" />
              <input type="text" placeholder="No WhatsApp" required value={newMentor.no_hp} onChange={e => setNewMentor({...newMentor, no_hp: e.target.value})} className="w-full p-3.5 rounded-2xl border text-sm bg-gray-50" />
              <input type="number" placeholder="Tarif Honor per Jam" required value={newMentor.honor_per_jam} onChange={e => setNewMentor({...newMentor, honor_per_jam: Number(e.target.value)})} className="w-full p-3.5 rounded-2xl border text-sm bg-amber-50 font-black text-amber-800" />
              <button type="submit" className="w-full bg-[#581878] text-white py-4 rounded-2xl font-black shadow-lg">Simpan Mentor</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL APPROVAL SISWA */}
      {showApproveModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <h3 className="font-black text-xl text-[#581878] mb-2">Setujui Siswa</h3>
            <p className="text-xs text-gray-500 mb-4">Mengaktifkan akun untuk <strong>{approveData.nama_murid}</strong>.</p>
            <form onSubmit={handleSimpanApproval} className="space-y-4">
              <div><label className="text-xs font-bold text-gray-600 mb-1 block">Bulan Periode:</label><input type="month" required value={approveData.bulan_periode} onChange={e => setApproveData({...approveData, bulan_periode: e.target.value})} className="w-full border p-3.5 rounded-2xl text-sm bg-gray-50 font-bold" /></div>
              <div><label className="text-xs font-bold text-gray-600 mb-1 block">Tanggal Mulai:</label><input type="date" required value={approveData.tanggal_mulai} onChange={e => setApproveData({...approveData, tanggal_mulai: e.target.value})} className="w-full border p-3.5 rounded-2xl text-sm bg-gray-50" /></div>
              <div><label className="text-xs font-bold text-gray-600 mb-1 block">Tanggal Selesai:</label><input type="date" required value={approveData.tanggal_selesai} onChange={e => setApproveData({...approveData, tanggal_selesai: e.target.value})} className="w-full border p-3.5 rounded-2xl text-sm bg-gray-50" /></div>
              <div className="flex justify-end space-x-3 pt-2"><button type="button" onClick={() => setShowApproveModal(false)} className="px-5 py-3 bg-gray-200 rounded-2xl text-sm font-bold">Batal</button><button type="submit" className="px-6 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-black shadow">Setujui & Aktifkan</button></div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT SISWA */}
      {showEditSiswaModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <h3 className="font-black text-xl text-[#581878] mb-4">Edit Data Siswa</h3>
            <form onSubmit={handleSimpanEditSiswa} className="space-y-4">
              <input type="text" value={editSiswaData.nama_murid} onChange={e => setEditSiswaData({...editSiswaData, nama_murid: e.target.value})} className="w-full border p-3.5 rounded-2xl text-sm bg-gray-50 font-bold" placeholder="Nama Murid" />
              <input type="text" value={editSiswaData.nama_orang_tua} onChange={e => setEditSiswaData({...editSiswaData, nama_orang_tua: e.target.value})} className="w-full border p-3.5 rounded-2xl text-sm bg-gray-50" placeholder="Nama Wali" />
              <input type="text" value={editSiswaData.no_hp} onChange={e => setEditSiswaData({...editSiswaData, no_hp: e.target.value})} className="w-full border p-3.5 rounded-2xl text-sm bg-gray-50" placeholder="No HP" />
              <div className="flex justify-end space-x-3 pt-2"><button type="button" onClick={() => setShowEditSiswaModal(false)} className="px-5 py-3 bg-gray-200 rounded-2xl text-sm font-bold">Batal</button><button type="submit" className="px-6 py-3 bg-[#581878] text-white rounded-2xl text-sm font-black shadow">Simpan Perubahan</button></div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL LOGIN */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl relative animate-fade-in">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 font-bold text-lg">✕</button>
            <div className="text-center mb-6"><h3 className="text-2xl font-black text-[#581878]">Login Portal</h3><p className="text-xs text-gray-400 mt-1">Masukkan kredensial akun Anda.</p></div>
            {loginError && <p className="text-red-500 text-xs font-bold text-center mb-4 bg-red-50 p-3 rounded-2xl">{loginError}</p>}
            <form onSubmit={handleLogin} className="space-y-4">
              <input type="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full px-4 py-3.5 border rounded-2xl text-sm bg-gray-50 font-bold" placeholder="Email" />
              <input type="password" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full px-4 py-3.5 border rounded-2xl text-sm bg-gray-50 font-bold" placeholder="Password" />
              <button type="submit" className="w-full py-4 bg-[#581878] hover:bg-purple-900 text-amber-300 font-black rounded-2xl shadow-xl transition">MASUK PORTAL</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  function ModulManager({ adminView }) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
        <div className="flex justify-between items-center">
          <div><h3 className="text-2xl font-black text-gray-900">Katalog & Inventaris Barang 📚</h3><p className="text-xs text-gray-500">Kelola buku, seragam, dan logistik bimbel.</p></div>
          {adminView && <button onClick={() => setShowTambahBarangModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-5 py-3 rounded-2xl text-xs shadow-lg transition">+ Tambah Barang</button>}
        </div>
        
        {showTambahBarangModal && adminView && (
          <form onSubmit={handleTambahModul} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 animate-fade-in">
            <input type="text" placeholder="Nama Barang" required value={formModul.nama_barang} onChange={e => setFormModul({...formModul, nama_barang: e.target.value})} className="border p-3 rounded-xl col-span-2 text-sm bg-white font-bold" />
            <select value={formModul.kategori} onChange={e => setFormModul({...formModul, kategori: e.target.value})} className="border p-3 rounded-xl bg-white text-sm font-bold"><option value="Buku">Buku</option><option value="Seragam">Seragam</option><option value="Logistik">Logistik</option></select>
            <input type="number" placeholder="Stok" required value={formModul.stok} onChange={e => setFormModul({...formModul, stok: Number(e.target.value)})} className="border p-3 rounded-xl text-sm font-bold bg-white text-emerald-700" />
            <div className="md:col-span-4 flex justify-end space-x-2"><button type="button" onClick={() => setShowTambahBarangModal(false)} className="px-4 py-2 bg-gray-200 rounded-xl text-xs font-bold">Batal</button><button type="submit" className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow">Simpan Barang</button></div>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {daftarInventaris.map(b => (
            <div key={b.id} className="border border-gray-100 p-5 rounded-3xl bg-white shadow-sm flex flex-col justify-between hover:shadow-md transition">
              <div><span className="text-[10px] uppercase font-black bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full">{b.kategori}</span><h5 className="font-black text-gray-900 mt-3 text-base">{b.nama_barang}</h5></div>
              <p className="text-sm font-black text-emerald-700 mt-6 bg-emerald-50/50 p-3 rounded-2xl text-center">Stok Tersedia: {b.stok}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }
}
