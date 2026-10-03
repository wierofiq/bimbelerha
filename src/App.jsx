import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Inisialisasi Klien Supabase (Sesuaikan URL dan Anon Key Anda)
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function App() {
  const [activeTab, setActiveTab] = useState('admin'); // 'admin' atau 'guru'
  
  // State Data Master
  const [siswaList, setSiswaList] = useState([]);
  const [mentorList, setMentorList] = useState([]);
  const [pembayaranList, setPembayaranList] = useState([]);
  const [penggajianList, setPenggajianList] = useState([]);
  
  // State Sisi Guru
  const [guruLogin, setGuruLogin] = useState({ id: '', nama_mentor: '', no_hp: '', alamat: '', foto_url: '' });
  const [tanggalMentoring, setTanggalMentoring] = useState(new Date().toISOString().split('T')[0]);
  const [daftarMentoring, setDaftarMentoring] = useState([]);
  
  // State Presensi Siswa
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

  // State Admin Edit Mentor
  const [editMentorData, setEditMentorData] = useState(null);

  useEffect(() => {
    fetchDataMaster();
  }, []);

  async function fetchDataMaster() {
    const { data: siswa } = await supabase.from('siswa').select('*');
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

  // --- FUNGSI GURU: PENCARIAN SISWA & PRESENSI ---
  async function handleCariSiswa(keyword) {
    setCariSiswa(keyword);
    if (keyword.length > 2) {
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

    // Hitung riwayat presensi untuk auto-increment pertemuan ke-
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
      jurnal_materi: formPresensi.jurnal_materi
    }]);

    if (error) {
      alert('Gagal menyimpan presensi: ' + error.message);
    } else {
      alert('Presensi berhasil disimpan!');
      setSelectedSiswa(null);
      setCariSiswa('');
    }
  }

  // --- FUNGSI ADMIN: UPDATE MENTOR & DELEGASI ---
  async function updateMentor(e) {
    e.preventDefault();
    const { error } = await supabase
      .from('mentor')
      .update({
        nama_mentor: editMentorData.nama_mentor,
        honor_per_jam: editMentorData.honor_per_jam,
        delegasi_perizinan: editMentorData.delegasi_perizinan,
        delegasi_inventaris: editMentorData.delegasi_inventaris,
        delegasi_konten: editMentorData.delegasi_konten
      })
      .eq('id', editMentorData.id);

    if (error) alert('Gagal update mentor: ' + error.message);
    else {
      alert('Mentor berhasil diperbarui!');
      setEditMentorData(null);
      fetchDataMaster();
    }
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Bimbel ErHa - Panel Manajemen</h2>
        <div>
          <button className={`btn ${activeTab === 'admin' ? 'btn-dark' : 'btn-outline-dark'} me-2`} onClick={() => setActiveTab('admin')}>Dashboard Admin</button>
          <button className={`btn ${activeTab === 'guru' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveTab('guru')}>Portal Guru</button>
        </div>
      </div>

      {activeTab === 'admin' ? (
        <div>
          <h3 className="mb-3">Manajemen Admin</h3>
          
          {/* TABEL MENTOR & DELEGASI */}
          <div className="card p-3 mb-4 shadow-sm">
            <h5>Daftar Mentor & Delegasi Wewenang</h5>
            <table className="table table-bordered mt-2">
              <thead>
                <tr>
                  <th>Nama Mentor</th>
                  <th>Honor / Jam</th>
                  <th>Delegasi (Perizinan / Inventaris / Konten)</th>
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

          {/* FORM MODAL EDIT MENTOR */}
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
                  <input type="checkbox" className="form-check-input" checked={editMentorData.delegasi_perizinan} onChange={e => setEditMentorData({...editMentorData, delegasi_perizinan: e.target.checked})} />
                  <label className="form-check-label">Delegasi Perizinan</label>
                </div>
                <div className="form-check mb-1">
                  <input type="checkbox" className="form-check-input" checked={editMentorData.delegasi_inventaris} onChange={e => setEditMentorData({...editMentorData, delegasi_inventaris: e.target.checked})} />
                  <label className="form-check-label">Delegasi Inventaris</label>
                </div>
                <div className="form-check mb-3">
                  <input type="checkbox" className="form-check-input" checked={editMentorData.delegasi_konten} onChange={e => setEditMentorData({...editMentorData, delegasi_konten: e.target.checked})} />
                  <label className="form-check-label">Delegasi Konten</label>
                </div>
                <button type="submit" className="btn btn-success btn-sm me-2">Simpan</button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditMentorData(null)}>Batal</button>
              </form>
            </div>
          )}

        </div>
      ) : (
        <div>
          <h3 className="mb-3">Portal Guru: {guruLogin.nama_mentor}</h3>

          {/* PRESENSI SISWA DENGAN FILTER PENCARIAN & AUTO INCREMENT */}
          <div className="card p-4 shadow-sm mb-4">
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
