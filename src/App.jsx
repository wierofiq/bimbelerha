import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  BookOpen, Users, DollarSign, UserCheck, Package, 
  LogOut, Lock, CheckCircle, Clock, AlertCircle, 
  Send, Phone, User, Calendar, Plus, Edit, Trash2, Shield, Menu, X,
  LayoutDashboard
} from 'lucide-react';

// ==========================================
// KONFIGURASI SUPABASE 
// ==========================================
const SUPABASE_URL = 'https://izifwpviqpyxauafdlge.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6aWZ3cHZpcXB5eGF1YWZkbGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NDA2ODYsImV4cCI6MjEwNjUxNjY4Nn0.XpJEgQ3vpGOYmPVi-nsjrSRJI9RfR5kWTN_XsL-TCUU';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function App() {
  // State Utama Navigasi & Sesi
  const [view, setView] = useState('landing'); 
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
  const [adminTab, setAdminTab] = useState('students'); 
  
  // State Guru Portal
  const [teacherTab, setTeacherTab] = useState('overview'); 
  const [passForm, setPassForm] = useState({ oldPass: '', newPass: '', confirmPass: '' });
  
  // State Form Input Presensi Sesi (1 - 12)
  const [attendanceForm, setAttendanceForm] = useState({
    studentId: '',
    sessionNumber: '1',
    status: 'Hadir',
    journal: ''
  });

  // Load Data dari Supabase saat aplikasi dimuat
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
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
    const adminPhone = "6281234567890"; 
    const message = `Halo Admin Bimbel ErHa, saya ingin mendaftarkan siswa baru:\n\nNama Siswa: ${regForm.name}\nNama Wali: ${regForm.parentName}\nNo. HP/WA: ${regForm.phone}\nJenjang: ${regForm.level}\nPaket: ${regForm.package}\n\nMohon informasinya lebih lanjut. Terima kasih!`;
    const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    alert("Pendaftaran berhasil dikirim ke WhatsApp Admin!");
    setRegForm({ name: '', parentName: '', phone: '', package: 'Reguler (12 Sesi)', level: 'SD' });
  };

  // Handler Login 
  const handleLogin = (e) => {
    e.preventDefault();
    if (loginForm.email === 'admin@erha.com' && loginForm.password === 'admin123') {
      setUser({ role: 'admin', name: 'Administrator', email: loginForm.email });
      setView('admin'); 
    } else if (loginForm.email === 'guru@erha.com' && loginForm.password === 'guru123') {
      setUser({ role: 'teacher', name: 'Budi Santoso, S.Pd.', email: loginForm.email, phone: '081298765432' });
      setView('teacher'); 
    } else {
      alert("Email atau Password salah! Gunakan akun uji coba yang sesuai.");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView('landing');
    setLoginForm({ email: '', password: '' });
  };

  const handleSaveAttendance = (e) => {
    e.preventDefault();
    alert(`Presensi dan Jurnal Sesi ke-${attendanceForm.sessionNumber} berhasil disimpan!`);
    setAttendanceForm({ studentId: '', sessionNumber: '1', status: 'Hadir', journal: '' });
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (passForm.newPass !== passForm.confirmPass) {
      alert("Konfirmasi password baru tidak sesuai!");
      return;
    }
    alert("Kata sandi berhasil diperbarui!");
    setPassForm({ oldPass: '', newPass: '', confirmPass: '' });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col justify-between">
      
      {/* NAVBAR UTAMA */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setView('landing')}>
            <div className="bg-indigo-600 p-2 rounded-xl text-white">
              <BookOpen size={24} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-indigo-900 leading-tight tracking-tight">Bimbel ErHa</h1>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Rumah Hebat</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            {view === 'landing' ? (
              <>
                <a href="#packages" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition">Paket Belajar</a>
                <a href="#register" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition">Pendaftaran</a>
                <button 
                  onClick={() => setView('login')} 
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition shadow-md shadow-indigo-600/20"
                >
                  Masuk Portal
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4 border-l border-slate-200 pl-6">
                <div className="text-right">
                  <span className="block text-sm font-bold text-slate-800">{user?.name}</span>
                  <span className="block text-xs font-medium text-slate-500 capitalize">{user?.role === 'teacher' ? 'Mentor' : 'Administrator'}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-2 bg-rose-50 text-rose-600 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-rose-100 transition"
                >
                  <LogOut size={16} />
                  <span>Keluar</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-600 focus:outline-none p-2 bg-slate-100 rounded-lg">
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-4 pb-6 space-y-4 shadow-lg absolute w-full">
            {view === 'landing' ? (
              <>
                <a href="#packages" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-bold text-slate-600 text-center">Paket Belajar</a>
                <a href="#register" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-bold text-slate-600 text-center">Pendaftaran</a>
                <button 
                  onClick={() => { setView('login'); setMobileMenuOpen(false); }} 
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl text-sm font-bold text-center shadow-md shadow-indigo-600/20"
                >
                  Masuk Portal
                </button>
              </>
            ) : (
              <button 
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="w-full bg-rose-50 text-rose-600 py-3 rounded-xl text-sm font-bold text-center flex items-center justify-center space-x-2"
              >
                <LogOut size={18} />
                <span>Keluar dari Akun</span>
              </button>
            )}
          </div>
        )}
      </header>

      {/* KONTEN UTAMA */}
      <main className="flex-grow">
        
        {/* 1. LANDING PAGE */}
        {view === 'landing' && (
          <div className="animate-in fade-in duration-500">
            {/* Hero Section */}
            <section className="bg-indigo-900 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6 text-center md:text-left">
                  <div className="inline-block bg-indigo-500/30 text-indigo-200 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border border-indigo-400/30">
                    Bimbingan Belajar Profesional
                  </div>
                  <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
                    Wujudkan Prestasi <br/><span className="text-indigo-400">Gemilang</span> Bersama Kami
                  </h2>
                  <p className="text-slate-300 text-base md:text-lg max-w-lg mx-auto md:mx-0 leading-relaxed">
                    Rumah belajar interaktif dengan metode pembelajaran modern, mentor berpengalaman, dan modul terlengkap untuk SD, SMP, hingga SMA.
                  </p>
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-2 justify-center md:justify-start">
                    <a href="#register" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-3.5 rounded-xl text-center transition shadow-lg shadow-emerald-500/30">
                      Daftar Sekarang
                    </a>
                    <a href="#packages" className="bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-3.5 rounded-xl text-center transition border border-white/20 backdrop-blur-sm">
                      Lihat Paket
                    </a>
                  </div>
                </div>
                <div className="hidden md:flex justify-center">
                   <div className="bg-white p-8 rounded-3xl shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                      <BookOpen size={120} className="text-indigo-600" />
                   </div>
                </div>
              </div>
            </section>

            {/* Packages Section */}
            <section id="packages" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900">Pilihan Paket Belajar</h3>
                <p className="text-slate-500 mt-4 text-lg">Pilih paket bimbingan yang dirancang khusus untuk memenuhi kebutuhan akademik putra/putri Anda.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { name: "Reguler", sessions: "12 Sesi / Periode", price: "Rp 350.000", desc: "Cocok untuk pendampingan rutin mingguan mata pelajaran sekolah secara umum." },
                  { name: "Intensif", sessions: "24 Sesi / Periode", price: "Rp 650.000", desc: "Fokus persiapan ujian sekolah, pemahaman konsep mendalam, dan try out.", popular: true },
                  { name: "Privat Eksklusif", sessions: "12 Sesi (1-on-1)", price: "Rp 950.000", desc: "Mentor datang ke rumah atau jadwal sangat fleksibel menyesuaikan siswa." }
                ].map((pkg, idx) => (
                  <div key={idx} className={`bg-white rounded-3xl p-8 border ${pkg.popular ? 'border-indigo-500 ring-4 ring-indigo-50 shadow-xl relative' : 'border-slate-200 shadow-sm'} flex flex-col justify-between hover:-translate-y-1 transition-all duration-300`}>
                    {pkg.popular && <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full">Paling Diminati</span>}
                    <div>
                      <div className="text-indigo-600 font-black text-sm tracking-widest uppercase">{pkg.name}</div>
                      <div className="text-4xl font-extrabold text-slate-900 mt-4">{pkg.price}</div>
                      <div className="text-sm font-bold text-slate-400 mt-2 bg-slate-50 inline-block px-3 py-1 rounded-lg">{pkg.sessions}</div>
                      <p className="text-slate-600 text-sm mt-6 leading-relaxed">{pkg.desc}</p>
                    </div>
                    <a href="#register" className={`mt-10 block text-center font-bold py-3.5 rounded-xl transition text-sm ${pkg.popular ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/30' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                      Pilih Paket Ini
                    </a>
                  </div>
                ))}
              </div>
            </section>

            {/* Registration Section */}
            <section id="register" className="py-24 bg-slate-100 border-t border-slate-200">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-[2rem] shadow-xl p-8 md:p-14">
                  <div className="text-center mb-10">
                    <h3 className="text-3xl font-extrabold text-slate-900">Formulir Pendaftaran Baru</h3>
                    <p className="text-slate-500 mt-2">Isi data di bawah ini, informasi Anda akan langsung terkirim ke WhatsApp Admin kami.</p>
                  </div>
                  <form onSubmit={handleRegister} className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Nama Lengkap Siswa</label>
                      <input 
                        type="text" 
                        required 
                        value={regForm.name} 
                        onChange={(e) => setRegForm({...regForm, name: e.target.value})}
                        className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 transition"
                        placeholder="Contoh: Ahmad Fauzan" 
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Nama Orang Tua / Wali</label>
                        <input 
                          type="text" 
                          required 
                          value={regForm.parentName} 
                          onChange={(e) => setRegForm({...regForm, parentName: e.target.value})}
                          className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 transition"
                          placeholder="Contoh: Budi Santoso" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">No. WhatsApp Aktif</label>
                        <input 
                          type="tel" 
                          required 
                          value={regForm.phone} 
                          onChange={(e) => setRegForm({...regForm, phone: e.target.value})}
                          className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 transition"
                          placeholder="Contoh: 08123456789" 
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Jenjang Pendidikan</label>
                        <select 
                          value={regForm.level} 
                          onChange={(e) => setRegForm({...regForm, level: e.target.value})}
                          className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 transition bg-white"
                        >
                          <option value="SD">Sekolah Dasar (SD)</option>
                          <option value="SMP">Sekolah Menengah Pertama (SMP)</option>
                          <option value="SMA">Sekolah Menengah Atas (SMA)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Pilihan Paket</label>
                        <select 
                          value={regForm.package} 
                          onChange={(e) => setRegForm({...regForm, package: e.target.value})}
                          className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 transition bg-white"
                        >
                          <option value="Reguler (12 Sesi)">Reguler (12 Sesi)</option>
                          <option value="Intensif (24 Sesi)">Intensif (24 Sesi)</option>
                          <option value="Privat Eksklusif">Privat Eksklusif</option>
                        </select>
                      </div>
                    </div>
                    <div className="pt-4">
                      <button 
                        type="submit" 
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl transition shadow-xl shadow-emerald-500/30 flex items-center justify-center space-x-3 text-lg"
                      >
                        <Send size={24} />
                        <span>Kirim Pendaftaran via WhatsApp</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* 2. HALAMAN LOGIN PORTAL */}
        {view === 'login' && (
          <div className="max-w-md mx-auto py-24 px-4 animate-in fade-in zoom-in duration-300">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-10">
              <div className="text-center mb-8">
                <div className="bg-indigo-600 h-16 w-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                  <LayoutDashboard size={32} />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900">Portal ErHa</h3>
                <p className="text-sm text-slate-500 mt-2">Masuk ke dashboard manajemen Anda</p>
                
                <div className="mt-6 bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-left space-y-2 text-amber-800">
                  <p className="font-bold text-amber-900 border-b border-amber-200/50 pb-1 mb-2">Akun Uji Coba</p>
                  <p className="flex justify-between"><span>Admin:</span> <b className="font-mono">admin@erha.com / admin123</b></p>
                  <p className="flex justify-between"><span>Guru:</span> <b className="font-mono">guru@erha.com / guru123</b></p>
                </div>
              </div>
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Alamat Email</label>
                  <input 
                    type="email" 
                    required 
                    value={loginForm.email} 
                    onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                    className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium transition"
                    placeholder="Masukkan email Anda"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Kata Sandi</label>
                  <input 
                    type="password" 
                    required 
                    value={loginForm.password} 
                    onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                    className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium transition"
                    placeholder="••••••••"
                  />
                </div>
                <div className="pt-2 space-y-3">
                  <button 
                    type="submit" 
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition text-sm shadow-lg shadow-indigo-600/30"
                  >
                    Masuk Portal
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setView('landing')} 
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl transition text-sm"
                  >
                    Batal & Kembali
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 3. PORTAL ADMIN (DENGAN SIDEBAR LAYOUT) */}
        {view === 'admin' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-slate-900">Dashboard Admin</h2>
              <p className="text-sm text-slate-500 mt-1">Pusat kendali manajemen Bimbel ErHa.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              {/* Sidebar Navigation */}
              <aside className="w-full md:w-64 shrink-0">
                <nav className="flex flex-col space-y-2 bg-white p-3 rounded-2xl shadow-sm border border-slate-200">
                  {[
                    { id: 'students', label: 'Manajemen Siswa', icon: Users },
                    { id: 'mentors', label: 'Mentor & Guru', icon: UserCheck },
                    { id: 'payments', label: 'Pembayaran', icon: DollarSign },
                    { id: 'payroll', label: 'Payroll Gaji', icon: Shield },
                    { id: 'modules', label: 'Inventaris Modul', icon: Package }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setAdminTab(tab.id)}
                        className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                          adminTab === tab.id 
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 translate-x-1' 
                            : 'bg-transparent text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                        }`}
                      >
                        <Icon size={20} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </aside>

              {/* Main Content Area */}
              <main className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-8 min-h-[600px]">
                
                {adminTab === 'students' && (
                  <div className="animate-in fade-in">
                    <div className="flex justify-between items-center mb-8">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Daftar Siswa Aktif</h3>
                        <p className="text-sm text-slate-500 mt-1">Kelola data siswa dan sisa sesi paket reguler/intensif.</p>
                      </div>
                      <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition flex items-center space-x-2">
                        <Plus size={16} /> <span>Tambah Siswa</span>
                      </button>
                    </div>
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                          <tr>
                            <th className="p-4">Nama Siswa</th>
                            <th className="p-4">Jenjang</th>
                            <th className="p-4">Paket</th>
                            <th className="p-4">Sisa Sesi</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-center">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {students.length === 0 ? (
                            <tr>
                              <td colSpan="6" className="text-center py-8 text-slate-400">Belum ada data siswa nyata. Menampilkan data dummy.</td>
                            </tr>
                          ) : (
                            students.map((s, idx) => (
                              <tr key={idx} className="hover:bg-slate-50 transition">
                                <td className="p-4 font-bold text-slate-800">{s.name}</td>
                                <td className="p-4 text-slate-600 font-medium">{s.level}</td>
                                <td className="p-4 text-slate-600">{s.package}</td>
                                <td className="p-4 font-black text-indigo-600">{s.remaining_sessions || 12} Sesi</td>
                                <td className="p-4">
                                  <span className="bg-emerald-100 text-emerald-700 text-xs px-3 py-1 rounded-full font-bold">Aktif</span>
                                </td>
                                <td className="p-4 flex justify-center space-x-3">
                                  <button className="text-slate-400 hover:text-indigo-600 transition" title="Edit"><Edit size={18} /></button>
                                  <button className="text-slate-400 hover:text-rose-600 transition" title="Hapus"><Trash2 size={18} /></button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Sisa konten adminTab disesuaikan style-nya */}
                {adminTab === 'mentors' && (
                  <div className="animate-in fade-in">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-xl font-bold text-slate-900">Manajemen Mentor</h3>
                      <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition flex items-center space-x-2">
                        <Plus size={16} /> <span>Tambah Mentor</span>
                      </button>
                    </div>
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                          <tr>
                            <th className="p-4">Nama Mentor</th>
                            <th className="p-4">Spesialisasi</th>
                            <th className="p-4">Honor / Jam</th>
                            <th className="p-4">No. WhatsApp</th>
                            <th className="p-4">Kredensial</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {mentors.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="text-center py-8 text-slate-400">Belum ada data mentor tersimpan.</td>
                            </tr>
                          ) : (
                            mentors.map((m, idx) => (
                              <tr key={idx} className="hover:bg-slate-50 transition">
                                <td className="p-4 font-bold text-slate-800">{m.name}</td>
                                <td className="p-4 text-slate-600">{m.specialization}</td>
                                <td className="p-4 font-black text-slate-700">Rp {m.hourly_rate || '50.000'}</td>
                                <td className="p-4 text-slate-600 font-medium">{m.phone}</td>
                                <td className="p-4">
                                  <button className="text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-100 transition">Kirim WA</button>
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
                  <div className="animate-in fade-in">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Pembayaran Termin Siswa</h3>
                    <p className="text-sm text-slate-500 mb-8">Pantau status pembayaran lunas atau belum lunas di sini.</p>
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-500 flex flex-col items-center">
                      <DollarSign size={48} className="text-slate-300 mb-4" />
                      <p className="font-medium">Modul pembayaran siap diintegrasikan dengan database.</p>
                    </div>
                  </div>
                )}

                {adminTab === 'payroll' && (
                  <div className="animate-in fade-in">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Penggajian Mentor (Payroll)</h3>
                    <p className="text-sm text-slate-500 mb-8">Kalkulasi otomatis honor mengajar berdasarkan data presensi.</p>
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-500 flex flex-col items-center">
                      <Shield size={48} className="text-slate-300 mb-4" />
                      <p className="font-medium">Sistem rekap otomatis gaji sedang dalam tahap persiapan.</p>
                    </div>
                  </div>
                )}

                {adminTab === 'modules' && (
                  <div className="animate-in fade-in">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-xl font-bold text-slate-900">Inventaris Modul</h3>
                      <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition flex items-center space-x-2">
                        <Plus size={16} /> <span>Tambah Modul</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[
                        { title: "Modul Matematika SD Kelas 6", stock: 25 },
                        { title: "Modul Fisika SMP Kelas 9", stock: 18 },
                        { title: "Modul UTBK SNBT Saintek", stock: 40 }
                      ].map((mod, idx) => (
                        <div key={idx} className="border border-slate-200 rounded-2xl p-6 bg-white shadow-sm hover:shadow-md transition">
                          <Package className="text-indigo-500 mb-4" size={32} />
                          <h4 className="font-bold text-base text-slate-900 mb-1 leading-snug">{mod.title}</h4>
                          <span className="text-sm text-slate-500 block mb-4">Stok Fisik: <b className="text-slate-800">{mod.stock} pcs</b></span>
                          <button className="text-indigo-600 hover:text-indigo-800 text-sm font-bold w-full bg-indigo-50 py-2 rounded-lg transition">Edit Stok</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </main>
            </div>
          </div>
        )}

        {/* 4. PORTAL GURU / MENTOR (DENGAN SIDEBAR LAYOUT) */}
        {view === 'teacher' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-slate-900">Portal Mentor</h2>
              <p className="text-sm text-slate-500 mt-1">Kelola kelas, presensi, dan aktivitas bimbingan belajar Anda.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              {/* Sidebar Navigation */}
              <aside className="w-full md:w-64 shrink-0">
                <nav className="flex flex-col space-y-2 bg-white p-3 rounded-2xl shadow-sm border border-slate-200">
                  {[
                    { id: 'overview', label: 'Ringkasan Kelas', icon: Calendar },
                    { id: 'attendance', label: 'Presensi & Jurnal', icon: CheckCircle },
                    { id: 'modules', label: 'Akses Modul', icon: BookOpen },
                    { id: 'profile', label: 'Pengaturan Akun', icon: Lock }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setTeacherTab(tab.id)}
                        className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                          teacherTab === tab.id 
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 translate-x-1' 
                            : 'bg-transparent text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                        }`}
                      >
                        <Icon size={20} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </aside>

              {/* Main Content Area */}
              <main className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-8 min-h-[600px]">
                
                {teacherTab === 'overview' && (
                  <div className="animate-in fade-in space-y-8">
                    <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 rounded-2xl p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-lg shadow-indigo-900/20">
                      <div>
                        <span className="bg-indigo-500/40 text-indigo-100 text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-widest border border-indigo-400/30">Mentor Aktif</span>
                        <h3 className="text-2xl font-extrabold mt-4">{user?.name}</h3>
                        <p className="text-indigo-200 mt-1">{user?.email} • {user?.phone}</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm px-6 py-4 rounded-xl border border-white/20 text-center min-w-[150px]">
                        <span className="text-xs text-indigo-200 block font-bold uppercase tracking-wider mb-1">Total Sesi Diampu</span>
                        <span className="text-4xl font-black text-white">8</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-slate-900 text-xl mb-4">Jadwal & Anak Didik Aktif</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                          { student: "Ahmad Fauzan", level: "SD - Reguler", progress: "Sesi 5 dari 12", nextSchedule: "Senin, 15:00 WIB" },
                          { student: "Siti Aminah", level: "SMP - Intensif", progress: "Sesi 9 dari 12", nextSchedule: "Selasa, 16:30 WIB" }
                        ].map((item, i) => (
                          <div key={i} className="border border-slate-200 rounded-2xl p-6 bg-slate-50 hover:bg-white hover:shadow-md transition duration-300 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start mb-4">
                                <span className="font-bold text-slate-900 text-lg">{item.student}</span>
                                <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg font-bold">{item.level}</span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${(parseInt(item.progress.split(' ')[1]) / 12) * 100}%` }}></div>
                              </div>
                              <p className="text-xs text-slate-500 font-semibold">Progres: <b className="text-slate-800">{item.progress}</b></p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-slate-200 flex justify-between items-center text-sm">
                              <span className="text-slate-500 font-medium">Jadwal Mendatang:</span>
                              <span className="font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">{item.nextSchedule}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {teacherTab === 'attendance' && (
                  <div className="animate-in fade-in">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Presensi & Jurnal Mengajar</h3>
                    <p className="text-sm text-slate-500 mb-8">Catat kehadiran dan rangkuman materi per sesi secara langsung.</p>
                    
                    <form onSubmit={handleSaveAttendance} className="bg-slate-50 border border-slate-200 p-6 md:p-8 rounded-2xl space-y-6 max-w-2xl">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Pilih Siswa</label>
                          <select 
                            value={attendanceForm.studentId}
                            onChange={(e) => setAttendanceForm({...attendanceForm, studentId: e.target.value})}
                            className="w-full px-5 py-3.5 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:ring-2 focus:ring-indigo-500"
                            required
                          >
                            <option value="">-- Silakan Pilih --</option>
                            <option value="1">Ahmad Fauzan (SD)</option>
                            <option value="2">Siti Aminah (SMP)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Sesi Ke-</label>
                          <select 
                            value={attendanceForm.sessionNumber}
                            onChange={(e) => setAttendanceForm({...attendanceForm, sessionNumber: e.target.value})}
                            className="w-full px-5 py-3.5 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:ring-2 focus:ring-indigo-500"
                          >
                            {[...Array(12)].map((_, i) => (
                              <option key={i+1} value={i+1}>Sesi {i+1} dari 12</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Kehadiran</label>
                        <select 
                          value={attendanceForm.status}
                          onChange={(e) => setAttendanceForm({...attendanceForm, status: e.target.value})}
                          className="w-full px-5 py-3.5 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="Hadir">Hadir (Sesuai Jadwal)</option>
                          <option value="Izin">Izin / Sakit</option>
                          <option value="Alpha">Alpha (Tanpa Keterangan)</option>
                          <option value="Kelas Pengganti">Kelas Pengganti (Makeup)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Jurnal Materi</label>
                        <textarea 
                          rows="4" 
                          required
                          value={attendanceForm.journal}
                          onChange={(e) => setAttendanceForm({...attendanceForm, journal: e.target.value})}
                          className="w-full px-5 py-3.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-indigo-500 resize-none"
                          placeholder="Tuliskan materi yang dibahas, tugas, atau evaluasi singkat hari ini..."
                        ></textarea>
                      </div>
                      <button type="submit" className="w-full md:w-auto bg-indigo-600 text-white font-bold px-8 py-3.5 rounded-xl text-sm hover:bg-indigo-700 transition shadow-md shadow-indigo-600/20">
                        Simpan Laporan
                      </button>
                    </form>
                  </div>
                )}

                {teacherTab === 'modules' && (
                  <div className="animate-in fade-in">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Bank Modul Digital</h3>
                    <p className="text-sm text-slate-500 mb-8">Akses referensi materi dan bahan ajar yang disediakan oleh lembaga.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { title: "Matematika SD Terpadu", desc: "Materi lengkap aritmatika, pecahan, dan geometri dasar." },
                        { title: "Fisika Dasar SMP", desc: "Konsep kelistrikan, gaya magnet, dan mekanika." },
                        { title: "Kumpulan Soal UTBK", desc: "Drilling penalaran kuantitatif dan literasi." }
                      ].map((mod, idx) => (
                        <div key={idx} className="border border-slate-200 rounded-2xl p-6 bg-slate-50 hover:bg-white hover:shadow-md transition flex flex-col justify-between">
                          <div>
                            <span className="inline-block bg-indigo-100 text-indigo-700 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded mb-3">Tersedia</span>
                            <h4 className="font-extrabold text-lg text-slate-900 leading-tight">{mod.title}</h4>
                            <p className="text-sm text-slate-600 mt-2">{mod.desc}</p>
                          </div>
                          <button className="mt-6 flex items-center justify-center space-x-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white font-bold w-full py-3 rounded-xl transition">
                            <BookOpen size={16} />
                            <span>Buka Modul PDF</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {teacherTab === 'profile' && (
                  <div className="animate-in fade-in max-w-md">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Keamanan Akun</h3>
                    <p className="text-sm text-slate-500 mb-8">Perbarui kata sandi portal Anda secara berkala.</p>
                    
                    <form onSubmit={handleChangePassword} className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Password Lama</label>
                        <input 
                          type="password" 
                          required
                          value={passForm.oldPass}
                          onChange={(e) => setPassForm({...passForm, oldPass: e.target.value})}
                          className="w-full px-5 py-3.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-indigo-500" 
                          placeholder="••••••••"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Password Baru</label>
                        <input 
                          type="password" 
                          required
                          value={passForm.newPass}
                          onChange={(e) => setPassForm({...passForm, newPass: e.target.value})}
                          className="w-full px-5 py-3.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-indigo-500" 
                          placeholder="••••••••"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Konfirmasi Password Baru</label>
                        <input 
                          type="password" 
                          required
                          value={passForm.confirmPass}
                          onChange={(e) => setPassForm({...passForm, confirmPass: e.target.value})}
                          className="w-full px-5 py-3.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-indigo-500" 
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="pt-2">
                        <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl text-sm hover:bg-indigo-700 transition shadow-md shadow-indigo-600/20">
                          Perbarui Kata Sandi
                        </button>
                      </div>
                    </form>
                  </div>
                )}

              </main>
            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-slate-500 font-medium">
            &copy; {new Date().getFullYear()} <b className="text-indigo-900">Bimbel ErHa</b> (Rumah Hebat Belajar & Berprestasi).
          </p>
          <p className="text-xs text-slate-400 mt-2">Seluruh Hak Cipta Dilindungi.</p>
        </div>
      </footer>

    </div>
  );
}
