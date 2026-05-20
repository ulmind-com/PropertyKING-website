import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, BellOff, MessageCircle, CheckCircle, Heart, AlertCircle, Trash2 } from 'lucide-react';
import { notificationAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Notifications() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    loadNotifications();
  }, [isAuthenticated]);

  const loadNotifications = async () => {
    try {
      const res = await notificationAPI.list({ page: 1, limit: 50 });
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unread_count || 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e) { console.error(e); }
  };

  const handleDeleteNotification = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        await notificationAPI.delete(id);
        setNotifications(prev => prev.filter(n => n.id !== id));
        toast.success('Notification removed.');
      } catch (err) {
        toast.error('Could not delete notification.');
      }
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm('Are you sure you want to delete all your notifications? This cannot be undone.')) {
      try {
        await notificationAPI.deleteAll();
        setNotifications([]);
        setUnreadCount(0);
        toast.success('All notifications removed.');
      } catch (err) {
        toast.error('Could not clear notifications.');
      }
    }
  };

  const handleNotificationClick = async (item) => {
    if (!item.is_read) {
      try {
        await notificationAPI.markRead(item.id);
        setNotifications(notifications.map(n => n.id === item.id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (e) {}
    }
    const propId = item.data?.property_id || item.data?.property_slug;
    if (propId) navigate(`/property/${propId}`);
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'inquiry': case 'new_inquiry': return <MessageCircle size={20} />;
      case 'status': case 'property_approved': return <CheckCircle size={20} />;
      case 'favorite': return <Heart size={20} />;
      default: return <Bell size={20} />;
    }
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    let d = dateStr;
    if (!d.endsWith('Z')) d += 'Z';
    const date = new Date(d);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (!isAuthenticated) return null;

  return (
    <div className="pt-[72px]">
      {/* Header — matches app */}
      <div className="border-b border-neutral-100 bg-white">
        <div className="container-custom flex items-center justify-between py-5">
          <h1 className="text-xl font-extrabold tracking-tight text-neutral-900">Notifications</h1>
          <div className="flex items-center gap-4">
            {unreadCount > 0 && (
              <button
                className="text-sm font-semibold text-neutral-900 bg-transparent border-none cursor-pointer hover:underline"
                style={{ fontFamily: 'Raleway, sans-serif' }}
                onClick={handleMarkAllRead}
              >
                Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors border-none cursor-pointer"
                onClick={handleDeleteAll}
                title="Clear All"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container-custom max-w-[700px] mx-auto">
        {loading ? (
          <div className="flex flex-col gap-0">
            {Array(6).fill(null).map((_, i) => (
              <div key={i} className="flex items-start gap-4 p-5 border-b border-neutral-100">
                <div className="skeleton w-12 h-12 rounded-full shrink-0" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="skeleton h-4 rounded-lg w-3/5" />
                  <div className="skeleton h-3 rounded-lg w-4/5" />
                  <div className="skeleton h-3 rounded-lg w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length > 0 ? (
          <div className="flex flex-col">
            {notifications.map((item) => (
              <div
                key={item.id}
                className={`flex items-start gap-4 p-5 border-b border-neutral-100 w-full text-left bg-transparent transition-all hover:bg-neutral-50
                  ${!item.is_read ? 'bg-neutral-900/[0.03]' : ''}
                `}
                style={{ fontFamily: 'Raleway, sans-serif' }}
              >
                {/* Icon — matches app iconBox */}
                <button
                  className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-none cursor-pointer
                  ${!item.is_read ? 'bg-neutral-900/10 text-neutral-900' : 'bg-neutral-100 text-neutral-400'}
                `}
                  onClick={() => handleNotificationClick(item)}
                >
                  {getIconForType(item.type)}
                </button>

                {/* Content */}
                <div 
                  className="flex-1 min-w-0 cursor-pointer" 
                  onClick={() => handleNotificationClick(item)}
                >
                  <p className={`text-[15px] mb-1 leading-snug truncate
                    ${!item.is_read ? 'font-bold text-neutral-900' : 'font-semibold text-neutral-700'}
                  `}>{item.title}</p>
                  <p className="text-[13px] text-neutral-400 leading-relaxed line-clamp-2 font-normal">{item.body}</p>
                  <p className="text-[11px] text-neutral-400 font-medium mt-1.5">{formatTimeAgo(item.created_at)}</p>
                </div>

                {/* Unread dot */}
                {!item.is_read && (
                  <div className="w-2 h-2 rounded-full bg-neutral-900 self-center ml-2 shrink-0" />
                )}

                {/* Delete button */}
                <button
                  className="ml-4 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border-none bg-transparent cursor-pointer shrink-0 self-center"
                  onClick={(e) => handleDeleteNotification(item.id, e)}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          /* Empty state — matches app */
          <div className="flex flex-col items-center justify-center pt-24 pb-20 text-center">
            <BellOff size={64} className="text-neutral-200 mb-4" />
            <h3 className="text-xl font-extrabold text-neutral-900 tracking-tight">No notifications yet</h3>
            <p className="text-sm text-neutral-400 mt-2 max-w-[300px]">When you get notifications, they'll show up here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
