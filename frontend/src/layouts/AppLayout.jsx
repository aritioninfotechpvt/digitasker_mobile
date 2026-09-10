import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Search, ClipboardList, Wallet, Bell, User, HelpCircle, Users, Briefcase, Landmark, 
  BarChart3, Settings, Building2, FileText, ShieldCheck, MessageSquare, LogOut, MapPinned, Scale, Gift, 
  UserCog, History, Send, WalletCards, GitBranch, CheckSquare2, ShieldAlert, Zap, GraduationCap, 
  RadioTower, ServerCog, Webhook, UsersRound, FileBarChart, CalendarClock, CloudOff, Gavel, 
  ReceiptIndianRupee, CalendarRange, Gauge, Network, Route, Palette, BadgeIndianRupee, ChevronDown, Lock,
  Sun, Moon, Maximize, Minimize, Menu, X, Check, PanelLeftClose, PanelLeft, Globe, AlertTriangle
} from 'lucide-react';
import { showConfirm, showToast } from '../utils/swal';
import AuthModal from '../components/AuthModal';
import ReferralModal from '../components/ReferralModal';
import api from '../services/api';
import { getPendingRevisions } from '../utils/notifications';

const iconMap = {
  Dashboard: LayoutDashboard, 'Find Tasks': Search, 'My Tasks': ClipboardList, Wallet, Bell, Profile: User, 
  Support: HelpCircle, Users, Clients: Building2, Campaigns: Briefcase, Tasks: ClipboardList, Verification: ShieldCheck, 
  Payments: Landmark, Payouts: WalletCards, Reports: BarChart3, Settings, Messages: MessageSquare, Billing: FileText, 
  Locations: MapPinned, Disputes: Scale, 'Referrals & Bonuses': Gift, 'Roles & Permissions': UserCog, 'Audit Logs': History, 
  Notifications: Send, Workflows: GitBranch, 'Quality Control': CheckSquare2, 'Fraud Center': ShieldAlert, Finance: WalletCards, 
  Automations: Zap, Training: GraduationCap, Communications: RadioTower, 'System Ops': ServerCog, 'API & Webhooks': Webhook, 
  'Team & Access': UsersRound, 'Report Builder': FileBarChart, 'Scheduled Reports': CalendarClock, 'Advanced Analytics': BarChart3, 
  'Offline Mode': CloudOff, Vendors: Building2, Members: UsersRound, 'Task Allocation': ClipboardList, 'Vendor Payments': WalletCards, 
  'Vendor Profile': Building2, 'Control Tower': Gauge, 'Vendor Commercials': BadgeIndianRupee, 'Vendor Contracts': FileText, 
  'Vendor Settlements': ReceiptIndianRupee, 'Vendor Capacity': CalendarRange, 'Vendor Bidding': Gavel, 'Vendor Performance': BarChart3, 
  'Vendor Workforce': UsersRound, 'Smart Allocation': Route, 'Budget Control': Landmark, Governance: ShieldCheck, 'White Label': Palette, 
  'Task Sourcing': Network, 'My Commercials': BadgeIndianRupee, Contracts: FileText, Capacity: CalendarRange, 'RFQ & Bids': Gavel, 
  Settlements: ReceiptIndianRupee, Workforce: UsersRound, 'KYC Verification': ShieldCheck, 'Website CMS': Globe
};

