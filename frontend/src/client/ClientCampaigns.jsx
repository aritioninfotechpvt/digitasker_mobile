import React, { useState, useMemo } from 'react';
import AppLayout from '../layouts/AppLayout';
import { Plus, Download, Eye, X, Search, Filter } from 'lucide-react';
import RichTextEditor from '../components/RichTextEditor';
import { showSuccess, showToast, showRichModal } from '../utils/swal';
import Pagination from '../components/Pagination';

import api from '../services/api';

export default function ClientCampaigns() {
  const [campaigns, setCampaigns] = useState([]);

  React.useEffect(() => {
    let currentUser = null;
    try {
      const u = localStorage.getItem('insightloop_user');
      currentUser = u ? JSON.parse(u) : null;
    } catch (e) {}

    const cacheKey = currentUser?.id ? `digitasker_custom_client_campaigns_${currentUser.id}` : 'digitasker_custom_client_campaigns';
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        setCampaigns(JSON.parse(cached));
      } catch (e) {}
    }

    api.client.getCampaigns()
      .then(res => {
        const rawCamps = res.campaigns || (Array.isArray(res) ? res : []);
        if (Array.isArray(rawCamps) && rawCamps.length > 0) {
          const fetched = rawCamps.map(c => [
            c.title,
            c.status || 'Active',
            (c.target_tasks || 150).toString(),
            (c.completed_tasks || 0).toString(),
            `${Math.round(((c.completed_tasks || 0) / (c.target_tasks || 150)) * 100)}%`,
            `₹${parseFloat(c.allocated_budget || c.budget || 150000).toLocaleString('en-IN')}`
          ]);
          setCampaigns(fetched);
          localStorage.setItem(cacheKey, JSON.stringify(fetched));
        }
      })
      .catch(() => {});
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const [name, setName] = useState('');
  const [budget, setBudget] = useState('150000');
  const [briefHtml, setBriefHtml] = useState('<p>We want to evaluate retail staff hospitality, store signage, and stock availability across major metro cities.</p>');

  const handleCreateRequest = (e) => {
    e.preventDefault();
    if (!name) {
      showToast('Please enter campaign title.', 'error');
      return;
    }

    const newCamp = [name, 'Active', '150', '0', '0%', `₹${Number(budget).toLocaleString('en-IN')}`];
    const updated = [newCamp, ...campaigns];
    setCampaigns(updated);
    localStorage.setItem('digitasker_custom_client_campaigns', JSON.stringify(updated));

    api.client.createCampaign({
      title: name,
      budget: parseFloat(budget) || 150000,
      description: briefHtml
    }).catch(() => {});

    setIsModalOpen(false);
    setName('');

    showSuccess(
      'Campaign Request Submitted! 🎯',
      `Your campaign "${name}" has been sent to InsightLoop operations team for task setup & launch.`
    );
  };

  const handleViewCampaign = (c) => {
    showRichModal(
      c[0],
      `<div style="text-align:left">
        <p><b>Status:</b> ${c[1]}</p>
        <p><b>Target Tasks:</b> ${c[2]}</p>
        <p><b>Completed Audits:</b> ${c[3]} (${c[4]})</p>
        <p><b>Allocated Budget:</b> ${c[5]}</p>
      </div>`
    );
  };

  const filteredCampaigns = useMemo(() => {
    let result = campaigns.filter(c => {
      const matchesSearch = c[0].toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || c[1] === statusFilter;
      return matchesSearch && matchesStatus;
    });

    if (sortBy === 'name') result.sort((a, b) => a[0].localeCompare(b[0]));
    return result;
  }, [campaigns, searchQuery, statusFilter, sortBy]);

  const paginatedCampaigns = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCampaigns.slice(start, start + pageSize);
  }, [filteredCampaigns, currentPage, pageSize]);

  return (
    <AppLayout role='client' title='Campaigns'>
      <div className='between pageAction' style={{ marginBottom: '20px' }}>
        <div>
          <h2>Your research campaigns</h2>
          <p className='muted'>Track progress, evidence and spend across all campaigns.</p>
        </div>
        <button className='primary' onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> Request Campaign
        </button>
      </div>

      {/* REQUEST CAMPAIGN MODAL WITH CKEDITOR */}
      {isModalOpen && (
        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '2px solid #0066ff', marginBottom: '24px' }}>
          <div className='between' style={{ marginBottom: '16px' }}>
            <h3>Request New Research Campaign</h3>
            <button className='iconBtn' onClick={() => setIsModalOpen(false)}><X size={18} /></button>
          </div>

          <form onSubmit={handleCreateRequest} className='stack'>
            <div className='fieldGrid two'>
              <label>
                Campaign Title
                <input 
                  type="text" 
                  placeholder="e.g. Festival Season Store Hygiene Audit"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </label>

              <label>
                Estimated Budget (₹)
                <input 
                  type="number" 
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                  required
                />
              </label>
            </div>

            <label>
              Campaign Brief & Target Scope (CKEditor Enabled)
              <RichTextEditor
                value={briefHtml}
                onChange={setBriefHtml}
                placeholder="Describe your research objective, target outlets, and required evidence..."
              />
            </label>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '14px' }}>
              <button type="button" className='ghost' onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button type="submit" className='primary'>Submit Campaign Request</button>
            </div>
          </form>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className='tableToolbar' style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div className='searchBox' style={{ flex: 1, minWidth: '220px', display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0 12px' }}>
          <Search size={16} color="#64748b" />
          <input 
            placeholder='Search campaign title...' 
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            style={{ border: 0, outline: 'none', width: '100%', padding: '8px 0', fontSize: '13px' }}
          />
        </div>

        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }} style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px' }}>
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Draft">Draft</option>
          <option value="Completed">Completed</option>
        </select>

        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px' }}>
          <option value="default">Sort: Default</option>
          <option value="name">Sort: Title (A-Z)</option>
        </select>
      </div>

      <div className='campaignGrid'>
        {paginatedCampaigns.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', gridColumn: '1 / -1' }}>No campaigns match your filters.</div>
        ) : (
          paginatedCampaigns.map((c) => (
            <div className='card clientCampaign' key={c[0]}>
              <div className='between'>
                <div>
                  <span className='eyebrow'>SAMSUNG INDIA</span>
                  <h3>{c[0]}</h3>
                </div>
                <span className={c[1] === 'Active' ? 'badge green' : c[1] === 'Completed' ? 'badge' : 'badge orange'}>
                  {c[1]}
                </span>
              </div>

              <div className='campaignMini'>
                <div><b>{c[2]}</b><span>Total tasks</span></div>
                <div><b>{c[3]}</b><span>Completed</span></div>
                <div><b>{c[5]}</b><span>Budget</span></div>
              </div>

              <div className='progress'><span style={{ width: c[4] }} /></div>

              <div className='between'>
                <span className='muted'>{c[4]} complete</span>
                <div>
                  <button className='ghost' onClick={() => handleViewCampaign(c)}>
                    <Eye size={15} /> View
                  </button>
                  <button className='ghost' onClick={() => showToast(`Downloading campaign data export for ${c[0]}...`)}>
                    <Download size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Pagination 
        currentPage={currentPage}
        totalPages={Math.ceil(filteredCampaigns.length / pageSize)}
        onPageChange={setCurrentPage}
        pageSize={pageSize}
        totalItems={filteredCampaigns.length}
      />
    </AppLayout>
  );
}
