import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart3, Building2, CalendarClock, CheckCircle2, Download, FileBarChart, Filter, MapPinned, 
  Plus, Search, ShieldCheck, Users2, Database
} from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import { Badge, Card, SectionTitle, Stat } from '../components/ui';
import { showSuccess, showToast } from '../utils/swal';
import Pagination from '../components/Pagination';
import api from '../services/api';

const Page = ({ title, children }) => <AppLayout role="client" title={title}>{children}</AppLayout>;

export function ClientTeam() {
  const [team, setTeam] = useState(() => {
    const cached = localStorage.getItem('digitasker_custom_client_team');
    return cached ? JSON.parse(cached) : [];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const handleInviteMember = () => {
    showSuccess('Member Invited', 'An invitation email has been sent to the new team member.');
  };

  const filteredTeam = useMemo(() => {
    return team.filter(x => {
      const matchesSearch = x.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            x.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            x.scope.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'All' || x.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [team, searchQuery, roleFilter]);

  const totalPages = Math.ceil(filteredTeam.length / pageSize);
  const paginatedTeam = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTeam.slice(start, start + pageSize);
  }, [filteredTeam, currentPage, pageSize]);

  return (
    <Page title="Team & Access Control">
      <div className="statsGrid four">
        <Stat label="Client users" value={team.length.toString()} icon={<Users2 size={20}/>} />
        <Stat label="Regions" value={new Set(team.map(x => x.scope)).size.toString()} icon={<MapPinned size={20}/>} />
        <Stat label="Restricted users" value={team.filter(x => x.role === 'Viewer').length.toString()} icon={<ShieldCheck size={20}/>} />
        <Stat label="Pending invites" value={team.filter(x => x.status === 'Pending').length.toString()} icon={<CalendarClock size={20}/>} />
      </div>

      <div className="advancedToolbar" style={{ display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'center' }}>
        <div className="searchBox" style={{ flex: 1 }}>
          <Search size={16} />
          <input 
            placeholder="Search team member, role, scope..." 
            value={searchQuery} 
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} 
          />
        </div>

        <select 
          style={{ height: '38px', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '0 12px', fontSize: '13px', background: 'white' }}
          value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); setCurrentPage(1); }}
        >
          <option value="All">All Roles</option>
          <option value="Brand Admin">Brand Admin</option>
          <option value="Regional Manager">Regional Manager</option>
          <option value="Viewer">Viewer</option>
        </select>

        <button className="primary" onClick={handleInviteMember}>
          <Plus size={15} /> Invite member
        </button>
      </div>

      <Card style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px 0' }}>
          <SectionTitle title="Enterprise access matrix" />
        </div>

        <div className="dataTable clientTeamTable" style={{ gridTemplateColumns: '1.5fr 1.2fr 1.2fr 1fr 0.8fr 0.8fr' }}>
          <div className="dataHead" style={{ gridTemplateColumns: '1.5fr 1.2fr 1.2fr 1fr 0.8fr 0.8fr' }}>
            <span>User</span>
            <span>Role</span>
            <span>Data scope</span>
            <span>Last active</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {paginatedTeam.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No matching team members found.</div>
          ) : (
            paginatedTeam.map(x => (
              <div className="dataRow" key={x.name} style={{ gridTemplateColumns: '1.5fr 1.2fr 1.2fr 1fr 0.8fr 0.8fr' }}>
                <div className="cellColumn">
                  <b>{x.name}</b>
                  <small>{x.role}</small>
                </div>
                <span>{x.role}</span>
                <span>{x.scope}</span>
                <span>{x.last}</span>
                <Badge tone={x.status === 'Active' ? 'green' : 'orange'}>{x.status}</Badge>
                <button className="ghostDark" style={{ height: '30px', padding: '0 10px', fontSize: '12px' }} onClick={() => showToast(`Managing access permissions for ${x.name}`, 'info')}>
                  Manage
                </button>
              </div>
            ))
          )}
        </div>

        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredTeam.length}
          pageSize={pageSize}
          onPageChange={p => setCurrentPage(p)}
        />
      </Card>
    </Page>
  );
}