export default function AppLayout({ role = 'user', title, children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarNavRef = useRef(null);
  const notifRef = useRef(null);

  // States
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('insightloop_sidebar_collapsed') === 'true';
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('insightloop_theme') === 'dark';
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Task Assignment', text: 'Samsung Retail Audit TSK-301 assigned to your region.', time: '10 mins ago', unread: true },
    { id: 2, title: 'Payout Approved 💸', text: '₹2,000 processed for direct transfer to your UPI.', time: '1 hour ago', unread: true },
    { id: 3, title: 'Level 3 KYC Verified 🛡️', text: 'Identity documents verified. Daily withdrawal limit ₹50,000.', time: 'Yesterday', unread: true }
  ]);
  const [pendingReferralCount, setPendingReferralCount] = useState(0);
  const [revisionAlerts, setRevisionAlerts] = useState(() => getPendingRevisions());

  const getUserInitials = () => {
    try {
      const u = JSON.parse(localStorage.getItem('insightloop_user') || '{}');
      const p = JSON.parse(localStorage.getItem('digitasker_user_profile') || '{}');
      const name = u.name || p.name;
      if (name && name !== 'Account User') {
        const parts = name.trim().split(' ').filter(Boolean);
        if (parts.length >= 2) {
          return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
      }
    } catch (e) {}
    return role === 'vendor' ? 'VEN' : role === 'admin' ? 'ADM' : role === 'client' ? 'CLI' : 'AUD';
  };

  const syncRevisionAlerts = () => {
    const pending = getPendingRevisions();
    setRevisionAlerts(pending);

    if (role === 'user') {
      const storedNotifs = JSON.parse(localStorage.getItem('digitasker_user_notifications') || '[]');
      const revNotifs = pending.map(p => ({
        id: `rev-${p.subId}`,
        title: `⚠️ QC Revision Requested: ${p.subId}`,
        text: `Admin QC Feedback: "${p.note}". Click to re-submit updated evidence.`,
        time: 'Recently',
        unread: true,
        link: `/user/tasks/${p.id}/complete`
      }));

      setNotifications(prev => {
        const combined = [...revNotifs, ...storedNotifs, ...prev];
        const unique = combined.filter((v, i, a) => a.findIndex(x => x.id === v.id) === i);
        return unique;
      });
      setUnreadCount(revNotifs.length + (storedNotifs.length || 3));
    }
  };

  useEffect(() => {
    syncRevisionAlerts();
    window.addEventListener('storage', syncRevisionAlerts);
    window.addEventListener('digitasker_notif_update', syncRevisionAlerts);
    return () => {
      window.removeEventListener('storage', syncRevisionAlerts);
      window.removeEventListener('digitasker_notif_update', syncRevisionAlerts);
    };
  }, [role]);

  // Fetch admin dynamic alerts
  useEffect(() => {
    if (role === 'admin') {
      api.admin.getReferrals()
        .then(res => {
          const list = Array.isArray(res) ? res : (res?.referrals || []);
          const pending = list.filter(r => r.status === 'Pending Hold');
          setPendingReferralCount(pending.length);

          if (pending.length > 0) {
            const adminNotifs = pending.map((r, idx) => ({
              id: `ref-${r.id || idx}`,
              title: '🎁 New Referral Signup Alert',
              text: `${r.referee_name || 'Friend'} joined using ${r.referral_code || 'REF-1042'}. ₹${r.reward_amount || 50} reward pending release.`,
              time: 'Recently',
              unread: true,
              link: '/admin/growth'
            }));
            setNotifications(prev => {
              const combined = [...adminNotifs, ...prev];
              const unique = combined.filter((v, i, a) => a.findIndex(x => x.id === v.id) === i);
              return unique;
            });
            setUnreadCount(pending.length + 1);
          }
        })
        .catch(() => {});
    }
  }, [role]);

  // Sync theme with body element
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('insightloop_theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('insightloop_theme', 'light');
    }
  }, [isDarkMode]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFSChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFSChange);
    return () => document.removeEventListener('fullscreenchange', handleFSChange);
  }, []);

  // Close notification popover on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    if (sidebarNavRef.current) {
      sidebarNavRef.current.scrollTop = 0;
    }
    const mainEl = document.querySelector('.main');
    if (mainEl) {
      mainEl.scrollTop = 0;
    }
  };

  useEffect(() => {
    scrollToTop();
  }, [location.pathname]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const nextState = !prev;
      localStorage.setItem('insightloop_sidebar_collapsed', nextState ? 'true' : 'false');
      return nextState;
    });
  };

  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
    showToast(`Switched to ${!isDarkMode ? 'Dark' : 'Light'} Mode`, 'info');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const markAllNotificationsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
    setUnreadCount(0);
    showToast('All notifications marked as read', 'success');
  };

  const adminMenuGroups = [
    {
      category: 'Overview & Control',
      items: [
        ['Dashboard', ''],
        ['Control Tower', 'control-tower']
      ]
    },
    {
      category: 'User Management',
      items: [
        ['Users', 'users'],
        ['KYC Verification', 'users/kyc'],
        ['User Risk', 'users/risk']
      ]
    },
    {
      category: 'Clients & Campaigns',
      items: [
        ['Clients', 'clients'],
        ['Campaigns', 'campaigns'],
        ['Budget Control', 'budget-control']
      ]
    },
    {
      category: 'Vendor Operations',
      items: [
        ['Vendors', 'vendors'],
        ['Vendor Commercials', 'vendor-commercials'],
        ['Vendor Contracts', 'vendor-contracts'],
        ['Vendor Capacity', 'vendor-capacity'],
        ['Vendor Bidding', 'vendor-bidding'],
        ['Vendor Performance', 'vendor-performance'],
        ['Vendor Workforce', 'vendor-workforce'],
        ['Vendor Settlements', 'vendor-settlements']
      ]
    },
    {
      category: 'Task & Workflows',
      items: [
        ['Tasks', 'tasks'],
        ['Task Sourcing', 'task-sourcing'],
        ['Smart Allocation', 'smart-allocation'],
        ['Workflows', 'workflows'],
        ['Locations', 'locations']
      ]
    },
    {
      category: 'Quality & Verification',
      items: [
        ['Verification', 'verification'],
        ['Quality Control', 'qc'],
        ['Fraud Center', 'fraud'],
        ['Disputes', 'disputes']
      ]
    },
    {
      category: 'Finance & Payouts',
      items: [
        ['Payments', 'payments'],
        ['Payouts', 'payouts'],
        ['Finance', 'finance']
      ]
    },
    {
      category: 'Growth & Comms',
      items: [
        ['Referrals & Bonuses', 'growth'],
        ['Communications', 'communications'],
        ['Notifications', 'notifications']
      ]
    },
    {
      category: 'Analytics & Governance',
      items: [
        ['Reports', 'reports'],
        ['Automations', 'automations'],
        ['Training', 'training'],
        ['Governance', 'governance'],
        ['White Label', 'white-label']
      ]
    },
    {
      category: 'System & Security',
      items: [
        ['Website CMS', 'website-cms'],
        ['Roles & Permissions', 'roles'],
        ['Audit Logs', 'audit-logs'],
        ['API & Webhooks', 'api-webhooks'],
        ['System Ops', 'system'],
        ['Settings', 'settings']
      ]
    }
  ];

  const [openCategory, setOpenCategory] = useState('Overview & Control');

  useEffect(() => {
    if (role !== 'admin') return;
    const currentGroup = adminMenuGroups.find(grp => 
      grp.items.some(([_, slug]) => {
        const fullPath = slug ? `/admin/${slug}` : '/admin';
        return location.pathname === fullPath || (slug && (location.pathname === `/admin/${slug}` || location.pathname.startsWith(`/admin/${slug}/`)));
      })
    );
    if (currentGroup) {
      setOpenCategory(currentGroup.category);
    }
  }, [location.pathname, role]);

  const toggleCategory = (catName) => {
    setOpenCategory(prev => (prev === catName ? null : catName));
  };

  const menus = role === 'admin' ? [] : role === 'client' ? [
    ['Dashboard', ''], ['Campaigns', 'campaigns'], ['Tasks', 'tasks'], ['Advanced Analytics', 'analytics'], ['Reports', 'reports'], 
    ['Report Builder', 'report-builder'], ['Scheduled Reports', 'scheduled-reports'], ['Team & Access', 'team'], ['Billing', 'billing'], 
    ['Messages', 'messages'], ['Settings', 'settings']
  ] : role === 'vendor' ? [
    ['Dashboard', ''], ['Members', 'members'], ['Workforce', 'workforce'], ['Task Allocation', 'tasks'], ['My Commercials', 'commercials'], 
    ['Capacity', 'capacity'], ['RFQ & Bids', 'bids'], ['Vendor Payments', 'payments'], ['Settlements', 'settlements'], 
    ['Contracts', 'contracts'], ['White-Label Branding', 'white-label'], ['Vendor Profile', 'profile']
  ] : [
    ['Dashboard', ''], ['Find Tasks', 'find-tasks'], ['My Tasks', 'my-tasks'], ['Training', 'training'], ['Offline Mode', 'offline'], 
    ['Wallet', 'wallet'], ['Bell', 'bell'], ['Profile', 'profile'], ['Support', 'support']
  ];

  const base = role === 'admin' ? '/admin' : role === 'client' ? '/client' : role === 'vendor' ? '/vendor' : '/user';

  const handleSignOut = async () => {
    const confirmed = await showConfirm(
      'Sign Out?',
      'Are you sure you want to log out of InsightLoop?'
    );
    if (confirmed) {
      localStorage.removeItem('insightloop_token');
      localStorage.removeItem('insightloop_user');
      showToast('Logged out successfully.');
      navigate('/');
    }
  };

  return (
    <div className={`appShell ${isSidebarCollapsed ? 'sidebarCollapsed' : ''}`}>
      {/* SIDEBAR */}
      <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className='brand' style={{ display: 'flex', justifyContent: isSidebarCollapsed ? 'center' : 'space-between', alignItems: 'center', padding: isSidebarCollapsed ? '0 0 16px' : '0 10px 14px' }}>
          <Link to="/" onClick={scrollToTop} style={{ color: '#0b78ff', display: 'flex', gap: '10px', alignItems: 'center', overflow: 'hidden', textDecoration: 'none' }} title="DigiLites Studio Overview">
            <img src="/logo.jpg" alt="DigiLites Studio Logo" style={{ width: '34px', height: '34px', objectFit: 'contain', borderRadius: '6px', flexShrink: 0 }} />
            {!isSidebarCollapsed && (
              <span style={{ fontWeight: 800, fontSize: '13.5px', color: '#0f172a', letterSpacing: '-0.02em', display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                DigiLites Studio
                <span style={{ fontSize: '8.5px', fontWeight: 600, color: '#ff8a00', marginTop: '1px' }}>Building Brands That Stand Out</span>
              </span>
            )}
          </Link>
          {!isSidebarCollapsed && (
            <button 
              type="button" 
              onClick={toggleSidebar}
              title="Collapse Sidebar"
              style={{ background: 'transparent', border: 0, cursor: 'pointer', padding: '4px', color: '#64748b', display: 'grid', placeItems: 'center' }}
            >
              <PanelLeftClose size={18} />
            </button>
          )}
        </div>

        {!isSidebarCollapsed && <div className='rolePill'>{role.toUpperCase()} PANEL</div>}

        <nav ref={sidebarNavRef}>
          {role === 'admin' ? (
            isSidebarCollapsed ? (
              adminMenuGroups.flatMap(g => g.items).map(([m, slug]) => {
                const Icon = iconMap[m] || LayoutDashboard;
                return (
                  <NavLink 
                    key={m} 
                    to={`${base}/${slug}`} 
                    end={!slug} 
                    className={({ isActive }) => isActive ? 'navItem active' : 'navItem'}
                    onClick={scrollToTop}
                    title={m}
                  >
                    <Icon size={18} style={{ flexShrink: 0 }} />
                  </NavLink>
                );
              })
            ) : (
              adminMenuGroups.map(grp => {
                const isGroupOpen = openCategory === grp.category;
                const hasActiveItem = grp.items.some(([_, slug]) => {
                  const fullPath = slug ? `/admin/${slug}` : '/admin';
                  return location.pathname === fullPath || (slug && (location.pathname === `/admin/${slug}` || location.pathname.startsWith(`/admin/${slug}/`)));
                });

                return (
                  <div key={grp.category} className="navGroup">
                    <div 
                      className={`navCategoryHeader ${hasActiveItem ? 'activeGroup' : ''}`}
                      onClick={() => toggleCategory(grp.category)}
                    >
                      <span>{grp.category}</span>
                      <ChevronDown size={14} style={{ transform: isGroupOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s ease' }} />
                    </div>

                    {isGroupOpen && (
                      <div className="navSubGroup">
                        {grp.items.map(([m, slug]) => {
                          const Icon = iconMap[m] || LayoutDashboard;
                          return (
                            <NavLink 
                              key={m} 
                              to={`${base}/${slug}`} 
                              end={!slug} 
                              className={({ isActive }) => isActive ? 'navItem navSubItem active' : 'navItem navSubItem'}
                              onClick={scrollToTop}
                            >
                              <Icon size={15} style={{ flexShrink: 0 }} />
                              <span>{m}</span>
                            </NavLink>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )
          ) : (
            menus.map(([m, slug]) => {
              const Icon = iconMap[m] || LayoutDashboard;
              return (
                <NavLink 
                  key={m} 
                  to={`${base}/${slug}`} 
                  end={!slug} 
                  className={({ isActive }) => isActive ? 'navItem active' : 'navItem'}
                  onClick={scrollToTop}
                  title={isSidebarCollapsed ? m : ''}
                >
                  <Icon size={18} style={{ flexShrink: 0 }} />
                  {!isSidebarCollapsed && <span>{m}</span>}
                </NavLink>
              );
            })
          )}
        </nav>

        {!isSidebarCollapsed && (
          <div className='sidebarBottom'>
            <div className='refer' onClick={() => setIsReferralModalOpen(true)} style={{ cursor: 'pointer' }}>
              🎁<b>Refer & Earn</b>
              <span>Invite friends and earn ₹50</span>
            </div>
            <button className='ghost full' onClick={handleSignOut} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569' }}>
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        )}

        {isSidebarCollapsed && (
          <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'center' }}>
            <button 
              type="button" 
              onClick={handleSignOut} 
              className="navItem" 
              style={{ background: 'transparent', border: 0, cursor: 'pointer', color: '#ef4444', padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'center' }} 
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className='main'>
        <header className='topbar'>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Toggle Button in Header */}
            <button 
              type="button" 
              onClick={toggleSidebar}
              title={isSidebarCollapsed ? "Expand Navigation Sidebar" : "Collapse Navigation Sidebar"}
              style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', width: '36px', height: '36px', display: 'grid', placeItems: 'center', cursor: 'pointer', color: '#334155', transition: 'all 0.15s ease' }}
            >
              {isSidebarCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
            </button>

            <div>
              <h1 style={{ margin: 0, fontSize: '14px' }}>{title}</h1>
              <span className='muted' style={{ fontSize: '11.5px' }}>InsightLoop {role.toUpperCase()} Workspace</span>
            </div>
          </div>

          <div className='topActions' style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input placeholder='Search tasks, users, campaigns...' style={{ width: '220px' }} />

            {/* LIGHT / DARK MODE TOGGLE */}
            <button 
              type="button"
              onClick={toggleDarkMode}
              title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`}
              style={{
                width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #cbd5e1',
                background: isDarkMode ? '#1e293b' : '#ffffff', color: isDarkMode ? '#f59e0b' : '#475569',
                display: 'grid', placeItems: 'center', cursor: 'pointer', transition: 'all 0.15s ease'
              }}
            >
              {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* FULLSCREEN TOGGLE */}
            <button 
              type="button"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              style={{
                width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #cbd5e1',
                background: '#ffffff', color: '#475569', display: 'grid', placeItems: 'center', cursor: 'pointer'
              }}
            >
              {isFullscreen ? <Minimize size={17} /> : <Maximize size={17} />}
            </button>

            {/* NOTIFICATION BELL WITH BADGE & POPOVER */}
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button 
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                title="Notifications"
                style={{
                  width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #cbd5e1',
                  background: '#ffffff', color: '#475569', display: 'grid', placeItems: 'center', cursor: 'pointer', position: 'relative'
                }}
              >
                <Bell size={17} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: '#fff',
                    borderRadius: '999px', width: '16px', height: '16px', fontSize: '10px', fontWeight: 800,
                    display: 'grid', placeItems: 'center', border: '2px solid #fff'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {showNotifications && (
                <div style={{
                  position: 'absolute', top: '44px', right: 0, width: '320px', background: '#ffffff',
                  borderRadius: '14px', boxShadow: '0 15px 35px rgba(0,0,0,0.18)', border: '1px solid #e2e8f0',
                  zIndex: 1000, overflow: 'hidden'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>Notifications</span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllNotificationsRead}
                        style={{ border: 0, background: 'transparent', color: '#0066ff', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                    {notifications.map(n => (
                      <div 
                        key={n.id} 
                        onClick={() => {
                          setShowNotifications(false);
                          if (n.link) navigate(n.link);
                        }}
                        style={{
                          padding: '12px 14px', borderBottom: '1px solid #f1f5f9',
                          background: n.unread ? '#f0f7ff' : '#ffffff', cursor: n.link ? 'pointer' : 'default', transition: 'background 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                          <b style={{ fontSize: '12.5px', color: '#0f172a' }}>{n.title}</b>
                          <small style={{ fontSize: '10.5px', color: '#64748b' }}>{n.time}</small>
                        </div>
                        <p style={{ margin: 0, fontSize: '11.5px', color: '#475569', lineHeight: 1.4 }}>{n.text}</p>
                      </div>
                    ))}
                  </div>

                  <div style={{ padding: '8px', textAlign: 'center', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                    <Link 
                      to="/user/bell" 
                      onClick={() => setShowNotifications(false)}
                      style={{ fontSize: '12px', color: '#0066ff', fontWeight: 700 }}
                    >
                      View All Notifications →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* USER PROFILE AVATAR */}
            <Link to={role === 'admin' ? '/admin/settings' : role === 'client' ? '/client/settings' : role === 'vendor' ? '/vendor/profile' : '/user/profile'} title="View Profile">
              <div className='avatar'>{getUserInitials()}</div>
            </Link>
          </div>
        </header>

        <div className='content'>
          {role === 'user' && revisionAlerts.length > 0 && (
            <div style={{
              background: '#fff7ed',
              border: '1px solid #fed7aa',
              borderRadius: '8px',
              padding: '8px 14px',
              marginBottom: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                <AlertTriangle size={15} color="#ea580c" style={{ flexShrink: 0 }} />
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <span style={{ color: '#9a3412', fontWeight: 700, marginRight: '6px' }}>
                    QC Revision Requested ({revisionAlerts[0].subId}):
                  </span>
                  <span style={{ color: '#c2410c' }}>
                    "{revisionAlerts[0].note}"
                  </span>
                </div>
              </div>
              <button
                onClick={() => navigate(`/user/tasks/${revisionAlerts[0].id}/complete`)}
                style={{
                  background: '#ea580c', color: '#fff', border: 0, padding: '5px 12px', borderRadius: '6px',
                  fontSize: '11.5px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, marginLeft: '12px'
                }}
              >
                Re-submit Evidence →
              </button>
            </div>
          )}
          {children}
        </div>
      </main>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} initialRole={role} />
      <ReferralModal isOpen={isReferralModalOpen} onClose={() => setIsReferralModalOpen(false)} />
    </div>
  );
}
