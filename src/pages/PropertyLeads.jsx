import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Users, Calendar, Eye, Phone, MessageCircle, Mail, Clock, Tag, Video, UserCheck, ArrowRight, CheckCheck } from 'lucide-react';
import { propertyAPI, inquiryAPI } from '../api';
import { useAuth } from '../context/AuthContext';

export default function PropertyLeads() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const property = location.state?.property || {};

  const [activeTab, setActiveTab] = useState('viewers');
  const [viewers, setViewers] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!property.id) { navigate('/my-listings'); return; }
    fetchData();
  }, [isAuthenticated]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [viewersRes, inquiriesRes] = await Promise.all([
        propertyAPI.getViewers(property.id),
        inquiryAPI.received({ page: 1, limit: 100 }),
      ]);
      setViewers(viewersRes.data.viewers || []);
      const allInq = inquiriesRes.data.inquiries || [];
      setInquiries(allInq.filter(i => i.property_id === property.id));
    } catch (e) {
      console.log('Fetch leads error:', e);
    }
    setLoading(false);
  };

  const markAsDone = async (id) => {
    try {
      await inquiryAPI.respond(id, { response: "Marked as done." });
      setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status: 'responded' } : inq));
    } catch (e) { console.log('Error marking as done', e); }
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

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return dateStr; }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    try {
      const [h, m] = timeStr.split(':');
      const hour = parseInt(h);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${displayHour}:${m || '00'} ${ampm}`;
    } catch { return timeStr; }
  };

  const getContactLabel = (pref) => {
    switch(pref) {
      case 'call': return 'Phone Call';
      case 'whatsapp': return 'WhatsApp';
      case 'video_call': return 'Video Call';
      case 'in_person': return 'In Person';
      default: return pref || 'Not specified';
    }
  };

  const getContactIcon = (pref) => {
    switch(pref) {
      case 'call': return <Phone size={15} className="text-emerald-500" />;
      case 'whatsapp': return <MessageCircle size={15} className="text-emerald-500" />;
      case 'video_call': return <Video size={15} className="text-emerald-500" />;
      case 'in_person': return <UserCheck size={15} className="text-emerald-500" />;
      default: return <MessageCircle size={15} className="text-emerald-500" />;
    }
  };

  const getInitial = (name) => (name || 'U')[0].toUpperCase();

  if (!isAuthenticated || !property.id) return null;

  return (
    <div className="pt-[72px] bg-neutral-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-neutral-100">
        <div className="container-custom flex items-center gap-3 py-4">
          <button onClick={() => navigate(-1)} className="w-11 h-11 rounded-xl border border-neutral-200 flex items-center justify-center bg-transparent cursor-pointer text-neutral-900 hover:bg-neutral-50 transition-all shrink-0">
            <ChevronLeft size={24} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-extrabold text-neutral-900 truncate">{property.title}</h1>
            <p className="text-xs font-medium text-neutral-400">Leads & Inquiries</p>
          </div>
        </div>

        {/* Stats Row — matches app */}
        <div className="container-custom flex gap-3 pb-5 pt-1">
          {[
            { color: 'violet', icon: <Users size={20} className="text-violet-600" />, value: viewers.length, label: 'Viewers' },
            { color: 'emerald', icon: <Calendar size={20} className="text-emerald-600" />, value: inquiries.length, label: 'Inquiries' },
            { color: 'blue', icon: <Eye size={20} className="text-blue-600" />, value: property.views_count || 0, label: 'Total Views' },
          ].map(({ color, icon, value, label }) => (
            <div key={label} className={`flex-1 flex flex-col items-center py-4 bg-${color}-50 rounded-2xl border-2 border-${color}-200`}>
              <div className={`w-10 h-10 rounded-full bg-${color}-100 flex items-center justify-center mb-2`}>{icon}</div>
              <span className="text-xl font-extrabold text-neutral-900">{loading ? '-' : value}</span>
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mt-0.5">{label}</span>
            </div>
          ))}
        </div>

        {/* Tab Switcher — matches app */}
        <div className="container-custom flex gap-3 pb-4">
          <button
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full font-semibold text-sm border-none cursor-pointer transition-all ${activeTab === 'viewers' ? 'bg-neutral-900 text-white shadow-lg' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'}`}
            onClick={() => setActiveTab('viewers')}
          >
            <Users size={16} /> Viewers ({loading ? '-' : viewers.length})
          </button>
          <button
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full font-semibold text-sm border-none cursor-pointer transition-all ${activeTab === 'inquiries' ? 'bg-neutral-900 text-white shadow-lg' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'}`}
            onClick={() => setActiveTab('inquiries')}
          >
            <Calendar size={16} /> Meetings ({loading ? '-' : inquiries.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom py-5 pb-20">
        {loading ? (
          <div className="flex flex-col gap-4">
            {Array(3).fill(null).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full skeleton shrink-0" />
                  <div className="flex-1">
                    <div className="w-32 h-4 rounded skeleton mb-2" />
                    <div className="w-48 h-3 rounded skeleton" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === 'viewers' ? (
          viewers.length === 0 ? (
            <div className="flex flex-col items-center justify-center pt-20 pb-20 text-center">
              <Users size={56} className="text-neutral-200 mb-4" />
              <h3 className="text-lg font-extrabold text-neutral-900">No Viewers Yet</h3>
              <p className="text-sm text-neutral-400 mt-2 max-w-[300px]">Share your listing to attract potential buyers</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {viewers.map((item, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100 flex items-center gap-3 hover:shadow-md transition-shadow">
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-full bg-neutral-900 flex items-center justify-center shrink-0 overflow-hidden">
                    {item.user_avatar ? (
                      <img src={item.user_avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-extrabold text-white">{getInitial(item.user_name)}</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-neutral-900 truncate">{item.user_name || 'Anonymous'}</p>
                    {item.user_email && <p className="text-xs text-neutral-400 truncate">✉️ {item.user_email}</p>}
                    {item.user_phone && <p className="text-xs text-neutral-400">📱 {item.user_phone}</p>}
                    <div className="flex items-center gap-1.5 mt-1">
                      <Eye size={12} className="text-neutral-400" />
                      <span className="text-[11px] font-semibold text-neutral-500">Viewed {item.view_count || 1}x</span>
                      <span className="text-[11px] text-neutral-400">• {timeAgo(item.last_viewed_at)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1.5">
                    {item.user_phone && (
                      <a href={`tel:${item.user_phone}`} className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors">
                        <Phone size={16} className="text-neutral-900" />
                      </a>
                    )}
                    {item.user_phone && (
                      <a href={`https://wa.me/${item.user_phone?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center hover:bg-emerald-100 transition-colors">
                        <MessageCircle size={16} className="text-emerald-600" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          inquiries.length === 0 ? (
            <div className="flex flex-col items-center justify-center pt-20 pb-20 text-center">
              <Calendar size={56} className="text-neutral-200 mb-4" />
              <h3 className="text-lg font-extrabold text-neutral-900">No Meeting Requests</h3>
              <p className="text-sm text-neutral-400 mt-2 max-w-[300px]">Interested buyers will request meetings here</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {inquiries.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100 hover:shadow-md transition-shadow">
                  {/* Header with user info + status */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-full bg-neutral-900 flex items-center justify-center shrink-0 overflow-hidden">
                      {item.user_avatar ? (
                        <img src={item.user_avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg font-extrabold text-white">{getInitial(item.user_name)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-neutral-900">{item.user_name || 'User'}</p>
                      <p className="text-xs text-neutral-400">{timeAgo(item.created_at)}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${item.status === 'responded' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {item.status === 'responded' ? 'Done' : 'Pending'}
                    </span>
                  </div>

                  {/* Message */}
                  <div className="bg-neutral-50 rounded-xl p-3.5 mb-3">
                    <p className="text-sm text-neutral-600 leading-relaxed">{item.message}</p>
                  </div>

                  {/* Details Box — matches app */}
                  <div className="bg-neutral-50 rounded-xl p-4 mb-4 flex flex-col gap-2.5">
                    {item.user_email && (
                      <div className="flex items-center gap-2.5">
                        <Mail size={15} className="text-neutral-900 shrink-0" />
                        <span className="text-xs font-semibold text-neutral-400 w-[75px] shrink-0">Email:</span>
                        <span className="text-sm font-semibold text-neutral-700 truncate">{item.user_email}</span>
                      </div>
                    )}
                    {item.contact_phone && (
                      <div className="flex items-center gap-2.5">
                        <Phone size={15} className="text-neutral-900 shrink-0" />
                        <span className="text-xs font-semibold text-neutral-400 w-[75px] shrink-0">Phone:</span>
                        <span className="text-sm font-semibold text-neutral-700">{item.contact_phone}</span>
                      </div>
                    )}
                    {item.preferred_date && (
                      <div className="flex items-center gap-2.5">
                        <Calendar size={15} className="text-amber-500 shrink-0" />
                        <span className="text-xs font-semibold text-neutral-400 w-[75px] shrink-0">Date:</span>
                        <span className="text-sm font-semibold text-neutral-700">{formatDate(item.preferred_date)}</span>
                      </div>
                    )}
                    {item.preferred_time && (
                      <div className="flex items-center gap-2.5">
                        <Clock size={15} className="text-violet-500 shrink-0" />
                        <span className="text-xs font-semibold text-neutral-400 w-[75px] shrink-0">Time:</span>
                        <span className="text-sm font-semibold text-neutral-700">{formatTime(item.preferred_time)}</span>
                      </div>
                    )}
                    {item.contact_preference && (
                      <div className="flex items-center gap-2.5">
                        {getContactIcon(item.contact_preference)}
                        <span className="text-xs font-semibold text-neutral-400 w-[75px] shrink-0">Contact via:</span>
                        <span className="text-sm font-bold text-emerald-600">{getContactLabel(item.contact_preference)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2.5">
                      <Tag size={15} className="text-neutral-400 shrink-0" />
                      <span className="text-xs font-semibold text-neutral-400 w-[75px] shrink-0">Type:</span>
                      <span className="text-sm font-semibold text-neutral-700 capitalize">{(item.inquiry_type || 'general').replace('_', ' ')}</span>
                    </div>
                  </div>

                  {/* Action Buttons — matches app */}
                  <div className="flex gap-2.5">
                    {item.contact_phone && (
                      <a href={`tel:${item.contact_phone}`} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-neutral-900 text-white rounded-xl font-bold text-sm no-underline hover:bg-neutral-800 transition-colors">
                        <Phone size={16} /> Call
                      </a>
                    )}
                    {item.contact_phone && (
                      <a href={`https://wa.me/${item.contact_phone?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-500 text-white rounded-xl font-bold text-sm no-underline hover:bg-emerald-600 transition-colors">
                        <MessageCircle size={16} /> WhatsApp
                      </a>
                    )}
                    {item.status !== 'responded' && (
                      <button
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-neutral-100 text-neutral-700 rounded-xl font-bold text-sm border-none cursor-pointer hover:bg-neutral-200 transition-colors"
                        onClick={() => markAsDone(item.id)}
                      >
                        <CheckCheck size={16} /> Mark Done
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
