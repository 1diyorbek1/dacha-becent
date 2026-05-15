import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Calendar, PlusCircle, UserCircle, LayoutGrid } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import Landing from './pages/Landing';
import AddDacha from './pages/AddDacha';
import ViewDachas from './pages/ViewDachas';
import Cabinet from './pages/Cabinet';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import AdminPanel from './pages/AdminPanel';
import api from './api';
import HolidayEffects from './components/HolidayEffects';
import { LogOut } from 'lucide-react';
import VerifiedBadge from './components/VerifiedBadge';

function ProtectedRoute({ children }) {
  const user = localStorage.getItem('user');
  if (!user) {
    return <Login />;
  }
  return children;
}

function AppHeader({ settings }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isLanding = location.pathname === '/';
  const user = JSON.parse(localStorage.getItem('user'));

  const siteLogo = settings?.logoUrl || '/logo.jpg';
  const siteName = settings?.siteName || 'Dacha Tour';

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  if (isLanding) return null;

  return (
    <header className="app-header">
      <div className="header-container">
        <NavLink to="/" className="logo">
          <img src={siteLogo} alt={siteName} style={{ height: '45px', objectFit: 'contain' }} />
          <span>{siteName}</span> <VerifiedBadge size={18} />
        </NavLink>

        <nav className="main-nav">
          <NavLink to="/browse" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <LayoutGrid size={18} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
            Browse
          </NavLink>
          {user?.role === 'seller' && (
            <NavLink to="/add" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <PlusCircle size={18} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
              Add
            </NavLink>
          )}
          <NavLink to="/cabinet" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <UserCircle size={18} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
            Cabinet
          </NavLink>
          {!user && (
            <NavLink to="/login" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <UserCircle size={18} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
              Kirish
            </NavLink>
          )}
          {user && (
            <button onClick={handleLogout} className="nav-link" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--danger)' }}>
              <LogOut size={18} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
              Chiqish
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

function BottomNav() {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const user = JSON.parse(localStorage.getItem('user'));
  if (isLanding) return null;

  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <Home size={24} />
        <span>Bosh sahifa</span>
      </NavLink>
      <NavLink to="/browse" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <LayoutGrid size={24} />
        <span>Dachalar</span>
      </NavLink>
      {user?.role === 'seller' && (
        <NavLink to="/add" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <PlusCircle size={24} />
          <span>Qo'shish</span>
        </NavLink>
      )}
      <NavLink to="/cabinet" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <UserCircle size={24} />
        <span>Profil</span>
      </NavLink>
    </nav>
  );
}

function App() {
  const [settings, setSettings] = React.useState(null);

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/api/dachalar/settings');
        setSettings(res.data);
        if (res.data.siteName) document.title = res.data.siteName;
        if (res.data.primaryColor) {
          document.documentElement.style.setProperty('--primary', res.data.primaryColor);
        }
      } catch (e) {
        console.error('Settings fetch error');
      }
    };
    fetchSettings();
  }, []);

  return (
    <Router>
      <Toaster position="top-center" />
      <HolidayEffects mode={settings?.holidayMode} text={settings?.holidayText} />
      <AppHeader settings={settings} />
      <div className="container">
        <main>
          <Routes>
            <Route path="/" element={<ProtectedRoute><Landing settings={settings} /></ProtectedRoute>} />
            <Route path="/browse" element={<ProtectedRoute><ViewDachas /></ProtectedRoute>} />
            <Route path="/add" element={<ProtectedRoute><AddDacha /></ProtectedRoute>} />
            <Route path="/cabinet" element={<ProtectedRoute><Cabinet /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin-panel" element={<AdminPanel />} />
          </Routes>
        </main>
      </div>
      <BottomNav />
    </Router>
  );
}

export default App;
