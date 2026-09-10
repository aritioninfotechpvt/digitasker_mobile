import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthModal from '../components/AuthModal';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';
import { showSuccess, showToast, showPrompt } from '../utils/swal';
import api from '../services/api';

export default function Landing() {
  const [activeFaq, setActiveFaq] = useState(0);
  const [emailInput, setEmailInput] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRole, setAuthRole] = useState('vendor');
  const [featuredTasks, setFeaturedTasks] = useState([]);
  const [taskFilter, setTaskFilter] = useState('All');

  const defaultFeaturedTasks = [
    {
      id: 101,
      title: 'Reliance Digital Display & Stock Check',
      category: 'Mystery Audit',
      brand: 'Reliance Digital',
      location: 'Mumbai, MH • 1.2 km away',
      reward: 450,
      duration: '15 mins',
      slots: 24,
      image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=800&q=80',
      is_featured: true
    },
    {
      id: 102,
      title: 'Starbucks Cafe Mystery Guest Audit',
      category: 'Mystery Audit',
      brand: 'Starbucks',
      location: 'Delhi NCR • 2.5 km away',
      reward: 650,
      duration: '25 mins',
      slots: 12,
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      is_featured: true
    },
    {
      id: 103,
      title: 'Apollo Pharmacy Stock & Price Audit',
      category: 'Pharmacy Audit',
      brand: 'Apollo Pharmacy',
      location: 'Chandigarh • 0.8 km away',
      reward: 350,
      duration: '10 mins',
      slots: 40,
      image: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=800&q=80',
      is_featured: true
    },
    {
      id: 104,
      title: 'Croma Electronics Price Parity Check',
      category: 'Price Check',
      brand: 'Croma',
      location: 'Bangalore, KA • 3.1 km away',
      reward: 500,
      duration: '20 mins',
      slots: 18,
      image: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80',
      is_featured: true
    },
    {
      id: 105,
      title: 'Shell Fuel Station Service Quality Check',
      category: 'Store Check',
      brand: 'Shell',
      location: 'Pune, MH • 1.9 km away',
      reward: 400,
      duration: '15 mins',
      slots: 30,
      image: 'https://images.unsplash.com/photo-1527018606416-a65453770654?auto=format&fit=crop&w=800&q=80',
      is_featured: true
    },
    {
      id: 106,
      title: 'Lifestyle Apparel POP & Banner Audit',
      category: 'Store Check',
      brand: 'Lifestyle',
      location: 'Hyderabad, TS • 2.0 km away',
      reward: 550,
      duration: '20 mins',
      slots: 15,
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
      is_featured: true
    }
  ];

  useEffect(() => {
    api.public.getFeaturedTasks()
      .then(res => {
        if (res.tasks && res.tasks.length > 0) {
          const mapped = res.tasks.map(t => ({
            id: t.id,
            title: t.title,
            category: t.category || t.type || 'Mystery Audit',
            brand: t.brand || 'Partner Brand',
            location: t.location || 'Nearby Outlet',
            reward: parseFloat(t.reward_per_task) || 450,
            duration: t.duration || '15 mins',
            slots: t.quota || t.target_quota || 20,
            image: t.image || 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=800&q=80'
          }));
          setFeaturedTasks(mapped);
        } else {
          const cached = JSON.parse(localStorage.getItem('digitasker_custom_tasks') || '[]');
          const featured = cached.filter(t => t.is_featured);
          setFeaturedTasks(featured.length > 0 ? featured : defaultFeaturedTasks);
        }
      })
      .catch(() => {
        const cached = JSON.parse(localStorage.getItem('digitasker_custom_tasks') || '[]');
        const featured = cached.filter(t => t.is_featured);
        setFeaturedTasks(featured.length > 0 ? featured : defaultFeaturedTasks);
      });
  }, []);

  const [popularCategories, setPopularCategories] = useState([]);
  const categoryScrollRef = React.useRef(null);

  const defaultCategoriesList = [
    {
      id: 1,
      title: 'Retail Stores',
      icon: '🛒',
      image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=500&q=80',
      tasks_count: '250+ Tasks',
      description: 'Audit product placement, shelf availability, and store compliance.'
    },
    {
      id: 2,
      title: 'Restaurants & Cafes',
      icon: '🍴',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=500&q=80',
      tasks_count: '180+ Tasks',
      description: 'Evaluate customer service speed, food hygiene, and order accuracy.'
    },
    {
      id: 3,
      title: 'Pharmacies & Healthcare',
      icon: '✚',
      image: 'https://images.unsplash.com/photo-1580281658628-84a1d8b51171?auto=format&fit=crop&w=500&q=80',
      tasks_count: '120+ Tasks',
      description: 'Inspect prescription counters, product availability and storage conditions.'
    },
    {
      id: 4,
      title: 'Fuel Stations & EV Hubs',
      icon: '⛽',
      image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=500&q=80',
      tasks_count: '95+ Tasks',
      description: 'Check fuel dispenser cleanliness and air pressure stations.'
    },
    {
      id: 5,
      title: 'Banks & ATMs',
      icon: '🏦',
      image: 'https://images.unsplash.com/photo-1565372195458-9de0b320ef04?auto=format&fit=crop&w=500&q=80',
      tasks_count: '140+ Tasks',
      description: 'Verify ATM cash availability, CCTV functionality and branch hygiene.'
    },
    {
      id: 6,
      title: 'Hotels & Hospitality',
      icon: '🛏',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=500&q=80',
      tasks_count: '80+ Tasks',
      description: 'Review front desk check-in speeds, room amenities and housekeeping.'
    },
    {
      id: 7,
      title: 'Electronics & Gadgets',
      icon: '💻',
      image: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=500&q=80',
      tasks_count: '210+ Tasks',
      description: 'Audit gadget stores, demo units functionality and promo banners.'
    },
    {
      id: 8,
      title: 'Supermarkets & FMCG',
      icon: '🍎',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=500&q=80',
      tasks_count: '310+ Tasks',
      description: 'Check planogram adherence, end-cap displays and stock replenishment.'
    }
  ];

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

  const [testimonialsList, setTestimonialsList] = useState(() => {
    const cached = localStorage.getItem('digitasker_website_cms_testimonials');
    const defaultList = [
      { id: 1, name: 'Rajesh Sharma', title: 'VP of Trade Marketing · FMCG Retail', rating: 5, quote: 'DigiLites Studio transformed the way we track on-ground store execution across 400+ retail outlets. The photo verification accuracy and instant reports are game-changing!', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', status: 'Active' },
      { id: 2, name: 'Ananya Verma', title: 'Senior Field Auditor · 65+ Tasks', rating: 5, quote: 'I complete store audits during my free hours between college lectures. Rewards are credited directly to my UPI within 24 hours of approval. Earned over ₹18,000 last month alone!', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', status: 'Active' },
      { id: 3, name: 'Priya Nair', title: 'Operations Director · Retail Chain Group', rating: 5, quote: 'The automated GPS validation and custom checklist builder saved our operational team over 200 hours. Highly recommended for multi-city brand compliance campaigns.', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80', status: 'Active' }
    ];
    return cached ? JSON.parse(cached) : defaultList;
  });

  const [faqsList, setFaqsList] = useState(() => {
    const cached = localStorage.getItem('digitasker_website_cms_faqs');
    const defaultList = [
      { id: 1, question: 'How do I get started as a field auditor?', answer: 'Create your free account on DigiLites Studio, complete your basic profile, choose available store audits near your location, submit photo evidence and get paid after verification.' },
      { id: 2, question: 'Is there any registration fee to join?', answer: 'No, registration is 100% free for all task members and auditors.' },
      { id: 3, question: 'How and when will I get paid for completed tasks?', answer: 'Approved task rewards are automatically added to your DigiLites Wallet after verification. You can instantly withdraw funds directly to your UPI ID or bank account.' },
      { id: 4, question: 'Can I choose my own tasks and audit hours?', answer: 'Yes! You have full flexibility to select nearby mystery audits, retail checks, or survey tasks based on your convenient schedule and location.' },
      { id: 5, question: 'How do brands use DigiLites Studio for store compliance?', answer: 'Brands launch custom audit campaigns to inspect product display, pricing, stock levels, and store hygiene across nationwide retail locations with verified audit evidence.' }
    ];
    return cached ? JSON.parse(cached) : defaultList;
  });

  useEffect(() => {
    const cachedCMS = localStorage.getItem('digitasker_website_cms_categories');
    if (cachedCMS) {
      try {
        const parsed = JSON.parse(cachedCMS).filter(c => c.status !== 'Hidden');
        setPopularCategories(parsed.length > 0 ? parsed : defaultCategoriesList);
      } catch (e) {
        setPopularCategories(defaultCategoriesList);
      }
    } else {
      setPopularCategories(defaultCategoriesList);
    }
  }, []);

  const scrollCategoryCarousel = (direction) => {
    if (categoryScrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const openAuth = (role = 'vendor') => {
    setAuthRole(role);
    setShowAuthModal(true);
  };

  const toggleFaq = (idx) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    showSuccess('Subscribed Successfully!', `Thank you for subscribing (${emailInput}). You will receive task alerts and platform updates.`);
    setEmailInput('');
  };

  const handleLangSelect = async () => {
    const lang = await showPrompt('Select Language', 'Choose preferred language', 'English, Hindi, Spanish, French...');
    if (lang) {
      showToast(`Language set to ${lang}`, 'success');
    }
  };

  return (
    <div className="insight-landing">
      <style>{`
        :root{
          --blue:#0b78ff;
          --blue2:#1e5fff;
          --navy:#0d2142;
          --text:#11213b;
          --muted:#667085;
          --border:#e5eaf2;
          --bg:#f7f9fc;
          --green:#13b76b;
          --orange:#ff8a00;
          --purple:#6c3cff;
          --pink:#ff416c;
          --shadow:0 12px 35px rgba(13,33,66,.08);
          --radius:18px;
        }
        .insight-landing *{box-sizing:border-box}
        .insight-landing .hide-scrollbar::-webkit-scrollbar{display:none}
        .insight-landing .category-carousel-card:hover{transform:translateY(-6px);box-shadow:0 18px 45px rgba(11,120,255,0.2)}
        .insight-landing .category-carousel-card:hover .cat-card-img{transform:scale(1.08)}
        .insight-landing .task-hover-card:hover{transform:translateY(-4px);box-shadow:0 18px 45px rgba(15,23,42,0.12);border-color:#0b78ff;}
        .insight-landing{margin:0;font-family:'Inter',Arial,sans-serif;background:#fff;color:var(--text)}
        .insight-landing a{text-decoration:none;color:inherit}
        .insight-landing .container{width:min(1180px,calc(100% - 40px));margin:auto}
        .insight-landing .nav{height:74px;display:flex;align-items:center;justify-content:space-between;gap:24px}
        .insight-landing .logo{display:flex;align-items:center;gap:10px;font-weight:800;font-size:24px;color:#082358;text-decoration:none}
        .insight-landing .logo-mark{width:38px;height:38px;border-radius:13px;background:linear-gradient(135deg,#0b78ff,#5b3df5);position:relative;box-shadow:0 8px 20px rgba(42,86,255,.2);flex-shrink:0}
        .insight-landing .logo-mark:before,.insight-landing .logo-mark:after{content:"";position:absolute;border-radius:50%;background:white}
        .insight-landing .logo-mark:before{width:17px;height:17px;left:7px;top:10px;opacity:.95}
        .insight-landing .logo-mark:after{width:9px;height:9px;right:6px;top:7px;background:#2dd4bf}
        .insight-landing .tagline{display:block;font-size:9px;font-weight:600;color:#6c7ba1;margin-top:-4px}
        .insight-landing .nav-links{display:flex;gap:28px;font-size:14px;color:#17315c;align-items:center}
        .insight-landing .nav-links a{color:#17315c;font-weight:500;transition:color 0.2s}
        .insight-landing .nav-links a:hover{color:var(--blue)}
        .insight-landing .nav-actions{display:flex;align-items:center;gap:12px}
        .insight-landing .lang{font-size:13px;color:#23395d;padding-right:8px;cursor:pointer;font-weight:600}
        .insight-landing .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:8px;padding:12px 20px;font-weight:700;font-size:14px;border:1px solid transparent;cursor:pointer;text-decoration:none;transition:all 0.2s}
        .insight-landing .btn-primary{background:linear-gradient(135deg,var(--blue),#1763eb);color:#fff;box-shadow:0 8px 18px rgba(11,120,255,.22)}
        .insight-landing .btn-primary:hover{opacity:0.95;transform:translateY(-1px)}
        .insight-landing .btn-light{background:#fff;border-color:#d8e0ef;color:#17315c}
        .insight-landing .btn-light:hover{background:#f8fafc}
        .insight-landing .hero{position:relative;overflow:hidden;background:#0d203c;min-height:360px}
        .insight-landing .hero-bg{position:absolute;inset:0;background:linear-gradient(90deg,rgba(5,23,49,.96) 0%,rgba(6,28,58,.78) 42%,rgba(8,27,50,.18) 70%),url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80') center/cover no-repeat}
        .insight-landing .hero .container{position:relative;z-index:2;min-height:360px;display:grid;grid-template-columns:1.15fr .85fr;align-items:center}
        .insight-landing .hero-copy{padding:42px 0 30px}
        .insight-landing h1{font-size:52px;line-height:1.02;margin:0 0 18px;color:#fff;letter-spacing:-1.5px;font-weight:800}
        .insight-landing h1 .accent{color:#ffbd36}
        .insight-landing .hero-copy p{font-size:16px;line-height:1.65;color:#f1f5f9;max-width:640px;margin:0 0 24px}
        .insight-landing .hero-btns{display:flex;gap:12px;margin-bottom:26px}
        .insight-landing .hero-stats{display:flex;gap:38px;flex-wrap:wrap}
        .insight-landing .hero-stat{display:flex;gap:9px;align-items:center;color:#fff}
        .insight-landing .hero-stat i{font-size:18px;color:#fff}
        .insight-landing .hero-stat strong{display:block;font-size:17px;line-height:1.2}
        .insight-landing .hero-stat span{font-size:11px;color:#dbe4ee}
        .insight-landing .hero-person{position:relative;height:100%;min-height:350px}
        .insight-landing .person-img{position:absolute;right:0;bottom:0;width:88%;max-height:355px;object-fit:cover;object-position:center;border-top-left-radius:90px;filter:saturate(.9)}
        .insight-landing .float-card{position:absolute;background:#fff;border-radius:10px;padding:10px 14px;box-shadow:0 12px 35px rgba(0,0,0,.16);display:flex;align-items:center;gap:10px;font-size:11px;font-weight:600;color:#10213e;z-index:3}
        .insight-landing .float-card .ic{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;color:#fff}
        .insight-landing .fc1{top:65px;left:5%}
        .insight-landing .fc2{top:150px;left:8%}
        .insight-landing .fc3{top:235px;left:15%}
        .insight-landing .ic.blue{background:var(--blue)}
        .insight-landing .ic.green{background:var(--green)}
        .insight-landing .ic.pink{background:var(--pink)}
        .insight-landing .cards-strip{margin-top:16px}
        .insight-landing .feature-grid{display:grid;grid-template-columns:repeat(5,1fr);background:#fff;border:1px solid #eef2f7;border-radius:16px;box-shadow:var(--shadow);overflow:hidden}
        .insight-landing .feature{padding:28px 20px;text-align:center;border-right:1px solid #eef2f7;background:linear-gradient(180deg,#fff, #fbfcff)}
        .insight-landing .feature:last-child{border-right:0}
        .insight-landing .feature-icon{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;margin:0 auto 12px;font-size:20px}
        .insight-landing .feature:nth-child(1) .feature-icon{background:#f1e9ff;color:var(--purple)}
        .insight-landing .feature:nth-child(2) .feature-icon{background:#ffe9ef;color:var(--pink)}
        .insight-landing .feature:nth-child(3) .feature-icon{background:#e6fbef;color:var(--green)}
        .insight-landing .feature:nth-child(4) .feature-icon{background:#fff0df;color:var(--orange)}
        .insight-landing .feature:nth-child(5) .feature-icon{background:#efe9ff;color:#7748ff}
        .insight-landing .feature h3{font-size:15px;margin:0 0 7px;color:var(--text);font-weight:700}
        .insight-landing .feature p{font-size:12px;color:var(--muted);line-height:1.5;margin:0}
        .insight-landing section{padding:42px 0}
        .insight-landing .section-title{font-size:28px;margin:0 0 6px;letter-spacing:-.6px;color:var(--text);font-weight:800}
        .insight-landing .section-sub{color:var(--muted);font-size:14px;margin:0}
        .insight-landing .how-wrap{display:grid;grid-template-columns:1.1fr .9fr;gap:28px;align-items:center}
        .insight-landing .steps{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:32px;position:relative}
        .insight-landing .steps:before{content:"";height:2px;background:#e9edf4;position:absolute;top:21px;left:9%;right:9%;z-index:0}
        .insight-landing .step{position:relative;text-align:center;z-index:1}
        .insight-landing .num{width:44px;height:44px;border-radius:50%;margin:0 auto 10px;display:grid;place-items:center;color:#fff;font-weight:800;font-size:16px;border:7px solid white;box-shadow:0 0 0 1px #e7ecf4}
        .insight-landing .step:nth-child(1) .num{background:var(--blue)}
        .insight-landing .step:nth-child(2) .num{background:var(--green)}
        .insight-landing .step:nth-child(3) .num{background:var(--orange)}
        .insight-landing .step:nth-child(4) .num{background:var(--purple)}
        .insight-landing .step-icon{font-size:24px;margin-bottom:8px;color:#16213b}
        .insight-landing .step h4{margin:0 0 6px;font-size:14px;font-weight:700}
        .insight-landing .step p{margin:0;color:var(--muted);font-size:11px;line-height:1.4}
        .insight-landing .earn-card{background:linear-gradient(135deg,#f5fbff,#e8f4ff);border-radius:16px;min-height:230px;padding:32px;position:relative;overflow:hidden;display:flex;align-items:center}
        .insight-landing .earn-card h3{font-size:25px;line-height:1.18;margin:0 0 12px;max-width:280px;font-weight:800}
        .insight-landing .earn-card p{font-size:13px;line-height:1.6;color:#46546e;max-width:300px;margin-bottom:16px}
        .insight-landing .phone{position:absolute;right:10px;bottom:-10px;width:165px;height:280px;background:#111827;border-radius:28px;padding:10px;transform:rotate(-6deg);box-shadow:0 18px 40px rgba(0,0,0,.2)}
        .insight-landing .phone-screen{height:100%;border-radius:20px;background:#fff;overflow:hidden}
        .insight-landing .phone-head{height:52px;background:#0b78ff;color:#fff;padding:15px 12px;font-weight:700;font-size:12px}
        .insight-landing .phone-task{margin:10px;border:1px solid #edf0f5;border-radius:10px;padding:8px;font-size:9px;color:#334155}
        .insight-landing .phone-task b{display:block;font-size:10px;margin-bottom:4px;color:#0f172a}
        .insight-landing .categories-head{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:16px}
        .insight-landing .see-all{font-size:12px;color:#0b78ff;font-weight:700;text-decoration:none}
        .insight-landing .categories{display:grid;grid-template-columns:repeat(6,1fr);gap:10px}
        .insight-landing .cat{height:120px;border-radius:12px;overflow:hidden;position:relative;background:#ddd}
        .insight-landing .cat img{width:100%;height:100%;object-fit:cover}
        .insight-landing .cat:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 30%,rgba(0,0,0,.72))}
        .insight-landing .cat span{position:absolute;left:12px;bottom:10px;color:white;font-size:12px;font-weight:700;z-index:2}
        .insight-landing .dual{display:grid;grid-template-columns:1fr 1fr;gap:24px}
        .insight-landing .promo{border-radius:20px;padding:32px;min-height:280px;position:relative;overflow:hidden;display:flex;justify-content:space-between;align-items:stretch;gap:20px;box-shadow:0 10px 30px rgba(0,0,0,0.04);transition:all 0.25s ease}
        .insight-landing .promo:hover{transform:translateY(-3px);box-shadow:0 18px 40px rgba(0,0,0,0.08)}
        .insight-landing .promo.aud{background:linear-gradient(135deg,#fff5f7 0%,#ffe4e8 100%);border:1px solid #fecdd3}
        .insight-landing .promo.brand{background:linear-gradient(135deg,#f0f7ff 0%,#e0f2fe 100%);border:1px solid #bae6fd}
        .insight-landing .promo-content{flex:1;display:flex;flex-direction:column;justify-content:space-between;z-index:2}
        .insight-landing .promo small{display:inline-block;font-size:11px;font-weight:800;letter-spacing:0.8px;text-transform:uppercase;padding:4px 12px;border-radius:999px;margin-bottom:12px;width:fit-content}
        .insight-landing .promo.aud small{background:#ffe4e8;color:#e11d48}
        .insight-landing .promo.brand small{background:#e0f2fe;color:#0284c7}
        .insight-landing .promo h3{font-size:24px;line-height:1.25;margin:0 0 14px;color:#0f172a !important;font-weight:800;letter-spacing:-0.5px}
        .insight-landing .checks{list-style:none;padding:0;margin:0 0 20px}
        .insight-landing .checks li{font-size:13px;margin:8px 0;color:#334155;font-weight:600;display:flex;align-items:center;gap:8px}
        .insight-landing .checks li i{color:#10b981;font-size:14px}
        .insight-landing .promo-image-box{width:160px;min-height:200px;border-radius:16px;overflow:hidden;position:relative;flex-shrink:0;box-shadow:0 8px 24px rgba(0,0,0,0.12)}
        .insight-landing .promo-image-box img{width:100%;height:100%;object-fit:cover;object-position:center top}
        .insight-landing .brand-logos{display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin-top:16px}
        .insight-landing .brand-pill{font-weight:700;color:#1e293b;background:#fff;padding:10px 18px;border-radius:10px;border:1px solid #e2e8f0;font-size:13px;box-shadow:0 2px 6px rgba(0,0,0,0.02);transition:all 0.2s}
        .insight-landing .brand-pill:hover{border-color:#0b78ff;color:#0b78ff;transform:translateY(-1px)}
        .insight-landing .testimonial-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
        .insight-landing .testimonial-card{background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;padding:28px;box-shadow:0 10px 30px rgba(15,23,42,0.04);display:flex;flex-direction:column;justify-content:space-between;transition:all 0.25s ease}
        .insight-landing .testimonial-card:hover{transform:translateY(-4px);box-shadow:0 18px 45px rgba(15,23,42,0.08);border-color:#cbd5e1}
        .insight-landing .stars{font-size:14px;margin-bottom:12px;letter-spacing:2px}
        .insight-landing .quote-text{font-size:13.5px;line-height:1.65;color:#334155;margin:0 0 20px;font-style:italic;font-weight:500}
        .insight-landing .author-box{display:flex;align-items:center;gap:12px;border-top:1px solid #f1f5f9;padding-top:16px;margin-top:auto}
        .insight-landing .author-box img{width:44px;height:44px;border-radius:50%;object-fit:cover;border:2px solid #0b78ff}
        .insight-landing .author-box b{display:block;font-size:14px;color:#0f172a;font-weight:700}
        .insight-landing .author-box span{font-size:11px;color:#64748b}
        .insight-landing .bottom-grid{display:grid;grid-template-columns:1fr 1fr;gap:28px;align-items:start}
        .insight-landing .app-card{background:linear-gradient(135deg,#0d203c 0%,#1e3a8a 100%);border-radius:20px;padding:32px;color:#ffffff;box-shadow:0 14px 40px rgba(13,32,60,0.15);display:flex;flex-direction:column;gap:24px}
        .insight-landing .app-card h3{font-size:24px;margin:0 0 8px;font-weight:800;color:#ffffff;letter-spacing:-0.5px}
        .insight-landing .app-card p{font-size:13.5px;color:#cbd5e1;margin:0;line-height:1.5}
        .insight-landing .app-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,0.12);padding:5px 12px;border-radius:999px;font-size:11px;font-weight:700;color:#38bdf8;width:fit-content}
        .insight-landing .qr-row{display:flex;align-items:center;gap:18px;background:rgba(255,255,255,0.06);padding:16px;border-radius:14px;border:1px solid rgba(255,255,255,0.1)}
        .insight-landing .qr{width:76px;height:76px;background:#ffffff;border-radius:10px;padding:6px;display:grid;place-items:center;flex-shrink:0}
        .insight-landing .store-btns{display:flex;gap:10px;width:100%}
        .insight-landing .store{flex:1;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.18);color:#fff;border-radius:10px;padding:10px 14px;font-size:11.5px;cursor:pointer;display:flex;align-items:center;gap:10px;transition:all 0.2s}
        .insight-landing .store:hover{background:rgba(255,255,255,0.22);transform:translateY(-1px)}
        .insight-landing .faq h3{font-size:22px;margin:0 0 16px;font-weight:800;color:#0f172a}
        .insight-landing .faq-item{border:1px solid #e2e8f0;background:#f8fafc;border-radius:12px;margin:10px 0;overflow:hidden;transition:all 0.2s}
        .insight-landing .faq-item.open{background:#ffffff;border-color:#0b78ff;box-shadow:0 8px 24px rgba(11,120,255,0.08)}
        .insight-landing .faq-q{padding:16px 18px;display:flex;justify-content:space-between;align-items:center;font-size:13.5px;font-weight:700;color:#0f172a;cursor:pointer;user-select:none}
        .insight-landing .faq-q span{width:24px;height:24px;border-radius:50%;background:#e2e8f0;display:grid;place-items:center;font-size:14px;color:#334155;transition:all 0.2s}
        .insight-landing .faq-item.open .faq-q span{background:#0b78ff;color:#ffffff}
        .insight-landing .faq-a{padding:0 18px 18px;color:#475569;font-size:13px;line-height:1.6}
        .insight-landing footer{border-top:1px solid #e8edf4;background:#fbfcfe;padding:26px 0 12px}
        .insight-landing .footer-grid{display:grid;grid-template-columns:1.2fr .8fr .8fr .8fr 1.6fr;gap:20px}
        .insight-landing footer h4{font-size:12px;margin:0 0 10px;font-weight:700;color:#0f172a}
        .insight-landing footer a,.insight-landing footer p{display:block;font-size:11px;color:#667085;margin:7px 0;text-decoration:none}
        .insight-landing .socials{display:flex;gap:8px}
        .insight-landing .socials i{width:28px;height:28px;border-radius:50%;background:#eef4ff;color:#0b78ff;display:grid;place-items:center;font-size:12px;cursor:pointer}
        .insight-landing .newsletter{background:#f3f7ff;border-radius:12px;padding:16px}
        .insight-landing .newsletter h4{margin-bottom:4px}
        .insight-landing .newsletter p{margin:0 0 10px}
        .insight-landing .subscribe{display:flex;gap:8px}
        .insight-landing .subscribe input{flex:1;border:1px solid #dfe6f1;border-radius:8px;padding:10px;font-size:11px;outline:none}
        .insight-landing .copy{margin-top:22px;padding-top:12px;border-top:1px solid #edf1f6;display:flex;justify-content:space-between;color:#8792a5;font-size:10px}
        @media(max-width:980px){
          .insight-landing .nav-links{display:none}
          .insight-landing .hero .container,.insight-landing .how-wrap,.insight-landing .trust,.insight-landing .bottom-grid{grid-template-columns:1fr}
          .insight-landing .hero-person{display:none}
          .insight-landing .hero-copy{padding:50px 0}
          .insight-landing .feature-grid{grid-template-columns:repeat(2,1fr)}
          .insight-landing .feature{border-bottom:1px solid #eef2f7}
          .insight-landing .categories{grid-template-columns:repeat(3,1fr)}
          .insight-landing .dual{grid-template-columns:1fr}
          .insight-landing .promo-person{opacity:.4}
          .insight-landing .footer-grid{grid-template-columns:repeat(2,1fr)}
          .insight-landing .hero-banner-grid{grid-template-columns:1fr;text-align:center}
          .insight-landing .banner-strip-grid{grid-template-columns:repeat(2,1fr)}
          .insight-landing .cards-3x2-grid{grid-template-columns:repeat(2,1fr)}
          .insight-landing .app-download-bar{flex-direction:column;align-items:flex-start}
        }
        @media(max-width:640px){
          .insight-landing .container{width:min(100% - 24px,1180px)}
          .insight-landing h1{font-size:38px}
          .insight-landing .hero-stats{gap:18px}
          .insight-landing .feature-grid{grid-template-columns:1fr}
          .insight-landing .steps{grid-template-columns:repeat(2,1fr)}
          .insight-landing .steps:before{display:none}
          .insight-landing .categories{grid-template-columns:repeat(2,1fr)}
          .insight-landing .nav-actions .lang,.insight-landing .btn-light{display:none}
          .insight-landing .footer-grid{grid-template-columns:1fr}
          .insight-landing .app-card{flex-direction:column;align-items:flex-start;gap:18px}
          .insight-landing .phone{display:none}
          .insight-landing .banner-strip-grid{grid-template-columns:1fr}
          .insight-landing .cards-3x2-grid{grid-template-columns:1fr}
        }
      `}</style>

      {/* Public Navigation Header */}
      <PublicHeader onOpenAuth={openAuth} />

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="hero-bg"></div>
        <div className="container">
          <div className="hero-copy">
            <h1>
              {heroCopy.title_line1 || 'Explore. Audit.'} <span className="accent">{heroCopy.title_accent || 'Earn.'}</span>
              <br />
              {heroCopy.title_line2 || 'Real Tasks. Real Impact.'}
            </h1>
            <p>
              {heroCopy.subtitle || 'Visit stores, complete simple tasks, share your observations and get paid. Be part of a smarter, more transparent world.'}
            </p>
            <div className="hero-btns">
              <button className="btn btn-primary" onClick={() => openAuth('user')}>
                {heroCopy.cta_primary || 'Get Started'}
              </button>
              <a href="#how" className="btn btn-light">
                {heroCopy.cta_secondary || 'Learn More'}
              </a>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <i className="fa-solid fa-users"></i>
                <div>
                  <strong>{heroCopy.stat_auditors || '50,000+'}</strong>
                  <span>Active Auditors</span>
                </div>
              </div>
              <div className="hero-stat">
                <i className="fa-solid fa-building-shield"></i>
                <div>
                  <strong>{heroCopy.stat_brands || '1,000+'}</strong>
                  <span>Brands & Clients</span>
                </div>
              </div>
              <div className="hero-stat">
                <i className="fa-solid fa-clipboard-check"></i>
                <div>
                  <strong>{heroCopy.stat_completed || '100,000+'}</strong>
                  <span>Tasks Completed</span>
                </div>
              </div>
              <div className="hero-stat">
                <i className="fa-solid fa-star"></i>
                <div>
                  <strong>{heroCopy.stat_rating || '4.8/5'}</strong>
                  <span>User Rating</span>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-person">
            <img
              className="person-img"
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80"
              alt="Auditor using mobile phone"
            />
            <div className="float-card fc1">
              <span className="ic green">
                <i className="fa-solid fa-check"></i>
              </span>
              <span>
                Task Completed<br />
                <b>+ ₹300 Earned</b>
              </span>
            </div>
            <div className="float-card fc2">
              <span className="ic blue">
                <i className="fa-solid fa-location-dot"></i>
              </span>
              <span>
                Visit Nearby Store<br />
                <b>Check Product Display</b>
              </span>
            </div>
            <div className="float-card fc3">
              <span className="ic pink">
                <i className="fa-solid fa-camera"></i>
              </span>
              <span>
                Share Photos<br />
                <b>& Answer Questions</b>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 5 Feature Strip */}
      <div className="container cards-strip">
        <div className="feature-grid">
          <div className="feature">
            <div className="feature-icon">
              <i className="fa-solid fa-wallet"></i>
            </div>
            <h3>Earn on the Go</h3>
            <p>Complete simple tasks and get paid.</p>
          </div>
          <div className="feature">
            <div className="feature-icon">
              <i className="fa-solid fa-location-dot"></i>
            </div>
            <h3>Explore Nearby</h3>
            <p>Find tasks near your location.</p>
          </div>
          <div className="feature">
            <div className="feature-icon">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <h3>Trusted & Secure</h3>
            <p>Your data and payments are always safe.</p>
          </div>
          <div className="feature">
            <div className="feature-icon">
              <i className="fa-solid fa-star"></i>
            </div>
            <h3>Work with Top Brands</h3>
            <p>Be a part of leading companies.</p>
          </div>
          <div className="feature">
            <div className="feature-icon">
              <i className="fa-solid fa-chart-line"></i>
            </div>
            <h3>Flexible & Easy</h3>
            <p>Choose tasks. Work on your time.</p>
          </div>
        </div>
      </div>

      {/* Featured Audit Tasks Section */}
      <section style={{ padding: '70px 0', background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }} id="featured-tasks">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 40px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px', letterSpacing: '-0.5px' }}>
              Explore Featured Tasks & Start Earning
            </h2>
            <p style={{ fontSize: '15px', color: '#64748b', margin: 0, lineHeight: 1.6 }}>
              Select an audit task near your location, visit the store, submit photo evidence, and get cash directly to your DigiLites wallet.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '32px' }}>
            {['All', 'Mystery Audit', 'Store Check', 'Price Check', 'Pharmacy Audit'].map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setTaskFilter(cat)}
                style={{
                  padding: '9px 20px',
                  borderRadius: '999px',
                  fontSize: '13px',
                  fontWeight: 700,
                  border: taskFilter === cat ? '1px solid #0b78ff' : '1px solid #cbd5e1',
                  background: taskFilter === cat ? '#0b78ff' : '#ffffff',
                  color: taskFilter === cat ? '#ffffff' : '#334155',
                  cursor: 'pointer',
                  boxShadow: taskFilter === cat ? '0 6px 16px rgba(11,120,255,0.25)' : '0 2px 6px rgba(0,0,0,0.02)',
                  transition: 'all 0.2s'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Task Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '26px' }}>
            {featuredTasks
              .filter(t => taskFilter === 'All' || (t.category && t.category.toLowerCase().includes(taskFilter.toLowerCase())))
              .slice(0, 6)
              .map((t, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '18px',
                    overflow: 'hidden',
                    boxShadow: '0 8px 24px rgba(15,23,42,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.25s ease'
                  }}
                  className="task-hover-card"
                >
                  <div>
                    {/* Task Image & Payout Badge */}
                    <div style={{ height: '170px', position: 'relative', overflow: 'hidden', background: '#0d203c' }}>
                      <img
                        src={t.image || 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=800&q=80'}
                        alt={t.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(15,23,42,0.7) 100%)' }}></div>
                      
                      <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(4px)', color: '#ffffff', padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700 }}>
                        {t.category || 'Audit Task'}
                      </div>

                      <div style={{ position: 'absolute', top: '12px', right: '12px', background: '#10b981', color: '#ffffff', padding: '5px 12px', borderRadius: '999px', fontSize: '13px', fontWeight: 800, boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>
                        ₹{t.reward}
                      </div>

                      <div style={{ position: 'absolute', bottom: '10px', left: '12px', color: '#ffffff', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <i className="fa-solid fa-store" style={{ color: '#38bdf8' }}></i> {t.brand}
                      </div>
                    </div>

                    {/* Task Content */}
                    <div style={{ padding: '20px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px', lineHeight: 1.35 }}>
                        {t.title}
                      </h3>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b', marginBottom: '14px' }}>
                        <i className="fa-solid fa-location-dot" style={{ color: '#ef4444' }}></i>
                        <span>{t.location || 'Nearby Outlet'}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9', fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                        <span>⏱️ {t.duration || '15 mins'}</span>
                        <span style={{ color: '#0284c7' }}>⚡ {t.slots || 20} slots left</span>
                      </div>
                    </div>
                  </div>

                  {/* Task CTA */}
                  <div style={{ padding: '0 20px 20px' }}>
                    <button
                      onClick={() => openAuth('user')}
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #0b78ff 0%, #1763eb 100%)',
                        color: '#ffffff',
                        border: 0,
                        padding: '12px',
                        borderRadius: '10px',
                        fontWeight: 800,
                        fontSize: '13.5px',
                        cursor: 'pointer',
                        boxShadow: '0 6px 18px rgba(11,120,255,0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      <span>Claim Task / Audit Now</span>
                      <i className="fa-solid fa-arrow-right" style={{ fontSize: '12px' }}></i>
                    </button>
                  </div>
                </div>
              ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '36px' }}>
            <button
              onClick={() => openAuth('user')}
              className="btn btn-light"
              style={{ padding: '12px 28px', fontSize: '14px', fontWeight: 800, borderRadius: '10px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
            >
              Explore 100+ Live Tasks <i className="fa-solid fa-chevron-right" style={{ marginLeft: '6px', fontSize: '12px' }}></i>
            </button>
          </div>
        </div>
      </section>

      {/* Pixel-Perfect "What is DigiLites Studio For?" & Mystery Audit Master Section */}
      <section id="platform-features" style={{ margin: 0, padding: 0 }}>
        {/* Part 1: Top Dark Navy Banner */}
        <div style={{ background: '#091e42', padding: '60px 0 36px', position: 'relative', overflow: 'hidden', color: '#ffffff' }}>
          {/* Subtle glow background */}
          <div style={{ position: 'absolute', top: '-120px', left: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(11,120,255,0.2) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
          <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '450px', height: '450px', background: 'radial-gradient(circle, rgba(255,189,54,0.15) 0%, transparent 70%)', pointerEvents: 'none' }}></div>

          <div className="container" style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 280px', gap: '20px', alignItems: 'center' }} className="hero-banner-grid">
              
              {/* Left Column: Brand Pillars */}
              <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, color: '#ffffff', fontSize: '28px', lineHeight: 1.25, opacity: 0.95 }}>
                <span style={{ display: 'block', color: '#ffffff' }}>Explore.</span>
                <span style={{ display: 'block', margin: '4px 0', color: '#ffffff' }}>Perform.</span>
                <span style={{ display: 'block', color: '#ffbd36' }}>Earn.</span>
              </div>

              {/* Center Column: Badge & Title */}
              <div style={{ textAlign: 'center', padding: '0 10px' }}>
                <span style={{ background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.3)', color: '#38bdf8', padding: '5px 16px', borderRadius: '999px', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'inline-block', marginBottom: '14px' }}>
                  {featuresSection.badge || 'WHAT IS DIGILITES STUDIO FOR?'}
                </span>
                <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '38px', fontWeight: 800, color: '#ffffff', margin: '0 0 14px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
                  Shop, Review & Answer Questions
                  <br />
                  <span style={{ color: '#ffbd36' }}>Earn Cash on Every Visit</span>
                </h2>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#cbd5e1', margin: '0 auto', maxWidth: '640px', lineHeight: 1.65, fontWeight: 400 }}>
                  {featuresSection.subtitle || 'Turn your routine store visits, online purchases, and quick opinions into guaranteed payouts. Become an authorized DigiLites Mystery Auditor today!'}
                </p>
              </div>

              {/* Right Column: Smiling Woman with Phone & Sticker */}
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                <div style={{ position: 'relative', width: '220px', height: '240px' }}>
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"
                    alt="DigiLites Auditor"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '24px', filter: 'brightness(0.95)' }}
                  />
                  {/* Floating Sticker */}
                  <div style={{ position: 'absolute', top: '16px', right: '-15px', background: '#ffffff', color: '#0f172a', padding: '8px 14px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.25)', fontSize: '11px', fontWeight: 800, textAlign: 'center', border: '1px solid #e2e8f0', transform: 'rotate(5deg)' }}>
                    Small Tasks<br />
                    <span style={{ color: '#0b78ff' }}>Big Rewards!</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom 4 Feature Strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '40px', background: 'rgba(255,255,255,0.06)', padding: '16px 24px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.1)' }} className="banner-strip-grid">
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #0b78ff, #1d4ed8)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: '18px', flexShrink: 0 }}>
                  🛒
                </div>
                <div>
                  <b style={{ display: 'block', fontSize: '13px', color: '#ffffff' }}>Real Tasks</b>
                  <span style={{ fontSize: '11px', color: '#cbd5e1' }}>In Stores & Online</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: '18px', flexShrink: 0 }}>
                  🎒
                </div>
                <div>
                  <b style={{ display: 'block', fontSize: '13px', color: '#ffffff' }}>Simple Steps</b>
                  <span style={{ fontSize: '11px', color: '#cbd5e1' }}>Complete & Earn</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: '18px', flexShrink: 0 }}>
                  🏛️
                </div>
                <div>
                  <b style={{ display: 'block', fontSize: '13px', color: '#ffffff' }}>Trusted Brands</b>
                  <span style={{ fontSize: '11px', color: '#cbd5e1' }}>Top Companies</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #ff8a00, #ea580c)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: '18px', flexShrink: 0 }}>
                  👛
                </div>
                <div>
                  <b style={{ display: 'block', fontSize: '13px', color: '#ffffff' }}>Fast Payments</b>
                  <span style={{ fontSize: '11px', color: '#cbd5e1' }}>Direct to Your Bank</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Part 2: 6 Cards 3x2 Grid Section */}
        <div style={{ background: '#f4f7fb', padding: '60px 0' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '26px' }} className="cards-3x2-grid">

              {/* Card 1: Shop & Earn (Pink) */}
              <div style={{ background: 'linear-gradient(180deg, #fff5f7 0%, #ffffff 100%)', border: '1px solid #fecdd3', borderRadius: '24px', padding: '26px', boxShadow: '0 10px 30px rgba(225,29,72,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.25s ease' }} className="task-hover-card">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
                    <span style={{ background: '#ffe4e6', color: '#e11d48', padding: '5px 14px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      🛒 SHOP & EARN
                    </span>

                    {/* Product Box Graphic */}
                    <div style={{ width: '110px', height: '80px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '70px', height: '55px', background: '#fbcfe8', borderRadius: '12px', border: '1px solid #f472b6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', boxShadow: '0 6px 16px rgba(225,29,72,0.15)', transform: 'rotate(-4deg)' }}>
                        📦
                      </div>
                      <div style={{ position: 'absolute', top: '0', right: '5px', background: '#e11d48', color: '#fff', width: '24px', height: '24px', borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}>
                        ❤️
                      </div>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px', letterSpacing: '-0.4px' }}>
                    {featuresSection.card1_title || 'Order or Buy Featured Products'}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, margin: '0 0 20px', fontWeight: 500 }}>
                    {featuresSection.card1_desc || 'Order or buy featured products from partner brands. Test the items, write verified customer reviews, and enjoy extra payout.'}
                  </p>

                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li style={{ fontSize: '12.5px', color: '#334155', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fa-solid fa-circle-check" style={{ color: '#e11d48' }}></i> Try new products
                    </li>
                    <li style={{ fontSize: '12.5px', color: '#334155', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fa-solid fa-circle-check" style={{ color: '#e11d48' }}></i> Share unboxing reviews
                    </li>
                    <li style={{ fontSize: '12.5px', color: '#334155', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fa-solid fa-circle-check" style={{ color: '#e11d48' }}></i> Full reimbursement to wallet
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => openAuth('user')}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)',
                    color: '#ffffff',
                    border: 0,
                    padding: '12px',
                    borderRadius: '999px',
                    fontWeight: 800,
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    boxShadow: '0 6px 18px rgba(255,65,108,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span>Explore Shop Tasks</span>
                  <i className="fa-solid fa-arrow-right" style={{ fontSize: '12px' }}></i>
                </button>
              </div>

              {/* Card 2: Mystery Store Audits (Blue) */}
              <div style={{ background: 'linear-gradient(180deg, #f0f7ff 0%, #ffffff 100%)', border: '1px solid #bae6fd', borderRadius: '24px', padding: '26px', boxShadow: '0 10px 30px rgba(2,132,199,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.25s ease' }} className="task-hover-card">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
                    <span style={{ background: '#e0f2fe', color: '#0284c7', padding: '5px 14px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      🏬 STORE AUDITS
                    </span>

                    {/* Store Visit Mockup Graphic */}
                    <div style={{ width: '120px', height: '80px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '85px', height: '60px', background: '#0284c7', borderRadius: '10px', color: '#fff', padding: '6px', fontSize: '9px', fontWeight: 800, textAlign: 'center', boxShadow: '0 6px 16px rgba(2,132,199,0.2)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <span>STORE VISIT</span>
                        <span style={{ fontSize: '8px', opacity: 0.85, marginTop: '2px' }}>📍 Audit Active</span>
                      </div>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px', letterSpacing: '-0.4px' }}>
                    {featuresSection.card2_title || 'Mystery Store Audits'}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, margin: '0 0 20px', fontWeight: 500 }}>
                    {featuresSection.card2_desc || 'Visit top retail stores, cafés, petrol pumps, and more as an incognito shopper. Evaluate store hygiene, staff behavior and promotional activities.'}
                  </p>

                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li style={{ fontSize: '12.5px', color: '#334155', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fa-solid fa-circle-check" style={{ color: '#0284c7' }}></i> Check product placement
                    </li>
                    <li style={{ fontSize: '12.5px', color: '#334155', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fa-solid fa-circle-check" style={{ color: '#0284c7' }}></i> Assess customer service
                    </li>
                    <li style={{ fontSize: '12.5px', color: '#334155', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fa-solid fa-circle-check" style={{ color: '#0284c7' }}></i> Verify pricing & displays
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => openAuth('user')}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #0b78ff 0%, #1763eb 100%)',
                    color: '#ffffff',
                    border: 0,
                    padding: '12px',
                    borderRadius: '999px',
                    fontWeight: 800,
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    boxShadow: '0 6px 18px rgba(11,120,255,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span>Claim Audit Tasks</span>
                  <i className="fa-solid fa-arrow-right" style={{ fontSize: '12px' }}></i>
                </button>
              </div>

              {/* Card 3: Quick Surveys (Green) */}
              <div style={{ background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)', border: '1px solid #bbf7d0', borderRadius: '24px', padding: '26px', boxShadow: '0 10px 30px rgba(16,185,129,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.25s ease', position: 'relative' }} className="task-hover-card">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
                    <span style={{ background: '#dcfce7', color: '#15803d', padding: '5px 14px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      ❓ QUICK SURVEYS
                    </span>

                    {/* Opinion Matters Cursive Badge */}
                    <div style={{ position: 'relative' }}>
                      <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#0284c7', fontSize: '12px', fontWeight: 'bold', display: 'block', transform: 'rotate(-6deg)' }}>
                        Your Opinion<br />Matters!
                      </span>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px', letterSpacing: '-0.4px' }}>
                    {featuresSection.card4_title || 'Answer Simple Questions'}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, margin: '0 0 20px', fontWeight: 500 }}>
                    {featuresSection.card4_desc || 'Answer quick 2–5 minute multiple-choice questions on your smartphone. Share feedback on product availability, brand awareness or service speed.'}
                  </p>

                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li style={{ fontSize: '12.5px', color: '#334155', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fa-solid fa-circle-check" style={{ color: '#10b981' }}></i> Instant 2-minute surveys
                    </li>
                    <li style={{ fontSize: '12.5px', color: '#334155', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fa-solid fa-circle-check" style={{ color: '#10b981' }}></i> Easy tap-to-answer
                    </li>
                    <li style={{ fontSize: '12.5px', color: '#334155', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fa-solid fa-circle-check" style={{ color: '#10b981' }}></i> Immediate reward confirmation
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => openAuth('user')}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#ffffff',
                    border: 0,
                    padding: '12px',
                    borderRadius: '999px',
                    fontWeight: 800,
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    boxShadow: '0 6px 18px rgba(16,185,129,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span>Start Answering</span>
                  <i className="fa-solid fa-arrow-right" style={{ fontSize: '12px' }}></i>
                </button>
              </div>

              {/* Card 4: Write Reviews (Purple) */}
              <div style={{ background: 'linear-gradient(180deg, #f3e8ff 0%, #ffffff 100%)', border: '1px solid #e9d5ff', borderRadius: '24px', padding: '26px', boxShadow: '0 10px 30px rgba(124,58,237,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.25s ease' }} className="task-hover-card">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
                    <span style={{ background: '#f3e8ff', color: '#7e22ce', padding: '5px 14px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      ⭐ WRITE REVIEWS
                    </span>

                    {/* Google Review Card Graphic */}
                    <div style={{ width: '110px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '6px 8px', boxShadow: '0 6px 16px rgba(0,0,0,0.08)', fontSize: '9px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#4285f4', fontWeight: 800 }}>
                        <i className="fa-brands fa-google"></i> Google
                      </div>
                      <div style={{ color: '#f59e0b', fontSize: '9px', margin: '2px 0' }}>★★★★★</div>
                      <div style={{ fontSize: '7.5px', color: '#64748b' }}>"Great service!"</div>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px', letterSpacing: '-0.4px' }}>
                    {featuresSection.card3_title || 'Ratings & Verified Reviews'}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, margin: '0 0 20px', fontWeight: 500 }}>
                    {featuresSection.card3_desc || 'Help businesses grow by sharing authentic customer feedback. Post genuine reviews on Google Maps, e-commerce stores, IMDb and mobile apps.'}
                  </p>

                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li style={{ fontSize: '12.5px', color: '#334155', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fa-solid fa-circle-check" style={{ color: '#7e22ce' }}></i> Share real experiences
                    </li>
                    <li style={{ fontSize: '12.5px', color: '#334155', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fa-solid fa-circle-check" style={{ color: '#7e22ce' }}></i> Upload photos/videos
                    </li>
                    <li style={{ fontSize: '12.5px', color: '#334155', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fa-solid fa-circle-check" style={{ color: '#7e22ce' }}></i> Get rewarded for verified reviews
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => openAuth('user')}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
                    color: '#ffffff',
                    border: 0,
                    padding: '12px',
                    borderRadius: '999px',
                    fontWeight: 800,
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    boxShadow: '0 6px 18px rgba(168,85,247,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span>Write a Review</span>
                  <i className="fa-solid fa-arrow-right" style={{ fontSize: '12px' }}></i>
                </button>
              </div>

              {/* Card 5: Special Tasks (Orange) */}
              <div style={{ background: 'linear-gradient(180deg, #fffbeb 0%, #ffffff 100%)', border: '1px solid #fde68a', borderRadius: '24px', padding: '26px', boxShadow: '0 10px 30px rgba(245,158,11,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.25s ease' }} className="task-hover-card">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
                    <span style={{ background: '#fef3c7', color: '#b45309', padding: '5px 14px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      🎁 SPECIAL TASKS
                    </span>

                    {/* Exclusive Sticker */}
                    <span style={{ background: '#e0f2fe', color: '#0284c7', padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: 800, border: '1px solid #bae6fd' }}>
                      Exclusive Campaigns
                    </span>
                  </div>

                  <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px', letterSpacing: '-0.4px' }}>
                    Campaigns & Special Projects
                  </h3>
                  <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, margin: '0 0 20px', fontWeight: 500 }}>
                    Participate in product launches, menu checks, service evaluations, events and seasonal campaigns.
                  </p>

                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li style={{ fontSize: '12.5px', color: '#334155', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fa-solid fa-circle-check" style={{ color: '#b45309' }}></i> Unique and high-paying tasks
                    </li>
                    <li style={{ fontSize: '12.5px', color: '#334155', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fa-solid fa-circle-check" style={{ color: '#b45309' }}></i> Limited time campaigns
                    </li>
                    <li style={{ fontSize: '12.5px', color: '#334155', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fa-solid fa-circle-check" style={{ color: '#b45309' }}></i> Work with top brands
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => openAuth('user')}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: '#ffffff',
                    border: 0,
                    padding: '12px',
                    borderRadius: '999px',
                    fontWeight: 800,
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    boxShadow: '0 6px 18px rgba(245,158,11,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span>View Campaigns</span>
                  <i className="fa-solid fa-arrow-right" style={{ fontSize: '12px' }}></i>
                </button>
              </div>

              {/* Card 6: Fast Payouts (Cyan) */}
              <div style={{ background: 'linear-gradient(180deg, #ecfeff 0%, #ffffff 100%)', border: '1px solid #a5f3fc', borderRadius: '24px', padding: '26px', boxShadow: '0 10px 30px rgba(8,145,178,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.25s ease' }} className="task-hover-card">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
                    <span style={{ background: '#cffafe', color: '#0891b2', padding: '5px 14px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      👛 FAST PAYOUTS
                    </span>

                    {/* Payment Received Graphic Card */}
                    <div style={{ width: '115px', background: '#ffffff', border: '1px solid #a5f3fc', borderRadius: '10px', padding: '6px 8px', boxShadow: '0 6px 16px rgba(8,145,178,0.12)', fontSize: '8.5px', textAlign: 'center' }}>
                      <div style={{ color: '#10b981', fontWeight: 800 }}>✓ Payment Received</div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', margin: '2px 0' }}>₹500</div>
                      <div style={{ fontSize: '7.5px', color: '#64748b' }}>Bank / UPI / Wallet</div>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px', letterSpacing: '-0.4px' }}>
                    {featuresSection.card6_title || 'Get Paid Instantly'}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, margin: '0 0 20px', fontWeight: 500 }}>
                    {featuresSection.card6_desc || 'Your earnings are processed quickly and securely. Withdraw directly to your bank account, UPI or wallet.'}
                  </p>

                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li style={{ fontSize: '12.5px', color: '#334155', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fa-solid fa-circle-check" style={{ color: '#0891b2' }}></i> Multiple payout options
                    </li>
                    <li style={{ fontSize: '12.5px', color: '#334155', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fa-solid fa-circle-check" style={{ color: '#0891b2' }}></i> Safe & secure transactions
                    </li>
                    <li style={{ fontSize: '12.5px', color: '#334155', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fa-solid fa-circle-check" style={{ color: '#0891b2' }}></i> Track your earnings anytime
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => openAuth('user')}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                    color: '#ffffff',
                    border: 0,
                    padding: '12px',
                    borderRadius: '999px',
                    fontWeight: 800,
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    boxShadow: '0 6px 18px rgba(6,182,212,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span>See Payment Options</span>
                  <i className="fa-solid fa-arrow-right" style={{ fontSize: '12px' }}></i>
                </button>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Mobile App Download Hero Section */}
      <section id="app-download" style={{ background: 'linear-gradient(135deg, #eef7ff 0%, #f0f9ff 50%, #e0f2fe 100%)', padding: '60px 0 50px', position: 'relative', overflow: 'hidden' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '320px 1.1fr 310px', gap: '36px', alignItems: 'center' }} className="app-download-grid">
            
            {/* Column 1: Dual Phone Mockup (Clean & Prominent) */}
            <div style={{ position: 'relative', width: '320px', height: '290px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Phone 1: Back Left (Dark Casing - Available Tasks) */}
              <div style={{ position: 'absolute', top: '10px', left: 0, width: '170px', height: '265px', background: '#0b78ff', borderRadius: '26px', border: '5px solid #0f172a', padding: '12px', boxShadow: '0 16px 36px rgba(11,120,255,0.3)', transform: 'rotate(-5deg)', zIndex: 1, color: '#fff' }}>
                <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', opacity: 0.95 }}>Available Tasks</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(6px)', padding: '6px 8px', borderRadius: '10px', fontSize: '9px' }}>
                    <b style={{ display: 'block', fontSize: '9.5px' }}>Retail Store Audit</b>
                    <span style={{ opacity: 0.9 }}>₹300 · 2.3 km</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(6px)', padding: '6px 8px', borderRadius: '10px', fontSize: '9px' }}>
                    <b style={{ display: 'block', fontSize: '9.5px' }}>Restaurant Audit</b>
                    <span style={{ opacity: 0.9 }}>₹250 · 1.8 km</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(6px)', padding: '6px 8px', borderRadius: '10px', fontSize: '9px' }}>
                    <b style={{ display: 'block', fontSize: '9.5px' }}>Pharmacy Check</b>
                    <span style={{ opacity: 0.9 }}>₹180 · 3.1 km</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(6px)', padding: '6px 8px', borderRadius: '10px', fontSize: '9px' }}>
                    <b style={{ display: 'block', fontSize: '9.5px' }}>Product Feedback</b>
                    <span style={{ opacity: 0.9 }}>₹120 · 1.5 km</span>
                  </div>
                </div>
              </div>

              {/* Phone 2: Front Right (White Casing - App Home Dashboard) */}
              <div style={{ position: 'absolute', top: 0, right: 0, width: '180px', height: '280px', background: '#ffffff', borderRadius: '26px', border: '5px solid #0f172a', padding: '12px', boxShadow: '0 20px 44px rgba(0,0,0,0.22)', zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginBottom: '10px' }}>
                  <img src="/logo.jpg" alt="DigiLites" style={{ width: '20px', height: '20px', borderRadius: '5px' }} />
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#0f172a' }}>DigiLites</span>
                </div>
                <div style={{ textAlign: 'center', background: '#f8fafc', padding: '8px 6px', borderRadius: '10px', marginBottom: '10px', border: '1px solid #e2e8f0' }}>
                  <b style={{ fontSize: '10px', color: '#0f172a', display: 'block', lineHeight: 1.2, fontWeight: 700 }}>Earn Anywhere<br />Anytime</b>
                </div>
                {/* 2x2 Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <div style={{ background: '#eff6ff', padding: '8px 4px', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '15px', marginBottom: '3px' }}>🏬</div>
                    <span style={{ fontSize: '8px', fontWeight: 700, color: '#1e40af', display: 'block' }}>Store Audit</span>
                  </div>
                  <div style={{ background: '#fff1f2', padding: '8px 4px', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '15px', marginBottom: '3px' }}>🛍️</div>
                    <span style={{ fontSize: '8px', fontWeight: 700, color: '#9f1239', display: 'block' }}>Shop & Review</span>
                  </div>
                  <div style={{ background: '#f0fdf4', padding: '8px 4px', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '15px', marginBottom: '3px' }}>📋</div>
                    <span style={{ fontSize: '8px', fontWeight: 700, color: '#166534', display: 'block' }}>Quick Survey</span>
                  </div>
                  <div style={{ background: '#fffbeb', padding: '8px 4px', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '15px', marginBottom: '3px' }}>⭐</div>
                    <span style={{ fontSize: '8px', fontWeight: 700, color: '#92400e', display: 'block' }}>Special Task</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Center Headline, Subtitle, QR Code & Store Buttons */}
            <div style={{ padding: '0 10px' }}>
              <span style={{ background: '#dbeafe', color: '#0284c7', padding: '5px 16px', borderRadius: '999px', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'inline-block', marginBottom: '14px' }}>
                DIGILITES STUDIO MOBILE APP
              </span>
              <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '38px', fontWeight: 800, color: '#0f172a', margin: '0 0 14px', lineHeight: 1.15, letterSpacing: '-0.035em' }}>
                Take Opportunities<br />
                <span style={{ color: '#0b78ff' }}>With You Everywhere</span>
              </h2>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#475569', margin: '0 0 24px', lineHeight: 1.65, maxWidth: '460px' }}>
                Download our mobile app and never miss a task. Find opportunities near you, complete tasks and earn real rewards.
              </p>

              {/* QR Code + App Store Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ width: '80px', height: '80px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '14px', padding: '6px', display: 'grid', placeItems: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
                  <svg width="62" height="62" viewBox="0 0 24 24" fill="none">
                    <path d="M3 3H9V9H3V3Z" fill="#0f172a"/>
                    <path d="M15 3H21V9H15V3Z" fill="#0f172a"/>
                    <path d="M3 15H9V21H3V15Z" fill="#0f172a"/>
                    <path d="M5 5H7V7H5V5Z" fill="#fff"/>
                    <path d="M17 5H19V7H17V5Z" fill="#fff"/>
                    <path d="M5 17H7V19H5V17Z" fill="#fff"/>
                    <path d="M11 3H13V7H11V3Z" fill="#0f172a"/>
                    <path d="M11 9H15V11H11V9Z" fill="#0f172a"/>
                    <path d="M15 13H17V17H15V13Z" fill="#0f172a"/>
                    <path d="M11 15H13V21H11V15Z" fill="#0f172a"/>
                    <path d="M17 19H21V21H17V19Z" fill="#0f172a"/>
                  </svg>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button onClick={() => showToast('App download link sent!', 'success')} style={{ background: '#0f172a', color: '#fff', border: 0, padding: '9px 20px', borderRadius: '10px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(15,23,42,0.15)' }}>
                    <i className="fa-brands fa-google-play" style={{ color: '#38bdf8', fontSize: '16px' }}></i>
                    <div style={{ textAlign: 'left' }}>
                      <span style={{ fontSize: '8px', display: 'block', opacity: 0.85, textTransform: 'uppercase' }}>GET IT ON</span>
                      <b style={{ fontSize: '12px' }}>Google Play</b>
                    </div>
                  </button>
                  <button onClick={() => showToast('App download link sent!', 'success')} style={{ background: '#0f172a', color: '#fff', border: 0, padding: '9px 20px', borderRadius: '10px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(15,23,42,0.15)' }}>
                    <i className="fa-brands fa-apple" style={{ fontSize: '18px' }}></i>
                    <div style={{ textAlign: 'left' }}>
                      <span style={{ fontSize: '8px', display: 'block', opacity: 0.85, textTransform: 'uppercase' }}>Download on the</span>
                      <b style={{ fontSize: '12px' }}>App Store</b>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Column 3: 4 Feature Rows (High Contrast & Clear) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(255,255,255,0.7)', padding: '12px 16px', borderRadius: '14px', border: '1px solid rgba(226,232,240,0.8)' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#dcfce7', color: '#15803d', display: 'grid', placeItems: 'center', fontSize: '18px', flexShrink: 0 }}>
                  <i className="fa-solid fa-location-dot"></i>
                </div>
                <div>
                  <b style={{ display: 'block', fontSize: '14px', color: '#0f172a', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>Find Nearby Tasks</b>
                  <span style={{ fontSize: '12.5px', color: '#475569', fontFamily: 'Inter, sans-serif' }}>Get real-time opportunities near you</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(255,255,255,0.7)', padding: '12px 16px', borderRadius: '14px', border: '1px solid rgba(226,232,240,0.8)' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#dbeafe', color: '#0284c7', display: 'grid', placeItems: 'center', fontSize: '18px', flexShrink: 0 }}>
                  <i className="fa-solid fa-bolt"></i>
                </div>
                <div>
                  <b style={{ display: 'block', fontSize: '14px', color: '#0f172a', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>Instant Notifications</b>
                  <span style={{ fontSize: '12.5px', color: '#475569', fontFamily: 'Inter, sans-serif' }}>Be the first to know about new tasks</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(255,255,255,0.7)', padding: '12px 16px', borderRadius: '14px', border: '1px solid rgba(226,232,240,0.8)' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#fef3c7', color: '#b45309', display: 'grid', placeItems: 'center', fontSize: '18px', flexShrink: 0 }}>
                  <i className="fa-solid fa-wallet"></i>
                </div>
                <div>
                  <b style={{ display: 'block', fontSize: '14px', color: '#0f172a', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>Fast & Secure Payments</b>
                  <span style={{ fontSize: '12.5px', color: '#475569', fontFamily: 'Inter, sans-serif' }}>Direct to your bank, UPI or wallet</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(255,255,255,0.7)', padding: '12px 16px', borderRadius: '14px', border: '1px solid rgba(226,232,240,0.8)' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#f3e8ff', color: '#7e22ce', display: 'grid', placeItems: 'center', fontSize: '18px', flexShrink: 0 }}>
                  <i className="fa-solid fa-star"></i>
                </div>
                <div>
                  <b style={{ display: 'block', fontSize: '14px', color: '#0f172a', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>Track Your Earnings</b>
                  <span style={{ fontSize: '12.5px', color: '#475569', fontFamily: 'Inter, sans-serif' }}>View history and unlock bonuses</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Trust & Stats Bar Section */}
      <section style={{ background: '#ffffff', padding: '36px 0', borderBottom: '1px solid #e2e8f0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
            
            {/* 4 Stats Box */}
            <div style={{ background: '#f8fafc', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '20px 32px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '28px', flex: 1, boxShadow: '0 6px 20px rgba(0,0,0,0.02)' }} className="stats-4col-grid">
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#eff6ff', color: '#0b78ff', display: 'grid', placeItems: 'center', fontSize: '18px', flexShrink: 0 }}>
                  <i className="fa-solid fa-users"></i>
                </div>
                <div>
                  <b style={{ display: 'block', fontSize: '18px', color: '#0f172a', fontWeight: 800 }}>50,000+</b>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Active Auditors</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#eff6ff', color: '#0b78ff', display: 'grid', placeItems: 'center', fontSize: '18px', flexShrink: 0 }}>
                  <i className="fa-solid fa-building"></i>
                </div>
                <div>
                  <b style={{ display: 'block', fontSize: '18px', color: '#0f172a', fontWeight: 800 }}>1,000+</b>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Brands & Clients</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#fff7ed', color: '#ea580c', display: 'grid', placeItems: 'center', fontSize: '18px', flexShrink: 0 }}>
                  <i className="fa-solid fa-gift"></i>
                </div>
                <div>
                  <b style={{ display: 'block', fontSize: '18px', color: '#0f172a', fontWeight: 800 }}>₹10 Cr+</b>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Rewards Paid</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#f0fdf4', color: '#16a34a', display: 'grid', placeItems: 'center', fontSize: '18px', flexShrink: 0 }}>
                  <i className="fa-solid fa-shield-halved"></i>
                </div>
                <div>
                  <b style={{ display: 'block', fontSize: '18px', color: '#0f172a', fontWeight: 800 }}>4.8/5</b>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>User Rating</span>
                </div>
              </div>
            </div>

            {/* Right Side Big CTA Button */}
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => openAuth('user')}
                style={{
                  background: 'linear-gradient(135deg, #0b78ff 0%, #1763eb 100%)',
                  color: '#ffffff',
                  border: 0,
                  padding: '16px 36px',
                  borderRadius: '999px',
                  fontWeight: 800,
                  fontSize: '15.5px',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(11,120,255,0.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <span>Join Now & Start Earning</span>
                <i className="fa-solid fa-arrow-right"></i>
              </button>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px', color: '#475569', fontSize: '11.5px', fontWeight: 700 }}>
                <span><i className="fa-solid fa-circle-check" style={{ color: '#10b981', marginRight: '4px' }}></i> 100% Free Registration</span>
                <span><i className="fa-solid fa-shield-halved" style={{ color: '#0b78ff', marginRight: '4px' }}></i> Safe & Secure</span>
                <span><i className="fa-solid fa-clock" style={{ color: '#f59e0b', marginRight: '4px' }}></i> Flexible Work Hours</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works & Everyday Earnings Dual Section */}
      <section id="how" style={{ background: '#f8fafc', padding: '60px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'stretch' }} className="how-it-works-grid">
            
            {/* Left Column: How It Works Steps */}
            <div style={{ background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '36px', boxShadow: '0 8px 24px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ background: '#dbeafe', color: '#0284c7', padding: '5px 14px', borderRadius: '999px', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'inline-block', marginBottom: '14px' }}>
                  SIMPLE STEPS, REAL REWARDS
                </span>
                <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '36px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.025em', lineHeight: 1.15 }}>
                  How It Works
                </h2>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#475569', margin: '0 0 32px', lineHeight: 1.65 }}>
                  Start earning in just a few simple steps
                </p>

                {/* 4 Connected Numbered Steps */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', position: 'relative' }}>
                  
                  {/* Step 1 */}
                  <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#0b78ff', color: '#fff', fontSize: '14px', fontWeight: 700, display: 'grid', placeItems: 'center', margin: '0 auto 12px', boxShadow: '0 4px 12px rgba(11,120,255,0.3)' }}>
                      1
                    </div>
                    <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#f1f5f9', color: '#334155', display: 'grid', placeItems: 'center', fontSize: '20px', margin: '0 auto 10px' }}>
                      <i className="fa-regular fa-user"></i>
                    </div>
                    <b style={{ display: 'block', fontSize: '14px', color: '#0f172a', marginBottom: '4px', fontWeight: 600 }}>Sign Up</b>
                    <span style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.35, display: 'block' }}>Create your free account in seconds</span>
                  </div>

                  {/* Step 2 */}
                  <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#10b981', color: '#fff', fontSize: '14px', fontWeight: 700, display: 'grid', placeItems: 'center', margin: '0 auto 12px', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>
                      2
                    </div>
                    <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#f1f5f9', color: '#334155', display: 'grid', placeItems: 'center', fontSize: '20px', margin: '0 auto 10px' }}>
                      <i className="fa-solid fa-mobile-screen-button"></i>
                    </div>
                    <b style={{ display: 'block', fontSize: '14px', color: '#0f172a', marginBottom: '4px', fontWeight: 600 }}>Find Tasks</b>
                    <span style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.35, display: 'block' }}>Browse tasks near you or online</span>
                  </div>

                  {/* Step 3 */}
                  <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f59e0b', color: '#fff', fontSize: '14px', fontWeight: 700, display: 'grid', placeItems: 'center', margin: '0 auto 12px', boxShadow: '0 4px 12px rgba(245,158,11,0.3)' }}>
                      3
                    </div>
                    <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#f1f5f9', color: '#334155', display: 'grid', placeItems: 'center', fontSize: '20px', margin: '0 auto 10px' }}>
                      <i className="fa-regular fa-clipboard"></i>
                    </div>
                    <b style={{ display: 'block', fontSize: '14px', color: '#0f172a', marginBottom: '4px', fontWeight: 600 }}>Complete Tasks</b>
                    <span style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.35, display: 'block' }}>Visit, audit, review and submit evidence</span>
                  </div>

                  {/* Step 4 */}
                  <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#8b5cf6', color: '#fff', fontSize: '14px', fontWeight: 700, display: 'grid', placeItems: 'center', margin: '0 auto 12px', boxShadow: '0 4px 12px rgba(139,92,246,0.3)' }}>
                      4
                    </div>
                    <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#f1f5f9', color: '#334155', display: 'grid', placeItems: 'center', fontSize: '20px', margin: '0 auto 10px' }}>
                      <i className="fa-solid fa-wallet"></i>
                    </div>
                    <b style={{ display: 'block', fontSize: '14px', color: '#0f172a', marginBottom: '4px', fontWeight: 600 }}>Get Paid</b>
                    <span style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.35, display: 'block' }}>Earn and withdraw your earnings</span>
                  </div>

                </div>
              </div>
            </div>

            {/* Right Column: Turn Your Everyday Activities Into Earnings! Card */}
            <div style={{ background: 'linear-gradient(135deg, #fffbeb 0%, #fff7ed 100%)', borderRadius: '24px', border: '1px solid #fef3c7', padding: '36px', boxShadow: '0 8px 24px rgba(245,158,11,0.06)', display: 'grid', gridTemplateColumns: '1fr 180px', gap: '20px', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
              <div>
                <span style={{ background: '#ffedd5', color: '#c2410c', padding: '5px 14px', borderRadius: '999px', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'inline-block', marginBottom: '14px' }}>
                  EARN WHILE YOU EXPLORE
                </span>
                <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: '0 0 10px', lineHeight: 1.25, letterSpacing: '-0.015em' }}>
                  Turn Your Everyday Activities Into Earnings!
                </h3>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: '#475569', margin: '0 0 24px', lineHeight: 1.65 }}>
                  From retail stores to restaurants, pharmacies to fuel stations — there are tasks everywhere.
                </p>
                <button
                  onClick={() => openAuth('user')}
                  style={{
                    background: 'linear-gradient(135deg, #0b78ff 0%, #1763eb 100%)',
                    color: '#ffffff',
                    border: 0,
                    padding: '12px 28px',
                    borderRadius: '12px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    fontSize: '15px',
                    cursor: 'pointer',
                    boxShadow: '0 6px 20px rgba(11,120,255,0.3)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>Start Earning Today</span>
                  <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>

              {/* Right Side Auditor Image & Floating Badges */}
              <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"
                  alt="Auditor Girl"
                  style={{ width: '150px', height: '210px', objectFit: 'cover', borderRadius: '20px', filter: 'brightness(0.98)' }}
                />

                {/* Floating Badge 1: Task Completed + ₹300 */}
                <div style={{ position: 'absolute', top: '10px', left: '-25px', background: '#ffffff', padding: '6px 10px', borderRadius: '10px', boxShadow: '0 8px 20px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0', fontSize: '9px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                  <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#10b981', color: '#fff', display: 'grid', placeItems: 'center', fontSize: '10px' }}>✓</span>
                  <div>
                    <span style={{ display: 'block', fontSize: '7.5px', color: '#64748b' }}>Task Completed</span>
                    <span style={{ color: '#16a34a' }}>+ ₹300 Earned</span>
                  </div>
                </div>

                {/* Floating Badge 2: Nearby Store */}
                <div style={{ position: 'absolute', bottom: '15px', left: '-20px', background: '#ffffff', padding: '6px 10px', borderRadius: '10px', boxShadow: '0 8px 20px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0', fontSize: '9px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                  <span style={{ width: '18px', height: '18px', borderRadius: '6px', background: '#ea580c', color: '#fff', display: 'grid', placeItems: 'center', fontSize: '10px' }}>📍</span>
                  <div>
                    <span style={{ display: 'block', fontSize: '7.5px', color: '#64748b' }}>Nearby Store</span>
                    <span style={{ color: '#0f172a' }}>2.3 km</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Popular Task Categories Carousel */}
      <section style={{ paddingTop: '20px', paddingBottom: '50px' }} id="categories">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span style={{ background: '#eff6ff', color: '#0b78ff', padding: '5px 14px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                EXPLORE BY INDUSTRY
              </span>
              <h2 className="section-title" style={{ fontSize: '28px', marginTop: '8px', margin: '8px 0 0' }}>
                Popular Task Categories
              </h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Carousel Control Arrows */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => scrollCategoryCarousel('left')}
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontSize: '16px',
                    cursor: 'pointer',
                    display: 'grid',
                    placeItems: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s'
                  }}
                  title="Scroll Left"
                >
                  <i className="fa-solid fa-chevron-left"></i>
                </button>
                <button
                  onClick={() => scrollCategoryCarousel('right')}
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontSize: '16px',
                    cursor: 'pointer',
                    display: 'grid',
                    placeItems: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s'
                  }}
                  title="Scroll Right"
                >
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
              </div>

              <Link to="/user/find-tasks" className="see-all" style={{ fontSize: '14px', fontWeight: 700, color: '#0b78ff' }}>
                View All Categories →
              </Link>
            </div>
          </div>

          {/* Carousel Items Container */}
          <div
            ref={categoryScrollRef}
            style={{
              display: 'flex',
              gap: '20px',
              overflowX: 'auto',
              scrollBehavior: 'smooth',
              paddingBottom: '16px',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
            className="hide-scrollbar"
          >
            {popularCategories.map((cat, idx) => (
              <div
                key={idx}
                style={{
                  minWidth: '270px',
                  width: '270px',
                  height: '240px',
                  borderRadius: '18px',
                  overflow: 'hidden',
                  position: 'relative',
                  background: '#0d203c',
                  flexShrink: 0,
                  boxShadow: '0 10px 30px rgba(15,23,42,0.08)',
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                }}
                className="category-carousel-card"
                onClick={() => openAuth('user')}
              >
                <img
                  src={cat.image}
                  alt={cat.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                  className="cat-card-img"
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(13,32,60,0.1) 0%, rgba(13,32,60,0.88) 100%)' }}></div>
                
                <div style={{ position: 'absolute', top: '14px', left: '14px', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(4px)', width: '38px', height: '38px', borderRadius: '12px', display: 'grid', placeItems: 'center', fontSize: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                  {cat.icon || '🛍️'}
                </div>

                <div style={{ position: 'absolute', top: '14px', right: '14px', background: 'rgba(11,120,255,0.9)', color: '#ffffff', padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 800 }}>
                  {cat.tasks_count || 'Active Tasks'}
                </div>

                <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px', color: '#ffffff' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px', color: '#ffffff', letterSpacing: '-0.3px' }}>
                    {cat.title}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#cbd5e1', margin: 0, opacity: 0.9, lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {cat.description || 'Explore micro-tasks and earn cash rewards.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dual Promos */}
      <section style={{ paddingTop: '16px', paddingBottom: '24px' }}>
        <div className="container dual">
          <div className="promo aud" id="auditors">
            <div className="promo-content">
              <div>
                <small>FOR AUDITORS</small>
                <h3>
                  Earn Money. Gain Experience.
                  <br />
                  Be the Change.
                </h3>
                <ul className="checks">
                  <li>
                    <i className="fa-solid fa-circle-check"></i> Flexible work hours
                  </li>
                  <li>
                    <i className="fa-solid fa-circle-check"></i> Tasks near your location
                  </li>
                  <li>
                    <i className="fa-solid fa-circle-check"></i> Safe and secure payments
                  </li>
                  <li>
                    <i className="fa-solid fa-circle-check"></i> Get rewarded for observations
                  </li>
                </ul>
              </div>
              <button className="btn" style={{ background: 'linear-gradient(135deg, #ef3f5f, #e11d48)', color: '#fff', boxShadow: '0 6px 18px rgba(239,63,95,0.3)', width: 'fit-content' }} onClick={() => openAuth('user')}>
                Sign Up as Auditor
              </button>
            </div>
            <div className="promo-image-box">
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80"
                alt="Auditor"
              />
            </div>
          </div>

          <div className="promo brand" id="brands">
            <div className="promo-content">
              <div>
                <small>FOR BRANDS & BUSINESSES</small>
                <h3>
                  Get Real Insights
                  <br />
                  From Real People.
                </h3>
                <ul className="checks">
                  <li>
                    <i className="fa-solid fa-circle-check"></i> Improve on-ground execution
                  </li>
                  <li>
                    <i className="fa-solid fa-circle-check"></i> Track brand compliance
                  </li>
                  <li>
                    <i className="fa-solid fa-circle-check"></i> Custom campaigns & reports
                  </li>
                  <li>
                    <i className="fa-solid fa-circle-check"></i> Actionable insights to grow
                  </li>
                </ul>
              </div>
              <button className="btn btn-primary" style={{ width: 'fit-content' }} onClick={() => openAuth('client')}>
                Partner With Us
              </button>
            </div>
            <div className="promo-image-box">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80"
                alt="Brand Partner"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Brands (Full Width Section) */}
      <section style={{ paddingTop: '28px', paddingBottom: '28px', background: '#f8fafc', borderTop: '1px solid #edf2f7', borderBottom: '1px solid #edf2f7' }} id="about">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className="section-title" style={{ fontSize: '24px', marginBottom: '8px' }}>
            Trusted by 1,000+ Leading Brands & Businesses
          </h2>
          <p className="section-sub" style={{ maxWidth: '650px', margin: '0 auto 20px' }}>
            Companies across retail, dining, healthcare, and finance rely on DigiLites Studio for real-time audit intelligence.
          </p>
          <div className="brand-logos" style={{ justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span className="brand-pill">🥤 Coca-Cola</span>
            <span className="brand-pill">🍔 McDonald's</span>
            <span className="brand-pill">🏦 HDFC BANK</span>
            <span className="brand-pill">🏛️ TATA Group</span>
            <span className="brand-pill">☕ Starbucks</span>
            <span className="brand-pill">🛍️ Reliance Retail</span>
            <span className="brand-pill">💊 Apollo Pharmacy</span>
            <span className="brand-pill">🍕 Domino's</span>
            <span className="brand-pill">👟 Decathlon</span>
          </div>
        </div>
      </section>

      {/* Dedicated Standalone Testimonials Section */}
      <section style={{ paddingTop: '42px', paddingBottom: '42px' }} id="testimonials">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#0b78ff', letterSpacing: '1px', textTransform: 'uppercase', background: '#e0f2fe', padding: '4px 12px', borderRadius: '999px' }}>
              COMMUNITY REVIEWS
            </span>
            <h2 className="section-title" style={{ fontSize: '30px', marginTop: '10px' }}>
              What Our Partners & Auditors Say
            </h2>
            <p className="section-sub">
              Real feedback from verified brand leaders, field taskers, and audit partners.
            </p>
          </div>

          <div className="testimonial-grid">
            {testimonialsList.filter(t => t.status !== 'Hidden').map((item, idx) => (
              <div className="testimonial-card" key={item.id || idx}>
                <div>
                  <div className="stars">{'⭐'.repeat(item.rating || 5)}</div>
                  <p className="quote-text">
                    “{item.quote || item.content}”
                  </p>
                </div>
                <div className="author-box">
                  <img
                    src={item.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                    alt={item.name}
                  />
                  <div>
                    <b>{item.name}</b>
                    <span>{item.title || item.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App & FAQ Section */}
      <section style={{ paddingTop: '16px', paddingBottom: '48px' }} id="faq">
        <div className="container bottom-grid">
          {/* Enhanced App Download Card */}
          <div className="app-card">
            <span className="app-badge">
              <i className="fa-solid fa-mobile-screen"></i> MOBILE AUDIT APP
            </span>
            <div>
              <h3>Take DigiLites Studio Everywhere</h3>
              <p>Download our top-rated field audit app and start earning on the go with real-time location alerts.</p>
            </div>

            <div className="qr-row">
              <div className="qr">
                {/* SVG QR Code Pattern */}
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3H9V9H3V3Z" fill="#0d203c"/>
                  <path d="M15 3H21V9H15V3Z" fill="#0d203c"/>
                  <path d="M3 15H9V21H3V15Z" fill="#0d203c"/>
                  <path d="M5 5H7V7H5V5Z" fill="#ffffff"/>
                  <path d="M17 5H19V7H17V5Z" fill="#ffffff"/>
                  <path d="M5 17H7V19H5V17Z" fill="#ffffff"/>
                  <path d="M11 3H13V7H11V3Z" fill="#0d203c"/>
                  <path d="M11 9H15V11H11V9Z" fill="#0d203c"/>
                  <path d="M15 13H17V17H15V13Z" fill="#0d203c"/>
                  <path d="M11 15H13V21H11V15Z" fill="#0d203c"/>
                  <path d="M17 19H21V21H17V19Z" fill="#0d203c"/>
                </svg>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <b style={{ fontSize: '13px', color: '#ffffff' }}>Scan to Download</b>
                <span style={{ fontSize: '11px', color: '#cbd5e1' }}>Compatible with iOS & Android</span>
                <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 700 }}>4.9 ★★★★★ (50K+ Active Taskers)</span>
              </div>
            </div>

            <div className="store-btns">
              <div className="store" onClick={() => showToast('App link sent to your mobile!', 'success')}>
                <i className="fa-brands fa-google-play" style={{ fontSize: '20px', color: '#38bdf8' }}></i>
                <div>
                  <span style={{ display: 'block', fontSize: '9px', opacity: 0.8 }}>GET IT ON</span>
                  <b style={{ fontSize: '12px' }}>Google Play</b>
                </div>
              </div>
              <div className="store" onClick={() => showToast('App link sent to your mobile!', 'success')}>
                <i className="fa-brands fa-apple" style={{ fontSize: '20px', color: '#ffffff' }}></i>
                <div>
                  <span style={{ display: 'block', fontSize: '9px', opacity: 0.8 }}>Download on the</span>
                  <b style={{ fontSize: '12px' }}>App Store</b>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced FAQ Accordion */}
          <div className="faq">
            <h3>
              Frequently Asked Questions{' '}
              <a href="#faq" className="see-all" style={{ float: 'right', fontSize: '12px' }}>
                View All FAQs →
              </a>
            </h3>

            {faqsList.map((faq, idx) => (
              <div className={`faq-item ${activeFaq === idx ? 'open' : ''}`} key={faq.id || idx}>
                <div className="faq-q" onClick={() => toggleFaq(idx)}>
                  {faq.question || faq.q}
                  <span>{activeFaq === idx ? '−' : '+'}</span>
                </div>
                {activeFaq === idx && <div className="faq-a">{faq.answer || faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <PublicFooter />

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} initialRole={authRole} />
    </div>
  );
}