export function ReportBuilder() {
  const [selectedCampaign, setSelectedCampaign] = useState('Q3 Store Display & Signage Audit');
  const [dateRange, setDateRange] = useState('01 Sep 2026 — 30 Sep 2026');
  const [activeRegions, setActiveRegions] = useState({ North: true, West: true, South: false, East: false });
  const [storeFilter, setStoreFilter] = useState('');

  const [blocks, setBlocks] = useState([
    { id: 'exec', name: 'Executive summary', enabled: true },
    { id: 'score', name: 'Compliance scorecards', enabled: true },
    { id: 'q_analytics', name: 'Question-level analytics', enabled: true },
    { id: 'ranking', name: 'Store ranking', enabled: true },
    { id: 'evidence', name: 'Evidence gallery', enabled: true },
    { id: 'comments', name: 'Auditor comments', enabled: false },
    { id: 'exceptions', name: 'Exception list', enabled: true },
    { id: 'recommendations', name: 'Recommendations', enabled: true }
  ]);

  const toggleBlock = (id) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, enabled: !b.enabled } : b));
  };

  const selectAllBlocks = (val) => {
    setBlocks(prev => prev.map(b => ({ ...b, enabled: val })));
  };

  const enabledCount = useMemo(() => blocks.filter(b => b.enabled).length, [blocks]);

  const handleGeneratePDF = () => {
    showSuccess(
      'Custom PDF Generated! 📄',
      `Your custom audit report for "${selectedCampaign}" (${enabledCount} sections) has been generated & downloaded.`
    );
  };

  const handleExportExcel = () => {
    showToast('Exporting custom report datasets to Excel (.xlsx)...', 'info');
  };

  const inputStyle = {
    width: '100%',
    height: '38px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    padding: '0 12px',
    fontSize: '13px',
    boxSizing: 'border-box',
    background: 'white',
    marginTop: '4px'
  };

  return (
    <Page title="Custom Report Builder">
      <div className="reportBuilderGrid">
        <Card>
          <SectionTitle title="1. Data Scope & Scope Filters" />
          <div className="stack" style={{ gap: '14px', marginTop: '10px' }}>
            <label style={{ fontSize: '12.5px', fontWeight: 600 }}>
              Campaign Selection
              <select 
                value={selectedCampaign} 
                onChange={e => setSelectedCampaign(e.target.value)}
                style={inputStyle}
              >
                <option value="Q3 Store Display & Signage Audit">Q3 Store Display & Signage Audit</option>
                <option value="Mystery Shopping & Staff Behavior">Mystery Shopping & Staff Behavior</option>
                <option value="Festive POSM Deployment Audit">Festive POSM Deployment Audit</option>
              </select>
            </label>

            <label style={{ fontSize: '12.5px', fontWeight: 600 }}>
              Date Range
              <input 
                value={dateRange} 
                onChange={e => setDateRange(e.target.value)} 
                placeholder="e.g. 01 Sep 2026 — 30 Sep 2026"
                style={inputStyle}
              />
            </label>

            <div>
              <span style={{ fontSize: '12.5px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Target Regions</span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['North', 'West', 'South', 'East'].map(reg => {
                  const isActive = activeRegions[reg];
                  return (
                    <button
                      key={reg}
                      type="button"
                      onClick={() => setActiveRegions(prev => ({ ...prev, [reg]: !prev[reg] }))}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 600,
                        border: '1px solid',
                        borderColor: isActive ? '#0066ff' : '#cbd5e1',
                        background: isActive ? '#eff6ff' : '#f8fafc',
                        color: isActive ? '#0066ff' : '#475569',
                        cursor: 'pointer'
                      }}
                    >
                      {reg} {isActive ? '✓' : '+'}
                    </button>
                  );
                })}
              </div>
            </div>

            <label style={{ fontSize: '12.5px', fontWeight: 600 }}>
              Store Locations Filter
              <input 
                value={storeFilter}
                onChange={e => setStoreFilter(e.target.value)}
                placeholder="e.g. Metro Flagship Outlets" 
                style={inputStyle}
              />
            </label>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <SectionTitle title="2. Report Blocks" />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                type="button" 
                className="ghostDark" 
                style={{ fontSize: '11px', padding: '3px 8px', height: 'auto' }}
                onClick={() => selectAllBlocks(true)}
              >
                All
              </button>
              <button 
                type="button" 
                className="ghostDark" 
                style={{ fontSize: '11px', padding: '3px 8px', height: 'auto' }}
                onClick={() => selectAllBlocks(false)}
              >
                Clear
              </button>
            </div>
          </div>
          <p style={{ fontSize: '11.5px', color: '#64748b', margin: '-4px 0 12px' }}>
            {enabledCount} of {blocks.length} sections enabled for output compilation
          </p>

          <div className="stack" style={{ gap: '4px' }}>
            {blocks.map(b => (
              <div 
                className="toggleRow" 
                key={b.id}
                onClick={() => toggleBlock(b.id)}
              >
                <div>
                  <b>{b.name}</b>
                  <span>Include in generated PDF report output</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={b.enabled} 
                  onChange={() => toggleBlock(b.id)} 
                  onClick={e => e.stopPropagation()}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card style={{ background: '#fafafa' }}>
          <SectionTitle title="3. Live Document Preview" />
          <div className="reportPreview">
            <div className="previewCover">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 color="#0066ff" size={22} />
                <b style={{ fontSize: '14px', color: '#0f172a' }}>{selectedCampaign}</b>
              </div>
              <span style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                {dateRange} · {Object.keys(activeRegions).filter(k => activeRegions[k]).join(', ')} Region
              </span>
            </div>

            <div className="previewKpis">
              <div>
                <b>94.2%</b>
                <span>Compliance</span>
              </div>
              <div>
                <b>102</b>
                <span>Audits</span>
              </div>
              <div>
                <b>6</b>
                <span>Exceptions</span>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Included Sections ({enabledCount})
              </span>
              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: '#334155', lineHeight: '1.6' }}>
                {blocks.filter(b => b.enabled).map(b => (
                  <li key={b.id}>✓ {b.name}</li>
                ))}
                {enabledCount === 0 && <li style={{ color: '#94a3b8', listStyle: 'none' }}>No sections selected</li>}
              </ul>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
            <button className="primary" onClick={handleGeneratePDF} style={{ flex: 1 }}>
              <Download size={15} /> Generate PDF Report
            </button>

            <button className="ghostDark" onClick={handleExportExcel} style={{ flex: 1 }}>
              📊 Export Excel
            </button>
          </div>
        </Card>
      </div>
    </Page>
  );
}

