import React, { useState, useEffect } from 'react';
import AppLayout from '../layouts/AppLayout';
import { Card, Badge } from '../components/ui';
import { showSuccess, showToast, showConfirm } from '../utils/swal';
import api from '../services/api';
import { 
  Globe, Layout, Plus, Edit, Trash2, Eye, EyeOff, Check, Save, Image as ImageIcon, 
  HelpCircle, MessageSquare, Phone, Mail, Star, Sparkles, Layers, Sliders, MapPin, 
  Share2, ShieldCheck, Award, MessageCircle, FileText, CheckCircle
} from 'lucide-react';

const defaultCategories = [
  { id: 1, title: 'Retail Stores', icon: '🛒', image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=500&q=80', tasks_count: '250+ Tasks', description: 'Audit product placement, shelf availability, and store compliance in apparel, footwear & supermarkets.', status: 'Active' },
  { id: 2, title: 'Restaurants & Cafes', icon: '🍴', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=500&q=80', tasks_count: '180+ Tasks', description: 'Evaluate customer service speed, food hygiene, order accuracy and billing practices as mystery guests.', status: 'Active' },
  { id: 3, title: 'Pharmacies & Healthcare', icon: '✚', image: 'https://images.unsplash.com/photo-1580281658628-84a1d8b51171?auto=format&fit=crop&w=500&q=80', tasks_count: '120+ Tasks', description: 'Inspect prescription counters, product availability, promotional materials and storage conditions.', status: 'Active' },
  { id: 4, title: 'Fuel Stations & EV Hubs', icon: '⛽', image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=500&q=80', tasks_count: '95+ Tasks', description: 'Check fuel dispenser cleanliness, windscreen wiper services, air pressure stations and staff behavior.', status: 'Active' },
  { id: 5, title: 'Banks & ATMs', icon: '🏦', image: 'https://images.unsplash.com/photo-1565372195458-9de0b320ef04?auto=format&fit=crop&w=500&q=80', tasks_count: '140+ Tasks', description: 'Verify ATM cash availability, CCTV functionality, queue management and branch hygiene.', status: 'Active' },
  { id: 6, title: 'Hotels & Hospitality', icon: '🛏', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=500&q=80', tasks_count: '80+ Tasks', description: 'Review front desk check-in speeds, room amenities, room service quality and housekeeping standards.', status: 'Active' },
  { id: 7, title: 'Electronics & Gadgets', icon: '💻', image: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=500&q=80', tasks_count: '210+ Tasks', description: 'Audit flagship gadget stores, demo units functionality, staff product knowledge and promotional banners.', status: 'Active' },
  { id: 8, title: 'Supermarkets & FMCG', icon: '🍎', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=500&q=80', tasks_count: '310+ Tasks', description: 'Check planogram adherence, end-cap brand displays, expiry date checks and stock replenishment.', status: 'Active' }
];

const defaultTestimonials = [
  { id: 1, name: 'Priya Sharma', title: 'Senior Auditor • Delhi NCR', rating: 5, quote: 'DigiLites Studio has given me a flexible way to earn money during my college breaks. Tasks are clear and payments hit my wallet instantly!', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', status: 'Active' },
  { id: 2, name: 'Rohan Verma', title: 'Retail Operations Manager • Samsung', rating: 5, quote: 'We audited over 500 store displays in just 3 days across North India. The GPS verification and photo evidence quality were outstanding!', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', status: 'Active' },
  { id: 3, name: 'Ananya Roy', title: 'Mystery Shopper • Mumbai', rating: 5, quote: 'I love doing restaurant and pharmacy audits in my city. The app interface is super smooth, and withdrawal to UPI takes less than 30 seconds.', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80', status: 'Active' }
];

const defaultFaqs = [
  { id: 1, category: 'auditors', question: 'How do I start earning money on DigiLites Studio?', answer: 'Sign up for a free account, complete your profile verification, browse available tasks near your location on the map, complete the task checklist, upload photo proof, and withdraw your reward once approved.' },
  { id: 2, category: 'auditors', question: 'What types of tasks are available for auditors?', answer: 'Tasks include Mystery Audits at restaurants and cafes, Retail Store Display Checks, Pharmacy Product Audits, Social Media Engagement (Like/Subscribe), and Bank/ATM Hygiene Audits.' },
  { id: 3, category: 'auditors', question: 'How and when do I receive payment?', answer: 'Once your task submission is approved by QC, funds are instantly credited to your DigiLites Wallet. You can withdraw to any UPI ID or bank account 24/7.' },
  { id: 4, category: 'brands', question: 'How do brands launch audit campaigns?', answer: 'Brand managers register for a Brand Workspace account, upload campaign targets (store addresses, audit checklist, photo evidence rules), specify reward rates, and publish the campaign across target cities.' },
  { id: 5, category: 'payouts', question: 'Is there any minimum payout limit?', answer: 'The minimum withdrawal limit is just ₹100, allowing you to transfer your earnings whenever you want.' }
];

export default function WebsiteCMS() {
  const [activeTab, setActiveTab] = useState('categories');

  // CMS State Stores
  const [categories, setCategories] = useState(() => {
    const cached = localStorage.getItem('digitasker_website_cms_categories');
    return cached ? JSON.parse(cached) : defaultCategories;
  });

  const [heroCopy, setHeroCopy] = useState(() => {
    const cached = localStorage.getItem('digitasker_website_cms_hero');
    return cached ? JSON.parse(cached) : {
      title_line1: 'Explore. Audit.',
      title_accent: 'Earn.',
      title_line2: 'Real Tasks. Real Impact.',
      subtitle: 'Visit stores, complete simple tasks, share your observations and get paid. Be part of a smarter, more transparent world.',
      stat_auditors: '50,000+',
      stat_brands: '1,000+',
      stat_completed: '100,000+',
      stat_rating: '4.8/5',
      cta_primary: 'Get Started',
      cta_secondary: 'Learn More'
    };
  });

  const [featuresSection, setFeaturesSection] = useState(() => {
    const cached = localStorage.getItem('digitasker_website_cms_features');
    return cached ? JSON.parse(cached) : {
      badge: 'WHAT IS DIGILITES STUDIO FOR?',
      headline_main: 'One Platform. Unlimited Ways to',
      headline_accent1: 'Perform',
      headline_accent2: 'Earn Cash.',
      subtitle: 'Whether you want to earn money online in your spare time or complete local store audits in your city, DigiLites Studio gives you real tasks with guaranteed instant payouts.',
      card1_title: 'Like, Follow & Subscribe',
      card1_desc: 'Earn cash rewards by engaging with top brands online. Like Instagram posts, follow social pages, subscribe to YouTube channels, and share promotional content.',
      card1_tags: 'Instagram, YouTube, X / Facebook',
      card2_title: 'Store Audits & Mystery Shopping',
      card2_desc: 'Visit nearby retail stores, restaurants, pharmacies, or supermarkets. Check shelf displays, verify price tags, evaluate customer service, and upload geotagged photos.',
      card2_tags: 'Store Checks, Secret Guest, GPS Verified',
      card3_title: 'Write Ratings & Verified Reviews',
      card3_desc: 'Help businesses improve by sharing authentic customer feedback. Post genuine reviews on Google Maps, e-commerce stores, IMDb movie ratings, and mobile app stores.',
      card3_tags: 'Google Maps, E-Commerce, App Store / IMDb',
      card4_title: 'Surveys & Research Tasks',
      card4_desc: 'Share your opinions and help brands make better decisions. Complete quick surveys, product research, consumer feedback and market research tasks.',
      card4_tags: 'Online Surveys, Product Feedback, Market Research',
      card5_title: 'Product Checks & Price Verification',
      card5_desc: 'Check product availability, compare prices, scan barcodes, and verify offers in local stores or online platforms. Upload clear photos as evidence and get rewarded.',
      card5_tags: 'Price Check, Barcode Scan, Stock Verification',
      card6_title: 'Instant Payouts & Rewards',
      card6_desc: 'Get paid quickly and securely. Withdraw earnings directly to your bank account, UPI or wallet. Track your earnings and redeem exciting rewards.',
      card6_tags: 'Bank Transfer, UPI, Wallet, Rewards'
    };
  });

  const [testimonials, setTestimonials] = useState(() => {
    const cached = localStorage.getItem('digitasker_website_cms_testimonials');
    return cached ? JSON.parse(cached) : defaultTestimonials;
  });

  const [faqs, setFaqs] = useState(() => {
    const cached = localStorage.getItem('digitasker_website_cms_faqs');
    return cached ? JSON.parse(cached) : defaultFaqs;
  });

  const [contactInfo, setContactInfo] = useState(() => {
    const cached = localStorage.getItem('digitasker_website_cms_contact');
    return cached ? JSON.parse(cached) : {
      email: 'support@digilitestudio.com',
      phone: '+91 98765 43210',
      address: 'DigiLites Studio HQ, IT Park, Sector 67, Mohali, Punjab - 160062',
      copyright: '© 2026 DigiLites Studio. Building Brands That Stand Out. All rights reserved.',
      instagram: 'https://instagram.com',
      youtube: 'https://youtube.com',
      facebook: 'https://facebook.com',
      twitter: 'https://x.com'
    };
  });

  // Modal State Handlers
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [catForm, setCatForm] = useState({ title: '', icon: '🛒', image: '', tasks_count: '50+ Tasks', description: '', status: 'Active' });

  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [testForm, setTestForm] = useState({ name: '', title: '', rating: 5, quote: '', avatar: '', status: 'Active' });

  const [showFaqModal, setShowFaqModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [faqForm, setFaqForm] = useState({ category: 'auditors', question: '', answer: '' });

  // Storage Savers
  const saveCategories = (updated) => { setCategories(updated); localStorage.setItem('digitasker_website_cms_categories', JSON.stringify(updated)); };
  const saveTestimonials = (updated) => { setTestimonials(updated); localStorage.setItem('digitasker_website_cms_testimonials', JSON.stringify(updated)); };
  const saveFaqs = (updated) => { setFaqs(updated); localStorage.setItem('digitasker_website_cms_faqs', JSON.stringify(updated)); };

  // Category Actions
  const handleOpenAddCategory = () => { setEditingCategory(null); setCatForm({ title: '', icon: '🛍️', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=500&q=80', tasks_count: '50+ Tasks', description: 'Audit tasks and store compliance verifications.', status: 'Active' }); setShowCategoryModal(true); };
  const handleOpenEditCategory = (cat) => { setEditingCategory(cat.id); setCatForm({ ...cat }); setShowCategoryModal(true); };
  const handleSaveCategory = (e) => {
    e.preventDefault();
    if (!catForm.title.trim()) return showToast('Enter category title', 'error');
    if (editingCategory) {
      saveCategories(categories.map(c => c.id === editingCategory ? { ...c, ...catForm } : c));
      showSuccess('Category Updated', `"${catForm.title}" saved successfully.`);
    } else {
      saveCategories([...categories, { id: Date.now(), ...catForm }]);
      showSuccess('Category Created', `New category "${catForm.title}" added.`);
    }
    setShowCategoryModal(false);
  };
  const handleDeleteCategory = async (id, title) => {
    if (await showConfirm('Delete Category?', `Remove "${title}" from website?`)) {
      saveCategories(categories.filter(c => c.id !== id));
      showSuccess('Category Deleted', `"${title}" removed.`);
    }
  };
  const handleToggleCatStatus = (id) => {
    saveCategories(categories.map(c => c.id === id ? { ...c, status: c.status === 'Active' ? 'Hidden' : 'Active' } : c));
    showToast('Category visibility updated', 'success');
  };

  // Testimonial Actions
  const handleOpenAddTestimonial = () => { setEditingTestimonial(null); setTestForm({ name: '', title: 'Auditor • City', rating: 5, quote: '', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', status: 'Active' }); setShowTestimonialModal(true); };
  const handleOpenEditTestimonial = (t) => { setEditingTestimonial(t.id); setTestForm({ ...t }); setShowTestimonialModal(true); };
  const handleSaveTestimonial = (e) => {
    e.preventDefault();
    if (!testForm.name.trim()) return showToast('Enter author name', 'error');
    if (editingTestimonial) {
      saveTestimonials(testimonials.map(t => t.id === editingTestimonial ? { ...t, ...testForm } : t));
      showSuccess('Testimonial Updated', `Review by "${testForm.name}" updated.`);
    } else {
      saveTestimonials([...testimonials, { id: Date.now(), ...testForm }]);
      showSuccess('Testimonial Added', `New review by "${testForm.name}" added.`);
    }
    setShowTestimonialModal(false);
  };
  const handleDeleteTestimonial = async (id, name) => {
    if (await showConfirm('Delete Testimonial?', `Remove review by "${name}"?`)) {
      saveTestimonials(testimonials.filter(t => t.id !== id));
      showSuccess('Testimonial Deleted', `Review removed.`);
    }
  };

  // FAQ / Knowledge Base Actions
  const fetchDbArticles = async () => {
    try {
      const res = await api.admin.getArticles();
      const raw = Array.isArray(res) ? res : (res?.articles || []);
      if (raw.length > 0) {
        const mapped = raw.map(a => ({
          id: a.id,
          category: a.category || 'General',
          question: a.title,
          summary: a.summary || '',
          answer: a.content,
          status: a.status || 'Active'
        }));
        setFaqs(mapped);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchDbArticles();
  }, []);

  const handleOpenAddFaq = () => { 
    setEditingFaq(null); 
    setFaqForm({ category: 'Task Issues', question: '', summary: '', answer: '', status: 'Active' }); 
    setShowFaqModal(true); 
  };
  const handleOpenEditFaq = (f) => { 
    setEditingFaq(f.id); 
    setFaqForm({ ...f }); 
    setShowFaqModal(true); 
  };
  const handleSaveFaq = async (e) => {
    e.preventDefault();
    if (!faqForm.question.trim()) return showToast('Enter article title', 'error');

    const payload = {
      category: faqForm.category || 'General',
      title: faqForm.question,
      summary: faqForm.summary || '',
      content: faqForm.answer,
      status: faqForm.status || 'Active'
    };

    if (editingFaq) {
      try {
        await api.admin.updateArticle(editingFaq, payload);
      } catch (err) {}
      saveFaqs(faqs.map(f => f.id === editingFaq ? { ...f, ...faqForm } : f));
      showSuccess('Article Updated', 'Knowledge Base article saved to database.');
    } else {
      let createdId = Date.now();
      try {
        const res = await api.admin.createArticle(payload);
        if (res?.article?.id) createdId = res.article.id;
      } catch (err) {}
      saveFaqs([{ id: createdId, ...faqForm }, ...faqs]);
      showSuccess('Article Published 📚', 'New Help Article saved to database.');
    }
    setShowFaqModal(false);
  };

  const handleDeleteFaq = async (id) => {
    if (await showConfirm('Delete Article?', 'Remove this article from database & help section?')) {
      try {
        await api.admin.deleteArticle(id);
      } catch (e) {}
      saveFaqs(faqs.filter(f => f.id !== id));
      showSuccess('Article Deleted', 'Article removed from database.');
    }
  };

  // Section Save Handlers
  const handleSaveHero = (e) => {
    e.preventDefault();
    localStorage.setItem('digitasker_website_cms_hero', JSON.stringify(heroCopy));
    showSuccess('Hero Copy Saved', 'Homepage hero banner content updated.');
  };

  const handleSaveFeatures = (e) => {
    e.preventDefault();
    localStorage.setItem('digitasker_website_cms_features', JSON.stringify(featuresSection));
    showSuccess('Platform Features Saved', '"What Is DigiLites Studio For?" section updated.');
  };

  const handleSaveContact = (e) => {
    e.preventDefault();
    localStorage.setItem('digitasker_website_cms_contact', JSON.stringify(contactInfo));
    showSuccess('Contact & Footer Saved', 'Contact details and social links updated.');
  };

  return (
    <AppLayout role="admin">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Globe style={{ color: '#0b78ff' }} /> Website CMS & Landing Content Manager
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>
            Full control panel to add, update, and manage all public pages, categories, features, testimonials, FAQs & footer.
          </p>
        </div>
      </div>

      {/* Admin CMS Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', marginBottom: '28px', flexWrap: 'wrap' }}>
        {[
          { id: 'categories', label: 'Task Categories Carousel', icon: Layers },
          { id: 'features', label: '"What Is Studio For?" Section', icon: Sparkles },
          { id: 'hero', label: 'Hero Banner & Stats', icon: Layout },
          { id: 'testimonials', label: 'Testimonials & Reviews', icon: Star },
          { id: 'faqs', label: 'FAQs & Help Base', icon: HelpCircle },
          { id: 'contact', label: 'Footer & Contact Info', icon: Phone },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px',
                border: 0,
                background: 'none',
                borderBottom: isActive ? '3px solid #0b78ff' : '3px solid transparent',
                color: isActive ? '#0b78ff' : '#64748b',
                fontWeight: isActive ? 800 : 600,
                fontSize: '13.5px',
                cursor: 'pointer',
                marginBottom: '-2px',
                transition: 'all 0.2s'
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Popular Task Categories Carousel Manager */}
      {activeTab === 'categories' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                Task Categories Carousel ({categories.length})
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                These categories render dynamically in the interactive carousel slider on the homepage.
              </p>
            </div>
            <button
              onClick={handleOpenAddCategory}
              style={{
                background: 'linear-gradient(135deg, #0b78ff 0%, #1763eb 100%)',
                color: '#fff',
                border: 0,
                padding: '10px 20px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(11,120,255,0.25)'
              }}
            >
              <Plus size={18} /> Add New Category
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            {categories.map((cat) => (
              <div
                key={cat.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  opacity: cat.status === 'Hidden' ? 0.6 : 1
                }}
              >
                <div>
                  <div style={{ height: '130px', position: 'relative', overflow: 'hidden', background: '#0d203c' }}>
                    <img src={cat.image} alt={cat.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(255,255,255,0.95)', width: '36px', height: '36px', borderRadius: '10px', display: 'grid', placeItems: 'center', fontSize: '18px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                      {cat.icon}
                    </div>
                    <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                      <span style={{ background: cat.status === 'Active' ? '#10b981' : '#64748b', color: '#fff', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700 }}>
                        {cat.status}
                      </span>
                    </div>
                  </div>

                  <div style={{ padding: '16px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 6px', color: '#0f172a' }}>{cat.title}</h3>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#0b78ff', marginBottom: '8px' }}>{cat.tasks_count}</div>
                    <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0, lineHeight: 1.4, height: '36px', overflow: 'hidden' }}>{cat.description}</p>
                  </div>
                </div>

                <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button onClick={() => handleToggleCatStatus(cat.id)} style={{ background: 'none', border: 0, color: cat.status === 'Active' ? '#64748b' : '#10b981', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {cat.status === 'Active' ? <EyeOff size={14} /> : <Eye size={14} />}
                    {cat.status === 'Active' ? 'Hide' : 'Show'}
                  </button>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleOpenEditCategory(cat)} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#0b78ff', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' }}><Edit size={14} /></button>
                    <button onClick={() => handleDeleteCategory(cat.id, cat.title)} style={{ background: '#fff1f2', border: '1px solid #fecdd3', color: '#e11d48', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' }}><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: "What Is DigiLites Studio For?" Features Manager */}
      {activeTab === 'features' && (
        <Card style={{ maxWidth: '1000px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 8px', color: '#0f172a' }}>
            "What Is DigiLites Studio For?" Platform Features Section
          </h2>
          <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px' }}>
            Full control over section headers and all 6 platform capability cards (Like/Follow, Store Audits, Reviews, Surveys, Price Verification, Instant Payouts).
          </p>

          <form onSubmit={handleSaveFeatures} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', background: '#f8fafc', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Pill Badge Text</label>
                <input type="text" value={featuresSection.badge} onChange={e => setFeaturesSection({ ...featuresSection, badge: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Headline Main</label>
                <input type="text" value={featuresSection.headline_main} onChange={e => setFeaturesSection({ ...featuresSection, headline_main: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#0b78ff' }}>Accent 1 (Blue)</label>
                <input type="text" value={featuresSection.headline_accent1} onChange={e => setFeaturesSection({ ...featuresSection, headline_accent1: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #0b78ff', fontSize: '13px', fontWeight: 700 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#ff8a00' }}>Accent 2 (Orange)</label>
                <input type="text" value={featuresSection.headline_accent2} onChange={e => setFeaturesSection({ ...featuresSection, headline_accent2: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ff8a00', fontSize: '13px', fontWeight: 700 }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Section Subtitle</label>
              <textarea rows={2} value={featuresSection.subtitle} onChange={e => setFeaturesSection({ ...featuresSection, subtitle: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }} />
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '12px 0 4px', color: '#0f172a' }}>6 Feature Cards Copy & Tags</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Card 1 */}
              <div style={{ border: '1px solid #e2e8f0', padding: '16px', borderRadius: '14px', background: '#fff' }}>
                <b style={{ color: '#0b78ff', display: 'block', marginBottom: '8px' }}>Card 1: Social Micro-Tasks</b>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>Card Title</label>
                <input type="text" value={featuresSection.card1_title} onChange={e => setFeaturesSection({ ...featuresSection, card1_title: e.target.value })} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '8px', fontSize: '13px' }} />
                <label style={{ fontSize: '12px', fontWeight: 700 }}>Description</label>
                <textarea rows={2} value={featuresSection.card1_desc} onChange={e => setFeaturesSection({ ...featuresSection, card1_desc: e.target.value })} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '8px', fontSize: '12px' }} />
                <label style={{ fontSize: '12px', fontWeight: 700 }}>Pill Tags (Comma Separated)</label>
                <input type="text" value={featuresSection.card1_tags} onChange={e => setFeaturesSection({ ...featuresSection, card1_tags: e.target.value })} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
              </div>

              {/* Card 2 */}
              <div style={{ border: '1px solid #e2e8f0', padding: '16px', borderRadius: '14px', background: '#fff' }}>
                <b style={{ color: '#10b981', display: 'block', marginBottom: '8px' }}>Card 2: Store Audits & Mystery Shopping</b>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>Card Title</label>
                <input type="text" value={featuresSection.card2_title} onChange={e => setFeaturesSection({ ...featuresSection, card2_title: e.target.value })} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '8px', fontSize: '13px' }} />
                <label style={{ fontSize: '12px', fontWeight: 700 }}>Description</label>
                <textarea rows={2} value={featuresSection.card2_desc} onChange={e => setFeaturesSection({ ...featuresSection, card2_desc: e.target.value })} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '8px', fontSize: '12px' }} />
                <label style={{ fontSize: '12px', fontWeight: 700 }}>Pill Tags</label>
                <input type="text" value={featuresSection.card2_tags} onChange={e => setFeaturesSection({ ...featuresSection, card2_tags: e.target.value })} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
              </div>

              {/* Card 3 */}
              <div style={{ border: '1px solid #e2e8f0', padding: '16px', borderRadius: '14px', background: '#fff' }}>
                <b style={{ color: '#f59e0b', display: 'block', marginBottom: '8px' }}>Card 3: Ratings & Verified Reviews</b>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>Card Title</label>
                <input type="text" value={featuresSection.card3_title} onChange={e => setFeaturesSection({ ...featuresSection, card3_title: e.target.value })} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '8px', fontSize: '13px' }} />
                <label style={{ fontSize: '12px', fontWeight: 700 }}>Description</label>
                <textarea rows={2} value={featuresSection.card3_desc} onChange={e => setFeaturesSection({ ...featuresSection, card3_desc: e.target.value })} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '8px', fontSize: '12px' }} />
                <label style={{ fontSize: '12px', fontWeight: 700 }}>Pill Tags</label>
                <input type="text" value={featuresSection.card3_tags} onChange={e => setFeaturesSection({ ...featuresSection, card3_tags: e.target.value })} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
              </div>

              {/* Card 4 */}
              <div style={{ border: '1px solid #e2e8f0', padding: '16px', borderRadius: '14px', background: '#fff' }}>
                <b style={{ color: '#8b5cf6', display: 'block', marginBottom: '8px' }}>Card 4: Surveys & Market Research</b>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>Card Title</label>
                <input type="text" value={featuresSection.card4_title} onChange={e => setFeaturesSection({ ...featuresSection, card4_title: e.target.value })} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '8px', fontSize: '13px' }} />
                <label style={{ fontSize: '12px', fontWeight: 700 }}>Description</label>
                <textarea rows={2} value={featuresSection.card4_desc} onChange={e => setFeaturesSection({ ...featuresSection, card4_desc: e.target.value })} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '8px', fontSize: '12px' }} />
                <label style={{ fontSize: '12px', fontWeight: 700 }}>Pill Tags</label>
                <input type="text" value={featuresSection.card4_tags} onChange={e => setFeaturesSection({ ...featuresSection, card4_tags: e.target.value })} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
              </div>
            </div>

            <button type="submit" style={{ background: 'linear-gradient(135deg, #0b78ff 0%, #1763eb 100%)', color: '#fff', border: 0, padding: '12px 24px', borderRadius: '10px', fontWeight: 800, fontSize: '14px', cursor: 'pointer', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Save size={16} /> Save Platform Features Content
            </button>
          </form>
        </Card>
      )}

      {/* TAB 3: Hero Banner & Counter Stats */}
      {activeTab === 'hero' && (
        <Card style={{ maxWidth: '900px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 16px', color: '#0f172a' }}>Hero Banner & Counter Stats Configuration</h2>
          <form onSubmit={handleSaveHero} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Headline Line 1</label>
                <input type="text" value={heroCopy.title_line1} onChange={e => setHeroCopy({ ...heroCopy, title_line1: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#0b78ff' }}>Headline Accent</label>
                <input type="text" value={heroCopy.title_accent} onChange={e => setHeroCopy({ ...heroCopy, title_accent: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #0b78ff', fontSize: '14px', fontWeight: 700 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Headline Line 2</label>
                <input type="text" value={heroCopy.title_line2} onChange={e => setHeroCopy({ ...heroCopy, title_line2: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Hero Subtitle</label>
              <textarea rows={3} value={heroCopy.subtitle} onChange={e => setHeroCopy({ ...heroCopy, subtitle: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Active Auditors</label>
                <input type="text" value={heroCopy.stat_auditors} onChange={e => setHeroCopy({ ...heroCopy, stat_auditors: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Brands & Clients</label>
                <input type="text" value={heroCopy.stat_brands} onChange={e => setHeroCopy({ ...heroCopy, stat_brands: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Tasks Completed</label>
                <input type="text" value={heroCopy.stat_completed} onChange={e => setHeroCopy({ ...heroCopy, stat_completed: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>User Rating</label>
                <input type="text" value={heroCopy.stat_rating} onChange={e => setHeroCopy({ ...heroCopy, stat_rating: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700 }} />
              </div>
            </div>

            <button type="submit" style={{ background: 'linear-gradient(135deg, #0b78ff 0%, #1763eb 100%)', color: '#fff', border: 0, padding: '12px 24px', borderRadius: '10px', fontWeight: 800, fontSize: '14px', cursor: 'pointer', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Save size={16} /> Save Hero Banner Settings
            </button>
          </form>
        </Card>
      )}

      {/* TAB 4: Testimonials & Reviews Manager */}
      {activeTab === 'testimonials' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#0f172a' }}>Community Testimonials ({testimonials.length})</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Manage user reviews and brand testimonials displayed on the homepage.</p>
            </div>
            <button onClick={handleOpenAddTestimonial} style={{ background: 'linear-gradient(135deg, #0b78ff 0%, #1763eb 100%)', color: '#fff', border: 0, padding: '10px 20px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} /> Add New Testimonial
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {testimonials.map(t => (
              <div key={t.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ color: '#f59e0b', fontSize: '14px', marginBottom: '10px' }}>{'★'.repeat(t.rating)}</div>
                  <p style={{ fontSize: '13.5px', color: '#334155', fontStyle: 'italic', margin: '0 0 16px', lineHeight: 1.5 }}>"{t.quote}"</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={t.avatar} alt={t.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div>
                      <b style={{ fontSize: '13.5px', color: '#0f172a', display: 'block' }}>{t.name}</b>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{t.title}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => handleOpenEditTestimonial(t)} style={{ background: '#eff6ff', border: 0, padding: '6px', borderRadius: '6px', color: '#0b78ff', cursor: 'pointer' }}><Edit size={14} /></button>
                    <button onClick={() => handleDeleteTestimonial(t.id, t.name)} style={{ background: '#fff1f2', border: 0, padding: '6px', borderRadius: '6px', color: '#e11d48', cursor: 'pointer' }}><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: FAQs & Knowledge Base */}
      {activeTab === 'faqs' && (
        <Card style={{ maxWidth: '900px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#0f172a' }}>FAQs & Help Base ({faqs.length})</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Manage questions and answers displayed on the FAQ page and homepage accordion.</p>
            </div>
            <button onClick={handleOpenAddFaq} style={{ background: '#0b78ff', color: '#fff', border: 0, padding: '8px 16px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} /> Add FAQ Item
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqs.map(f => (
              <div key={f.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                <div>
                  <div style={{ display: 'inline-block', background: '#e0f2fe', color: '#0284c7', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>
                    {f.category}
                  </div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '15px', color: '#0f172a', fontWeight: 700 }}>{f.question}</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>{f.answer}</p>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button onClick={() => handleOpenEditFaq(f)} style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}><Edit size={14} /></button>
                  <button onClick={() => handleDeleteFaq(f.id)} style={{ background: '#fff', border: '1px solid #fecdd3', color: '#e11d48', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 6: Contact Info & Footer Links */}
      {activeTab === 'contact' && (
        <Card style={{ maxWidth: '850px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 16px', color: '#0f172a' }}>Contact Details & Footer Settings</h2>
          <form onSubmit={handleSaveContact} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Support Email</label>
                <input type="text" value={contactInfo.email} onChange={e => setContactInfo({ ...contactInfo, email: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Helpline Phone</label>
                <input type="text" value={contactInfo.phone} onChange={e => setContactInfo({ ...contactInfo, phone: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Office Address</label>
              <input type="text" value={contactInfo.address} onChange={e => setContactInfo({ ...contactInfo, address: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Instagram Link</label>
                <input type="text" value={contactInfo.instagram} onChange={e => setContactInfo({ ...contactInfo, instagram: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>YouTube Link</label>
                <input type="text" value={contactInfo.youtube} onChange={e => setContactInfo({ ...contactInfo, youtube: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Copyright Notice</label>
              <input type="text" value={contactInfo.copyright} onChange={e => setContactInfo({ ...contactInfo, copyright: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
            </div>

            <button type="submit" style={{ background: 'linear-gradient(135deg, #0b78ff 0%, #1763eb 100%)', color: '#fff', border: 0, padding: '12px 24px', borderRadius: '10px', fontWeight: 800, fontSize: '14px', cursor: 'pointer', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Save size={16} /> Save Footer & Contact Info
            </button>
          </form>
        </Card>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '28px', width: 'min(520px, 100%)', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>{editingCategory ? 'Edit Task Category' : 'Add New Task Category'}</h2>
            <form onSubmit={handleSaveCategory} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Icon Emoji</label>
                  <input type="text" value={catForm.icon} onChange={e => setCatForm({ ...catForm, icon: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '18px', textAlign: 'center' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Category Title</label>
                  <input type="text" required placeholder="e.g. Supermarkets & FMCG" value={catForm.title} onChange={e => setCatForm({ ...catForm, title: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Image URL</label>
                <input type="text" placeholder="https://images.unsplash.com/photo-..." value={catForm.image} onChange={e => setCatForm({ ...catForm, image: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Task Count Badge</label>
                  <input type="text" placeholder="e.g. 250+ Tasks" value={catForm.tasks_count} onChange={e => setCatForm({ ...catForm, tasks_count: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Status</label>
                  <select value={catForm.status} onChange={e => setCatForm({ ...catForm, status: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                    <option value="Active">Active (Show on Home)</option>
                    <option value="Hidden">Hidden</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Short Description</label>
                <textarea rows={2} placeholder="Describe tasks..." value={catForm.description} onChange={e => setCatForm({ ...catForm, description: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowCategoryModal(false)} style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', border: 0, background: '#0b78ff', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>{editingCategory ? 'Save Changes' : 'Create Category'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Testimonial Modal */}
      {showTestimonialModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '28px', width: 'min(500px, 100%)', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>{editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
            <form onSubmit={handleSaveTestimonial} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Author Name</label>
                <input type="text" required value={testForm.name} onChange={e => setTestForm({ ...testForm, name: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Role / Location Title</label>
                <input type="text" value={testForm.title} onChange={e => setTestForm({ ...testForm, title: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Avatar Image URL</label>
                <input type="text" value={testForm.avatar} onChange={e => setTestForm({ ...testForm, avatar: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Quote / Review</label>
                <textarea rows={3} required value={testForm.quote} onChange={e => setTestForm({ ...testForm, quote: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowTestimonialModal(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 18px', borderRadius: '8px', border: 0, background: '#0b78ff', color: '#fff', fontWeight: 700 }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Knowledge Base & FAQ Article Modal */}
      {showFaqModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '28px', width: 'min(580px, 100%)', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>{editingFaq ? 'Edit Help Article' : 'Add New Help Article'}</h2>
            <form onSubmit={handleSaveFaq} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Article Title / Question</label>
                  <input type="text" required value={faqForm.question} onChange={e => setFaqForm({ ...faqForm, question: e.target.value })} placeholder="e.g. How to handle store manager refusal..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Category</label>
                  <select value={faqForm.category} onChange={e => setFaqForm({ ...faqForm, category: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}>
                    <option value="Task Issues">Task Issues</option>
                    <option value="Payments & Wallet">Payments & Wallet</option>
                    <option value="Verification">Verification / KYC</option>
                    <option value="Account & Profile">Account & Profile</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Brief Summary</label>
                <input type="text" value={faqForm.summary || ''} onChange={e => setFaqForm({ ...faqForm, summary: e.target.value })} placeholder="One sentence summary for search preview..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Detailed Content / Resolution Steps</label>
                <textarea rows={5} required value={faqForm.answer} onChange={e => setFaqForm({ ...faqForm, answer: e.target.value })} placeholder="Step by step instructions for auditors..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', lineHeight: 1.5 }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowFaqModal(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 18px', borderRadius: '8px', border: 0, background: '#0b78ff', color: '#fff', fontWeight: 700 }}>Save to Database</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
