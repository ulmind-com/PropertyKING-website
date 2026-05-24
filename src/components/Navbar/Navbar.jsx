import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, Bell, Menu, X, User, LogOut, Home, PlusCircle, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationAPI } from '../../api';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location]);

  useEffect(() => {
    if (isAuthenticated) {
      const checkUnread = async () => {
        try {
          const res = await notificationAPI.list({ is_read: false, limit: 1 });
          setUnreadCount(res.data?.unread_count ?? res.data?.total ?? 0);
        } catch (e) {}
      };
      checkUnread();
      const interval = setInterval(checkUnread, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, location.pathname]);

  // Sync with Notifications page actions
  useEffect(() => {
    const handleAllRead = () => setUnreadCount(0);
    const handleSingleRead = () => setUnreadCount(prev => Math.max(0, prev - 1));
    
    window.addEventListener('notificationsRead', handleAllRead);
    window.addEventListener('notificationReadSingle', handleSingleRead);
    
    return () => {
      window.removeEventListener('notificationsRead', handleAllRead);
      window.removeEventListener('notificationReadSingle', handleSingleRead);
    };
  }, []);

  const isHome = location.pathname === '/';
  const isTransparent = isHome && !scrolled;

  return (
    <header className={`fixed top-0 left-0 right-0 z-[1000] h-[72px] transition-all duration-300
      ${scrolled ? 'bg-white/95 backdrop-blur-xl shadow-md border-b-transparent' : 'bg-white border-b border-neutral-100'}
      ${isTransparent ? '!bg-transparent !border-b-transparent' : ''}
    `}>
      <div className="container-custom flex items-center justify-between h-full gap-8">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <img src="/logoremovebg.png" alt="PropertyKing" className="h-[38px] w-[38px] object-contain" />
          <span className={`text-[22px] font-extrabold tracking-tight transition-colors
            ${isTransparent ? 'text-white' : 'text-neutral-900'}
          `}>
            Property<span className="font-black">King</span>
          </span>
        </Link>

        {/* Nav Links — Desktop */}
        <nav className={`
          flex items-center gap-1
          max-md:fixed max-md:top-0 max-md:right-0 max-md:w-[280px] max-md:h-screen
          max-md:bg-white max-md:flex-col max-md:items-stretch max-md:pt-20 max-md:px-6 max-md:shadow-xl
          max-md:z-[999] max-md:transition-transform max-md:duration-300
          ${menuOpen ? 'max-md:translate-x-0' : 'max-md:translate-x-full'}
        `}>
          {[
            { path: '/', label: 'Home' },
            { path: '/properties', label: 'Properties' },
            { path: '/map', label: 'Map' },
            { path: '/about', label: 'About' },
          ].map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-all
                ${location.pathname === path
                  ? 'text-neutral-900 bg-neutral-100 font-bold'
                  : `${isTransparent ? 'text-white hover:text-white/80 max-md:text-neutral-500 max-md:hover:text-neutral-900 max-md:hover:bg-neutral-100' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'}`
                }
              `}
            >
              {label}
            </Link>
          ))}

          {/* Mobile-only actions */}
          <div className="hidden max-md:flex flex-col gap-2 mt-4 pt-4 border-t border-neutral-100">
            {isAuthenticated ? (
              <>
                <Link to="/favorites" className="px-4 py-2 text-sm font-medium text-neutral-500 hover:text-neutral-900">Favorites</Link>
                <Link to="/list-property" className="px-4 py-2 text-sm font-medium text-neutral-500 hover:text-neutral-900">List Property</Link>
                <Link to="/profile" className="px-4 py-2 text-sm font-medium text-neutral-500 hover:text-neutral-900">Profile</Link>
                <button onClick={logout} className="px-4 py-2 text-sm font-medium text-red-500 hover:text-red-700 text-left bg-transparent border-none cursor-pointer">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline w-full">Sign In</Link>
                <Link to="/register" className="btn btn-primary w-full">Get Started</Link>
              </>
            )}
          </div>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link to="/favorites" className={`w-10 h-10 flex items-center justify-center rounded-full transition-all max-md:hidden
                ${isTransparent ? 'text-white hover:bg-white/10' : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'}
              `} title="Favorites">
                <Heart size={20} />
              </Link>
              <Link to="/notifications" className={`relative w-10 h-10 flex items-center justify-center rounded-full transition-all max-md:hidden
                ${isTransparent ? 'text-white hover:bg-white/10' : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'}
              `} title="Notifications">
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className={`absolute top-1.5 right-1.5 min-w-[16px] h-[16px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full border-[1.5px] ${isTransparent ? 'border-transparent' : 'border-white'}`}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              <Link to="/list-property" className="btn btn-primary btn-sm max-md:hidden">
                <PlusCircle size={16} /> List Property
              </Link>

              {/* Profile Dropdown */}
              <div className="relative max-md:hidden">
                <button
                  className="flex items-center gap-1.5 bg-neutral-100 border border-neutral-200 rounded-full pl-1 pr-2.5 py-1 cursor-pointer transition-all hover:border-neutral-900"
                  onClick={() => setProfileOpen(!profileOpen)}
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center font-extrabold text-sm">
                      {user?.full_name?.[0] || 'U'}
                    </div>
                  )}
                  <ChevronDown size={14} />
                </button>
                {profileOpen && (
                  <div className="absolute top-[calc(100%+8px)] right-0 w-60 bg-white border border-neutral-200 rounded-2xl shadow-xl p-2 z-[100] animate-fade-in">
                    <div className="p-3">
                      <p className="font-bold text-sm">{user?.full_name}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">{user?.email}</p>
                    </div>
                    <div className="h-px bg-neutral-100 my-1" />
                    <Link to="/profile" className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-neutral-500 rounded-xl transition-all hover:bg-neutral-100 hover:text-neutral-900 w-full font-medium">
                      <User size={16} /> My Profile
                    </Link>
                    <Link to="/my-listings" className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-neutral-500 rounded-xl transition-all hover:bg-neutral-100 hover:text-neutral-900 w-full font-medium">
                      <Home size={16} /> My Listings
                    </Link>
                    <Link to="/favorites" className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-neutral-500 rounded-xl transition-all hover:bg-neutral-100 hover:text-neutral-900 w-full font-medium">
                      <Heart size={16} /> Favorites
                    </Link>
                    <div className="h-px bg-neutral-100 my-1" />
                    <button
                      className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-500 rounded-xl transition-all hover:bg-red-50 w-full font-medium bg-transparent border-none cursor-pointer"
                      onClick={logout}
                      style={{ fontFamily: 'Raleway, sans-serif' }}
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className={`btn btn-ghost max-md:hidden ${isTransparent ? '!text-white hover:!bg-white/10' : ''}`}>Sign In</Link>
              <Link to="/register" className="btn btn-primary max-md:hidden">Get Started</Link>
            </>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className={`hidden max-md:flex items-center justify-center z-[1001] bg-transparent border-none cursor-pointer
              ${isTransparent && !menuOpen ? 'text-white' : 'text-neutral-900'}
            `}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/40 z-[998] md:hidden" onClick={() => setMenuOpen(false)} />
      )}
    </header>
  );
}