export function ScheduledReports() {
  const [schedules, setSchedules] = useState(() => {
    const cached = localStorage.getItem('digitasker_custom_scheduled_reports');
    return cached ? JSON.parse(cached) : [];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  const handleNewSchedule = () => {
    showSuccess('New Schedule Added', 'Automated report distribution schedule created.');
  };

  const filteredSchedules = useMemo(() => {
    return schedules.filter(r => 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.frequency.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [schedules, searchQuery]);

  const totalPages = Math.ceil(filteredSchedules.length / pageSize);
  const paginatedSchedules = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSchedules.slice(start, start + pageSize);
  }, [filteredSchedules, currentPage, pageSize]);

  return (
    <Page title="Scheduled Reports">
      <div className="statsGrid four">
        <Stat label="Active schedules" value={schedules.length.toString()} icon={<CalendarClock size={20}/>} />
        <Stat label="Email recipients" value={schedules.reduce((acc, s) => acc + (parseInt(s.recipients) || 0), 0).toString()} icon={<Users2 size={20}/>} />
        <Stat label="Generated this month" value="0" icon={<FileBarChart size={20}/>} />
        <Stat label="Delivery success" value={schedules.length > 0 ? "100%" : "0%"} icon={<CheckCircle2 size={20}/>} />
      </div>

      <div className="advancedToolbar" style={{ display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'center' }}>
        <div className="searchBox" style={{ flex: 1 }}>
          <Search size={16} />
          <input 
            placeholder="Search report schedules..." 
            value={searchQuery} 
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} 
          />
        </div>

        <button className="primary" onClick={handleNewSchedule}>
          <Plus size={15} /> New schedule
        </button>
      </div>

      <Card style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px 0' }}>
          <SectionTitle title="Automated Distribution Schedules" />
        </div>

        <div className="stack" style={{ gap: 0 }}>
          {paginatedSchedules.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No matching schedules found.</div>
          ) : (
            paginatedSchedules.map(r => (
              <div className="scheduledRow" key={r.name}>
                <div className="scheduledIcon"><CalendarClock size={20} /></div>
                <div className="grow" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <b style={{ fontSize: '14px', color: '#0f172a' }}>{r.name}</b>
                  <span style={{ fontSize: '12px', color: '#475569' }}>{r.frequency} · {r.format}</span>
                  <small style={{ fontSize: '11px', color: '#64748b' }}>{r.recipients} recipients · Last generated {r.last}</small>
                </div>
                <Badge tone="green">{r.status}</Badge>
                <button className="ghostDark" style={{ height: '32px' }} onClick={() => showToast(`Editing schedule ${r.name}`, 'info')}>
                  Edit
                </button>
              </div>
            ))
          )}
        </div>

        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredSchedules.length}
          pageSize={pageSize}
          onPageChange={p => setCurrentPage(p)}
        />
      </Card>
    </Page>
  );
}

