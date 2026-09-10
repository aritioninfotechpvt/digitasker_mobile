import React, { useState, useEffect, useMemo } from 'react';
import AppLayout from '../layouts/AppLayout';
import { 
  Search, MessageCircle, Wallet, ClipboardList, User, ShieldCheck, 
  Plus, ChevronRight, X, HelpCircle, CheckCircle2, ThumbsUp, ArrowLeft, BookOpen 
} from 'lucide-react';
import { showSuccess, showToast, showRichModal } from '../utils/swal';
import RichTextEditor from '../components/RichTextEditor';
import api from '../services/api';

const KNOWLEDGE_BASE = {
  'Task Issues': [
    {
      id: 'kb-1',
      title: 'Store manager refused video/photo recording',
      category: 'Task Issues',
      summary: 'Steps to follow when store staff prohibits recording during mystery audit.',
      content: `If a store manager or staff prevents photo or video capture during a mystery audit:
1. **Do not argue** or violate store policies or cause disruption.
2. **Capture alternative proof**: Obtain a printed tax invoice, receipt, or take a photo of the storefront/signage from outside.
3. **Attach a note**: Mention in your task submission that staff restricted in-store recording and attach your receipt/storefront proof.
4. **Deadline Warning**: If video proof is mandatory and impossible to collect, raise a support ticket immediately before the countdown timer expires.`
    },
    {
      id: 'kb-2',
      title: 'What to do if a task gets marked for Revision',
      category: 'Task Issues',
      summary: 'How to correct and re-submit your task evidence after QC Admin feedback.',
      content: `When QC Admin requests a revision on your task submission:
1. Navigate to **My Tasks** in your user panel.
2. Look for tasks tagged with the **⚠️ Revision Requested** orange badge.
3. Click **Re-submit Evidence** to view the exact feedback from the QC Auditor.
4. Upload missing photos, clearer invoice receipts, or correct missing responses as requested.
5. Click **Submit Revision**. Your task will return to 'Pending Approval' status for re-evaluation.`
    },
    {
      id: 'kb-3',
      title: 'Task countdown timer expired',
      category: 'Task Issues',
      summary: 'Understanding strict audit deadlines and auto-release policies.',
      content: `Each accepted audit task has a strict completion countdown (e.g., 24 hours):
- Ensure you complete and submit your audit evidence before the timer reaches 00:00.
- Expired tasks are automatically released back to the task pool for other auditors.
- If you encountered technical app issues near the deadline, create a support ticket with your task title immediately.`
    },
    {
      id: 'kb-4',
      title: 'Guidelines for submitting valid proof photos & receipts',
      category: 'Task Issues',
      summary: 'How to ensure 100% approval rate on your audit task submissions.',
      content: `To guarantee fast approval by QC Admins:
- **Storefront Photos**: Ensure the full business name and entrance are clearly visible.
- **Tax Invoices**: Must show Date, Time, Store Name, and Total Paid Amount without blur.
- **Lighting & Focus**: Avoid dark, blurry, or cropped images.
- **GPS Coordinates**: Keep location permissions enabled on your device when completing local audits.`
    }
  ],
  'Payments & Wallet': [
    {
      id: 'kb-5',
      title: 'When will my withdrawal request be processed?',
      category: 'Payments & Wallet',
      summary: 'Standard payout turnaround times for UPI and Bank IMPS transfers.',
      content: `Payout execution timelines:
- **UPI Instant Transfers**: Processed within 5 to 15 minutes (available 24/7).
- **Bank IMPS / NEFT**: Processed within 2 to 4 business hours.
- Automatic payout disbursements run continuously across all registered banking accounts.
- You can monitor transaction reference numbers (UTR / RRN) in your Wallet History.`
    },
    {
      id: 'kb-6',
      title: 'Minimum withdrawal limits & payout fees',
      category: 'Payments & Wallet',
      summary: 'Wallet balance requirements and fee structures.',
      content: `Wallet Rules & Limits:
- **Minimum Withdrawal Balance**: ₹50.
- **Transaction Fees**: 0% (Zero platform fee on UPI payouts).
- Ensure your bank details or UPI ID match your registered name for seamless transfers.`
    },
    {
      id: 'kb-7',
      title: 'Failed UPI transaction or pending withdrawal status',
      category: 'Payments & Wallet',
      summary: 'Resolving delayed payments or bank processing holds.',
      content: `If your withdrawal status remains 'Processing' for over 2 hours:
1. Verify that your UPI ID (e.g., mobile@upi) is correctly saved under **Wallet > Manage Bank / UPI**.
2. Check your bank SMS or mobile banking app statement for UTR numbers.
3. If money has not arrived after 6 hours, open a Support Ticket with your withdrawal reference code.`
    }
  ],
  'Verification': [
    {
      id: 'kb-8',
      title: 'KYC Verification turnaround time & process',
      category: 'Verification',
      summary: 'How long identity verification takes and benefits of verified status.',
      content: `KYC Processing Info:
- Submitting your Aadhaar / PAN / Govt ID takes **12 to 24 hours** for verification by our compliance team.
- Verified accounts receive access to high-paying audit tasks and instant payout privileges.
- If rejected, check the rejection notes in your Profile page and re-upload clear document copies.`
    },
    {
      id: 'kb-9',
      title: 'Common reasons for KYC rejection',
      category: 'Verification',
      summary: 'Avoid common document upload errors.',
      content: `Top reasons for identity rejection:
- Document name does not match user account name.
- Blurry image or cut-off corners of ID card.
- Expired identity card.
- Re-upload clear, unedited full-color photos under **Profile > KYC Verification**.`
    }
  ],
  'Account & Profile': [
    {
      id: 'kb-10',
      title: 'Updating bank account or UPI details',
      category: 'Account & Profile',
      summary: 'Safely change your payout destination.',
      content: `To update payout methods:
1. Go to the **Wallet** section from the sidebar.
2. Click **Manage Bank / UPI**.
3. Enter your new Bank Account Number, IFSC code, or UPI VPA.
4. Save details. Future payouts will instantly route to the updated account.`
    },
    {
      id: 'kb-11',
      title: 'How to update social media links and audit interests',
      category: 'Account & Profile',
      summary: 'Get customized task recommendations based on your profile.',
      content: `Tailor tasks to your preferences:
1. Open the **Profile** tab.
2. Select your audit category interests (e.g., Restaurants, Retail, Social Media, Mystery Audit).
3. Add your YouTube, Facebook, and Instagram profile handles.
4. Click Save to receive priority task notifications matching your location and interests.`
    }
  ]
};

