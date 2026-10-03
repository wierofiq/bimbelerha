import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Inisialisasi Supabase Client
const supabaseUrl = 'https://izifwpviqpyxauafdlge.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6aWZ3cHZpcXB5eGF1YWZkbGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NDA2ODYsImV4cCI6MjEwNjUxNjY4Nn0.XpJEgQ3vpGOYmPVi-nsjrSRJI9RfR5kWTN_XsL-TCUU';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [activeTab, setActiveTab] = useState('pendaftaran');
  const [adminTab, setAdminTab] = useState('siswa'); 
  const [siswaSubTab, setSiswaSubTab] = useState('persetujuan'); // 'persetujuan', 'data', 'presensi'
  const [userRole, setUserRole] = useState('guru'); 
  const [currentMentorProfile, setCurrentMentorProfile] = useState(null);

  const [paketList, setPaketList] = useState([]);
  const [selectedPaket, setSelectedPaket] = useState([]);
  const [loading, setLoading] = useState(false);

  // Auth State
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Modal Edit Password Guru
  const [showEditPasswordModal, setShowEditPasswordModal] = useState(false);
  const [newPasswordGuru, setNewPasswordGuru] = useState('');

  // Master Data Supabase
  const [daftarSiswa, setDaftarSiswa] = useState([]);
  const [daftarMentor, setDaftarMentor] = useState([]);
  const [daftarPeriode, setDaftarPeriode] = useState([]);
  const [daftarPresensiSiswa, setDaftarPresensiSiswa] = useState([]);
  const [daftarPerizinan, setDaftarPerizinan] = useState([]);
  const [daftarPembayaran, setDaftarPembayaran] = useState([]);
  const [daftarPresensiMentor, setDaftarPresensiMentor] = useState([]);
  const [daftarPenggajian, setDaftarPenggajian] = useState([]);
  const [daftarInventaris, setDaftarInventaris] = useState([]);

  // State Fitur Baru: Detail Siswa & Edit Mentor Modal
  const [detailSiswaModal, setDetailSiswaModal] = useState(null);
  const [editMentorModal, setEditMentorModal] = useState(null);

  // State Fitur Baru: Edit Pembayaran Siswa Modal & Form Tambah Pembayaran Admin
  const [editPembayaranModal, setEditPembayaranModal] = useState(null);
  const [formPembayaranAdmin, setFormPembayaranAdmin] = useState({
    siswa_id: '',
    item_bayar: 'SPB Bulanan',
    jumlah_pembayaran: 150000,
    tanggal_bayar: new Date().toISOString().split('T')[0]
  });

  // State Fitur Baru: Edit Penggajian Mentor Modal
  const [editPenggajianModal, setEditPenggajianModal] = useState(null);

  // State Fitur Baru: Profil Guru (Edit No HP, Alamat, Upload Foto)
  const [guruProfileForm, setGuruProfileForm] = useState({
    no_hp: '',
    alamat: '',
    foto_url: ''
  });
  const [uploadingFoto, setUploadingFoto] = useState(false);

  // State Fitur Baru: Filter Tanggal & Pencarian Instan Siswa Sisi Guru
  const [filterTanggalMentor, setFilterTanggalMentor] = useState(new Date().toISOString().split('T')[0]);
  const [searchSiswaQuery, setSearchSiswaQuery] = useState('');
  const [selectedSiswaForPresensi, setSelectedSiswaForPresensi] = useState(null);

  // Form State Admin: Mentor Baru
  const [newMentor, setNewMentor] = useState({
    nama_mentor: '',
    email: '',
    password: '',
    no_hp: '',
    alamat: '',
    honor_per_jam: 25000,
    akses_inventaris: false,
    akses_perizinan: false,
    status: 'aktif'
  });

  // Form State Admin: Penggajian Kustom (Bulanan)
  const [gajiForm, setGajiForm] = useState({
    mentor_id: '',
    bulan_periode: new Date().toISOString().slice(0, 7),
    tunjangan_kinerja: 0,
    bonus: 0
  });

  // Form Presensi Guru
  const [newPresensiSiswa, setNewPresensiSiswa] = useState({
    periode_id: '',
    pertemuan_ke: 1,
    tanggal_pertemuan: new Date().toISOString().split('T')[0],
    status_kehadiran: 'Hadir', 
    jurnal_materi: ''
  });

  const [selectedSiswaIdFilter, setSelectedSiswaIdFilter] = useState('all');
  const [newBarang, setNewBarang] = useState({ nama_barang: '', kategori: 'buku', stok: 10, harga_satuan: 15000 });
  
  const [formDaftar, setFormDaftar] = useState({
    nama_murid: '',
    nama_orang_tua: '',
    no_hp: '',
    alamat: '',
    jenjang_sekolah: 'TK',
  });

  // Load Initial Session & Data
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        determineUserRoleAndProfile(session.user);
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

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function determineUserRoleAndProfile(authUser) {
    if (authUser.email?.includes('admin')) {
      setUserRole('admin');
      setCurrentMentorProfile(null);
    } else {
      setUserRole('guru');
      const { data: mData } = await supabase.from('mentor').select('*').eq('email', authUser.email).single();
      if (mData) {
        setCurrentMentorProfile(mData);
        setGuruProfileForm({
          no_hp: mData.no_hp || '',
          alamat: mData.alamat || '',
          foto_url: mData.foto_url || ''
        });
      }
    }
  }

  async function fetchPaket() {
    const { data } = await supabase.from('paket_belajar').select('*').order('created_at', { ascending: true });
    if (data) setPaketList(data);
  }

  async function fetchAllData() {
    const { data: siswa } = await supabase.from('siswa').select('*').order('created_at', { ascending: false });
    const { data: mentor } = await supabase.from('mentor').select('*').order('created_at', { ascending: false });
    const { data: periode } = await supabase.from('periode_belajar').select('*, siswa(nama_murid, status, no_hp, alamat, nama_orang_tua, jenjang_sekolah), paket_belajar(nama_paket)').order('created_at', { ascending: false });
    const { data: presensiS } = await supabase.from('presensi_siswa').select('*, mentor(nama_mentor), periode_belajar(siswa(nama_murid, siswa_id), paket_belajar(nama_paket))').order('tanggal_pertemuan', { ascending: false });
    const { data: izin } = await supabase.from('perizinan_siswa').select('*, siswa(nama_murid)').order('created_at', { ascending: false });
    const { data: pemb } = await supabase.from('pembayaran_siswa').select('*, siswa(nama_murid)').order('created_at', { ascending: false });
    const { data: presensiM } = await supabase.from('presensi_mentor').select('*, mentor(nama_mentor)').order('tanggal', { ascending: false });
    const { data: gaji } = await supabase.from('penggajian_mentor').select('*, mentor(nama_mentor, honor_per_jam)').order('created_at', { ascending: false });
    const { data: logistik } = await supabase.from('inventaris_logistik').select('*').order('nama_barang', { ascending: true });

    if (siswa) setDaftarSiswa(siswa);
    if (mentor) setDaftarMentor(mentor);
    if (periode) setDaftarPeriode(periode);
    if (presensiS) setDaftarPresensiSiswa(presensiS);
    if (izin) setDaftarPerizinan(izin);
    if (pemb) setDaftarPembayaran(pemb);
    if (presensiM) setDaftarPresensiMentor(presensiM);
    if (gaji) setDaftarPenggajian(gaji);
    if (logistik) setDaftarInventaris(logistik);
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) {
      setLoginError('Login gagal: ' + error.message);
    } else {
      setShowLoginModal(false);
      determineUserRoleAndProfile(data.user);
      setLoginEmail('');
      setLoginPassword('');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserRole('guru');
    setCurrentMentorProfile(null);
  };

  // UPLOAD FOTO PROFIL GURU KE SUPABASE STORAGE (bucket: foto_mentor)
  const handleUploadFotoGuru = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingFoto(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentMentorProfile.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from('foto_mentor').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('foto_mentor').getPublicUrl(filePath);

      setGuruProfileForm(prev => ({ ...prev, foto_url: publicUrl }));
      alert('✅ Foto berhasil diunggah! Jangan lupa klik Simpan Profil.');
    } catch (err) {
      alert('Gagal upload foto: ' + err.message);
    } finally {
      setUploadingFoto(false);
    }
  };

  // SIMPAN PERUBAHAN PROFIL GURU
  const handleSimpanProfilGuru = async (e) => {
    e.preventDefault();
    if (!currentMentorProfile) return;

    const { error } = await supabase.from('mentor').update({
      no_hp: guruProfileForm.no_hp,
      alamat: guruProfileForm.alamat,
      foto_url: guruProfileForm.foto_url
    }).eq('id', currentMentorProfile.id);

    if (error) {
      alert('Gagal menyimpan profil: ' + error.message);
    } else {
      alert('✅ Profil pribadi berhasil diperbarui!');
      determineUserRoleAndProfile(user);
      fetchAllData();
    }
  };

  // Ubah Password Guru Mandiri
  const handleGantiPasswordGuru = async (e) => {
    e.preventDefault();
    if (!newPasswordGuru || newPasswordGuru.length < 6) {
      alert('Password minimal 6 karakter!');
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPasswordGuru });
    if (error) {
      alert('Gagal mengubah password: ' + error.message);
    } else {
      alert('✅ Password berhasil diperbarui!');
      setShowEditPasswordModal(false);
      setNewPasswordGuru('');
    }
  };

  // TAMBAH MENTOR DENGAN CLICK-TO-CHAT WHATSAPP
  const handleTambahMentor = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error: errAuth } = await supabase.auth.signUp({ 
        email: newMentor.email, 
        password: newMentor.password,
        options: { data: { role: 'guru' } }
      });
      if (errAuth) console.warn(errAuth);

      const { error: errDb } = await supabase.from('mentor').insert([{
        nama_mentor: newMentor.nama_mentor,
        email: newMentor.email,
        no_hp: newMentor.no_hp,
        alamat: newMentor.alamat,
        honor_per_jam: newMentor.honor_per_jam,
        akses_inventaris: newMentor.akses_inventaris,
        akses_perizinan: newMentor.akses_perizinan,
        status: newMentor.status
      }]);

      if (errDb) throw errDb;

      alert('✅ Mentor berhasil didaftarkan! Mengarahkan ke WhatsApp untuk mengirim kredensial...');
      
      const waText = `Halo Kak ${newMentor.nama_mentor},\nAkun Portal Pengajar Bimbel ErHa Anda telah aktif.\n\nLogin URL: ${window.location.origin}\nEmail: ${newMentor.email}\nPassword: ${newMentor.password}\n\nSilakan login dan ganti password Anda di menu profil. Terima kasih!`;
      window.open(`https://wa.me/${newMentor.no_hp.replace(/^0/, '62')}?text=${encodeURIComponent(waText)}`, '_blank');

      setNewMentor({
        nama_mentor: '', email: '', password: '', no_hp: '', alamat: '',
        honor_per_jam: 25000, akses_inventaris: false, akses_perizinan: false, status: 'aktif'
      });
      fetchAllData();
    } catch (err) {
      alert('Gagal menambah mentor: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // SIMPAN EDIT MENTOR & DELEGASI WEWENANG (Admin)
  const handleUpdateMentorAdmin = async (e) => {
    e.preventDefault();
    if (!editMentorModal) return;

    const { error } = await supabase.from('mentor').update({
      nama_mentor: editMentorModal.nama_mentor,
      no_hp: editMentorModal.no_hp,
      alamat: editMentorModal.alamat,
      honor_per_jam: editMentorModal.honor_per_jam,
      akses_perizinan: editMentorModal.akses_perizinan,
      akses_inventaris: editMentorModal.akses_inventaris,
      status: editMentorModal.status
    }).eq('id', editMentorModal.id);

    if (error) {
      alert('Gagal mengupdate mentor: ' + error.message);
    } else {
      alert('✅ Data mentor dan delegasi wewenang berhasil diperbarui!');
      setEditMentorModal(null);
      fetchAllData();
    }
  };

  // TAMBAH / EDIT PEMBAYARAN SISWA (Admin)
  const handleSimpanPembayaranAdmin = async (e) => {
    e.preventDefault();
    if (!formPembayaranAdmin.siswa_id) { alert('Pilih siswa!'); return; }

    const { error } = await supabase.from('pembayaran_siswa').insert([{
      siswa_id: formPembayaranAdmin.siswa_id,
      item_bayar: formPembayaranAdmin.item_bayar,
      jumlah_pembayaran: formPembayaranAdmin.jumlah_pembayaran,
      tanggal_pembayaran: formPembayaranAdmin.tanggal_bayar,
      status_pembayaran: 'Lunas'
    }]);

    if (error) {
      alert('Gagal menyimpan pembayaran: ' + error.message);
    } else {
      alert('✅ Pembayaran berhasil dicatat!');
      setFormPembayaranAdmin({
        siswa_id: '',
        item_bayar: 'SPB Bulanan',
        jumlah_pembayaran: 150000,
        tanggal_bayar: new Date().toISOString().split('T')[0]
      });
      fetchAllData();
    }
  };

  const handleUpdatePembayaranAdmin = async (e) => {
    e.preventDefault();
    if (!editPembayaranModal) return;

    const { error } = await supabase.from('pembayaran_siswa').update({
      item_bayar: editPembayaranModal.item_bayar,
      jumlah_pembayaran: editPembayaranModal.jumlah_pembayaran,
      tanggal_pembayaran: editPembayaranModal.tanggal_pembayaran,
      status_pembayaran: editPembayaranModal.status_pembayaran
    }).eq('id', editPembayaranModal.id);

    if (error) {
      alert('Gagal update pembayaran: ' + error.message);
    } else {
      alert('✅ Pembayaran diperbarui!');
      setEditPembayaranModal(null);
      fetchAllData();
    }
  };

  // GENERATE GAJI BULANAN (JAM * TARIF + TUNJANGAN + BONUS)
  const handleSimpanGaji = async (e) => {
    e.preventDefault();
    if (!gajiForm.mentor_id) { alert('Pilih mentor!'); return; }

    const mentorRec = daftarMentor.find(m => m.id === gajiForm.mentor_id);
    const totalJam = daftarPresensiMentor
      .filter(pm => pm.mentor_id === gajiForm.mentor_id && pm.tanggal?.startsWith(gajiForm.bulan_periode))
      .reduce((acc, curr) => acc + (Number(curr.total_jam) || 0), 0);

    const honorJam = mentorRec?.honor_per_jam || 25000;

    await supabase.from('penggajian_mentor').insert([{
      mentor_id: gajiForm.mentor_id,
      bulan_periode: gajiForm.bulan_periode,
      total_jam_mengajar: totalJam,
      honor_per_jam: honorJam,
      insentif: gajiForm.tunjangan_kinerja,
      bonus_kinerja: gajiForm.bonus,
      status_pembayaran: 'draft'
    }]);

    alert('✅ Rekap gaji bulanan berhasil digenerate!');
    fetchAllData();
  };

  const handleBayarGaji = async (gajiId) => {
    await supabase.from('penggajian_mentor').update({
      status_pembayaran: 'dibayar',
      tanggal_pembayaran: new Date().toISOString()
    }).eq('id', gajiId);
    fetchAllData();
  };

  const handleUpdatePenggajian = async (e) => {
    e.preventDefault();
    if (!editPenggajianModal) return;

    const { error } = await supabase.from('penggajian_mentor').update({
      bulan_periode: editPenggajianModal.bulan_periode,
      insentif: editPenggajianModal.insentif,
      bonus_kinerja: editPenggajianModal.bonus_kinerja,
      status_pembayaran: editPenggajianModal.status_pembayaran
    }).eq('id', editPenggajianModal.id);

    if (error) {
      alert('Gagal update gaji: ' + error.message);
    } else {
      alert('✅ Data penggajian diperbarui!');
      setEditPenggajianModal(null);
      fetchAllData();
    }
  };

  // Format Nama Bulan & Tahun (contoh: Oktober 2026)
  const formatBulanTahun = (yyyyMmStr) => {
    if (!yyyyMmStr) return '-';
    const [year, month] = yyyyMmStr.split('-');
    const dateObj = new Date(year, month - 1, 1);
    return dateObj.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  // ROLLOVER PERIODE (SETELAH 12 PERTEMUAN)
  const handleRolloverPeriode = async (periodeLama) => {
    if (!window.confirm(`Lakukan Rollover untuk ${periodeLama.siswa?.nama_murid}? Ini akan membuka periode baru 12 pertemuan untuk bulan berikutnya.`)) return;

    try {
      await supabase.from('periode_belajar').update({ status_periode: 'selesai' }).eq('id', periodeLama.id);

      const nextMonth = new Date().toISOString().slice(0, 7);
      const { data: newP, error } = await supabase.from('periode_belajar').insert([{
        siswa_id: periodeLama.siswa_id,
        paket_id: periodeLama.paket_id,
        bulan_periode: nextMonth,
        total_pertemuan: 12,
        status_periode: 'berjalan'
      }]).select();

      if (error) throw error;

      if (newP && newP[0]) {
        await supabase.from('pembayaran_siswa').insert([{
          siswa_id: periodeLama.siswa_id,
          periode_id: newP[0].id,
          status_pembayaran: 'Belum Lunas',
          jumlah_pembayaran: 150000,
          item_bayar: 'Paket Belajar Bulanan',
          termin_ke: 1
        }]);
      }

      alert('✅ Rollover berhasil! Periode baru 12 pertemuan telah dibuat.');
      fetchAllData();
    } catch (err) {
      alert('Gagal rollover: ' + err.message);
    }
  };

  // PRESENSI GURU (MENGGUNAKAN SESI AKTIF SECARA OTOMATIS & AUTO-INCREMENT PERTEMUAN)
  const handleTambahPresensiSiswa = async (e) => {
    e.preventDefault();
    if (!selectedSiswaForPresensi) { alert('Pilih nama murid terlebih dahulu melalui pencarian!'); return; }
    if (!currentMentorProfile) { alert('Sesi mentor tidak valid!'); return; }

    await supabase.from('presensi_siswa').insert([{
      periode_id: selectedSiswaForPresensi.periode_id,
      mentor_id: currentMentorProfile.id,
      pertemuan_ke: newPresensiSiswa.pertemuan_ke,
      tanggal_pertemuan: newPresensiSiswa.tanggal_pertemuan,
      is_hadir: newPresensiSiswa.status_kehadiran === 'Hadir' || newPresensiSiswa.status_kehadiran === 'Kelas Pengganti',
      is_kelas_pengganti: newPresensiSiswa.status_kehadiran === 'Kelas Pengganti',
      jurnal_materi: `[${newPresensiSiswa.status_kehadiran}] ${newPresensiSiswa.jurnal_materi}`
    }]);

    alert('✅ Presensi berhasil dicatat!');
    setNewPresensiSiswa(prev => ({ ...prev, jurnal_materi: '' }));
    setSelectedSiswaForPresensi(null);
    fetchAllData();
  };

  const handleDaftarSubmit = async (e) => {
    e.preventDefault();
    if (selectedPaket.length === 0) { alert('Pilih minimal satu paket!'); return; }
    setLoading(true);

    try {
      const { data: siswaData } = await supabase.from('siswa').insert([{ ...formDaftar, status: 'pending' }]).select();

      if (siswaData && siswaData[0]) {
        const siswaId = siswaData[0].id;
        const currentBulan = new Date().toISOString().slice(0, 7);

        const periodeInserts = selectedPaket.map(pId => ({
          siswa_id: siswaId,
          paket_id: pId,
          bulan_periode: currentBulan,
          total_pertemuan: 12,
          status_periode: 'berjalan'
        }));

        await supabase.from('periode_belajar').insert(periodeInserts);
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      alert('Pendaftaran Berhasil! Mengarahkan ke WhatsApp Admin...');
      const waText = `Halo Admin Bimbel ErHa,\nSaya ${formDaftar.nama_orang_tua} mendaftarkan ${formDaftar.nama_murid}. Mohon konfirmasi approval.`;
      window.open(`https://wa.me/6281915058297?text=${encodeURIComponent(waText)}`, '_blank');
    }
  };

  const periodeSiswaAktif = daftarPeriode.filter(p => p.siswa?.status === 'aktif' && p.status_periode === 'berjalan');

  // Filter siswa instan untuk Presensi Guru
  const filteredSiswaForPresensi = periodeSiswaAktif.filter(p => 
    p.siswa?.nama_murid.toLowerCase().includes(searchSiswaQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FFFDF0] font-sans text-gray-800">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-[#581878] shadow-lg border-b-4 border-[#F59E0B]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-white rounded-xl p-1.5 shadow-md flex items-center justify-center">
              <span className="text-2xl font-black tracking-wider text-[#581878]">
                Er<span className="text-[#D95338]">Ha</span>
              </span>
            </div>
            <div>
              <h1 className="text-white font-extrabold text-lg leading-none">Bimbel ErHa</h1>
              <p className="text-[#F59E0B] font-bold text-xs">Rumah Hebat</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-xs bg-amber-400 text-purple-950 font-black px-3 py-1 rounded-full shadow uppercase">
                  {userRole === 'admin' ? '👑 Admin' : `👩‍🏫 Guru: ${currentMentorProfile?.nama_mentor || 'Mentor'}`}
                </span>
                {userRole === 'guru' && (
                  <button
                    onClick={() => setShowEditPasswordModal(true)}
                    className="bg-purple-800 hover:bg-purple-900 text-amber-300 font-bold py-1 px-3 rounded-full text-xs border border-amber-400 transition"
                  >
                    🔑 Ganti Password
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-1.5 px-4 rounded-full text-sm transition shadow"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="bg-purple-900 hover:bg-purple-950 text-white font-bold py-1.5 px-4 rounded-full text-sm border border-purple-400 transition"
              >
                🔐 Login Portal (Admin/Guru)
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* DASHBOARD USER */}
      {user ? (
        <div className="max-w-7xl mx-auto px-4 py-8">
          
          {/* ======================================================= */}
          {/* 👩‍🏫 PORTAL GURU                                         */}
          {/* ======================================================= */}
          {userRole === 'guru' && (
            <div className="space-y-8">
              <div className="bg-gradient-to-r from-purple-800 to-indigo-900 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-white overflow-hidden border-2 border-amber-400 flex items-center justify-center">
                    {currentMentorProfile?.foto_url ? (
                      <img src={currentMentorProfile.foto_url} alt="Foto Mentor" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-purple-900">👩‍🏫</span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black">Selamat datang, {currentMentorProfile?.nama_mentor || 'Guru'} 👋</h2>
                    <p className="text-purple-200 text-sm mt-0.5">Kelola profil pribadi, lihat daftar mentoring dengan pemilih tanggal, dan input presensi siswa.</p>
                  </div>
                </div>
              </div>

              {/* 1. PROFIL GURU (Form Edit & Upload Foto ke Supabase Storage) */}
              <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-purple-100">
                <h3 className="text-lg font-extrabold text-[#581878] mb-4">⚙️ Pengaturan Profil Pribadi Mentor</h3>
                <form onSubmit={handleSimpanProfilGuru} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">No. HP / WhatsApp</label>
                    <input 
                      type="text" 
                      value={guruProfileForm.no_hp} 
                      onChange={(e) => setGuruProfileForm({...guruProfileForm, no_hp: e.target.value})} 
                      className="w-full px-4 py-2 border rounded-xl text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Alamat Domisili</label>
                    <input 
                      type="text" 
                      value={guruProfileForm.alamat} 
                      onChange={(e) => setGuruProfileForm({...guruProfileForm, alamat: e.target.value})} 
                      className="w-full px-4 py-2 border rounded-xl text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Upload Foto Profil (Supabase Storage)</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleUploadFotoGuru} 
                      className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-100 file:text-purple-800 hover:file:bg-purple-200" 
                    />
                    {uploadingFoto && <p className="text-xs text-amber-600 mt-1">Mengunggah foto...</p>}
                  </div>
                  <button type="submit" className="md:col-span-3 bg-[#581878] hover:bg-purple-900 text-white font-bold py-2.5 rounded-xl text-sm shadow">
                    Simpan Perubahan Profil 💾
                  </button>
                </form>
              </div>

              {/* 2. DAFTAR MENTORING GURU (Dengan Date Picker & Custom Tanggal) */}
              <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-purple-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
                  <h3 className="text-lg font-extrabold text-[#581878]">📅 Jadwal & Riwayat Mentoring Saya</h3>
                  <div className="flex items-center space-x-2">
                    <label className="text-xs font-bold text-gray-600">Pilih Tanggal:</label>
                    <input 
                      type="date" 
                      value={filterTanggalMentor} 
                      onChange={(e) => setFilterTanggalMentor(e.target.value)} 
                      className="px-3 py-1.5 border rounded-xl text-sm font-bold text-purple-900 bg-purple-50" 
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-purple-50 text-[#581878] uppercase text-xs">
                      <tr><th className="p-3">Tanggal Sesi</th><th className="p-3">Nama Siswa</th><th className="p-3">Paket</th><th className="p-3">Pertemuan</th><th className="p-3">Jurnal Materi</th></tr>
                    </thead>
                    <tbody>
                      {daftarPresensiSiswa
                        .filter(ps => ps.mentor_id === currentMentorProfile?.id && ps.tanggal_pertemuan === filterTanggalMentor)
                        .length === 0 ? (
                          <tr><td colSpan="5" className="p-4 text-center text-gray-400 text-xs italic">Tidak ada catatan mentoring pada tanggal {filterTanggalMentor}.</td></tr>
                        ) : (
                          daftarPresensiSiswa
                            .filter(ps => ps.mentor_id === currentMentorProfile?.id && ps.tanggal_pertemuan === filterTanggalMentor)
                            .map(ps => (
                              <tr key={ps.id} className="border-b">
                                <td className="p-3 font-semibold">{ps.tanggal_pertemuan}</td>
                                <td className="p-3 font-bold">{ps.periode_belajar?.siswa?.nama_murid}</td>
                                <td className="p-3">{ps.periode_belajar?.paket_belajar?.nama_paket}</td>
                                <td className="p-3">Ke-{ps.pertemuan_ke}</td>
                                <td className="p-3 text-gray-600">{ps.jurnal_materi}</td>
                              </tr>
                            ))
                        )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3. TAMBAH PRESENSI SISWA (Filter Pencarian Instan & Auto-Increment Pertemuan) */}
              <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-purple-200">
                <h3 className="text-lg font-extrabold text-[#581878] mb-4">📝 Tambah Presensi Siswa & Auto-Increment Pertemuan</h3>
                
                {!selectedSiswaForPresensi ? (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-gray-700">Filter Pencarian Instan Nama Siswa</label>
                    <input 
                      type="text" 
                      placeholder="Ketik nama siswa untuk mencari..." 
                      value={searchSiswaQuery}
                      onChange={(e) => setSearchSiswaQuery(e.target.value)}
                      className="w-full px-4 py-2 border rounded-xl text-sm"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                      {filteredSiswaForPresensi.map(p => {
                        const riwayatSiswa = daftarPresensiSiswa.filter(ps => ps.periode_id === p.id);
                        const nextPertemuan = riwayatSiswa.length + 1;
                        return (
                          <div key={p.id} className="p-3 border rounded-xl flex justify-between items-center bg-purple-50/50">
                            <div>
                              <p className="font-bold text-sm text-purple-950">{p.siswa?.nama_murid}</p>
                              <p className="text-xs text-gray-500">Paket: {p.paket_belajar?.nama_paket} | Sesi Terakhir: {riwayatSiswa.length}/12</p>
                            </div>
                            <button 
                              type="button"
                              onClick={() => {
                                setSelectedSiswaForPresensi({ ...p, nextPertemuan });
                                setNewPresensiSiswa(prev => ({ ...prev, periode_id: p.id, pertemuan_ke: nextPertemuan }));
                              }}
                              className="bg-[#581878] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow hover:bg-purple-900"
                            >
                              Pilih ✓
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleTambahPresensiSiswa} className="space-y-4">
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex justify-between items-center">
                      <div>
                        <p className="text-xs text-amber-800 font-bold">Siswa Dipilih:</p>
                        <p className="font-black text-amber-950 text-sm">{selectedSiswaForPresensi.siswa?.nama_murid} ({selectedSiswaForPresensi.paket_belajar?.nama_paket})</p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setSelectedSiswaForPresensi(null)} 
                        className="text-xs text-red-600 font-bold underline"
                      >
                        Ganti Siswa
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Nomor Pertemuan (Auto-Increment)</label>
                        <input
                          type="number" min="1" max="12" required
                          value={newPresensiSiswa.pertemuan_ke}
                          onChange={(e) => setNewPresensiSiswa({ ...newPresensiSiswa, pertemuan_ke: Number(e.target.value) })}
                          className="w-full px-3 py-2 border rounded-xl text-sm font-bold bg-gray-100"
                        />
                        <p className="text-[10px] text-gray-500 mt-0.5">Otomatis terisi berdasarkan riwayat pertemuan terakhir.</p>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Tanggal Pertemuan</label>
                        <input
                          type="date" required
                          value={newPresensiSiswa.tanggal_pertemuan}
                          onChange={(e) => setNewPresensiSiswa({ ...newPresensiSiswa, tanggal_pertemuan: e.target.value })}
                          className="w-full px-3 py-2 border rounded-xl text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Status Kehadiran</label>
                        <select
                          value={newPresensiSiswa.status_kehadiran}
                          onChange={(e) => setNewPresensiSiswa({ ...newPresensiSiswa, status_kehadiran: e.target.value })}
                          className="w-full px-4 py-2 border rounded-xl outline-none bg-white font-bold text-sm text-purple-900"
                        >
                          <option value="Hadir">✅ Hadir</option>
                          <option value="Izin">📩 Izin Dikonfirmasi</option>
                          <option value="Alfa">❌ Alpha / Hangus</option>
                          <option value="Kelas Pengganti">🔄 Kelas Pengganti</option>
                        </select>
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-xs font-bold text-gray-700 mb-1">Jurnal / Catatan Materi Pembelajaran</label>
                        <input
                          type="text" placeholder="Contoh: Menguasai Materi AHE Hal 10-15"
                          value={newPresensiSiswa.jurnal_materi}
                          onChange={(e) => setNewPresensiSiswa({ ...newPresensiSiswa, jurnal_materi: e.target.value })}
                          className="w-full px-4 py-2 border rounded-xl text-sm"
                        />
                      </div>
                    </div>

                    <button type="submit" className="w-full bg-[#581878] hover:bg-purple-900 text-white font-extrabold py-3 rounded-xl shadow mt-2">
                      Simpan Presensi Sesi 🚀
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* 👑 PORTAL ADMIN (5 TAB UTAMA)                           */}
          {/* ======================================================= */}
          {userRole === 'admin' && (
            <div>
              <div className="flex overflow-x-auto border-b-2 border-purple-200 mb-6 space-x-2 pb-1">
                <button onClick={() => setAdminTab('siswa')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm whitespace-nowrap ${adminTab === 'siswa' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600'}`}>📋 SISWA</button>
                <button onClick={() => setAdminTab('mentor')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm whitespace-nowrap ${adminTab === 'mentor' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600'}`}>👩‍🏫 MENTOR</button>
                <button onClick={() => setAdminTab('pembayaran')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm whitespace-nowrap ${adminTab === 'pembayaran' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600'}`}>💵 PEMBAYARAN</button>
                <button onClick={() => setAdminTab('penggajian')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm whitespace-nowrap ${adminTab === 'penggajian' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600'}`}>💰 PENGGAJIAN</button>
                <button onClick={() => setAdminTab('modul')} className={`py-2.5 px-5 font-extrabold rounded-t-xl transition text-sm whitespace-nowrap ${adminTab === 'modul' ? 'bg-[#581878] text-white' : 'bg-white text-gray-600'}`}>📚 MODUL (INVENTARIS)</button>
              </div>

              {/* 1. TAB SISWA */}
              {adminTab === 'siswa' && (
                <div className="space-y-6">
                  {/* Sub-tab Siswa */}
                  <div className="flex space-x-2 border-b pb-3">
                    <button onClick={() => setSiswaSubTab('persetujuan')} className={`px-4 py-2 rounded-lg font-bold text-xs ${siswaSubTab === 'persetujuan' ? 'bg-amber-400 text-purple-950' : 'bg-white text-gray-600'}`}>Persetujuan Siswa Baru (Pending)</button>
                    <button onClick={() => setSiswaSubTab('data')} className={`px-4 py-2 rounded-lg font-bold text-xs ${siswaSubTab === 'data' ? 'bg-purple-900 text-white' : 'bg-white text-gray-600'}`}>Data Siswa & Detail</button>
                    <button onClick={() => setSiswaSubTab('presensi')} className={`px-4 py-2 rounded-lg font-bold text-xs ${siswaSubTab === 'presensi' ? 'bg-purple-900 text-white' : 'bg-white text-gray-600'}`}>Rekap Presensi Siswa</button>
                  </div>

                  {siswaSubTab === 'persetujuan' && (
                    <div className="bg-white rounded-2xl p-6 shadow-md">
                      <h3 className="text-lg font-bold text-[#581878] mb-4">Persetujuan Pendaftaran Siswa Baru</h3>
                      <table className="w-full text-left text-sm">
                        <thead className="bg-purple-50 text-[#581878] uppercase text-xs">
                          <tr><th className="p-3">Nama Murid</th><th className="p-3">Orang Tua</th><th className="p-3">Kontak WA</th><th className="p-3">Status</th><th className="p-3 text-center">Aksi</th></tr>
                        </thead>
                        <tbody>
                          {daftarSiswa.filter(s => s.status === 'pending').map((s) => (
                            <tr key={s.id} className="border-b">
                              <td className="p-3 font-bold">{s.nama_murid}</td>
                              <td className="p-3">{s.nama_orang_tua}</td>
                              <td className="p-3">💬 {s.no_hp}</td>
                              <td className="p-3"><span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded font-bold">Pending</span></td>
                              <td className="p-3 text-center">
                                <button onClick={async () => { await supabase.from('siswa').update({status: 'aktif'}).eq('id', s.id); fetchAllData(); }} className="bg-emerald-600 text-white font-bold text-xs px-3 py-1.5 rounded">✓ Setujui Aktif</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {siswaSubTab === 'data' && (
                    <div className="bg-white rounded-2xl p-6 shadow-md">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-[#581878]">Data Siswa Aktif & Detail</h3>
                      </div>
                      <table className="w-full text-left text-sm">
                        <thead className="bg-purple-50 text-[#581878] uppercase text-xs">
                          <tr><th className="p-3">Nama Murid</th><th className="p-3">Status</th><th className="p-3">Kontak / Wali</th><th className="p-3 text-center">Detail & Riwayat</th></tr>
                        </thead>
                        <tbody>
                          {daftarSiswa.map(s => (
                            <tr key={s.id} className="border-b">
                              <td className="p-3 font-bold">{s.nama_murid}</td>
                              <td className="p-3"><span className={`px-2 py-1 rounded text-xs font-bold ${s.status === 'aktif' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{s.status}</span></td>
                              <td className="p-3">{s.no_hp} ({s.nama_orang_tua})</td>
                              <td className="p-3 text-center">
                                <button 
                                  onClick={() => setDetailSiswaModal(s)}
                                  className="bg-purple-100 text-[#581878] font-bold text-xs px-3 py-1.5 rounded shadow hover:bg-purple-200"
                                >
                                  🔍 Detail Siswa
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {siswaSubTab === 'presensi' && (
                    <div className="bg-white rounded-2xl p-6 shadow-md">
                      <h3 className="text-lg font-bold text-[#581878] mb-4">Rekap Presensi Siswa & Detail Sesi (1-12)</h3>
                      <table className="w-full text-left text-sm">
                        <thead className="bg-purple-50 text-[#581878] uppercase text-xs">
                          <tr><th className="p-3">Tanggal</th><th className="p-3">Siswa</th><th className="p-3">Guru</th><th className="p-3">Pertemuan</th><th className="p-3">Jurnal</th><th className="p-3 text-center">Aksi</th></tr>
                        </thead>
                        <tbody>
                          {daftarPresensiSiswa.map(ps => (
                            <tr key={ps.id} className="border-b">
                              <td className="p-3 font-semibold">{ps.tanggal_pertemuan}</td>
                              <td className="p-3 font-bold">{ps.periode_belajar?.siswa?.nama_murid}</td>
                              <td className="p-3 text-purple-900 font-bold">{ps.mentor?.nama_mentor}</td>
                              <td className="p-3 font-bold">Ke-{ps.pertemuan_ke}</td>
                              <td className="p-3 text-gray-600">{ps.jurnal_materi}</td>
                              <td className="p-3 text-center space-x-1">
                                <button onClick={async () => { if(window.confirm('Hapus presensi ini?')) { await supabase.from('presensi_siswa').delete().eq('id', ps.id); fetchAllData(); } }} className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">Hapus</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* 2. TAB MENTOR (Dengan Tombol Edit Modal & Pengaturan Delegasi Wewenang) */}
              {adminTab === 'mentor' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-purple-200">
                    <h4 className="text-lg font-bold text-[#581878] mb-3">👩‍🏫 Tambah Mentor Baru & Kirim WA</h4>
                    <form onSubmit={handleTambahMentor} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input type="text" placeholder="Nama Lengkap Mentor" required value={newMentor.nama_mentor} onChange={(e) => setNewMentor({...newMentor, nama_mentor: e.target.value})} className="px-4 py-2 border rounded-xl" />
                      <input type="email" placeholder="Email Login Guru" required value={newMentor.email} onChange={(e) => setNewMentor({...newMentor, email: e.target.value})} className="px-4 py-2 border rounded-xl" />
                      <input type="password" placeholder="Password Login" required value={newMentor.password} onChange={(e) => setNewMentor({...newMentor, password: e.target.value})} className="px-4 py-2 border rounded-xl" />
                      <input type="text" placeholder="No. WhatsApp (08...)" required value={newMentor.no_hp} onChange={(e) => setNewMentor({...newMentor, no_hp: e.target.value})} className="px-4 py-2 border rounded-xl" />
                      <input type="number" placeholder="Tarif Honor per Jam (Rp)" required value={newMentor.honor_per_jam} onChange={(e) => setNewMentor({...newMentor, honor_per_jam: Number(e.target.value)})} className="px-4 py-2 border rounded-xl" />
                      
                      <button type="submit" disabled={loading} className="md:col-span-3 bg-[#581878] text-white font-bold py-3 rounded-xl shadow">
                        {loading ? 'Menyimpan...' : 'Simpan Mentor & Kirim Kredensial via WA 🚀'}
                      </button>
                    </form>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-md">
                    <h4 className="text-lg font-bold text-[#581878] mb-4">Daftar Mentor Terdaftar & Delegasi Wewenang</h4>
                    <table className="w-full text-left text-sm">
                      <thead className="bg-purple-50 text-[#581878] uppercase text-xs">
                        <tr><th className="p-3">Nama</th><th className="p-3">Email Login</th><th className="p-3">Tarif / Jam</th><th className="p-3">Delegasi Akses</th><th className="p-3 text-center">Aksi</th></tr>
                      </thead>
                      <tbody>
                        {daftarMentor.map(m => (
                          <tr key={m.id} className="border-b">
                            <td className="p-3 font-bold">{m.nama_mentor}</td>
                            <td className="p-3 text-purple-800">{m.email}</td>
                            <td className="p-3">Rp {(m.honor_per_jam || 25000).toLocaleString('id-ID')}</td>
                            <td className="p-3 text-xs space-x-1">
                              {m.akses_perizinan && <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">Perizinan</span>}
                              {m.akses_inventaris && <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">Inventaris</span>}
                              {!m.akses_perizinan && !m.akses_inventaris && <span className="text-gray-400">Standar</span>}
                            </td>
                            <td className="p-3 text-center space-x-2">
                              <button onClick={() => setEditMentorModal(m)} className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded text-xs font-bold">Edit</button>
                              <button onClick={async () => { if(window.confirm('Hapus mentor?')) { await supabase.from('mentor').delete().eq('id', m.id); fetchAllData(); } }} className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">Hapus</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 3. TAB PEMBAYARAN (Form Tambah, Tabel Rincian, Tombol Edit/Hapus) */}
              {adminTab === 'pembayaran' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl p-6 shadow-md border border-purple-100">
                    <h4 className="text-lg font-bold text-[#581878] mb-3">➕ Catat Pembayaran Siswa Baru</h4>
                    <form onSubmit={handleSimpanPembayaranAdmin} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <select required value={formPembayaranAdmin.siswa_id} onChange={(e) => setFormPembayaranAdmin({...formPembayaranAdmin, siswa_id: e.target.value})} className="px-4 py-2 border rounded-xl bg-white text-sm">
                        <option value="">-- Pilih Siswa --</option>
                        {daftarSiswa.map(s => <option key={s.id} value={s.id}>{s.nama_murid}</option>)}
                      </select>
                      <input type="text" placeholder="Item Bayar (Cth: SPB Bulanan)" required value={formPembayaranAdmin.item_bayar} onChange={(e) => setFormPembayaranAdmin({...formPembayaranAdmin, item_bayar: e.target.value})} className="px-4 py-2 border rounded-xl text-sm" />
                      <input type="number" placeholder="Jumlah (Rp)" required value={formPembayaranAdmin.jumlah_pembayaran} onChange={(e) => setFormPembayaranAdmin({...formPembayaranAdmin, jumlah_pembayaran: Number(e.target.value)})} className="px-4 py-2 border rounded-xl text-sm" />
                      <input type="date" required value={formPembayaranAdmin.tanggal_bayar} onChange={(e) => setFormPembayaranAdmin({...formPembayaranAdmin, tanggal_bayar: e.target.value})} className="px-4 py-2 border rounded-xl text-sm" />
                      <button type="submit" className="md:col-span-4 bg-[#581878] text-white font-bold py-2.5 rounded-xl text-sm shadow">Simpan Pembayaran 💵</button>
                    </form>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-md">
                    <h3 className="text-xl font-bold text-[#581878] mb-4">Riwayat Pembayaran Siswa</h3>
                    <table className="w-full text-left text-sm">
                      <thead className="bg-purple-50 text-[#581878] uppercase text-xs">
                        <tr><th className="p-3">Tanggal</th><th className="p-3">Murid</th><th className="p-3">Item Pembayaran</th><th className="p-3">Jumlah</th><th className="p-3">Status</th><th className="p-3 text-center">Aksi</th></tr>
                      </thead>
                      <tbody>
                        {daftarPembayaran.map((p) => (
                          <tr key={p.id} className="border-b">
                            <td className="p-3">{p.tanggal_pembayaran ? p.tanggal_pembayaran.split('T')[0] : '-'}</td>
                            <td className="p-3 font-bold">{p.siswa?.nama_murid || 'Siswa'}</td>
                            <td className="p-3">{p.item_bayar || 'Paket Belajar'}</td>
                            <td className="p-3 font-extrabold text-emerald-700">Rp {(p.jumlah_pembayaran || 150000).toLocaleString('id-ID')}</td>
                            <td className="p-3"><span className={`text-xs font-bold px-2 py-1 rounded ${p.status_pembayaran === 'Lunas' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>{p.status_pembayaran}</span></td>
                            <td className="p-3 text-center space-x-1">
                              <button onClick={() => setEditPembayaranModal(p)} className="bg-amber-100 text-amber-800 font-bold text-xs px-2 py-1 rounded">Edit</button>
                              <button onClick={async () => { if(window.confirm('Hapus data pembayaran ini?')) { await supabase.from('pembayaran_siswa').delete().eq('id', p.id); fetchAllData(); } }} className="bg-red-100 text-red-700 font-bold text-xs px-2 py-1 rounded">Hapus</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 4. TAB PENGGAJIAN (Format Bulan & Tahun Seperti Oktober 2026, Dilengkapi Edit/Hapus) */}
              {adminTab === 'penggajian' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl p-6 shadow-md border border-purple-100">
                    <h4 className="text-lg font-bold text-[#581878] mb-3">💰 Generate Rekap Gaji Bulanan</h4>
                    <form onSubmit={handleSimpanGaji} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <select required value={gajiForm.mentor_id} onChange={(e) => setGajiForm({...gajiForm, mentor_id: e.target.value})} className="px-4 py-2 border rounded-xl bg-white text-sm">
                        <option value="">-- Pilih Mentor --</option>
                        {daftarMentor.map(m => <option key={m.id} value={m.id}>{m.nama_mentor}</option>)}
                      </select>
                      <input type="month" required value={gajiForm.bulan_periode} onChange={(e) => setGajiForm({...gajiForm, bulan_periode: e.target.value})} className="px-4 py-2 border rounded-xl text-sm" />
                      <input type="number" placeholder="Tunjangan Kinerja (Rp)" value={gajiForm.tunjangan_kinerja} onChange={(e) => setGajiForm({...gajiForm, tunjangan_kinerja: Number(e.target.value)})} className="px-4 py-2 border rounded-xl text-sm" />
                      <input type="number" placeholder="Bonus (Rp)" value={gajiForm.bonus} onChange={(e) => setGajiForm({...gajiForm, bonus: Number(e.target.value)})} className="px-4 py-2 border rounded-xl text-sm" />
                      <button type="submit" className="md:col-span-4 bg-[#581878] text-white font-bold py-2.5 rounded-xl text-sm">Hitung & Simpan Rekap Gaji</button>
                    </form>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-md">
                    <h4 className="text-lg font-bold text-[#581878] mb-4">Riwayat Penggajian Mentor</h4>
                    <table className="w-full text-left text-sm">
                      <thead className="bg-purple-50 text-[#581878] uppercase text-xs">
                        <tr><th className="p-3">Periode Bulan</th><th className="p-3">Mentor</th><th className="p-3">Total Jam</th><th className="p-3">Total Gaji</th><th className="p-3">Status</th><th className="p-3 text-center">Aksi</th></tr>
                      </thead>
                      <tbody>
                        {daftarPenggajian.map(g => {
                          const totalHonor = (g.total_jam_mengajar * g.honor_per_jam) + (g.insentif || 0) + (g.bonus_kinerja || 0);
                          return (
                            <tr key={g.id} className="border-b">
                              <td className="p-3 font-extrabold text-purple-950">{formatBulanTahun(g.bulan_periode)}</td>
                              <td className="p-3 font-bold">{g.mentor?.nama_mentor}</td>
                              <td className="p-3">{g.total_jam_mengajar} Jam</td>
                              <td className="p-3 font-extrabold text-emerald-600">Rp {totalHonor.toLocaleString('id-ID')}</td>
                              <td className="p-3"><span className={`text-xs font-bold px-2 py-1 rounded uppercase ${g.status_pembayaran === 'dibayar' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{g.status_pembayaran}</span></td>
                              <td className="p-3 text-center space-x-1">
                                {g.status_pembayaran !== 'dibayar' && <button onClick={() => handleBayarGaji(g.id)} className="bg-emerald-600 text-white font-bold text-xs px-2 py-1 rounded">Bayar</button>}
                                <button onClick={() => setEditPenggajianModal(g)} className="bg-amber-100 text-amber-800 font-bold text-xs px-2 py-1 rounded">Edit</button>
                                <button onClick={async () => { if(window.confirm('Hapus rekap gaji ini?')) { await supabase.from('penggajian_mentor').delete().eq('id', g.id); fetchAllData(); } }} className="bg-red-100 text-red-700 font-bold text-xs px-2 py-1 rounded">Hapus</button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 5. TAB MODUL (INVENTARIS STOK) */}
              {adminTab === 'modul' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl p-6 shadow-md border border-emerald-100">
                    <h4 className="text-lg font-bold text-emerald-800 mb-3">➕ Tambah Stok Modul / Bahan Ajar</h4>
                    <form onSubmit={async (e) => { e.preventDefault(); await supabase.from('inventaris_logistik').insert([newBarang]); setNewBarang({nama_barang:'', kategori:'buku', stok:10, harga_satuan:15000}); fetchAllData(); }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input type="text" placeholder="Nama Modul" required value={newBarang.nama_barang} onChange={(e) => setNewBarang({...newBarang, nama_barang: e.target.value})} className="px-4 py-2 border rounded-xl text-sm" />
                      <input type="number" placeholder="Jumlah Stok" value={newBarang.stok} onChange={(e) => setNewBarang({...newBarang, stok: Number(e.target.value)})} className="px-4 py-2 border rounded-xl text-sm" />
                      <button type="submit" className="bg-emerald-600 text-white font-bold py-2 rounded-xl text-sm">Simpan Stok Modul</button>
                    </form>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {daftarInventaris.map(b => (
                      <div key={b.id} className="bg-white p-5 rounded-2xl shadow border flex justify-between items-center">
                        <div>
                          <h5 className="font-bold text-gray-900">{b.nama_barang}</h5>
                          <p className="text-sm font-black text-emerald-600 mt-1">Stok Fisik: {b.stok} Unit</p>
                        </div>
                        <div className="space-x-1">
                          <button onClick={async () => { await supabase.from('inventaris_logistik').update({stok: b.stok + 1}).eq('id', b.id); fetchAllData(); }} className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-bold">+1</button>
                          <button onClick={async () => { await supabase.from('inventaris_logistik').update({stok: Math.max(0, b.stok - 1)}).eq('id', b.id); fetchAllData(); }} className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold">-1</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      ) : (
        /* PUBLIC LANDING PAGE */
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
                Mendampingi putra-putri Anda menguasai Baca AHE, Berhitung ASE, hingga Mata Pelajaran Sekolah.
              </p>
            </div>
          </section>

          {/* PAKET BELAJAR */}
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
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{paket.nama_paket}</h4>
                    <p className="text-gray-600 text-sm mb-4">{paket.deskripsi || 'Program bimbingan intensif 12 pertemuan.'}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* FORM PENDAFTARAN */}
          <section className="max-w-3xl mx-auto px-4 mb-20">
            <div className="bg-white rounded-3xl shadow-xl border-2 border-purple-100 p-8">
              <h3 className="text-2xl font-black text-[#581878] mb-6 text-center">📝 Form Pendaftaran Siswa Baru</h3>
              <form onSubmit={handleDaftarSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nama Lengkap Murid</label>
                  <input type="text" required value={formDaftar.nama_murid} onChange={(e) => setFormDaftar({ ...formDaftar, nama_murid: e.target.value })} className="w-full px-4 py-3 rounded-xl border outline-none" placeholder="Contoh: Budi Pratama" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Nama Orang Tua / Wali</label>
                    <input type="text" required value={formDaftar.nama_orang_tua} onChange={(e) => setFormDaftar({ ...formDaftar, nama_orang_tua: e.target.value })} className="w-full px-4 py-3 rounded-xl border outline-none" placeholder="Ibu Rina" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">No. WhatsApp</label>
                    <input type="tel" required value={formDaftar.no_hp} onChange={(e) => setFormDaftar({ ...formDaftar, no_hp: e.target.value })} className="w-full px-4 py-3 rounded-xl border outline-none" placeholder="081234567890" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full py-4 bg-[#581878] hover:bg-purple-900 text-white font-extrabold text-lg rounded-xl shadow-lg transition">
                  {loading ? 'Memproses...' : 'Kirim Pendaftaran Online 🚀'}
                </button>
              </form>
            </div>
          </section>
        </>
      )}

      {/* MODAL DETAIL SISWA (ADMIN) */}
      {detailSiswaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative border-4 border-[#581878]">
            <button onClick={() => setDetailSiswaModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-xl">✕</button>
            <h3 className="text-2xl font-black text-[#581878] mb-1">Detail Profil Siswa</h3>
            <p className="text-xs text-gray-500 mb-4">Ringkasan profil, status paket belajar, dan riwayat presensi/pembayaran.</p>
            
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-purple-50 rounded-xl space-y-1">
                <p><strong>Nama Murid:</strong> {detailSiswaModal.nama_murid}</p>
                <p><strong>Orang Tua / Wali:</strong> {detailSiswaModal.nama_orang_tua}</p>
                <p><strong>No HP:</strong> {detailSiswaModal.no_hp}</p>
                <p><strong>Alamat:</strong> {detailSiswaModal.alamat || '-'}</p>
                <p><strong>Status Siswa:</strong> <span className="uppercase font-bold text-purple-800">{detailSiswaModal.status}</span></p>
              </div>

              <div>
                <h4 className="font-bold text-xs text-gray-700 uppercase mb-1">Riwayat Presensi Terbaru:</h4>
                <div className="max-h-36 overflow-y-auto space-y-1">
                  {daftarPresensiSiswa.filter(ps => ps.periode_belajar?.siswa?.nama_murid === detailSiswaModal.nama_murid).length === 0 ? (
                    <p className="text-xs text-gray-400 italic">Belum ada catatan presensi.</p>
                  ) : (
                    daftarPresensiSiswa
                      .filter(ps => ps.periode_belajar?.siswa?.nama_murid === detailSiswaModal.nama_murid)
                      .map(ps => (
                        <div key={ps.id} className="text-xs p-2 bg-gray-50 rounded border flex justify-between">
                          <span>{ps.tanggal_pertemuan} (Sesi #{ps.pertemuan_ke})</span>
                          <span className="font-semibold text-purple-900">{ps.jurnal_materi}</span>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>

            <button onClick={() => setDetailSiswaModal(null)} className="w-full mt-6 py-2.5 bg-[#581878] text-white font-bold rounded-xl text-sm shadow">
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* MODAL EDIT MENTOR & DELEGASI WEWENANG (ADMIN) */}
      {editMentorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative border-4 border-[#581878]">
            <button onClick={() => setEditMentorModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-xl">✕</button>
            <h3 className="text-2xl font-black text-[#581878] mb-1">Edit Data Mentor</h3>
            <p className="text-xs text-gray-500 mb-4">Pengaturan informasi mentor dan delegasi wewenang akses.</p>
            
            <form onSubmit={handleUpdateMentorAdmin} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nama Mentor</label>
                <input type="text" value={editMentorModal.nama_mentor} onChange={(e) => setEditMentorModal({...editMentorModal, nama_mentor: e.target.value})} className="w-full px-3 py-2 border rounded-xl" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">No HP / WhatsApp</label>
                <input type="text" value={editMentorModal.no_hp} onChange={(e) => setEditMentorModal({...editMentorModal, no_hp: e.target.value})} className="w-full px-3 py-2 border rounded-xl" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Honor per Jam (Rp)</label>
                <input type="number" value={editMentorModal.honor_per_jam} onChange={(e) => setEditMentorModal({...editMentorModal, honor_per_jam: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-xl" required />
              </div>
              
              <div className="pt-2 border-t space-y-2">
                <p className="text-xs font-bold text-purple-900">Delegasi Wewenang Akses:</p>
                <label className="flex items-center space-x-2 text-xs font-medium cursor-pointer">
                  <input type="checkbox" checked={editMentorModal.akses_perizinan || false} onChange={(e) => setEditMentorModal({...editMentorModal, akses_perizinan: e.target.checked})} className="rounded text-purple-800" />
                  <span>Akses Perizinan Siswa</span>
                </label>
                <label className="flex items-center space-x-2 text-xs font-medium cursor-pointer">
                  <input type="checkbox" checked={editMentorModal.akses_inventaris || false} onChange={(e) => setEditMentorModal({...editMentorModal, akses_inventaris: e.target.checked})} className="rounded text-purple-800" />
                  <span>Akses Inventaris / Modul</span>
                </label>
              </div>

              <button type="submit" className="w-full mt-4 py-3 bg-[#581878] text-white font-bold rounded-xl text-sm shadow">
                Simpan Perubahan Mentor 💾
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT PEMBAYARAN SISWA (ADMIN) */}
      {editPembayaranModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative border-4 border-[#581878]">
            <button onClick={() => setEditPembayaranModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-xl">✕</button>
            <h3 className="text-2xl font-black text-[#581878] mb-1">Edit Pembayaran</h3>
            <p className="text-xs text-gray-500 mb-4">Perbarui rincian item atau status pembayaran siswa.</p>
            
            <form onSubmit={handleUpdatePembayaranAdmin} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Item Bayar</label>
                <input type="text" value={editPembayaranModal.item_bayar || ''} onChange={(e) => setEditPembayaranModal({...editPembayaranModal, item_bayar: e.target.value})} className="w-full px-3 py-2 border rounded-xl" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Jumlah Pembayaran (Rp)</label>
                <input type="number" value={editPembayaranModal.jumlah_pembayaran || 0} onChange={(e) => setEditPembayaranModal({...editPembayaranModal, jumlah_pembayaran: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-xl" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Status Pembayaran</label>
                <select value={editPembayaranModal.status_pembayaran} onChange={(e) => setEditPembayaranModal({...editPembayaranModal, status_pembayaran: e.target.value})} className="w-full px-3 py-2 border rounded-xl bg-white font-bold">
                  <option value="Lunas">Lunas</option>
                  <option value="Belum Lunas">Belum Lunas</option>
                </select>
              </div>

              <button type="submit" className="w-full mt-4 py-3 bg-[#581878] text-white font-bold rounded-xl text-sm shadow">
                Perbarui Pembayaran 💾
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT PENGGAJIAN MENTOR (ADMIN) */}
      {editPenggajianModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative border-4 border-[#581878]">
            <button onClick={() => setEditPenggajianModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-xl">✕</button>
            <h3 className="text-2xl font-black text-[#581878] mb-1">Edit Penggajian Mentor</h3>
            <p className="text-xs text-gray-500 mb-4">Kelola data tunjangan, bonus, dan periode gaji.</p>
            
            <form onSubmit={handleUpdatePenggajian} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Periode Bulan</label>
                <input type="month" value={editPenggajianModal.bulan_periode || ''} onChange={(e) => setEditPenggajianModal({...editPenggajianModal, bulan_periode: e.target.value})} className="w-full px-3 py-2 border rounded-xl" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Tunjangan Kinerja (Rp)</label>
                <input type="number" value={editPenggajianModal.insentif || 0} onChange={(e) => setEditPenggajianModal({...editPenggajianModal, insentif: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-xl" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Bonus Kinerja (Rp)</label>
                <input type="number" value={editPenggajianModal.bonus_kinerja || 0} onChange={(e) => setEditPenggajianModal({...editPenggajianModal, bonus_kinerja: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-xl" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
                <select value={editPenggajianModal.status_pembayaran} onChange={(e) => setEditPenggajianModal({...editPenggajianModal, status_pembayaran: e.target.value})} className="w-full px-3 py-2 border rounded-xl bg-white font-bold">
                  <option value="draft">Draft</option>
                  <option value="dibayar">Dibayar</option>
                </select>
              </div>

              <button type="submit" className="w-full mt-4 py-3 bg-[#581878] text-white font-bold rounded-xl text-sm shadow">
                Perbarui Gaji 💾
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL GANTI PASSWORD GURU */}
      {showEditPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative border-4 border-[#581878]">
            <button onClick={() => setShowEditPasswordModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-xl">✕</button>
            <h3 className="text-2xl font-black text-[#581878] mb-2 text-center">Ganti Password Akun</h3>
            <p className="text-xs text-gray-500 mb-6 text-center">Masukkan password baru untuk akun pengajar Anda.</p>
            <form onSubmit={handleGantiPasswordGuru} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Password Baru (Min. 6 Karakter)</label>
                <input type="password" required minLength={6} value={newPasswordGuru} onChange={(e) => setNewPasswordGuru(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border outline-none" placeholder="••••••••" />
              </div>
              <button type="submit" className="w-full py-3 bg-[#581878] text-white font-bold rounded-xl shadow-md transition">
                Simpan Password Baru 🔑
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL LOGIN */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative border-4 border-[#581878]">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-xl">✕</button>
            <h3 className="text-2xl font-black text-[#581878] mb-2 text-center">Login Portal</h3>
            <p className="text-xs text-gray-500 mb-6 text-center">Masuk sebagai Admin atau Guru/Mentor Bimbel ErHa</p>

            {loginError && <div className="bg-red-100 text-red-700 text-xs p-3 rounded-xl mb-4 font-semibold">{loginError}</div>}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
                <input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border outline-none" placeholder="admin@bimbelerha.com" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
                <input type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border outline-none" placeholder="••••••••" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 bg-[#581878] text-white font-bold rounded-xl shadow-md transition">
                {loading ? 'Memverifikasi...' : 'Masuk Portal'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-[#581878] text-white py-8 text-center border-t-4 border-[#F59E0B]">
        <p className="font-bold text-lg">Bimbel ErHa (Rumah Hebat)</p>
        <p className="text-purple-200 text-sm mt-1">Sistem Pendaftaran, Presensi, Payroll & Rollover Sesi</p>
      </footer>
    </div>
  );
}
