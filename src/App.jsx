import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // Sesuaikan path jika berbeda

export default function App() {
  const [activeTab, setActiveTab] = useState('siswa');
  
  // State Data dari Database
  const [students, setStudents] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [payments, setPayments] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(false);

  // State Form Pendaftaran Siswa Baru
  const [formSiswa, setFormSiswa] = useState({
    nama_murid: '',
    nama_orang_tua: '',
    no_hp: '',
    alamat: '',
    jenjang_sekolah: 'SD'
  });

  // Fetch Data saat komponen dimuat atau tab berubah
  useEffect(() => {
    if (activeTab === 'siswa') fetchStudents();
    if (activeTab === 'inventaris') fetchInventory();
    if (activeTab === 'pembayaran') fetchPayments();
    if (activeTab === 'mentor') fetchMentors();
  }, [activeTab]);

  // --- 1. FETCH & HANDLE SISWA & ROLLOVER ---
  const fetchStudents = async () => {
    setLoading(true);
    // Mengambil data siswa beserta relasi periode belajar untuk memantau rollover
    const { data, error } = await supabase
      .from('siswa')
      .select(`
        *,
        periode_belajar (
          id,
          total_pertemuan,
          status_periode,
          status_rollover
        )
      `)
      .order('created_at', { ascending: false });

    if (!error) setStudents(data || []);
    setLoading(false);
  };

  const handleRegisterStudent = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('siswa').insert([formSiswa]);
    if (error) {
      alert('Gagal mendaftarkan siswa: ' + error.message);
    } else {
      alert('Siswa baru berhasil didaftarkan!');
      setFormSiswa({ nama_murid: '', nama_orang_tua: '', no_hp: '', alamat: '', jenjang_sekolah: 'SD' });
      fetchStudents();
      setActiveTab('siswa');
    }
  };

  // --- 2. FETCH INVENTARIS & STOK MENIPIS (< 5) ---
  const fetchInventory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('inventaris_logistik')
      .select('*')
      .order('nama_barang');

    if (!error) setInventory(data || []);
    setLoading(false);
  };

  // --- 3. FETCH PEMBAYARAN ---
  const fetchPayments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('pembayaran_siswa')
      .select(`
        *,
        siswa (nama_murid)
      `)
      .order('tanggal_pembayaran', { ascending: false });

    if (!error) setPayments(data || []);
    setLoading(false);
  };

  // --- 4. FETCH MENTOR & PENGGAJIAN ---
  const fetchMentors = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('penggajian_mentor')
      .select(`
        *,
        mentor (nama_mentor, honor_per_jam)
      `)
      .order('created_at', { ascending: false });

    if (!error) setMentors(data || []);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* NAVBAR */}
      <nav className="bg-white shadow-sm border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="w-10 h-10 object-contain" 
          />
          <span className="font-bold text-lg text-blue-900">Admin Portal</span>
        </div>
        <div className="text-sm text-gray-500 font-medium">Role: Administrator</div>
      </nav>

      {/* SUB NAVIGATION TABS */}
      <div className="bg-white border-b px-6 flex gap-6 overflow-x-auto shadow-xs">
        {[
          { key: 'siswa', label: 'Data & Rollover Siswa' },
          { key: 'pendaftaran', label: 'Pendaftaran Siswa' },
          { key: 'inventaris', label: 'Inventaris & Stok' },
          { key: 'pembayaran', label: 'Pembayaran' },
          { key: 'mentor', label: 'Mentor & Penggajian' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`py-3 text-sm font-medium border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === tab.key 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* MAIN CONTAINER */}
      <main className="p-6 max-w-7xl mx-auto">
        {loading && <div className="text-center py-4 text-gray-500 text-sm">Memuat data dari database...</div>}

        {/* TAB 1: DATA SISWA & ROLLOVER */}
        {activeTab === 'siswa' && !loading && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Daftar Siswa Aktif & Status Rollover (Pertemuan ke-6)</h2>
            <div className="bg-white shadow-sm rounded-lg overflow-hidden border">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100 text-xs uppercase text-gray-600">
                  <tr>
                    <th className="p-3">Nama Siswa</th>
                    <th className="p-3">Jenjang</th>
                    <th className="p-3">Orang Tua / Wali</th>
                    <th className="p-3">WhatsApp</th>
                    <th className="p-3">Status Rollover</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {students.map((s) => {
                    const activePeriod = s.periode_belajar?.[0]; // Ambil periode aktif
                    return (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="p-3 font-medium">{s.nama_murid}</td>
                        <td className="p-3"><span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-semibold">{s.jenjang_sekolah || '-'}</span></td>
                        <td className="p-3">{s.nama_orang_tua}</td>
                        <td className="p-3">{s.no_hp}</td>
                        <td className="p-3">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-bold">
                            {activePeriod ? activePeriod.status_rollover : 'Aktif'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {students.length === 0 && (
                    <tr><td colSpan="5" className="p-4 text-center text-gray-400">Belum ada data siswa.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: PENDAFTARAN SISWA */}
        {activeTab === 'pendaftaran' && (
          <div className="max-w-xl bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-bold mb-4">Form Pendaftaran Siswa Baru</h2>
            <form onSubmit={handleRegisterStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap Siswa</label>
                <input type="text" required value={formSiswa.nama_murid} onChange={(e) => setFormSiswa({...formSiswa, nama_murid: e.target.value})} className="w-full border rounded p-2 text-sm" placeholder="Nama siswa" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jenjang Sekolah</label>
                <select value={formSiswa.jenjang_sekolah} onChange={(e) => setFormSiswa({...formSiswa, jenjang_sekolah: e.target.value})} className="w-full border rounded p-2 text-sm bg-white">
                  <option value="SD">SD</option>
                  <option value="SMP">SMP</option>
                  <option value="SMA/SMK">SMA / SMK</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Orang Tua / Wali</label>
                <input type="text" required value={formSiswa.nama_orang_tua} onChange={(e) => setFormSiswa({...formSiswa, nama_orang_tua: e.target.value})} className="w-full border rounded p-2 text-sm" placeholder="Nama orang tua" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">No. WhatsApp</label>
                <input type="text" required value={formSiswa.no_hp} onChange={(e) => setFormSiswa({...formSiswa, no_hp: e.target.value})} className="w-full border rounded p-2 text-sm" placeholder="08xxxxxxxxxx" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                <textarea value={formSiswa.alamat} onChange={(e) => setFormSiswa({...formSiswa, alamat: e.target.value})} className="w-full border rounded p-2 text-sm" placeholder="Alamat lengkap"></textarea>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded text-sm font-medium hover:bg-blue-700 cursor-pointer">Daftarkan Siswa</button>
            </form>
          </div>
        )}

        {/* TAB 3: INVENTARIS & STOK MENIPIS (< 5) */}
        {activeTab === 'inventaris' && !loading && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Manajemen Inventaris & Modul</h2>
            
            {/* Warning Box untuk stok < 5 */}
            {inventory.filter(item => item.stok < 5).length > 0 && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-red-800">⚠️ Peringatan Stok Menipis (&lt; 5 pcs)</h3>
                  <p className="text-xs text-red-600">Barang berikut berada di bawah batas minimum stok.</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {inventory.filter(item => item.stok < 5).map(i => (
                    <span key={i.id} className="bg-red-200 text-red-800 text-xs px-2 py-1 rounded font-semibold">{i.nama_barang} ({i.stok} pcs)</span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white shadow-sm rounded-lg overflow-hidden border">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100 text-xs uppercase text-gray-600">
                  <tr>
                    <th className="p-3">Nama Barang</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3">Harga Satuan</th>
                    <th className="p-3">Stok Tersedia</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {inventory.map((item) => (
                    <tr key={item.id} className={item.stok < 5 ? 'bg-red-50/5fmt' : ''}>
                      <td className="p-3 font-medium">{item.nama_barang}</td>
                      <td className="p-3">{item.kategori}</td>
                      <td className="p-3">Rp {Number(item.harga_satuan).toLocaleString()}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${item.stok < 5 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                          {item.stok} pcs {item.stok < 5 && '(Menipis)'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: PEMBAYARAN */}
        {activeTab === 'pembayaran' && !loading && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Riwayat Pembayaran Siswa</h2>
            <div className="bg-white shadow-sm rounded-lg overflow-hidden border">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100 text-xs uppercase text-gray-600">
                  <tr>
                    <th className="p-3">Tanggal</th>
                    <th className="p-3">Nama Siswa</th>
                    <th className="p-3">Item Pembayaran</th>
                    <th className="p-3">Jumlah Bayar</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td className="p-3">{new Date(p.tanggal_pembayaran).toLocaleDateString()}</td>
                      <td className="p-3 font-medium">{p.siswa?.nama_murid || 'Siswa'}</td>
                      <td className="p-3"><span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">{p.item_bayar}</span></td>
                      <td className="p-3">Rp {Number(p.jumlah_bayar).toLocaleString()}</td>
                      <td className="p-3"><span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">{p.status_pembayaran}</span></td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr><td colSpan="5" className="p-4 text-center text-gray-400">Belum ada data pembayaran.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: MENTOR & PENGGAJIAN */}
        {activeTab === 'mentor' && !loading && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Manajemen Penggajian Mentor</h2>
            <div className="bg-white shadow-sm rounded-lg overflow-hidden border">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100 text-xs uppercase text-gray-600">
                  <tr>
                    <th className="p-3">Bulan Periode</th>
                    <th className="p-3">Nama Mentor</th>
                    <th className="p-3">Total Jam</th>
                    <th className="p-3">Insentif / Bonus</th>
                    <th className="p-3">Potongan</th>
                    <th className="p-3">Total Gaji Bersih</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {mentors.map((m) => (
                    <tr key={m.id}>
                      <td className="p-3 font-semibold">{m.bulan_periode}</td>
                      <td className="p-3">{m.mentor?.nama_mentor || 'Mentor'}</td>
                      <td className="p-3">{m.total_jam_mengajar} Jam</td>
                      <td className="p-3 text-green-600">+ Rp {(Number(m.insentif) + Number(m.bonus_kinerja)).toLocaleString()}</td>
                      <td className="p-3 text-red-600">- Rp {Number(m.potongan).toLocaleString()}</td>
                      <td className="p-3 font-bold text-blue-900">Rp {Number(m.total_gaji).toLocaleString()}</td>
                    </tr>
                  ))}
                  {mentors.length === 0 && (
                    <tr><td colSpan="6" className="p-4 text-center text-gray-400">Belum ada data penggajian mentor.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