const defaultSamples = [
  { id: 'TKT-1042', subject: 'Task rejected incorrectly', status: 'Open', date: 'Today', body: 'The store manager refused video recording, so I uploaded invoice proof instead.' },
  { id: 'TKT-1027', subject: 'Withdrawal status update', status: 'Resolved', date: '03 Sep 2026', body: 'Payment was credited via UPI reference TXN-991823.', reply: 'Verified & credited to HDFC bank account.' }
];

export default function Support() {
  const [tickets, setTickets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeArticle, setActiveArticle] = useState(null);
  const [helpfulFeedback, setHelpfulFeedback] = useState({});
  const [kbData, setKbData] = useState(KNOWLEDGE_BASE);

  const fetchUserTickets = async () => {
    try {
      const res = await api.user.getTickets();
      const rawList = Array.isArray(res) ? res : (res?.tickets || []);
      const customList = JSON.parse(localStorage.getItem('digitasker_custom_user_tickets') || '[]');

      if (rawList.length > 0) {
        const mapped = rawList.map(t => ({
          id: t.ticket_code || `TKT-${t.id}`,
          raw_id: t.id,
          subject: t.subject,
          status: t.status || 'Open',
          date: t.created_at ? new Date(t.created_at).toLocaleDateString() : 'Today',
          body: t.body,
          reply: t.admin_reply
        }));
        const combined = [...customList, ...mapped];
        const unique = combined.filter((v, i, a) => a.findIndex(x => x.id === v.id) === i);
        setTickets(unique);
      } else if (customList.length > 0) {
        setTickets(customList);
      } else {
        setTickets(defaultSamples);
      }
    } catch (err) {
      const customList = JSON.parse(localStorage.getItem('digitasker_custom_user_tickets') || '[]');
      setTickets(customList.length > 0 ? customList : defaultSamples);
    }
  };

  useEffect(() => {
    fetchUserTickets();
    api.user.getArticles()
      .then(res => {
        const list = Array.isArray(res) ? res : (res?.articles || []);
        if (list.length > 0) {
          const grouped = { ...KNOWLEDGE_BASE };
          list.forEach(item => {
            const cat = item.category || 'General';
            if (!grouped[cat]) grouped[cat] = [];
            const exists = grouped[cat].findIndex(x => x.id === item.id || x.title === item.title);
            if (exists >= 0) {
              grouped[cat][exists] = item;
            } else {
              grouped[cat].unshift(item);
            }
          });
          setKbData(grouped);
        }
      })
      .catch(() => {});
  }, []);

  const [isCreating, setIsCreating] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newCategory, setNewCategory] = useState('General');

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    const results = [];
    Object.keys(kbData).forEach(cat => {
      (kbData[cat] || []).forEach(art => {
        if (
          art.title.toLowerCase().includes(query) ||
          (art.summary && art.summary.toLowerCase().includes(query)) ||
          (art.content && art.content.toLowerCase().includes(query)) ||
          cat.toLowerCase().includes(query)
        ) {
          results.push(art);
        }
      });
    });
    return results;
  }, [searchQuery, kbData]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newSubject) {
      showToast('Please enter a ticket subject.', 'error');
      return;
    }

    const tktId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTkt = {
      id: tktId,
      subject: newSubject,
      category: newCategory,
      status: 'Open',
      date: 'Just now',
      body: newBody || 'No details provided.'
    };

    const updated = [newTkt, ...tickets];
    setTickets(updated);
    localStorage.setItem('digitasker_custom_user_tickets', JSON.stringify(updated));

    try {
      await api.user.createTicket(newSubject, newBody, newCategory);
    } catch (err) {}

    setIsCreating(false);
    setNewSubject('');
    setNewBody('');
    showSuccess('Support Ticket Created! 🎫', `Ticket ID: ${tktId}. Saved to database.`);
  };

  const handleViewTicket = (tkt) => {
    showRichModal(
      `Support Ticket: ${tkt.id}`,
      `<div style="text-align:left;font-size:13px;color:#334155">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid #f1f5f9">
          <span style="font-weight:700;color:#0f172a">Subject: ${tkt.subject}</span>
          <span style="background:${tkt.status === 'Open' ? '#fef3c7' : '#dcfce7'};color:${tkt.status === 'Open' ? '#b45309' : '#15803d'};font-weight:700;font-size:11.5px;padding:2px 8px;border-radius:12px">${tkt.status}</span>
        </div>
        <p style="margin:0 0 10px;font-size:12px;color:#64748b">Submitted on ${tkt.date}</p>
        <p style="margin:0 0 4px;font-weight:700;color:#0f172a;font-size:12.5px">Description:</p>
        <div style="background:#f8fafc;padding:10px 12px;border-radius:8px;border:1px solid #e2e8f0;margin-bottom:12px;font-size:13px;line-height:1.5;">${tkt.body}</div>
        ${tkt.reply ? `
          <p style="color:#0066ff;font-weight:700;margin:0 0 4px;font-size:12.5px">💬 Admin / Support Response:</p>
          <div style="background:#eff6ff;padding:10px 12px;border-radius:8px;border:1px solid #bfdbfe;color:#1e3a8a;font-size:13px;line-height:1.5;">${tkt.reply}</div>
        ` : '<p style="font-size:12px;color:#94a3b8;font-style:italic;margin:0">Awaiting response from support agent...</p>'}
      </div>`
    );
  };

  const handleOpenTicketWithTopic = (topicName, categoryName) => {
    setActiveArticle(null);
    setActiveCategory(null);
    setNewCategory(categoryName || 'General');
    setNewSubject(`Inquiry about: ${topicName}`);
    setIsCreating(true);
    window.scrollTo({ top: 450, behavior: 'smooth' });
  };

  const categories = [
    { icon: ClipboardList, name: 'Task Issues', desc: 'Unable to start, complete or submit a task', color: '#0066ff' },
    { icon: Wallet, name: 'Payments & Wallet', desc: 'Payment hold, withdrawal and bank account', color: '#10b981' },
    { icon: ShieldCheck, name: 'Verification', desc: 'KYC, submission approval and revisions', color: '#8b5cf6' },
    { icon: User, name: 'Account & Profile', desc: 'Profile, interests and preferred locations', color: '#f59e0b' }
  ];

  return (
    <AppLayout role='user' title='Help & Support'>
      <div className='supportHero card' style={{ position: 'relative' }}>
        <h2>How can we help?</h2>
        <div className='supportSearch' style={{ width: '100%', maxWidth: '640px', margin: '0 auto', position: 'relative' }}>
          <Search size={18} />
          <input 
            placeholder='Search help articles, payments, task rules...' 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
            >
              <X size={16} color="#64748b" />
            </button>
          )}
        </div>

        {searchQuery.trim() !== '' && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            maxWidth: '640px',
            background: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)',
            border: '1px solid #e2e8f0',
            zIndex: 100,
            marginTop: '8px',
            maxHeight: '380px',
            overflowY: 'auto',
            textAlign: 'left'
          }}>
            <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: '600', fontSize: '13px', color: '#475569' }}>
              Found {searchResults.length} matching articles
            </div>
            {searchResults.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                No articles matching "{searchQuery}". Try searching for 'withdrawal', 'kyc', or 'revision'.
              </div>
            ) : (
              searchResults.map(art => (
                <div 
                  key={art.id}
                  onClick={() => {
                    setActiveArticle(art);
                    setSearchQuery('');
                  }}
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid #f1f5f9',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f0f7ff'}
                  onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{art.title}</span>
                    <span style={{ fontSize: '11px', background: '#eff6ff', color: '#0066ff', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>{art.category}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>{art.summary}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className='supportGrid'>
        {categories.map(({ icon: Icon, name, desc, color }) => (
          <div 
            className='card supportCard' 
            key={name}
            style={{ cursor: 'pointer', transition: 'all 0.2s ease-in-out' }}
            onClick={() => setActiveCategory(name)}
          >
            <div style={{ 
              width: '44px', height: '44px', borderRadius: '12px', background: `${color}15`, 
              display: 'flex', alignItems: 'center', justifyContent: 'center', color, marginBottom: '12px' 
            }}>
              <Icon size={22} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>{name}</h3>
            <p className='muted' style={{ fontSize: '13px', marginBottom: '12px' }}>{desc}</p>
            <button 
              className='linkBtn' 
              onClick={(e) => {
                e.stopPropagation();
                setActiveCategory(name);
              }}
              style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Browse {kbData[name]?.length || 0} articles <ChevronRight size={15} />
            </button>
          </div>
        ))}
      </div>

      {activeCategory && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px'
        }}>
          <div style={{
            background: '#ffffff', width: '100%', maxWidth: '680px', borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)', overflow: 'hidden', maxHeight: '85vh', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{
              padding: '20px 24px', background: '#0066ff', color: '#ffffff',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>
                  {activeCategory} Knowledge Base
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '13px', opacity: 0.9 }}>
                  Official guides and solutions for {activeCategory.toLowerCase()}
                </p>
              </div>
              <button 
                onClick={() => setActiveCategory(null)}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(kbData[activeCategory] || []).map(art => (
                  <div 
                    key={art.id}
                    onClick={() => {
                      setActiveArticle(art);
                    }}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      background: '#f8fafc',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#0066ff';
                      e.currentTarget.style.background = '#eff6ff';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.background = '#f8fafc';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0, fontSize: '15px', color: '#0f172a', fontWeight: '700' }}>
                        <BookOpen size={16} inline style={{ marginRight: '8px', color: '#0066ff' }} />
                        {art.title}
                      </h4>
                      <ChevronRight size={16} color="#64748b" />
                    </div>
                    <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#64748b' }}>{art.summary}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: '16px 24px', background: '#f1f5f9', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#475569' }}>Didn't find what you were looking for?</span>
              <button 
                className='primary' 
                style={{ padding: '8px 16px', fontSize: '13px' }}
                onClick={() => handleOpenTicketWithTopic(activeCategory, activeCategory)}
              >
                Create Support Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {activeArticle && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '16px'
        }}>
          <div style={{
            background: '#ffffff', width: '100%', maxWidth: '640px', borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)', overflow: 'hidden', maxHeight: '85vh', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{
              padding: '16px 24px', borderBottom: '1px solid #e2e8f0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', background: '#eff6ff', color: '#0066ff', padding: '3px 10px', borderRadius: '12px', fontWeight: '700' }}>
                  {activeArticle.category}
                </span>
              </div>
              <button 
                onClick={() => setActiveArticle(null)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 12px' }}>
                {activeArticle.title}
              </h2>
              <div style={{
                fontSize: '14px', lineHeight: '1.6', color: '#334155', whiteSpace: 'pre-line',
                background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0'
              }}>
                {activeArticle.content}
              </div>

              <div style={{ marginTop: '24px', padding: '16px', background: '#eff6ff', borderRadius: '12px', textAlign: 'center' }}>
                <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: '600', color: '#1e40af' }}>
                  Was this article helpful?
                </p>
                {helpfulFeedback[activeArticle.id] ? (
                  <span style={{ fontSize: '13px', color: '#10b981', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <CheckCircle2 size={16} /> Thank you for your feedback!
                  </span>
                ) : (
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button 
                      className='ghost' 
                      style={{ padding: '6px 16px', background: '#fff', fontSize: '13px' }}
                      onClick={() => {
                        setHelpfulFeedback(prev => ({ ...prev, [activeArticle.id]: true }));
                        showToast('Thank you for your feedback!', 'success');
                      }}
                    >
                      <ThumbsUp size={14} style={{ marginRight: '6px' }} /> Yes, helpful
                    </button>
                    <button 
                      className='ghost' 
                      style={{ padding: '6px 16px', background: '#fff', fontSize: '13px' }}
                      onClick={() => handleOpenTicketWithTopic(activeArticle.title, activeArticle.category)}
                    >
                      No, contact support
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button 
                className='ghost' 
                style={{ fontSize: '13px' }}
                onClick={() => setActiveArticle(null)}
              >
                ← Back
              </button>
              <button 
                className='primary' 
                style={{ padding: '8px 16px', fontSize: '13px' }}
                onClick={() => handleOpenTicketWithTopic(activeArticle.title, activeArticle.category)}
              >
                Still Need Help? Raise Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      <div className='card between' style={{ background: 'linear-gradient(135deg, #0066ff 0%, #0040b3 100%)', color: '#ffffff', borderRadius: '12px', padding: '14px 18px' }}>
        <div>
          <h4 style={{ color: '#ffffff', margin: '0 0 2px', fontSize: '15px', fontWeight: '700' }}>Still need help?</h4>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '12px' }}>Create a support ticket and our operations team will respond to your account.</p>
        </div>
        <button className='primary' style={{ background: '#ffffff', color: '#0066ff', fontWeight: '700', padding: '6px 14px', fontSize: '12.5px', height: '34px' }} onClick={() => setIsCreating(!isCreating)}>
          <Plus size={14} /> {isCreating ? 'Cancel Ticket' : 'New Support Ticket'}
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreateTicket} className='card stack' style={{ background: '#f8fafc', border: '2px solid #0066ff', borderRadius: '12px', padding: '16px' }}>
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>Create New Support Ticket</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '12px' }}>
            <div>
              <label style={{ fontWeight: '700', display: 'block', marginBottom: '4px', fontSize: '12px' }}>Ticket Subject</label>
              <input 
                type="text" 
                placeholder="Brief summary of your issue..."
                value={newSubject}
                onChange={e => setNewSubject(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                required
              />
            </div>
            <div>
              <label style={{ fontWeight: '700', display: 'block', marginBottom: '4px', fontSize: '12px' }}>Category</label>
              <select 
                value={newCategory} 
                onChange={e => setNewCategory(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px' }}
              >
                <option value="General">General Inquiry</option>
                <option value="Task Issues">Task Issues</option>
                <option value="Payments & Wallet">Payments & Wallet</option>
                <option value="Verification">Verification / KYC</option>
                <option value="Account & Profile">Account & Profile</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontWeight: '700', display: 'block', marginBottom: '4px', fontSize: '12px' }}>Detailed Description (CKEditor Enabled)</label>
            <RichTextEditor
              value={newBody}
              onChange={val => setNewBody(val)}
              placeholder="Describe what happened, task ID, or payment reference..."
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" className='ghost' style={{ padding: '6px 14px', fontSize: '12.5px' }} onClick={() => setIsCreating(false)}>Cancel</button>
            <button type="submit" className='primary' style={{ padding: '6px 14px', fontSize: '12.5px' }}>Submit Support Ticket</button>
          </div>
        </form>
      )}

      {/* YOUR TICKETS COMPACT LIST */}
      <div className='card' style={{ borderRadius: '12px', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>Your tickets</h4>
          <span style={{ fontSize: '11px', color: '#64748b' }}>Click any ticket to view admin responses</span>
        </div>
        {tickets.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>No support tickets submitted yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tickets.map(r => (
              <div 
                key={r.id}
                onClick={() => handleViewTicket(r)}
                style={{ 
                  cursor: 'pointer', transition: 'all 0.15s', padding: '8px 12px', borderRadius: '8px',
                  border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#bfdbfe'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
              >
                <MessageCircle size={15} color="#0066ff" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <b style={{ color: '#0f172a', fontSize: '13px', display: 'block', fontWeight: '600', lineHeight: '1.3' }}>{r.subject}</b>
                  <span style={{ display: 'block', fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{r.id} · {r.date}</span>
                </div>
                <span style={{
                  fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '12px',
                  background: r.status === 'Open' ? '#fef3c7' : '#dcfce7',
                  color: r.status === 'Open' ? '#b45309' : '#15803d'
                }}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
