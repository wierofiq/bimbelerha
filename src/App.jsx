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

  const handleGantiPasswordGuru = async (e) => {
    e.preventDefault();
    if (!newPasswordGuru || newPasswordGuru.length < 6) return alert('Password minimal 6 karakter!');
    const { error } = await supabase.auth.updateUser({ password: newPasswordGuru });
    if (error) alert('Gagal mengubah password: ' + error.message);
    else { alert('✅ Password berhasil diperbarui!'); setShowEditPasswordModal(false); setNewPasswordGuru(''); }
  };

  // ==========================================
  // 4. HANDLERS - ADMIN (SISWA)
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
  // HANDLERS - MENTOR
  // ==========================================
  const handleTambahMentor = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await supabase.auth.signUp({ email: newMentor.email, password: newMentor.password, options: { data: { role: 'guru' } } });
      const { error: errDb } = await supabase.from('mentor').insert([{ nama_mentor: newMentor.nama_mentor, email: newMentor.email, no_hp: newMentor.no_hp, alamat: newMentor.alamat, honor_per_jam: newMentor.honor_per_jam, status: newMentor.status }]);
      if (errDb) throw errDb;
      alert('✅ Mentor berhasil didaftarkan! Mengarahkan ke WhatsApp...');
      const waText = `Halo Kak ${newMentor.nama_mentor},\nAkun Portal Pengajar Bimbel ErHa Anda telah aktif.\n\nLogin URL: ${window.location.origin}\nEmail: ${newMentor.email}\nPassword: ${newMentor.password}`;
      window.open(`https://wa.me/${newMentor.no_hp.replace(/^0/, '62')}?text=${encodeURIComponent(waText)}`, '_blank');
      setNewMentor({ nama_mentor: '', email: '', password: '', no_hp: '', alamat: '', honor_per_jam: 25000, status: 'aktif' });
      fetchAllData();
    } catch (err) { alert('Gagal menambah mentor: ' + err.message); } finally { setLoading(false); }
  };

  const handleToggleAksesInventaris = async (mentorId, currentAkses) => {
    const aksi = currentAkses ? 'MENCABUT' : 'MEMBERIKAN';
    if (window.confirm(`Anda yakin ingin ${aksi} delegasi akses modul/inventaris untuk mentor ini?`)) {
      const { error } = await supabase.from('mentor').update({ akses_inventaris: !currentAkses }).eq('id', mentorId);
      if (error) alert('Gagal memperbarui hak akses: ' + error.message);
      else { alert('✅ Hak akses delegasi berhasil diperbarui!'); fetchAllData(); }
    }
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
  // HANDLERS - MODUL & TRANSAKSI LOGISTIK
  // ==========================================
  const handleTambahModul = async (e) => {
    e.preventDefault();
    await supabase.from('inventaris_logistik').insert([formModul]);
    alert('✅ Modul/Barang ditambahkan!');
    setFormModul({ nama_barang: '', kategori: 'Buku', stok: 0, harga_satuan: 0, deskripsi: '', thumbnail: '' });
    fetchAllData();
  };

  const handleHapusModul = async (id) => {
    if(!window.confirm('Hapus modul ini beserta transaksinya?')) return;
    await supabase.from('transaksi_logistik').delete().eq('barang_id', id);
    await supabase.from('inventaris_logistik').delete().eq('id', id);
    fetchAllData();
  };

  const handleSimpanTransaksiLogistik = async (e) => {
    e.preventDefault();
    const barang = daftarInventaris.find(b => b.id === formTransaksi.barang_id);
    if (!barang) return;
    if (formTransaksi.tipe_transaksi === 'keluar' && barang.stok < formTransaksi.jumlah) return alert('Stok tidak mencukupi untuk transaksi keluar!');
    
    await supabase.from('transaksi_logistik').insert([formTransaksi]);
    const stokBaru = formTransaksi.tipe_transaksi === 'masuk' ? barang.stok + formTransaksi.jumlah : barang.stok - formTransaksi.jumlah;
    await supabase.from('inventaris_logistik').update({ stok: stokBaru }).eq('id', barang.id);
    
    alert('✅ Transaksi berhasil dicatat & Stok diupdate!');
    setFormTransaksi({ barang_id: '', tipe_transaksi: 'masuk', jumlah: 1, keterangan: '' });
    fetchAllData();
  };

  const handleHapusTransaksiLogistik = async (transaksi) => {
    if(!window.confirm('Hapus histori ini? Stok akan direvert kembali.')) return;
    const barang = daftarInventaris.find(b => b.id === transaksi.barang_id);
    if (barang) {
      const stokRevert = transaksi.tipe_transaksi === 'masuk' ? barang.stok - transaksi.jumlah : barang.stok + transaksi.jumlah;
      await supabase.from('inventaris_logistik').update({ stok: stokRevert }).eq('id', barang.id);
    }
    await supabase.from('transaksi_logistik').delete().eq('id', transaksi.id);
    alert('Histori dihapus dan stok dikembalikan!');
    fetchAllData();
  };

  // ==========================================
  // HANDLERS - GURU (PRESENSI & PUBLIC)
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
    setSearchSiswaPresensi(''); 
    fetchAllData();
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
      window.open(`https://wa.me/6281915058297?text=${encodeURIComponent(waText)}`, '_blank');
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
            <img src="/logo.png" alt="Bimbel ErHa Logo" className="h-10 w-10 object-contain bg-white rounded-full p-1 shadow-sm" />
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
                <button onClick={() => setAdminTab('modul')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm whitespace-nowrap ${adminTab === 'modul' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600'}`}>📚 MODUL & INVENTARIS</button>
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

                  {/* SUB-TAB: PERSETUJUAN */}
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
                          {daftarSiswa.filter(s => s.status === 'pending').length === 0 && (
                            <tr><td colSpan="4" className="text-center p-6 text-gray-500 italic">Tidak ada pendaftaran baru.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* SUB-TAB: TAMBAH MANUAL */}
                  {siswaSubTab === 'tambah_manual' && (
                    <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-purple-100">
                      <h3 className="text-lg font-bold text-[#581878] mb-4">Form Tambah Siswa</h3>
                      <form onSubmit={handleTambahSiswaManual} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Nama Murid" required value={formSiswaManual.nama_murid} onChange={e => setFormSiswaManual({...formSiswaManual, nama_murid: e.target.value})} className="border p-3 rounded-xl" />
                        <input type="text" placeholder="Nama Wali" required value={formSiswaManual.nama_orang_tua} onChange={e => setFormSiswaManual({...formSiswaManual, nama_orang_tua: e.target.value})} className="border p-3 rounded-xl" />
                        <input type="text" placeholder="No WhatsApp Aktif" value={formSiswaManual.no_hp} onChange={e => setFormSiswaManual({...formSiswaManual, no_hp: e.target.value})} className="border p-3 rounded-xl" />
                        <div className="grid grid-cols-2 gap-2">
                           <div>
                              <label className="text-[10px] font-bold text-gray-500 block mb-1">Periode Bulan:</label>
                              <input type="month" required value={formSiswaManual.bulan_periode} onChange={e => setFormSiswaManual({...formSiswaManual, bulan_periode: e.target.value})} className="border p-3 rounded-xl w-full text-sm outline-none focus:border-purple-500" />
                           </div>
                           <div>
                              <label className="text-[10px] font-bold text-gray-500 block mb-1">Jenjang:</label>
                              <select value={formSiswaManual.jenjang_sekolah} onChange={e => setFormSiswaManual({...formSiswaManual, jenjang_sekolah: e.target.value})} className="border p-3 rounded-xl w-full text-sm bg-white outline-none">
                                 <option value="TK">TK</option><option value="SD">SD</option><option value="SMP">SMP</option>
                              </select>
                           </div>
                        </div>
                        <div>
                           <label className="text-[10px] font-bold text-gray-500 block mb-1">Tanggal Mulai Belajar:</label>
                           <input type="date" required value={formSiswaManual.tanggal_mulai} onChange={e => setFormSiswaManual({...formSiswaManual, tanggal_mulai: e.target.value})} className="border p-3 rounded-xl w-full text-sm outline-none focus:border-purple-500" />
                        </div>
                        <div>
                           <label className="text-[10px] font-bold text-gray-500 block mb-1">Tanggal Selesai (Target 12 Sesi):</label>
                           <input type="date" required value={formSiswaManual.tanggal_selesai} onChange={e => setFormSiswaManual({...formSiswaManual, tanggal_selesai: e.target.value})} className="border p-3 rounded-xl w-full text-sm outline-none focus:border-purple-500" />
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
                            const presensiCount = periodeAktif ? daftarPresensiSiswa.filter(ps => ps.periode_id === periodeAktif.id).length : 0;
                            const butuhRollover = presensiCount >= 12;

                            return (
                              <React.Fragment key={s.id}>
                                <tr className="border-b hover:bg-gray-50 transition">
                                  <td className="p-3">
                                    <strong className="text-[15px]">{s.nama_murid}</strong>
                                    {butuhRollover && <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow animate-pulse">⚠️ 12/12</span>}
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
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                        <div className="bg-white p-4 rounded-xl shadow-sm border border-emerald-100">
                                            <h5 className="font-bold text-[#581878] mb-3 border-b pb-2">Riwayat Uang Masuk</h5>
                                            <ul className="text-xs space-y-2 max-h-48 overflow-y-auto pr-2">
                                              {daftarPembayaran.filter(pb => pb.siswa_id === s.id).map(pb => (
                                                <li key={pb.id} className="flex justify-between items-center bg-emerald-50 p-2 rounded">
                                                  <span>💰 {formatTanggalIndo(pb.tanggal_pembayaran)}</span> 
                                                  <span className="font-bold text-emerald-700">Rp {Number(pb.jumlah_bayar).toLocaleString('id-ID')}</span>
                                                </li>
                                              ))}
                                              {daftarPembayaran.filter(pb => pb.siswa_id === s.id).length === 0 && <span className="text-gray-400">Belum ada transaksi.</span>}
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
                </div>
              )}

              {/* ADMIN: TAB MENTOR */}
              {adminTab === 'mentor' && (
                <div className="space-y-6">
                  <div className="flex space-x-2 border-b pb-3 overflow-x-auto">
                    <button onClick={() => setMentorSubTab('daftar')} className={`px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap ${mentorSubTab === 'daftar' ? 'bg-purple-900 text-white' : 'bg-white'}`}>Data Mentor</button>
                    <button onClick={() => setMentorSubTab('tambah')} className={`px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap ${mentorSubTab === 'tambah' ? 'bg-purple-900 text-white' : 'bg-white'}`}>+ Tambah Baru</button>
                    <button onClick={() => setMentorSubTab('presensi')} className={`px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap ${mentorSubTab === 'presensi' ? 'bg-purple-900 text-white' : 'bg-white'}`}>Input Presensi Total</button>
                    <button onClick={() => setMentorSubTab('penggajian')} className={`px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap ${mentorSubTab === 'penggajian' ? 'bg-purple-900 text-white' : 'bg-white'}`}>Hitung Payroll</button>
                  </div>
                  
                  {/* Daftar Mentor */}
                  {mentorSubTab === 'daftar' && (
                    <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-purple-100">
                      <div className="flex justify-between items-center mb-4"><h4 className="text-lg font-bold text-[#581878]">Daftar Guru / Mentor Aktif</h4></div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {daftarMentor.map(m => (
                          <div key={m.id} className="border border-purple-100 rounded-xl p-4 flex items-start space-x-4 hover:shadow-md transition bg-gray-50/50">
                            {m.foto_url ? (<img src={m.foto_url} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-amber-400 flex-shrink-0" />) : (<div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-2xl border flex-shrink-0">👤</div>)}
                            <div className="flex-1 min-w-0">
                              <h5 className="font-bold text-gray-900 leading-tight truncate">{m.nama_mentor}</h5>
                              <p className="text-[11px] text-gray-500 truncate">{m.email}</p>
                              <p className="text-[11px] text-[#581878] font-bold mt-1">Tarif: Rp {(m.honor_per_jam || 0).toLocaleString('id-ID')}</p>
                              <div className="mt-2"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${m.akses_inventaris ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'}`}>{m.akses_inventaris ? '✅ Akses Inventaris Aktif' : 'Akses Guru Standar'}</span></div>
                            </div>
                            <div className="flex flex-col space-y-1.5 ml-2 flex-shrink-0">
                              <button onClick={() => handleToggleAksesInventaris(m.id, m.akses_inventaris)} className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition border shadow-sm ${m.akses_inventaris ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>{m.akses_inventaris ? 'Cabut Delegasi' : 'Beri Delegasi'}</button>
                              <button onClick={async () => { if(window.confirm('Hapus mentor ini permanen?')) { await supabase.from('mentor').delete().eq('id', m.id); fetchAllData(); } }} className="px-2 py-1.5 rounded-lg text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 shadow-sm">Hapus Guru</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tambah Mentor */}
                  {mentorSubTab === 'tambah' && (
                    <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-purple-100">
                      <h4 className="text-lg font-bold text-[#581878] mb-4">Pendaftaran Akun Mentor</h4>
                      <form onSubmit={handleTambahMentor} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Nama Lengkap Mentor" required value={newMentor.nama_mentor} onChange={(e) => setNewMentor({...newMentor, nama_mentor: e.target.value})} className="px-4 py-3 border rounded-xl" />
                        <input type="text" placeholder="No. WhatsApp (Awali dengan 08 / 62)" required value={newMentor.no_hp} onChange={(e) => setNewMentor({...newMentor, no_hp: e.target.value})} className="px-4 py-3 border rounded-xl" />
                        <input type="email" placeholder="Email Login" required value={newMentor.email} onChange={(e) => setNewMentor({...newMentor, email: e.target.value})} className="px-4 py-3 border rounded-xl" />
                        <input type="password" placeholder="Password Awal (Min. 6 Karakter)" required value={newMentor.password} onChange={(e) => setNewMentor({...newMentor, password: e.target.value})} className="px-4 py-3 border rounded-xl" />
                        <input type="number" placeholder="Tarif Honor Dasar per Jam (Rp)" required value={newMentor.honor_per_jam} onChange={(e) => setNewMentor({...newMentor, honor_per_jam: Number(e.target.value)})} className="px-4 py-3 border rounded-xl md:col-span-2 bg-amber-50" />
                        <button type="submit" disabled={loading} className="md:col-span-2 bg-[#581878] hover:bg-purple-900 text-white font-bold py-3 rounded-xl shadow transition">{loading ? 'Memproses...' : 'Simpan Akun & Kirim Detail Via WA 🚀'}</button>
                      </form>
                    </div>
                  )}

                  {/* Presensi Total Mentor */}
                  {mentorSubTab === 'presensi' && (
                    <div className="bg-white p-6 rounded-2xl shadow-md border-2 border-purple-100">
                       <h3 className="text-lg font-bold text-[#581878] mb-4">Input Total Jam Kerja Mentor Harian</h3>
                       <form onSubmit={handleTambahPresensiMentor} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-gray-50 p-4 rounded-xl border">
                          <select required value={formPresensiMentor.mentor_id} onChange={e => setFormPresensiMentor({...formPresensiMentor, mentor_id: e.target.value})} className="border p-3 rounded-xl"><option value="">-- Pilih Guru / Mentor --</option>{daftarMentor.map(m => <option key={m.id} value={m.id}>{m.nama_mentor}</option>)}</select>
                          <input type="date" required value={formPresensiMentor.tanggal} onChange={e => setFormPresensiMentor({...formPresensiMentor, tanggal: e.target.value})} className="border p-3 rounded-xl" />
                          <input type="number" step="0.5" placeholder="Total Jam Mengajar Harian" required value={formPresensiMentor.total_jam} onChange={e => setFormPresensiMentor({...formPresensiMentor, total_jam: parseFloat(e.target.value)})} className="border p-3 rounded-xl font-bold text-[#581878]" />
                          <button type="submit" className="bg-[#581878] text-white py-3 rounded-xl font-bold shadow">Simpan Jam</button>
                       </form>
                       <div className="overflow-x-auto">
                         <table className="w-full text-left text-sm">
                            <thead className="bg-purple-50 text-[#581878]"><tr><th className="p-3">Tanggal Tercatat</th><th className="p-3">Nama Mentor</th><th className="p-3">Total Durasi Jam</th><th className="p-3 text-center">Aksi</th></tr></thead>
                            <tbody>
                              {daftarPresensiMentor.slice(0, 15).map(pm => (
                                <tr key={pm.id} className="border-b"><td className="p-3">{formatTanggalIndo(pm.tanggal)}</td><td className="p-3 font-bold">{pm.mentor?.nama_mentor}</td><td className="p-3 font-semibold text-emerald-600 bg-emerald-50 px-2 inline-block rounded my-1">{pm.total_jam} Jam</td><td className="p-3 text-center"><button onClick={async () => { await supabase.from('presensi_mentor').delete().eq('id', pm.id); fetchAllData(); }} className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-xs font-bold">Hapus</button></td></tr>
                              ))}
                            </tbody>
                         </table>
                       </div>
                    </div>
                  )}

                  {/* Penggajian Mentor */}
                  {mentorSubTab === 'penggajian' && (
                    <div className="bg-white p-6 rounded-2xl shadow-md border-2 border-purple-100 space-y-6">
                       <h3 className="text-lg font-bold text-[#581878]">Kalkulator Payroll / Gaji Bulanan</h3>
                       <form onSubmit={handleSimpanGaji} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border-b pb-6">
                          <select required value={formGaji.mentor_id} onChange={e => setFormGaji({...formGaji, mentor_id: e.target.value})} className="border p-3 rounded-xl"><option value="">-- Pilih Guru --</option>{daftarMentor.map(m => <option key={m.id} value={m.id}>{m.nama_mentor}</option>)}</select>
                          <input type="month" required value={formGaji.bulan_periode} onChange={e => setFormGaji({...formGaji, bulan_periode: e.target.value})} className="border p-3 rounded-xl" />
                          <input type="number" placeholder="Insentif Transport (Rp)" value={formGaji.insentif} onChange={e => setFormGaji({...formGaji, insentif: Number(e.target.value)})} className="border p-3 rounded-xl bg-blue-50" />
                          <input type="number" placeholder="Bonus Kinerja (Rp)" value={formGaji.bonus_kinerja} onChange={e => setFormGaji({...formGaji, bonus_kinerja: Number(e.target.value)})} className="border p-3 rounded-xl bg-blue-50" />
                          <input type="number" placeholder="Potongan Kasbon (Rp)" value={formGaji.potongan} onChange={e => setFormGaji({...formGaji, potongan: Number(e.target.value)})} className="border p-3 rounded-xl border-red-300 bg-red-50" />
                          <input type="text" placeholder="Catatan Payroll" value={formGaji.catatan} onChange={e => setFormGaji({...formGaji, catatan: e.target.value})} className="border p-3 rounded-xl md:col-span-2" />
                          <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold shadow w-full">Generate Slip Gaji</button>
                       </form>
                       <div className="overflow-x-auto">
                         <table className="w-full text-sm mt-4 text-left">
                            <thead className="bg-purple-50 text-[#581878] uppercase text-xs"><tr>
                              <th className="p-3">Periode</th><th className="p-3">Mentor</th><th className="p-3 text-center">T. Jam</th><th className="p-3">Gaji Bersih Diterima</th><th className="p-3 text-center">Status</th><th className="p-3 text-center">Opsi Aksi</th>
                            </tr></thead>
                            <tbody>
                              {daftarPenggajian.map(g => {
                                const totalHonor = (g.total_jam_mengajar * g.honor_per_jam) + Number(g.insentif) + Number(g.bonus_kinerja) - Number(g.potongan);
                                return (
                                   <tr key={g.id} className="border-b">
                                     <td className="p-3 font-semibold">{g.bulan_periode}</td><td className="p-3 font-bold">{g.mentor?.nama_mentor}</td>
                                     <td className="p-3 text-center bg-gray-50">{g.total_jam_mengajar}</td>
                                     <td className="p-3 font-extrabold text-emerald-600">Rp {totalHonor.toLocaleString('id-ID')}</td>
                                     <td className="p-3 text-center"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${g.status_pembayaran === 'dibayar' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 border border-amber-300'}`}>{g.status_pembayaran}</span></td>
                                     <td className="p-3 text-center space-x-2">
                                        {g.status_pembayaran !== 'dibayar' && <button onClick={async () => { await supabase.from('penggajian_mentor').update({status_pembayaran: 'dibayar'}).eq('id', g.id); fetchAllData(); }} className="bg-emerald-600 text-white px-3 py-1 rounded-lg text-xs font-bold shadow">✓ Bayar</button>}
                                        <button onClick={async () => { await supabase.from('penggajian_mentor').delete().eq('id', g.id); fetchAllData(); }} className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-xs font-bold">Hapus</button>
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

              {/* ADMIN: TAB MODUL */}
              {adminTab === 'modul' && <ModulManager adminView={true} />}
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
                <button onClick={() => setGuruTab('modul')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm whitespace-nowrap ${guruTab === 'modul' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600'}`}>📚 Modul & Barang</button>
                <button onClick={() => setGuruTab('profil')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm whitespace-nowrap ${guruTab === 'profil' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600'}`}>👤 Akun & Foto</button>
              </div>

              {guruTab === 'beranda' && (
                 <div className="space-y-6">
                    <div className="bg-gradient-to-r from-purple-800 to-indigo-900 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
                       <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                          {currentMentorProfile?.foto_url ? (
                            <img src={currentMentorProfile.foto_url} alt="Guru" className="w-24 h-24 rounded-full border-4 border-[#F59E0B] object-cover shadow-xl" />
                          ) : (
                            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-4xl border border-white/50 backdrop-blur">👤</div>
                          )}
                          <div className="text-center md:text-left">
                            <h2 className="text-3xl font-black tracking-tight">Halo, {currentMentorProfile?.nama_mentor || 'Kakak Pengajar!'} 👋</h2>
                            <p className="text-amber-300 text-sm font-bold mt-2 border border-amber-300/30 inline-block px-3 py-1 rounded-full bg-black/20">
                              Tarif Dasar: Rp {(currentMentorProfile?.honor_per_jam || 0).toLocaleString('id-ID')} / Jam
                            </p>
                          </div>
                       </div>
                    </div>
                    {(() => {
                       const bulanIni = new Date().toISOString().slice(0, 7); 
                       const presensiBulanIni = daftarPresensiMentor.filter(pm => pm.mentor_id === currentMentorProfile?.id && pm.tanggal?.startsWith(bulanIni));
                       const totalJamBulanIni = presensiBulanIni.reduce((acc, curr) => acc + (Number(curr.total_jam) || 0), 0);
                       const estimasiGaji = totalJamBulanIni * (currentMentorProfile?.honor_per_jam || 0);

                       return (
                         <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-purple-100">
                           <h3 className="text-lg font-bold text-[#581878] mb-4">Kinerja Anda Bulan Ini ({bulanIni})</h3>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                              <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-bold text-blue-800 uppercase tracking-wide">Total Jam Mengajar</p>
                                  <p className="text-3xl font-black text-blue-900 mt-1">{totalJamBulanIni} <span className="text-lg">Jam</span></p>
                                </div>
                                <div className="text-4xl opacity-80">⏱️</div>
                              </div>
                              <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100 flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Estimasi Honor Sementara</p>
                                  <p className="text-3xl font-black text-emerald-900 mt-1">Rp {estimasiGaji.toLocaleString('id-ID')}</p>
                                </div>
                                <div className="text-4xl opacity-80">💰</div>
                              </div>
                           </div>
                           <h4 className="text-sm font-bold text-gray-700 mb-3 border-t pt-6">Log Kehadiran Guru (Terakhir)</h4>
                           <div className="overflow-x-auto">
                              <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-gray-50 text-gray-600"><tr><th className="p-3">Tanggal Kerja</th><th className="p-3 text-center">Durasi (Jam)</th></tr></thead>
                                <tbody>
                                  {daftarPresensiMentor.filter(pm => pm.mentor_id === currentMentorProfile?.id).slice(0, 15).map(pm => (
                                      <tr key={pm.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-medium text-gray-800">{formatTanggalIndo(pm.tanggal)}</td>
                                        <td className="p-3 font-black text-emerald-700 text-center bg-emerald-50/50">{pm.total_jam} Jam</td>
                                      </tr>
                                    ))}
                                  {daftarPresensiMentor.filter(pm => pm.mentor_id === currentMentorProfile?.id).length === 0 && (
                                     <tr><td colSpan="2" className="p-6 text-center text-gray-400 italic">Belum ada jam kerja yang diinputkan untuk Anda.</td></tr>
                                  )}
                                </tbody>
                              </table>
                           </div>
                         </div>
                       )
                    })()}
                 </div>
              )}

              {guruTab === 'presensi' && (
                 <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-purple-200">
                    <h3 className="text-lg font-bold text-[#581878] mb-4">Catat Presensi Kelas Hari Ini</h3>
                    <form onSubmit={handleTambahPresensiSiswa} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-purple-50 p-4 rounded-xl border border-purple-100">
                        {/* PENCARIAN SISWA (BUKAN DROPDOWN) */}
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

                        {/* AUTO INCREMENT SESI */}
                        <div className="relative">
                           <input type="text" readOnly value={`Sesi Ke- ${newPresensiSiswa.pertemuan_ke}`} className="w-full px-4 py-3 border rounded-xl font-black text-center bg-gray-100 text-[#581878] outline-none cursor-not-allowed" />
                           <p className="absolute -bottom-5 left-0 text-[10px] text-gray-500 w-full text-center">Otomatis Dihitung</p>
                        </div>

                        <input type="date" required value={newPresensiSiswa.tanggal_pertemuan} onChange={(e) => setNewPresensiSiswa({ ...newPresensiSiswa, tanggal_pertemuan: e.target.value })} className="px-4 py-3 border rounded-xl mt-2" />
                        <select value={newPresensiSiswa.status_kehadiran} onChange={(e) => setNewPresensiSiswa({ ...newPresensiSiswa, status_kehadiran: e.target.value })} className="px-4 py-3 border rounded-xl text-sm font-bold text-purple-900 bg-white mt-2">
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

              {guruTab === 'modul' && (
                currentMentorProfile?.akses_inventaris ? ( <ModulManager adminView={false} /> ) : (
                   <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-emerald-100">
                     <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl mb-6 text-sm">⚠️ Anda tidak memiliki akses delegasi inventaris. Tampilan di bawah hanya untuk referensi baca.</div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                       {daftarInventaris.map(b => (
                         <div key={b.id} className="border border-emerald-100 p-4 rounded-xl shadow-sm bg-white flex flex-col justify-between">
                            <div>
                               <div className="flex justify-between items-start mb-2"><h5 className="font-bold text-gray-900">{b.nama_barang}</h5></div>
                               {b.thumbnail && <img src={b.thumbnail} alt="" className="w-full h-24 object-cover rounded-lg mb-2 opacity-80" />}
                            </div>
                            <span className="text-xs font-black bg-emerald-100 text-emerald-800 p-2 rounded-lg text-center mt-3">Sisa Stok Fisik: {b.stok}</span>
                         </div>
                       ))}
                     </div>
                   </div>
                )
              )}

              {guruTab === 'profil' && (
                <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-purple-200">
                   <h3 className="text-lg font-bold text-[#581878] mb-4">Pengaturan Profil & Keamanan</h3>
                   <form onSubmit={handleUpdateProfilGuru} className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                     <div><label className="text-xs font-bold block mb-1">Nama Tampilan</label><input type="text" disabled value={currentMentorProfile?.nama_mentor || ''} className="w-full p-3 border rounded-xl bg-gray-100 text-gray-500" /></div>
                     <div><label className="text-xs font-bold block mb-1">Link URL Foto</label><input type="text" value={currentMentorProfile?.foto_url || ''} onChange={e => setCurrentMentorProfile({...currentMentorProfile, foto_url: e.target.value})} className="w-full p-3 border rounded-xl focus:border-purple-500" /></div>
                     <button type="submit" className="md:col-span-2 bg-[#581878] text-white font-black py-4 rounded-xl shadow-lg transition">Simpan Profil</button>
                  </form>
                  <div className="mt-8 pt-6 border-t">
                    <button onClick={() => setShowEditPasswordModal(true)} className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-6 rounded-xl shadow transition text-sm">Ganti Password Login</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* ======================================================= */
        /* 🌍 PUBLIC LANDING PAGE (UTUH)                           */
        /* ======================================================= */
        <>
          <section className="bg-gradient-to-b from-[#581878] via-[#6B21A8] to-[#FFFDF0] text-white pt-12 pb-24 px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <span className="inline-block bg-[#F59E0B] text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider mb-6 shadow-md border border-amber-300">
                Bimbingan Belajar Ceria, Bersahabat & Berprestasi 🚀
              </span>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-6">
                Rumah Belajar Ceria Bersama <span className="text-[#F59E0B] block mt-2 drop-shadow-md">Bimbel ErHa</span>
              </h2>
            </div>
          </section>

          <section className="max-w-6xl mx-auto px-4 -mt-16 mb-20 relative z-10">
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
                    className={`cursor-pointer bg-white rounded-3xl p-8 transition-all duration-300 shadow-xl relative group ${isSelected ? 'border-4 border-[#F59E0B] -translate-y-2' : 'border-2 border-purple-50 hover:-translate-y-1'}`}
                  >
                    {isSelected && <div className="absolute top-0 right-0 bg-[#F59E0B] text-white text-xs font-black px-4 py-1 rounded-bl-xl shadow-sm">✓ Terpilih</div>}
                    <h4 className="text-2xl font-black text-gray-900 group-hover:text-[#581878] mb-4">{paket.nama_paket}</h4>
                    <p className="text-gray-600 text-sm mb-6">{paket.deskripsi || 'Program bimbingan intensif 12 pertemuan per bulan.'}</p>
                    <div className={`mt-4 pt-4 border-t text-xs font-bold text-center uppercase ${isSelected ? 'text-amber-600 border-amber-200' : 'text-gray-400 border-gray-100'}`}>Klik Untuk Memilih Program Ini</div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="max-w-3xl mx-auto px-4 mb-24 relative z-10">
            <div className="bg-white rounded-[2rem] shadow-2xl border-4 border-white p-8 md:p-12 overflow-hidden relative">
              <div className="text-center mb-10">
                <h3 className="text-3xl font-black text-[#581878] mb-2">Pendaftaran Siswa Baru</h3>
                <p className="text-gray-500 text-sm font-medium">Lengkapi formulir di bawah ini. Anda akan dihubungkan ke Admin via WhatsApp.</p>
              </div>
              <form onSubmit={handleDaftarSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Nama Lengkap Murid</label>
                  <input type="text" required value={formDaftar.nama_murid} onChange={(e) => setFormDaftar({ ...formDaftar, nama_murid: e.target.value })} className="w-full px-5 py-4 rounded-xl border border-gray-200 outline-none focus:border-[#581878] bg-gray-50 focus:bg-white" placeholder="Contoh: Budi Pratama" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Nama Wali</label>
                    <input type="text" required value={formDaftar.nama_orang_tua} onChange={(e) => setFormDaftar({ ...formDaftar, nama_orang_tua: e.target.value })} className="w-full px-5 py-4 rounded-xl border border-gray-200 outline-none focus:border-[#581878] bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">No. WhatsApp</label>
                    <input type="tel" required value={formDaftar.no_hp} onChange={(e) => setFormDaftar({ ...formDaftar, no_hp: e.target.value })} className="w-full px-5 py-4 rounded-xl border border-gray-200 outline-none focus:border-[#581878] bg-gray-50" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Alamat Domisili</label>
                  <textarea required value={formDaftar.alamat} onChange={(e) => setFormDaftar({ ...formDaftar, alamat: e.target.value })} className="w-full px-5 py-4 rounded-xl border border-gray-200 outline-none focus:border-[#581878] bg-gray-50" rows="2" />
                </div>
                <div className="pt-4">
                   <button type="submit" disabled={loading} className="w-full py-5 bg-[#581878] hover:bg-[#6B21A8] text-white font-black text-lg rounded-2xl shadow-xl transition-all">
                     {loading ? 'Memproses Pendaftaran Sistem...' : 'Kirim Pendaftaran via WhatsApp 🚀'}
                   </button>
                </div>
              </form>
            </div>
          </section>
        </>
      )}

      {/* FOOTER GLOBAL */}
      <footer className="bg-[#581878] text-white py-10 text-center border-t-4 border-[#F59E0B] mt-auto">
        <div className="max-w-7xl mx-auto px-4">
           <p className="font-black text-xl tracking-wide">Bimbel ErHa (Rumah Hebat)</p>
           <p className="text-xs text-purple-400 mt-4">© {new Date().getFullYear()} Bimbel ErHa. All rights reserved.</p>
        </div>
      </footer>

      {/* ======================================================= */}
      {/* KUMPULAN MODAL POP-UP (GLOBAL)                          */}
      {/* ======================================================= */}
      
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

      {/* Modal Ganti Password Guru */}
      {showEditPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden p-6">
            <h3 className="font-bold text-lg text-[#581878] mb-4">Ubah Password Anda</h3>
            <form onSubmit={handleGantiPasswordGuru}>
              <input type="password" required minLength="6" placeholder="Password Baru (Min. 6 Karakter)" value={newPasswordGuru} onChange={e => setNewPasswordGuru(e.target.value)} className="w-full border p-3 rounded-xl mb-4" />
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowEditPasswordModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg font-bold text-sm">Batal</button>
                <button type="submit" className="px-4 py-2 bg-[#581878] text-white rounded-lg font-bold text-sm">Update Password</button>
              </div>
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
            {loginError && <p className="text-red-500 text-xs font-bold text-center mb-3 bg-red-50 p-2 rounded">{loginError}</p>}
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

  // --- KOMPONEN LOKAL UNTUK MANAJEMEN MODUL ---
  function ModulManager({ adminView }) {
    return (
      <div className="space-y-6">
         <div className="flex space-x-2 border-b-2 border-emerald-100 pb-3">
           <button onClick={() => setModulSubTab('data_barang')} className={`px-5 py-2.5 rounded-t-xl font-bold text-sm transition ${modulSubTab === 'data_barang' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-emerald-800'}`}>📦 Katalog Master Barang</button>
           <button onClick={() => setModulSubTab('transaksi')} className={`px-5 py-2.5 rounded-t-xl font-bold text-sm transition ${modulSubTab === 'transaksi' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-emerald-800'}`}>📝 Catat Transaksi In/Out</button>
         </div>

         {modulSubTab === 'data_barang' && (
            <div>
               <div className="bg-white p-6 rounded-2xl shadow-md mb-6 border-l-4 border-emerald-500">
                  <h3 className="font-bold text-emerald-800 mb-4 text-lg">Input Master Kategori/Barang Baru</h3>
                  <form onSubmit={handleTambahModul} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                     <input type="text" placeholder="Nama Barang / Judul Modul" required value={formModul.nama_barang} onChange={e => setFormModul({...formModul, nama_barang: e.target.value})} className="border border-emerald-200 p-3 rounded-xl col-span-1 md:col-span-2" />
                     <select value={formModul.kategori} onChange={e => setFormModul({...formModul, kategori: e.target.value})} className="border border-emerald-200 p-3 rounded-xl bg-white font-medium">
                        <option value="Buku">📚 Kategori: Buku / Modul</option>
                        <option value="Seragam">👕 Kategori: Seragam</option>
                        <option value="Logistik">📎 Kategori: Logistik Operasional</option>
                     </select>
                     <input type="number" placeholder="Stok Fisik Awal" required value={formModul.stok} onChange={e => setFormModul({...formModul, stok: Number(e.target.value)})} className="border border-emerald-200 p-3 rounded-xl font-bold text-emerald-700 bg-emerald-50" />
                     <input type="text" placeholder="URL Foto Sampul (Opsional)" value={formModul.thumbnail} onChange={e => setFormModul({...formModul, thumbnail: e.target.value})} className="border border-emerald-200 p-3 rounded-xl col-span-1 md:col-span-2 lg:col-span-3" />
                     <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-black shadow-md transition w-full h-full">Simpan ke Katalog</button>
                  </form>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {daftarInventaris.map(b => (
                     <div key={b.id} className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-100 flex flex-col justify-between hover:shadow-md transition group">
                        <div>
                           <div className="flex justify-between items-start mb-3"><span className="text-[10px] uppercase font-black bg-emerald-50 text-emerald-600 px-2 py-1 rounded tracking-widest">{b.kategori}</span></div>
                           {b.thumbnail && <img src={b.thumbnail} alt="" className="w-full h-32 object-cover rounded-xl mb-3 shadow-inner" />}
                           <h5 className="font-black text-gray-900 leading-tight mb-4">{b.nama_barang}</h5>
                        </div>
                        <div>
                           <div className="bg-gray-50 border p-3 rounded-xl flex justify-between items-center mb-3">
                              <span className="text-xs font-bold text-gray-500">Sisa Fisik:</span>
                              <span className={`text-xl font-black ${b.stok > 0 ? 'text-emerald-600' : 'text-red-500'}`}>{b.stok}</span>
                           </div>
                           <button onClick={() => handleHapusModul(b.id)} className="text-[11px] font-bold text-red-500 hover:bg-red-50 p-2 rounded-lg w-full transition text-center border border-transparent hover:border-red-200">Hapus Master Item</button>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         )}

         {modulSubTab === 'transaksi' && (
            <div>
               <div className="bg-white p-6 rounded-2xl shadow-md mb-6 border-l-4 border-blue-500">
                  <h3 className="font-bold text-blue-800 mb-4 text-lg">Catat Mutasi Stok Keluar / Masuk</h3>
                  <form onSubmit={handleSimpanTransaksiLogistik} className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                     <select required value={formTransaksi.barang_id} onChange={e => setFormTransaksi({...formTransaksi, barang_id: e.target.value})} className="border p-3 rounded-xl md:col-span-2 bg-white font-medium">
                        <option value="">-- Pilih Barang Dari Katalog --</option>
                        {daftarInventaris.map(b => <option key={b.id} value={b.id}>{b.nama_barang} (Sisa Katalog: {b.stok})</option>)}
                     </select>
                     <select required value={formTransaksi.tipe_transaksi} onChange={e => setFormTransaksi({...formTransaksi, tipe_transaksi: e.target.value})} className="border p-3 rounded-xl font-bold">
                        <option value="masuk">➕ BARANG MASUK (Restok)</option>
                        <option value="keluar">➖ BARANG KELUAR (Terjual/Diambil)</option>
                     </select>
                     <input type="number" min="1" placeholder="Jumlah Mutasi" required value={formTransaksi.jumlah} onChange={e => setFormTransaksi({...formTransaksi, jumlah: Number(e.target.value)})} className="border p-3 rounded-xl font-black text-center text-xl bg-gray-50" />
                     <input type="text" placeholder="Keterangan (Contoh: Diambil atas nama Siswa Budi)" value={formTransaksi.keterangan} onChange={e => setFormTransaksi({...formTransaksi, keterangan: e.target.value})} className="border p-3 rounded-xl md:col-span-3 focus:border-blue-500 outline-none" />
                     <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-black shadow transition">Eksekusi Transaksi</button>
                  </form>
               </div>

               <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                 <h4 className="font-bold text-gray-800 mb-4">Log Histori Mutasi Barang</h4>
                 <div className="overflow-x-auto">
                   <table className="w-full text-left text-sm whitespace-nowrap">
                     <thead className="bg-gray-50 text-gray-500 text-[11px] uppercase tracking-wider"><tr><th className="p-3 font-bold rounded-tl-lg">Tgl Transaksi</th><th className="p-3 font-bold">Nama Barang Item</th><th className="p-3 font-bold text-center">Jenis Mutasi</th><th className="p-3 font-bold text-center">Qty / Jml</th><th className="p-3 font-bold">Ket / Narasi</th><th className="p-3 font-bold text-center rounded-tr-lg">Opsi Pembatalan</th></tr></thead>
                     <tbody>
                       {daftarTransaksiLogistik.map(t => (
                          <tr key={t.id} className="border-b hover:bg-gray-50">
                             <td className="p-3 font-medium text-gray-600">{formatTanggalIndo(t.created_at)}</td>
                             <td className="p-3">
                                <span className="block font-black text-gray-900">{t.inventaris_logistik?.nama_barang}</span>
                                <span className="text-[10px] text-gray-400 bg-gray-100 px-1 rounded uppercase">{t.inventaris_logistik?.kategori}</span>
                             </td>
                             <td className="p-3 text-center"><span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wide border ${t.tipe_transaksi === 'masuk' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>{t.tipe_transaksi}</span></td>
                             <td className="p-3 font-black text-center text-lg">{t.jumlah}</td>
                             <td className="p-3 text-xs text-gray-500 whitespace-normal max-w-[200px] leading-tight">{t.keterangan || '-'}</td>
                             <td className="p-3 text-center"><button onClick={() => handleHapusTransaksiLogistik(t)} className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-[11px] font-bold text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition shadow-sm">Batalkan Stok</button></td>
                          </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               </div>
            </div>
         )}
      </div>
    );
  }
}
