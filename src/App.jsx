import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Inisialisasi Supabase Client
const supabaseUrl = 'https://izifwpviqpyxauafdlge.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6aWZ3cHZpcXB5eGF1YWZkbGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NDA2ODYsImV4cCI6MjEwNjUxNjY4Nn0.XpJEgQ3vpGOYmPVi-nsjrSRJI9RfR5kWTN_XsL-TCUU';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [activeTab, setActiveTab] = useState('admin'); // 'admin' atau 'guru'
  
  // State Data Master
  const [siswaList, setSiswaList] = useState([]);
  const [mentorList, setMentorList] = useState([]);
  const [pembayaranList, setPembayaranList] = useState([]);
  const [penggajianList, setPenggajianList] = useState([]);
  
  // State Sisi Guru
  const [guruLogin, setGuruLogin] = useState({ 
    id: '', 
    nama_mentor: '', 
    no_hp: '', 
    alamat: '', 
    foto_url: '' 
  });
  const [tanggalMentoring, setTanggalMentoring] = useState(new Date().toISOString().split('T')[0]);
  const [daftarMentoring, setDaftarMentoring] = useState([]);
  
  // State Presensi Siswa (Guru)
  const [cariSiswa, setCariSiswa] = useState('');
  const [hasilPencarian, setHasilPencarian] = useState([]);
  const [selectedSiswa, setSelectedSiswa] = useState(null);
  const [formPresensi, setFormPresensi] = useState({
    periode_id: '',
    pertemuan_ke: 1,
    tanggal_pertemuan: new Date().toISOString().split('T')[0],
    status: 'hadir',
    jurnal_materi: ''
  });

  // State Admin Modals & Forms
  const [detailSiswaData, setDetailSiswaData] = useState(null);
  const [editMentorData, setEditMentorData] = useState(null);
  
  // Form Pembayaran Admin
  const [formPembayaran, setFormPembayaran] = useState({
    id: '',
    siswa_id: '',
    periode_id: '',
    tanggal_bayar: new Date().toISOString().split('T')[0],
    item_bayar: 'Paket Belajar Bulanan',
    jumlah_bayar: 150000
  });

  // Form Penggajian Admin
  const [formPenggajian, setFormPenggajian] = useState({
    id: '',
    mentor_id: '',
    bulan_periode: 'Oktober 2026',
    bonus_kinerja: 0
  });

  useEffect(() => {
    fetchDataMaster();
  }, []);

  async function fetchDataMaster() {
    const { data: siswa } = await supabase.from('siswa').select('*, periode_belajar(*)');
    if (siswa) setSiswaList(siswa);

    const { data: mentor } = await supabase.from('mentor').select('*');
    if (mentor) {
      setMentorList(mentor);
      if (mentor.length > 0) setGuruLogin(mentor[0]); // Simulasi login guru pertama
    }

    const { data: pembayaran } = await supabase.from('pembayaran_siswa').select('*, siswa(nama_murid)');
    if (pembayaran) setPembayaranList(pembayaran);

    const { data: penggajian } = await supabase.from('penggajian_mentor').select('*, mentor(nama_mentor)');
    if (penggajian) setPenggajianList(penggajian);
  }

  // --- FUNGSI GURU: PROFIL & UPLOAD FOTO ---
  async function updateProfilGuru(e) {
    e.preventDefault();
    const { error } = await supabase.from('mentor').update({
      nama_mentor: guruLogin.nama_mentor,
      no_hp: guruLogin.no_hp,
      alamat: guruLogin.alamat,
      foto_url: guruLogin.foto_url
    }).eq('id', guruLogin.id);

    if (error) alert('Gagal memperbarui profil: ' + error.message);
    else {
      alert('Profil berhasil diperbarui!');
      fetchDataMaster();
    }
  }

  // --- FUNGSI GURU: DAFTAR MENTORING & FILTER TANGGAL ---
  async function loadDaftarMentoring(tanggal) {
    setTanggalMentoring(tanggal);
    const { data } = await supabase
      .from('presensi_siswa')
      .select('*, siswa(nama_murid), periode_belajar(bulan_periode)')
      .eq('tanggal_pertemuan', tanggal);
    setDaftarMentoring(data || []);
  }

  // --- FUNGSI GURU: PENCARIAN & PRESENSI SISWA ---
  async function handleCariSiswa(keyword) {
    setCariSiswa(keyword);
    if (keyword.length > 1) {
      const { data } = await supabase
        .from('siswa')
        .select('*, periode_belajar(*)')
        .ilike('nama_murid', `%${keyword}%`);
      setHasilPencarian(data || []);
    } else {
      setHasilPencarian([]);
    }
  }

  async function pilihSiswaUntukPresensi(siswa, periode) {
    setSelectedSiswa(siswa);
    setHasilPencarian([]);
    setCariSiswa(siswa.nama_murid);

    const { count } = await supabase
      .from('presensi_siswa')
      .select('*', { count: 'exact', head: true })
      .eq('periode_id', periode.id);

    const pertemuanBerikutnya = (count || 0) + 1;
    setFormPresensi({
      ...formPresensi,
      periode_id: periode.id,
      pertemuan_ke: pertemuanBerikutnya
    });
  }

  async function simpanPresensi(e) {
    e.preventDefault();
    const { error } = await supabase.from('presensi_siswa').insert([{
      periode_id: formPresensi.periode_id,
      mentor_id: guruLogin.id,
      pertemuan_ke: formPresensi.pertemuan_ke,
      tanggal_pertemuan: formPresensi.tanggal_pertemuan,
      is_hadir: formPresensi.status === 'hadir',
      jurnal_materi: formPresensi.jurnal_materi
    }]);

    if (error) {
      alert('Gagal menyimpan presensi: ' + error.message);
    } else {
      alert('Presensi berhasil disimpan!');
      setSelectedSiswa(null);
      setCariSiswa('');
      setFormPresensi({ ...formPresensi, jurnal_materi: '' });
    }
  }

  // --- FUNGSI ADMIN: MENTOR & DELEGASI ---
  async function updateMentor(e) {
    e.preventDefault();
    const { error } = await supabase.from('mentor').update({
      nama_mentor: editMentorData.nama_mentor,
      honor_per_jam: editMentorData.honor_per_jam,
      delegasi_perizinan: editMentorData.delegasi_perizinan,
      delegasi_inventaris: editMentorData.delegasi_inventaris,
      delegasi_konten: editMentorData.delegasi_konten
    }).eq('id', editMentorData.id);

    if (error) alert('Gagal update mentor: ' + error.message);
    else {
      alert('Mentor & delegasi berhasil diperbarui!');
      setEditMentorData(null);
      fetchDataMaster();
    }
  }

  // --- FUNGSI ADMIN: PEMBAYARAN (TAMBAH / EDIT / HAPUS) ---
  async function simpanPembayaran(e) {
    e.preventDefault();
    const payload = {
      siswa_id: formPembayaran.siswa_id,
      periode_id: formPembayaran.periode_id,
      tanggal_pembayaran: formPembayaran.tanggal_bayar,
      item_bayar: formPembayaran.item_bayar,
      jumlah_bayar: formPembayaran.jumlah_bayar,
      status_pembayaran: 'Lunas'
    };

    let error;
    if (formPembayaran.id) {
      const res = await supabase.from('pembayaran_siswa').update(payload).eq('id', formPembayaran.id);
      error = res.error;
    } else {
      const res = await supabase.from('pembayaran_siswa').insert([payload]);
      error = res.error;
    }

    if (error) alert('Gagal menyimpan pembayaran: ' + error.message);
    else {
      alert('Pembayaran berhasil disimpan!');
      setFormPembayaran({ id: '', siswa_id: '', periode_id: '', tanggal_bayar: new Date().toISOString().split('T')[0], item_bayar: 'Paket Belajar Bulanan', jumlah_bayar: 150000 });
      fetchDataMaster();
    }
  }

  async function hapusPembayaran(id) {
    if (confirm('Yakin ingin menghapus pembayaran ini?')) {
      await supabase.from('pembayaran_siswa').delete().eq('id', id);
      fetchDataMaster();
    }
  }

  // --- FUNGSI ADMIN: PENGGAJIAN (NAMA BULAN & TAHUN, EDIT / HAPUS) ---
  async function simpanPenggajian(e) {
    e.preventDefault();
    const payload = {
      mentor_id: formPenggajian.mentor_id,
      bulan_periode: formPenggajian.bulan_periode,
      bonus_kinerja: formPenggajian.bonus_kinerja,
      status_pembayaran: 'draft'
    };

    let error;
    if (formPenggajian.id) {
      const res = await supabase.from('penggajian_mentor').update(payload).eq('id', formPenggajian.id);
      error = res.error;
    } else {
      const res = await supabase.from('penggajian_mentor').insert([payload]);
      error = res.error;
    }

    if (error) alert('Gagal menyimpan penggajian: ' + error.message);
    else {
      alert('Penggajian berhasil disimpan!');
      setFormPenggajian({ id: '', mentor_id: '', bulan_periode: 'Oktober 2026', bonus_kinerja: 0 });
      fetchDataMaster();
    }
  }

  async function hapusPenggajian(id) {
    if (confirm('Yakin ingin menghapus data penggajian ini?')) {
      await supabase.from('penggajian_mentor').delete().eq('id', id);
      fetchDataMaster();
    }
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Bimbel ErHa - Sistem Manajemen</h2>
        <div>
          <button className={`btn ${activeTab === 'admin' ? 'btn-dark' : 'btn-outline-dark'} me-2`} onClick={() => setActiveTab('admin')}>Dashboard Admin</button>
          <button className={`btn ${activeTab === 'guru' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveTab('guru')}>Portal Guru</button>
        </div>
      </div>

      {activeTab === 'admin' ? (
        <div>
          <h3 className="mb-4">Panel Admin</h3>

          {/* 1. TABEL DATA SISWA & DETAIL */}
          <div className="card p-3 mb-4 shadow-sm">
            <h5>Data Siswa & Detail</h5>
            <table className="table table-striped mt-2">
              <thead>
                <tr>
                  <th>Nama Murid</th>
                  <th>Jenjang</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {siswaList.map(s => (
                  <tr key={s.id}>
                    <td>{s.nama_murid}</td>
                    <td>{s.jenjang_sekolah}</td>
                    <td><span className="badge bg-info">{s.status}</span></td>
                    <td>
                      <button className="btn btn-sm btn-secondary" onClick={() => setDetailSiswaData(s)}>Detail</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MODAL DETAIL SISWA */}
          {detailSiswaData && (
            <div className="card p-3 mb-4 bg-light border-info">
              <h5>Detail Siswa: {detailSiswaData.nama_murid}</h5>
              <p><strong>Orang Tua:</strong> {detailSiswaData.nama_orang_tua || '-'}</p>
              <p><strong>No HP:</strong> {detailSiswaData.no_hp || '-'}</p>
              <p><strong>Alamat:</strong> {detailSiswaData.alamat || '-'}</p>
              <button className="btn btn-sm btn-dark" onClick={() => setDetailSiswaData(null)}>Tutup Detail</button>
            </div>
          )}

          {/* 2. HALAMAN MENTOR & DELEGASI */}
          <div className="card p-3 mb-4 shadow-sm">
            <h5>Manajemen Mentor & Delegasi Wewenang</h5>
            <table className="table table-bordered mt-2">
              <thead>
                <tr>
                  <th>Nama Mentor</th>
                  <th>Honor / Jam</th>
                  <th>Delegasi Akses</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {mentorList.map(m => (
                  <tr key={m.id}>
                    <td>{m.nama_mentor}</td>
                    <td>Rp {m.honor_per_jam}</td>
                    <td>
                      <span className={`badge ${m.delegasi_perizinan ? 'bg-success' : 'bg-secondary'} me-1`}>Perizinan</span>
                      <span className={`badge ${m.delegasi_inventaris ? 'bg-success' : 'bg-secondary'} me-1`}>Inventaris</span>
                      <span className={`badge ${m.delegasi_konten ? 'bg-success' : 'bg-secondary'}`}>Konten</span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-warning" onClick={() => setEditMentorData(m)}>Edit & Delegasi</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MODAL EDIT MENTOR */}
          {editMentorData && (
            <div className="card p-3 mb-4 bg-light border-warning">
              <h5>Edit Mentor: {editMentorData.nama_mentor}</h5>
              <form onSubmit={updateMentor}>
                <div className="mb-2">
                  <label>Nama Mentor</label>
                  <input type="text" className="form-control" value={editMentorData.nama_mentor} onChange={e => setEditMentorData({...editMentorData, nama_mentor: e.target.value})} />
                </div>
                <div className="mb-2">
                  <label>Honor per Jam</label>
                  <input type="number" className="form-control" value={editMentorData.honor_per_jam} onChange={e => setEditMentorData({...editMentorData, honor_per_jam: e.target.value})} />
                </div>
                <div className="form-check mb-1">
                  <input type="checkbox" className="form-check-input" checked={editMentorData.delegasi_perizinan || false} onChange={e => setEditMentorData({...editMentorData, delegasi_perizinan: e.target.checked})} />
                  <label className="form-check-label">Delegasi Perizinan</label>
                </div>
                <div className="form-check mb-1">
                  <input type="checkbox" className="form-check-input" checked={editMentorData.delegasi_inventaris || false} onChange={e => setEditMentorData({...editMentorData, delegasi_inventaris: e.target.checked})} />
                  <label className="form-check-label">Delegasi Inventaris Modul</label>
                </div>
                <div className="form-check mb-3">
                  <input type="checkbox" className="form-check-input" checked={editMentorData.delegasi_konten || false} onChange={e => setEditMentorData({...editMentorData, delegasi_konten: e.target.checked})} />
                  <label className="form-check-label">Delegasi Konten</label>
                </div>
                <button type="submit" className="btn btn-success btn-sm me-2">Simpan</button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditMentorData(null)}>Batal</button>
              </form>
            </div>
          )}

          {/* 3. PEMBAYARAN SISWA */}
          <div className="card p-3 mb-4 shadow-sm">
            <h5>Manajemen Pembayaran Siswa</h5>
            <form onSubmit={simpanPembayaran} className="row g-3 mb-3">
              <div className="col-md-3">
                <label className="form-label">Siswa & Periode</label>
                <select className="form-select" value={formPembayaran.periode_id} onChange={e => {
                  const pId = e.target.value;
                  for(let s of siswaList) {
                    const match = s.periode_belajar?.find(p => p.id === pId);
                    if(match) {
                      setFormPembayaran({...formPembayaran, periode_id: pId, siswa_id: s.id});
                      break;
                    }
                  }
                }} required>
                  <option value="">Pilih Siswa / Periode</option>
                  {siswaList.map(s => s.periode_belajar?.map(p => (
                    <option key={p.id} value={p.id}>{s.nama_murid} ({p.bulan_periode})</option>
                  )))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Tanggal Bayar</label>
                <input type="date" className="form-control" value={formPembayaran.tanggal_bayar} onChange={e => setFormPembayaran({...formPembayaran, tanggal_bayar: e.target.value})} required />
              </div>
              <div className="col-md-3">
                <label className="form-label">Item Bayar</label>
                <input type="text" className="form-control" value={formPembayaran.item_bayar} onChange={e => setFormPembayaran({...formPembayaran, item_bayar: e.target.value})} placeholder="Contoh: Paket Bulanan" required />
              </div>
              <div className="col-md-3">
                <label className="form-label">Jumlah (Rp)</label>
                <input type="number" className="form-control" value={formPembayaran.jumlah_bayar} onChange={e => setFormPembayaran({...formPembayaran, jumlah_bayar: e.target.value})} required />
              </div>
              <div className="col-12">
                <button type="submit" className="btn btn-primary btn-sm">{formPembayaran.id ? 'Update Pembayaran' : 'Tambah Pembayaran'}</button>
              </div>
            </form>

            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Siswa</th>
                  <th>Tanggal Bayar</th>
                  <th>Item</th>
                  <th>Jumlah</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pembayaranList.map(p => (
                  <tr key={p.id}>
                    <td>{p.siswa?.nama_murid || '-'}</td>
                    <td>{p.tanggal_pembayaran ? p.tanggal_pembayaran.split('T')[0] : '-'}</td>
                    <td>{p.item_bayar}</td>
                    <td>Rp {p.jumlah_bayar}</td>
                    <td>{p.status_pembayaran}</td>
                    <td>
                      <button className="btn btn-sm btn-warning me-1" onClick={() => setFormPembayaran({ id: p.id, siswa_id: p.siswa_id, periode_id: p.periode_id, tanggal_bayar: p.tanggal_pembayaran?.split('T')[0], item_bayar: p.item_bayar, jumlah_bayar: p.jumlah_bayar })}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => hapusPembayaran(p.id)}>Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 4. PENGGAJIAN MENTOR */}
          <div className="card p-3 mb-4 shadow-sm">
            <h5>Penggajian Mentor</h5>
            <form onSubmit={simpanPenggajian} className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="form-label">Mentor</label>
                <select className="form-select" value={formPenggajian.mentor_id} onChange={e => setFormPenggajian({...formPenggajian, mentor_id: e.target.value})} required>
                  <option value="">Pilih Mentor</option>
                  {mentorList.map(m => (
                    <option key={m.id} value={m.id}>{m.nama_mentor}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Bulan & Tahun (Misal: Oktober 2026)</label>
                <input type="text" className="form-control" value={formPenggajian.bulan_periode} onChange={e => setFormPenggajian({...formPenggajian, bulan_periode: e.target.value})} placeholder="Oktober 2026" required />
              </div>
              <div className="col-md-4">
                <label className="form-label">Bonus Kinerja (Rp)</label>
                <input type="number" className="form-control" value={formPenggajian.bonus_kinerja} onChange={e => setFormPenggajian({...formPenggajian, bonus_kinerja: e.target.value})} />
              </div>
              <div className="col-12">
                <button type="submit" className="btn btn-dark btn-sm">{formPenggajian.id ? 'Update Penggajian' : 'Simpan Penggajian'}</button>
              </div>
            </form>

            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Mentor</th>
                  <th>Bulan / Periode</th>
                  <th>Bonus Kinerja</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {penggajianList.map(g => (
                  <tr key={g.id}>
                    <td>{g.mentor?.nama_mentor || '-'}</td>
                    <td>{g.bulan_periode}</td>
                    <td>Rp {g.bonus_kinerja}</td>
                    <td>{g.status_pembayaran}</td>
                    <td>
                      <button className="btn btn-sm btn-warning me-1" onClick={() => setFormPenggajian({ id: g.id, mentor_id: g.mentor_id, bulan_periode: g.bulan_periode, bonus_kinerja: g.bonus_kinerja })}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => hapusPenggajian(g.id)}>Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      ) : (
        <div>
          <h3 className="mb-4">Portal Guru: {guruLogin.nama_mentor}</h3>

          {/* 1. PROFIL GURU & UPLOAD FOTO */}
          <div className="card p-4 shadow-sm mb-4">
            <h5 className="mb-3">Profil Guru & Ganti Foto</h5>
            <form onSubmit={updateProfilGuru}>
              <div className="mb-3 text-center">
                <img src={guruLogin.foto_url || 'https://via.placeholder.com/100'} className="rounded-circle mb-2" width="100" height="100" style={{objectFit: 'cover'}} alt="Foto Guru" />
                <input type="text" className="form-control form-control-sm mt-2" placeholder="URL Foto Profil" value={guruLogin.foto_url || ''} onChange={e => setGuruLogin({...guruLogin, foto_url: e.target.value})} />
              </div>
              <div className="mb-3">
                <label className="form-label">Nama Mentor</label>
                <input type="text" className="form-control" value={guruLogin.nama_mentor} onChange={e => setGuruLogin({...guruLogin, nama_mentor: e.target.value})} required />
              </div>
              <div className="mb-3">
                <label className="form-label">No HP / WhatsApp</label>
                <input type="text" className="form-control" value={guruLogin.no_hp || ''} onChange={e => setGuruLogin({...guruLogin, no_hp: e.target.value})} />
              </div>
              <div className="mb-3">
                <label className="form-label">Alamat</label>
                <textarea className="form-control" rows="2" value={guruLogin.alamat || ''} onChange={e => setGuruLogin({...guruLogin, alamat: e.target.value})}></textarea>
              </div>
              <button type="submit" className="btn btn-primary w-100">Simpan Profil</button>
            </form>
          </div>

          {/* 2. DAFTAR MENTORING GURU */}
          <div className="card p-4 shadow-sm mb-4">
            <h5 className="mb-3">Daftar Mentoring Guru</h5>
            <div className="mb-3">
              <label className="form-label">Pilih Tanggal</label>
              <input type="date" className="form-control" value={tanggalMentoring} onChange={e => loadDaftarMentoring(e.target.value)} />
            </div>
            <button className="btn btn-outline-secondary btn-sm mb-3" onClick={() => loadDaftarMentoring(tanggalMentoring)}>Muat Jadwal</button>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Siswa</th>
                  <th>Periode</th>
                  <th>Pertemuan Ke</th>
                  <th>Jurnal Materi</th>
                </tr>
              </thead>
              <tbody>
                {daftarMentoring.map(m => (
                  <tr key={m.id}>
                    <td>{m.siswa?.nama_murid}</td>
                    <td>{m.periode_belajar?.bulan_periode}</td>
                    <td>{m.pertemuan_ke}</td>
                    <td>{m.jurnal_materi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 3. TAMBAH PRESENSI SISWA */}
          <div className="card p-4 shadow-sm">
            <h5 className="mb-3">Tambah Presensi Siswa</h5>
            <div className="mb-3">
              <label className="form-label">Cari Nama Siswa</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Ketik nama siswa..." 
                value={cariSiswa} 
                onChange={e => handleCariSiswa(e.target.value)} 
              />
            </div>

            {hasilPencarian.length > 0 && (
              <ul className="list-group mb-3">
                {hasilPencarian.map(s => (
                  <li key={s.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <span>{s.nama_murid} ({s.jenjang_sekolah})</span>
                    <div>
                      {s.periode_belajar && s.periode_belajar.map(p => (
                        <button key={p.id} className="btn btn-sm btn-outline-primary ms-1" onClick={() => pilihSiswaPresensi(s, p)}>
                          Pilih Periode ({p.bulan_periode})
                        </button>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {selectedSiswa && (
              <form onSubmit={simpanPresensi} className="border p-3 rounded bg-light">
                <h6 className="text-success">Siswa Dipilih: {selectedSiswa.nama_murid}</h6>
                <div className="mb-2">
                  <label className="form-label">Pertemuan Ke- (Otomatis)</label>
                  <input type="number" className="form-control" value={formPresensi.pertemuan_ke} readOnly />
                </div>
                <div className="mb-2">
                  <label className="form-label">Tanggal Pertemuan</label>
                  <input type="date" className="form-control" value={formPresensi.tanggal_pertemuan} onChange={e => setFormPresensi({...formPresensi, tanggal_pertemuan: e.target.value})} required />
                </div>
                <div className="mb-2">
                  <label className="form-label">Status Kehadiran</label>
                  <select className="form-select" value={formPresensi.status} onChange={e => setFormPresensi({...formPresensi, status: e.target.value})}>
                    <option value="hadir">Hadir</option>
                    <option value="izin">Izin</option>
                    <option value="alfa">Alfa</option>
                  </select>
                </div>
                <div className="mb-2">
                  <label className="form-label">Jurnal Materi</label>
                  <textarea className="form-control" rows="2" value={formPresensi.jurnal_materi} onChange={e => setFormPresensi({...formPresensi, jurnal_materi: e.target.value})} required></textarea>
                </div>
                <button type="submit" className="btn btn-success">Simpan Presensi</button>
                <button type="button" className="btn btn-secondary ms-2" onClick={() => setSelectedSiswa(null)}>Batal</button>
              </form>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
