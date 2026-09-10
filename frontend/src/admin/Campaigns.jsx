import React, { useState, useMemo } from 'react';
import AppLayout from '../layouts/AppLayout';
import { campaigns as initialCampaigns } from '../data/dummy';
import { Card, Badge, SectionTitle } from '../components/ui';
import { Plus, Search, Filter, Briefcase, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Pagination from '../components/Pagination';
import api from '../services/api';

export default function Campaigns() {
  const navigate = useNavigate();
  const [campaignList, setCampaignList] = useState(() => {
    const saved = localStorage.getItem('digitasker_custom_campaigns');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [];
  });

  const fetchCampaigns = async () => {
    try {
      const res = await api.admin.getCampaigns();
      const backendCmps = Array.isArray(res) ? res : res.campaigns;
      const saved = JSON.parse(localStorage.getItem('digitasker_custom_campaigns') || '[]');

      if (backendCmps && backendCmps.length > 0) {
        const mapped = backendCmps.map(c => ({
          id: `CMP-${c.id}`,
          name: c.title,
          client: c.client?.name || 'Corporate Client',
          tasks: c.target_tasks || 0,
          completed: c.completed_tasks || 0,
          approved: Math.round((c.completed_tasks || 0) * 0.95),
          rejected: Math.round((c.completed_tasks || 0) * 0.05),
          budget: parseFloat(c.allocated_budget) || 0,
          status: c.status || 'Active'
        }));
        const combined = [...saved, ...mapped];
        const unique = combined.filter((v, i, a) => a.findIndex(t => t.name === v.name) === i);
        setCampaignList(unique);
      } else if (saved.length > 0) {
        setCampaignList(saved);
      } else {
        setCampaignList([]);
      }
    } catch (err) {}
  };

  const handleClearDemoData = () => {
    localStorage.setItem('digitasker_demo_cleared', 'true');
    const saved = JSON.parse(localStorage.getItem('digitasker_custom_campaigns') || '[]');
    setCampaignList(saved);
  };

  const handleRestoreDemoData = () => {
    localStorage.removeItem('digitasker_demo_cleared');
    fetchCampaigns();
  };

  React.useEffect(() => {
    fetchCampaigns();
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('budget');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  const statuses = ['All', 'Active', 'Draft', 'Completed'];

  const filteredCampaigns = useMemo(() => {
    return campaignList.filter(c => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        c.name.toLowerCase().includes(q) ||
        c.client.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
      );

      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [campaignList, searchQuery, statusFilter]);

  const sortedCampaigns = useMemo(() => {
    const list = [...filteredCampaigns];
    if (sortBy === 'budget') {
      list.sort((a, b) => b.budget - a.budget);
    } else if (sortBy === 'progress') {
      list.sort((a, b) => (b.completed / b.tasks) - (a.completed / a.tasks));
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [filteredCampaigns, sortBy]);

  const totalPages = Math.ceil(sortedCampaigns.length / pageSize) || 1;
  const paginatedCampaigns = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedCampaigns.slice(start, start + pageSize);
  }, [sortedCampaigns, currentPage, pageSize]);

  return (
    <AppLayout role='admin' title='Research Campaigns & Client Projects'>
      {/* Top Header Row */}
      <div className='row between' style={{ marginBottom: '16px' }}>
        <div className='tabs'>
          {statuses.map(s => (
            <span 
              key={s} 
              className={statusFilter === s ? 'active' : ''} 
              onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
            >
              {s}
            </span>
          ))}
        </div>

        <button className='primary' onClick={() => navigate('/admin/campaigns/new')}>
          <Plus size={16} /> Create Campaign
        </button>
      </div>

      {/* Advanced Toolbar */}
      <div className='advancedToolbar' style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
        <div className='searchBox' style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0 14px' }}>
          <Search size={16} color="#64748b" />
          <input 
            type="text" 
            placeholder="Search campaign name, client, ID..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            style={{ border: 0, padding: '10px 0', width: '100%', outline: 'none', background: 'transparent', fontSize: '13.5px' }}
          />
        </div>

        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '13.5px', outline: 'none', fontWeight: 600 }}
        >
          <option value="budget">Sort: Allocated Budget (High to Low)</option>
          <option value="progress">Sort: Completion Progress (%)</option>
          <option value="name">Sort: Name (A-Z)</option>
        </select>
      </div>

      {/* Campaigns Grid */}
      <div className='taskGrid' style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        {paginatedCampaigns.map(c => {
          const progressPct = Math.round((c.completed / c.tasks) * 100);
          return (
            <Card key={c.id}>
              <div className='row between' style={{ marginBottom: '8px' }}>
                <Badge tone='purple'>{c.id}</Badge>
                <Badge tone={c.status === 'Active' ? 'green' : c.status === 'Draft' ? 'orange' : 'blue'}>
                  {c.status}
                </Badge>
              </div>

              <h3 style={{ margin: '4px 0 2px', fontSize: '17px', color: '#0f172a' }}>{c.name}</h3>
              <p style={{ color: '#0066ff', fontWeight: 700, fontSize: '13px', margin: '0 0 12px' }}>
                Client: {c.client}
              </p>

              <div className='campaignStats'>
                <b>{c.tasks}<span>Total Tasks</span></b>
                <b style={{ color: '#0066ff' }}>{c.completed}<span>Completed</span></b>
                <b style={{ color: '#059669' }}>{c.approved}<span>Approved</span></b>
                <b style={{ color: '#dc2626' }}>{c.rejected}<span>Rejected</span></b>
              </div>

              <div className='progress' style={{ margin: '14px 0 12px' }}>
                <i style={{ height: '6px', background: '#e2e8f0', display: 'block', borderRadius: '999px', overflow: 'hidden' }}>
                  <b style={{ display: 'block', height: '100%', background: '#0066ff', width: `${progressPct}%` }} />
                </i>
              </div>

              <div className='row between'>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Allocated Budget</span>
                  <b style={{ color: '#059669', fontSize: '16px' }}>₹{c.budget.toLocaleString('en-IN')}</b>
                </div>
                <button className='ghost' onClick={() => navigate(`/admin/tasks?campaign=${encodeURIComponent(c.name)}`, { state: { campaignName: c.name, campaignId: c.id } })}>
                  Manage Tasks <ChevronRight size={14} />
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {paginatedCampaigns.length === 0 && (
        <Card style={{ padding: '32px', textAlign: 'center', color: '#64748b', marginTop: '16px' }}>
          No campaigns found matching your filter criteria.
        </Card>
      )}

      {/* Pagination Bar */}
      <div style={{ marginTop: '20px' }}>
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={sortedCampaigns.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>
    </AppLayout>
  );
}
