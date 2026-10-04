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
  // 1. STATE MANAGEMENT GLOBAL & AUTH
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

  // Master Data States
  const [paketList, setPaketList] = useState([]);
  const [daftarSiswa, setDaftarSiswa] = useState([]);
  const [daftarMentor, setDaftarMentor] = useState([]);
  const [daftarPeriode, setDaftarPeriode] = useState([]);
  const [daftarPresensiSiswa, setDaftarPresensiSiswa] = useState([]);
  const [daftarPembayaran, setDaftarPembayaran] = useState([]);
  const [daftarPresensiMentor, setDaftarPresensiMentor] = useState([]);
  const [daftarInventaris, setDaftarInventaris] = useState([]);
  const [daftarTransaksiLogistik, setDaftarTransaksiLogistik] = useState([]);
  const [daftarKonten, setDaftarKonten] = useState([]);

  // Filter & Search States
  const [filterBulanPresensiMentor, setFilterBulanPresensiMentor] = useState(new Date().toISOString().slice(0, 7));
  const [filterBulanPembayaran, setFilterBulanPembayaran] = useState(new Date().toISOString().slice(0, 7));
  const [searchSiswaPembayaran, setSearchSiswaPembayaran] = useState('');
  const [filterStatusPembayaran, setFilterStatusPembayaran] = useState('semua');
  const [filterStatusMentor, setFilterStatusMentor] = useState('aktif');
  const [currentPagePembayaran, setCurrentPagePembayaran] = useState(1);
  const itemsPerPage = 15;

  // Custom Hari Presensi Mentor
  const [customTanggalPresensiGuru, setCustomTanggalPresensiGuru] = useState(new Date().toISOString().split('T')[0]);

  // Web & Landing Page Setup States
  const [pengaturanWeb, setPengaturanWeb] = useState({ 
    id: 1,
    judul_utama: 'Bimbel ErHa', 
    sub_judul: 'Rumah Hebat, Bersahabat & Berprestasi', 
    logo_url: '', 
    no_admin_wa: '6281915058297' 
  });
  const [landingSections, setLandingSections] = useState([]);

  // UI & Modals States
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [showTambahSiswaModal, setShowTambahSiswaModal] = useState(false);
  const [showTambahMentorModal, setShowTambahMentorModal] = useState(false);
  const [showTambahBarangModal, setShowTambahBarangModal] = useState(false);
  const [showTambahKontenModal, setShowTambahKontenModal] = useState(false);

  // Form States
  const [formDaftar, setFormDaftar] = useState({ nama_murid: '', nama_orang_tua: '', no_hp: '', alamat: '', jenjang_sekolah: 'SD' });
  const [selectedPaket, setSelectedPaket] = useState([]);

  const [formSiswaManual, setFormSiswaManual] = useState({ 
    nama_murid: '', nama_orang_tua: '', no_hp: '', alamat: '', jenjang_sekolah: 'SD', paket_id: '',
    bulan_periode: new Date().toISOString().slice(0, 7),
    tanggal_mulai: new Date().toISOString().split('T')[0],
    tanggal_selesai: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
  });

  const [formTambahMentor, setFormTambahMentor] = useState({
    nama_mentor: '', email: '', no_hp: '', alamat: '', password: '', honor_per_jam: 35000,
    akses_inventaris: false, delegasi_inventaris: false, akses_perizinan: false, delegasi_perizinan: false, akses_konten: false, delegasi_konten: false
  });

  const [formBarangBaru, setFormBarangBaru] = useState({ nama_barang: '', kategori: 'Modul', stok: 0, harga_satuan: 0, deskripsi: '' });
  const [formKontenBaru, setFormKontenBaru] = useState({ judul: '', tipe: 'artikel', isi: '', video_url: '' });

  const [formGantiPassword, setFormGantiPassword] = useState({ passwordBaru: '', konfirmasiPassword: '' });

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

  // Check Delegasi Akses Inventaris Mentor
  const canMentorTransactInventory = currentMentorProfile && (currentMentorProfile.akses_inventaris || currentMentorProfile.delegasi_inventaris);

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
      const [siswa, mentor, periode, presensiS, pemb, presensiM, logistik, transLog, konten] = await Promise.all([
        supabase.from('siswa').select('*').order('created_at', { ascending: false }),
        supabase.from('mentor').select('*').order('created_at', { ascending: false }),
        supabase.from('periode_belajar').select('*, siswa(nama_murid, status, no_hp), paket_belajar(nama_paket)').order('created_at', { ascending: false }),
        supabase.from('presensi_siswa').select('*, mentor(nama_mentor), periode_belajar(siswa_id)').order('tanggal_pertemuan', { ascending: false }),
        supabase.from('pembayaran_siswa').select('*, siswa(nama_murid), periode_belajar(bulan_periode)').order('tanggal_pembayaran', { ascending: false }),
        supabase.from('presensi_mentor').select('*, mentor(nama_mentor)').order('tanggal', { ascending: false }),
        supabase.from('inventaris_logistik').select('*').order('nama_barang', { ascending: true }),
        supabase.from('transaksi_logistik').select('*, inventaris_logistik(nama_barang)').order('created_at', { ascending: false }),
        supabase.from('konten_publik').select('*, mentor(nama_mentor)').order('created_at', { ascending: false })
      ]);

      if(siswa.data) setDaftarSiswa(siswa.data);
      if(mentor.data) setDaftarMentor(mentor.data);
      if(periode.data) setDaftarPeriode(periode.data);
      if(presensiS.data) setDaftarPresensiSiswa(presensiS.data);
      if(pemb.data) setDaftarPembayaran(pemb.data);
      if(presensiM.data) setDaftarPresensiMentor(presensiM.data);
      if(logistik.data) setDaftarInventaris(logistik.data);
      if(transLog.data) setDaftarTransaksiLogistik(transLog.data);
      if(konten.data) setDaftarKonten(konten.data);
    } catch(err) {
      console.error('Error fetch global:', err);
    }
  }

  // ==========================================
  // 3. HANDLERS - AUTH & PROFILE
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

  const handleGantiPasswordMentor = async (e) => {
    e.preventDefault();
    if (formGantiPassword.passwordBaru !== formGantiPassword.konfirmasiPassword) {
      return showToast('Konfirmasi kata sandi tidak cocok!', 'error');
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: formGantiPassword.passwordBaru });
    if (error) {
      showToast('Gagal mengubah password: ' + error.message, 'error');
    } else {
      showToast('Password berhasil diperbarui!');
      setFormGantiPassword({ passwordBaru: '', konfirmasiPassword: '' });
    }
    setLoading(false);
  };

  // ==========================================
  // 4. HANDLERS - PENDAFTARAN & ADMIN SISWA
  // ==========================================
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

  const handleTambahSiswaManual = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: sData, error: sErr } = await supabase.from('siswa').insert([{
        nama_murid: formSiswaManual.nama_murid,
        nama_orang_tua: formSiswaManual.nama_orang_tua,
        no_hp: formSiswaManual.no_hp,
        alamat: formSiswaManual.alamat,
        jenjang_sekolah: formSiswaManual.jenjang_sekolah,
        status: 'aktif'
      }]).select();

      if (sErr) throw sErr;

      if (sData && sData[0]) {
        await supabase.from('periode_belajar').insert([{
          siswa_id: sData[0].id,
          paket_id: formSiswaManual.paket_id,
          bulan_periode: formSiswaManual.bulan_periode,
          tanggal_mulai: formSiswaManual.tanggal_mulai,
          tanggal_selesai: formSiswaManual.tanggal_selesai,
          status_periode: 'berjalan',
          total_pertemuan: 12
        }]);

        await supabase.from('pembayaran_siswa').insert([{
          siswa_id: sData[0].id,
          item_bayar: 'Paket Belajar Bulanan Awal',
          jumlah_bayar: 0,
          status_pembayaran: 'Belum Lunas'
        }]);
      }

      showToast('Siswa berhasil ditambahkan & Periode Aktif!');
      setShowTambahSiswaModal(false);
      setFormSiswaManual({ nama_murid: '', nama_orang_tua: '', no_hp: '', alamat: '', jenjang_sekolah: 'SD', paket_id: '', bulan_periode: new Date().toISOString().slice(0, 7), tanggal_mulai: new Date().toISOString().split('T')[0], tanggal_selesai: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0] });
      fetchAllData();
    } catch(err) {
      showToast('Gagal tambah siswa: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

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

  const handleRolloverPeriode = async (siswa, pLama) => {
    if (!window.confirm(`Lanjutkan (Rollover) periode belajar untuk ${siswa.nama_murid}?`)) return;
    setLoading(true);
    try {
      // Set periode lama menjadi selesai
      await supabase.from('periode_belajar').update({ status_periode: 'selesai', status_rollover: 'selesai' }).eq('id', pLama.id);

      // Hitung tanggal baru (+1 bulan)
      const tglMulaiBaru = pLama.tanggal_selesai ? pLama.tanggal_selesai : new Date().toISOString().split('T')[0];
      const dSelesai = new Date(tglMulaiBaru);
      dSelesai.setMonth(dSelesai.getMonth() + 1);
      const tglSelesaiBaru = dSelesai.toISOString().split('T')[0];
      const bulanBaru = tglMulaiBaru.slice(0, 7);

      // Buat periode baru
      await supabase.from('periode_belajar').insert([{
        siswa_id: siswa.id,
        paket_id: pLama.paket_id,
        bulan_periode: bulanBaru,
        tanggal_mulai: tglMulaiBaru,
        tanggal_selesai: tglSelesaiBaru,
        status_periode: 'berjalan',
        total_pertemuan: 12
      }]);

      showToast('Rollover periode berhasil dibuat!');
      fetchAllData();
    } catch(err) {
      showToast('Gagal rollover: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 5. HANDLERS - MENTOR & PRESENSI ADMIN
  // ==========================================
  const handleTambahMentorSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Auth SignUp
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: formTambahMentor.email,
        password: formTambahMentor.password
      });

      if (authErr) throw authErr;

      // 2. Insert ke public.mentor
      const { error: mErr } = await supabase.from('mentor').insert([{
        nama_mentor: formTambahMentor.nama_mentor,
        email: formTambahMentor.email,
        no_hp: formTambahMentor.no_hp,
        alamat: formTambahMentor.alamat,
        honor_per_jam: formTambahMentor.honor_per_jam,
        password: formTambahMentor.password,
        status: 'aktif',
        akses_inventaris: formTambahMentor.akses_inventaris,
        delegasi_inventaris: formTambahMentor.delegasi_inventaris,
        akses_perizinan: formTambahMentor.akses_perizinan,
        delegasi_perizinan: formTambahMentor.delegasi_perizinan,
        akses_konten: formTambahMentor.akses_konten,
        delegasi_konten: formTambahMentor.delegasi_konten
      }]);

      if (mErr) throw mErr;

      showToast('Mentor baru berhasil didaftarkan!');
      setShowTambahMentorModal(false);
      setFormTambahMentor({ nama_mentor: '', email: '', no_hp: '', alamat: '', password: '', honor_per_jam: 35000, akses_inventaris: false, delegasi_inventaris: false, akses_perizinan: false, delegasi_perizinan: false, akses_konten: false, delegasi_konten: false });
      fetchAllData();
    } catch(err) {
      showToast('Gagal registrasi mentor: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatusMentor = async (mentorId, statusSaatIni) => {
    const statusBaru = statusSaatIni === 'aktif' ? 'non-aktif' : 'aktif';
    await supabase.from('mentor').update({ status: statusBaru }).eq('id', mentorId);
    showToast(`Status mentor diubah ke ${statusBaru}`);
    fetchAllData();
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
  // 6. HANDLERS - PEMBAYARAN, LOGISTIK & SETUP WEB
  // ==========================================
  const filteredPembayaran = daftarPembayaran.filter(pb => {
    const matchBulan = filterBulanPembayaran ? pb.tanggal_pembayaran?.startsWith(filterBulanPembayaran) : true;
    const matchNama = searchSiswaPembayaran ? pb.siswa?.nama_murid?.toLowerCase().includes(searchSiswaPembayaran.toLowerCase()) : true;
    const matchStatus = filterStatusPembayaran !== 'semua' ? pb.status_pembayaran === filterStatusPembayaran : true;
    return matchBulan && matchNama && matchStatus;
  });

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

  // INVENTARIS
  const handleTambahBarangBaru = async (e) => {
    e.preventDefault();
    await supabase.from('inventaris_logistik').insert([formBarangBaru]);
    showToast('Barang inventaris baru ditambahkan!');
    setShowTambahBarangModal(false);
    setFormBarangBaru({ nama_barang: '', kategori: 'Modul', stok: 0, harga_satuan: 0, deskripsi: '' });
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

  // SETUP WEB & LANDING SECTIONS
  const handleSimpanPengaturanWeb = async (e) => {
    e.preventDefault();
    await supabase.from('pengaguran_web').upsert([pengaturanWeb]);
    showToast('Pengaturan website berhasil disimpan!');
    fetchPengaturanWeb();
  };

  const handleToggleSection = async (secId, currentStatus) => {
    await supabase.from('landing_sections').update({ is_aktif: !currentStatus }).eq('id', secId);
    showToast('Status section diperbarui!');
    fetchPengaturanWeb();
  };

  const handleTambahKonten = async (e) => {
    e.preventDefault();
    await supabase.from('konten_publik').insert([{
      ...formKontenBaru,
      mentor_id: currentMentorProfile?.id || null
    }]);
    showToast('Konten publik baru dipublikasikan!');
    setShowTambahKontenModal(false);
    setFormKontenBaru({ judul: '', tipe: 'artikel', isi: '', video_url: '' });
    fetchAllData();
  };

  // ==========================================
  // 7. HANDLERS - GURU PRESENSI SISWA
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

  // Kalkulasi Mentor Dashboard
  const jamBulanIniCurrentMentor = daftarPresensiMentor
    .filter(pm => pm.mentor_id === currentMentorProfile?.id && pm.tanggal?.startsWith(new Date().toISOString().slice(0, 7)))
    .reduce((sum, pm) => sum + (Number(pm.total_jam) || 0), 0);

  const estimasiPenghasilanBulanIni = jamBulanIniCurrentMentor * (Number(currentMentorProfile?.honor_per_jam) || 0);

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
                      {['dashboard','siswa','mentor','pembayaran','modul','setup'].map(tab => (
                        <button key={tab} onClick={() => { setAdminTab(tab); setIsSidebarOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-sm transition capitalize ${adminTab === tab ? 'bg-purple-900 text-white shadow-lg' : 'text-gray-600 hover:bg-purple-50'}`}>
                          <span>{tab==='dashboard'?'📊':tab==='siswa'?'📋':tab==='mentor'?'👩‍🏫':tab==='pembayaran'?'💵':tab==='modul'?'📦':'⚙️'}</span> 
                          <span>{tab==='setup'?'Setup & Konten':tab}</span>
                        </button>
                      ))}
                    </>
                  ) : (
                    <>
                      {['beranda','presensi','modul','profil'].map(tab => (
                        <button key={tab} onClick={() => { setGuruTab(tab); setIsSidebarOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-sm transition capitalize ${guruTab === tab ? 'bg-purple-900 text-white shadow-lg' : 'text-gray-600 hover:bg-purple-50'}`}>
                          <span>{tab==='beranda'?'🏠':tab==='presensi'?'📝':tab==='modul'?'📦':'👤'}</span> 
                          <span>{tab==='profil'?'Profil & Keamanan':tab}</span>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </aside>

            {/* DASHBOARD KONTEN UTAMA */}
            <div className="flex-1 overflow-x-hidden space-y-6">
              
              {/* ======================================================= */}
              {/* PORTAL ADMIN                                            */}
              {/* ======================================================= */}
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
                          <p className="text-xs font-bold text-gray-400 uppercase">Mentor Aktif</p>
                          <h4 className="text-3xl font-black text-emerald-600">{daftarMentor.filter(m => m.status === 'aktif').length}</h4>
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
                      <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                        <div className="flex space-x-2">
                          <button onClick={() => setSiswaSubTab('persetujuan')} className={`px-4 py-2 rounded-xl font-bold text-xs ${siswaSubTab === 'persetujuan' ? 'bg-amber-400 text-purple-950 shadow' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Persetujuan Baru ({daftarSiswa.filter(s=>s.status==='pending').length})</button>
                          <button onClick={() => setSiswaSubTab('data')} className={`px-4 py-2 rounded-xl font-bold text-xs ${siswaSubTab === 'data' ? 'bg-purple-900 text-white shadow' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Data Siswa Aktif</button>
                        </div>
                        <button onClick={() => setShowTambahSiswaModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-black shadow">+ Tambah Siswa Manual</button>
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

                      {/* SUBTAB: DATA AKTIF */}
                      {siswaSubTab === 'data' && (
                        <div className="bg-white rounded-3xl p-6 border shadow-sm">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-purple-50">
                              <tr><th className="p-4 rounded-tl-xl">Nama & Periode Aktif</th><th className="p-4 text-center">Progress Sesi</th><th className="p-4 text-center rounded-tr-xl">Aksi Periode</th></tr>
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
                                    <tr className={`border-t cursor-pointer hover:bg-gray-50 transition-colors ${isExpanded ? 'bg-purple-50/50' : ''}`}>
                                      <td className="p-4" onClick={() => setExpandedStudentId(isExpanded ? null : s.id)}>
                                        <div className="font-bold text-gray-900">{s.nama_murid} <span className="text-[10px] font-black bg-gray-200 px-2 py-0.5 rounded-full uppercase">{s.jenjang_sekolah}</span></div>
                                        {pAktif ? (
                                          <div className="text-xs text-gray-500 mt-1">
                                            {formatTanggalIndo(pAktif.tanggal_mulai)} s/d {formatTanggalIndo(pAktif.tanggal_selesai)} 
                                            {isLate && <span className="ml-2 text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded">(Melewati Batas)</span>}
                                          </div>
                                        ) : <div className="text-xs text-amber-500 font-bold mt-1">Belum ada periode aktif.</div>}
                                      </td>
                                      <td className="p-4 text-center" onClick={() => setExpandedStudentId(isExpanded ? null : s.id)}>
                                        <span className="text-xs bg-purple-100 text-purple-800 px-3 py-1.5 rounded-xl font-bold border border-purple-200">{count}/12 Sesi ▼</span>
                                      </td>
                                      <td className="p-4 text-center">
                                        {pAktif && (count >= 12 || isLate) && (
                                          <button onClick={() => handleRolloverPeriode(s, pAktif)} className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-purple-950 font-black px-3 py-1.5 rounded-xl text-xs shadow">🔄 Rollover Periode</button>
                                        )}
                                      </td>
                                    </tr>
                                    {isExpanded && pAktif && (
                                      <tr className="bg-gray-50 border-b-2 border-purple-200">
                                        <td colSpan="3" className="p-6">
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

                  {/* TAB MENTOR */}
                  {adminTab === 'mentor' && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                        <div className="flex space-x-2">
                          <button onClick={() => setMentorSubTab('daftar')} className={`px-4 py-2 rounded-xl font-bold text-xs ${mentorSubTab === 'daftar' ? 'bg-purple-900 text-white' : 'bg-white text-gray-600'}`}>Daftar Mentor</button>
                          <button onClick={() => setMentorSubTab('presensi')} className={`px-4 py-2 rounded-xl font-bold text-xs ${mentorSubTab === 'presensi' ? 'bg-purple-900 text-white' : 'bg-white text-gray-600'}`}>Presensi & Hitung Jam</button>
                        </div>
                        {mentorSubTab === 'daftar' && (
                          <button onClick={() => setShowTambahMentorModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-black shadow">+ Tambah Mentor Baru</button>
                        )}
                      </div>
                      
                      {mentorSubTab === 'daftar' && (
                        <div className="bg-white rounded-3xl p-6 shadow-sm border space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="font-black text-gray-900">Manajemen Akses & Status Mentor</h3>
                            <select value={filterStatusMentor} onChange={e => setFilterStatusMentor(e.target.value)} className="border p-2 rounded-xl text-xs font-bold bg-gray-50">
                              <option value="aktif">Status: Aktif</option>
                              <option value="non-aktif">Status: Non-Aktif</option>
                            </select>
                          </div>
                          <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50">
                              <tr><th className="p-3 rounded-tl-xl">Mentor</th><th className="p-3">Honor/Jam</th><th className="p-3">Delegasi Logistik</th><th className="p-3 text-center rounded-tr-xl">Aksi Status</th></tr>
                            </thead>
                            <tbody>
                              {daftarMentor.filter(m => m.status === filterStatusMentor).map(m => (
                                <tr key={m.id} className="border-t hover:bg-gray-50">
                                  <td className="p-3 font-bold">{m.nama_mentor} <span className="block text-xs font-normal text-gray-500">{m.email}</span></td>
                                  <td className="p-3 font-bold text-emerald-600">Rp {(Number(m.honor_per_jam)||0).toLocaleString('id-ID')}</td>
                                  <td className="p-3">
                                    {(m.akses_inventaris || m.delegasi_inventaris) ? <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-1 rounded-full">✓ Diizinkan</span> : <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded-full">Hanya Lihat Stok</span>}
                                  </td>
                                  <td className="p-3 text-center">
                                    <button onClick={() => handleToggleStatusMentor(m.id, m.status)} className={`px-3 py-1.5 rounded-xl text-xs font-bold ${m.status === 'aktif' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                      {m.status === 'aktif' ? 'Non-aktifkan' : 'Aktifkan Kembali'}
                                    </button>
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

                      {/* FILTER & PENCARIAN PEMBAYARAN */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-purple-50 p-4 rounded-2xl border border-purple-100">
                        <input type="text" placeholder="🔍 Cari nama siswa..." value={searchSiswaPembayaran} onChange={e => setSearchSiswaPembayaran(e.target.value)} className="border p-3 rounded-xl text-xs font-bold bg-white" />
                        <select value={filterStatusPembayaran} onChange={e => setFilterStatusPembayaran(e.target.value)} className="border p-3 rounded-xl text-xs font-bold bg-white">
                          <option value="semua">Semua Status</option>
                          <option value="lunas">Lunas</option>
                          <option value="Belum Lunas">Belum Lunas</option>
                        </select>
                        <input type="month" value={filterBulanPembayaran} onChange={e => {setFilterBulanPembayaran(e.target.value); setCurrentPagePembayaran(1);}} className="border p-3 rounded-xl text-xs font-bold bg-white" />
                      </div>

                      <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                        <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Total Penerimaan Filtered</p>
                        <h2 className="text-4xl font-black text-emerald-600 mt-1">Rp {totalPenerimaanBulanan.toLocaleString('id-ID')}</h2>
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
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* TAB INVENTARIS LOGISTIK */}
                  {adminTab === 'modul' && (
                    <div className="bg-white rounded-3xl p-6 shadow-sm border space-y-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-2xl font-black text-gray-900">Inventaris & Modul 📦</h3>
                          <p className="text-xs text-gray-500">Kelola item logistik, modul, dan stok gudang.</p>
                        </div>
                        <button onClick={() => setShowTambahBarangModal(true)} className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-black shadow">+ Barang Baru</button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {daftarInventaris.map(b => (
                          <div key={b.id} className="border border-gray-100 p-6 rounded-3xl bg-white shadow-sm flex flex-col justify-between hover:shadow-xl transition-shadow">
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full">{b.kategori}</span>
                              <h5 className="font-bold text-gray-900 mt-4 text-lg leading-tight">{b.nama_barang}</h5>
                              <p className="text-xs text-gray-400 mt-1">Rp {(Number(b.harga_satuan)||0).toLocaleString('id-ID')}/satuan</p>
                            </div>
                            <div className="mt-6">
                              <div className="bg-gray-50 border p-3 rounded-2xl mb-4 text-center">
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Stok Gudang</p>
                                <p className="text-2xl font-black text-gray-800">{b.stok}</p>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => openTransaksiModal(b, 'Masuk')} className="flex-1 bg-emerald-100 text-emerald-800 text-xs font-black py-2.5 rounded-xl transition">IN [+]</button>
                                <button onClick={() => openTransaksiModal(b, 'Keluar')} className="flex-1 bg-red-100 text-red-800 text-xs font-black py-2.5 rounded-xl transition">OUT [-]</button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-6 border-t">
                        <h4 className="font-extrabold text-gray-900 mb-4 text-sm">Riwayat Transaksi Logistik Terakhir</h4>
                        <table className="w-full text-left text-xs">
                          <thead className="bg-gray-50"><tr><th className="p-3">Waktu</th><th className="p-3">Barang</th><th className="p-3">Tipe</th><th className="p-3">Jumlah</th><th className="p-3">Keterangan</th></tr></thead>
                          <tbody>
                            {daftarTransaksiLogistik.slice(0, 10).map(t => (
                              <tr key={t.id} className="border-t">
                                <td className="p-3">{formatTanggalIndo(t.created_at)}</td>
                                <td className="p-3 font-bold">{t.inventaris_logistik?.nama_barang}</td>
                                <td className="p-3 font-bold">{t.tipe_transaksi === 'Masuk' ? <span className="text-emerald-600">[+] Masuk</span> : <span className="text-red-600">[-] Keluar</span>}</td>
                                <td className="p-3 font-black">{t.jumlah}</td>
                                <td className="p-3 text-gray-500">{t.keterangan || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* TAB SETUP & KONTEN */}
                  {adminTab === 'setup' && (
                    <div className="space-y-8">
                      {/* Form Pengaturan Web */}
                      <div className="bg-white rounded-3xl p-6 shadow-sm border space-y-4">
                        <h3 className="text-xl font-black text-[#581878]">Pengaturan Informasi Website (`pengaguran_web`)</h3>
                        <form onSubmit={handleSimpanPengaturanWeb} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input type="text" placeholder="Judul Utama" required value={pengaturanWeb.judul_utama || ''} onChange={e => setPengaturanWeb({...pengaturanWeb, judul_utama: e.target.value})} className="border p-3.5 rounded-2xl text-sm font-bold bg-gray-50" />
                          <input type="text" placeholder="Sub Judul" required value={pengaturanWeb.sub_judul || ''} onChange={e => setPengaturanWeb({...pengaturanWeb, sub_judul: e.target.value})} className="border p-3.5 rounded-2xl text-sm bg-gray-50" />
                          <input type="text" placeholder="URL Logo" value={pengaturanWeb.logo_url || ''} onChange={e => setPengaturanWeb({...pengaturanWeb, logo_url: e.target.value})} className="border p-3.5 rounded-2xl text-sm bg-gray-50" />
                          <input type="text" placeholder="No WA Admin" required value={pengaturanWeb.no_admin_wa || ''} onChange={e => setPengaturanWeb({...pengaturanWeb, no_admin_wa: e.target.value})} className="border p-3.5 rounded-2xl text-sm font-bold bg-gray-50" />
                          <button type="submit" className="md:col-span-2 bg-[#581878] text-white py-3.5 rounded-2xl font-black text-sm shadow">Simpan Identitas Website</button>
                        </form>
                      </div>

                      {/* Setup Landing Sections */}
                      <div className="bg-white rounded-3xl p-6 shadow-sm border space-y-4">
                        <h3 className="text-xl font-black text-gray-900">Kelola Section Landing Page (`landing_sections`)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {landingSections.map(sec => (
                            <div key={sec.id} className="border p-4 rounded-2xl flex justify-between items-center bg-gray-50">
                              <div>
                                <h5 className="font-bold text-gray-900 text-sm">{sec.nama_section}</h5>
                                <p className="text-xs text-gray-400">Key: {sec.section_key} | Urutan: {sec.urutan}</p>
                              </div>
                              <button onClick={() => handleToggleSection(sec.id, sec.is_aktif)} className={`px-4 py-2 rounded-xl text-xs font-black ${sec.is_aktif ? 'bg-emerald-600 text-white' : 'bg-gray-300 text-gray-700'}`}>
                                {sec.is_aktif ? 'Aktif' : 'Non-Aktif'}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Konten Publik */}
                      <div className="bg-white rounded-3xl p-6 shadow-sm border space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-xl font-black text-gray-900">Artikel & Konten Edukasi Publik</h3>
                          <button onClick={() => setShowTambahKontenModal(true)} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-black">+ Buat Artikel/Video</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {daftarKonten.map(k => (
                            <div key={k.id} className="border p-4 rounded-2xl bg-gray-50">
                              <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded uppercase">{k.tipe}</span>
                              <h5 className="font-bold text-gray-900 mt-2">{k.judul}</h5>
                              <p className="text-xs text-gray-500 line-clamp-2 mt-1">{k.isi}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ======================================================= */}
              {/* PORTAL GURU                                             */}
              {/* ======================================================= */}
              {userRole === 'guru' && (
                <>
                  {/* DASHBOARD MENTOR: REKAP JAM & ESTIMASI PENGHASILAN */}
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

                  {/* PRESENSI SISWA & REKAP HARIAN CUSTOM */}
                  {guruTab === 'presensi' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Input Presensi */}
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

                      {/* Rekap Presensi Siswa Harian Custom Hari */}
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

                  {/* MODUL INVENTARIS MENTOR (LIHAT STOK & DELEGASI TRANSAKSI) */}
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

                  {/* PROFIL & GANTI PASSWORD MENTOR */}
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
      {/* ========================================== */}
      {/* MODAL POPUPS UTAMA                         */}
      {/* ========================================== */}
      
      {/* MODAL TAMBAH SISWA MANUAL (ADMIN) */}
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
              <select required value={formSiswaManual.paket_id} onChange={e => setFormSiswaManual({...formSiswaManual, paket_id: e.target.value})} className="w-full border p-3.5 rounded-2xl text-sm bg-gray-50 font-bold"><option value="">Pilih Paket Belajar</option>{paketList.map(p => <option key={p.id} value={p.id}>{p.nama_paket}</option>)}</select>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[10px] font-bold block mb-1">Mulai:</label><input type="date" required value={formSiswaManual.tanggal_mulai} onChange={e => setFormSiswaManual({...formSiswaManual, tanggal_mulai: e.target.value})} className="w-full border p-3 rounded-xl text-xs" /></div>
                <div><label className="text-[10px] font-bold block mb-1">Selesai:</label><input type="date" required value={formSiswaManual.tanggal_selesai} onChange={e => setFormSiswaManual({...formSiswaManual, tanggal_selesai: e.target.value})} className="w-full border p-3 rounded-xl text-xs" /></div>
              </div>
              <div className="flex justify-end space-x-3 pt-4"><button type="button" onClick={() => setShowTambahSiswaModal(false)} className="px-5 py-3 bg-gray-200 rounded-xl text-xs font-bold">Batal</button><button type="submit" className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-xs font-black shadow">Simpan Siswa</button></div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH MENTOR BARU (ADMIN AUTH & DELEGASI) */}
      {showTambahMentorModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-black text-2xl text-[#581878] mb-4">Registrasi Mentor Baru</h3>
            <form onSubmit={handleTambahMentorSubmit} className="space-y-4">
              <input type="text" placeholder="Nama Mentor" required value={formTambahMentor.nama_mentor} onChange={e => setFormTambahMentor({...formTambahMentor, nama_mentor: e.target.value})} className="w-full border p-3.5 rounded-2xl text-sm bg-gray-50 font-bold" />
              <input type="email" placeholder="Email Akun Login" required value={formTambahMentor.email} onChange={e => setFormTambahMentor({...formTambahMentor, email: e.target.value})} className="w-full border p-3.5 rounded-2xl text-sm bg-gray-50 font-bold" />
              <input type="password" placeholder="Password Awal" required value={formTambahMentor.password} onChange={e => setFormTambahMentor({...formTambahMentor, password: e.target.value})} className="w-full border p-3.5 rounded-2xl text-sm bg-gray-50 font-bold" />
              <div className="grid grid-cols-2 gap-3">
                <input type="tel" placeholder="No HP" required value={formTambahMentor.no_hp} onChange={e => setFormTambahMentor({...formTambahMentor, no_hp: e.target.value})} className="border p-3.5 rounded-2xl text-sm bg-gray-50" />
                <input type="number" placeholder="Honor/Jam" required value={formTambahMentor.honor_per_jam} onChange={e => setFormTambahMentor({...formTambahMentor, honor_per_jam: Number(e.target.value)})} className="border p-3.5 rounded-2xl text-sm bg-gray-50 font-bold text-emerald-700" />
              </div>
              <div className="border p-4 rounded-2xl bg-purple-50/50 space-y-2">
                <p className="text-xs font-black text-purple-900 uppercase">Delegasi Hak Akses:</p>
                <label className="text-xs flex items-center"><input type="checkbox" checked={formTambahMentor.delegasi_inventaris} onChange={e => setFormTambahMentor({...formTambahMentor, delegasi_inventaris: e.target.checked, akses_inventaris: e.target.checked})} className="mr-2" /> Izinkan Transaksi Inventaris/Modul</label>
              </div>
              <div className="flex justify-end space-x-3 pt-4"><button type="button" onClick={() => setShowTambahMentorModal(false)} className="px-5 py-3 bg-gray-200 rounded-xl text-xs font-bold">Batal</button><button type="submit" className="px-6 py-3 bg-[#581878] text-white rounded-xl text-xs font-black shadow">Daftarkan Mentor</button></div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH BARANG INVENTARIS */}
      {showTambahBarangModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 shadow-2xl">
            <h3 className="font-black text-2xl text-gray-900 mb-4">Tambah Item Logistik</h3>
            <form onSubmit={handleTambahBarangBaru} className="space-y-4">
              <input type="text" placeholder="Nama Barang/Modul" required value={formBarangBaru.nama_barang} onChange={e => setFormBarangBaru({...formBarangBaru, nama_barang: e.target.value})} className="w-full border p-3.5 rounded-2xl text-sm font-bold bg-gray-50" />
              <select value={formBarangBaru.kategori} onChange={e => setFormBarangBaru({...formBarangBaru, kategori: e.target.value})} className="w-full border p-3.5 rounded-2xl text-sm font-bold bg-gray-50"><option value="Modul">Modul</option><option value="Buku">Buku</option><option value="Seragam">Seragam</option><option value="Fasilitas">Fasilitas</option></select>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Stok Awal" required value={formBarangBaru.stok} onChange={e => setFormBarangBaru({...formBarangBaru, stok: parseInt(e.target.value)})} className="border p-3.5 rounded-2xl text-sm bg-gray-50 font-bold" />
                <input type="number" placeholder="Harga Satuan" required value={formBarangBaru.harga_satuan} onChange={e => setFormBarangBaru({...formBarangBaru, harga_satuan: parseFloat(e.target.value)})} className="border p-3.5 rounded-2xl text-sm bg-gray-50" />
              </div>
              <div className="flex justify-end space-x-3 pt-4"><button type="button" onClick={() => setShowTambahBarangModal(false)} className="px-5 py-3 bg-gray-200 rounded-xl text-xs font-bold">Batal</button><button type="submit" className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-xs font-black shadow">Simpan Item</button></div>
            </form>
          </div>
        </div>
      )}

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
              <div><label className="text-xs font-bold block mb-1.5 text-gray-600">Catatan (Opsional):</label><input type="text" placeholder="Cth: Penyerahan ke siswa X" value={formTransaksi.keterangan} onChange={e => setFormTransaksi({...formTransaksi, keterangan: e.target.value})} className="w-full border p-4 rounded-2xl text-sm bg-gray-50" /></div>
              <div className="flex justify-end space-x-3 pt-2"><button type="button" onClick={() => setShowTransaksiModal(false)} className="px-6 py-3.5 bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition hover:bg-gray-300">Batal</button><button type="submit" className={`px-6 py-3.5 text-white rounded-xl text-sm font-black shadow-lg transition ${formTransaksi.tipe_transaksi === 'Masuk' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>Simpan Transaksi</button></div>
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

      {/* MODAL TAMBAH KONTEN PUBIK */}
      {showTambahKontenModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl">
            <h3 className="font-black text-2xl text-gray-900 mb-4">Konten Publik Baru</h3>
            <form onSubmit={handleTambahKonten} className="space-y-4">
              <input type="text" placeholder="Judul Artikel / Video" required value={formKontenBaru.judul} onChange={e => setFormKontenBaru({...formKontenBaru, judul: e.target.value})} className="w-full border p-3.5 rounded-2xl text-sm font-bold bg-gray-50" />
              <select value={formKontenBaru.tipe} onChange={e => setFormKontenBaru({...formKontenBaru, tipe: e.target.value})} className="w-full border p-3.5 rounded-2xl text-sm font-bold bg-gray-50"><option value="artikel">Artikel</option><option value="video">Video</option></select>
              <textarea placeholder="Isi Konten / Deskripsi Singkat" value={formKontenBaru.isi} onChange={e => setFormKontenBaru({...formKontenBaru, isi: e.target.value})} className="w-full border p-3.5 rounded-2xl text-sm bg-gray-50" rows="3" />
              <input type="text" placeholder="URL Video (Jika tipe video)" value={formKontenBaru.video_url} onChange={e => setFormKontenBaru({...formKontenBaru, video_url: e.target.value})} className="w-full border p-3.5 rounded-2xl text-sm bg-gray-50" />
              <div className="flex justify-end space-x-3 pt-4"><button type="button" onClick={() => setShowTambahKontenModal(false)} className="px-5 py-3 bg-gray-200 rounded-xl text-xs font-bold">Batal</button><button type="submit" className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-xs font-black shadow">Terbitkan</button></div>
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
