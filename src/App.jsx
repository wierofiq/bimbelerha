import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Inisialisasi Supabase Client
const supabaseUrl = 'https://izifwpviqpyxauafdlge.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6aWZ3cHZpcXB5eGF1YWZkbGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NDA2ODYsImV4cCI6MjEwNjUxNjY4Nn0.XpJEgQ3vpGOYmPVi-nsjrSRJI9RfR5kWTN_XsL-TCUU';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('guru');
  const [currentMentorProfile, setCurrentMentorProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [appReady, setAppReady] = useState(false); // Fix Poin 1: Menunggu profil siap

  // Navigasi
  const [adminTab, setAdminTab] = useState('siswa');
  const [siswaSubTab, setSiswaSubTab] = useState('data');
  const [mentorSubTab, setMentorSubTab] = useState('daftar');
  const [guruTab, setGuruTab] = useState('beranda');
  const [modulSubTab, setModulSubTab] = useState('data_barang'); // Fix Poin 6

  // Master Data
  const [paketList, setPaketList] = useState([]);
  const [daftarSiswa, setDaftarSiswa] = useState([]);
  const [daftarMentor, setDaftarMentor] = useState([]);
  const [daftarPeriode, setDaftarPeriode] = useState([]);
  const [daftarPresensiSiswa, setDaftarPresensiSiswa] = useState([]);
  const [daftarPembayaran, setDaftarPembayaran] = useState([]);
  const [daftarInventaris, setDaftarInventaris] = useState([]);
  const [daftarTransaksiLogistik, setDaftarTransaksiLogistik] = useState([]);

  // States UI & Forms
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Fix Poin 5: State Pencarian Siswa
  const [searchSiswaBayar, setSearchSiswaBayar] = useState('');

  // Form States
  const [formPembayaran, setFormPembayaran] = useState({ siswa_id: '', tanggal_pembayaran: new Date().toISOString().split('T')[0], items: [], total_bayar: 0, catatan: '' });
  const paymentItemOptions = ['Pendaftaran', 'Bulanan', 'Buku', 'Seragam', 'Lainnya'];
  
  const [formModul, setFormModul] = useState({ nama_barang: '', kategori: 'Buku', stok: 0, harga_satuan: 0, deskripsi: '', thumbnail: '' });
  const [formTransaksi, setFormTransaksi] = useState({ barang_id: '', tipe_transaksi: 'masuk', jumlah: 1, keterangan: '' });
  
  const [newPresensiSiswa, setNewPresensiSiswa] = useState({ periode_id: '', pertemuan_ke: 1, tanggal_pertemuan: new Date().toISOString().split('T')[0], status_kehadiran: 'Hadir', jurnal_materi: '' });


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
    const { data } = await supabase.from('paket_belajar').select('*');
    if (data) setPaketList(data);
  }

  async function fetchAllData() {
    const [siswa, mentor, periode, presensiS, pemb, logistik, transaksi] = await Promise.all([
      supabase.from('siswa').select('*').order('created_at', { ascending: false }),
      supabase.from('mentor').select('*').order('created_at', { ascending: false }),
      supabase.from('periode_belajar').select('*, siswa(nama_murid, status), paket_belajar(nama_paket)').order('created_at', { ascending: false }),
      supabase.from('presensi_siswa').select('*, mentor(nama_mentor), periode_belajar(siswa(nama_murid, siswa_id))').order('tanggal_pertemuan', { ascending: false }),
      supabase.from('pembayaran_siswa').select('*, siswa(nama_murid)').order('tanggal_pembayaran', { ascending: false }),
      supabase.from('inventaris_logistik').select('*').order('nama_barang', { ascending: true }),
      supabase.from('transaksi_logistik').select('*, inventaris_logistik(nama_barang, kategori)').order('created_at', { ascending: false })
    ]);

    if(siswa.data) setDaftarSiswa(siswa.data);
    if(mentor.data) setDaftarMentor(mentor.data);
    if(periode.data) setDaftarPeriode(periode.data);
    if(presensiS.data) setDaftarPresensiSiswa(presensiS.data);
    if(pemb.data) setDaftarPembayaran(pemb.data);
    if(logistik.data) setDaftarInventaris(logistik.data);
    if(transaksi.data) setDaftarTransaksiLogistik(transaksi.data);
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    if (!error) {
      setShowLoginModal(false);
      await determineUserRoleAndProfile(data.user);
      setLoginEmail(''); setLoginPassword('');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // --- HANDLERS TRANSAKSI & INVENTARIS (Bisa Admin / Guru dengan Akses) ---
  const handleTambahModul = async (e) => {
    e.preventDefault();
    await supabase.from('inventaris_logistik').insert([formModul]);
    alert('Modul/Barang ditambahkan!');
    setFormModul({ nama_barang: '', kategori: 'Buku', stok: 0, harga_satuan: 0, deskripsi: '', thumbnail: '' });
    fetchAllData();
  };

  const handleHapusModul = async (id) => {
    if(!window.confirm('Hapus modul ini beserta transaksinya?')) return;
    // Harus hapus transaksi logistiknya dulu agar tidak error foreign key
    await supabase.from('transaksi_logistik').delete().eq('barang_id', id);
    await supabase.from('inventaris_logistik').delete().eq('id', id);
    fetchAllData();
  };

  const handleSimpanTransaksiLogistik = async (e) => {
    e.preventDefault();
    const barang = daftarInventaris.find(b => b.id === formTransaksi.barang_id);
    if (!barang) return;
    if (formTransaksi.tipe_transaksi === 'keluar' && barang.stok < formTransaksi.jumlah) {
      return alert('Stok tidak mencukupi untuk transaksi keluar!');
    }

    // Insert transaksi
    await supabase.from('transaksi_logistik').insert([formTransaksi]);
    
    // Update stok
    const stokBaru = formTransaksi.tipe_transaksi === 'masuk' ? barang.stok + formTransaksi.jumlah : barang.stok - formTransaksi.jumlah;
    await supabase.from('inventaris_logistik').update({ stok: stokBaru }).eq('id', barang.id);
    
    alert('Transaksi berhasil dicatat!');
    setFormTransaksi({ barang_id: '', tipe_transaksi: 'masuk', jumlah: 1, keterangan: '' });
    fetchAllData();
  };

  const handleHapusTransaksiLogistik = async (transaksi) => {
    if(!window.confirm('Hapus histori ini? Stok akan direvert kembali.')) return;
    const barang = daftarInventaris.find(b => b.id === transaksi.barang_id);
    if (barang) {
      // Revert Stok (Kebalikan dari saat insert)
      const stokRevert = transaksi.tipe_transaksi === 'masuk' ? barang.stok - transaksi.jumlah : barang.stok + transaksi.jumlah;
      await supabase.from('inventaris_logistik').update({ stok: stokRevert }).eq('id', barang.id);
    }
    await supabase.from('transaksi_logistik').delete().eq('id', transaksi.id);
    alert('Histori dihapus dan stok dikembalikan!');
    fetchAllData();
  };

  // --- HANDLER PEMBAYARAN (Fix Poin 4) ---
  const handleCatatPembayaran = async (e) => {
    e.preventDefault();
    if (formPembayaran.items.length === 0) return alert('Pilih minimal 1 item bayar!');
    if (!formPembayaran.total_bayar || formPembayaran.total_bayar <= 0) return alert('Nominal pembayaran wajib diisi!');
    
    // Gabung array jadi 1 string, record jadi 1 baris
    const gabunganItems = formPembayaran.items.join(', ');
    await supabase.from('pembayaran_siswa').insert([{
      siswa_id: formPembayaran.siswa_id, 
      item_bayar: gabunganItems, 
      jumlah_bayar: formPembayaran.total_bayar, 
      tanggal_pembayaran: formPembayaran.tanggal_pembayaran, 
      catatan: formPembayaran.catatan, 
      status_pembayaran: 'lunas'
    }]);
    
    alert('✅ Pembayaran tercatat!');
    setFormPembayaran({ siswa_id: '', tanggal_pembayaran: new Date().toISOString().split('T')[0], items: [], total_bayar: 0, catatan: '' });
    setSearchSiswaBayar('');
    fetchAllData();
  };

  // --- HANDLER GURU PRESENSI ---
  const handleTambahPresensiSiswa = async (e) => {
    e.preventDefault();
    // Fix Poin 1: Validasi ketat profil
    if (!currentMentorProfile || !currentMentorProfile.id) {
      return alert('Sesi Mentor Tidak Valid! Silakan muat ulang halaman atau login kembali.');
    }
    if (!newPresensiSiswa.periode_id) return alert('Pilih nama murid!');
    
    await supabase.from('presensi_siswa').insert([{
      periode_id: newPresensiSiswa.periode_id, mentor_id: currentMentorProfile.id, pertemuan_ke: newPresensiSiswa.pertemuan_ke, tanggal_pertemuan: newPresensiSiswa.tanggal_pertemuan,
      is_hadir: newPresensiSiswa.status_kehadiran === 'Hadir', jurnal_materi: `[${newPresensiSiswa.status_kehadiran}] ${newPresensiSiswa.jurnal_materi}`
    }]);
    alert('✅ Presensi berhasil dicatat!');
    setNewPresensiSiswa(prev => ({ ...prev, jurnal_materi: '' }));
    fetchAllData();
  };

  if (!appReady) return <div className="min-h-screen flex items-center justify-center font-bold">Memuat Data Portal...</div>;

  return (
    <div className="min-h-screen bg-[#FFFDF0] font-sans text-gray-800">
      
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-[#581878] shadow-lg border-b-4 border-[#F59E0B]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src="public/logo.png" alt="Logo" className="h-10 w-10 bg-white rounded-full p-1" />
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
                <span className="text-xs bg-amber-400 text-purple-950 font-black px-3 py-1 rounded-full uppercase">
                  {userRole === 'admin' ? '👑 Admin' : `Guru: ${currentMentorProfile?.nama_mentor?.split(' ')[0]}`}
                </span>
                <button onClick={handleLogout} className="bg-red-500 text-white font-bold py-1 px-3 rounded-full text-xs">Keluar</button>
              </div>
            ) : (
              <button onClick={() => setShowLoginModal(true)} className="bg-purple-900 text-white font-bold py-1.5 px-4 rounded-full text-sm">🔐 Login Portal</button>
            )}
          </div>
        </div>
      </nav>

      {user ? (
        <div className="max-w-7xl mx-auto px-4 py-8">
          
          {/* ================================== PORTAL ADMIN ================================== */}
          {userRole === 'admin' && (
            <div>
              <div className="flex overflow-x-auto border-b-2 mb-6 space-x-2 pb-1">
                <button onClick={() => setAdminTab('siswa')} className={`py-2 px-4 font-bold rounded-t-xl text-sm ${adminTab === 'siswa' ? 'bg-[#581878] text-white' : 'bg-white'}`}>📋 SISWA</button>
                <button onClick={() => setAdminTab('mentor')} className={`py-2 px-4 font-bold rounded-t-xl text-sm ${adminTab === 'mentor' ? 'bg-[#581878] text-white' : 'bg-white'}`}>👩‍‍🏫 MENTOR</button>
                <button onClick={() => setAdminTab('pembayaran')} className={`py-2 px-4 font-bold rounded-t-xl text-sm ${adminTab === 'pembayaran' ? 'bg-[#581878] text-white' : 'bg-white'}`}>💵 PEMBAYARAN</button>
                <button onClick={() => setAdminTab('modul')} className={`py-2 px-4 font-bold rounded-t-xl text-sm ${adminTab === 'modul' ? 'bg-[#581878] text-white' : 'bg-white'}`}>📚 MODUL & INVENTARIS</button>
              </div>

              {/* [Hanya Menampilkan Modul & Pembayaran untuk Kesingkatan, Fungsi Lain Tetap Seperti Kode Sebelumnya] */}

              {/* ADMIN: TAB PEMBAYARAN (Fix Poin 4 & 5) */}
              {adminTab === 'pembayaran' && (
                 <div>
                    <div className="bg-white p-6 rounded-xl shadow mb-6 border-t-4 border-emerald-500">
                       <h3 className="text-xl font-bold text-[#581878] mb-4">Pencatatan Pembayaran 1 Record</h3>
                       <form onSubmit={handleCatatPembayaran} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            {/* Filter Siswa */}
                            <div className="border p-3 rounded-xl bg-gray-50">
                               <label className="text-xs font-bold block mb-1">Cari Nama Siswa:</label>
                               <input type="text" placeholder="Ketik nama untuk memfilter..." value={searchSiswaBayar} onChange={e => setSearchSiswaBayar(e.target.value)} className="w-full border p-2 rounded mb-2 text-sm" />
                               <select required size="4" value={formPembayaran.siswa_id} onChange={e => setFormPembayaran({...formPembayaran, siswa_id: e.target.value})} className="w-full border p-2 rounded bg-white text-sm">
                                  <option value="" disabled>-- Pilih Siswa Dari Hasil Pencarian --</option>
                                  {daftarSiswa.filter(s => s.status === 'aktif' && s.nama_murid.toLowerCase().includes(searchSiswaBayar.toLowerCase())).map(s => <option key={s.id} value={s.id}>{s.nama_murid}</option>)}
                               </select>
                            </div>
                            <input type="date" required value={formPembayaran.tanggal_pembayaran} onChange={e => setFormPembayaran({...formPembayaran, tanggal_pembayaran: e.target.value})} className="w-full border p-3 rounded-xl" />
                            <input type="number" placeholder="Nominal Wajib (Rp)" required value={formPembayaran.total_bayar} onChange={e => setFormPembayaran({...formPembayaran, total_bayar: Number(e.target.value)})} className="w-full border p-3 rounded-xl font-bold bg-emerald-50" />
                          </div>
                          
                          <div className="space-y-4">
                            <div className="border p-4 rounded-xl">
                               <p className="text-sm font-bold mb-3 text-[#581878]">Pilih Item (Akan Digabung Jadi 1 Baris):</p>
                               <div className="grid grid-cols-2 gap-3">
                                 {paymentItemOptions.map(item => (
                                   <label key={item} className="text-sm cursor-pointer flex items-center">
                                     <input type="checkbox" className="mr-2" onChange={(e) => {
                                       if(e.target.checked) setFormPembayaran({...formPembayaran, items: [...formPembayaran.items, item]});
                                       else setFormPembayaran({...formPembayaran, items: formPembayaran.items.filter(i => i !== item)});
                                     }} /> {item}
                                   </label>
                                 ))}
                               </div>
                            </div>
                            <button type="submit" className="w-full bg-[#581878] text-white py-3 rounded-xl font-bold">Simpan Pembayaran</button>
                          </div>
                       </form>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow">
                      <h4 className="text-lg font-bold text-[#581878] mb-4">Riwayat Terakhir</h4>
                      <table className="w-full text-left text-sm">
                        <thead className="bg-purple-50"><tr><th className="p-3">Tanggal</th><th className="p-3">Siswa</th><th className="p-3">Item Gabungan</th><th className="p-3">Nominal Total</th></tr></thead>
                        <tbody>
                          {daftarPembayaran.map(pb => (
                             <tr key={pb.id} className="border-b"><td className="p-3">{pb.tanggal_pembayaran}</td><td className="p-3 font-bold">{pb.siswa?.nama_murid}</td><td className="p-3"><span className="text-purple-800 font-bold">{pb.item_bayar}</span></td><td className="p-3 text-emerald-600 font-bold">Rp {Number(pb.jumlah_bayar).toLocaleString('id-ID')}</td></tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                 </div>
              )}

              {/* ADMIN: TAB MODUL (Sama dengan tampilan delegasi guru) */}
              {adminTab === 'modul' && <ModulManager adminView={true} />}
            </div>
          )}

          {/* ================================== PORTAL GURU ================================== */}
          {userRole === 'guru' && (
            <div className="space-y-6">
              <div className="flex overflow-x-auto border-b-2 border-purple-200 space-x-2 pb-1">
                <button onClick={() => setGuruTab('beranda')} className={`py-2.5 px-4 font-bold rounded-t-xl text-sm ${guruTab === 'beranda' ? 'bg-[#581878] text-white' : 'bg-white'}`}>🏠 Beranda</button>
                <button onClick={() => setGuruTab('presensi')} className={`py-2.5 px-4 font-bold rounded-t-xl text-sm ${guruTab === 'presensi' ? 'bg-[#581878] text-white' : 'bg-white'}`}>📝 Presensi</button>
                <button onClick={() => setGuruTab('modul')} className={`py-2.5 px-4 font-bold rounded-t-xl text-sm ${guruTab === 'modul' ? 'bg-[#581878] text-white' : 'bg-white'}`}>📚 Modul & Barang</button>
                <button onClick={() => setGuruTab('profil')} className={`py-2.5 px-4 font-bold rounded-t-xl text-sm ${guruTab === 'profil' ? 'bg-[#581878] text-white' : 'bg-white'}`}>👤 Profil</button>
              </div>

              {guruTab === 'beranda' && (
                 <div className="bg-gradient-to-r from-purple-800 to-indigo-900 text-white p-6 rounded-2xl shadow-md">
                    <div className="flex items-center space-x-4 mb-4">
                       {currentMentorProfile?.foto_url ? (
                         <img src={currentMentorProfile.foto_url} alt="Guru" className="w-20 h-20 rounded-full border-4 border-amber-400 object-cover" />
                       ) : (
                         <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl">👤</div>
                       )}
                       <div>
                         <h2 className="text-2xl font-black">Halo, {currentMentorProfile?.nama_mentor}</h2>
                         <p className="text-purple-200 text-sm">{currentMentorProfile?.akses_inventaris ? '✅ Delegasi Inventaris Aktif' : 'Hak Akses Dasar'}</p>
                       </div>
                    </div>
                 </div>
              )}

              {/* GURU: PRESENSI */}
              {guruTab === 'presensi' && (
                 <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-purple-200">
                    <h3 className="text-lg font-bold text-[#581878] mb-4">Catat Presensi Siswa</h3>
                    <form onSubmit={handleTambahPresensiSiswa} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <select required value={newPresensiSiswa.periode_id} onChange={(e) => setNewPresensiSiswa({ ...newPresensiSiswa, periode_id: e.target.value })} className="w-full px-4 py-3 border rounded-xl md:col-span-2">
                          <option value="">-- Pilih Murid Aktif --</option>
                          {daftarPeriode.filter(p => p.siswa?.status === 'aktif' && p.status_periode === 'berjalan').map(p => (
                            <option key={p.id} value={p.id}>{p.siswa?.nama_murid}</option>
                          ))}
                        </select>
                        <input type="number" min="1" max="12" placeholder="Sesi Ke-" required value={newPresensiSiswa.pertemuan_ke} onChange={(e) => setNewPresensiSiswa({ ...newPresensiSiswa, pertemuan_ke: Number(e.target.value) })} className="px-4 py-3 border rounded-xl" />
                        <input type="date" required value={newPresensiSiswa.tanggal_pertemuan} onChange={(e) => setNewPresensiSiswa({ ...newPresensiSiswa, tanggal_pertemuan: e.target.value })} className="px-4 py-3 border rounded-xl" />
                        <input type="text" placeholder="Catatan Materi" required value={newPresensiSiswa.jurnal_materi} onChange={(e) => setNewPresensiSiswa({ ...newPresensiSiswa, jurnal_materi: e.target.value })} className="px-4 py-3 border rounded-xl md:col-span-2" />
                        <button type="submit" className="md:col-span-3 bg-[#581878] text-white font-bold py-3 rounded-xl shadow">Simpan Presensi</button>
                    </form>
                 </div>
              )}

              {/* GURU: MODUL (Fix Poin 2 & 6) */}
              {guruTab === 'modul' && (
                currentMentorProfile?.akses_inventaris ? (
                   // Jika Guru memiliki hak delegasi, tampilkan ModulManager
                   <ModulManager adminView={false} />
                ) : (
                   // Jika Guru TIDAK punya delegasi, hanya Read-Only biasa
                   <div className="bg-white rounded-2xl p-6 shadow border">
                     <h3 className="text-lg font-bold text-gray-700 mb-4">Katalog Modul (Hanya Baca)</h3>
                     <div className="grid grid-cols-2 gap-4">
                       {daftarInventaris.map(b => (
                         <div key={b.id} className="border p-3 rounded-xl">
                            <h5 className="font-bold">{b.nama_barang}</h5>
                            <span className="text-xs bg-gray-200 px-2 rounded">Stok: {b.stok}</span>
                         </div>
                       ))}
                     </div>
                   </div>
                )
              )}

              {/* GURU: PROFIL (Fix Poin 3) */}
              {guruTab === 'profil' && (
                <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-purple-200">
                  <h3 className="text-lg font-bold text-[#581878] mb-4">Pengaturan Profil & Foto</h3>
                  <form onSubmit={async (e) => {
                      e.preventDefault();
                      await supabase.from('mentor').update({ foto_url: currentMentorProfile.foto_url, no_hp: currentMentorProfile.no_hp }).eq('id', currentMentorProfile.id);
                      alert('Profil diperbarui!');
                      fetchAllData();
                  }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="text-xs font-bold">Link Foto Profil (URL):</label>
                        <input type="text" placeholder="https://..." value={currentMentorProfile?.foto_url || ''} onChange={e => setCurrentMentorProfile({...currentMentorProfile, foto_url: e.target.value})} className="w-full p-3 border rounded-xl" />
                     </div>
                     <div>
                        <label className="text-xs font-bold">Nomor HP/WA:</label>
                        <input type="text" value={currentMentorProfile?.no_hp || ''} onChange={e => setCurrentMentorProfile({...currentMentorProfile, no_hp: e.target.value})} className="w-full p-3 border rounded-xl" />
                     </div>
                     <button type="submit" className="md:col-span-2 bg-[#581878] text-white py-3 rounded-xl font-bold">Simpan Profil</button>
                  </form>
                </div>
              )}
            </div>
          )}

        </div>
      ) : (
         /* Login Modal (Disederhanakan untuk contoh) */
         showLoginModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl relative">
              <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-xl">✕</button>
              <h3 className="text-2xl font-black text-center mb-6">Login</h3>
              <form onSubmit={handleLogin} className="space-y-4">
                <input type="email" required placeholder="Email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full p-3 border rounded-xl" />
                <input type="password" required placeholder="Password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full p-3 border rounded-xl" />
                <button type="submit" className="w-full bg-[#581878] text-white py-3 rounded-xl font-bold">Masuk</button>
              </form>
            </div>
          </div>
         )
      )}

    </div>
  );

  // --- KOMPONEN LOKAL UNTUK MANAJEMEN MODUL (Poin 6 & 7) ---
  // Digunakan oleh Admin ATAU Guru dengan akses_inventaris = true
  function ModulManager({ adminView }) {
    return (
      <div className="space-y-6">
         <div className="flex space-x-2 border-b pb-3">
           <button onClick={() => setModulSubTab('data_barang')} className={`px-4 py-2 rounded-lg font-bold text-xs ${modulSubTab === 'data_barang' ? 'bg-emerald-600 text-white' : 'bg-white'}`}>📦 Data Barang</button>
           <button onClick={() => setModulSubTab('transaksi')} className={`px-4 py-2 rounded-lg font-bold text-xs ${modulSubTab === 'transaksi' ? 'bg-emerald-600 text-white' : 'bg-white'}`}>📝 Transaksi Keluar/Masuk</button>
         </div>

         {modulSubTab === 'data_barang' && (
            <div>
               <div className="bg-white p-6 rounded-xl shadow mb-6 border-l-4 border-emerald-500">
                  <h3 className="font-bold text-emerald-800 mb-4">Tambah Master Barang</h3>
                  <form onSubmit={handleTambahModul} className="grid grid-cols-2 gap-4">
                     <input type="text" placeholder="Nama Barang/Kategori" required value={formModul.nama_barang} onChange={e => setFormModul({...formModul, nama_barang: e.target.value})} className="border p-2 rounded" />
                     <select value={formModul.kategori} onChange={e => setFormModul({...formModul, kategori: e.target.value})} className="border p-2 rounded">
                        <option value="Buku">Buku / Modul</option>
                        <option value="Seragam">Seragam</option>
                        <option value="Logistik">Logistik Kelas</option>
                     </select>
                     <input type="number" placeholder="Stok Awal" required value={formModul.stok} onChange={e => setFormModul({...formModul, stok: Number(e.target.value)})} className="border p-2 rounded" />
                     <input type="text" placeholder="URL Foto (Opsional)" value={formModul.thumbnail} onChange={e => setFormModul({...formModul, thumbnail: e.target.value})} className="border p-2 rounded" />
                     <button type="submit" className="col-span-2 bg-emerald-600 text-white py-2 rounded font-bold">Simpan Master Barang</button>
                  </form>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {daftarInventaris.map(b => (
                     <div key={b.id} className="bg-white p-4 rounded-xl shadow border">
                        <div className="flex justify-between">
                           <h5 className="font-bold text-gray-900">{b.nama_barang}</h5>
                           <span className="text-xs bg-gray-200 px-2 py-1 rounded">{b.kategori}</span>
                        </div>
                        <p className={`text-lg font-black mt-2 ${b.stok > 0 ? 'text-emerald-600' : 'text-red-500'}`}>Stok: {b.stok}</p>
                        <button onClick={() => handleHapusModul(b.id)} className="mt-3 text-xs bg-red-100 text-red-700 px-3 py-1 rounded font-bold w-full">Hapus Master</button>
                     </div>
                  ))}
               </div>
            </div>
         )}

         {modulSubTab === 'transaksi' && (
            <div>
               <div className="bg-white p-6 rounded-xl shadow mb-6 border-l-4 border-blue-500">
                  <h3 className="font-bold text-blue-800 mb-4">Input Transaksi Barang (Stok Otomatis Update)</h3>
                  <form onSubmit={handleSimpanTransaksiLogistik} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                     <select required value={formTransaksi.barang_id} onChange={e => setFormTransaksi({...formTransaksi, barang_id: e.target.value})} className="border p-2 rounded col-span-2">
                        <option value="">-- Pilih Barang --</option>
                        {daftarInventaris.map(b => <option key={b.id} value={b.id}>{b.nama_barang} (Sisa: {b.stok})</option>)}
                     </select>
                     <select required value={formTransaksi.tipe_transaksi} onChange={e => setFormTransaksi({...formTransaksi, tipe_transaksi: e.target.value})} className="border p-2 rounded">
                        <option value="masuk">Masuk (Tambah Stok)</option>
                        <option value="keluar">Keluar (Kurangi Stok)</option>
                     </select>
                     <input type="number" min="1" placeholder="Jumlah" required value={formTransaksi.jumlah} onChange={e => setFormTransaksi({...formTransaksi, jumlah: Number(e.target.value)})} className="border p-2 rounded" />
                     <input type="text" placeholder="Keterangan (Milik Siswa X, dsb)" value={formTransaksi.keterangan} onChange={e => setFormTransaksi({...formTransaksi, keterangan: e.target.value})} className="border p-2 rounded col-span-3" />
                     <button type="submit" className="bg-blue-600 text-white py-2 rounded font-bold">Simpan & Update Stok</button>
                  </form>
               </div>

               <div className="bg-white p-6 rounded-xl shadow">
                 <h4 className="font-bold text-gray-800 mb-4">Histori Transaksi Logistik</h4>
                 <table className="w-full text-left text-sm">
                   <thead className="bg-gray-100"><tr><th className="p-3">Tanggal</th><th className="p-3">Kategori</th><th className="p-3">Nama Barang</th><th className="p-3">Tipe</th><th className="p-3">Jml</th><th className="p-3">Aksi</th></tr></thead>
                   <tbody>
                     {daftarTransaksiLogistik.map(t => (
                        <tr key={t.id} className="border-b">
                           <td className="p-3">{new Date(t.created_at).toLocaleDateString('id-ID')}</td>
                           <td className="p-3 text-xs">{t.inventaris_logistik?.kategori}</td>
                           <td className="p-3 font-bold">{t.inventaris_logistik?.nama_barang}</td>
                           <td className="p-3"><span className={`px-2 py-1 rounded text-xs font-bold uppercase ${t.tipe_transaksi === 'masuk' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>{t.tipe_transaksi}</span></td>
                           <td className="p-3 font-black">{t.jumlah}</td>
                           <td className="p-3"><button onClick={() => handleHapusTransaksiLogistik(t)} className="bg-gray-200 px-2 py-1 rounded text-xs font-bold hover:bg-red-100 hover:text-red-700">Delete & Revert Stok</button></td>
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