export function AdvancedAnalytics() {
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    api.client.getCampaigns()
      .then(res => {
        if (res.campaigns && res.campaigns.length > 0) {
          setCampaigns(res.campaigns);
        }
      })
      .catch(() => {});
  }, []);

  const totalTasks = campaigns.reduce((a, c) => a + (parseInt(c.target_tasks) || 0), 0);
  const totalCompleted = campaigns.reduce((a, c) => a + (parseInt(c.completed_tasks) || 0), 0);

  return (
    <Page title="Advanced Analytics & Benchmarks">
      <div className="statsGrid four">
        <Stat label="Overall compliance" value={campaigns.length > 0 ? "90.0%" : "0%"} icon={<ShieldCheck size={20}/>} />
        <Stat label="Top region" value={campaigns.length > 0 ? "Pan-India" : "N/A"} icon={<MapPinned size={20}/>} />
        <Stat label="Critical exceptions" value="0" icon={<Filter size={20}/>} />
        <Stat label="Audit coverage" value={`${totalCompleted}/${totalTasks}`} icon={<BarChart3 size={20}/>} />
      </div>

      <div className="analyticsAdvanced">
        {campaigns.length === 0 ? (
          <Card style={{ gridColumn: '1 / -1', padding: '30px', textAlign: 'center', color: '#64748b' }}>
            <Database size={28} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>No analytics data available for current client account.</p>
            <small style={{ fontSize: '11px', color: '#94a3b8' }}>Create campaigns and launch tasks to unlock compliance heatmaps and analytics.</small>
          </Card>
        ) : (
          <>
            <Card>
              <SectionTitle title="Compliance trend (Last 4 Weeks)" />
              <div className="bigChart">
                <svg viewBox="0 0 700 240" style={{ width: '100%', height: '180px' }}>
                  <polyline 
                    fill="none" 
                    stroke="#0066ff" 
                    strokeWidth="4" 
                    points="10,185 100,164 190,170 280,122 370,132 460,83 550,94 690,42" 
                  />
                </svg>
                <div className="chartLabels" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginTop: '8px' }}>
                  <span>Week 1</span>
                  <span>Week 2</span>
                  <span>Week 3</span>
                  <span>Week 4</span>
                </div>
              </div>
            </Card>

            <Card>
              <SectionTitle title="Regional compliance heatmap" />
              <div className="heatGrid">
                {[
                  ['North Region', 94],
                  ['West Region', 91],
                  ['South Region', 86],
                  ['East Region', 88]
                ].map(x => (
                  <div key={x[0]}>
                    <b>{x[1]}%</b>
                    <span>{x[0]}</span>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
    </Page>
  );
}
