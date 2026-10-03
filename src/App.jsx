import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  BookOpen, Users, DollarSign, UserCheck, Package, 
  LogOut, Lock, CheckCircle, Clock, AlertCircle, 
  Send, Phone, User, Calendar, Plus, Edit, Trash2, Shield, Menu, X
} from 'lucide-react';

// ==========================================
// KONFIGURASI SUPABASE (Sesuaikan kredensial Anda)
// ==========================================
const SUPABASE_URL = 'https://izifwpviqpyxauafdlge.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6aWZ3cHZpcXB5eGF1YWZkbGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NDA2ODYsImV4cCI6MjEwNjUxNjY4Nn0.XpJEgQ3vpGOYmPVi-nsjrSRJI9RfR5kWTN_XsL-TCUU';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function App() {
  // State Utama Navigasi & Sesi
  const [view, setView] = useState('landing'); // 'landing', 'admin', 'teacher'
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // State Data Master
  const [students, setStudents] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [modules, setModules] = useState([]);

  // State Form Pendaftaran Landing Page
  const [regForm, setRegForm] = useState({
    name: '',
    parentName: '',
    phone: '',
    package: 'Reguler (12 Sesi)',
    level: 'SD'
  });

  // State Login Admin/Guru
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [adminTab, setAdminTab] = useState('students'); // 'students', 'mentors', 'payments', 'payroll', 'modules'
  
  // State Guru Portal
  const [teacherTab, setTeacherTab] = useState('attendance'); // 'attendance', 'password'
  const [passForm, setPassForm] = useState({ oldPass: '', newPass: '', confirmPass: '' });

  // Load Data dari Supabase saat aplikasi dimuat
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Contoh fetch data (pastikan tabel Supabase sudah sesuai dengan skema)
      const { data: studentData } = await supabase.from('students').select('*');
      if (studentData) setStudents(studentData);

      const { data: mentorData } = await supabase.from('mentors').select('*');
      if (mentorData) setMentors(mentorData);

      const { data: moduleData } = await supabase.from('modules').select('*');
      if (moduleData) setModules(moduleData);
    } catch (err) {
      console.error("Gagal memuat data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handler Pendaftaran Online & WhatsApp
  const handleRegister = (e) => {
    e.preventDefault();
    const adminPhone = "6281234567890"; // Ganti dengan nomor WhatsApp admin Bimbel ErHa
    const message = `Halo Admin Bimbel ErHa, saya ingin mendaftarkan siswa baru:\n\nNama Siswa: ${regForm.name}\nNama Wali: ${regForm.parentName}\nNo. HP/WA: ${regForm.phone}\nJenjang: ${regForm.level}\nPaket: ${regForm.package}\n\nMohon informasinya lebih lanjut. Terima kasih!`;
    const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;
    
    // Simpan sementara atau langsung arahkan ke WhatsApp
    window.open(whatsappUrl, '_blank');
    alert("Pendaftaran berhasil dikirim ke WhatsApp Admin!");
    setRegForm({ name: '', parentName: '', phone: '', package: 'Reguler (12 Sesi)', level: 'SD' });
  };

  // Handler Login Sederhana (Mock/Supabase Auth)
  const handleLogin = (e) => {
    e.preventDefault();
    if (loginForm.email === 'admin@erha.com' && loginForm.password === 'admin123') {
      setUser({ role: 'admin', name: 'Administrator' });
      setView('admin');
    } else if (loginForm.email === 'guru@erha.com' && loginForm.password === 'guru123') {
      setUser({ role: 'teacher', name: 'Mentor Pengajar' });
      setView('teacher');
    } else {
      alert("Email atau Password salah!");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView('landing');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col justify-between">
      
      {/* NAVBAR UTAMA */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setView('landing')}>
            <img src="/logo.png" alt="Logo Bimbel ErHa" className="h-12 w-12 object-contain" />
            <div>
              <h1 className="text-xl font-bold text-indigo-900 leading-tight">Bimbel ErHa</h1>
              <p className="text-xs text-slate-500 font-medium">Rumah Hebat Belajar & Berprestasi</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-4">
            {view === 'landing' ? (
              <div className="flex items-center space-x-6">
                <a href="#packages" className="text-sm font-medium text-slate-600 hover:text-indigo-600">Paket Belajar</a>
                <a href="#register" className="text-sm font-medium text-slate-600 hover:text-indigo-600">Pendaftaran</a>
                <button 
                  onClick={() => setView('login')} 
                  className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow-sm"
                >
                  Login Portal
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-slate-600">Halo, <b>{user?.name}</b> ({user?.role})</span>
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-1 bg-rose-50 text-rose-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-rose-100 transition"
                >
                  <LogOut size={16} />
                  <span>Keluar</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-600 focus:outline-none">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b px-4 pt-2 pb-4 space-y-3">
            {view === 'landing' ? (
              <>
                <a href="#packages" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-slate-600">Paket Belajar</a>
                <a href="#register" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-slate-600">Pendaftaran</a>
                <button 
                  onClick={() => { setView('login'); setMobileMenuOpen(false); }} 
                  className="w-full bg-indigo-600 text-white py-2 rounded-xl text-sm font-semibold text-center"
                >
                  Login Portal
                </button>
              </>
            ) : (
              <button 
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="w-full bg-rose-50 text-rose-600 py-2 rounded-xl text-sm font-semibold text-center flex items-center justify-center space-x-1"
              >
                <LogOut size={16} />
                <span>Keluar</span>
              </button>
            )}
          </div>
        )}
      </header>

      {/* KONTEN UTAMA BERDASARKAN VIEW */}
      <main className="flex-grow">
        
        {/* 1. LANDING PAGE & PENDAFTARAN */}
        {view === 'landing' && (
          <div>
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white py-20 px-4">
              <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <span className="bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-indigo-400/30">
                    Bimbingan Belajar Profesional
                  </span>
                  <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                    Wujudkan Prestasi Gemilang Bersama <span className="text-indigo-400">Bimbel ErHa</span>
                  </h2>
                  <p className="text-slate-300 text-base md:text-lg">
                    Rumah belajar interaktif dengan metode pembelajaran modern, mentor berpengalaman, dan modul terlengkap untuk tingkat SD, SMP, hingga SMA.
                  </p>
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                    <a href="#register" className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl text-center transition shadow-lg shadow-indigo-500/30">
                      Daftar Sekarang
                    </a>
                    <a href="#packages" className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl text-center transition border border-white/10">
                      Lihat Paket
                    </a>
                  </div>
                </div>
                <div className="flex justify-center">
                  <img src="/logo.png" alt="Illustration" className="max-w-xs md:max-w-sm drop-shadow-2xl animate-pulse" />
                </div>
              </div>
            </section>

            {/* Paket Belajar */}
            <section id="packages" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-12">
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900">Pilihan Paket Belajar</h3>
                <p className="text-slate-600 mt-2">Pilih paket bimbingan yang sesuai dengan kebutuhan akademik putra/putri Anda.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { name: "Reguler", sessions: "12 Sesi / Periode", price: "Rp 350.000", desc: "Cocok untuk pendampingan rutin mingguan mata pelajaran sekolah." },
                  { name: "Intensif", sessions: "24 Sesi / Periode", price: "Rp 650.000", desc: "Fokus persiapan ujian sekolah dan pemahaman konsep mendalam." },
                  { name: "Privat Eksklusif", sessions: "12 Sesi (1-on-1)", price: "Rp 950.000", desc: "Mentor datang ke rumah atau jadwal fleksibel sesuai kebutuhan siswa." }
                ].map((pkg, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition">
                    <div>
                      <div className="text-indigo-600 font-bold text-sm tracking-wide uppercase">{pkg.name}</div>
                      <div className="text-3xl font-extrabold text-slate-900 mt-2">{pkg.price}</div>
                      <div className="text-xs font-semibold text-slate-400 mt-1">{pkg.sessions}</div>
                      <p className="text-slate-600 text-sm mt-4">{pkg.desc}</p>
                    </div>
                    <a href="#register" className="mt-8 block text-center bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 font-semibold py-3 rounded-xl transition text-sm">
                      Pilih Paket Ini
                    </a>
                  </div>
                ))}
              </div>
            </section>

            {/* Form Pendaftaran Online */}
            <section id="register" className="py-16 bg-slate-100/70 border-t border-slate-200/60">
              <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-8 md:p-12">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-slate-900">Formulir Pendaftaran Siswa Baru</h3>
                    <p className="text-slate-500 text-sm mt-1">Isi data di bawah ini, data akan langsung terhubung ke WhatsApp Admin.</p>
                  </div>
                  <form onSubmit={handleRegister} className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Nama Lengkap Siswa</label>
                      <input 
                        type="text" 
                        required 
                        value={regForm.name} 
                        onChange={(e) => setRegForm({...regForm, name: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        placeholder="Contoh: Ahmad Fauzan" 
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Nama Orang Tua / Wali</label>
                        <input 
                          type="text" 
                          required 
                          value={regForm.parentName} 
                          onChange={(e) => setRegForm({...regForm, parentName: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                          placeholder="Contoh: Budi Santoso" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1">No. WhatsApp Aktif</label>
                        <input 
                          type="tel" 
                          required 
                          value={regForm.phone} 
                          onChange={(e) => setRegForm({...regForm, phone: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                          placeholder="Contoh: 08123456789" 
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Jenjang Pendidikan</label>
                        <select 
                          value={regForm.level} 
                          onChange={(e) => setRegForm({...regForm, level: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                        >
                          <option value="SD">Sekolah Dasar (SD)</option>
                          <option value="SMP">Sekolah Menengah Pertama (SMP)</option>
                          <option value="SMA">Sekolah Menengah Atas (SMA)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Pilihan Paket</label>
                        <select 
                          value={regForm.package} 
                          onChange={(e) => setRegForm({...regForm, package: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                        >
                          <option value="Reguler (12 Sesi)">Reguler (12 Sesi)</option>
                          <option value="Intensif (24 Sesi)">Intensif (24 Sesi)</option>
                          <option value="Privat Eksklusif">Privat Eksklusif</option>
                        </select>
                      </div>
                    </div>
                    <button 
                      type="submit" 
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 rounded-xl transition shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-2 text-sm"
                    >
                      <Send size={18} />
                      <span>Kirim Pendaftaran via WhatsApp</span>
                    </button>
                  </form>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* 2. HALAMAN LOGIN PORTAL */}
        {view === 'login' && (
          <div className="max-w-md mx-auto py-20 px-4">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <div className="text-center mb-6">
                <img src="/logo.png" alt="Logo" className="h-16 w-16 mx-auto mb-3 object-contain" />
                <h3 className="text-xl font-bold text-slate-900">Login Portal ErHa</h3>
                <p className="text-xs text-slate-500 mt-1">Masukkan akun Admin atau Mentor Anda</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Email</label>
                  <input 
                    type="email" 
                    required 
                    value={loginForm.email} 
                    onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="admin@erha.com / guru@erha.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Password</label>
                  <input 
                    type="password" 
                    required 
                    value={loginForm.password} 
                    onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="••••••••"
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition text-sm shadow-sm"
                >
                  Masuk Portal
                </button>
                <button 
                  type="button" 
                  onClick={() => setView('landing')} 
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-3 rounded-xl transition text-sm"
                >
                  Kembali ke Beranda
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 3. PORTAL ADMIN */}
        {view === 'admin' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Admin */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-slate-200 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Panel Admin Bimbel ErHa</h2>
                <p className="text-xs text-slate-500 mt-0.5">Kelola siswa, mentor, pembayaran, penggajian, dan inventaris modul.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'students', label: 'Manajemen Siswa', icon: Users },
                  { id: 'mentors', label: 'Mentor & Guru', icon: UserCheck },
                  { id: 'payments', label: 'Pembayaran', icon: DollarSign },
                  { id: 'payroll', label: 'Penggajian (Payroll)', icon: Shield },
                  { id: 'modules', label: 'Modul & Inventaris', icon: Package }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setAdminTab(tab.id)}
                      className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                        adminTab === tab.id 
                          ? 'bg-indigo-600 text-white shadow-sm' 
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <Icon size={16} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Konten Tab Admin */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              {adminTab === 'students' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900">Daftar Siswa & Sesi Belajar (Rollover 12 Sesi)</h3>
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-indigo-700 transition">
                      + Tambah Siswa
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-400 uppercase text-xs">
                        <tr>
                          <th className="p-3">Nama Siswa</th>
                          <th className="p-3">Jenjang</th>
                          <th className="p-3">Paket</th>
                          <th className="p-3">Sisa Sesi</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {students.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="text-center py-6 text-slate-400 text-sm">Belum ada data siswa.</td>
                          </tr>
                        ) : (
                          students.map((s, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="p-3 font-semibold text-slate-800">{s.name}</td>
                              <td className="p-3 text-slate-600">{s.level}</td>
                              <td className="p-3 text-slate-600">{s.package}</td>
                              <td className="p-3 font-bold text-indigo-600">{s.remaining_sessions || 12} Sesi</td>
                              <td className="p-3">
                                <span className="bg-emerald-50 text-emerald-600 text-xs px-2.5 py-1 rounded-full font-semibold">Aktif</span>
                              </td>
                              <td className="p-3 space-x-2">
                                <button className="text-indigo-600 hover:underline text-xs font-semibold">Edit</button>
                                <button className="text-rose-600 hover:underline text-xs font-semibold">Hapus</button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {adminTab === 'mentors' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900">Manajemen Mentor & Tarif Honor</h3>
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-indigo-700 transition">
                      + Tambah Mentor
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-400 uppercase text-xs">
                        <tr>
                          <th className="p-3">Nama Mentor</th>
                          <th className="p-3">Spesialisasi</th>
                          <th className="p-3">Tarif / Jam</th>
                          <th className="p-3">No. WhatsApp</th>
                          <th className="p-3">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {mentors.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="text-center py-6 text-slate-400 text-sm">Belum ada data mentor.</td>
                          </tr>
                        ) : (
                          mentors.map((m, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="p-3 font-semibold text-slate-800">{m.name}</td>
                              <td className="p-3 text-slate-600">{m.specialization}</td>
                              <td className="p-3 font-bold text-slate-800">Rp {m.hourly_rate || '50.000'}</td>
                              <td className="p-3 text-slate-600">{m.phone}</td>
                              <td className="p-3 space-x-2">
                                <button className="text-indigo-600 hover:underline text-xs font-semibold">Kirim Kredensial WA</button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {adminTab === 'payments' && (
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-6">Pencatatan Pembayaran Termin Siswa</h3>
                  <p className="text-sm text-slate-500 mb-4">Pantau status pembayaran termin (Lunas / Belum Lunas) dengan mudah.</p>
                  <div className="bg-slate-50 rounded-xl p-4 border text-center text-sm text-slate-500">
                    Modul pembayaran siap dihubungkan ke tabel database termin pembayaran siswa.
                  </div>
                </div>
              )}

              {adminTab === 'payroll' && (
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-6">Penggajian Otomatis (Payroll Mentor)</h3>
                  <p className="text-sm text-slate-500 mb-4">Total Jam Mengajar × Tarif Honor + Tunjangan Kinerja & Bonus.</p>
                  <div className="bg-slate-50 rounded-xl p-4 border text-center text-sm text-slate-500">
                    Perhitungan otomatis gaji mentor berdasarkan rekap presensi mengajar.
                  </div>
                </div>
              )}

              {adminTab === 'modules' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900">Inventaris Modul & Bahan Ajar</h3>
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-indigo-700 transition">
                      + Tambah Modul
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { title: "Modul Matematika SD Kelas 6", stock: 25 },
                      { title: "Modul Fisika SMP Kelas 9", stock: 18 },
                      { title: "Modul UTBK SNBT Saintek", stock: 40 }
                    ].map((mod, idx) => (
                      <div key={idx} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold text-sm text-slate-800">{mod.title}</h4>
                          <span className="text-xs text-slate-500">Stok Fisik: <b>{mod.stock} pcs</b></span>
                        </div>
                        <button className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold">Edit</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. PORTAL GURU */}
        {view === 'teacher' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-slate-200 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Portal Pengajar Bimbel ErHa</h2>
                <p className="text-xs text-slate-500 mt-0.5">Catat presensi harian siswa dan jurnal materi pembelajaran.</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setTeacherTab('attendance')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition ${teacherTab === 'attendance' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border'}`}
                >
                  Presensi & Jurnal Kelas
                </button>
                <button
                  onClick={() => setTeacherTab('password')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition ${teacherTab === 'password' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border'}`}
                >
                  Ganti Password
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              {teacherTab === 'attendance' && (
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Input Presensi & Jurnal Materi Siswa</h3>
                  <div className="space-y-4 max-w-xl">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Pilih Siswa</label>
                      <select className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white">
                        <option>Ahmad Fauzan (SD - Reguler)</option>
                        <option>Siti Aminah (SMP - Intensif)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Status Kehadiran</label>
                      <select className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white">
                        <option>Hadir</option>
                        <option>Izin</option>
                        <option>Alpha</option>
                        <option>Kelas Pengganti (Makeup Class)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Jurnal Materi Pembelajaran</label>
                      <textarea 
                        rows="3" 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm"
                        placeholder="Tuliskan materi yang dibahas hari ini..."
                      ></textarea>
                    </div>
                    <button className="bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl text-sm hover:bg-indigo-700 transition">
                      Simpan Presensi & Jurnal
                    </button>
                  </div>
                </div>
              )}

              {teacherTab === 'password' && (
                <div className="max-w-md">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Ganti Password Akun Mentor</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Password Lama</label>
                      <input type="password" className="w-full px-4 py-3 rounded-xl border text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Password Baru</label>
                      <input type="password" className="w-full px-4 py-3 rounded-xl border text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Konfirmasi Password Baru</label>
                      <input type="password" className="w-full px-4 py-3 rounded-xl border text-sm" />
                    </div>
                    <button className="bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl text-sm hover:bg-indigo-700 transition">
                      Perbarui Password
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Bimbel ErHa (Rumah Hebat). Seluruh Hak Cipta Dilindungi.
        </div>
      </footer>

    </div>
  );
}
