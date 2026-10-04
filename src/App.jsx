import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  BookOpen, Users, DollarSign, UserCheck, Package, 
  LogOut, Lock, CheckCircle, Clock, AlertCircle, 
  Send, Phone, User, Calendar, Plus, Edit, Trash2, Shield, Menu, X, LayoutDashboard
} from 'lucide-react';

// ==========================================
// KONFIGURASI SUPABASE (Sesuaikan kredensial Anda)
// ==========================================
const SUPABASE_URL = 'https://your-supabase-url.supabase.co';
const SUPABASE_ANON_KEY = 'your-supabase-anon-key';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function App() {
  // State Utama Navigasi & Sesi
  const [view, setView] = useState('landing'); // 'landing', 'login', 'admin', 'teacher'
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
  
  // State Form Input Presensi Sesi
  const [attendanceForm, setAttendanceForm] = useState({
    studentId: '',
    sessionNumber: '1',
    status: 'Hadir',
    journal: ''
  });

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

  const handleRegister = (e) => {
    e.preventDefault();
    const adminPhone = "6281234567890"; 
    const message = `Halo Admin Bimbel ErHa, saya ingin mendaftarkan siswa baru:\n\nNama Siswa: ${regForm.name}\nNama Wali: ${regForm.parentName}\nNo. HP/WA: ${regForm.phone}\nJenjang: ${regForm.level}\nPaket: ${regForm.package}\n\nMohon informasinya lebih lanjut. Terima kasih!`;
    const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    alert("Pendaftaran berhasil dikirim ke WhatsApp Admin!");
    setRegForm({ name: '', parentName: '', phone: '', package: 'Reguler (12 Sesi)', level: 'SD' });
  };

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
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-800 flex flex-col justify-between selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* NAVBAR UTAMA */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setView('landing')}>
            <div className="bg-indigo-600 text-white p-2 rounded-xl group-hover:scale-105 transition-transform">
              <LayoutDashboard size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-indigo-900 leading-tight">Bimbel ErHa</h1>
              <p className="text-xs text-slate-500 font-medium">Rumah Hebat Belajar</p>
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
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
                >
                  Masuk Portal
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-5 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-200">
                <span className="text-sm font-medium text-slate-600">
                  Halo, <b className="text-indigo-900">{user?.name}</b> <span className="text-xs bg-slate-200 px-2 py-0.5 rounded-full ml-1">{user?.role === 'teacher' ? 'Mentor' : 'Admin'}</span>
                </span>
                <div className="h-5 w-px bg-slate-300"></div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 text-rose-500 hover:text-rose-700 text-sm font-semibold transition"
                >
                  <LogOut size={16} />
                  <span>Keluar</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-600 p-2 focus:outline-none bg-slate-100 rounded-lg">
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b px-4 pt-3 pb-5 space-y-4 shadow-lg absolute w-full left-0">
            {view === 'landing' ? (
              <>
                <a href="#packages" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-slate-700 hover:text-indigo-600">Paket Belajar</a>
                <a href="#register" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-slate-700 hover:text-indigo-600">Pendaftaran</a>
                <button 
                  onClick={() => { setView('login'); setMobileMenuOpen(false); }} 
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl text-sm font-semibold text-center"
                >
                  Masuk Portal
                </button>
              </>
            ) : (
              <button 
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="w-full bg-rose-50 border border-rose-100 text-rose-600 py-3 rounded-xl text-sm font-semibold text-center flex items-center justify-center space-x-2"
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
            <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white py-20 px-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
              <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                <div className="space-y-6 text-center lg:text-left">
                  <span className="inline-block bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border border-indigo-400/30">
                    Penerimaan Siswa Baru
                  </span>
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                    Bangun Fondasi <span className="text-indigo-400">Prestasi</span> Masa Depan
                  </h2>
                  <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto lg:mx-0">
                    Rumah belajar interaktif dengan mentor terdedikasi, modul lengkap, dan kurikulum adaptif untuk SD, SMP, hingga SMA.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
                    <a href="#register" className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-8 py-3.5 rounded-xl text-center transition-all shadow-lg shadow-indigo-500/30">
                      Daftar Sekarang
                    </a>
                    <a href="#packages" className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3.5 rounded-xl text-center transition-all border border-white/10 backdrop-blur-sm">
                      Lihat Program
                    </a>
                  </div>
                </div>
                <div className="flex justify-center lg:justify-end">
                   <div className="w-full max-w-md aspect-square bg-indigo-800/30 rounded-full border border-indigo-500/20 flex items-center justify-center p-8 relative">
                      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent rounded-full animate-spin-slow"></div>
                      <LayoutDashboard size={120} className="text-indigo-300 drop-shadow-2xl" />
                   </div>
                </div>
              </div>
            </section>

            <section id="packages" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-14">
                <h3 className="text-3xl font-bold text-slate-900">Program & Paket Belajar</h3>
                <p className="text-slate-600 mt-4 text-lg">Investasi pendidikan terbaik dengan fleksibilitas yang disesuaikan untuk kebutuhan setiap siswa.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { name: "Reguler", sessions: "12 Sesi / Periode", price: "Rp 350.000", desc: "Pendampingan rutin mingguan mata pelajaran sekolah." },
                  { name: "Intensif", sessions: "24 Sesi / Periode", price: "Rp 650.000", desc: "Fokus persiapan ujian sekolah dan pemahaman terarah.", highlight: true },
                  { name: "Eksklusif", sessions: "12 Sesi (1-on-1)", price: "Rp 950.000", desc: "Mentor datang ke rumah atau jadwal fleksibel sesuai siswa." }
                ].map((pkg, idx) => (
                  <div key={idx} className={`bg-white rounded-3xl p-8 border flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${pkg.highlight ? 'border-indigo-500 shadow-lg shadow-indigo-100 relative ring-4 ring-indigo-50' : 'border-slate-200 shadow-sm'}`}>
                    {pkg.highlight && <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full">TERPOPULER</span>}
                    <div>
                      <div className="text-indigo-600 font-bold text-sm tracking-widest uppercase">{pkg.name}</div>
                      <div className="text-4xl font-extrabold text-slate-900 mt-3">{pkg.price}</div>
                      <div className="text-sm font-semibold text-slate-400 mt-2 flex items-center gap-2">
                        <Clock size={16} /> {pkg.sessions}
                      </div>
                      <div className="w-full h-px bg-slate-100 my-6"></div>
                      <p className="text-slate-600 text-sm leading-relaxed">{pkg.desc}</p>
                    </div>
                    <a href="#register" className={`mt-8 block text-center font-semibold py-3.5 rounded-xl transition-all text-sm ${pkg.highlight ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                      Pilih Program Ini
                    </a>
                  </div>
                ))}
              </div>
            </section>

            <section id="register" className="py-20 bg-slate-100 border-t border-slate-200">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden flex flex-col md:flex-row">
                  <div className="bg-indigo-600 p-8 md:p-12 text-white md:w-2/5 flex flex-col justify-center">
                    <h3 className="text-2xl font-bold mb-4">Mari Bergabung!</h3>
                    <p className="text-indigo-100 text-sm leading-relaxed mb-8">Data pendaftaran Anda akan langsung terhubung dengan WhatsApp Admin kami untuk proses konfirmasi yang cepat dan mudah.</p>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-sm font-medium text-indigo-50"><Phone size={18}/> 0812-3456-7890</div>
                      <div className="flex items-center gap-3 text-sm font-medium text-indigo-50"><CheckCircle size={18}/> Admin Responsif</div>
                    </div>
                  </div>
                  <div className="p-8 md:p-12 md:w-3/5">
                    <form onSubmit={handleRegister} className="space-y-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Nama Lengkap Siswa</label>
                        <input 
                          type="text" required value={regForm.name} 
                          onChange={(e) => setRegForm({...regForm, name: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                          placeholder="Contoh: Ahmad Fauzan" 
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Orang Tua / Wali</label>
                          <input 
                            type="text" required value={regForm.parentName} 
                            onChange={(e) => setRegForm({...regForm, parentName: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                            placeholder="Contoh: Budi Santoso" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-2">No. WhatsApp</label>
                          <input 
                            type="tel" required value={regForm.phone} 
                            onChange={(e) => setRegForm({...regForm, phone: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                            placeholder="Contoh: 08123456789" 
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Jenjang</label>
                          <select 
                            value={regForm.level} onChange={(e) => setRegForm({...regForm, level: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm bg-white"
                          >
                            <option value="SD">Sekolah Dasar (SD)</option>
                            <option value="SMP">Sekolah Menengah (SMP)</option>
                            <option value="SMA">Sekolah Menengah (SMA)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Pilihan Paket</label>
                          <select 
                            value={regForm.package} onChange={(e) => setRegForm({...regForm, package: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm bg-white"
                          >
                            <option value="Reguler (12 Sesi)">Reguler (12 Sesi)</option>
                            <option value="Intensif (24 Sesi)">Intensif (24 Sesi)</option>
                            <option value="Privat Eksklusif">Privat Eksklusif</option>
                          </select>
                        </div>
                      </div>
                      <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center space-x-2 text-sm mt-4">
                        <Send size={18} />
                        <span>Kirim via WhatsApp</span>
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* 2. HALAMAN LOGIN */}
        {view === 'login' && (
          <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/60 p-8 md:p-10 w-full max-w-md">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mb-4">
                  <Lock size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Akses Portal</h3>
                <p className="text-sm text-slate-500 mt-2">Masuk sebagai Admin atau Mentor ErHa</p>
                
                <div className="mt-6 bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs text-left space-y-2 text-slate-600">
                  <div className="flex justify-between items-center"><span className="font-semibold text-slate-800">Admin:</span> admin@erha.com / admin123</div>
                  <div className="flex justify-between items-center"><span className="font-semibold text-slate-800">Guru:</span> guru@erha.com / guru123</div>
                </div>
              </div>
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Email Address</label>
                  <input 
                    type="email" required value={loginForm.email} 
                    onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                    placeholder="nama@erha.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Password</label>
                  <input 
                    type="password" required value={loginForm.password} 
                    onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                    placeholder="••••••••"
                  />
                </div>
                <div className="pt-2 space-y-3">
                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-indigo-600/20 text-sm">
                    Masuk Sekarang
                  </button>
                  <button type="button" onClick={() => setView('landing')} className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-3.5 rounded-xl transition-all text-sm">
                    Kembali ke Beranda
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 3. PORTAL ADMIN (Dashboard Layout) */}
        {view === 'admin' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Panel Utama Admin</h2>
              <p className="text-sm text-slate-500 mt-1">Kelola seluruh data operasional, inventaris, dan keuangan bimbingan belajar.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
              {/* Sidebar Menu - Responsive */}
              <div className="w-full md:w-64 lg:w-72 flex-shrink-0">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 md:p-4 sticky top-28 flex flex-row md:flex-col gap-2 overflow-x-auto no-scrollbar scroll-smooth">
                  {[
                    { id: 'students', label: 'Manajemen Siswa', icon: Users },
                    { id: 'mentors', label: 'Mentor & Guru', icon: UserCheck },
                    { id: 'payments', label: 'Keuangan & Bayar', icon: DollarSign },
                    { id: 'payroll', label: 'Penggajian (Payroll)', icon: Shield },
                    { id: 'modules', label: 'Inventaris Modul', icon: Package }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = adminTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setAdminTab(tab.id)}
                        className={`flex items-center whitespace-nowrap space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 w-full ${
                          isActive 
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 translate-x-0 md:translate-x-1' 
                            : 'bg-transparent text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                        }`}
                      >
                        <Icon size={18} className={isActive ? 'text-indigo-100' : 'text-slate-400'} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 p-6 lg:p-8 min-h-[500px] overflow-hidden">
                {adminTab === 'students' && (
                  <div className="animate-in fade-in">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                      <h3 className="text-xl font-bold text-slate-900">Daftar Siswa & Sesi</h3>
                      <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-sm">
                        <Plus size={16} /> Tambah Siswa
                      </button>
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold tracking-wider">
                          <tr>
                            <th className="p-4">Nama Siswa</th>
                            <th className="p-4">Jenjang</th>
                            <th className="p-4">Paket Program</th>
                            <th className="p-4">Sisa Sesi</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-center">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {students.length === 0 ? (
                            <tr>
                              <td colSpan="6" className="text-center py-10 text-slate-400 text-sm">
                                <Users size={32} className="mx-auto mb-3 opacity-20" />
                                Belum ada data siswa. (Data dummy: Ahmad Fauzan - SD - Reguler)
                              </td>
                            </tr>
                          ) : (
                            students.map((s, idx) => (
                              <tr key={idx} className="hover:bg-indigo-50/30 transition-colors">
                                <td className="p-4 font-bold text-slate-800">{s.name}</td>
                                <td className="p-4 text-slate-600"><span className="bg-slate-100 px-2.5 py-1 rounded-lg text-xs font-semibold">{s.level}</span></td>
                                <td className="p-4 text-slate-600">{s.package}</td>
                                <td className="p-4 font-extrabold text-indigo-600">{s.remaining_sessions || 12} Sesi</td>
                                <td className="p-4">
                                  <span className="bg-emerald-100/50 text-emerald-700 border border-emerald-200 text-xs px-3 py-1 rounded-full font-bold">Aktif</span>
                                </td>
                                <td className="p-4 space-x-3 text-center">
                                  <button className="text-slate-400 hover:text-indigo-600 transition-colors"><Edit size={16} /></button>
                                  <button className="text-slate-400 hover:text-rose-600 transition-colors"><Trash2 size={16} /></button>
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
                  <div className="animate-in fade-in">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                      <h3 className="text-xl font-bold text-slate-900">Manajemen Mentor</h3>
                      <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-sm">
                        <Plus size={16} /> Tambah Mentor
                      </button>
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold tracking-wider">
                          <tr>
                            <th className="p-4">Nama Mentor</th>
                            <th className="p-4">Spesialisasi</th>
                            <th className="p-4">Tarif / Jam</th>
                            <th className="p-4">WhatsApp</th>
                            <th className="p-4">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {mentors.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="text-center py-10 text-slate-400 text-sm">Belum ada data mentor yang terdaftar.</td>
                            </tr>
                          ) : (
                            mentors.map((m, idx) => (
                              <tr key={idx} className="hover:bg-indigo-50/30 transition-colors">
                                <td className="p-4 font-bold text-slate-800">{m.name}</td>
                                <td className="p-4 text-slate-600">{m.specialization}</td>
                                <td className="p-4 font-extrabold text-slate-900">Rp {m.hourly_rate || '50.000'}</td>
                                <td className="p-4 text-slate-600">{m.phone}</td>
                                <td className="p-4">
                                  <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors">Kirim Kredensial WA</button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Tab Keuangan Dummy */}
                {(adminTab === 'payments' || adminTab === 'payroll') && (
                  <div className="animate-in fade-in h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <AlertCircle size={32} className="text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      {adminTab === 'payments' ? 'Pencatatan Pembayaran Termin' : 'Sistem Penggajian Otomatis'}
                    </h3>
                    <p className="text-slate-500 max-w-md">Modul ini siap dihubungkan ke tabel database untuk memproses perhitungan secara real-time.</p>
                  </div>
                )}

                {adminTab === 'modules' && (
                  <div className="animate-in fade-in">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                      <h3 className="text-xl font-bold text-slate-900">Inventaris Modul</h3>
                      <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-sm">
                        <Plus size={16} /> Tambah Modul
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {[
                        { title: "Matematika SD 6", stock: 25, cat: "SD" },
                        { title: "Fisika SMP 9", stock: 18, cat: "SMP" },
                        { title: "UTBK SNBT Saintek", stock: 40, cat: "SMA" }
                      ].map((mod, idx) => (
                        <div key={idx} className="border border-slate-200 rounded-2xl p-5 hover:border-indigo-300 transition-colors group">
                          <div className="flex justify-between items-start mb-3">
                            <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">{mod.cat}</span>
                            <button className="text-slate-400 group-hover:text-indigo-600"><Edit size={14}/></button>
                          </div>
                          <h4 className="font-bold text-slate-800 text-lg leading-tight mb-4">{mod.title}</h4>
                          <div className="bg-slate-50 rounded-xl p-3 flex justify-between items-center border border-slate-100">
                            <span className="text-xs font-semibold text-slate-500">Stok Fisik</span>
                            <span className="text-lg font-black text-slate-900">{mod.stock}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 4. PORTAL GURU / MENTOR (Dashboard Layout) */}
        {view === 'teacher' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Portal Ruang Mentor</h2>
              <p className="text-sm text-slate-500 mt-1">Kelola presensi, evaluasi siswa, dan akses materi ajar Anda di sini.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
              {/* Sidebar Menu - Responsive */}
              <div className="w-full md:w-64 lg:w-72 flex-shrink-0">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 md:p-4 sticky top-28 flex flex-row md:flex-col gap-2 overflow-x-auto no-scrollbar scroll-smooth">
                  {[
                    { id: 'overview', label: 'Ringkasan Kelas', icon: Calendar },
                    { id: 'attendance', label: 'Presensi & Jurnal', icon: CheckCircle },
                    { id: 'modules', label: 'Modul Referensi', icon: BookOpen },
                    { id: 'profile', label: 'Pengaturan Akun', icon: Lock }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = teacherTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setTeacherTab(tab.id)}
                        className={`flex items-center whitespace-nowrap space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 w-full ${
                          isActive 
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 translate-x-0 md:translate-x-1' 
                            : 'bg-transparent text-slate-600 hover:bg-slate-50 hover:text-emerald-600'
                        }`}
                      >
                        <Icon size={18} className={isActive ? 'text-emerald-100' : 'text-slate-400'} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 p-6 lg:p-8 min-h-[500px] overflow-hidden">
                
                {teacherTab === 'overview' && (
                  <div className="animate-in fade-in space-y-8">
                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-3xl p-6 lg:p-8 text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div>
                        <span className="bg-white/20 text-emerald-50 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm border border-white/10">Profil Mentor</span>
                        <h3 className="text-2xl md:text-3xl font-extrabold mt-3">{user?.name}</h3>
                        <p className="text-emerald-100 text-sm mt-2 flex items-center gap-2"><Phone size={14}/> {user?.phone} &nbsp;|&nbsp; {user?.email}</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 text-center min-w-[140px]">
                        <span className="text-xs text-emerald-100 block font-semibold uppercase mb-1">Sesi Diampu</span>
                        <span className="text-4xl font-black text-white tracking-tighter">8<span className="text-xl font-medium text-emerald-200 ml-1">sesi</span></span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2"><Clock className="text-emerald-500" size={20}/> Jadwal Terdekat</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {[
                          { student: "Ahmad Fauzan", level: "SD - Reguler", progress: "Sesi 5 dari 12", nextSchedule: "Senin, 15:00 WIB" },
                          { student: "Siti Aminah", level: "SMP - Intensif", progress: "Sesi 9 dari 12", nextSchedule: "Selasa, 16:30 WIB" }
                        ].map((item, i) => (
                          <div key={i} className="border border-slate-200 rounded-2xl p-5 hover:border-emerald-300 hover:shadow-md transition-all group bg-slate-50/30">
                            <div className="flex justify-between items-center mb-3">
                              <span className="font-bold text-slate-800 text-base group-hover:text-emerald-700 transition-colors">{item.student}</span>
                              <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-bold border border-emerald-200">{item.level}</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-1.5 mb-2 mt-4">
                              <div className="bg-emerald-500 h-1.5 rounded-full" style={{width: '60%'}}></div>
                            </div>
                            <p className="text-xs text-slate-500 font-medium">Progres: {item.progress}</p>
                            
                            <div className="mt-5 pt-4 border-t border-slate-200 flex justify-between items-center text-sm">
                              <span className="text-slate-500">Jadwal:</span>
                              <span className="font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">{item.nextSchedule}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {teacherTab === 'attendance' && (
                  <div className="animate-in fade-in max-w-2xl">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Presensi & Jurnal Kelas</h3>
                    <p className="text-sm text-slate-500 mb-8">Pilih siswa dan catat pokok bahasan materi secara ringkas pada setiap pertemuan.</p>
                    
                    <form onSubmit={handleSaveAttendance} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Pilih Siswa / Kelas</label>
                          <select 
                            value={attendanceForm.studentId}
                            onChange={(e) => setAttendanceForm({...attendanceForm, studentId: e.target.value})}
                            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all"
                            required
                          >
                            <option value="">-- Pilih Siswa --</option>
                            <option value="1">Ahmad Fauzan (SD - Reguler)</option>
                            <option value="2">Siti Aminah (SMP - Intensif)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Pertemuan Ke-</label>
                          <select 
                            value={attendanceForm.sessionNumber}
                            onChange={(e) => setAttendanceForm({...attendanceForm, sessionNumber: e.target.value})}
                            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all"
                          >
                            {[...Array(12)].map((_, i) => (
                              <option key={i+1} value={i+1}>Sesi {i+1} dari 12</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Status Kehadiran</label>
                        <select 
                          value={attendanceForm.status}
                          onChange={(e) => setAttendanceForm({...attendanceForm, status: e.target.value})}
                          className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all"
                        >
                          <option value="Hadir">Hadir</option>
                          <option value="Izin">Izin</option>
                          <option value="Alpha">Tanpa Keterangan</option>
                          <option value="Kelas Pengganti">Kelas Pengganti (Makeup)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Jurnal Materi Pembelajaran</label>
                        <textarea 
                          rows="4" 
                          required
                          value={attendanceForm.journal}
                          onChange={(e) => setAttendanceForm({...attendanceForm, journal: e.target.value})}
                          className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                          placeholder="Contoh: Membahas bab tata surya, siswa aktif bertanya tentang planet Mars..."
                        ></textarea>
                      </div>
                      <button type="submit" className="bg-emerald-600 text-white font-bold px-8Berikut adalah pembaruan kode React dengan penyesuaian tata letak menggunakan Tailwind CSS agar lebih responsif, rapi di perangkat seluler, dan memiliki area sentuh (touch target) yang lebih nyaman. Semua fungsi navigasi, state, dan logika aplikasi tetap dipertahankan sesuai kode sumber asli[cite: 1].

```jsx
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
const SUPABASE_URL = '[https://your-supabase-url.supabase.co](https://your-supabase-url.supabase.co)';
const SUPABASE_ANON_KEY = 'your-supabase-anon-key';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function App() {
  const [view, setView] = useState('landing'); 
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [students, setStudents] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [modules, setModules] = useState([]);

  const [regForm, setRegForm] = useState({
    name: '',
    parentName: '',
    phone: '',
    package: 'Reguler (12 Sesi)',
    level: 'SD'
  });

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [adminTab, setAdminTab] = useState('students'); 
  const [teacherTab, setTeacherTab] = useState('overview'); 
  const [passForm, setPassForm] = useState({ oldPass: '', newPass: '', confirmPass: '' });
  
  const [attendanceForm, setAttendanceForm] = useState({
    studentId: '',
    sessionNumber: '1',
    status: 'Hadir',
    journal: ''
  });

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

  const handleRegister = (e) => {
    e.preventDefault();
    const adminPhone = "6281234567890"; 
    const message = `Halo Admin Bimbel ErHa, saya ingin mendaftarkan siswa baru:\n\nNama Siswa: ${regForm.name}\nNama Wali: ${regForm.parentName}\nNo. HP/WA: ${regForm.phone}\nJenjang: ${regForm.level}\nPaket: ${regForm.package}\n\nMohon informasinya lebih lanjut. Terima kasih!`;
    const whatsappUrl = `[https://wa.me/$](https://wa.me/$){adminPhone}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    alert("Pendaftaran berhasil dikirim ke WhatsApp Admin!");
    setRegForm({ name: '', parentName: '', phone: '', package: 'Reguler (12 Sesi)', level: 'SD' });
  };

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
    setMobileMenuOpen(false);
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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col justify-between overflow-x-hidden">
      
      {/* NAVBAR UTAMA */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setView('landing')}>
            <img src="/logo.png" alt="Logo Bimbel ErHa" className="h-10 w-10 md:h-12 md:w-12 object-contain" />
            <div>
              <h1 className="text-lg md:text-xl font-bold text-indigo-900 leading-tight">Bimbel ErHa</h1>
              <p className="hidden sm:block text-xs text-slate-500 font-medium">Rumah Hebat Belajar & Berprestasi</p>
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
                  className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow-sm"
                >
                  Login Portal
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.role === 'teacher' ? 'Mentor' : 'Admin'}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 bg-rose-50 text-rose-600 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-rose-100 transition"
                >
                  <LogOut size="{16}"/>
                  <span>Keluar</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-600 hover:bg-slate-100 p-2 rounded-lg focus:outline-none transition">
              {mobileMenuOpen ? <X size="{24}"/> : <Menu size="{24}"/>}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute w-full bg-white border-b shadow-lg px-4 pt-2 pb-6 space-y-4 z-50">
            {view === 'landing' ? (
              <>
                <a href="#packages" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-2 text-base font-medium text-slate-600">Paket Belajar</a>
                <a href="#register" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-2 text-base font-medium text-slate-600">Pendaftaran</a>
                <button 
                  onClick={() => { setView('login'); setMobileMenuOpen(false); }} 
                  className="w-full bg-indigo-600 text-white py-3.5 rounded-xl text-sm font-semibold text-center mt-2 shadow-sm"
                >
                  Login Portal
                </button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="px-2 py-2 bg-slate-50 rounded-lg">
                  <p className="text-sm font-bold text-slate-800">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.role === 'teacher' ? 'Mentor' : 'Admin'}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-full bg-rose-50 text-rose-600 py-3.5 rounded-xl text-sm font-semibold text-center flex items-center justify-center space-x-2"
                >
                  <LogOut size="{18}"/>
                  <span>Keluar</span>
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* KONTEN UTAMA BERDASARKAN VIEW */}
      <main className="flex-grow">
        
        {/* 1. LANDING PAGE */}
        {view === 'landing' && (
          <div>
            <section className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white py-16 md:py-24 px-4">
              <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6 text-center lg:text-left">
                  <span className="inline-block bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full border border-indigo-400/30">
                    Bimbingan Belajar Profesional
                  </span>
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                    Wujudkan Prestasi <br className="hidden lg:block" />Gemilang Bersama <span className="text-indigo-400">Bimbel ErHa</span>
                  </h2>
                  <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto lg:mx-0">
                    Rumah belajar interaktif dengan metode pembelajaran modern, mentor berpengalaman, dan modul terlengkap untuk tingkat SD, SMP, hingga SMA.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
                    <a href="#register" className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-8 py-3.5 rounded-xl text-center transition shadow-lg shadow-indigo-500/30">
                      Daftar Sekarang
                    </a>
                    <a href="#packages" className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3.5 rounded-xl text-center transition border border-white/10">
                      Lihat Paket
                    </a>
                  </div>
                </div>
                <div className="flex justify-center mt-8 lg:mt-0">
                  <img src="/logo.png" alt="Illustration" className="max-w-[200px] md:max-w-sm drop-shadow-2xl animate-pulse" />
                </div>
              </div>
            </section>

            <section id="packages" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
                <h3 className="text-2xl md:text-4xl font-bold text-slate-900">Pilihan Paket Belajar</h3>
                <p className="text-slate-600 mt-4 text-sm md:text-base">Pilih paket bimbingan yang sesuai dengan kebutuhan akademik putra/putri Anda.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {[
                  { name: "Reguler", sessions: "12 Sesi / Periode", price: "Rp 350.000", desc: "Cocok untuk pendampingan rutin mingguan mata pelajaran sekolah." },
                  { name: "Intensif", sessions: "24 Sesi / Periode", price: "Rp 650.000", desc: "Fokus persiapan ujian sekolah dan pemahaman konsep mendalam." },
                  { name: "Privat Eksklusif", sessions: "12 Sesi (1-on-1)", price: "Rp 950.000", desc: "Mentor datang ke rumah atau jadwal fleksibel sesuai kebutuhan siswa." }
                ].map((pkg, idx) => (
                  <div key={idx} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition duration-300">
                    <div>
                      <div className="text-indigo-600 font-bold text-sm tracking-wide uppercase">{pkg.name}</div>
                      <div className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-3">{pkg.price}</div>
                      <div className="text-sm font-semibold text-slate-500 mt-1">{pkg.sessions}</div>
                      <p className="text-slate-600 text-sm mt-6 leading-relaxed">{pkg.desc}</p>
                    </div>
                    <a href="#register" className="mt-8 block w-full text-center bg-slate-50 hover:bg-indigo-600 hover:text-white text-slate-700 font-bold py-3.5 rounded-xl transition text-sm border border-slate-100">
                      Pilih Paket Ini
                    </a>
                  </div>
                ))}
              </div>
            </section>

            <section id="register" className="py-16 md:py-24 bg-slate-100/70 border-t border-slate-200/60 px-4">
              <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/80 p-6 sm:p-10 md:p-12">
                  <div className="text-center mb-10">
                    <h3 className="text-2xl md:text-3xl font-bold text-slate-900">Formulir Pendaftaran Siswa</h3>
                    <p className="text-slate-500 text-sm md:text-base mt-2">Isi data di bawah ini, formulir akan terhubung ke WhatsApp Admin.</p>
                  </div>
                  <form onSubmit={handleRegister} className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Nama Lengkap Siswa</label>
                      <input 
                        type="text" 
                        required 
                        value={regForm.name} 
                        onChange={(e) => setRegForm({...regForm, name: e.target.value})}
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        placeholder="Contoh: Ahmad Fauzan" 
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Nama Orang Tua / Wali</label>
                        <input 
                          type="text" 
                          required 
                          value={regForm.parentName} 
                          onChange={(e) => setRegForm({...regForm, parentName: e.target.value})}
                          className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                          placeholder="Contoh: Budi Santoso" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-2">No. WhatsApp Aktif</label>
                        <input 
                          type="tel" 
                          required 
                          value={regForm.phone} 
                          onChange={(e) => setRegForm({...regForm, phone: e.target.value})}
                          className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                          placeholder="Contoh: 08123456789" 
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Jenjang Pendidikan</label>
                        <select 
                          value={regForm.level} 
                          onChange={(e) => setRegForm({...regForm, level: e.target.value})}
                          className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                        >
                          <option value="SD">Sekolah Dasar (SD)</option>
                          <option value="SMP">Sekolah Menengah Pertama (SMP)</option>
                          <option value="SMA">Sekolah Menengah Atas (SMA)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Pilihan Paket</label>
                        <select 
                          value={regForm.package} 
                          onChange={(e) => setRegForm({...regForm, package: e.target.value})}
                          className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                        >
                          <option value="Reguler (12 Sesi)">Reguler (12 Sesi)</option>
                          <option value="Intensif (24 Sesi)">Intensif (24 Sesi)</option>
                          <option value="Privat Eksklusif">Privat Eksklusif</option>
                        </select>
                      </div>
                    </div>
                    <div className="pt-2">
                      <button 
                        type="submit" 
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-2 text-sm md:text-base"
                      >
                        <Send size="{20}"/>
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
          <div className="max-w-md mx-auto py-16 md:py-24 px-4">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-10">
              <div className="text-center mb-8">
                <img src="/logo.png" alt="Logo" className="h-20 w-20 mx-auto mb-4 object-contain" />
                <h3 className="text-2xl font-bold text-slate-900">Portal ErHa</h3>
                <p className="text-sm text-slate-500 mt-2">Masuk sebagai Admin atau Mentor</p>
                <div className="mt-4 bg-indigo-50 border border-indigo-100 text-indigo-800 p-4 rounded-xl text-xs text-left space-y-2">
                  <p><b>Admin:</b> admin@erha.com / admin123</p>
                  <p><b>Guru:</b> guru@erha.com / guru123</p>
                </div>
              </div>
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Email Akun</label>
                  <input 
                    type="email" 
                    required 
                    value={loginForm.email} 
                    onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="admin@erha.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Kata Sandi</label>
                  <input 
                    type="password" 
                    required 
                    value={loginForm.password} 
                    onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="••••••••"
                  />
                </div>
                <div className="pt-2 space-y-3">
                  <button 
                    type="submit" 
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition text-sm shadow-md"
                  >
                    Masuk Portal
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setView('landing')} 
                    className="w-full bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold py-3.5 rounded-xl border border-slate-200 transition text-sm"
                  >
                    Kembali ke Beranda
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 3. PORTAL ADMIN */}
        {view === 'admin' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-6 border-b border-slate-200 pb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Panel Admin</h2>
                <p className="text-sm text-slate-500 mt-1">Kelola data operasional Bimbingan Belajar ErHa.</p>
              </div>
              {/* Tab Navigation responsif yang dapat di-scroll horizontal di mobile */}
              <div className="flex overflow-x-auto lg:overflow-visible gap-2 pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 lg:flex-wrap hide-scrollbar">
                {[
                  { id: 'students', label: 'Siswa', icon: Users },
                  { id: 'mentors', label: 'Mentor', icon: UserCheck },
                  { id: 'payments', label: 'Keuangan', icon: DollarSign },
                  { id: 'payroll', label: 'Payroll', icon: Shield },
                  { id: 'modules', label: 'Modul', icon: Package }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setAdminTab(tab.id)}
                      className={`flex items-center space-x-2 px-5 py-3 rounded-xl text-sm font-semibold transition whitespace-nowrap shrink-0 ${
                        adminTab === tab.id 
                          ? 'bg-indigo-600 text-white shadow-md' 
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <Icon size="{18}"/>
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 lg:p-8 min-h-[500px]">
              {adminTab === 'students' && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                    <h3 className="text-lg md:text-xl font-bold text-slate-900">Daftar Siswa & Sesi Belajar</h3>
                    <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition w-full sm:w-auto shadow-sm">
                      + Tambah Siswa
                    </button>
                  </div>
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <div className="min-w-[800px] px-4 sm:px-0">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
                          <tr>
                            <th className="p-4 rounded-tl-xl">Nama Siswa</th>
                            <th className="p-4">Jenjang</th>
                            <th className="p-4">Paket</th>
                            <th className="p-4">Sisa Sesi</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 rounded-tr-xl text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {students.length === 0 ? (
                            <tr>
                              <td colSpan="6" className="text-center py-10 text-slate-400 bg-slate-50/30">
                                Belum ada data siswa. (Data dummy: Ahmad Fauzan - SD - Reguler)
                              </td>
                            </tr>
                          ) : (
                            students.map((s, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/60 transition">
                                <td className="p-4 font-bold text-slate-800">{s.name}</td>
                                <td className="p-4 text-slate-600">{s.level}</td>
                                <td className="p-4 text-slate-600">{s.package}</td>
                                <td className="p-4 font-bold text-indigo-600 bg-indigo-50/30">{s.remaining_sessions || 12} Sesi</td>
                                <td className="p-4">
                                  <span className="bg-emerald-100 text-emerald-700 text-xs px-3 py-1.5 rounded-full font-bold">Aktif</span>
                                </td>
                                <td className="p-4 space-x-3 text-right">
                                  <button className="text-indigo-600 hover:text-indigo-800 font-bold text-sm">Edit</button>
                                  <button className="text-rose-600 hover:text-rose-800 font-bold text-sm">Hapus</button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ... Bagian konten Admin lainnya tidak dirubah strukturnya, hanya ditambah padding responsif ... */}
              {adminTab === 'mentors' && (
                <div>
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                    <h3 className="text-lg md:text-xl font-bold text-slate-900">Manajemen Mentor</h3>
                    <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow-sm">
                      + Tambah Mentor
                    </button>
                  </div>
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <div className="min-w-[700px] px-4 sm:px-0">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
                          <tr>
                            <th className="p-4 rounded-tl-xl">Nama Mentor</th>
                            <th className="p-4">Spesialisasi</th>
                            <th className="p-4">Tarif / Jam</th>
                            <th className="p-4">Kontak</th>
                            <th className="p-4 rounded-tr-xl text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {mentors.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="text-center py-10 text-slate-400">Belum ada data mentor.</td>
                            </tr>
                          ) : (
                            mentors.map((m, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/60">
                                <td className="p-4 font-bold text-slate-800">{m.name}</td>
                                <td className="p-4 text-slate-600">{m.specialization}</td>
                                <td className="p-4 font-bold text-slate-800">Rp {m.hourly_rate || '50.000'}</td>
                                <td className="p-4 text-slate-600">{m.phone}</td>
                                <td className="p-4 text-right">
                                  <button className="text-indigo-600 hover:text-indigo-800 font-bold text-sm bg-indigo-50 px-3 py-1.5 rounded-lg">Kirim WA</button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {adminTab === 'payments' && (
                <div className="py-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Pencatatan Pembayaran Termin</h3>
                  <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 border-dashed text-center">
                    <DollarSign className="mx-auto text-slate-300 mb-3" size="{40}"/>
                    <p className="text-slate-500">Modul pembayaran siap dihubungkan ke database termin pembayaran.</p>
                  </div>
                </div>
              )}

              {adminTab === 'payroll' && (
                <div className="py-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Penggajian Mentor (Payroll)</h3>
                  <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 border-dashed text-center">
                    <Shield className="mx-auto text-slate-300 mb-3" size="{40}"/>
                    <p className="text-slate-500">Perhitungan otomatis gaji berdasarkan presensi mengajar terintegrasi.</p>
                  </div>
                </div>
              )}

              {adminTab === 'modules' && (
                <div>
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                    <h3 className="text-lg md:text-xl font-bold text-slate-900">Inventaris Modul</h3>
                    <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">
                      + Tambah Modul
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[
                      { title: "Modul Matematika SD Kelas 6", stock: 25 },
                      { title: "Modul Fisika SMP Kelas 9", stock: 18 },
                      { title: "Modul UTBK SNBT Saintek", stock: 40 }
                    ].map((mod, idx) => (
                      <div key={idx} className="border border-slate-200 rounded-2xl p-6 bg-slate-50/50 flex justify-between items-center hover:border-indigo-200 transition shadow-sm">
                        <div>
                          <h4 className="font-bold text-slate-800">{mod.title}</h4>
                          <span className="text-sm text-slate-500 mt-1 block">Stok Tersedia: <b className="text-indigo-600">{mod.stock} pcs</b></span>
                        </div>
                        <button className="bg-white border border-slate-200 p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 transition">
                          <Edit size="{16}"/>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. PORTAL GURU / MENTOR */}
        {view === 'teacher' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-6 border-b border-slate-200 pb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Portal Mentor</h2>
                <p className="text-sm text-slate-500 mt-1">Kelola kelas, jurnal mengajar, dan materi ajar.</p>
              </div>
              <div className="flex overflow-x-auto lg:overflow-visible gap-2 pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 lg:flex-wrap hide-scrollbar">
                {[
                  { id: 'overview', label: 'Ringkasan', icon: Calendar },
                  { id: 'attendance', label: 'Jurnal Kelas', icon: CheckCircle },
                  { id: 'modules', label: 'Materi Ajar', icon: BookOpen },
                  { id: 'profile', label: 'Akun', icon: Lock }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setTeacherTab(tab.id)}
                      className={`flex items-center space-x-2 px-5 py-3 rounded-xl text-sm font-semibold transition whitespace-nowrap shrink-0 ${
                        teacherTab === tab.id 
                          ? 'bg-indigo-600 text-white shadow-md' 
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <Icon size="{18}"/>
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 lg:p-8 min-h-[500px]">
              
              {teacherTab === 'overview' && (
                <div className="space-y-8">
                  <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                      <span className="inline-block bg-indigo-600 text-white text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider mb-3">
                        Status Mentor Aktif
                      </span>
                      <h3 className="text-2xl font-extrabold text-slate-900">{user?.name}</h3>
                      <p className="text-sm text-slate-600 mt-1 flex items-center gap-4">
                        <span>{user?.email}</span>
                        <span className="hidden sm:inline-block border-l h-4 border-indigo-200"></span>
                        <span>{user?.phone}</span>
                      </p>
                    </div>
                    <div className="bg-white px-6 py-4 rounded-2xl border border-indigo-100 shadow-sm text-center w-full md:w-auto">
                      <span className="text-xs text-slate-400 block font-bold uppercase mb-1">Total Sesi Bulan Ini</span>
                      <span className="text-3xl font-extrabold text-indigo-600">8 Sesi</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-lg mb-4">Jadwal Pertemuan Mendatang</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { student: "Ahmad Fauzan", level: "SD - Reguler", progress: "Sesi 5 dari 12", nextSchedule: "Senin, 15:00 WIB" },
                        { student: "Siti Aminah", level: "SMP - Intensif", progress: "Sesi 9 dari 12", nextSchedule: "Selasa, 16:30 WIB" }
                      ].map((item, i) => (
                        <div key={i} className="border border-slate-200 rounded-2xl p-6 bg-slate-50 hover:bg-white hover:border-indigo-200 transition shadow-sm">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h5 className="font-bold text-slate-800 text-lg">{item.student}</h5>
                              <p className="text-sm text-slate-500 mt-1">Progres: <b className="text-indigo-600">{item.progress}</b></p>
                            </div>
                            <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-bold">{item.level}</span>
                          </div>
                          <div className="pt-4 border-t border-slate-200/80 flex justify-between items-center text-sm">
                            <span className="text-slate-500 flex items-center gap-1.5"><Clock size="{16}"/> Jadwal Selanjutnya</span>
                            <span className="font-bold text-slate-900 bg-white border px-3 py-1 rounded-lg">{item.nextSchedule}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {teacherTab === 'attendance' && (
                <div className="max-w-2xl">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Input Jurnal & Presensi Sesi</h3>
                  <p className="text-sm text-slate-500 mb-8">Pilih siswa, catat kehadiran, dan isi ringkasan materi pembelajaran yang telah disampaikan.</p>
                  
                  <form onSubmit={handleSaveAttendance} className="space-y-6 bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Pilih Siswa</label>
                        <select 
                          value={attendanceForm.studentId}
                          onChange={(e) => setAttendanceForm({...attendanceForm, studentId: e.target.value})}
                          className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                          required
                        >
                          <option value="">-- Pilih Siswa --</option>
                          <option value="1">Ahmad Fauzan (SD - Reguler)</option>
                          <option value="2">Siti Aminah (SMP - Intensif)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Pertemuan Ke-</label>
                        <select 
                          value={attendanceForm.sessionNumber}
                          onChange={(e) => setAttendanceForm({...attendanceForm, sessionNumber: e.target.value})}
                          className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                          {[...Array(12)].map((_, i) => (
                            <option key={i+1} value={i+1}>Sesi {i+1} dari 12</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Status Kehadiran</label>
                      <select 
                        value={attendanceForm.status}
                        onChange={(e) => setAttendanceForm({...attendanceForm, status: e.target.value})}
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        <option value="Hadir">Hadir</option>
                        <option value="Izin">Izin</option>
                        <option value="Alpha">Alpha</option>
                        <option value="Kelas Pengganti">Kelas Pengganti (Makeup Class)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Jurnal Materi Pembelajaran</label>
                      <textarea 
                        rows="4" 
                        required
                        value={attendanceForm.journal}
                        onChange={(e) => setAttendanceForm({...attendanceForm, journal: e.target.value})}
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                        placeholder="Detail materi yang diajarkan, latihan soal yang dibahas, dan catatan perkembangan siswa..."
                      ></textarea>
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 text-white font-bold px-6 py-4 rounded-xl text-sm md:text-base hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20">
                      Simpan Data Pertemuan
                    </button>
                  </form>
                </div>
              )}

              {teacherTab === 'modules' && (
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Pustaka Materi Ajar</h3>
                  <p className="text-sm text-slate-500 mb-8">Unduh modul berformat PDF sebagai referensi pengajaran.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { title: "Modul Matematika SD Kelas 6", desc: "Materi aritmatika dan geometri." },
                      { title: "Modul Fisika SMP Kelas 9", desc: "Kelistrikan dan gaya magnet." },
                      { title: "Modul UTBK SNBT Saintek", desc: "Kumpulan soal penalaran kuantitatif." }
                    ].map((mod, idx) => (
                      <div key={idx} className="border border-slate-200 rounded-3xl p-6 bg-slate-50 flex flex-col justify-between hover:border-indigo-300 transition group">
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <BookOpen className="text-indigo-600" size="{16}"/>
                            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Modul Referensi</span>
                          </div>
                          <h4 className="font-bold text-base text-slate-900">{mod.title}</h4>
                          <p className="text-sm text-slate-500 mt-2">{mod.desc}</p>
                        </div>
                        <button className="mt-6 w-full bg-white border border-indigo-200 text-indigo-700 font-bold py-2.5 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition text-sm">
                          Unduh PDF
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {teacherTab === 'profile' && (
                <div className="max-w-md">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Keamanan Akun</h3>
                  <p className="text-sm text-slate-500 mb-8">Perbarui kata sandi portal mentor Anda di bawah ini.</p>
                  
                  <form onSubmit={handleChangePassword} className="space-y-5 bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-100">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Password Saat Ini</label>
                      <input 
                        type="password" 
                        required
                        value={passForm.oldPass}
                        onChange={(e) => setPassForm({...passForm, oldPass: e.target.value})}
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Password Baru</label>
                      <input 
                        type="password" 
                        required
                        value={passForm.newPass}
                        onChange={(e) => setPassForm({...passForm, newPass: e.target.value})}
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Ulangi Password Baru</label>
                      <input 
                        type="password" 
                        required
                        value={passForm.confirmPass}
                        onChange={(e) => setPassForm({...passForm, confirmPass: e.target.value})}
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                        placeholder="••••••••"
                      />
                    </div>
                    <button type="submit" className="w-full bg-slate-800 text-white font-bold py-4 rounded-xl text-sm hover:bg-slate-900 transition mt-2">
                      Perbarui Kata Sandi
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-slate-500 font-medium">
            &copy; {new Date().getFullYear()} <span className="text-indigo-700 font-bold">Bimbel ErHa</span> (Rumah Hebat). Seluruh Hak Cipta Dilindungi.
          </p>
        </div>
      </footer>

    </div>
  );
}
