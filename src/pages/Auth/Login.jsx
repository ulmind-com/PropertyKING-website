import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Home, ArrowRight, AlertCircle, ChevronLeft, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Clear error on input change
  useEffect(() => {
    if (error) setError('');
  }, [email, password]);

  // Auto-close error modal after 4 seconds and reset form
  useEffect(() => {
    let timer;
    if (showErrorModal) {
      timer = setTimeout(() => {
        setShowErrorModal(false);
        setEmail('');
        setPassword('');
        setError('');
      }, 4000);
    }
    return () => clearTimeout(timer);
  }, [showErrorModal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return setError('Please enter your email and password.');
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      const detail = err.response?.data?.detail;
      const errorMsg = Array.isArray(detail) ? detail[0].msg : (detail || 'Invalid credentials.');
      setError(errorMsg);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const getCustomErrorMessage = (errText) => {
    const lower = errText.toLowerCase();
    if (lower.includes('password')) return 'The password you entered is incorrect. Please try again.';
    if (lower.includes('found') || lower.includes('exist') || lower.includes('email')) return 'We could not find an account with that email address. Please sign up first.';
    return errText || 'Incorrect email or password. Please check your credentials and try again.';
  };

  return (
    <div className="auth-page-dark">
      <div className="auth-container-dark">
        {/* Top Bar */}
        <div className="auth-top-bar">
          <button className="auth-back-btn" onClick={() => navigate(-1)}>
            <ChevronLeft size={24} />
          </button>
          <Link to="/register" className="auth-switch-link">
            <span>Sign Up</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Header Area */}
        <div className="auth-header-area">
          <div className="auth-logo-badge">
            <img src="/logoremovebg.png" alt="PropertyKing" style={{ width: 40, height: 40, objectFit: 'contain' }} />
          </div>
          <h1 className="auth-main-title">Welcome Back</h1>
          <p className="auth-sub-title">Sign in to continue exploring premium properties.</p>
        </div>

        {/* Form Area */}
        <form onSubmit={handleSubmit} className="auth-form-area">

          <div className="input-group-dark">
            <label className="input-label-dark">Email Address</label>
            <div className="input-wrapper-dark">
              <Mail size={20} className="input-icon-dark" />
              <input
                type="email"
                className="input-dark"
                placeholder="john@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group-dark">
            <label className="input-label-dark">Password</label>
            <div className="input-wrapper-dark">
              <Lock size={20} className="input-icon-dark" />
              <input
                type={showPass ? 'text' : 'password'}
                className="input-dark"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="eye-icon-btn"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <Link to="/forgot-password" className="forgot-pass-link">
            Forgot Password?
          </Link>

          <button type="submit" className="glassy-btn" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>

      {/* Custom Error Popup Modal */}
      {showErrorModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '16px' }}>
          <div style={{ backgroundColor: '#1C1C1E', borderRadius: '24px', padding: '24px', width: '100%', maxWidth: '340px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '28px', backgroundColor: 'rgba(239,68,68,0.1)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <AlertCircle size={28} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', textAlign: 'center', marginBottom: '8px', letterSpacing: '-0.5px' }}>Login Failed</h3>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 1.6, marginBottom: '24px' }}>
              {getCustomErrorMessage(error)}
            </p>
            <button 
              type="button"
              style={{ width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.1)', color: '#FFFFFF', fontWeight: 'bold', fontSize: '15px', border: 'none', cursor: 'pointer' }}
              onClick={() => {
                setShowErrorModal(false);
                setEmail('');
                setPassword('');
                setError('');
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
