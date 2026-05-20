import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, Home, Heart, MessageSquare, Bell, Settings, HelpCircle,
  ChevronRight, LogOut, Camera, Edit3, Shield, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(user);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    loadProfile();
  }, [isAuthenticated]);

  const loadProfile = async () => {
    try {
      const res = await userAPI.getMe();
      setProfile(res.data);
    } catch (e) { console.error(e); }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    try {
      await userAPI.deleteAccount();
      toast.success('Account successfully deleted.');
      logout();
      navigate('/');
    } catch (e) {
      toast.error('Failed to delete account. Please try again later.');
    } finally {
      setShowDeleteModal(false);
    }
  };

  const menuItems = [
    { icon: <User size={20} />, label: 'Edit Profile', path: '/edit-profile', available: true },
    { icon: <Home size={20} />, label: 'My Listings', path: '/my-listings', available: true },
    { icon: <Heart size={20} />, label: 'Favorites', path: '/favorites', available: true },
    { icon: <MessageSquare size={20} />, label: 'Inquiries', path: '/inquiries', available: true },
    { icon: <Bell size={20} />, label: 'Notifications', path: '/notifications', available: true },
    { icon: <Settings size={20} />, label: 'Settings', path: '/settings', available: false },
    { icon: <HelpCircle size={20} />, label: 'Help & Support', path: '/help', available: false },
  ];

  if (!isAuthenticated) return null;

  return (
    <div className="pt-[72px]">
      <div className="max-w-[640px] mx-auto px-6 py-10">
        {/* Profile Header — matches app */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative group">
            {profile?.avatar ? (
              <img src={profile.avatar} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-neutral-100" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center text-white text-[26px] font-extrabold">
                {profile?.full_name?.[0] || 'U'}
              </div>
            )}
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-neutral-900 rounded-full flex items-center justify-center border-2 border-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={12} className="text-white" />
            </button>
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-neutral-900">{profile?.full_name || 'User'}</h2>
            <p className="text-sm text-neutral-400 font-medium">{profile?.email}</p>
            {profile?.role === 'lister' && (
              <span className="inline-flex items-center gap-1 mt-1.5 px-3 py-1 bg-neutral-100 rounded-full text-[11px] font-bold text-neutral-900 capitalize">
                <CheckCircle2 size={12} className="text-emerald-500" />
                {profile.lister_type || 'Verified Lister'}
              </span>
            )}
          </div>
        </div>

        {/* Stats Row — matches app */}
        <div className="flex bg-neutral-50 rounded-2xl border border-neutral-100 p-5 mb-6">
          {[
            { value: profile?.listings_count || 0, label: 'Listings' },
            { value: profile?.favorites_count || 0, label: 'Favorites' },
            { value: 0, label: 'Reviews' },
          ].map((stat, i) => (
            <div key={stat.label} className="flex-1 flex flex-col items-center">
              {i > 0 && <div className="absolute w-px h-8 bg-neutral-200 -ml-[50%]" style={{ display: 'none' }} />}
              <span className="text-[22px] font-extrabold text-neutral-900 tracking-tight">{stat.value}</span>
              <span className="text-xs text-neutral-400 font-medium mt-0.5">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Menu — matches app */}
        <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden mb-6">
          {menuItems.map((item, i) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3.5 px-4 py-4 bg-transparent border-none cursor-pointer transition-all hover:bg-neutral-50 text-left
                ${i < menuItems.length - 1 ? 'border-b border-neutral-100' : ''}
              `}
              style={{ fontFamily: 'Raleway, sans-serif' }}
              onClick={() => {
                if (item.available) navigate(item.path);
                else toast('Coming soon! 🚀', { icon: '🔜' });
              }}
            >
              <div className="w-9 h-9 rounded-[10px] bg-neutral-100 flex items-center justify-center text-neutral-900 shrink-0">
                {item.icon}
              </div>
              <span className="flex-1 text-sm font-medium text-neutral-900">{item.label}</span>
              <ChevronRight size={18} className="text-neutral-400" />
            </button>
          ))}
        </div>

        {/* Logout Button — matches app */}
        <button
          className="w-full flex items-center justify-center gap-2 px-4 py-4 border-[1.5px] border-red-200 rounded-2xl bg-transparent text-red-500 text-[15px] font-semibold cursor-pointer transition-all hover:bg-red-50"
          style={{ fontFamily: 'Raleway, sans-serif' }}
          onClick={handleLogout}
        >
          <LogOut size={20} />
          Logout
        </button>

        {/* Delete Account Button — matches app */}
        <button
          className="w-full flex items-center justify-center gap-2 mt-3 px-4 py-4 rounded-2xl bg-transparent border-none text-red-500 text-[15px] font-semibold cursor-pointer transition-all hover:bg-red-50"
          style={{ fontFamily: 'Raleway, sans-serif' }}
          onClick={() => setShowDeleteModal(true)}
        >
          <AlertTriangle size={20} />
          Delete Account
        </button>

        {/* Powered By */}
        <a 
          href="https://www.ulmind.com" 
          target="_blank" 
          rel="noreferrer"
          className="flex items-center justify-center gap-1.5 mt-8 mb-4 text-neutral-400 no-underline hover:opacity-80 transition-opacity"
        >
          <span className="text-[13px] font-semibold tracking-wide">Powered By</span>
          <span className="text-[13px] font-extrabold text-neutral-800">ULMind</span>
        </a>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-[340px] shadow-2xl animate-fade-in-up">
            <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4 mx-auto">
              <AlertTriangle size={28} />
            </div>
            <h3 className="text-xl font-extrabold text-neutral-900 text-center mb-2 tracking-tight">Delete Account</h3>
            <p className="text-[14px] text-neutral-500 text-center leading-relaxed mb-6 px-1">
              This action is completely irreversible. All your personal data, property listings, favorites, and inquiries will be permanently wiped from our servers.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                className="w-full py-3.5 rounded-xl bg-red-500 text-white font-bold text-[15px] hover:bg-red-600 transition-colors border-none cursor-pointer shadow-sm shadow-red-500/20"
                onClick={handleDeleteAccount}
              >
                Delete Permanently
              </button>
              <button 
                className="w-full py-3.5 rounded-xl bg-neutral-100 text-neutral-700 font-bold text-[15px] hover:bg-neutral-200 transition-colors border-none cursor-pointer"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
