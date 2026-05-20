import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle, ChevronLeft } from 'lucide-react';
import { authAPI } from '../../api';
import toast from 'react-hot-toast';
import './Auth.css';

export default function ForgotPassword() {
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (error) setError('');
  }, [email, otp, password]);

  const handleRequestOTP = async (e) => {
    e?.preventDefault();
    if (!email || !email.includes('@')) return setError('Please enter a valid email address.');
    setLoading(true);
    setError('');
    
    try {
      await authAPI.requestOTP({ email, purpose: 'reset' });
      setStep(2);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(Array.isArray(detail) ? detail[0].msg : (detail || 'Failed to send OTP.'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e?.preventDefault();
    if (!otp || otp.length < 6) return setError('Please enter the 6-digit OTP.');
    setLoading(true);
    setError('');
    try {
      await authAPI.verifyOTP({ email, otp, purpose: 'reset' });
      setStep(3);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(Array.isArray(detail) ? detail[0].msg : (detail || 'Invalid or expired OTP.'));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e?.preventDefault();
    if (!password || password.length < 6) return setError('Password must be at least 6 characters.');
    setLoading(true);
    setError('');
    try {
      await authAPI.resetPassword({ email, otp, new_password: password });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(Array.isArray(detail) ? detail[0].msg : (detail || 'Password reset failed.'));
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
        <div className="auth-top-bar" style={{ justifyContent: 'flex-start' }}>
          <button className="auth-back-btn" onClick={handleBack}>
            <ChevronLeft size={24} />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="progress-row" style={{ maxWidth: '300px', margin: '0 auto 40px auto' }}>
          <div className={`progress-dot ${step >= 1 ? 'active' : ''}`} />
          <div className={`progress-line ${step >= 2 ? 'active' : ''}`} />
          <div className={`progress-dot ${step >= 2 ? 'active' : ''}`} />
          <div className={`progress-line ${step >= 3 ? 'active' : ''}`} />
          <div className={`progress-dot ${step >= 3 ? 'active' : ''}`} />
        </div>

        <div className="slide-animation" key={step}>
          {/* Header Area */}
          <div className="auth-header-area">
            <h1 className="auth-main-title">
              {step === 1 ? "Reset Password" : step === 2 ? "Verify OTP" : "New Password"}
            </h1>
            <p className="auth-sub-title">
              {step === 1 ? "Enter your email to receive an OTP." : step === 2 ? "Enter the 6-digit OTP sent to your email." : "Make it strong and secure."}
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
              <form onSubmit={handleRequestOTP} className="input-group-dark">
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
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                  {!loading && <ArrowRight size={20} />}
                </button>
              </form>
            )}

            {/* STEP 2: OTP */}
            {step === 2 && (
              <form onSubmit={handleVerifyOTP} className="input-group-dark">
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
                <button type="button" className="resend-link" onClick={() => handleRequestOTP()}>
                  Resend Code
                </button>
              </form>
            )}

            {/* STEP 3: PASSWORD */}
            {step === 3 && (
              <form onSubmit={handleResetPassword} className="input-group-dark">
                <label className="input-label-dark">New Password</label>
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
                <button type="submit" className="glassy-btn" disabled={loading} style={{ marginTop: '24px' }}>
                  {loading ? 'Resetting...' : 'Reset Password'}
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
