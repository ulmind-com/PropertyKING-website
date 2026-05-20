import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight, ArrowLeft, CheckCircle, AlertCircle, ChevronLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api';
import toast from 'react-hot-toast';
import './Auth.css';

const COUNTRIES = [
  { code: 'IN', name: 'India', flag: '🇮🇳', dial: '91' },
  { code: 'US', name: 'United States', flag: '🇺🇸', dial: '1' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dial: '44' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', dial: '1' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', dial: '61' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪', dial: '971' },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [countryCode, setCountryCode] = useState('US');
  const [callingCode, setCallingCode] = useState('1');
  
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (error) setError('');
  }, [email, otp, password, name, phone]);

  const handleNextStep1 = async (e) => {
    e?.preventDefault();
    if (!email || !email.includes('@')) return setError('Please enter a valid email address.');
    setLoading(true);
    setError('');
    
    try {
      await authAPI.requestOTP({ email, purpose: 'registration' });
      setStep(2);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(Array.isArray(detail) ? detail[0].msg : (detail || 'Failed to send OTP.'));
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep2 = async (e) => {
    e?.preventDefault();
    if (!otp || otp.length < 6) return setError('Please enter the 6-digit OTP.');
    setLoading(true);
    setError('');
    try {
      await authAPI.verifyOTP({ email, otp, purpose: 'registration' });
      setStep(3);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(Array.isArray(detail) ? detail[0].msg : (detail || 'Invalid or expired OTP.'));
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep3 = (e) => {
    e?.preventDefault();
    if (!password || password.length < 6) return setError('Password must be at least 6 characters.');
    setError('');
    setStep(4);
  };

  const handleRegister = async (e) => {
    e?.preventDefault();
    if (!name || !phone) return setError('Please fill out your name and phone number.');
    setLoading(true);
    setError('');
    try {
      const fullPhone = `+${callingCode}${phone}`;
      await register({ email, password, full_name: name, phone: fullPhone, role: 'user' });
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(Array.isArray(detail) ? detail[0].msg : (detail || 'Registration failed.'));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setError('');
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="auth-page-dark">
      <div className="auth-container-dark">
        {/* Top Bar */}
        <div className="auth-top-bar">
          <button className="auth-back-btn" onClick={handleBack}>
            <ChevronLeft size={24} />
          </button>
          {step === 1 && (
            <Link to="/login" className="auth-switch-link">
              <span>Sign In</span>
              <ArrowRight size={16} />
            </Link>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="progress-row">
          <div className={`progress-dot ${step >= 1 ? 'active' : ''}`} />
          <div className={`progress-line ${step >= 2 ? 'active' : ''}`} />
          <div className={`progress-dot ${step >= 2 ? 'active' : ''}`} />
          <div className={`progress-line ${step >= 3 ? 'active' : ''}`} />
          <div className={`progress-dot ${step >= 3 ? 'active' : ''}`} />
          <div className={`progress-line ${step >= 4 ? 'active' : ''}`} />
          <div className={`progress-dot ${step >= 4 ? 'active' : ''}`} />
        </div>

        <div className="slide-animation" key={step}>
          {/* Header Area */}
          <div className="auth-header-area">
            <h1 className="auth-main-title">
              {step === 1 ? "What's your email?" : step === 2 ? "Verify your email" : step === 3 ? "Create a password" : "Final details"}
            </h1>
            <p className="auth-sub-title">
              {step === 1 ? "We'll use this to log you in." : step === 2 ? "Enter the 6-digit OTP sent to your email." : step === 3 ? "Make it strong and secure." : "Help us identify you."}
            </p>
          </div>

          {/* Form Area */}
          <div className="auth-form-area">
            {error && (
              <div className="auth-error-box">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {/* STEP 1: EMAIL */}
            {step === 1 && (
              <form onSubmit={handleNextStep1} className="input-group-dark">
                <label className="input-label-dark">Email Address</label>
                <div className="input-wrapper-dark">
                  <Mail size={20} className="input-icon-dark" />
                  <input
                    type="email"
                    className="input-dark"
                    placeholder="john@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoFocus
                  />
                </div>
                <button type="submit" className="glassy-btn" disabled={loading} style={{ marginTop: '24px' }}>
                  {loading ? 'Sending OTP...' : 'Continue'}
                  {!loading && <ArrowRight size={20} />}
                </button>
              </form>
            )}

            {/* STEP 2: OTP */}
            {step === 2 && (
              <form onSubmit={handleNextStep2} className="input-group-dark">
                <label className="input-label-dark">Verification Code</label>
                <div className="input-wrapper-dark" style={{ padding: 0, border: 'none', background: 'transparent' }}>
                  <input
                    type="text"
                    className="input-dark"
                    style={{ 
                      letterSpacing: '12px', 
                      fontSize: '28px', 
                      textAlign: 'center',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '16px',
                      padding: '10px'
                    }}
                    placeholder="000000"
                    maxLength={6}
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    autoFocus
                  />
                </div>
                <button type="submit" className="glassy-btn" disabled={loading} style={{ marginTop: '24px' }}>
                  {loading ? 'Verifying...' : 'Verify OTP'}
                  {!loading && <CheckCircle size={20} />}
                </button>
                <button type="button" className="resend-link" onClick={() => handleNextStep1()}>
                  Resend Code
                </button>
              </form>
            )}

            {/* STEP 3: PASSWORD */}
            {step === 3 && (
              <form onSubmit={handleNextStep3} className="input-group-dark">
                <label className="input-label-dark">Secure Password</label>
                <div className="input-wrapper-dark">
                  <Lock size={20} className="input-icon-dark" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="input-dark"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoFocus
                  />
                  <button
                    type="button"
                    className="eye-icon-btn"
                    onClick={() => setShowPass(!showPass)}
                  >
                    {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <button type="submit" className="glassy-btn" style={{ marginTop: '24px' }}>
                  Continue
                  <ArrowRight size={20} />
                </button>
              </form>
            )}

            {/* STEP 4: NAME & PHONE */}
            {step === 4 && (
              <form onSubmit={handleRegister} className="auth-form-area" style={{ gap: '16px', animation: 'none' }}>
                <div className="input-group-dark">
                  <label className="input-label-dark">Full Name</label>
                  <div className="input-wrapper-dark">
                    <User size={20} className="input-icon-dark" />
                    <input
                      type="text"
                      className="input-dark"
                      placeholder="John Doe"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>

                <div className="input-group-dark">
                  <label className="input-label-dark">Phone Number</label>
                  <div className="input-wrapper-dark">
                    <select 
                      className="country-select"
                      value={countryCode}
                      onChange={(e) => {
                        const country = COUNTRIES.find(c => c.code === e.target.value);
                        setCountryCode(country.code);
                        setCallingCode(country.dial);
                      }}
                    >
                      {COUNTRIES.map(c => (
                        <option key={c.code} value={c.code}>{c.flag} +{c.dial}</option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      className="input-dark"
                      placeholder="234 567 8900"
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                </div>

                <button type="submit" className="glassy-btn" disabled={loading} style={{ marginTop: '24px' }}>
                  {loading ? 'Completing...' : 'Complete Sign Up'}
                  {!loading && <CheckCircle size={20} />}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
