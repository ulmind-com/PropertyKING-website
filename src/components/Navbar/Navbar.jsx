import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Heart, Bell, Menu, X, User, LogOut, Home, PlusCircle, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location]);

  const isHome = location.pathname === '/';

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''} ${isHome && !scrolled ? 'transparent' : ''}`}>
      <div className="navbar-inner container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">
            <Home size={20} />
          </div>
          <span className="logo-text">Property<span className="logo-accent">KING</span></span>
        </Link>

        {/* Nav Links */}
        <nav className={`navbar-nav ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
          <Link to="/properties" className={`nav-link ${location.pathname === '/properties' ? 'active' : ''}`}>Properties</Link>
          <Link to="/about" className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}>About</Link>

          {/* Mobile-only buttons */}
          <div className="nav-mobile-actions">
            {isAuthenticated ? (
              <>
                <Link to="/favorites" className="nav-link">Favorites</Link>
                <Link to="/list-property" className="nav-link">List Property</Link>
                <Link to="/profile" className="nav-link">Profile</Link>
                <button onClick={logout} className="nav-link" style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline" style={{ width: '100%' }}>Sign In</Link>
                <Link to="/register" className="btn btn-primary" style={{ width: '100%' }}>Get Started</Link>
              </>
            )}
          </div>
        </nav>

        {/* Right Actions */}
        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              <Link to="/favorites" className="nav-action-btn" title="Favorites">
                <Heart size={20} />
              </Link>
              <Link to="/notifications" className="nav-action-btn" title="Notifications">
                <Bell size={20} />
              </Link>
              <Link to="/list-property" className="btn btn-primary btn-sm">
                <PlusCircle size={16} /> List Property
              </Link>

              {/* Profile Dropdown */}
              <div className="profile-dropdown">
                <button className="profile-trigger" onClick={() => setProfileOpen(!profileOpen)}>
                  {user?.avatar ? (
                    <img src={user.avatar} alt="" className="profile-avatar" />
                  ) : (
                    <div className="profile-avatar-placeholder">
                      {user?.full_name?.[0] || 'U'}
                    </div>
                  )}
                  <ChevronDown size={14} />
                </button>
                {profileOpen && (
                  <div className="profile-menu animate-fade-in">
                    <div className="profile-menu-header">
                      <p className="profile-name">{user?.full_name}</p>
                      <p className="profile-email">{user?.email}</p>
                    </div>
                    <div className="profile-menu-divider" />
                    <Link to="/profile" className="profile-menu-item">
                      <User size={16} /> My Profile
                    </Link>
                    <Link to="/my-listings" className="profile-menu-item">
                      <Home size={16} /> My Listings
                    </Link>
                    <Link to="/favorites" className="profile-menu-item">
                      <Heart size={16} /> Favorites
                    </Link>
                    <div className="profile-menu-divider" />
                    <button className="profile-menu-item logout" onClick={logout}>
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Sign In</Link>
              <Link to="/register" className="btn btn-primary">Get Started</Link>
            </>
          )}

          {/* Mobile Menu Toggle */}
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Overlay */}
      {menuOpen && <div className="nav-overlay" onClick={() => setMenuOpen(false)} />}
    </header>
  );
}
