import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Building2, User, Briefcase, Lock, Mail, ArrowRight, AlertCircle, Smartphone } from 'lucide-react';
import { showSuccess, showError } from '../utils/swal';
import api from '../services/api';

export default function AuthModal({ isOpen, onClose, initialRole = 'vendor', initialMode = 'login' }) {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  
  // Single Unified Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  
  // Registration specific states
  const [fullName, setFullName] = useState('');
  const [signUpRole, setSignUpRole] = useState(initialRole || 'user');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsSignUp(initialMode === 'signup');
      setEmail('');
      setPassword('');
      setPhone('');
      setFullName('');
      setSignUpRole(initialRole || 'user');
    }
  }, [isOpen, initialMode, initialRole]);

  if (!isOpen) return null;

  // Unified Form Handler with Strict Mobile & Email Validation
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSignUp) {
      // 1. Full Name Validation
      if (!fullName || fullName.trim().length < 3) {
        showError('Validation Error ⚠️', 'Please enter your full name or organization name (at least 3 characters).');
        return;
      }

      // 2. Mobile Number Format Validation
      const cleanPhone = phone.replace(/\D/g, '');
      if (!cleanPhone || cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
        showError('Validation Error ⚠️', 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
        return;
      }

      // 3. Mobile Number Uniqueness Validation
      const registeredPhones = JSON.parse(localStorage.getItem('digitasker_registered_phones') || '["9876543210", "9988776655"]');
      if (registeredPhones.includes(cleanPhone)) {
        showError('Registration Error ⚠️', 'This mobile number is already registered with another account. Please use a unique number or sign in.');
        return;
      }
    }

    // 4. Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      showError('Validation Error ⚠️', 'Please enter a valid email address (e.g. name@example.com).');
      return;
    }

    // 5. Password Validation
    if (!password || password.length < 6) {
      showError('Validation Error ⚠️', 'Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      let res;
      if (isSignUp) {
        const cleanPhone = phone.replace(/\D/g, '');
        res = await api.auth.register({
          name: fullName.trim(),
          email: email.trim(),
          phone: cleanPhone,
          password,
          role: signUpRole
        });

        // Save mobile number to registered list locally
        const existingPhones = JSON.parse(localStorage.getItem('digitasker_registered_phones') || '["9876543210", "9988776655"]');
        if (!existingPhones.includes(cleanPhone)) {
          localStorage.setItem('digitasker_registered_phones', JSON.stringify([...existingPhones, cleanPhone]));
        }

        // Save profile
        const profileData = JSON.parse(localStorage.getItem('digitasker_user_profile') || '{}');
        localStorage.setItem('digitasker_user_profile', JSON.stringify({ ...profileData, name: fullName.trim(), phone: cleanPhone, email: email.trim() }));
      } else {
        res = await api.auth.login(email.trim(), password);
      }

      // Backend returns authenticated user object with role from Database
      let detectedRole = res?.user?.role;

      // Fallback role detection if offline or default
      if (!detectedRole) {
        const lower = email.toLowerCase();
        if (lower.includes('admin')) detectedRole = 'admin';
        else if (lower.includes('client') || lower.includes('brand')) detectedRole = 'client';
        else if (lower.includes('vendor') || lower.includes('partner')) detectedRole = 'vendor';
        else detectedRole = isSignUp ? signUpRole : 'user';
      }

      const activeUser = res?.user || {
        name: isSignUp ? fullName.trim() : email.split('@')[0],
        email: email.trim(),
        phone: isSignUp ? phone.replace(/\D/g, '') : '',
        role: detectedRole
      };

      localStorage.setItem('insightloop_user', JSON.stringify(activeUser));
      localStorage.setItem('digitasker_user_profile', JSON.stringify({
        name: activeUser.name,
        email: activeUser.email,
        phone: activeUser.phone,
        role: activeUser.role,
        city: activeUser.profile?.city || 'Chandigarh',
        kycStatus: activeUser.profile?.kyc_status || 'Pending'
      }));

      const rolePathMap = {
        admin: '/admin',
        client: '/client',
        vendor: '/vendor',
        user: '/user'
      };

      const roleNameMap = {
        admin: 'Admin Operations Portal',
        client: 'Brand & Client Dashboard',
        vendor: 'Vendor & Partner Portal',
        user: 'Auditor Workspace'
      };

      const targetPath = rolePathMap[detectedRole] || '/user';

      showSuccess(
        `${isSignUp ? 'Account Created' : 'Welcome Back!'} 🚀`,
        `Authenticated as ${res?.user?.name || res?.user?.email || email}. Opening ${roleNameMap[detectedRole] || 'your dashboard'}...`
      );

      onClose();
      navigate(targetPath);
    } catch (err) {
      showError('Authentication Error', err.message || 'Registration failed or invalid login credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(6px)',
      zIndex: 2000, display: 'flex', placeItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      <div style={{
        background: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '480px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.3)', overflow: 'hidden', border: '1px solid #e2e8f0'
      }}>
        {/* Modal Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#ffffff',
          padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 800, fontSize: '18px', color: '#ffffff' }}>
              <img src="/logo.jpg" alt="DigiLites Studio" style={{ width: '34px', height: '34px', objectFit: 'contain', borderRadius: '6px' }} />
              <span>DigiLites Studio</span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#cbd5e1' }}>
              {isSignUp ? 'Create your workspace account' : 'Single Sign-In • Access your dashboard'}
            </p>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            style={{ background: 'transparent', border: 0, color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Unified Login / Registration Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {isSignUp && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Full Name / Organization Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Rahul Mehta or Apex Brands" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Mobile Number (10 Digits - Unique) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 12px', background: '#ffffff' }}>
                    <Smartphone size={16} color="#64748b" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>+91</span>
                    <input 
                      type="tel" 
                      required
                      maxLength="10"
                      placeholder="9876543210" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      style={{ width: '100%', padding: '10px 0', border: 0, fontSize: '13px', outline: 'none', background: 'transparent' }}
                    />
                  </div>
                  {phone && phone.replace(/\D/g, '').length > 0 && phone.replace(/\D/g, '').length < 10 && (
                    <span style={{ fontSize: '11px', color: '#ef4444', marginTop: '2px', display: 'block' }}>
                      Must be exactly 10 digits ({phone.replace(/\D/g, '').length}/10)
                    </span>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Account Type
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                    {[
                      ['user', 'Auditor', User],
                      ['client', 'Client / Brand', Briefcase],
                      ['vendor', 'Vendor Partner', Building2]
                    ].map(([rKey, rLabel, RIcon]) => (
                      <button
                        key={rKey}
                        type="button"
                        onClick={() => setSignUpRole(rKey)}
                        style={{
                          padding: '8px 4px', borderRadius: '8px', border: `1.5px solid ${signUpRole === rKey ? '#0066ff' : '#e2e8f0'}`,
                          background: signUpRole === rKey ? '#eff6ff' : '#ffffff', color: signUpRole === rKey ? '#0066ff' : '#64748b',
                          fontWeight: signUpRole === rKey ? 700 : 500, fontSize: '11.5px', cursor: 'pointer',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
                        }}
                      >
                        <RIcon size={16} />
                        <span>{rLabel}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Email Address <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 12px', background: '#ffffff' }}>
                <Mail size={16} color="#64748b" />
                <input 
                  type="email" 
                  required
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px 0', border: 0, fontSize: '13px', outline: 'none', background: 'transparent' }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>Password <span style={{ color: '#ef4444' }}>*</span></label>
                {!isSignUp && (
                  <span 
                    onClick={async () => {
                      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
                        showError('Validation Error ⚠️', 'Please enter a valid email address in the field below to receive a password reset link.');
                        return;
                      }
                      try {
                        const res = await api.auth.forgotPassword(email.trim());
                        showSuccess('Password Recovery Link Dispatched 📩', res.message || `Password reset instructions have been sent to ${email}.`);
                      } catch (err) {
                        showError('Password Reset Failed', err.message || 'Could not send reset link. Please check your email.');
                      }
                    }}
                    style={{ fontSize: '11px', color: '#0066ff', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Forgot password?
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 12px', background: '#ffffff' }}>
                <Lock size={16} color="#64748b" />
                <input 
                  type="password" 
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  required
                  placeholder="••••••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '10px 0', border: 0, fontSize: '13px', outline: 'none', background: 'transparent' }}
                />
              </div>
            </div>

            {!isSignUp && (
              <div style={{ fontSize: '11.5px', color: '#64748b', background: '#f1f5f9', padding: '8px 12px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={14} color="#0284c7" />
                <span>The system automatically checks your account email & opens your panel (Admin, Client, Vendor, or Auditor).</span>
              </div>
            )}

            <button 
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%', padding: '12px', borderRadius: '10px', border: 0,
                background: 'linear-gradient(135deg, #0066ff 0%, #0052cc 100%)', color: '#ffffff',
                fontWeight: 700, fontSize: '14px', cursor: isSubmitting ? 'not-allowed' : 'pointer',
                marginTop: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                opacity: isSubmitting ? 0.7 : 1, transition: 'all 0.15s ease'
              }}
            >
              {isSubmitting ? 'Authenticating...' : isSignUp ? 'Create Account & Continue' : 'Sign In'} <ArrowRight size={16} />
            </button>
          </form>

          {/* Toggle Login vs Sign Up */}
          <div style={{ marginTop: '18px', textAlign: 'center', fontSize: '12.5px', color: '#64748b' }}>
            {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
            <span 
              onClick={() => setIsSignUp(!isSignUp)}
              style={{ color: '#0066ff', fontWeight: 700, cursor: 'pointer' }}
            >
              {isSignUp ? 'Sign in here' : 'Sign up now'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
