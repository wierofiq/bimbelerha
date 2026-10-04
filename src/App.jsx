import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  BookOpen, Users, DollarSign, UserCheck, Package, 
  LogOut, Lock, CheckCircle, Clock, AlertCircle, 
  Send, Phone, Calendar, Plus, Edit, Trash2, Shield, Menu, X, LayoutDashboard
} from 'lucide-react';

// ==========================================
// KONFIGURASI SUPABASE
// ==========================================
const supabaseUrl = 'https://izifwpviqpyxauafdlge.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6aWZ3cHZpcXB5eGF1YWZkbGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NDA2ODYsImV4cCI6MjEwNjUxNjY4Nn0.XpJEgQ3vpGOYmPVi-nsjrSRJI9RfR5kWTN_XsL-TCUU';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function App() {
  const [view, setView] = useState('landing'); 
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Data Master
  const [students, setStudents] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [modules, setModules] = useState([]);

  // Forms
  const [regForm, setRegForm] = useState({ name: '', parentName: '', phone: '', package: 'Reguler (12 Sesi)', level: 'SD' });
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [attendanceForm, setAttendanceForm] = useState({ studentId: '', sessionNumber: '1', status: 'Hadir', journal: '' });
  const [passForm, setPassForm] = useState({ oldPass: '', newPass: '', confirmPass: '' });
  
  // Tabs
  const [adminTab, setAdminTab] = useState('students'); 
  const [teacherTab, setTeacherTab] = useState('overview'); 

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const { data: studentData } = await supabase.from('students').select('*');
      if (studentData) setStudents(studentData);

      const { data: mentorData } = await supabase.from('mentors').select('*');
      if (mentorData) setMentors(mentorData);

      const { data: moduleData } = await supabase.from('modules').select('*');
      if (moduleData) setModules(moduleData);
    } catch (err) {
      console.error("Gagal memuat data:", err);
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const adminPhone = "6281234567890"; 
    const message = `Halo Admin Bimbel ErHa, saya mendaftarkan siswa:\n\nNama: ${regForm.name}\nWali: ${regForm.parentName}\nNo. HP: ${regForm.phone}\nJenjang: ${regForm.level}\nPaket: ${regForm.package}`;
    window.open(`https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`, '_blank');
    alert("Dialihkan ke WhatsApp Admin!");
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
      alert("Email atau Password salah!");
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
    alert(`Presensi Sesi ke-${attendanceForm.sessionNumber} berhasil disimpan!`);
    setAttendanceForm({ studentId: '', sessionNumber: '1', status: 'Hadir', journal: '' });
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (passForm.newPass !== passForm.confirmPass) return alert("Konfirmasi password tidak sesuai!");
    alert("Kata sandi berhasil diperbarui!");
    setPassForm({ oldPass: '', newPass: '', confirmPass: '' });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      
      {/* NAVBAR */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setView('landing')}>
            <div className="bg-indigo-600 text-white p-2 rounded-xl">
              <LayoutDashboard size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-indigo-900 leading-tight">Bimbel ErHa</h1>
              <p className="text-xs text-slate-500 font-medium">Rumah Hebat Belajar</p>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {view === 'landing' ? (
              <>
                <a href="#packages" className="text-sm font-semibold text-slate-600 hover:text-indigo-600">Paket</a>
                <a href="#register" className="text-sm font-semibold text-slate-600 hover:text-indigo-600">Daftar</a>
                <button onClick={() => setView('login')} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700">
                  Login Portal
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-5">
                <span className="text-sm font-medium text-slate-600">
                  Halo, <b className="text-indigo-900">{user?.name}</b>
                </span>
                <button onClick={handleLogout} className="flex items-center space-x-1.5 text-rose-500 hover:text-rose-700 text-sm font-semibold">
                  <LogOut size={16} /><span>Keluar</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-600 p-2">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b px-4 py-4 space-y-4 shadow-md absolute w-full z-40">
          {view === 'landing' ? (
            <>
              <button onClick={() => { setView('login'); setMobileMenuOpen(false); }} className="w-full bg-indigo-600 text-white py-3 rounded-xl text-sm font-semibold">
                Login Portal
              </button>
            </>
          ) : (
            <button onClick={handleLogout} className="w-full bg-rose-50 text-rose-600 py-3 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2">
              <LogOut size={18} /><span>Keluar</span>
            </button>
          )}
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-grow">
        
        {/* 1. LANDING PAGE */}
        {view === 'landing' && (
          <div className="animate-in fade-in">
            {/* Hero Section */}
            <section className="bg-slate-900 text-white py-20 px-4 text-center">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Bangun Prestasi Masa Depan</h2>
              <p className="text-slate-300 text-lg mt-4 max-w-2xl mx-auto">Pendampingan belajar terbaik untuk SD, SMP, hingga SMA.</p>
              <button onClick={() => document.getElementById('register').scrollIntoView()} className="mt-8 bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-8 py-3.5 rounded-xl">
                Daftar Sekarang
              </button>
            </section>

            {/* Registration Form */}
            <section id="register" className="py-20 bg-slate-100 px-4">
              <div className="max-w-3xl mx-auto bg-white rounded-[2rem] shadow-lg border border-slate-200 p-8 md:p-12">
                <h3 className="text-2xl font-bold text-center mb-8">Formulir Pendaftaran</h3>
                <form onSubmit={handleRegister} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Nama Siswa</label>
                    <input type="text" required value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Nama Wali</label>
                      <input type="text" required value={regForm.parentName} onChange={e => setRegForm({...regForm, parentName: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-2">WhatsApp</label>
                      <input type="tel" required value={regForm.phone} onChange={e => setRegForm({...regForm, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200" />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2">
                    <Send size={18} /> Kirim via WhatsApp
                  </button>
                </form>
              </div>
            </section>
          </div>
        )}

        {/* 2. LOGIN PAGE */}
        {view === 'login' && (
          <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
            <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8 w-full max-w-md">
              <h3 className="text-2xl font-bold text-center mb-6">Akses Portal</h3>
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Email</label>
                  <input type="email" required value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Password</label>
                  <input type="password" required value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200" />
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl">Masuk</button>
              </form>
            </div>
          </div>
        )}

        {/* 3. ADMIN PORTAL */}
        {view === 'admin' && (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-6">Panel Utama Admin</h2>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-64 flex-shrink-0 flex md:flex-col gap-2 overflow-x-auto pb-2">
                {[
                  { id: 'students', label: 'Siswa', icon: Users },
                  { id: 'mentors', label: 'Mentor', icon: UserCheck },
                  { id: 'modules', label: 'Modul', icon: Package }
                ].map(tab => (
                  <button key={tab.id} onClick={() => setAdminTab(tab.id)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold whitespace-nowrap ${adminTab === tab.id ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
                    <tab.icon size={18} /> {tab.label}
                  </button>
                ))}
              </div>
              <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 overflow-x-auto">
                <h3 className="text-lg font-bold mb-4 uppercase text-slate-700">Data {adminTab}</h3>
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr><th className="p-3">Info Data</th><th className="p-3">Status</th></tr>
                  </thead>
                  <tbody>
                    <tr><td className="p-3">Data {adminTab} belum terhubung ke database.</td><td className="p-3">-</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. TEACHER PORTAL */}
        {view === 'teacher' && (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-6">Ruang Mentor</h2>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-64 flex-shrink-0 flex md:flex-col gap-2 overflow-x-auto pb-2">
                {[
                  { id: 'overview', label: 'Ringkasan', icon: Calendar },
                  { id: 'attendance', label: 'Presensi', icon: CheckCircle }
                ].map(tab => (
                  <button key={tab.id} onClick={() => setTeacherTab(tab.id)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold whitespace-nowrap ${teacherTab === tab.id ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
                    <tab.icon size={18} /> {tab.label}
                  </button>
                ))}
              </div>
              <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                
                {teacherTab === 'overview' ? (
                   <div>
                     <h3 className="text-xl font-bold mb-2">Selamat datang, {user?.name}</h3>
                     <p className="text-slate-600 mb-6">Anda memiliki 8 sesi tersisa bulan ini.</p>
                   </div>
                ) : (
                  <form onSubmit={handleSaveAttendance} className="space-y-6 max-w-lg">
                    <h3 className="text-xl font-bold mb-4">Input Presensi & Jurnal</h3>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Siswa</label>
                      <select required className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white">
                        <option value="">-- Pilih Siswa --</option>
                        <option value="1">Ahmad Fauzan</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Jurnal Materi</label>
                      <textarea required rows="4" className="w-full px-4 py-3 rounded-xl border border-slate-200"></textarea>
                    </div>
                    <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl">Simpan Presensi</button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
