import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/landing/LandingPage';
import FormPendaftaran from './pages/landing/FormPendaftaran';
import FormIzin from './pages/landing/FormIzin';
import DashboardAdmin from './pages/admin/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/daftar" element={<FormPendaftaran />} />
        <Route path="/izin" element={<FormIzin />} />

        {/* Admin Dashboard Route */}
        <Route path="/admin/*" element={<DashboardAdmin />} />
      </Routes>
    </Router>
  );
}

export default App;
