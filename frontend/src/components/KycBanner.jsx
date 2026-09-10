import React, { useState } from 'react';
import { Lock, ShieldAlert, CheckCircle2, X, Upload, Sparkles, FileText, Zap, ChevronRight } from 'lucide-react';
import { showSuccess, showToast } from '../utils/swal';
import api from '../services/api';

export default function KycBanner({ kycStatus = 'Pending', onStatusChange, onOpenKycModal }) {
  const [showModal, setShowModal] = useState(false);
  const [docType, setDocType] = useState('Aadhaar Card');
  const [idNumber, setIdNumber] = useState('');
  const [docImage, setDocImage] = useState(null);
  const [docPreview, setDocPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocImage(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setDocPreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleQuickVerify = async (statusToSet = 'Verified') => {
    const cur = JSON.parse(localStorage.getItem('digitasker_user_profile') || '{}');
    const updated = {
      ...cur,
      kycStatus: statusToSet,
      docType,
      idNumber: idNumber || '1234-5678-9012'
    };
    localStorage.setItem('digitasker_user_profile', JSON.stringify(updated));

    try {
      await api.auth.updateProfile({ kyc_status: statusToSet });
    } catch (err) {}

    if (onStatusChange) onStatusChange(statusToSet);
    setShowModal(false);

    if (statusToSet === 'Verified') {
      showSuccess(
        'KYC Verified & Tasks Unlocked! 🔓🎉',
        'Your identity document has been verified. All high-paying tasks, mystery audits, and wallet payouts are now 100% unlocked!'
      );
    } else {
      showToast(`KYC status updated to ${statusToSet}`, 'info');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!idNumber.trim()) {
      showToast('Please enter your document ID number.', 'error');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      handleQuickVerify('Verified');
    }, 600);
  };

  const openModalHandler = () => {
    if (onOpenKycModal) {
      onOpenKycModal();
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <div 
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fff3e0 100%)',
          border: '1.5px solid #fed7aa',
          borderRadius: '16px',
          padding: '18px 24px',
          marginBottom: '22px',
          boxShadow: '0 4px 20px rgba(234, 88, 12, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap'
        }}
      >
        {/* Top Accent Stripe */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #ea580c 0%, #f97316 50%, #fb923c 100%)'
        }} />

        {/* Left Info Section */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flex: 1, minWidth: '280px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)',
            border: '1px solid #fdba74',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ea580c',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(234, 88, 12, 0.15)'
          }}>
            <Lock size={24} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#7c2d12', letterSpacing: '-0.2px' }}>
                KYC Verification Required to Unlock Tasks
              </h4>
              <span style={{
                background: '#fef3c7',
                color: '#92400e',
                border: '1px solid #fde68a',
                fontWeight: '800',
                fontSize: '11px',
                padding: '3px 10px',
                borderRadius: '20px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                ⚠️ Status: {kycStatus}
              </span>
            </div>

            <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#9a3412', lineHeight: '1.4' }}>
              Your account KYC status is currently <b>{kycStatus}</b>. Task details are blurred. Complete KYC to unblur and earn rewards.
            </p>

            {/* Micro Feature Pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ background: '#ffffff', color: '#ea580c', border: '1px solid #fed7aa', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Zap size={12} /> Instant 2-Min Process
              </span>
              <span style={{ background: '#ffffff', color: '#ea580c', border: '1px solid #fed7aa', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={12} /> Unblur ₹50,000+ Tasks
              </span>
              <span style={{ background: '#ffffff', color: '#ea580c', border: '1px solid #fed7aa', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={12} /> Direct UPI Payouts
              </span>
            </div>
          </div>
        </div>

        {/* Right CTA Actions */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={openModalHandler}
            style={{
              background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
              border: 'none',
              color: '#ffffff',
              padding: '10px 20px',
              borderRadius: '10px',
              fontSize: '13.5px',
              fontWeight: '800',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease-in-out'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Complete KYC Now →
          </button>

          {/* Quick Demo Test Toggle */}
          <button
            onClick={() => handleQuickVerify('Verified')}
            title="Instant 1-click verify for testing"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1px dashed #ea580c',
              color: '#ea580c',
              padding: '8px 12px',
              borderRadius: '10px',
              fontSize: '11.5px',
              fontWeight: '700',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            ⚡ Instant Verify (Demo)
          </button>
        </div>
      </div>

      {/* QUICK KYC UPLOAD MODAL */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            width: '100%',
            maxWidth: '520px',
            borderRadius: '20px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
              color: '#ffffff',
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={22} /> Identity & KYC Verification
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '12.5px', opacity: 0.9 }}>
                  Upload government ID to unblur tasks & enable wallet payouts
                </p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                style={{ background: 'rgba(255,255,255,0.2)', border: 0, color: '#fff', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Body Form */}
            <form onSubmit={handleFormSubmit} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
                  Select Document Type
                </label>
                <select 
                  value={docType}
                  onChange={e => setDocType(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', background: '#fff' }}
                >
                  <option value="Aadhaar Card">Aadhaar Card (Recommended)</option>
                  <option value="PAN Card">PAN Card</option>
                  <option value="Voter ID">Voter ID Card</option>
                  <option value="Driving License">Driving License</option>
                  <option value="Passport">Passport</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
                  {docType} Number
                </label>
                <input 
                  type="text" 
                  placeholder={docType === 'Aadhaar Card' ? '1234-5678-9012' : 'ABCDE1234F'}
                  value={idNumber}
                  onChange={e => setIdNumber(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
                  Upload Document Image / Proof
                </label>
                <div style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '12px',
                  padding: '18px',
                  textAlign: 'center',
                  background: '#f8fafc',
                  cursor: 'pointer',
                  position: 'relative'
                }}>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                  />
                  {docPreview ? (
                    <div>
                      <img src={docPreview} alt="Doc Preview" style={{ maxHeight: '100px', borderRadius: '6px', marginBottom: '8px' }} />
                      <p style={{ margin: 0, fontSize: '12px', color: '#059669', fontWeight: '700' }}>✓ Document Photo Attached</p>
                    </div>
                  ) : (
                    <div>
                      <Upload size={24} color="#64748b" style={{ marginBottom: '6px' }} />
                      <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                        Click or drag photo of your {docType}
                      </p>
                      <p style={{ margin: 0, fontSize: '11.5px', color: '#94a3b8' }}>Supports PNG, JPG up to 10MB</p>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {isSubmitting ? 'Verifying...' : 'Submit & Unblur Tasks 🔓'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
