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
  const [appReady, setAppReady] = useState(false);

  // Navigasi Admin & Guru
  const [adminTab, setAdminTab] = useState('siswa'); 
  const [siswaSubTab, setSiswaSubTab] = useState('data'); 
  const [mentorSubTab, setMentorSubTab] = useState('daftar'); 
  const [modulSubTab, setModulSubTab] = useState('data_barang');
  const [guruTab, setGuruTab] = useState('beranda'); 

  // Master Data & Konfigurasi Web
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
  const [daftarKonten, setDaftarKonten] = useState([]);
  const [landingSections, setLandingSections] = useState([]);
  const [pengaturanWeb, setPengaturanWeb] = useState({ judul_utama: 'Rumah Belajar Ceria Bersama Bimbel ErHa', sub_judul: 'Bimbingan Belajar Ceria, Bersahabat & Berprestasi', logo_url: '', no_admin_wa: '6281915058297' });

  // UI & Filter States
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showEditPasswordModal, setShowEditPasswordModal] = useState(false);
  const [expandedSiswaId, setExpandedSiswaId] = useState(null);
  
  // Filter & Paging States
  const [filterBulanPresensi, setFilterBulanPresensi] = useState('');
  const [filterMentorPresensi, setFilterMentorPresensi] = useState('');
  const [searchSiswaBayar, setSearchSiswaBayar] = useState('');
  
  // State untuk Rekap Pembayaran (Admin)
  const [filterBulanPembayaran, setFilterBulanPembayaran] = useState(new Date().toISOString().slice(0, 7));
  const [currentPagePembayaran, setCurrentPagePembayaran] = useState(1);

  // Fitur Tracking Publik (Orang Tua - Berdasarkan Nama atau No HP)
  const [trackingQuery, setTrackingQuery] = useState('');
  const [trackingResult, setTrackingResult] = useState(null);
  const [trackingError, setTrackingError] = useState('');

  // Fitur Presensi Guru (Filter & Auto Increment)
  const [searchSiswaPresensi, setSearchSiswaPresensi] = useState(''); 
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
  
  // Form Konten Publik
  const [formKonten, setFormKonten] = useState({ judul: '', tipe: 'artikel', isi: '', video_url: '' });

  // ==========================================
  // UTILS (FORMAT TANGGAL)
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
    if (data && data.length > 0) {
      setPaketList(data);
    } else {
      // Starter Paket Default jika kosong
      setPaketList([
        { id: 1, nama_paket: 'Paket Regular SD', deskripsi: 'Bimbingan belajar intensif kurikulum merdeka untuk tingkat Sekolah Dasar.' },
        { id: 2, nama_paket: 'Paket Intensif SMP', deskripsi: 'Pendampingan khusus persiapan ujian dan penugasan harian SMP.' }
      ]);
    }
  }

  async function fetchPengaturanWeb() {
    try {
      const { data: settingData } = await supabase.from('pengaguran_web').select('*').eq('id', 1).single();
      if (settingData) setPengaturanWeb(settingData);

      const { data: secData } = await supabase.from('landing_sections').select('*').order('urutan', { ascending: true });
      if (secData && secData.length > 0) {
        setLandingSections(secData);
      } else {
        // Starter Sections Default
        setLandingSections([
          { id: 1, section_key: 'hero', nama_section: 'Banner Utama', urutan: 1, is_aktif: true },
          { id: 2, section_key: 'tracking', nama_section: 'Portal Cek Orang Tua', urutan: 2, is_aktif: true },
          { id: 3, section_key: 'paket', nama_section: 'Pilihan Paket Belajar', urutan: 3, is_aktif: true },
          { id: 4, section_key: 'konten', nama_section: 'Artikel & Video Edukasi', urutan: 4, is_aktif: true },
          { id: 5, section_key: 'pendaftaran', nama_section: 'Formulir Pendaftaran', urutan: 5, is_aktif: true }
        ]);
      }
    } catch(err) {
      // Fallback starter jika tabel belum ada
      setLandingSections([
        { id: 1, section_key: 'hero', nama_section: 'Banner Utama', urutan: 1, is_aktif: true },
        { id: 2, section_key: 'tracking', nama_section: 'Portal Cek Orang Tua', urutan: 2, is_aktif: true },
        { id: 3, section_key: 'paket', nama_section: 'Pilihan Paket Belajar', urutan: 3, is_aktif: true },
        { id: 4, section_key: 'konten', nama_section: 'Artikel & Video Edukasi', urutan: 4, is_aktif: true },
        { id: 5, section_key: 'pendaftaran', nama_section: 'Formulir Pendaftaran', urutan: 5, is_aktif: true }
      ]);
    }
  }

  async function fetchAllData() {
    const [siswa, mentor, periode, presensiS, pemb, presensiM, gaji, logistik, transaksi, konten] = await Promise.all([
      supabase.from('siswa').select('*').order('created_at', { ascending: false }),
      supabase.from('mentor').select('*').order('created_at', { ascending: false }),
      supabase.from('periode_belajar').select('*, siswa(nama_murid, status, no_hp), paket_belajar(nama_paket)').order('created_at', { ascending: false }),
      supabase.from('presensi_siswa').select('*, mentor(nama_mentor, id), periode_belajar(siswa(id, nama_murid, status), paket_belajar(nama_paket))').order('tanggal_pertemuan', { ascending: false }),
      supabase.from('pembayaran_siswa').select('*, siswa(nama_murid)').order('tanggal_pembayaran', { ascending: false }),
      supabase.from('presensi_mentor').select('*, mentor(nama_mentor)').order('tanggal', { ascending: false }),
      supabase.from('penggajian_mentor').select('*, mentor(nama_mentor, honor_per_jam)').order('created_at', { ascending: false }),
      supabase.from('inventaris_logistik').select('*').order('nama_barang', { ascending: true }),
      supabase.from('transaksi_logistik').select('*, inventaris_logistik(nama_barang, kategori)').order('created_at', { ascending: false }),
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
    if(transaksi.data) setDaftarTransaksiLogistik(transaksi.data);
    if(konten.data) setDaftarKonten(konten.data);
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

  const handleGantiPasswordGuru = async (e) => {
    e.preventDefault();
    if (!newPasswordGuru || newPasswordGuru.length < 6) return alert('Password minimal 6 karakter!');
    const { error } = await supabase.auth.updateUser({ password: newPasswordGuru });
    if (error) alert('Gagal mengubah password: ' + error.message);
    else { alert('✅ Password berhasil diperbarui!'); setShowEditPasswordModal(false); setNewPasswordGuru(''); }
  };

  // ==========================================
  // 4. HANDLERS - ADMIN & SETUP WEB
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
      alert('✅ Pengaturan web & logo berhasil diperbarui!');
      fetchPengaturanWeb();
    } catch(err) { alert(err.message); } finally { setLoading(false); }
  };

  const handleUpdateUrutanSection = async (sectionId, newUrutan, newStatus) => {
    await supabase.from('landing_sections').update({ urutan: newUrutan, is_aktif: newStatus }).eq('id', sectionId);
    fetchPengaturanWeb();
  };

  // ==========================================
  // 5. HANDLERS - ADMIN (SISWA)
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
      const { error: errPeriode } = await supabase.from('periode_belajar').insert(periodeInserts);
      if (errPeriode) alert('❌ Pembuatan periode gagal: ' + errPeriode.message);
      else alert('✅ Siswa manual dan periode tanggal berhasil ditambahkan!');
      
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
    if (!window.confirm(`Lakukan Rollover untuk ${periodeLama.siswa?.nama_murid}? Ini akan membuka periode baru 12 pertemuan.`)) return;
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
  // HANDLERS - MENTOR & DELEGASI
  // ==========================================
  const handleTambahMentor = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await supabase.auth.signUp({ email: newMentor.email, password: newMentor.password, options: { data: { role: 'guru' } } });
      const { error: errDb } = await supabase.from('mentor').insert([{ nama_mentor: newMentor.nama_mentor, email: newMentor.email, no_hp: newMentor.no_hp, alamat: newMentor.alamat, honor_per_jam: newMentor.honor_per_jam, status: newMentor.status }]);
      if (errDb) throw errDb;
      alert('✅ Mentor berhasil didaftarkan!');
      setNewMentor({ nama_mentor: '', email: '', password: '', no_hp: '', alamat: '', honor_per_jam: 25000, status: 'aktif' });
      fetchAllData();
    } catch (err) { alert('Gagal menambah mentor: ' + err.message); } finally { setLoading(false); }
  };

  const handleToggleDelegasiMentor = async (mentorId, fieldKey, currentValue) => {
    const { error } = await supabase.from('mentor').update({ [fieldKey]: !currentValue }).eq('id', mentorId);
    if (error) alert('Gagal memperbarui hak akses: ' + error.message);
    else { alert('✅ Hak akses delegasi berhasil diperbarui!'); fetchAllData(); }
  };

  const handleTambahPresensiMentor = async (e) => {
    e.preventDefault();
    await supabase.from('presensi_mentor').insert([formPresensiMentor]);
    alert('Presensi mentor tersimpan!');
    setFormPresensiMentor({ ...formPresensiMentor, total_jam: 0, kegiatan_pembelajaran: '' });
    fetchAllData();
  };

  const handleSimpanGaji = async (e) => {
    e.preventDefault();
    const mentorRec = daftarMentor.find(m => m.id === formGaji.mentor_id);
    const totalJam = daftarPresensiMentor.filter(pm => pm.mentor_id === formGaji.mentor_id && pm.tanggal?.startsWith(formGaji.bulan_periode)).reduce((acc, curr) => acc + (Number(curr.total_jam) || 0), 0);
    const honorJam = mentorRec?.honor_per_jam || 25000;
    await supabase.from('penggajian_mentor').insert([{ mentor_id: formGaji.mentor_id, bulan_periode: formGaji.bulan_periode, total_jam_mengajar: totalJam, honor_per_jam: honorJam, insentif: formGaji.insentif, bonus_kinerja: formGaji.bonus_kinerja, potongan: formGaji.potongan, catatan: formGaji.catatan, status_pembayaran: 'draft' }]);
    alert('✅ Rekap gaji bulanan berhasil digenerate!');
    fetchAllData();
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
  // HANDLERS - INVENTARIS & LOGISTIK
  // ==========================================
  const handleTambahModul = async (e) => {
    e.preventDefault();
    await supabase.from('inventaris_logistik').insert([formModul]);
    alert('✅ Barang/Modul ditambahkan ke inventaris!');
    setFormModul({ nama_barang: '', kategori: 'Buku', stok: 0, harga_satuan: 0, deskripsi: '', thumbnail: '' });
    fetchAllData();
  };

  const handleHapusModul = async (id) => {
    if(!window.confirm('Hapus item inventaris ini?')) return;
    await supabase.from('transaksi_logistik').delete().eq('barang_id', id);
    await supabase.from('inventaris_logistik').delete().eq('id', id);
    fetchAllData();
  };

  const handleSimpanTransaksiLogistik = async (e) => {
    e.preventDefault();
    const barang = daftarInventaris.find(b => b.id === formTransaksi.barang_id);
    if (!barang) return;
    if (formTransaksi.tipe_transaksi === 'keluar' && barang.stok < formTransaksi.jumlah) return alert('Stok tidak mencukupi!');
    
    await supabase.from('transaksi_logistik').insert([formTransaksi]);
    const stokBaru = formTransaksi.tipe_transaksi === 'masuk' ? barang.stok + formTransaksi.jumlah : barang.stok - formTransaksi.jumlah;
    await supabase.from('inventaris_logistik').update({ stok: stokBaru }).eq('id', barang.id);
    
    alert('✅ Mutasi stok berhasil dicatat!');
    setFormTransaksi({ barang_id: '', tipe_transaksi: 'masuk', jumlah: 1, keterangan: '' });
    fetchAllData();
  };

  // ==========================================
  // HANDLERS - KONTEN & VIDEO PUBLIK
  // ==========================================
  const handleSimpanKonten = async (e) => {
    e.preventDefault();
    const mentorId = currentMentorProfile ? currentMentorProfile.id : null;
    await supabase.from('konten_publik').insert([{
      mentor_id: mentorId,
      judul: formKonten.judul,
      tipe: formKonten.tipe,
      isi: formKonten.isi,
      video_url: formKonten.video_url
    }]);
    alert('✅ Konten / Video berhasil dipublikasikan!');
    setFormKonten({ judul: '', tipe: 'artikel', isi: '', video_url: '' });
    fetchAllData();
  };

  const handleHapusKonten = async (id) => {
    if(!window.confirm('Hapus konten publik ini?')) return;
    await supabase.from('konten_publik').delete().eq('id', id);
    fetchAllData();
  };

  // ==========================================
  // HANDLERS - GURU & TRACKING ORANG TUA
  // ==========================================
  const handleUpdateProfilGuru = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('mentor').update({ foto_url: currentMentorProfile.foto_url, no_hp: currentMentorProfile.no_hp, alamat: currentMentorProfile.alamat }).eq('id', currentMentorProfile.id);
    if (error) alert('Gagal memperbarui profil: ' + error.message);
    else { alert('✅ Profil berhasil diperbarui!'); fetchAllData(); }
  };

  const handlePilihSiswaPresensi = (periode) => {
    setSearchSiswaPresensi(`${periode.siswa?.nama_murid} (${periode.paket_belajar?.nama_paket})`);
    setIsDropdownPresensiOpen(false);
    
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

    const selectedPeriodeObj = daftarPeriode.find(p => p.id === newPresensiSiswa.periode_id);
    if (selectedPeriodeObj?.siswa?.no_hp) {
      const waWali = selectedPeriodeObj.siswa.no_hp.replace(/^0/, '62');
      const namaMurid = selectedPeriodeObj.siswa.nama_murid;
      const pesanWa = `Halo Ayah/Bunda ${namaMurid},\nLaporan Bimbel ErHa:\n📅 Tanggal: ${formatTanggalIndo(newPresensiSiswa.tanggal_pertemuan)}\n📝 Sesi Ke-${newPresensiSiswa.pertemuan_ke}\n📌 Materi: ${newPresensiSiswa.jurnal_materi}\nStatus: ${newPresensiSiswa.status_kehadiran}\n\nTerima kasih!`;
      if(window.confirm('Presensi tersimpan! Ingin langsung kirim laporan ringkas ke WhatsApp Wali Murid?')) {
        window.open(`https://wa.me/${waWali}?text=${encodeURIComponent(pesanWa)}`, '_blank');
      }
    } else {
      alert('✅ Presensi berhasil dicatat!');
    }

    setNewPresensiSiswa(prev => ({ ...prev, jurnal_materi: '' }));
    setSearchSiswaPresensi(''); 
    fetchAllData();
  };

  // Portal Orang Tua: Pencarian Berdasarkan Nama Siswa atau No HP
  const handleCekTrackingOrangTua = (e) => {
    e.preventDefault();
    setTrackingError('');
    setTrackingResult(null);
    const query = trackingQuery.trim().toLowerCase();
    if (!query) return;

    // Cari siswa berdasarkan nama murid ATAU nomor HP wali
    const foundSiswa = daftarSiswa.find(s => 
      s.nama_murid?.toLowerCase().includes(query) || 
      s.no_hp?.includes(query)
    );

    if (!foundSiswa) {
      setTrackingError('Data siswa tidak ditemukan. Silakan masukkan Nama Lengkap Siswa atau Nomor WhatsApp terdaftar dengan benar.');
      return;
    }

    const periodeAktif = daftarPeriode.find(p => p.siswa_id === foundSiswa.id && p.status_periode === 'berjalan');
    const presensiList = periodeAktif ? daftarPresensiSiswa.filter(ps => ps.periode_id === periodeAktif.id) : [];
    const pembayaranList = daftarPembayaran.filter(pb => pb.siswa_id === foundSiswa.id);

    setTrackingResult({
      siswa: foundSiswa,
      periode: periodeAktif,
      presensi: presensiList,
      pembayaran: pembayaranList
    });
  };

  const handleDaftarSubmit = async (e) => {
    e.preventDefault();
    if (selectedPaket.length === 0) return alert('Pilih minimal satu paket!');
    setLoading(true);
    try {
      const { data: siswaData } = await supabase.from('siswa').insert([{ 
        nama_murid: formDaftar.nama_murid,
        nama_orang_tua: formDaftar.nama_orang_tua,
        no_hp: formDaftar.no_hp,
        alamat: formDaftar.alamat,
        jenjang_sekolah: formDaftar.jenjang_sekolah,
        status: 'pending' 
      }]).select();

      if (siswaData && siswaData[0]) {
        const periodeInserts = selectedPaket.map(pId => ({ 
          siswa_id: siswaData[0].id, 
          paket_id: pId, 
          bulan_periode: null,
          tanggal_mulai: null,
          tanggal_selesai: null,
          total_pertemuan: 12, 
          status_periode: 'pending' 
        }));
        await supabase.from('periode_belajar').insert(periodeInserts);
        fetchAllData();
      }
    } finally {
      setLoading(false);
      alert('Pendaftaran Berhasil! Mengarahkan ke WhatsApp Admin...');
      const waText = `Halo Admin Bimbel ErHa,\nSaya ${formDaftar.nama_orang_tua} baru saja mendaftarkan ananda ${formDaftar.nama_murid} via web. Mohon persetujuannya.`;
      window.open(`https://wa.me/${pengaturanWeb.no_admin_wa || '6281915058297'}?text=${encodeURIComponent(waText)}`, '_blank');
      setFormDaftar({ nama_murid: '', nama_orang_tua: '', no_hp: '', alamat: '', jenjang_sekolah: 'TK' });
      setSelectedPaket([]);
    }
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
            <img src={pengaturanWeb.logo_url || "/logo.png"} alt="Bimbel ErHa Logo" className="h-10 w-10 object-contain bg-white rounded-full p-1 shadow-sm" />
            <div>
              <h1 className="text-white font-extrabold text-lg leading-none">Bimbel ErHa</h1>
              <p className="text-[#F59E0B] font-bold text-xs">Rumah Hebat</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {user ? (
              <div className="flex items-center space-x-3">
                {currentMentorProfile?.foto_url && (
                  <img src={currentMentorProfile.foto_url} alt="Profil" className="h-8 w-8 rounded-full border-2 border-amber-400 object-cover" />
                )}
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
                <button onClick={() => setAdminTab('modul')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm whitespace-nowrap ${adminTab === 'modul' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600'}`}>📚 INVENTARIS</button>
                <button onClick={() => setAdminTab('setup_web')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm whitespace-nowrap ${adminTab === 'setup_web' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600'}`}>⚙️ SETUP & KONTEN WEB</button>
              </div>

              {/* ADMIN: TAB SETUP WEB & KONTEN */}
              {adminTab === 'setup_web' && (
                <div className="space-y-8">
                  <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-purple-100">
                    <h3 className="text-lg font-bold text-[#581878] mb-4">Live Edit Halaman Depan (Landing Page)</h3>
                    <form onSubmit={handleSimpanPengaturanWeb} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-600 mb-1 block">Judul Utama Hero:</label>
                        <input type="text" value={pengaturanWeb.judul_utama} onChange={e => setPengaturanWeb({...pengaturanWeb, judul_utama: e.target.value})} className="border p-3 rounded-xl w-full text-sm" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-600 mb-1 block">Sub-Judul / Deskripsi Singkat:</label>
                        <input type="text" value={pengaturanWeb.sub_judul} onChange={e => setPengaturanWeb({...pengaturanWeb, sub_judul: e.target.value})} className="border p-3 rounded-xl w-full text-sm" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-600 mb-1 block">URL Logo Website:</label>
                        <input type="text" value={pengaturanWeb.logo_url} onChange={e => setPengaturanWeb({...pengaturanWeb, logo_url: e.target.value})} className="border p-3 rounded-xl w-full text-sm" placeholder="https://..." />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-600 mb-1 block">No WhatsApp Admin Utama (Format 62...):</label>
                        <input type="text" value={pengaturanWeb.no_admin_wa} onChange={e => setPengaturanWeb({...pengaturanWeb, no_admin_wa: e.target.value})} className="border p-3 rounded-xl w-full text-sm" />
                      </div>
                      <button type="submit" className="md:col-span-2 bg-[#581878] text-white font-bold py-3 rounded-xl shadow">Simpan Perubahan Web</button>
                    </form>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-purple-100">
                    <h3 className="text-lg font-bold text-[#581878] mb-4">Pengaturan Urutan & Visibilitas Bagian Landing Page</h3>
                    <div className="space-y-3">
                      {landingSections.map(sec => (
                        <div key={sec.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border">
                          <div>
                            <span className="font-bold text-gray-900">{sec.nama_section}</span>
                            <span className="text-xs text-gray-500 block">Key: {sec.section_key}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <label className="text-xs font-bold flex items-center">
                              <input type="checkbox" checked={sec.is_aktif} onChange={(e) => handleUpdateUrutanSection(sec.id, sec.urutan, e.target.checked)} className="mr-1.5 w-4 h-4 accent-purple-700" /> Aktif Tampil
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

                  <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-purple-100">
                    <h3 className="text-lg font-bold text-[#581878] mb-4">Publikasi Artikel & Video Pembelajaran</h3>
                    <form onSubmit={handleSimpanKonten} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <input type="text" placeholder="Judul Artikel / Video" required value={formKonten.judul} onChange={e => setFormKonten({...formKonten, judul: e.target.value})} className="border p-3 rounded-xl text-sm" />
                      <select value={formKonten.tipe} onChange={e => setFormKonten({...formKonten, tipe: e.target.value})} className="border p-3 rounded-xl text-sm bg-white font-bold">
                        <option value="artikel">📝 Artikel / Pengumuman</option>
                        <option value="video">🎥 Video Pembelajaran (YouTube Link)</option>
                      </select>
                      <input type="text" placeholder="URL Video YouTube (Opsional)" value={formKonten.video_url} onChange={e => setFormKonten({...formKonten, video_url: e.target.value})} className="border p-3 rounded-xl text-sm md:col-span-2" />
                      <textarea placeholder="Isi Konten / Deskripsi..." required value={formKonten.isi} onChange={e => setFormKonten({...formKonten, isi: e.target.value})} className="border p-3 rounded-xl text-sm md:col-span-2" rows="3" />
                      <button type="submit" className="md:col-span-2 bg-emerald-600 text-white font-bold py-3 rounded-xl shadow">Terbitkan ke Landing Page</button>
                    </form>
                    <div className="space-y-3">
                      {daftarKonten.map(k => (
                        <div key={k.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border">
                          <div>
                            <span className="font-bold text-[#581878]">{k.judul}</span>
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded ml-2 uppercase">{k.tipe}</span>
                            <p className="text-xs text-gray-500 mt-1">{k.isi}</p>
                          </div>
                          <button onClick={() => handleHapusKonten(k.id)} className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold">Hapus</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ADMIN: TAB SISWA */}
              {adminTab === 'siswa' && (
                <div className="space-y-6">
                  <div className="flex space-x-2 border-b pb-3 overflow-x-auto">
                    <button onClick={() => setSiswaSubTab('persetujuan')} className={`px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap ${siswaSubTab === 'persetujuan' ? 'bg-amber-400 text-purple-950' : 'bg-white'}`}>Persetujuan Baru</button>
                    <button onClick={() => setSiswaSubTab('data')} className={`px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap ${siswaSubTab === 'data' ? 'bg-purple-900 text-white' : 'bg-white'}`}>Data Siswa & Bar Progress</button>
                    <button onClick={() => setSiswaSubTab('tambah_manual')} className={`px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap ${siswaSubTab === 'tambah_manual' ? 'bg-purple-900 text-white' : 'bg-white'}`}>+ Tambah Internal</button>
                    <button onClick={() => setSiswaSubTab('presensi')} className={`px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap ${siswaSubTab === 'presensi' ? 'bg-purple-900 text-white' : 'bg-white'}`}>Rekap Presensi</button>
                  </div>

                  {siswaSubTab === 'persetujuan' && (
                    <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-purple-100">
                      <h3 className="text-lg font-bold text-[#581878] mb-4">Persetujuan Siswa Online</h3>
                      <table className="w-full text-left text-sm">
                        <thead className="bg-purple-50"><tr><th className="p-3">Nama</th><th className="p-3">Wali</th><th className="p-3">Status</th><th className="p-3 text-center">Aksi</th></tr></thead>
                        <tbody>
                          {daftarSiswa.filter(s => s.status === 'pending').map((s) => (
                            <tr key={s.id} className="border-b">
                              <td className="p-3 font-bold">{s.nama_murid}</td>
                              <td className="p-3">{s.nama_orang_tua}</td>
                              <td className="p-3"><span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs">Pending</span></td>
                              <td className="p-3 text-center">
                                <button onClick={() => openApproveModal(s)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-xs font-bold shadow transition">✓ Setujui & Beri Periode</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {siswaSubTab === 'tambah_manual' && (
                    <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-purple-100">
                      <h3 className="text-lg font-bold text-[#581878] mb-4">Form Tambah Siswa</h3>
                      <form onSubmit={handleTambahSiswaManual} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Nama Murid" required value={formSiswaManual.nama_murid} onChange={e => setFormSiswaManual({...formSiswaManual, nama_murid: e.target.value})} className="border p-3 rounded-xl" />
                        <input type="text" placeholder="Nama Wali" required value={formSiswaManual.nama_orang_tua} onChange={e => setFormSiswaManual({...formSiswaManual, nama_orang_tua: e.target.value})} className="border p-3 rounded-xl" />
                        <input type="text" placeholder="No WhatsApp Aktif (Wali)" value={formSiswaManual.no_hp} onChange={e => setFormSiswaManual({...formSiswaManual, no_hp: e.target.value})} className="border p-3 rounded-xl" />
                        <div className="grid grid-cols-2 gap-2">
                           <div>
                              <label className="text-[10px] font-bold text-gray-500 block mb-1">Periode Bulan:</label>
                              <input type="month" required value={formSiswaManual.bulan_periode} onChange={e => setFormSiswaManual({...formSiswaManual, bulan_periode: e.target.value})} className="border p-3 rounded-xl w-full text-sm outline-none" />
                           </div>
                           <div>
                              <label className="text-[10px] font-bold text-gray-500 block mb-1">Jenjang:</label>
                              <select value={formSiswaManual.jenjang_sekolah} onChange={e => setFormSiswaManual({...formSiswaManual, jenjang_sekolah: e.target.value})} className="border p-3 rounded-xl w-full text-sm bg-white outline-none">
                                 <option value="TK">TK</option><option value="SD">SD</option><option value="SMP">SMP</option>
                              </select>
                           </div>
                        </div>
                        <div>
                           <label className="text-[10px] font-bold text-gray-500 block mb-1">Tanggal Mulai:</label>
                           <input type="date" required value={formSiswaManual.tanggal_mulai} onChange={e => setFormSiswaManual({...formSiswaManual, tanggal_mulai: e.target.value})} className="border p-3 rounded-xl w-full text-sm outline-none" />
                        </div>
                        <div>
                           <label className="text-[10px] font-bold text-gray-500 block mb-1">Tanggal Selesai (Target 12 Sesi):</label>
                           <input type="date" required value={formSiswaManual.tanggal_selesai} onChange={e => setFormSiswaManual({...formSiswaManual, tanggal_selesai: e.target.value})} className="border p-3 rounded-xl w-full text-sm outline-none" />
                        </div>
                        <div className="border p-3 rounded-xl bg-gray-50 col-span-1 md:col-span-2">
                          <p className="text-xs font-bold mb-2 text-[#581878]">Pilih Paket Belajar:</p>
                          <div className="grid grid-cols-2 gap-2">
                            {paketList.map(p => (
                              <label key={p.id} className="text-sm cursor-pointer flex items-center">
                                <input type="checkbox" className="mr-2 w-4 h-4 accent-purple-700" onChange={(e) => {
                                  if(e.target.checked) setSelectedPaketManual([...selectedPaketManual, p.id]);
                                  else setSelectedPaketManual(selectedPaketManual.filter(id => id !== p.id));
                                }} /> {p.nama_paket}
                              </label>
                            ))}
                          </div>
                        </div>
                        <button type="submit" className="col-span-1 md:col-span-2 bg-[#581878] hover:bg-purple-900 text-white py-3 rounded-xl font-bold shadow transition">Simpan Siswa & Atur Periode</button>
                      </form>
                    </div>
                  )}

                  {siswaSubTab === 'data' && (
                    <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-purple-100">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-[#581878]">Data Siswa Aktif & Progress Sesi 12 Pertemuan</h3>
                        <button onClick={() => window.print()} className="bg-gray-800 hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-xl shadow">🖨️ Cetak / Print PDF</button>
                      </div>
                      <table className="w-full text-left text-sm">
                        <thead className="bg-purple-50 text-[#581878]"><tr><th className="p-3">Siswa & Bar Progress 12 Sesi</th><th className="p-3 text-center">Aksi Lanjutan</th></tr></thead>
                        <tbody>
                          {daftarSiswa.filter(s => s.status === 'aktif').map(s => {
                            const isExpanded = expandedSiswaId === s.id;
                            const periodeAktif = daftarPeriode.find(p => p.siswa_id === s.id && p.status_periode === 'berjalan');
                            const presensiCount = periodeAktif ? daftarPresensiSiswa.filter(ps => ps.periode_id === periodeAktif.id).length : 0;
                            const progressPercent = Math.min(Math.round((presensiCount / 12) * 100), 100);
                            
                            let barColor = 'bg-emerald-500';
                            if (presensiCount >= 10) barColor = 'bg-amber-500 animate-pulse';
                            if (presensiCount >= 12) barColor = 'bg-red-500';

                            return (
                              <React.Fragment key={s.id}>
                                <tr className="border-b hover:bg-gray-50 transition">
                                  <td className="p-3">
                                    <div className="flex justify-between items-center mb-1">
                                      <strong className="text-[15px]">{s.nama_murid}</strong>
                                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-50 text-[#581878]">Sesi: {presensiCount}/12</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2 overflow-hidden">
                                      <div className={`${barColor} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${progressPercent}%` }}></div>
                                    </div>
                                    {periodeAktif && (
                                      <span className="block text-[11px] text-gray-500">
                                        📅 <span className="font-bold text-gray-700">{periodeAktif.bulan_periode}</span> ({formatTanggalIndo(periodeAktif.tanggal_mulai)} - {formatTanggalIndo(periodeAktif.tanggal_selesai)})
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-3 text-center flex justify-center gap-1.5">
                                    <button onClick={() => setExpandedSiswaId(isExpanded ? null : s.id)} className={`px-2.5 py-1.5 rounded text-xs font-bold transition shadow ${isExpanded ? 'bg-[#581878] text-white' : 'bg-blue-100 text-blue-700'}`}>{isExpanded ? 'Tutup' : 'Detail'}</button>
                                    {presensiCount >= 12 && (
                                      <button onClick={() => handleRolloverPeriode(periodeAktif)} className="bg-amber-500 hover:bg-amber-600 text-white px-2.5 py-1.5 rounded text-xs font-bold shadow animate-bounce">🔄 Rollover</button>
                                    )}
                                    <button onClick={() => openEditSiswaModal(s)} className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-2.5 py-1.5 rounded text-xs font-bold transition shadow-sm">✏️ Edit</button>
                                    <button onClick={() => handleHapusSiswa(s.id, s.nama_murid)} className="bg-red-100 hover:bg-red-200 text-red-700 px-2.5 py-1.5 rounded text-xs font-bold transition shadow-sm">Hapus</button>
                                  </td>
                                </tr>
                                {isExpanded && (
                                  <tr className="bg-indigo-50/50 border-b-4 border-purple-200">
                                    <td colSpan="2" className="p-6">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-100">
                                            <h5 className="font-bold text-[#581878] mb-3 border-b pb-2">Sesi Presensi Tercatat</h5>
                                            <ul className="text-xs space-y-2 max-h-48 overflow-y-auto pr-2">
                                              {daftarPresensiSiswa.filter(ps => ps.periode_belajar?.siswa_id === s.id).map(ps => (
                                                <li key={ps.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                                  <span>✅ {formatTanggalIndo(ps.tanggal_pertemuan)} (Sesi {ps.pertemuan_ke})</span>
                                                  <span className="text-gray-500 truncate max-w-[150px]">{ps.jurnal_materi}</span>
                                                </li>
                                              ))}
                                            </ul>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl shadow-sm border border-emerald-100">
                                            <h5 className="font-bold text-[#581878] mb-3 border-b pb-2">Riwayat Uang Masuk</h5>
                                            <ul className="text-xs space-y-2 max-h-48 overflow-y-auto pr-2">
                                              {daftarPembayaran.filter(pb => pb.siswa_id === s.id).map(pb => (
                                                <li key={pb.id} className="flex justify-between items-center bg-emerald-50 p-2 rounded">
                                                  <span>💰 {formatTanggalIndo(pb.tanggal_pembayaran)}</span> 
                                                  <span className="font-bold text-emerald-700">Rp {Number(pb.jumlah_bayar).toLocaleString('id-ID')}</span>
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
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ADMIN: TAB MENTOR */}
              {adminTab === 'mentor' && (
                <div className="space-y-6">
                  <div className="flex space-x-2 border-b pb-3 overflow-x-auto">
                    <button onClick={() => setMentorSubTab('daftar')} className={`px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap ${mentorSubTab === 'daftar' ? 'bg-purple-900 text-white' : 'bg-white'}`}>Data Mentor & Delegasi</button>
                    <button onClick={() => setMentorSubTab('tambah')} className={`px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap ${mentorSubTab === 'tambah' ? 'bg-purple-900 text-white' : 'bg-white'}`}>+ Tambah Baru</button>
                    <button onClick={() => setMentorSubTab('presensi')} className={`px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap ${mentorSubTab === 'presensi' ? 'bg-purple-900 text-white' : 'bg-white'}`}>Input Presensi Total</button>
                    <button onClick={() => setMentorSubTab('penggajian')} className={`px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap ${mentorSubTab === 'penggajian' ? 'bg-purple-900 text-white' : 'bg-white'}`}>Hitung Payroll</button>
                  </div>
                  
                  {mentorSubTab === 'daftar' && (
                    <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-purple-100">
                      <h4 className="text-lg font-bold text-[#581878] mb-4">Daftar Guru / Mentor Aktif & Pengaturan Delegasi</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {daftarMentor.map(m => (
                          <div key={m.id} className="border border-purple-100 rounded-xl p-4 flex flex-col justify-between shadow-sm bg-gray-50/50">
                            <div className="flex items-start space-x-3 mb-3">
                              {m.foto_url ? (<img src={m.foto_url} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-amber-400 flex-shrink-0" />) : (<div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl border flex-shrink-0">👤</div>)}
                              <div className="min-w-0 flex-1">
                                <h5 className="font-bold text-gray-900 leading-tight truncate">{m.nama_mentor}</h5>
                                <p className="text-[11px] text-gray-500 truncate">{m.email}</p>
                                <p className="text-[11px] text-[#581878] font-bold mt-1">Tarif: Rp {(m.honor_per_jam || 0).toLocaleString('id-ID')}</p>
                              </div>
                            </div>
                            <div className="space-y-1.5 border-t pt-3">
                              <label className="text-[11px] font-bold flex items-center justify-between bg-white p-1.5 rounded border">
                                <span>Akses Inventaris</span>
                                <input type="checkbox" checked={!!m.akses_inventaris} onChange={() => handleToggleDelegasiMentor(m.id, 'akses_inventaris', m.akses_inventaris)} className="accent-purple-700 w-4 h-4" />
                              </label>
                              <label className="text-[11px] font-bold flex items-center justify-between bg-white p-1.5 rounded border">
                                <span>Akses Jadwal / Izin</span>
                                <input type="checkbox" checked={!!m.akses_jadwal} onChange={() => handleToggleDelegasiMentor(m.id, 'akses_jadwal', m.akses_jadwal)} className="accent-purple-700 w-4 h-4" />
                              </label>
                              <label className="text-[11px] font-bold flex items-center justify-between bg-white p-1.5 rounded border">
                                <span>Akses Konten / Video</span>
                                <input type="checkbox" checked={!!m.akses_konten} onChange={() => handleToggleDelegasiMentor(m.id, 'akses_konten', m.akses_konten)} className="accent-purple-700 w-4 h-4" />
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {mentorSubTab === 'tambah' && (
                    <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-purple-100">
                      <h4 className="text-lg font-bold text-[#581878] mb-4">Pendaftaran Akun Mentor</h4>
                      <form onSubmit={handleTambahMentor} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Nama Lengkap Mentor" required value={newMentor.nama_mentor} onChange={(e) => setNewMentor({...newMentor, nama_mentor: e.target.value})} className="px-4 py-3 border rounded-xl" />
                        <input type="text" placeholder="No. WhatsApp (Awali 08/62)" required value={newMentor.no_hp} onChange={(e) => setNewMentor({...newMentor, no_hp: e.target.value})} className="px-4 py-3 border rounded-xl" />
                        <input type="email" placeholder="Email Login" required value={newMentor.email} onChange={(e) => setNewMentor({...newMentor, email: e.target.value})} className="px-4 py-3 border rounded-xl" />
                        <input type="password" placeholder="Password (Min. 6 Karakter)" required value={newMentor.password} onChange={(e) => setNewMentor({...newMentor, password: e.target.value})} className="px-4 py-3 border rounded-xl" />
                        <input type="number" placeholder="Tarif Honor Dasar (Rp)" required value={newMentor.honor_per_jam} onChange={(e) => setNewMentor({...newMentor, honor_per_jam: Number(e.target.value)})} className="px-4 py-3 border rounded-xl md:col-span-2 bg-amber-50" />
                        <button type="submit" disabled={loading} className="md:col-span-2 bg-[#581878] hover:bg-purple-900 text-white font-bold py-3 rounded-xl shadow transition">Simpan Akun Mentor 🚀</button>
                      </form>
                    </div>
                  )}

                  {mentorSubTab === 'presensi' && (
                    <div className="bg-white p-6 rounded-2xl shadow-md border-2 border-purple-100">
                       <h3 className="text-lg font-bold text-[#581878] mb-4">Input Total Jam Kerja Mentor Harian</h3>
                       <form onSubmit={handleTambahPresensiMentor} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-gray-50 p-4 rounded-xl border">
                          <select required value={formPresensiMentor.mentor_id} onChange={e => setFormPresensiMentor({...formPresensiMentor, mentor_id: e.target.value})} className="border p-3 rounded-xl"><option value="">-- Pilih Guru --</option>{daftarMentor.map(m => <option key={m.id} value={m.id}>{m.nama_mentor}</option>)}</select>
                          <input type="date" required value={formPresensiMentor.tanggal} onChange={e => setFormPresensiMentor({...formPresensiMentor, tanggal: e.target.value})} className="border p-3 rounded-xl" />
                          <input type="number" step="0.5" placeholder="Total Jam Mengajar" required value={formPresensiMentor.total_jam} onChange={e => setFormPresensiMentor({...formPresensiMentor, total_jam: parseFloat(e.target.value)})} className="border p-3 rounded-xl font-bold text-[#581878]" />
                          <button type="submit" className="bg-[#581878] text-white py-3 rounded-xl font-bold shadow">Simpan Jam</button>
                       </form>
                       <div className="overflow-x-auto">
                         <table className="w-full text-left text-sm">
                            <thead className="bg-purple-50 text-[#581878]"><tr><th className="p-3">Tanggal</th><th className="p-3">Nama Mentor</th><th className="p-3">Durasi</th><th className="p-3 text-center">Aksi</th></tr></thead>
                            <tbody>
                              {daftarPresensiMentor.slice(0, 15).map(pm => (
                                <tr key={pm.id} className="border-b"><td className="p-3">{formatTanggalIndo(pm.tanggal)}</td><td className="p-3 font-bold">{pm.mentor?.nama_mentor}</td><td className="p-3 font-semibold text-emerald-600">{pm.total_jam} Jam</td><td className="p-3 text-center"><button onClick={async () => { await supabase.from('presensi_mentor').delete().eq('id', pm.id); fetchAllData(); }} className="bg-red-100 text-red-700 px-3 py-1 rounded text-xs">Hapus</button></td></tr>
                              ))}
                            </tbody>
                         </table>
                       </div>
                    </div>
                  )}

                  {mentorSubTab === 'penggajian' && (
                    <div className="bg-white p-6 rounded-2xl shadow-md border-2 border-purple-100 space-y-6">
                       <h3 className="text-lg font-bold text-[#581878]">Kalkulator Payroll / Gaji Bulanan</h3>
                       <form onSubmit={handleSimpanGaji} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border-b pb-6">
                          <select required value={formGaji.mentor_id} onChange={e => setFormGaji({...formGaji, mentor_id: e.target.value})} className="border p-3 rounded-xl"><option value="">-- Pilih Guru --</option>{daftarMentor.map(m => <option key={m.id} value={m.id}>{m.nama_mentor}</option>)}</select>
                          <input type="month" required value={formGaji.bulan_periode} onChange={e => setFormGaji({...formGaji, bulan_periode: e.target.value})} className="border p-3 rounded-xl" />
                          <input type="number" placeholder="Insentif (Rp)" value={formGaji.insentif} onChange={e => setFormGaji({...formGaji, insentif: Number(e.target.value)})} className="border p-3 rounded-xl bg-blue-50" />
                          <input type="number" placeholder="Potongan (Rp)" value={formGaji.potongan} onChange={e => setFormGaji({...formGaji, potongan: Number(e.target.value)})} className="border p-3 rounded-xl bg-red-50" />
                          <button type="submit" className="md:col-span-4 bg-emerald-600 text-white py-3 rounded-xl font-bold shadow w-full">Generate Slip Gaji</button>
                       </form>
                       <div className="overflow-x-auto">
                         <table className="w-full text-sm mt-4 text-left">
                            <thead className="bg-purple-50 text-[#581878] uppercase text-xs"><tr>
                              <th className="p-3">Periode</th><th className="p-3">Mentor</th><th className="p-3 text-center">T. Jam</th><th className="p-3">Gaji Bersih</th><th className="p-3 text-center">Status</th><th className="p-3 text-center">Aksi</th>
                            </tr></thead>
                            <tbody>
                              {daftarPenggajian.map(g => {
                                const totalHonor = (g.total_jam_mengajar * g.honor_per_jam) + Number(g.insentif) + Number(g.bonus_kinerja) - Number(g.potongan);
                                return (
                                   <tr key={g.id} className="border-b">
                                     <td className="p-3 font-semibold">{g.bulan_periode}</td><td className="p-3 font-bold">{g.mentor?.nama_mentor}</td>
                                     <td className="p-3 text-center">{g.total_jam_mengajar}</td>
                                     <td className="p-3 font-extrabold text-emerald-600">Rp {totalHonor.toLocaleString('id-ID')}</td>
                                     <td className="p-3 text-center"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${g.status_pembayaran === 'dibayar' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{g.status_pembayaran}</span></td>
                                     <td className="p-3 text-center space-x-2">
                                        {g.status_pembayaran !== 'dibayar' && <button onClick={async () => { await supabase.from('penggajian_mentor').update({status_pembayaran: 'dibayar'}).eq('id', g.id); fetchAllData(); }} className="bg-emerald-600 text-white px-3 py-1 rounded text-xs">Bayar</button>}
                                        <button onClick={async () => { await supabase.from('penggajian_mentor').delete().eq('id', g.id); fetchAllData(); }} className="bg-red-100 text-red-700 px-3 py-1 rounded text-xs">Hapus</button>
                                     </td>
                                   </tr>
                                );
                              })}
                            </tbody>
                         </table>
                       </div>
                    </div>
                  )}
                </div>
              )}

              {/* ADMIN: TAB PEMBAYARAN */}
              {adminTab === 'pembayaran' && (
                 <div>
                    <div className="bg-white p-6 rounded-2xl shadow-md mb-6 border-t-4 border-[#F59E0B]">
                       <h3 className="text-xl font-bold text-[#581878] mb-4">Catat Penerimaan Pembayaran</h3>
                       <form onSubmit={handleCatatPembayaran} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="border p-4 rounded-xl bg-gray-50">
                               <input type="text" placeholder="Ketik nama siswa..." value={searchSiswaBayar} onChange={e => setSearchSiswaBayar(e.target.value)} className="w-full border p-3 rounded-xl mb-3 text-sm outline-none" />
                               <select required size="4" value={formPembayaran.siswa_id} onChange={e => setFormPembayaran({...formPembayaran, siswa_id: e.target.value})} className="w-full border p-2 rounded-xl bg-white text-sm outline-none overflow-y-auto">
                                  {daftarSiswa.filter(s => s.status === 'aktif' && s.nama_murid?.toLowerCase().includes(searchSiswaBayar.toLowerCase())).map(s => <option key={s.id} value={s.id} className="p-2 border-b cursor-pointer">{s.nama_murid}</option>)}
                               </select>
                            </div>
                            <input type="date" required value={formPembayaran.tanggal_pembayaran} onChange={e => setFormPembayaran({...formPembayaran, tanggal_pembayaran: e.target.value})} className="w-full border p-3 rounded-xl" />
                          </div>
                          <div className="space-y-4">
                            <div className="border p-4 rounded-xl">
                               <div className="grid grid-cols-2 gap-3">
                                 {paymentItemOptions.map(item => (
                                   <label key={item} className="text-sm cursor-pointer flex items-center bg-gray-50 p-2 rounded">
                                     <input type="checkbox" className="mr-3 w-4 h-4" onChange={(e) => {
                                       if(e.target.checked) setFormPembayaran({...formPembayaran, items: [...formPembayaran.items, item]});
                                       else setFormPembayaran({...formPembayaran, items: formPembayaran.items.filter(i => i !== item)});
                                     }} /> {item}
                                   </label>
                                 ))}
                               </div>
                            </div>
                            <input type="number" placeholder="Total Uang Diterima (Rp)" required value={formPembayaran.total_bayar} onChange={e => setFormPembayaran({...formPembayaran, total_bayar: Number(e.target.value)})} className="w-full border p-4 rounded-xl font-black text-xl bg-emerald-50 text-emerald-800" />
                            <button type="submit" className="w-full bg-[#581878] text-white py-4 rounded-xl font-bold text-lg shadow">Simpan Pembayaran</button>
                          </div>
                       </form>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-md border-2 border-purple-100">
                      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                         <h4 className="text-lg font-bold text-[#581878]">Rekap Pembayaran</h4>
                         <input 
                            type="month" 
                            value={filterBulanPembayaran} 
                            onChange={e => { setFilterBulanPembayaran(e.target.value); setCurrentPagePembayaran(1); }} 
                            className="border px-4 py-2 rounded-xl text-sm font-bold text-purple-900 bg-purple-50 outline-none" 
                         />
                      </div>

                      {(() => {
                         const filteredPembayaran = filterBulanPembayaran 
                            ? daftarPembayaran.filter(pb => pb.tanggal_pembayaran?.startsWith(filterBulanPembayaran))
                            : daftarPembayaran;
                         
                         const totalPenerimaan = filteredPembayaran.reduce((sum, pb) => sum + (Number(pb.jumlah_bayar) || 0), 0);
                         
                         const ITEMS_PER_PAGE = 15;
                         const totalPagesPembayaran = Math.ceil(filteredPembayaran.length / ITEMS_PER_PAGE) || 1;
                         const currentDataPembayaran = filteredPembayaran.slice((currentPagePembayaran - 1) * ITEMS_PER_PAGE, currentPagePembayaran * ITEMS_PER_PAGE);

                         return (
                            <>
                               <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl mb-6 flex justify-between items-center">
                                  <span className="font-bold text-emerald-800 text-sm md:text-base">Total Penerimaan Bulan Ini:</span>
                                  <span className="text-xl md:text-2xl font-black text-emerald-600">Rp {totalPenerimaan.toLocaleString('id-ID')}</span>
                               </div>

                               <div className="overflow-x-auto">
                                 <table className="w-full text-left text-sm whitespace-nowrap">
                                   <thead className="bg-purple-50 text-[#581878]"><tr><th className="p-3">Tanggal</th><th className="p-3">Nama Siswa</th><th className="p-3">Item Dibayar</th><th className="p-3">Nominal</th><th className="p-3 text-center">Aksi</th></tr></thead>
                                   <tbody>
                                     {currentDataPembayaran.map(pb => (
                                        <tr key={pb.id} className="border-b">
                                          <td className="p-3">{formatTanggalIndo(pb.tanggal_pembayaran)}</td>
                                          <td className="p-3 font-bold">{pb.siswa?.nama_murid}</td>
                                          <td className="p-3"><span className="text-[#581878] font-bold bg-purple-50 px-2 py-1 rounded">{pb.item_bayar}</span></td>
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

                               {filteredPembayaran.length > 0 && (
                                  <div className="flex justify-between items-center mt-6 text-sm">
                                      <button disabled={currentPagePembayaran === 1} onClick={() => setCurrentPagePembayaran(prev => Math.max(prev - 1, 1))} className="px-4 py-2 bg-gray-100 font-bold rounded-lg disabled:opacity-50">Sebelumnya</button>
                                      <span className="font-bold text-gray-600">Halaman {currentPagePembayaran} dari {totalPagesPembayaran}</span>
                                      <button disabled={currentPagePembayaran === totalPagesPembayaran} onClick={() => setCurrentPagePembayaran(prev => Math.min(prev + 1, totalPagesPembayaran))} className="px-4 py-2 bg-gray-100 font-bold rounded-lg disabled:opacity-50">Selanjutnya</button>
                                  </div>
                               )}
                            </>
                         )
                      })()}
                    </div>
                 </div>
              )}

              {/* ADMIN: TAB INVENTARIS */}
              {adminTab === 'modul' && <ModulManager adminView={true} />}
            </div>
          )}

          {/* ======================================================= */}
          {/* 👩‍🏫 PORTAL GURU (MENTOR)                                */}
          {/* ======================================================= */}
          {userRole === 'guru' && (
            <div className="space-y-6">
              <div className="flex overflow-x-auto border-b-2 border-purple-200 space-x-2 pb-1">
                <button onClick={() => setGuruTab('beranda')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm whitespace-nowrap ${guruTab === 'beranda' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600'}`}>🏠 Beranda</button>
                <button onClick={() => setGuruTab('presensi')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm whitespace-nowrap ${guruTab === 'presensi' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600'}`}>📝 Presensi Harian</button>
                {currentMentorProfile?.akses_konten && (
                  <button onClick={() => setGuruTab('konten')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm whitespace-nowrap ${guruTab === 'konten' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600'}`}>📢 Buat Konten & Video</button>
                )}
                <button onClick={() => setGuruTab('modul')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm whitespace-nowrap ${guruTab === 'modul' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600'}`}>📚 Inventaris</button>
                <button onClick={() => setGuruTab('profil')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm whitespace-nowrap ${guruTab === 'profil' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600'}`}>👤 Akun</button>
              </div>

              {guruTab === 'beranda' && (
                 <div className="space-y-6">
                    <div className="bg-gradient-to-r from-purple-800 to-indigo-900 text-white p-6 rounded-3xl shadow-lg">
                       <div className="flex flex-col md:flex-row items-center gap-6">
                          {currentMentorProfile?.foto_url ? (
                            <img src={currentMentorProfile.foto_url} alt="Guru" className="w-24 h-24 rounded-full border-4 border-[#F59E0B] object-cover shadow-xl" />
                          ) : (
                            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-4xl border border-white/50">👤</div>
                          )}
                          <div className="text-center md:text-left">
                            <h2 className="text-3xl font-black">Halo, {currentMentorProfile?.nama_mentor || 'Kakak Pengajar!'} 👋</h2>
                            <p className="text-amber-300 text-sm font-bold mt-2">Tarif Dasar: Rp {(currentMentorProfile?.honor_per_jam || 0).toLocaleString('id-ID')} / Jam</p>
                          </div>
                       </div>
                    </div>
                 </div>
              )}

              {guruTab === 'presensi' && (
                 <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-purple-200">
                    <h3 className="text-lg font-bold text-[#581878] mb-4">Catat Presensi Kelas Hari Ini</h3>
                    <form onSubmit={handleTambahPresensiSiswa} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-purple-50 p-4 rounded-xl border border-purple-100">
                        <div className="md:col-span-2 relative">
                           <input type="text" placeholder="Ketik nama siswa aktif..." value={searchSiswaPresensi} onFocus={() => setIsDropdownPresensiOpen(true)} onChange={(e) => { setSearchSiswaPresensi(e.target.value); setIsDropdownPresensiOpen(true); setNewPresensiSiswa({...newPresensiSiswa, periode_id: ''}); }} className="w-full px-4 py-3 border rounded-xl font-medium outline-none" />
                           {isDropdownPresensiOpen && searchSiswaPresensi && !newPresensiSiswa.periode_id && (
                              <div className="absolute z-10 w-full mt-1 bg-white border border-purple-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                                 {daftarPeriode.filter(p => p.siswa?.status === 'aktif' && p.status_periode === 'berjalan' && p.siswa?.nama_murid.toLowerCase().includes(searchSiswaPresensi.toLowerCase())).map(p => (
                                    <div key={p.id} onClick={() => handlePilihSiswaPresensi(p)} className="px-4 py-3 cursor-pointer hover:bg-purple-100 border-b text-sm">
                                       <span className="font-bold text-[#581878]">{p.siswa?.nama_murid}</span> - {p.paket_belajar?.nama_paket}
                                    </div>
                                 ))}
                              </div>
                           )}
                        </div>
                        <div className="relative">
                           <input type="text" readOnly value={`Sesi Ke- ${newPresensiSiswa.pertemuan_ke}`} className="w-full px-4 py-3 border rounded-xl font-black text-center bg-gray-100 text-[#581878]" />
                        </div>
                        <input type="date" required value={newPresensiSiswa.tanggal_pertemuan} onChange={(e) => setNewPresensiSiswa({ ...newPresensiSiswa, tanggal_pertemuan: e.target.value })} className="px-4 py-3 border rounded-xl mt-2" />
                        <select value={newPresensiSiswa.status_kehadiran} onChange={(e) => setNewPresensiSiswa({ ...newPresensiSiswa, status_kehadiran: e.target.value })} className="px-4 py-3 border rounded-xl text-sm font-bold text-purple-900 bg-white mt-2">
                          <option value="Hadir">✅ Murid Hadir</option>
                          <option value="Izin">📩 Murid Izin</option>
                        </select>
                        <input type="text" placeholder="Jurnal / Materi Sesi Ini" required value={newPresensiSiswa.jurnal_materi} onChange={(e) => setNewPresensiSiswa({ ...newPresensiSiswa, jurnal_materi: e.target.value })} className="px-4 py-3 border rounded-xl md:col-span-3" />
                        <button type="submit" disabled={!newPresensiSiswa.periode_id} className={`md:col-span-3 font-extrabold py-3 rounded-xl shadow transition ${newPresensiSiswa.periode_id ? 'bg-[#581878] hover:bg-purple-900 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>Simpan Presensi & Kirim Laporan WA Cepat 🚀</button>
                    </form>
                 </div>
              )}

              {guruTab === 'konten' && currentMentorProfile?.akses_konten && (
                <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-purple-200">
                   <h3 className="text-lg font-bold text-[#581878] mb-4">Publikasi Konten Edukasi & Video Pengajar</h3>
                   <form onSubmit={handleSimpanKonten} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <input type="text" placeholder="Judul Artikel / Video" required value={formKonten.judul} onChange={e => setFormKonten({...formKonten, judul: e.target.value})} className="border p-3 rounded-xl text-sm" />
                     <select value={formKonten.tipe} onChange={e => setFormKonten({...formKonten, tipe: e.target.value})} className="border p-3 rounded-xl text-sm font-bold bg-white">
                       <option value="artikel">📝 Artikel / Pengumuman</option>
                       <option value="video">🎥 Video Pembelajaran</option>
                     </select>
                     <input type="text" placeholder="URL Video YouTube" value={formKonten.video_url} onChange={e => setFormKonten({...formKonten, video_url: e.target.value})} className="border p-3 rounded-xl text-sm md:col-span-2" />
                     <textarea placeholder="Isi Konten..." required value={formKonten.isi} onChange={e => setFormKonten({...formKonten, isi: e.target.value})} className="border p-3 rounded-xl text-sm md:col-span-2" rows="3" />
                     <button type="submit" className="md:col-span-2 bg-[#581878] text-white font-bold py-3 rounded-xl shadow">Terbitkan</button>
                   </form>
                </div>
              )}

              {guruTab === 'modul' && <ModulManager adminView={currentMentorProfile?.akses_inventaris} />}

              {guruTab === 'profil' && (
                <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-purple-200">
                   <h3 className="text-lg font-bold text-[#581878] mb-4">Pengaturan Profil & Keamanan</h3>
                   <form onSubmit={handleUpdateProfilGuru} className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                     <div><label className="text-xs font-bold block mb-1">Nama</label><input type="text" disabled value={currentMentorProfile?.nama_mentor || ''} className="w-full p-3 border rounded-xl bg-gray-100" /></div>
                     <div><label className="text-xs font-bold block mb-1">URL Foto Profil</label><input type="text" value={currentMentorProfile?.foto_url || ''} onChange={e => setCurrentMentorProfile({...currentMentorProfile, foto_url: e.target.value})} className="w-full p-3 border rounded-xl" /></div>
                     <button type="submit" className="md:col-span-2 bg-[#581878] text-white font-black py-4 rounded-xl shadow">Simpan Profil</button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* ======================================================= */
        /* 🌍 PUBLIC LANDING PAGE (STARTER & PENCARIAN ORANG TUA)  */
        /* ======================================================= */
        <>
          {(() => {
             const sortedSections = [...landingSections].filter(sec => sec.is_aktif).sort((a, b) => a.urutan - b.urutan);

             return sortedSections.map(sec => {
                if (sec.section_key === 'hero') {
                   return (
                      <section key={sec.id} className="bg-gradient-to-b from-[#581878] via-[#6B21A8] to-[#FFFDF0] text-white pt-12 pb-24 px-4 text-center">
                        <div className="max-w-4xl mx-auto">
                          <span className="inline-block bg-[#F59E0B] text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider mb-6 shadow-md">
                            Bimbingan Belajar Ceria & Berprestasi 🚀
                          </span>
                          <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-6">
                            {pengaturanWeb.judul_utama || 'Rumah Belajar Ceria Bersama Bimbel ErHa'}
                          </h2>
                          <p className="text-lg text-purple-200">{pengaturanWeb.sub_judul || 'Bimbingan Belajar Ceria, Bersahabat & Berprestasi'}</p>
                        </div>
                      </section>
                   );
                }

                if (sec.section_key === 'tracking') {
                   return (
                      <section key={sec.id} className="max-w-3xl mx-auto px-4 -mt-10 mb-16 relative z-20">
                         <div className="bg-white rounded-3xl shadow-xl border-4 border-purple-200 p-8">
                            <h3 className="text-xl font-black text-[#581878] mb-2 text-center">🔍 Portal Cek Kehadiran Orang Tua</h3>
                            <p className="text-xs text-gray-500 text-center mb-6">Cari berdasarkan <strong>Nama Lengkap Siswa</strong> atau <strong>Nomor WhatsApp Wali</strong> untuk melihat rekap kehadiran secara real-time.</p>
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
                                     {trackingResult.periode && (
                                        <p className="text-xs text-gray-500 mt-1">Periode Aktif: {trackingResult.periode.bulan_periode} ({trackingResult.presensi.length}/12 Sesi Terlaksana)</p>
                                     )}
                                  </div>
                                  <div className="max-h-48 overflow-y-auto space-y-2">
                                     <h5 className="font-bold text-xs text-gray-700">Riwayat Presensi Terbaru:</h5>
                                     {trackingResult.presensi.map(ps => (
                                        <div key={ps.id} className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded">
                                           <span>✅ {formatTanggalIndo(ps.tanggal_pertemuan)} (Sesi {ps.pertemuan_ke})</span>
                                           <span className="text-gray-500">{ps.jurnal_materi}</span>
                                        </div>
                                     ))}
                                  </div>
                               </div>
                            )}
                         </div>
                      </section>
                   );
                }

                if (sec.section_key === 'paket') {
                   return (
                      <section key={sec.id} className="max-w-6xl mx-auto px-4 mb-20">
                        <h3 className="text-3xl font-black text-center text-[#581878] mb-10">Pilihan Program Belajar</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          {paketList.map((paket) => {
                            const isSelected = selectedPaket.includes(paket.id);
                            return (
                              <div
                                key={paket.id}
                                onClick={() => {
                                  if (selectedPaket.includes(paket.id)) setSelectedPaket(selectedPaket.filter(p => p !== paket.id));
                                  else setSelectedPaket([...selectedPaket, paket.id]);
                                }}
                                className={`cursor-pointer bg-white rounded-3xl p-8 transition-all duration-300 shadow-xl relative ${isSelected ? 'border-4 border-[#F59E0B] -translate-y-2' : 'border-2 border-purple-50'}`}
                              >
                                {isSelected && <div className="absolute top-0 right-0 bg-[#F59E0B] text-white text-xs font-black px-4 py-1 rounded-bl-xl">✓ Terpilih</div>}
                                <h4 className="text-2xl font-black text-gray-900 mb-4">{paket.nama_paket}</h4>
                                <p className="text-gray-600 text-sm mb-6">{paket.deskripsi || 'Program bimbingan intensif 12 pertemuan per bulan.'}</p>
                              </div>
                            );
                          })}
                        </div>
                      </section>
                   );
                }

                if (sec.section_key === 'konten') {
                   return (
                      <section key={sec.id} className="max-w-6xl mx-auto px-4 mb-20">
                         <h3 className="text-3xl font-black text-center text-[#581878] mb-10">Artikel & Video Pembelajaran</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {daftarKonten.map(k => (
                               <div key={k.id} className="bg-white p-6 rounded-3xl shadow-md border border-purple-100 flex flex-col justify-between">
                                  <div>
                                     <span className="text-[10px] font-black uppercase bg-purple-100 text-purple-800 px-2 py-1 rounded">{k.tipe}</span>
                                     <h4 className="text-xl font-bold text-gray-900 mt-2 mb-2">{k.judul}</h4>
                                     <p className="text-xs text-gray-600 mb-4">{k.isi}</p>
                                  </div>
                               </div>
                            ))}
                            {daftarKonten.length === 0 && (
                               <div className="col-span-2 text-center text-gray-400 italic bg-white p-8 rounded-3xl">Belum ada artikel atau video yang dipublikasikan.</div>
                            )}
                         </div>
                      </section>
                   );
                }

                if (sec.section_key === 'pendaftaran') {
                   return (
                      <section key={sec.id} className="max-w-3xl mx-auto px-4 mb-24">
                        <div className="bg-white rounded-[2rem] shadow-2xl p-8 md:p-12 border-4 border-white">
                          <div className="text-center mb-10">
                            <h3 className="text-3xl font-black text-[#581878] mb-2">Pendaftaran Siswa Baru</h3>
                            <p className="text-gray-500 text-sm">Lengkapi formulir di bawah ini untuk terhubung ke WhatsApp Admin.</p>
                          </div>
                          <form onSubmit={handleDaftarSubmit} className="space-y-5">
                            <div>
                              <label className="block text-sm font-bold text-gray-700 mb-1.5">Nama Lengkap Murid</label>
                              <input type="text" required value={formDaftar.nama_murid} onChange={(e) => setFormDaftar({ ...formDaftar, nama_murid: e.target.value })} className="w-full px-5 py-4 rounded-xl border border-gray-200 outline-none bg-gray-50" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Nama Wali</label>
                                <input type="text" required value={formDaftar.nama_orang_tua} onChange={(e) => setFormDaftar({ ...formDaftar, nama_orang_tua: e.target.value })} className="w-full px-5 py-4 rounded-xl border border-gray-200 outline-none bg-gray-50" />
                              </div>
                              <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">No. WhatsApp</label>
                                <input type="tel" required value={formDaftar.no_hp} onChange={(e) => setFormDaftar({ ...formDaftar, no_hp: e.target.value })} className="w-full px-5 py-4 rounded-xl border border-gray-200 outline-none bg-gray-50" />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-gray-700 mb-1.5">Alamat</label>
                              <textarea required value={formDaftar.alamat} onChange={(e) => setFormDaftar({ ...formDaftar, alamat: e.target.value })} className="w-full px-5 py-4 rounded-xl border border-gray-200 outline-none bg-gray-50" rows="2" />
                            </div>
                            <button type="submit" disabled={loading} className="w-full py-5 bg-[#581878] hover:bg-[#6B21A8] text-white font-black text-lg rounded-2xl shadow-xl transition-all">
                              {loading ? 'Memproses...' : 'Kirim Pendaftaran via WhatsApp 🚀'}
                            </button>
                          </form>
                        </div>
                      </section>
                   );
                }

                return null;
             });
          })}
        </>
      )}

      {/* FOOTER GLOBAL */}
      <footer className="bg-[#581878] text-white py-10 text-center border-t-4 border-[#F59E0B] mt-auto">
        <div className="max-w-7xl mx-auto px-4">
           <p className="font-black text-xl">Bimbel ErHa (Rumah Hebat)</p>
           <p className="text-xs text-purple-400 mt-4">© {new Date().getFullYear()} Bimbel ErHa. All rights reserved.</p>
        </div>
      </footer>

      {/* ======================================================= */}
      {/* KUMPULAN MODAL POP-UP                                   */}
      {/* ======================================================= */}
      
      {showEditSiswaModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
             <h3 className="font-bold text-lg text-[#581878] mb-4">Edit Data & Periode Siswa</h3>
             <form onSubmit={handleSimpanEditSiswa} className="space-y-4">
               <input type="text" required value={editSiswaData.nama_murid} onChange={e => setEditSiswaData({...editSiswaData, nama_murid: e.target.value})} className="w-full border p-3 rounded-xl text-sm" placeholder="Nama Murid" />
               <input type="text" required value={editSiswaData.nama_orang_tua} onChange={e => setEditSiswaData({...editSiswaData, nama_orang_tua: e.target.value})} className="w-full border p-3 rounded-xl text-sm" placeholder="Wali" />
               <input type="text" required value={editSiswaData.no_hp} onChange={e => setEditSiswaData({...editSiswaData, no_hp: e.target.value})} className="w-full border p-3 rounded-xl text-sm" placeholder="No HP" />
               {editPeriodeData.id && (
                 <div className="bg-purple-50 p-4 rounded-xl space-y-3">
                   <input type="month" required value={editPeriodeData.bulan_periode} onChange={e => setEditPeriodeData({...editPeriodeData, bulan_periode: e.target.value})} className="w-full border p-3 rounded-lg text-sm bg-white" />
                   <input type="date" required value={editPeriodeData.tanggal_mulai} onChange={e => setEditPeriodeData({...editPeriodeData, tanggal_mulai: e.target.value})} className="w-full border p-3 rounded-lg text-sm bg-white" />
                   <input type="date" required value={editPeriodeData.tanggal_selesai} onChange={e => setEditPeriodeData({...editPeriodeData, tanggal_selesai: e.target.value})} className="w-full border p-3 rounded-lg text-sm bg-white" />
                 </div>
               )}
               <div className="flex justify-end space-x-2 pt-4">
                 <button type="button" onClick={() => setShowEditSiswaModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg text-sm font-bold">Batal</button>
                 <button type="submit" className="px-5 py-2 bg-[#581878] text-white rounded-lg text-sm font-bold">Simpan</button>
               </div>
             </form>
          </div>
        </div>
      )}

      {showEditPembayaranModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
             <h3 className="font-bold text-lg text-[#581878] mb-4">Edit Pembayaran</h3>
             <form onSubmit={handleSimpanEditPembayaran} className="space-y-4">
                <input type="text" required value={editPembayaranData.item_bayar} onChange={e => setEditPembayaranData({...editPembayaranData, item_bayar: e.target.value})} className="w-full border p-3 rounded-xl text-sm" />
                <input type="number" required value={editPembayaranData.total_bayar} onChange={e => setEditPembayaranData({...editPembayaranData, total_bayar: Number(e.target.value)})} className="w-full border p-3 rounded-xl text-sm font-bold bg-emerald-50 text-emerald-800" />
                <input type="date" required value={editPembayaranData.tanggal_pembayaran} onChange={e => setEditPembayaranData({...editPembayaranData, tanggal_pembayaran: e.target.value})} className="w-full border p-3 rounded-xl text-sm" />
                <button type="submit" className="w-full bg-[#581878] text-white py-3 rounded-xl font-bold shadow">Simpan</button>
             </form>
          </div>
        </div>
      )}

      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl relative p-8">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-gray-400 font-bold">✕</button>
            <h3 className="text-2xl font-black text-[#581878] mb-4 text-center">Portal Internal</h3>
            {loginError && <p className="text-red-500 text-xs font-bold text-center mb-3 bg-red-50 p-2 rounded">{loginError}</p>}
            <form onSubmit={handleLogin} className="space-y-4">
               <input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border text-sm" placeholder="Email" />
               <input type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border text-sm" placeholder="Password" />
               <button type="submit" className="w-full py-4 bg-[#581878] text-[#F59E0B] font-black rounded-xl shadow mt-4">M A S U K</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // --- KOMPONEN LOKAL INVENTARIS (DIPERBAIKI) ---
  function ModulManager({ adminView }) {
    return (
      <div className="space-y-6">
         <div className="flex space-x-2 border-b-2 border-emerald-100 pb-3">
           <button onClick={() => setModulSubTab('data_barang')} className={`px-5 py-2.5 rounded-t-xl font-bold text-sm transition ${modulSubTab === 'data_barang' ? 'bg-emerald-600 text-white shadow' : 'bg-white text-emerald-800'}`}>📦 Katalog Barang</button>
           <button onClick={() => setModulSubTab('transaksi')} className={`px-5 py-2.5 rounded-t-xl font-bold text-sm transition ${modulSubTab === 'transaksi' ? 'bg-emerald-600 text-white shadow' : 'bg-white text-emerald-800'}`}>📝 Transaksi Masuk/Keluar</button>
         </div>

         {modulSubTab === 'data_barang' && (
            <div>
               {adminView && (
                 <div className="bg-white p-6 rounded-2xl shadow-md mb-6 border-l-4 border-emerald-500">
                    <h3 className="font-bold text-emerald-800 mb-4 text-lg">Input Barang Baru</h3>
                    <form onSubmit={handleTambahModul} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                       <input type="text" placeholder="Nama Barang" required value={formModul.nama_barang} onChange={e => setFormModul({...formModul, nama_barang: e.target.value})} className="border p-3 rounded-xl col-span-2 text-sm" />
                       <select value={formModul.kategori} onChange={e => setFormModul({...formModul, kategori: e.target.value})} className="border p-3 rounded-xl bg-white font-medium text-sm">
                          <option value="Buku">Buku</option><option value="Seragam">Seragam</option><option value="Logistik">Logistik</option>
                       </select>
                       <input type="number" placeholder="Stok" required value={formModul.stok} onChange={e => setFormModul({...formModul, stok: Number(e.target.value)})} className="border p-3 rounded-xl font-bold text-emerald-700 bg-emerald-50 text-sm" />
                       <button type="submit" className="md:col-span-4 bg-emerald-600 text-white py-3 rounded-xl font-black shadow">Simpan Barang</button>
                    </form>
                 </div>
               )}
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {daftarInventaris.map(b => (
                     <div key={b.id} className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-100 flex flex-col justify-between">
                        <div>
                           <span className="text-[10px] uppercase font-black bg-emerald-50 text-emerald-600 px-2 py-1 rounded">{b.kategori}</span>
                           <h5 className="font-black text-gray-900 mt-2 mb-4">{b.nama_barang}</h5>
                        </div>
                        <div className="bg-gray-50 border p-3 rounded-xl flex justify-between items-center">
                           <span className="text-xs font-bold text-gray-500">Stok:</span>
                           <span className="text-xl font-black text-emerald-600">{b.stok}</span>
                        </div>
                     </div>
                  ))}
                  {daftarInventaris.length === 0 && (
                     <div className="col-span-full text-center py-8 text-gray-400 italic bg-white rounded-2xl">Belum ada data barang di inventaris.</div>
                  )}
               </div>
            </div>
         )}

         {modulSubTab === 'transaksi' && (
            <div className="bg-white p-6 rounded-2xl shadow-md space-y-6">
               {adminView && (
                  <form onSubmit={handleSimpanTransaksiLogistik} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl border">
                     <select required value={formTransaksi.barang_id} onChange={e => setFormTransaksi({...formTransaksi, barang_id: e.target.value})} className="border p-3 rounded-xl md:col-span-2 bg-white text-sm">
                        <option value="">-- Pilih Barang --</option>
                        {daftarInventaris.map(b => <option key={b.id} value={b.id}>{b.nama_barang} (Stok: {b.stok})</option>)}
                     </select>
                     <select required value={formTransaksi.tipe_transaksi} onChange={e => setFormTransaksi({...formTransaksi, tipe_transaksi: e.target.value})} className="border p-3 rounded-xl font-bold text-sm">
                        <option value="masuk">➕ Masuk</option>
                        <option value="keluar">➖ Keluar</option>
                     </select>
                     <input type="number" min="1" placeholder="Qty" required value={formTransaksi.jumlah} onChange={e => setFormTransaksi({...formTransaksi, jumlah: Number(e.target.value)})} className="border p-3 rounded-xl font-black text-center text-sm" />
                     <button type="submit" className="md:col-span-4 bg-blue-600 text-white py-3 rounded-xl font-bold shadow">Catat Mutasi Stok</button>
                  </form>
               )}
               <h4 className="font-bold text-gray-800">Log Histori Mutasi Barang</h4>
               <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm whitespace-nowrap">
                   <thead className="bg-gray-50 text-gray-500 text-[11px] uppercase"><tr><th className="p-3">Tanggal</th><th className="p-3">Barang</th><th className="p-3 text-center">Tipe</th><th className="p-3 text-center">Qty</th><th className="p-3">Keterangan</th></tr></thead>
                   <tbody>
                     {daftarTransaksiLogistik.map(t => (
                        <tr key={t.id} className="border-b">
                           <td className="p-3">{formatTanggalIndo(t.created_at)}</td>
                           <td className="p-3 font-bold">{t.inventaris_logistik?.nama_barang}</td>
                           <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${t.tipe_transaksi === 'masuk' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{t.tipe_transaksi}</span></td>
                           <td className="p-3 font-bold text-center">{t.jumlah}</td>
                           <td className="p-3 text-xs text-gray-500">{t.keterangan || '-'}</td>
                        </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
         )}
      </div>
    );
  }
}
