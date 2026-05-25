import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Eye, MessageSquare, Building2, Home, ArrowRight, Trash2, AlertTriangle, X } from 'lucide-react';
import { propertyAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function MyListings() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalProps: 0, totalViews: 0, totalInquiries: 0 });
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    fetchListings();
  }, [isAuthenticated]);

  const fetchListings = async () => {
    try {
      const res = await propertyAPI.myListings({ page: 1, limit: 10 });
      setListings(res.data.properties || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleToggleStatus = async (item, e) => {
    e.preventDefault();
    e.stopPropagation();
    const oldStatus = item.status;
    const newStatus = oldStatus === 'inactive' ? 'active' : 'inactive';

    // Optimistic UI update
    setListings(prev => prev.map(p => p.id === item.id ? { ...p, status: newStatus } : p));
    try {
      await propertyAPI.toggleStatus(item.id);
    } catch (err) {
      // Revert on failure
      setListings(prev => prev.map(p => p.id === item.id ? { ...p, status: oldStatus } : p));
      toast.error('Failed to update status. Please try again.');
    }
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);
    const targetId = deleteTarget;
    try {
      await propertyAPI.delete(targetId);
      setListings(prev => prev.filter(p => p.id !== targetId));
      toast.success('Property listing removed.');
      setDeleteTarget(null);
    } catch (err) {
      toast.error('Could not delete property.');
      // Only clear if we actually failed, maybe user wants to try again
      setDeleteTarget(null); 
    } finally {
      setIsDeleting(false);
    }
  };

  const getImg = (property) => {
    const imgs = property.images || [];
    return imgs.find(i => i.is_primary)?.url || imgs[0]?.url || 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400';
  };

  const formatPrice = (p) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(p || 0);

  if (!isAuthenticated) return null;

  return (
    <div className="pt-[72px] bg-neutral-50 min-h-screen">
      {/* Header — matches app */}
      <div className="bg-white border-b border-neutral-100">
        <div className="container-custom flex items-center justify-between py-4">
          <button onClick={() => navigate(-1)} className="w-11 h-11 rounded-xl border border-neutral-200 flex items-center justify-center bg-transparent cursor-pointer text-neutral-900 hover:bg-neutral-50 transition-all">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-extrabold tracking-tight text-neutral-900">Dashboard</h1>
          <div className="w-11" />
        </div>

        {/* Stats Row — matches app summary cards */}
        <div className="container-custom flex gap-3 pb-5 pt-2">
          {[
            { bg: 'bg-blue-50', iconBg: 'bg-blue-100', icon: <Building2 size={20} className="text-neutral-900" />, value: listings.length, label: 'Listings' },
            { bg: 'bg-violet-50', iconBg: 'bg-violet-100', icon: <Eye size={20} className="text-violet-600" />, value: listings.reduce((s, l) => s + (l.views_count || 0), 0), label: 'Views' },
            { bg: 'bg-emerald-50', iconBg: 'bg-emerald-100', icon: <MessageSquare size={20} className="text-emerald-600" />, value: listings.reduce((s, l) => s + (l.inquiries_count || 0), 0), label: 'Leads' },
          ].map(({ bg, iconBg, icon, value, label }) => (
            <div key={label} className={`flex-1 flex flex-col items-center py-5 ${bg} rounded-3xl shadow-sm`}>
              <div className={`w-11 h-11 rounded-full ${iconBg} flex items-center justify-center mb-3`}>{icon}</div>
              <span className="text-2xl font-extrabold text-neutral-900 tracking-tight">{value}</span>
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider mt-0.5">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Listings */}
      <div className="container-custom py-5 pb-20">
        {loading ? (
          <div className="flex flex-col gap-5">
            {Array(3).fill(null).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-3 shadow-md flex gap-4 h-[134px]">
                <div className="w-[110px] h-[110px] rounded-2xl skeleton shrink-0" />
                <div className="flex-1 py-1 flex flex-col justify-between">
                  <div>
                    <div className="w-3/4 h-4 rounded skeleton mb-2" />
                    <div className="w-1/2 h-5 rounded skeleton" />
                  </div>
                  <div className="flex gap-2">
                    <div className="w-16 h-7 rounded-[10px] skeleton" />
                    <div className="w-16 h-7 rounded-[10px] skeleton" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className="flex flex-col gap-5">
            {listings.map(item => {
              const isActive = item.status !== 'inactive';
              return (
                <div key={item.id} className={`bg-white rounded-3xl p-3 shadow-md ${!isActive ? 'opacity-60' : ''}`}>
                  <Link to={`/property/${item.slug || item.id}`} className="flex gap-4 no-underline text-inherit">
                    <div className="relative">
                      <img src={getImg(item)} alt="" className="w-[110px] h-[110px] rounded-2xl object-cover bg-neutral-100" />
                      <div className={`absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wide
                        ${isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-500'}
                      `}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
                        {isActive ? 'ACTIVE' : 'INACTIVE'}
                      </div>
                    </div>
                    <div className="flex-1 py-1">
                      <h3 className="text-[15px] font-bold text-neutral-900 leading-snug line-clamp-2 mb-1.5">{item.title}</h3>
                      <p className="text-lg font-extrabold text-neutral-900 tracking-tight mb-3">{formatPrice(item.price)}</p>
                      <div className="flex gap-2">
                        <span className="flex items-center gap-1 px-2.5 py-1.5 bg-neutral-100 rounded-[10px] text-xs font-bold text-neutral-500">
                          <Eye size={14} className="text-violet-500" /> {item.views_count || 0}
                        </span>
                        <span className="flex items-center gap-1 px-2.5 py-1.5 bg-neutral-100 rounded-[10px] text-xs font-bold text-neutral-500">
                          <MessageSquare size={14} className="text-emerald-500" /> {item.inquiries_count || 0}
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Card Footer matching App */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100">
                    <button 
                      className="flex items-center gap-1.5 px-3 py-2 bg-transparent border-none cursor-pointer text-blue-600 font-bold text-sm hover:bg-blue-50 rounded-lg transition-colors"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/my-listings/${item.id}/leads`, { state: { property: item } }); }}
                    >
                      View Leads <ArrowRight size={16} />
                    </button>

                    <div className="flex items-center gap-4">
                      <button 
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg bg-transparent border-none cursor-pointer transition-colors"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteTarget(item.id); }}
                      >
                        <Trash2 size={20} />
                      </button>

                      {/* Custom Toggle Switch */}
                      <button 
                        className={`w-12 h-7 rounded-full p-1 cursor-pointer border-none transition-colors duration-200 ease-in-out ${isActive ? 'bg-emerald-500' : 'bg-neutral-200'}`}
                        onClick={(e) => handleToggleStatus(item, e)}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-20 pb-20 text-center">
            <Home size={64} className="text-neutral-200 mb-4" />
            <h3 className="text-xl font-extrabold text-neutral-900">No Listings Yet</h3>
            <p className="text-[15px] text-neutral-400 mt-2 max-w-[340px]">List your first property to start tracking leads and views</p>
          </div>
        )}
      </div>

      {/* Custom Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-[340px] shadow-2xl animate-fade-in-up">
            <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4 mx-auto">
              <AlertTriangle size={28} />
            </div>
            <h3 className="text-xl font-extrabold text-neutral-900 text-center mb-2 tracking-tight">Delete Property</h3>
            <p className="text-[15px] text-neutral-500 text-center leading-relaxed mb-6 px-2">
              Are you sure you want to permanently delete this listing? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                className="flex-1 py-3.5 rounded-xl bg-neutral-100 text-neutral-700 font-bold text-[15px] hover:bg-neutral-200 transition-colors border-none cursor-pointer"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button 
                className={`flex-1 py-3.5 rounded-xl text-white font-bold text-[15px] transition-colors border-none shadow-sm shadow-red-500/20 ${isDeleting ? 'bg-red-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 cursor-pointer'}`}
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
