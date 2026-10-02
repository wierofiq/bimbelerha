import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Inisialisasi Supabase Client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://YOUR_SUPABASE_URL.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [activeTab, setActiveTab] = useState('pendaftaran'); // 'pendaftaran' atau 'izin'
  const [paketList, setPaketList] = useState([]);
  const [selectedPaket, setSelectedPaket] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State Pendaftaran
  const [formDaftar, setFormDaftar] = useState({
    nama_murid: '',
    nama_orang_tua: '',
    no_hp: '',
    alamat: '',
    jenjang_sekolah: 'PAUD/TK',
  });

  // Form State Izin
  const [formIzin, setFormIzin] = useState({
    nama_murid: '',
    no_hp: '',
    tanggal_izin: '',
    alasan: '',
  });

  // Fetch Paket Belajar dari Supabase
  useEffect(() => {
    async function fetchPaket() {
      const { data, error } = await supabase.from('paket_belajar').select('*').eq('is_active', true);
      if (!error && data && data.length > 0) {
        setPaketList(data);
      } else {
        // Fallback data jika tabel Supabase belum dikonfigurasi
        setPaketList([
          { id: '1', nama_paket: 'Baca AHE', kategori: 'baca', deskripsi: 'Program membaca cepat & ramah anak' },
          { id: '2', nama_paket: 'Berhitung ASE', kategori: 'berhitung', deskripsi: 'Aritmatika ceria dan cepat' },
          { id: '3', nama_paket: 'Matematika SD/SMP', kategori: 'mapel', deskripsi: 'Konsep dasar & latihan soal' },
          { id: '4', nama_paket: 'Bahasa Inggris', kategori: 'mapel', deskripsi: 'Vocab & percakapan dasar' },
          { id: '5', nama_paket: 'IPAS & Agama', kategori: 'mapel', deskripsi: 'Pendampingan belajar sekolah' },
          { id: '6', nama_paket: 'Bahasa Jawa & B. Indo', kategori: 'mapel', deskripsi: 'Membaca, menulis, & muatan lokal' },
        ]);
      }
    }
    fetchPaket();
  }, []);

  const handlePaketToggle = (id) => {
    if (selectedPaket.includes(id)) {
      setSelectedPaket(selectedPaket.filter((p) => p !== id));
    } else {
      setSelectedPaket([...selectedPaket, id]);
    }
  };

  const handleDaftarSubmit = async (e) => {
    e.preventDefault();
    if (selectedPaket.length === 0) {
      alert('Pilih minimal satu paket belajar!');
      return;
    }
    setLoading(true);

    try {
      // 1. Simpan ke Supabase Tabel Siswa
      const { data: siswaData, error: siswaError } = await supabase
        .from('siswa')
        .insert([formDaftar])
        .select();

      if (siswaError) {
        console.warn('Supabase Insert Warn:', siswaError.message);
      }

      // 2. Simpan Relasi Paket
      if (siswaData && siswaData[0]) {
        const siswaId = siswaData[0].id;
        const relasiPaket = selectedPaket.map((pId) => ({
          siswa_id: siswaId,
          paket_id: pId,
        }));
        await supabase.from('siswa_paket').insert(relasiPaket);
      }
    } catch (err) {
      console.error('Error saat menyimpan ke database:', err);
    } finally {
      setLoading(false);
      alert('Pendaftaran Berhasil! Mengarahkan Anda ke WhatsApp Admin Bimbel ErHa...');

      // Redirect ke WhatsApp Admin
      const waText = `Halo Admin Bimbel ErHa,\n\nSaya ${formDaftar.nama_orang_tua} ingin mendaftarkan putra/putri saya:\n- Nama Murid: ${formDaftar.nama_murid}\n- Jenjang: ${formDaftar.jenjang_sekolah}\n- Alamat: ${formDaftar.alamat}\n- No. HP: ${formDaftar.no_hp}`;
      window.open(`https://wa.me/6281234567890?text=${encodeURIComponent(waText)}`, '_blank');
    }
  };

  const handleIzinSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await supabase.from('izin_siswa').insert([formIzin]);
    } catch (err) {
      console.error('Error saat kirim izin:', err);
    } finally {
      setLoading(false);
      alert('Pengajuan izin berhasil dikirim! Admin/Mentor akan segera mengonfirmasi.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF0] font-sans text-gray-800">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-[#581878] shadow-lg border-b-4 border-[#F59E0B]">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {/* Logo Bimbel ErHa */}
            <div className="bg-white rounded-xl px-2 py-1 shadow-md">
              <span className="text-2xl font-black tracking-wider text-[#581878]">
                Er<span className="text-[#D95338]">Ha</span>
              </span>
            </div>
            <div>
              <h1 className="text-white font-extrabold text-lg leading-none">Bimbel ErHa</h1>
              <p className="text-[#F59E0B] font-bold text-xs">Rumah Hebat</p>
            </div>
          </div>
          <a
            href="#form-section"
            className="bg-[#F59E0B] hover:bg-amber-500 text-white font-bold py-2 px-5 rounded-full shadow-md transition transform hover:scale-105"
          >
            Daftar Sekarang
          </a>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="bg-gradient-to-b from-[#581878] via-[#6B21A8] to-[#FFFDF0] text-white pt-12 pb-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <span className="inline-block bg-[#F59E0B] text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider mb-4 shadow-sm">
            Bimbingan Belajar Ceria & Berprestasi 🚀
          </span>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-4">
            Rumah Belajar Ceria Bersama <span className="text-[#F59E0B]">Bimbel ErHa</span>
          </h2>
          <p className="text-lg md:text-xl text-purple-100 max-w-2xl mx-auto mb-8 font-medium">
            Mendampingi putra-putri Anda menguasai Baca AHE, Berhitung ASE, hingga Mata Pelajaran Sekolah dengan metode ramah anak.
          </p>
        </div>
      </section>

      {/* PAKET BELAJAR SECTION */}
      <section className="max-w-6xl mx-auto px-4 -mt-12 mb-16">
        <div className="text-center mb-10">
          <h3 className="text-3xl font-extrabold text-[#581878]">Pilihan Paket Belajar</h3>
          <p className="text-gray-600 font-medium mt-1">Pilih program yang sesuai dengan kebutuhan belajar anak Anda</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {paketList.map((paket) => {
            const isSelected = selectedPaket.includes(paket.id);
            return (
              <div
                key={paket.id}
                onClick={() => handlePaketToggle(paket.id)}
                className={`cursor-pointer bg-white rounded-2xl p-6 border-2 transition-all duration-200 shadow-md relative overflow-hidden ${
                  isSelected
                    ? 'border-[#F59E0B] ring-4 ring-amber-200 transform scale-102'
                    : 'border-purple-100 hover:border-[#D95338]'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 right-0 bg-[#F59E0B] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    ✓ Dipilih
                  </div>
                )}
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-[#581878] flex items-center justify-center font-black text-xl mb-4">
                  📚
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">{paket.nama_paket}</h4>
                <p className="text-gray-600 text-sm mb-4">{paket.deskripsi || 'Program bimbingan intensif 12 pertemuan per periode.'}</p>
                <div className="text-xs font-semibold uppercase text-[#D95338] tracking-wider">
                  Kategori: {paket.kategori}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FORM SECTION (PENDAFTARAN & IZIN) */}
      <section id="form-section" className="max-w-3xl mx-auto px-4 mb-20">
        <div className="bg-white rounded-3xl shadow-xl border-2 border-purple-100 overflow-hidden">
          {/* TAB SWITCHER */}
          <div className="flex border-b border-gray-100 bg-purple-50">
            <button
              onClick={() => setActiveTab('pendaftaran')}
              className={`flex-1 py-4 font-extrabold text-center transition ${
                activeTab === 'pendaftaran'
                  ? 'bg-white text-[#581878] border-b-4 border-[#581878]'
                  : 'text-gray-500 hover:text-[#581878]'
              }`}
            >
              📝 Form Pendaftaran Siswa
            </button>
            <button
              onClick={() => setActiveTab('izin')}
              className={`flex-1 py-4 font-extrabold text-center transition ${
                activeTab === 'izin'
                  ? 'bg-white text-[#D95338] border-b-4 border-[#D95338]'
                  : 'text-gray-500 hover:text-[#D95338]'
              }`}
            >
              📩 Form Izin Belajar
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'pendaftaran' ? (
              <form onSubmit={handleDaftarSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nama Lengkap Murid</label>
                  <input
                    type="text"
                    required
                    value={formDaftar.nama_murid}
                    onChange={(e) => setFormDaftar({ ...formDaftar, nama_murid: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#581878] outline-none"
                    placeholder="Contoh: Budi Pratama"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Nama Orang Tua / Wali</label>
                    <input
                      type="text"
                      required
                      value={formDaftar.nama_orang_tua}
                      onChange={(e) => setFormDaftar({ ...formDaftar, nama_orang_tua: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#581878] outline-none"
                      placeholder="Contoh: Ibu Rina"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">No. WhatsApp (Aktif)</label>
                    <input
                      type="tel"
                      required
                      value={formDaftar.no_hp}
                      onChange={(e) => setFormDaftar({ ...formDaftar, no_hp: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#581878] outline-none"
                      placeholder="081234567890"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Jenjang Sekolah</label>
                    <select
                      value={formDaftar.jenjang_sekolah}
                      onChange={(e) => setFormDaftar({ ...formDaftar, jenjang_sekolah: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#581878] outline-none bg-white"
                    >
                      <option value="PAUD/TK">PAUD / TK</option>
                      <option value="SD Kelas 1-3">SD Kelas 1 - 3</option>
                      <option value="SD Kelas 4-6">SD Kelas 4 - 6</option>
                      <option value="SMP">SMP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Alamat Domisili</label>
                    <input
                      type="text"
                      required
                      value={formDaftar.alamat}
                      onChange={(e) => setFormDaftar({ ...formDaftar, alamat: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#581878] outline-none"
                      placeholder="Alamat singkat"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[#581878] hover:bg-purple-900 text-white font-extrabold text-lg rounded-xl shadow-lg transition duration-200 transform hover:-translate-y-0.5"
                >
                  {loading ? 'Memproses...' : 'Kirim Pendaftaran Online 🚀'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleIzinSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nama Murid</label>
                  <input
                    type="text"
                    required
                    value={formIzin.nama_murid}
                    onChange={(e) => setFormIzin({ ...formIzin, nama_murid: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#D95338] outline-none"
                    placeholder="Nama lengkap murid"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Tanggal Izin Tidak Masuk</label>
                  <input
                    type="date"
                    required
                    value={formIzin.tanggal_izin}
                    onChange={(e) => setFormIzin({ ...formIzin, tanggal_izin: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#D95338] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Alasan Izin</label>
                  <textarea
                    rows="3"
                    required
                    value={formIzin.alasan}
                    onChange={(e) => setFormIzin({ ...formIzin, alasan: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#D95338] outline-none"
                    placeholder="Contoh: Sakit / Acara Keluarga"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[#D95338] hover:bg-red-700 text-white font-extrabold text-lg rounded-xl shadow-lg transition duration-200"
                >
                  {loading ? 'Mengirim...' : 'Kirim Pengajuan Izin 📩'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#581878] text-white py-8 text-center border-t-4 border-[#F59E0B]">
        <p className="font-bold text-lg">Bimbel ErHa (Rumah Hebat)</p>
        <p className="text-purple-200 text-sm mt-1">Sistem Informasi Pendaftaran & Presensi Belajar</p>
      </footer>
    </div>
  );
}
