import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Info, Building2, Camera, ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../api';
import toast from 'react-hot-toast';

export default function EditProfile() {
  const { user, updateUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    company_name: user?.company_name || '',
  });

  if (!isAuthenticated) { navigate('/login'); return null; }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const res = await userAPI.updateAvatar(file);
      updateUser(res.data);
      toast.success('Profile picture updated!');
    } catch (err) {
      toast.error('Failed to upload image');
    } finally { setUploadingAvatar(false); }
  };

  const handleSave = async () => {
    if (!form.full_name.trim()) return toast.error('Name is required');
    setLoading(true);
    try {
      const res = await userAPI.updateMe(form);
      updateUser(res.data);
      toast.success('Profile updated!');
      navigate('/profile');
    } catch (e) {
      toast.error('Failed to update profile');
    } finally { setLoading(false); }
  };

  return (
    <div className="pt-[72px]">
      {/* Header — matches app */}
      <div className="border-b border-neutral-100 bg-white">
        <div className="container-custom flex items-center justify-between py-4">
          <button onClick={() => navigate(-1)} className="w-11 h-11 rounded-xl border border-neutral-200 flex items-center justify-center bg-transparent cursor-pointer text-neutral-900 hover:bg-neutral-50 transition-all">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-extrabold tracking-tight text-neutral-900">Edit Profile</h1>
          <div className="w-11" />
        </div>
      </div>

      <div className="max-w-[540px] mx-auto px-6 py-8">
        {/* Avatar — matches app */}
        <div className="flex flex-col items-center mb-9">
          <label className="relative cursor-pointer group">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-[110px] h-[110px] rounded-full object-cover shadow-md" />
            ) : (
              <div className="w-[110px] h-[110px] rounded-full bg-neutral-200 flex items-center justify-center text-[44px] font-extrabold text-neutral-900">
                {user?.full_name?.[0] || 'U'}
              </div>
            )}
            {uploadingAvatar && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-9 h-9 bg-neutral-900 rounded-full flex items-center justify-center border-4 border-white">
              <Camera size={16} className="text-white" />
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </label>
          <span className="text-sm font-bold text-neutral-900 mt-4">Change Profile Photo</span>
        </div>

        {/* Form — matches app card style */}
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
          {[
            { icon: <User size={18} />, label: 'Full Name', key: 'full_name', placeholder: 'John Doe', type: 'text' },
            { icon: <Phone size={18} />, label: 'Phone Number', key: 'phone', placeholder: '+1 234 567 8900', type: 'tel' },
            { icon: <Info size={18} />, label: 'Bio', key: 'bio', placeholder: 'Tell us about yourself...', type: 'textarea' },
            ...(user?.role === 'lister' ? [{ icon: <Building2 size={18} />, label: 'Company Name', key: 'company_name', placeholder: 'Your Agency / Company', type: 'text' }] : []),
          ].map((field, i) => (
            <div key={field.key}>
              {i > 0 && <div className="h-px bg-neutral-100 ml-[70px]" />}
              <div className="flex items-start gap-3.5 p-4">
                <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-900 shrink-0 mt-0.5">
                  {field.icon}
                </div>
                <div className="flex-1">
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={form[field.key]}
                      onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      rows={3}
                      className="w-full border-none text-base font-semibold text-neutral-900 bg-transparent outline-none resize-y placeholder:text-neutral-300"
                      style={{ fontFamily: 'Raleway, sans-serif' }}
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={form[field.key]}
                      onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      className="w-full border-none text-base font-semibold text-neutral-900 bg-transparent outline-none placeholder:text-neutral-300"
                      style={{ fontFamily: 'Raleway, sans-serif' }}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Save Button — matches app footer */}
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full mt-8 py-[18px] bg-neutral-900 text-white rounded-2xl text-base font-extrabold tracking-wide cursor-pointer border-none shadow-md transition-all hover:bg-black hover:-translate-y-0.5 disabled:opacity-50"
          style={{ fontFamily: 'Raleway, sans-serif' }}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
