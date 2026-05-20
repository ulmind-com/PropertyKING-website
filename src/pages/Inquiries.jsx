import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MessageSquare, Phone, Calendar, Clock, CheckCircle, Home } from 'lucide-react';
import { inquiryAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Inquiries() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    fetchInquiries();
  }, [isAuthenticated]);

  const fetchInquiries = async () => {
    try {
      const res = await inquiryAPI.received({ page: 1, limit: 100 });
      setInquiries(res.data.inquiries || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const markAsDone = async (id) => {
    try {
      await inquiryAPI.respond(id, { response: 'Marked as done.' });
      setInquiries(inquiries.map(i => i.id === id ? { ...i, status: 'responded' } : i));
      toast.success('Marked as done');
    } catch (e) { toast.error('Failed'); }
  };

  const timeAgo = (date) => {
    if (!date) return '';
    const now = new Date();
    const d = new Date(date);
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const displayed = filter === 'all' ? inquiries : inquiries.filter(i => i.status === filter);

  if (!isAuthenticated) return null;

  return (
    <div className="pt-[72px]">
      {/* Header — matches app */}
      <div className="bg-white border-b border-neutral-100 shadow-sm">
        <div className="container-custom flex items-center justify-between py-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl border border-neutral-200 flex items-center justify-center bg-transparent cursor-pointer text-neutral-900">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-extrabold tracking-tight text-neutral-900">All Inquiries</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Filter Tabs — matches app */}
      <div className="container-custom flex gap-2.5 py-4">
        {[
          { key: 'all', label: 'All' },
          { key: 'pending', label: 'Pending' },
          { key: 'responded', label: 'Done' },
        ].map(({ key, label }) => (
          <button
            key={key}
            className={`px-4 py-2 rounded-full text-[13px] font-semibold border cursor-pointer transition-all
              ${filter === key ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-neutral-50 text-neutral-400 border-neutral-200 hover:bg-neutral-100'}
            `}
            style={{ fontFamily: 'Raleway, sans-serif' }}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="container-custom max-w-[700px] mx-auto pb-20">
        {loading ? (
          <div className="flex flex-col gap-4">
            {Array(4).fill(null).map((_, i) => <div key={i} className="skeleton rounded-2xl h-[200px]" />)}
          </div>
        ) : displayed.length > 0 ? (
          <div className="flex flex-col gap-4">
            {displayed.map(item => (
              <div key={item.id} className="bg-white rounded-2xl p-4 shadow-md border border-neutral-100">
                {/* Property Header — matches app */}
                <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-neutral-100">
                  <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-900 shrink-0">
                    <Home size={16} />
                  </div>
                  <span className="flex-1 text-sm font-bold text-neutral-900 truncate">{item.property_title || 'Unknown Property'}</span>
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-extrabold
                    ${item.status === 'responded' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}
                  `}>
                    {item.status === 'responded' ? 'Done' : 'Pending'}
                  </span>
                </div>

                {/* User Info — matches app */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center overflow-hidden shrink-0">
                    {item.user_avatar
                      ? <img src={item.user_avatar} alt="" className="w-full h-full object-cover" />
                      : <span className="text-white font-bold text-base">{(item.user_name || 'U')[0]}</span>
                    }
                  </div>
                  <div>
                    <span className="text-[15px] font-bold text-neutral-900 block">{item.user_name || 'User'}</span>
                    <span className="text-xs text-neutral-400">{timeAgo(item.created_at)}</span>
                  </div>
                </div>

                {/* Message — matches app */}
                <div className="bg-neutral-50 rounded-lg p-3 mb-4 text-sm text-neutral-500 italic leading-relaxed">
                  "{item.message}"
                </div>

                {/* Details — matches app grid */}
                <div className="flex flex-wrap gap-3 mb-4">
                  {item.contact_phone && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600">
                      <Phone size={14} className="text-neutral-400" /> {item.contact_phone}
                    </div>
                  )}
                  {item.preferred_date && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600">
                      <Calendar size={14} className="text-amber-500" /> {new Date(item.preferred_date).toLocaleDateString()}
                    </div>
                  )}
                  {item.preferred_time && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600">
                      <Clock size={14} className="text-violet-500" /> {item.preferred_time}
                    </div>
                  )}
                </div>

                {/* Actions — matches app */}
                <div className="flex gap-2.5">
                  {item.contact_phone && (
                    <a href={`tel:${item.contact_phone}`} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-neutral-900 text-white rounded-lg text-[13px] font-bold no-underline">
                      <Phone size={16} /> Call
                    </a>
                  )}
                  {item.contact_phone && (
                    <a href={`https://wa.me/${item.contact_phone?.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-500 text-white rounded-lg text-[13px] font-bold no-underline">
                      <MessageSquare size={16} /> WhatsApp
                    </a>
                  )}
                  {item.status !== 'responded' && (
                    <button
                      onClick={() => markAsDone(item.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg text-[13px] font-bold cursor-pointer"
                      style={{ fontFamily: 'Raleway, sans-serif' }}
                    >
                      <CheckCircle size={16} /> Mark Done
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-20 text-center">
            <MessageSquare size={60} className="text-neutral-200 mb-4" />
            <h3 className="text-xl font-extrabold text-neutral-900">No Inquiries Found</h3>
            <p className="text-neutral-400 mt-2">You have no {filter !== 'all' ? filter : ''} inquiries right now.</p>
          </div>
        )}
      </div>
    </div>
  );
}
