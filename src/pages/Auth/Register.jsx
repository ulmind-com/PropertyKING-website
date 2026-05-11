import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Phone, Home, Briefcase } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', role: 'user', lister_type: '', license_number: '', company_name: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.password) return toast.error('Please fill required fields');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (form.role === 'lister' && !form.lister_type) return toast.error('Select your lister type');
    setLoading(true);
    try {
      const data = { ...form };
      if (data.role !== 'lister') { delete data.lister_type; delete data.license_number; delete data.company_name; }
      if (!data.phone) delete data.phone;
      await register(data);
      toast.success('Account created!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80" alt="" />
        <div className="auth-left-overlay">
          <Link to="/" className="auth-logo"><div className="logo-icon"><Home size={18} /></div> Property<span>KING</span></Link>
          <div className="auth-left-content"><h2>Join PropertyKING</h2><p>Create your account and start exploring premium properties across the United States.</p></div>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-form-container">
          <div className="auth-header"><h1>Create Account</h1><p>Fill in your details to get started</p></div>

          {/* Role Selection */}
          <div className="role-selector">
            <button className={`role-btn ${form.role === 'user' ? 'active' : ''}`} onClick={() => setForm({...form, role: 'user'})} type="button">
              <User size={20} /><span>I'm Looking</span><small>Browse & buy properties</small>
            </button>
            <button className={`role-btn ${form.role === 'lister' ? 'active' : ''}`} onClick={() => setForm({...form, role: 'lister'})} type="button">
              <Briefcase size={20} /><span>I'm Listing</span><small>List & manage properties</small>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label>Full Name *</label>
              <div className="input-icon-wrapper"><User size={18} className="input-icon" />
                <input type="text" className="input" placeholder="John Doe" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} /></div>
            </div>
            <div className="input-group">
              <label>Email Address *</label>
              <div className="input-icon-wrapper"><Mail size={18} className="input-icon" />
                <input type="email" className="input" placeholder="john@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
            </div>
            <div className="input-row">
              <div className="input-group">
                <label>Phone</label>
                <div className="input-icon-wrapper"><Phone size={18} className="input-icon" />
                  <input type="tel" className="input" placeholder="+1 555-123-4567" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
              </div>
              <div className="input-group">
                <label>Password *</label>
                <div className="input-icon-wrapper"><Lock size={18} className="input-icon" />
                  <input type={showPass ? 'text' : 'password'} className="input" placeholder="Min 6 characters" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
                  <button type="button" className="input-toggle" onClick={() => setShowPass(!showPass)}>{showPass ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
              </div>
            </div>

            {form.role === 'lister' && (
              <div className="lister-fields animate-fade-in">
                <div className="input-group">
                  <label>I am a *</label>
                  <div className="lister-type-grid">
                    {['owner', 'agent', 'broker', 'developer'].map(t => (
                      <button key={t} type="button" className={`chip ${form.lister_type === t ? 'active' : ''}`} onClick={() => setForm({...form, lister_type: t})}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="input-row">
                  <div className="input-group"><label>License Number</label><input type="text" className="input" placeholder="RE-12345" value={form.license_number} onChange={e => setForm({...form, license_number: e.target.value})} /></div>
                  <div className="input-group"><label>Company Name</label><input type="text" className="input" placeholder="Doe Realty LLC" value={form.company_name} onChange={e => setForm({...form, company_name: e.target.value})} /></div>
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg" style={{width:'100%'}} disabled={loading}>
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
          <p className="auth-switch">Already have an account? <Link to="/login">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
}
