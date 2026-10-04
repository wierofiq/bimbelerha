import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Inisialisasi Supabase Client
'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6aWZ3cHZpcXB5eGF1YWZkbGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NDA2ODYsImV4cCI6MjEwNjUxNjY4Nn0.XpJEgQ3vpGOYmPVi-nsjrSRJI9RfR5kWTN_XsL-TCUU';
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

  // Navigasi Admin & Guru
  const [adminTab, setAdminTab] = useState('siswa'); 
  const [siswaSubTab, setSiswaSubTab] = useState('data'); 
  const [mentorSubTab, setMentorSubTab] = useState('daftar'); 
  const [guruTab, setGuruTab] = useState('beranda'); 

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
  
  // Konfigurasi Web & Section Landing Page (Selalu Ada Fallback)
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

  // UI & Filter States
  const [showLoginModal, setShowLoginModal] = useState(false);
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
    } catch(err) { 
      // Tetap gunakan default state jika tabel belum ada di Supabase
    }
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
    else { setShowLoginModal(false); determineUserRoleAndProfile(data.user); setLoginEmail(''); setLoginPassword(''); }
    setLoading(false);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); setUser(null); setUserRole('guru'); setCurrentMentorProfile(null); };

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
      alert('✅ Pengaturan web berhasil diperbarui!');
      fetchPengaturanWeb();
    } catch(err) { alert(err.message); } finally { setLoading(false); }
  };

  const handleUpdateUrutanSection = async (sectionId, newUrutan, newStatus) => {
    try {
      await supabase.from('landing_sections').update({ urutan: newUrutan, is_aktif: newStatus }).eq('id', sectionId);
      setLandingSections(landingSections.map(sec => sec.id === sectionId ? { ...sec, urutan: newUrutan, is_aktif: newStatus } : sec));
    } catch(err) {
      alert('Gagal memperbarui urutan section: ' + err.message);
    }
  };

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
      alert('✅ Siswa berhasil ditambahkan!');
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
      alert('✅ Siswa disetujui!');
      setShowApproveModal(false);
      fetchAllData();
    } catch (err) { alert(err.message); } finally { setLoading(false); }
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
      alert('✅ Data diperbarui!');
      setShowEditSiswaModal(false);
      fetchAllData();
    } catch (err) { alert(err.message); } finally { setLoading(false); }
  };

  const handleHapusSiswa = async (siswaId, namaSiswa) => {
    if (!window.confirm(`Hapus data siswa "${namaSiswa}"?`)) return;
    try {
      const periodeIds = daftarPeriode.filter(p => p.siswa_id === siswaId).map(p => p.id);
      if (periodeIds.length > 0) { await supabase.from('presensi_siswa').delete().in('periode_id', periodeIds); }
      await supabase.from('pembayaran_siswa').delete().eq('siswa_id', siswaId);
      await supabase.from('periode_belajar').delete().eq('siswa_id', siswaId);
      await supabase.from('siswa').delete().eq('id', siswaId);
      alert('✅ Siswa dihapus.');
      fetchAllData();
    } catch (err) { alert(err.message); }
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
      alert('✅ Rollover berhasil!');
      fetchAllData();
    } catch (err) { alert(err.message); }
  };

  // MENTOR & DELEGASI
  const handleTambahMentor = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await supabase.auth.signUp({ email: newMentor.email, password: newMentor.password, options: { data: { role: 'guru' } } });
      await supabase.from('mentor').insert([newMentor]);
      alert('✅ Mentor berhasil ditambahkan!');
      setNewMentor({ nama_mentor: '', email: '', password: '', no_hp: '', alamat: '', honor_per_jam: 25000, status: 'aktif' });
      fetchAllData();
    } catch (err) { alert(err.message); } finally { setLoading(false); }
  };

  const handleToggleDelegasiMentor = async (mentorId, fieldKey, currentValue) => {
    await supabase.from('mentor').update({ [fieldKey]: !currentValue }).eq('id', mentorId);
    fetchAllData();
  };

  const handleTambahPresensiMentor = async (e) => {
    e.preventDefault();
    await supabase.from('presensi_mentor').insert([formPresensiMentor]);
    alert('✅ Presensi mentor tersimpan!');
    setFormPresensiMentor({ ...formPresensiMentor, total_jam: 0, kegiatan_pembelajaran: '' });
    fetchAllData();
  };

  const handleSimpanGaji = async (e) => {
    e.preventDefault();
    const mentorRec = daftarMentor.find(m => m.id === formGaji.mentor_id);
    const totalJam = daftarPresensiMentor.filter(pm => pm.mentor_id === formGaji.mentor_id && pm.tanggal?.startsWith(formGaji.bulan_periode)).reduce((acc, curr) => acc + (Number(curr.total_jam) || 0), 0);
    await supabase.from('penggajian_mentor').insert([{ ...formGaji, total_jam_mengajar: totalJam, honor_per_jam: mentorRec?.honor_per_jam || 25000, status_pembayaran: 'draft' }]);
    alert('✅ Slip gaji berhasil digenerate!');
    fetchAllData();
  };

  // PEMBAYARAN
  const handleCatatPembayaran = async (e) => {
    e.preventDefault();
    if (formPembayaran.items.length === 0) return alert('Pilih minimal 1 item!');
    const gabunganItems = formPembayaran.items.join(', ');
    await supabase.from('pembayaran_siswa').insert([{ siswa_id: formPembayaran.siswa_id, item_bayar: gabunganItems, jumlah_bayar: formPembayaran.total_bayar, tanggal_pembayaran: formPembayaran.tanggal_pembayaran, catatan: formPembayaran.catatan, status_pembayaran: 'lunas' }]);
    alert('✅ Pembayaran dicatat!');
    setFormPembayaran({ siswa_id: '', tanggal_pembayaran: new Date().toISOString().split('T')[0], items: [], total_bayar: 0, catatan: '' });
    fetchAllData();
  };

  const handleHapusPembayaran = async (id) => {
    if(!window.confirm('Hapus rekam pembayaran?')) return;
    await supabase.from('pembayaran_siswa').delete().eq('id', id);
    fetchAllData();
  };

  // INVENTARIS
  const handleTambahModul = async (e) => {
    e.preventDefault();
    await supabase.from('inventaris_logistik').insert([formModul]);
    alert('✅ Barang ditambahkan!');
    setFormModul({ nama_barang: '', kategori: 'Buku', stok: 0, harga_satuan: 0, deskripsi: '', thumbnail: '' });
    fetchAllData();
  };

  // KONTEN
  const handleSimpanKonten = async (e) => {
    e.preventDefault();
    await supabase.from('konten_publik').insert([{ mentor_id: currentMentorProfile?.id || null, ...formKonten }]);
    alert('✅ Konten dipublikasikan!');
    setFormKonten({ judul: '', tipe: 'artikel', isi: '', video_url: '' });
    fetchAllData();
  };

  const handleHapusKonten = async (id) => {
    if(!window.confirm('Hapus konten?')) return;
    await supabase.from('konten_publik').delete().eq('id', id);
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
    if (!newPresensiSiswa.periode_id) return alert('Pilih siswa dari daftar terlebih dahulu!');
    if (!currentMentorProfile || !currentMentorProfile.id) return alert('Sesi login mentor tidak valid. Silakan login ulang.');

    const { error } = await supabase.from('presensi_siswa').insert([{ 
      periode_id: newPresensiSiswa.periode_id, 
      mentor_id: currentMentorProfile.id, 
      pertemuan_ke: newPresensiSiswa.pertemuan_ke, 
      tanggal_pertemuan: newPresensiSiswa.tanggal_pertemuan, 
      is_hadir: newPresensiSiswa.status_kehadiran === 'Hadir', 
      jurnal_materi: `[${newPresensiSiswa.status_kehadiran}] ${newPresensiSiswa.jurnal_materi}` 
    }]);

    if (error) {
      alert('Gagal menyimpan presensi: ' + error.message);
      return;
    }

    const periodeObj = daftarPeriode.find(p => p.id === newPresensiSiswa.periode_id);
    if (periodeObj?.siswa?.no_hp && window.confirm('Presensi berhasil dicatat! Ingin kirim rekap ke WhatsApp Wali?')) {
      const wa = periodeObj.siswa.no_hp.replace(/^0/, '62');
      const text = `Laporan ErHa: ${periodeObj.siswa.nama_murid}, Sesi ${newPresensiSiswa.pertemuan_ke}. Materi: ${newPresensiSiswa.jurnal_materi} (${newPresensiSiswa.status_kehadiran})`;
      window.open(`https://wa.me/${wa}?text=${encodeURIComponent(text)}`, '_blank');
    } else {
      alert('✅ Presensi berhasil dicatat!');
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
    if (selectedPaket.length === 0) return alert('Pilih minimal satu paket!');
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
      setFormDaftar({ nama_murid: '', nama_orang_tua: '', no_hp: '', alamat: '', jenjang_sekolah: 'TK' });
      setSelectedPaket([]);
      fetchAllData();
    }
  };

  if (!appReady) return <div className="min-h-screen flex items-center justify-center font-bold text-[#581878]">Memuat Portal ErHa...</div>;

  return (
    <div className="min-h-screen bg-[#FFFDF0] font-sans text-gray-800 flex flex-col justify-between">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-[#581878] shadow-lg border-b-4 border-[#F59E0B]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src={pengaturanWeb.logo_url || "/logo.png"} alt="Logo" className="h-10 w-10 object-contain bg-white rounded-full p-1 shadow" />
            <div>
              <h1 className="text-white font-extrabold text-lg leading-none">Bimbel ErHa</h1>
              <p className="text-[#F59E0B] font-bold text-xs">Rumah Hebat</p>
            </div>
          </div>
          <div>
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-xs bg-amber-400 text-purple-950 font-black px-3 py-1 rounded-full uppercase hidden md:inline-block">
                  {userRole === 'admin' ? '👑 Admin' : `Guru: ${currentMentorProfile?.nama_mentor?.split(' ')[0] || ''}`}
                </span>
                <button onClick={handleLogout} className="bg-red-500 text-white font-bold py-1.5 px-4 rounded-full text-xs shadow">Keluar</button>
              </div>
            ) : (
              <button onClick={() => setShowLoginModal(true)} className="bg-purple-900 hover:bg-purple-950 text-white font-bold py-1.5 px-4 rounded-full text-sm shadow">🔐 Login Portal</button>
            )}
          </div>
        </div>
      </nav>

      {/* KONTEN UTAMA */}
      <main className="flex-grow">
        {user ? (
          <div className="max-w-7xl mx-auto px-4 py-8">
            {/* ======================================================= */}
            {/* PORTAL ADMIN                                            */}
            {/* ======================================================= */}
            {userRole === 'admin' && (
              <div>
                <div className="flex overflow-x-auto border-b-2 border-purple-200 mb-6 space-x-2 pb-1">
                  <button onClick={() => setAdminTab('siswa')} className={`py-2.5 px-5 font-extrabold rounded-t-xl text-sm whitespace-nowrap ${adminTab === 'siswa' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600'}`}>📋 SISWA</button>
                  <button onClick={() => setAdminTab('mentor')} className={`py-2.5 px-5 font-extrabold rounded-t-xl text-sm whitespace-nowrap ${adminTab === 'mentor' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600'}`}>👩‍🏫 MENTOR</button>
                  <button onClick={() => setAdminTab('pembayaran')} className={`py-2.5 px-5 font-extrabold rounded-t-xl text-sm whitespace-nowrap ${adminTab === 'pembayaran' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600'}`}>💵 PEMBAYARAN</button>
                  <button onClick={() => setAdminTab('modul')} className={`py-2.5 px-5 font-extrabold rounded-t-xl text-sm whitespace-nowrap ${adminTab === 'modul' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600'}`}>📚 INVENTARIS</button>
                  <button onClick={() => setAdminTab('setup_web')} className={`py-2.5 px-5 font-extrabold rounded-t-xl text-sm whitespace-nowrap ${adminTab === 'setup_web' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600'}`}>⚙️ SETUP & KONTEN</button>
                </div>

                {/* TAB SETUP WEB & URUTAN LANDING PAGE */}
                {adminTab === 'setup_web' && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-purple-100 max-w-2xl mx-auto">
                      <h3 className="text-lg font-bold text-[#581878] mb-4">Live Edit Pengaturan Halaman Utama</h3>
                      <form onSubmit={handleSimpanPengaturanWeb} className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-gray-600 block mb-1">Judul Utama:</label>
                          <input type="text" value={pengaturanWeb.judul_utama} onChange={e => setPengaturanWeb({...pengaturanWeb, judul_utama: e.target.value})} className="border p-3 rounded-xl w-full text-sm" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-600 block mb-1">Sub-Judul:</label>
                          <input type="text" value={pengaturanWeb.sub_judul} onChange={e => setPengaturanWeb({...pengaturanWeb, sub_judul: e.target.value})} className="border p-3 rounded-xl w-full text-sm" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-600 block mb-1">URL Logo Web:</label>
                          <input type="text" value={pengaturanWeb.logo_url} onChange={e => setPengaturanWeb({...pengaturanWeb, logo_url: e.target.value})} className="border p-3 rounded-xl w-full text-sm" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-600 block mb-1">No WhatsApp Admin:</label>
                          <input type="text" value={pengaturanWeb.no_admin_wa} onChange={e => setPengaturanWeb({...pengaturanWeb, no_admin_wa: e.target.value})} className="border p-3 rounded-xl w-full text-sm" />
                        </div>
                        <button type="submit" className="w-full bg-[#581878] text-white font-bold py-3 rounded-xl shadow">Simpan Perubahan Web</button>
                      </form>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-purple-100 max-w-2xl mx-auto">
                      <h3 className="text-lg font-bold text-[#581878] mb-2">Pengaturan Urutan & Visibilitas Landing Page</h3>
                      <p className="text-xs text-gray-500 mb-4">Atur nomor urut dan status aktif untuk menampilkan atau menyembunyikan blok di halaman utama.</p>
                      <div className="space-y-3">
                        {landingSections.map(sec => (
                          <div key={sec.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border">
                            <div>
                              <span className="font-bold text-gray-900">{sec.nama_section}</span>
                              <span className="text-xs text-gray-500 block">Key: {sec.section_key}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <label className="text-xs font-bold flex items-center cursor-pointer">
                                <input type="checkbox" checked={sec.is_aktif} onChange={(e) => handleUpdateUrutanSection(sec.id, sec.urutan, e.target.checked)} className="mr-1.5 w-4 h-4 accent-purple-700" /> Tampil
                              </label>
                              <input 
                                type="number" 
                                value={sec.urutan} 
                                onChange={(e) => handleUpdateUrutanSection(sec.id, parseInt(e.target.value) || 0, sec.is_aktif)} 
                                className="w-16 border p-2 rounded-lg text-center font-bold text-sm bg-white" 
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-purple-100 max-w-2xl mx-auto">
                      <h3 className="text-lg font-bold text-[#581878] mb-4">Publikasi Artikel & Video Edukasi</h3>
                      <form onSubmit={handleSimpanKonten} className="space-y-4">
                        <input type="text" placeholder="Judul Artikel / Video" required value={formKonten.judul} onChange={e => setFormKonten({...formKonten, judul: e.target.value})} className="border p-3 rounded-xl w-full text-sm" />
                        <select value={formKonten.tipe} onChange={e => setFormKonten({...formKonten, tipe: e.target.value})} className="border p-3 rounded-xl w-full text-sm bg-white font-bold"><option value="artikel">📝 Artikel</option><option value="video">🎥 Video YouTube</option></select>
                        <input type="text" placeholder="URL Video YouTube" value={formKonten.video_url} onChange={e => setFormKonten({...formKonten, video_url: e.target.value})} className="border p-3 rounded-xl w-full text-sm" />
                        <textarea placeholder="Isi Konten..." required value={formKonten.isi} onChange={e => setFormKonten({...formKonten, isi: e.target.value})} className="border p-3 rounded-xl w-full text-sm" rows="3" />
                        <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl shadow">Terbitkan Konten</button>
                      </form>
                      <div className="mt-6 space-y-3">
                        {daftarKonten.map(k => (
                          <div key={k.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border">
                            <div><span className="font-bold text-[#581878]">{k.judul}</span><span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded ml-2 uppercase">{k.tipe}</span></div>
                            <button onClick={() => handleHapusKonten(k.id)} className="bg-red-100 text-red-700 px-3 py-1 rounded text-xs font-bold">Hapus</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB SISWA */}
                {adminTab === 'siswa' && (
                  <div className="space-y-6">
                    <div className="flex space-x-2 border-b pb-3 overflow-x-auto">
                      <button onClick={() => setSiswaSubTab('persetujuan')} className={`px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap ${siswaSubTab === 'persetujuan' ? 'bg-amber-400 text-purple-950' : 'bg-white'}`}>Persetujuan Baru</button>
                      <button onClick={() => setSiswaSubTab('data')} className={`px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap ${siswaSubTab === 'data' ? 'bg-purple-900 text-white' : 'bg-white'}`}>Data & Bar Progress</button>
                      <button onClick={() => setSiswaSubTab('tambah_manual')} className={`px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap ${siswaSubTab === 'tambah_manual' ? 'bg-purple-900 text-white' : 'bg-white'}`}>+ Tambah Manual</button>
                      <button onClick={() => setSiswaSubTab('presensi')} className={`px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap ${siswaSubTab === 'presensi' ? 'bg-purple-900 text-white' : 'bg-white'}`}>Rekap Presensi</button>
                    </div>

                    {siswaSubTab === 'persetujuan' && (
                      <div className="bg-white rounded-2xl p-6 shadow-md border">
                        <h3 className="text-lg font-bold text-[#581878] mb-4">Persetujuan Siswa Online</h3>
                        <table className="w-full text-left text-sm">
                          <thead className="bg-purple-50"><tr><th className="p-3">Nama</th><th className="p-3">Wali</th><th className="p-3 text-center">Aksi</th></tr></thead>
                          <tbody>
                            {daftarSiswa.filter(s => s.status === 'pending').map(s => (
                              <tr key={s.id} className="border-b"><td className="p-3 font-bold">{s.nama_murid}</td><td className="p-3">{s.nama_orang_tua}</td><td className="p-3 text-center"><button onClick={() => openApproveModal(s)} className="bg-emerald-600 text-white px-3 py-1.5 rounded text-xs font-bold">✓ Setujui</button></td></tr>
                            ))}
                            {daftarSiswa.filter(s => s.status === 'pending').length === 0 && (
                              <tr><td colSpan="3" className="text-center p-6 text-gray-400 italic">Tidak ada pendaftaran pending.</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {siswaSubTab === 'tambah_manual' && (
                      <div className="bg-white rounded-2xl p-6 shadow-md border max-w-xl mx-auto">
                        <h3 className="text-lg font-bold text-[#581878] mb-4">Tambah Siswa Internal</h3>
                        <form onSubmit={handleTambahSiswaManual} className="space-y-4">
                          <input type="text" placeholder="Nama Murid" required value={formSiswaManual.nama_murid} onChange={e => setFormSiswaManual({...formSiswaManual, nama_murid: e.target.value})} className="border p-3 rounded-xl w-full text-sm" />
                          <input type="text" placeholder="Nama Wali" required value={formSiswaManual.nama_orang_tua} onChange={e => setFormSiswaManual({...formSiswaManual, nama_orang_tua: e.target.value})} className="border p-3 rounded-xl w-full text-sm" />
                          <input type="text" placeholder="No HP Wali" value={formSiswaManual.no_hp} onChange={e => setFormSiswaManual({...formSiswaManual, no_hp: e.target.value})} className="border p-3 rounded-xl w-full text-sm" />
                          <div className="grid grid-cols-2 gap-2">
                            <input type="month" required value={formSiswaManual.bulan_periode} onChange={e => setFormSiswaManual({...formSiswaManual, bulan_periode: e.target.value})} className="border p-3 rounded-xl text-sm" />
                            <select value={formSiswaManual.jenjang_sekolah} onChange={e => setFormSiswaManual({...formSiswaManual, jenjang_sekolah: e.target.value})} className="border p-3 rounded-xl text-sm bg-white"><option value="TK">TK</option><option value="SD">SD</option><option value="SMP">SMP</option></select>
                          </div>
                          <div className="border p-3 rounded-xl bg-gray-50">
                            <p className="text-xs font-bold mb-2 text-[#581878]">Pilih Paket:</p>
                            {paketList.map(p => (
                              <label key={p.id} className="text-sm block mb-1"><input type="checkbox" className="mr-2" onChange={e => e.target.checked ? setSelectedPaketManual([...selectedPaketManual, p.id]) : setSelectedPaketManual(selectedPaketManual.filter(id => id !== p.id))} /> {p.nama_paket}</label>
                            ))}
                          </div>
                          <button type="submit" className="w-full bg-[#581878] text-white py-3 rounded-xl font-bold shadow">Simpan Siswa</button>
                        </form>
                      </div>
                    )}

                    {siswaSubTab === 'data' && (
                      <div className="bg-white rounded-2xl p-6 shadow-md border">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-bold text-[#581878]">Data Siswa Aktif & Progress Sesi 12 Pertemuan</h3>
                          <button onClick={() => window.print()} className="bg-gray-800 text-white text-xs font-bold px-4 py-2 rounded-xl">🖨️ Cetak PDF</button>
                        </div>
                        <table className="w-full text-left text-sm">
                          <thead className="bg-purple-50"><tr><th className="p-3">Siswa & Progress</th><th className="p-3 text-center">Aksi</th></tr></thead>
                          <tbody>
                            {daftarSiswa.filter(s => s.status === 'aktif').map(s => {
                              const periodeAktif = daftarPeriode.find(p => p.siswa_id === s.id && p.status_periode === 'berjalan');
                              const count = periodeAktif ? daftarPresensiSiswa.filter(ps => ps.periode_id === periodeAktif.id).length : 0;
                              const percent = Math.min(Math.round((count / 12) * 100), 100);
                              return (
                                <tr key={s.id} className="border-b">
                                  <td className="p-3">
                                    <div className="flex justify-between font-bold mb-1"><span>{s.nama_murid}</span><span>{count}/12 Sesi</span></div>
                                    <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${percent}%` }}></div></div>
                                  </td>
                                  <td className="p-3 text-center space-x-1">
                                    {count >= 12 && <button onClick={() => handleRolloverPeriode(periodeAktif)} className="bg-amber-500 text-white px-2 py-1 rounded text-xs font-bold animate-bounce">Rollover</button>}
                                    <button onClick={() => openEditSiswaModal(s)} className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-bold">Edit</button>
                                    <button onClick={() => handleHapusSiswa(s.id, s.nama_murid)} className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">Hapus</button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {siswaSubTab === 'presensi' && (
                      <div className="bg-white rounded-2xl p-6 shadow-md border">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-bold text-[#581878]">Rekap Presensi Siswa Global</h3>
                          <input type="month" value={filterBulanPresensi} onChange={e => setFilterBulanPresensi(e.target.value)} className="border px-3 py-1.5 rounded-xl text-sm" />
                        </div>
                        <table className="w-full text-left text-sm">
                          <thead className="bg-purple-50"><tr><th className="p-3">Tanggal</th><th className="p-3">Siswa</th><th className="p-3">Mentor</th><th className="p-3">Sesi</th><th className="p-3">Jurnal</th></tr></thead>
                          <tbody>
                            {daftarPresensiSiswa.filter(ps => filterBulanPresensi ? ps.tanggal_pertemuan?.startsWith(filterBulanPresensi) : true).map(ps => (
                              <tr key={ps.id} className="border-b">
                                <td className="p-3">{formatTanggalIndo(ps.tanggal_pertemuan)}</td>
                                <td className="p-3 font-bold">{ps.periode_belajar?.siswa?.nama_murid}</td>
                                <td className="p-3 text-purple-900 font-bold">{ps.mentor?.nama_mentor}</td>
                                <td className="p-3 text-center font-bold">{ps.pertemuan_ke}</td>
                                <td className="p-3 text-gray-600">{ps.jurnal_materi}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB MENTOR */}
                {adminTab === 'mentor' && (
                  <div className="space-y-6">
                    <div className="flex space-x-2 border-b pb-3 overflow-x-auto">
                      <button onClick={() => setMentorSubTab('daftar')} className={`px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap ${mentorSubTab === 'daftar' ? 'bg-purple-900 text-white' : 'bg-white'}`}>Daftar & Delegasi</button>
                      <button onClick={() => setMentorSubTab('tambah')} className={`px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap ${mentorSubTab === 'tambah' ? 'bg-purple-900 text-white' : 'bg-white'}`}>+ Tambah Mentor</button>
                      <button onClick={() => setMentorSubTab('presensi')} className={`px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap ${mentorSubTab === 'presensi' ? 'bg-purple-900 text-white' : 'bg-white'}`}>Presensi Mentor</button>
                      <button onClick={() => setMentorSubTab('penggajian')} className={`px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap ${mentorSubTab === 'penggajian' ? 'bg-purple-900 text-white' : 'bg-white'}`}>Hitung Payroll</button>
                    </div>

                    {mentorSubTab === 'daftar' && (
                      <div className="bg-white rounded-2xl p-6 shadow-md border">
                        <h3 className="text-lg font-bold text-[#581878] mb-4">Manajemen Mentor & Hak Delegasi</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {daftarMentor.map(m => (
                            <div key={m.id} className="border p-4 rounded-xl bg-gray-50 flex justify-between items-center">
                              <div><h5 className="font-bold">{m.nama_mentor}</h5><p className="text-xs text-gray-500">{m.email}</p></div>
                              <div className="space-y-1 text-right">
                                <label className="text-[10px] font-bold block cursor-pointer"><input type="checkbox" checked={!!m.akses_inventaris} onChange={() => handleToggleDelegasiMentor(m.id, 'akses_inventaris', m.akses_inventaris)} className="mr-1" /> Inv</label>
                                <label className="text-[10px] font-bold block cursor-pointer"><input type="checkbox" checked={!!m.akses_konten} onChange={() => handleToggleDelegasiMentor(m.id, 'akses_konten', m.akses_konten)} className="mr-1" /> Konten</label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {mentorSubTab === 'tambah' && (
                      <div className="bg-white rounded-2xl p-6 shadow-md border max-w-xl mx-auto">
                        <h3 className="text-lg font-bold text-[#581878] mb-4">Pendaftaran Mentor Baru</h3>
                        <form onSubmit={handleTambahMentor} className="space-y-4">
                          <input type="text" placeholder="Nama Lengkap" required value={newMentor.nama_mentor} onChange={e => setNewMentor({...newMentor, nama_mentor: e.target.value})} className="border p-3 rounded-xl w-full text-sm" />
                          <input type="email" placeholder="Email Login" required value={newMentor.email} onChange={e => setNewMentor({...newMentor, email: e.target.value})} className="border p-3 rounded-xl w-full text-sm" />
                          <input type="password" placeholder="Password (Min 6 karakter)" required value={newMentor.password} onChange={e => setNewMentor({...newMentor, password: e.target.value})} className="border p-3 rounded-xl w-full text-sm" />
                          <input type="text" placeholder="No WhatsApp" required value={newMentor.no_hp} onChange={e => setNewMentor({...newMentor, no_hp: e.target.value})} className="border p-3 rounded-xl w-full text-sm" />
                          <input type="number" placeholder="Tarif Honor per Jam" required value={newMentor.honor_per_jam} onChange={e => setNewMentor({...newMentor, honor_per_jam: Number(e.target.value)})} className="border p-3 rounded-xl w-full text-sm bg-amber-50 font-bold" />
                          <button type="submit" className="w-full bg-[#581878] text-white py-3 rounded-xl font-bold shadow">Simpan Mentor</button>
                        </form>
                      </div>
                    )}

                    {mentorSubTab === 'presensi' && (
                      <div className="bg-white rounded-2xl p-6 shadow-md border space-y-4">
                        <h3 className="text-lg font-bold text-[#581878]">Input Total Jam Kerja Mentor</h3>
                        <form onSubmit={handleTambahPresensiMentor} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl">
                          <select required value={formPresensiMentor.mentor_id} onChange={e => setFormPresensiMentor({...formPresensiMentor, mentor_id: e.target.value})} className="border p-3 rounded-xl bg-white text-sm"><option value="">-- Pilih Mentor --</option>{daftarMentor.map(m => <option key={m.id} value={m.id}>{m.nama_mentor}</option>)}</select>
                          <input type="date" required value={formPresensiMentor.tanggal} onChange={e => setFormPresensiMentor({...formPresensiMentor, tanggal: e.target.value})} className="border p-3 rounded-xl text-sm" />
                          <input type="number" step="0.5" placeholder="Total Jam" required value={formPresensiMentor.total_jam} onChange={e => setFormPresensiMentor({...formPresensiMentor, total_jam: parseFloat(e.target.value)})} className="border p-3 rounded-xl text-sm font-bold" />
                          <button type="submit" className="bg-[#581878] text-white py-3 rounded-xl font-bold shadow">Simpan Jam</button>
                        </form>
                      </div>
                    )}

                    {mentorSubTab === 'penggajian' && (
                      <div className="bg-white rounded-2xl p-6 shadow-md border space-y-4">
                        <h3 className="text-lg font-bold text-[#581878]">Kalkulator Payroll / Gaji</h3>
                        <form onSubmit={handleSimpanGaji} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl">
                          <select required value={formGaji.mentor_id} onChange={e => setFormGaji({...formGaji, mentor_id: e.target.value})} className="border p-3 rounded-xl bg-white text-sm"><option value="">-- Pilih Mentor --</option>{daftarMentor.map(m => <option key={m.id} value={m.id}>{m.nama_mentor}</option>)}</select>
                          <input type="month" required value={formGaji.bulan_periode} onChange={e => setFormGaji({...formGaji, bulan_periode: e.target.value})} className="border p-3 rounded-xl text-sm" />
                          <button type="submit" className="bg-emerald-600 text-white py-3 rounded-xl font-bold shadow">Generate Slip Gaji</button>
                        </form>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB PEMBAYARAN */}
                {adminTab === 'pembayaran' && (
                  <div className="bg-white rounded-2xl p-6 shadow-md border space-y-6">
                    <h3 className="text-lg font-bold text-[#581878]">Catat Penerimaan Pembayaran</h3>
                    <form onSubmit={handleCatatPembayaran} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border">
                      <select required value={formPembayaran.siswa_id} onChange={e => setFormPembayaran({...formPembayaran, siswa_id: e.target.value})} className="border p-3 rounded-xl text-sm bg-white"><option value="">-- Pilih Siswa --</option>{daftarSiswa.map(s => <option key={s.id} value={s.id}>{s.nama_murid}</option>)}</select>
                      <input type="number" placeholder="Nominal (Rp)" required value={formPembayaran.total_bayar} onChange={e => setFormPembayaran({...formPembayaran, total_bayar: Number(e.target.value)})} className="border p-3 rounded-xl text-sm font-bold bg-emerald-50 text-emerald-800" />
                      <div className="md:col-span-2 border p-3 rounded-xl bg-white">
                        <p className="text-xs font-bold mb-2">Item Pembayaran:</p>
                        <div className="grid grid-cols-3 gap-2">
                          {paymentItemOptions.map(item => (
                            <label key={item} className="text-xs flex items-center cursor-pointer"><input type="checkbox" className="mr-1.5" onChange={e => e.target.checked ? setFormPembayaran({...formPembayaran, items: [...formPembayaran.items, item]}) : setFormPembayaran({...formPembayaran, items: formPembayaran.items.filter(i => i !== item)}) } /> {item}</label>
                          ))}
                        </div>
                      </div>
                      <button type="submit" className="md:col-span-2 bg-[#581878] text-white py-3 rounded-xl font-bold shadow">Simpan Pembayaran</button>
                    </form>
                    <table className="w-full text-left text-sm">
                      <thead className="bg-purple-50"><tr><th className="p-3">Tanggal</th><th className="p-3">Siswa</th><th className="p-3">Item</th><th className="p-3">Nominal</th><th className="p-3 text-center">Aksi</th></tr></thead>
                      <tbody>
                        {daftarPembayaran.map(pb => (
                          <tr key={pb.id} className="border-b"><td className="p-3">{formatTanggalIndo(pb.tanggal_pembayaran)}</td><td className="p-3 font-bold">{pb.siswa?.nama_murid}</td><td className="p-3">{pb.item_bayar}</td><td className="p-3 text-emerald-600 font-bold">Rp {Number(pb.jumlah_bayar).toLocaleString('id-ID')}</td><td className="p-3 text-center"><button onClick={() => handleHapusPembayaran(pb.id)} className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">Hapus</button></td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* TAB INVENTARIS */}
                {adminTab === 'modul' && <ModulManager adminView={true} />}
              </div>
            )}

            {/* ======================================================= */}
            {/* PORTAL GURU                                             */}
            {/* ======================================================= */}
            {userRole === 'guru' && (
              <div className="space-y-6">
                <div className="flex border-b pb-2 space-x-2">
                  <button onClick={() => setGuruTab('beranda')} className={`px-4 py-2 rounded-t font-bold text-sm ${guruTab === 'beranda' ? 'bg-[#581878] text-white' : 'bg-white'}`}>Beranda</button>
                  <button onClick={() => setGuruTab('presensi')} className={`px-4 py-2 rounded-t font-bold text-sm ${guruTab === 'presensi' ? 'bg-[#581878] text-white' : 'bg-white'}`}>Presensi Harian</button>
                  {currentMentorProfile?.akses_konten && <button onClick={() => setGuruTab('konten')} className={`px-4 py-2 rounded-t font-bold text-sm ${guruTab === 'konten' ? 'bg-[#581878] text-white' : 'bg-white'}`}>Konten</button>}
                  <button onClick={() => setGuruTab('modul')} className={`px-4 py-2 rounded-t font-bold text-sm ${guruTab === 'modul' ? 'bg-[#581878] text-white' : 'bg-white'}`}>Inventaris</button>
                </div>

                {guruTab === 'beranda' && (
                  <div className="bg-gradient-to-r from-purple-800 to-indigo-900 text-white p-6 rounded-3xl shadow">
                    <h2 className="text-3xl font-black">Halo, {currentMentorProfile?.nama_mentor || 'Pengajar'} 👋</h2>
                    <p className="text-amber-300 text-sm mt-2">Tarif Mengajar: Rp {(currentMentorProfile?.honor_per_jam || 0).toLocaleString('id-ID')} / Jam</p>
                  </div>
                )}

                {guruTab === 'presensi' && (
                  <div className="bg-white p-6 rounded-2xl shadow-md border max-w-xl mx-auto">
                    <h3 className="text-lg font-bold text-[#581878] mb-4">Catat Presensi Kelas Hari Ini</h3>
                    <form onSubmit={handleTambahPresensiSiswa} className="space-y-4">
                      <div className="relative">
                        <label className="text-xs font-bold text-gray-600 mb-1 block">Cari / Pilih Siswa Aktif:</label>
                        <input 
                          type="text" 
                          placeholder="Ketik nama siswa aktif..." 
                          value={searchSiswaPresensi} 
                          onFocus={() => setIsDropdownPresensiOpen(true)} 
                          onChange={e => { 
                            setSearchSiswaPresensi(e.target.value); 
                            setIsDropdownPresensiOpen(true); 
                            setNewPresensiSiswa(prev => ({...prev, periode_id: ''})); 
                          }} 
                          className="w-full border p-3 rounded-xl text-sm outline-none focus:border-purple-600" 
                        />
                        {isDropdownPresensiOpen && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-purple-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                            {daftarPeriode
                              .filter(p => p.siswa?.status === 'aktif' && p.status_periode === 'berjalan')
                              .filter(p => p.siswa?.nama_murid?.toLowerCase().includes((searchSiswaPresensi || '').toLowerCase()))
                              .map(p => (
                                <div 
                                  key={p.id} 
                                  onClick={() => handlePilihSiswaPresensi(p)} 
                                  className="p-3 cursor-pointer hover:bg-purple-50 border-b text-sm font-bold text-[#581878]"
                                >
                                  {p.siswa?.nama_murid} <span className="text-xs font-normal text-gray-500">({p.paket_belajar?.nama_paket})</span>
                                </div>
                              ))}
                            {daftarPeriode.filter(p => p.siswa?.status === 'aktif' && p.status_periode === 'berjalan').length === 0 && (
                              <div className="p-3 text-xs text-gray-400 italic">Tidak ada siswa aktif saat ini.</div>
                            )}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-xs font-bold text-gray-600 mb-1 block">Pertemuan Ke-:</label>
                        <input type="text" readOnly value={`Sesi Ke- ${newPresensiSiswa.pertemuan_ke}`} className="border p-3 rounded-xl w-full bg-gray-100 font-bold text-center text-sm text-[#581878]" />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-gray-600 mb-1 block">Tanggal Pertemuan:</label>
                        <input type="date" required value={newPresensiSiswa.tanggal_pertemuan} onChange={e => setNewPresensiSiswa({...newPresensiSiswa, tanggal_pertemuan: e.target.value})} className="border p-3 rounded-xl w-full text-sm" />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-gray-600 mb-1 block">Status Kehadiran:</label>
                        <select value={newPresensiSiswa.status_kehadiran} onChange={e => setNewPresensiSiswa({...newPresensiSiswa, status_kehadiran: e.target.value})} className="border p-3 rounded-xl w-full text-sm font-bold bg-white">
                          <option value="Hadir">✅ Hadir</option>
                          <option value="Izin">📩 Izin</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-gray-600 mb-1 block">Jurnal Materi:</label>
                        <input type="text" placeholder="Contoh: Pecahan Senilai & Latihan Soal..." required value={newPresensiSiswa.jurnal_materi} onChange={e => setNewPresensiSiswa({...newPresensiSiswa, jurnal_materi: e.target.value})} className="border p-3 rounded-xl w-full text-sm" />
                      </div>

                      <button type="submit" className="w-full bg-[#581878] hover:bg-purple-900 text-white py-3 rounded-xl font-bold shadow transition">Simpan Presensi 🚀</button>
                    </form>
                  </div>
                )}

                {guruTab === 'konten' && currentMentorProfile?.akses_konten && (
                  <div className="bg-white p-6 rounded-2xl shadow-md border max-w-xl mx-auto">
                    <h3 className="text-lg font-bold text-[#581878] mb-4">Buat Artikel / Video Publik</h3>
                    <form onSubmit={handleSimpanKonten} className="space-y-4">
                      <input type="text" placeholder="Judul" required value={formKonten.judul} onChange={e => setFormKonten({...formKonten, judul: e.target.value})} className="border p-3 rounded-xl w-full text-sm" />
                      <select value={formKonten.tipe} onChange={e => setFormKonten({...formKonten, tipe: e.target.value})} className="border p-3 rounded-xl w-full text-sm bg-white"><option value="artikel">Artikel</option><option value="video">Video YouTube</option></select>
                      <input type="text" placeholder="URL Video (Opsional)" value={formKonten.video_url} onChange={e => setFormKonten({...formKonten, video_url: e.target.value})} className="border p-3 rounded-xl w-full text-sm" />
                      <textarea placeholder="Isi..." required value={formKonten.isi} onChange={e => setFormKonten({...formKonten, isi: e.target.value})} className="border p-3 rounded-xl w-full text-sm" rows="3" />
                      <button type="submit" className="w-full bg-[#581878] text-white py-3 rounded-xl font-bold shadow">Publikasikan</button>
                    </form>
                  </div>
                )}

                {guruTab === 'modul' && <ModulManager adminView={currentMentorProfile?.akses_inventaris} />}
              </div>
            )}
          </div>
        ) : (
          /* ======================================================= */
          /* LANDING PAGE PUBLIK (DIJAMIN MUNCUL DENGAN FALLBACK AMAN) */
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
                    <section key={sec.id || 'hero'} className="bg-gradient-to-b from-[#581878] via-[#6B21A8] to-[#FFFDF0] text-white pt-16 pb-24 px-4 text-center">
                      <div className="max-w-4xl mx-auto">
                        <span className="inline-block bg-[#F59E0B] text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider mb-6 shadow">Bimbingan Belajar Ceria & Berprestasi 🚀</span>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-6">{pengaturanWeb.judul_utama}</h2>
                        <p className="text-lg text-purple-200">{pengaturanWeb.sub_judul}</p>
                      </div>
                    </section>
                  );
                }

                if (sec.section_key === 'tracking') {
                  return (
                    <section key={sec.id || 'tracking'} className="max-w-3xl mx-auto px-4 -mt-14 relative z-20">
                      <div className="bg-white rounded-3xl shadow-xl border-4 border-purple-200 p-8">
                        <h3 className="text-xl font-black text-[#581878] mb-2 text-center">🔍 Portal Cek Kehadiran Orang Tua</h3>
                        <p className="text-xs text-gray-500 text-center mb-6">Masukkan <strong>Nama Lengkap Siswa</strong> atau <strong>No WhatsApp Wali</strong> untuk melihat presensi.</p>
                        <form onSubmit={handleCekTrackingOrangTua} className="flex gap-3">
                          <input type="text" placeholder="Ketik Nama Siswa atau No HP..." value={trackingQuery} onChange={e => setTrackingQuery(e.target.value)} className="flex-1 border p-3 rounded-xl text-sm outline-none focus:border-purple-600" />
                          <button type="submit" className="bg-[#581878] text-white font-bold px-6 py-3 rounded-xl shadow text-sm">Cek Data</button>
                        </form>
                        {trackingError && <p className="text-red-500 text-xs font-bold mt-4 text-center bg-red-50 p-2 rounded">{trackingError}</p>}
                        
                        {trackingResult && (
                          <div className="mt-6 pt-6 border-t space-y-4">
                            <div className="bg-purple-50 p-4 rounded-xl">
                              <h4 className="font-extrabold text-[#581878] text-base">{trackingResult.siswa.nama_murid}</h4>
                              <p className="text-xs text-gray-600">Wali: {trackingResult.siswa.nama_orang_tua} | Status: <span className="text-emerald-600 font-bold uppercase">{trackingResult.siswa.status}</span></p>
                              {trackingResult.periode && <p className="text-xs text-gray-500 mt-1">Periode Aktif: {trackingResult.periode.bulan_periode} ({trackingResult.presensi.length}/12 Sesi)</p>}
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
                            <div key={paket.id} onClick={() => isSelected ? setSelectedPaket(selectedPaket.filter(p => p !== paket.id)) : setSelectedPaket([...selectedPaket, paket.id])} className={`cursor-pointer bg-white rounded-3xl p-8 shadow-xl relative ${isSelected ? 'border-4 border-[#F59E0B] -translate-y-2' : 'border-2 border-purple-50'}`}>
                              {isSelected && <div className="absolute top-0 right-0 bg-[#F59E0B] text-white text-xs font-black px-4 py-1 rounded-bl-xl">✓ Terpilih</div>}
                              <h4 className="text-2xl font-black text-gray-900 mb-4">{paket.nama_paket}</h4>
                              <p className="text-gray-600 text-sm mb-6">{paket.deskripsi}</p>
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
                          <div key={k.id} className="bg-white p-6 rounded-3xl shadow border">
                            <span className="text-[10px] font-black uppercase bg-purple-100 text-purple-800 px-2 py-1 rounded">{k.tipe}</span>
                            <h4 className="text-xl font-bold text-gray-900 mt-2 mb-2">{k.judul}</h4>
                            <p className="text-xs text-gray-600">{k.isi}</p>
                          </div>
                        ))}
                        {(!daftarKonten || daftarKonten.length === 0) && <div className="col-span-full text-center py-6 text-gray-400 bg-white rounded-3xl border">Belum ada konten publik yang dipublikasikan.</div>}
                      </div>
                    </section>
                  );
                }

                if (sec.section_key === 'pendaftaran') {
                  return (
                    <section key={sec.id || 'pendaftaran'} className="max-w-3xl mx-auto px-4">
                      <div className="bg-white rounded-[2rem] shadow-2xl p-8 md:p-12 border-4 border-white">
                        <div className="text-center mb-8"><h3 className="text-3xl font-black text-[#581878] mb-2">Pendaftaran Siswa Baru</h3></div>
                        <form onSubmit={handleDaftarSubmit} className="space-y-4">
                          <input type="text" placeholder="Nama Lengkap Murid" required value={formDaftar.nama_murid} onChange={e => setFormDaftar({...formDaftar, nama_murid: e.target.value})} className="w-full p-4 rounded-xl border text-sm bg-gray-50" />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" placeholder="Nama Wali" required value={formDaftar.nama_orang_tua} onChange={e => setFormDaftar({...formDaffar, nama_orang_tua: e.target.value})} className="w-full p-4 rounded-xl border text-sm bg-gray-50" />
                            <input type="tel" placeholder="No WhatsApp" required value={formDaftar.no_hp} onChange={e => setFormDaftar({...formDaftar, no_hp: e.target.value})} className="w-full p-4 rounded-xl border text-sm bg-gray-50" />
                          </div>
                          <textarea placeholder="Alamat Domisili" required value={formDaftar.alamat} onChange={e => setFormDaftar({...formDaftar, alamat: e.target.value})} className="w-full p-4 rounded-xl border text-sm bg-gray-50" rows="2" />
                          <button type="submit" disabled={loading} className="w-full py-4 bg-[#581878] text-white font-black rounded-2xl shadow-xl">Kirim Pendaftaran via WhatsApp 🚀</button>
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
      <footer className="bg-[#581878] text-white py-8 text-center border-t-4 border-[#F59E0B]">
        <p className="font-black text-lg">Bimbel ErHa (Rumah Hebat)</p>
        <p className="text-xs text-purple-300 mt-2">© {new Date().getFullYear()} Bimbel ErHa. All rights reserved.</p>
      </footer>

      {/* MODALS */}
      {showApproveModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="font-bold text-lg text-[#581878] mb-4">Setujui Siswa: {approveData.nama_murid}</h3>
            <form onSubmit={handleSimpanApproval} className="space-y-4">
              <input type="month" required value={approveData.bulan_periode} onChange={e => setApproveData({...approveData, bulan_periode: e.target.value})} className="w-full border p-3 rounded-xl text-sm" />
              <input type="date" required value={approveData.tanggal_mulai} onChange={e => setApproveData({...approveData, tanggal_mulai: e.target.value})} className="w-full border p-3 rounded-xl text-sm" />
              <input type="date" required value={approveData.tanggal_selesai} onChange={e => setApproveData({...approveData, tanggal_selesai: e.target.value})} className="w-full border p-3 rounded-xl text-sm" />
              <div className="flex justify-end space-x-2 pt-2"><button type="button" onClick={() => setShowApproveModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg text-sm font-bold">Batal</button><button type="submit" className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold">Setujui & Aktifkan</button></div>
            </form>
          </div>
        </div>
      )}

      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl relative">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-gray-400 font-bold">✕</button>
            <h3 className="text-2xl font-black text-[#581878] mb-4 text-center">Login Portal</h3>
            {loginError && <p className="text-red-500 text-xs font-bold text-center mb-3 bg-red-50 p-2 rounded">{loginError}</p>}
            <form onSubmit={handleLogin} className="space-y-4">
              <input type="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full px-4 py-3 border rounded-xl text-sm" placeholder="Email" />
              <input type="password" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full px-4 py-3 border rounded-xl text-sm" placeholder="Password" />
              <button type="submit" className="w-full py-4 bg-[#581878] text-[#F59E0B] font-black rounded-xl shadow">MASUK</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  function ModulManager({ adminView }) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-md border space-y-6">
        <h3 className="text-lg font-bold text-[#581878]">Katalog & Inventaris Barang</h3>
        {adminView && (
          <form onSubmit={handleTambahModul} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl border">
            <input type="text" placeholder="Nama Barang" required value={formModul.nama_barang} onChange={e => setFormModul({...formModul, nama_barang: e.target.value})} className="border p-3 rounded-xl col-span-2 text-sm" />
            <select value={formModul.kategori} onChange={e => setFormModul({...formModul, kategori: e.target.value})} className="border p-3 rounded-xl bg-white text-sm"><option value="Buku">Buku</option><option value="Seragam">Seragam</option><option value="Logistik">Logistik</option></select>
            <input type="number" placeholder="Stok" required value={formModul.stok} onChange={e => setFormModul({...formModul, stok: Number(e.target.value)})} className="border p-3 rounded-xl text-sm font-bold bg-emerald-50" />
            <button type="submit" className="md:col-span-4 bg-emerald-600 text-white py-3 rounded-xl font-bold shadow">Simpan Barang</button>
          </form>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {daftarInventaris.map(b => (
            <div key={b.id} className="border p-4 rounded-xl bg-white shadow-sm flex flex-col justify-between">
              <div><span className="text-[10px] uppercase font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded">{b.kategori}</span><h5 className="font-bold mt-2">{b.nama_barang}</h5></div>
              <p className="text-sm font-black text-emerald-700 mt-4">Stok: {b.stok}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }
}
