// Dynamic API Base URL resolver for Local Development & Live Production (tasker.digilitesstudio.com)
const getApiBase = () => {
  if (import.meta.env?.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host !== 'localhost' && host !== '127.0.0.1') {
      return `${window.location.origin}/api`;
    }
  }
  return 'http://localhost:8000/api';
};

const API_BASE = getApiBase();

// Helper to get Authorization headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('insightloop_token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// Generic request wrapper with auto JSON parsing and error handling
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: getAuthHeaders(),
    ...options
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `HTTP Error ${response.status}`);
    }
    return data;
  } catch (error) {
    console.warn(`API Request to ${endpoint} failed:`, error.message);
    throw error;
  }
}

export const api = {
  public: {
    getFeaturedTasks: () => request('/public/featured-tasks')
  },
  // Authentication APIs
  auth: {
    login: async (email, password) => {
      const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      const token = data.access_token || data.token;
      if (token) {
        localStorage.setItem('insightloop_token', token);
        localStorage.setItem('insightloop_user', JSON.stringify(data.user));
      }
      return data;
    },
    register: async (userData) => {
      const data = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      const token = data.access_token || data.token;
      if (token) {
        localStorage.setItem('insightloop_token', token);
        localStorage.setItem('insightloop_user', JSON.stringify(data.user));
      }
      return data;
    },
    me: async () => {
      const data = await request('/auth/me');
      if (data.user) {
        localStorage.setItem('insightloop_user', JSON.stringify(data.user));
      }
      return data;
    },
    updateProfile: async (profileData) => {
      return await request('/auth/update-profile', {
        method: 'POST',
        body: JSON.stringify(profileData)
      });
    },
    changePassword: async (currentPassword, newPassword) => {
      return await request('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
      });
    },
    forgotPassword: async (email) => {
      return await request('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
    },
    logout: async () => {
      try {
        await request('/auth/logout', { method: 'POST' });
      } catch (e) {
        // Ignore logout errors
      }
      localStorage.removeItem('insightloop_token');
      localStorage.removeItem('insightloop_user');
    }
  },

  // Admin Portal APIs
  admin: {
    getDashboard: () => request('/admin/dashboard'),
    getVendors: () => request('/admin/vendors'),
    createVendor: (data) => request('/admin/vendors', { method: 'POST', body: JSON.stringify(data) }),
    updateVendorStatus: (id, status) => request(`/admin/vendors/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    deleteVendor: (id) => request(`/admin/vendors/${id}`, { method: 'DELETE' }),
    getClients: () => request('/admin/clients'),
    createClient: (data) => request('/admin/clients', { method: 'POST', body: JSON.stringify(data) }),
    deleteClient: (id) => request(`/admin/clients/${id}`, { method: 'DELETE' }),
    getCampaigns: () => request('/admin/campaigns'),
    createCampaign: (data) => request('/admin/campaigns', { method: 'POST', body: JSON.stringify(data) }),
    getTasks: () => request('/admin/tasks'),
    createTask: (data) => request('/admin/tasks', { method: 'POST', body: JSON.stringify(data) }),
    updateTask: (id, data) => request(`/admin/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    toggleFeaturedTask: (id, is_featured) => request(`/admin/tasks/${id}/toggle-featured`, { method: 'PATCH', body: JSON.stringify({ is_featured }) }),
    deleteTask: (id) => request(`/admin/tasks/${id}`, { method: 'DELETE' }),
    getQCQueue: () => request('/admin/qc-queue'),
    reviewQC: (id, qc_status, qc_notes) => request(`/admin/qc-queue/${id}/review`, { method: 'POST', body: JSON.stringify({ qc_status, qc_notes }) }),
    getPayouts: () => request('/admin/payouts'),
    approvePayout: (id) => request(`/admin/payouts/${id}/approve`, { method: 'POST' }),
    getRateCards: () => request('/admin/rate-cards'),
    createRateCard: (data) => request('/admin/rate-cards', { method: 'POST', body: JSON.stringify(data) }),
    getSettlements: () => request('/admin/settlements'),
    approveSettlement: (id) => request(`/admin/settlements/${id}/approve`, { method: 'POST' }),
    getAuditLogs: () => request('/admin/audit-logs'),
    getSettings: () => request('/admin/settings'),
    updateSettings: (settings) => request('/admin/settings', { method: 'POST', body: JSON.stringify({ settings }) }),
    getTickets: () => request('/admin/tickets'),
    replyTicket: (id, reply, status) => request(`/admin/tickets/${id}/reply`, { method: 'POST', body: JSON.stringify({ reply, status }) }),
    getArticles: () => request('/admin/articles'),
    createArticle: (data) => request('/admin/articles', { method: 'POST', body: JSON.stringify(data) }),
    updateArticle: (id, data) => request(`/admin/articles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteArticle: (id) => request(`/admin/articles/${id}`, { method: 'DELETE' }),
    getReferrals: () => request('/admin/referrals'),
    releaseReferral: (id) => request(`/admin/referrals/${id}/release`, { method: 'POST' }),
    rejectReferral: (id) => request(`/admin/referrals/${id}/reject`, { method: 'POST' })
  },

  // Vendor Portal APIs
  vendor: {
    getDashboard: () => request('/vendor/dashboard'),
    getMembers: () => request('/vendor/members'),
    addMember: (data) => request('/vendor/members', { method: 'POST', body: JSON.stringify(data) }),
    getTasks: () => request('/vendor/tasks'),
    getCommercials: () => request('/vendor/commercials'),
    getSettlements: () => request('/vendor/settlements')
  },

  // Client Portal APIs
  client: {
    getDashboard: () => request('/client/dashboard'),
    getCampaigns: () => request('/client/campaigns'),
    createCampaign: (data) => request('/client/campaigns', { method: 'POST', body: JSON.stringify(data) }),
    getTasks: () => request('/client/tasks'),
    getBilling: () => request('/client/billing'),
    topupWallet: (amount) => request('/client/billing/topup', { method: 'POST', body: JSON.stringify({ amount }) })
  },

  // Auditor / User Portal APIs
  user: {
    getDashboard: () => request('/user/dashboard'),
    getFindTasks: () => request('/user/find-tasks'),
    submitTask: (taskId, evidenceUrls, geoLat, geoLng) => request(`/user/tasks/${taskId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ evidence_urls: evidenceUrls, geo_lat: geoLat, geo_lng: geoLng })
    }),
    getWallet: () => request('/user/wallet'),
    requestWithdrawal: (amount, bankDetails) => request('/user/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount, bank_details: bankDetails })
    }),
    getTickets: () => request('/user/tickets'),
    createTicket: (subject, body, category) => request('/user/tickets', {
      method: 'POST',
      body: JSON.stringify({ subject, body, category })
    }),
    getArticles: () => request('/user/articles'),
    getReferrals: () => request('/user/referrals'),
    simulateReferralJoin: (name, email) => request('/user/referrals/simulate-join', {
      method: 'POST',
      body: JSON.stringify({ friend_name: name, friend_email: email })
    })
  }
};

export default api;
