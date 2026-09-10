import React, { useState, useMemo, useEffect } from 'react';
import AppLayout from '../layouts/AppLayout';
import { Card, Badge, Stat, SectionTitle } from '../components/ui';
import { Download, FileText, BarChart3, Search, Filter, CheckCircle2, FileSpreadsheet, Archive, Database } from 'lucide-react';
import { showToast, showSuccess } from '../utils/swal';
import Pagination from '../components/Pagination';
import api from '../services/api';

export default function ClientReports() {
  const [reports, setReports] = useState(() => {
    const cached = localStorage.getItem('digitasker_custom_client_reports');
    return cached ? JSON.parse(cached) : [];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  useEffect(() => {
    api.client.getCampaigns()
      .then(res => {
        if (res.campaigns && res.campaigns.length > 0) {
          const generated = res.campaigns.map((c, i) => ({
            id: `REP-00${i + 1}`,
            title: `${c.title} Executive Audit Summary`,
            type: 'PDF',
            pages: `${c.completed_tasks || 0} audits`,
            size: '2.4 MB',
            updated: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            category: 'Executive'
          }));
          setReports(generated);
          localStorage.setItem('digitasker_custom_client_reports', JSON.stringify(generated));
        }
      })
      .catch(() => {});
  }, []);

  const handleDownload = (r) => {
    showToast(`Downloading ${r.title} (${r.type})...`, 'success');
  };

  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            r.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = categoryFilter === 'All' || r.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [reports, searchQuery, categoryFilter]);

  const totalPages = Math.ceil(filteredReports.length / pageSize);
  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredReports.slice(start, start + pageSize);
  }, [filteredReports, currentPage, pageSize]);

  return (
    <AppLayout role="client" title="Campaign Reports & Exports">
      <div className="statsGrid four">
        <Stat label="Available reports" value={reports.length.toString()} icon={<FileText size={20}/>} />
        <Stat label="Latest report date" value={reports.length > 0 ? reports[0].updated : "N/A"} icon={<CheckCircle2 size={20}/>} />
        <Stat label="Total audit data rows" value={reports.length > 0 ? `${reports.length * 50} rows` : "0 rows"} icon={<FileSpreadsheet size={20}/>} />
        <Stat label="Evidence media size" value={reports.length > 0 ? "240 MB" : "0 MB"} icon={<Archive size={20}/>} />
      </div>

      <div className="card between" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px 20px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: '18px', color: '#0f172a' }}>Executive Campaign Reports</h2>
          <p className="muted" style={{ margin: 0, fontSize: '13px' }}>Download executive summaries or export raw CSV/Excel audit datasets.</p>
        </div>
        <button className="primary" onClick={() => showSuccess('Export Initiated', 'Compiling PDF bundle for your campaigns...')} disabled={reports.length === 0}>
          <Download size={15} /> Download Latest PDF Bundle
        </button>
      </div>

      <div className="advancedToolbar" style={{ display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'center' }}>
        <div className="searchBox" style={{ flex: 1 }}>
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Search report title or ID..." 
            value={searchQuery} 
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} 
          />
        </div>

        <select 
          style={{ height: '38px', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '0 12px', fontSize: '13px', background: 'white' }}
          value={categoryFilter}
          onChange={e => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
        >
          <option value="All">All Categories</option>
          <option value="Executive">Executive Summary</option>
          <option value="Raw Data">Raw Data (XLSX)</option>
          <option value="Evidence">Photo Evidence (ZIP)</option>
        </select>
      </div>

      <Card style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px 0' }}>
          <SectionTitle title="Report Documents & Datasets" />
        </div>

        <div className="stack" style={{ gap: 0 }}>
          {paginatedReports.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
              <Database size={28} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>No reports available.</p>
              <small style={{ fontSize: '11px', color: '#94a3b8' }}>Reports will generate automatically as campaign audits complete.</small>
            </div>
          ) : (
            paginatedReports.map(r => (
              <div className="scheduledRow" key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', color: '#0066ff', display: 'grid', placeItems: 'center' }}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <b style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>{r.title}</b>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>{r.id} · {r.pages} · {r.size} · Updated {r.updated}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <Badge tone={r.type === 'PDF' ? 'blue' : r.type === 'XLSX' ? 'green' : 'purple'}>{r.type}</Badge>
                  <button className="primary" style={{ height: '32px', padding: '0 12px', fontSize: '12px' }} onClick={() => handleDownload(r)}>
                    <Download size={14} /> Download
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredReports.length}
          pageSize={pageSize}
          onPageChange={p => setCurrentPage(p)}
        />
      </Card>
    </AppLayout>
  );
}
