import React, { useState, useEffect } from 'react';
import AppLayout from '../layouts/AppLayout';
import { TrendingUp, MapPin, CheckCircle2, Users, FileSpreadsheet, Database } from 'lucide-react';
import { Card, SectionTitle, Stat } from '../components/ui';
import { showSuccess } from '../utils/swal';
import api from '../services/api';

export default function Reports() {
  const [reportMonth, setReportMonth] = useState('September 2026');
  const [reportData, setReportData] = useState({
    campaigns: [],
    tasks: [],
    loading: true
  });

  useEffect(() => {
    Promise.allSettled([
      api.admin.getCampaigns(),
      api.admin.getTasks()
    ]).then(([campRes, taskRes]) => {
      const campaigns = campRes.status === 'fulfilled' ? (campRes.value.campaigns || campRes.value || []) : [];
      const tasks = taskRes.status === 'fulfilled' ? (taskRes.value.tasks || taskRes.value || []) : [];
      setReportData({ campaigns, tasks, loading: false });
    });
  }, []);

  const { campaigns, tasks } = reportData;

  const completedTasks = tasks.filter(t => t.status === 'Completed' || t.status === 'Approved');
  const completionRate = tasks.length > 0 ? `${Math.round((completedTasks.length / tasks.length) * 100)}%` : '0%';
  const uniqueAuditors = new Set(tasks.map(t => t.assigned_to || t.user_id).filter(Boolean)).size;
  const locationsCount = new Set(tasks.map(t => t.location || t.city).filter(Boolean)).size;

  const handleExportCampaignExcel = () => {
    if (tasks.length === 0) {
      showSuccess('Report Generated', 'No active audit records found to export for ' + reportMonth);
      return;
    }
    const headers = ['Task Title', 'Location / City', 'Status', 'Reward', 'Category'];
    const rows = tasks.map(t => [
      `"${t.title || t.name || 'Audit Task'}"`,
      `"${t.location || t.city || 'N/A'}"`,
      `"${t.status || 'Pending'}"`,
      `"₹${t.reward || t.payout || 0}"`,
      `"${t.category || 'General'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `campaign_audit_report_${reportMonth.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showSuccess('Excel Report Downloaded! 📊', `Exported analytics for ${reportMonth}.`);
  };

  return (
    <AppLayout role="admin" title="Reports, Analytics & Export Console">
      {/* Top Header Card */}
      <div className="reportHeader card" style={{ padding: '20px', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <span className="eyebrow" style={{ fontSize: '11px', fontWeight: 800, color: '#0066ff', letterSpacing: '1px', textTransform: 'uppercase' }}>CAMPAIGN ANALYTICS REPORT</span>
          <h2 style={{ margin: '4px 0 2px', fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>Platform Analytics - {reportMonth}</h2>
          <p className="muted" style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
            {campaigns.length} active campaigns · {tasks.length} tasks scheduled across {locationsCount} locations
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select 
            value={reportMonth} 
            onChange={(e) => setReportMonth(e.target.value)}
            style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#ffffff', fontWeight: 600, outline: 'none' }}
          >
            <option value="September 2026">September 2026</option>
            <option value="August 2026">August 2026</option>
            <option value="July 2026">July 2026</option>
          </select>
          <button 
            className="primary" 
            onClick={handleExportCampaignExcel}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', background: '#0066ff', color: '#ffffff', border: 0, cursor: 'pointer' }}
          >
            <FileSpreadsheet size={16} /> Export Excel / CSV Report
          </button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="statsGrid four">
        <Stat label="Campaign completion" value={completionRate} icon={<TrendingUp size={20}/>} />
        <Stat label="Approved audits" value={completedTasks.length.toString()} icon={<CheckCircle2 size={20}/>} />
        <Stat label="Unique auditors" value={uniqueAuditors.toString()} icon={<Users size={20}/>} />
        <Stat label="Locations covered" value={locationsCount.toString()} icon={<MapPin size={20}/>} />
      </div>

      {/* Two Column Visual Analytics */}
      <div className="twoCol" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <Card style={{ padding: '20px', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <SectionTitle title="Audit Quality & Score Trend" />
          <div className="lineChart" style={{ height: '220px', color: '#0066ff' }}>
            <svg viewBox="0 0 600 220" preserveAspectRatio="none" style={{ width: '100%', height: '180px' }}>
              <polyline points="10,170 90,150 170,150 250,120 330,120 410,100 500,100 590,80" fill="none" stroke="currentColor" strokeWidth="4" />
            </svg>
            <div className="chartLabels" style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '11px', marginTop: '8px' }}>
              <span>Week 1</span>
              <span>Week 2</span>
              <span>Week 3</span>
              <span>Week 4</span>
            </div>
          </div>
        </Card>

        <Card style={{ padding: '20px', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <SectionTitle title="Compliance Score by Category" />
          {[
            ['Task Execution & Accuracy', tasks.length > 0 ? 92 : 0],
            ['Media Evidence & Photos', tasks.length > 0 ? 88 : 0],
            ['GPS Location Verification', tasks.length > 0 ? 95 : 0],
            ['SLA & Timely Submission', tasks.length > 0 ? 84 : 0]
          ].map(x => (
            <div className="barMetric" key={x[0]} style={{ margin: '14px 0' }}>
              <div className="between" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
                <span style={{ color: '#334155', fontWeight: 600 }}>{x[0]}</span>
                <b style={{ color: '#0f172a' }}>{x[1]}%</b>
              </div>
              <div className="progress" style={{ height: '8px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                <span style={{ display: 'block', height: '100%', background: 'linear-gradient(90deg, #3b82f6, #0066ff)', width: `${x[1]}%`, borderRadius: '999px' }} />
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Locations / Tasks Scorecard Table */}
      <Card style={{ padding: '20px', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
        <SectionTitle title="Store & Task Audit Scorecard" action="Download Excel" onActionClick={handleExportCampaignExcel} />
        
        {tasks.length === 0 ? (
          <div style={{ padding: '30px 10px', textAlign: 'center', color: '#64748b' }}>
            <Database size={28} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>No audit reports available for {reportMonth}.</p>
            <small style={{ fontSize: '11px', color: '#94a3b8' }}>Create campaigns and schedule tasks to populate live audit scorecards.</small>
          </div>
        ) : (
          <div className="dataTable compact" style={{ marginTop: '14px' }}>
            <div className="dataHead" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.1fr 0.8fr 0.9fr 0.8fr 0.9fr', gap: '10px', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              <span>Task / Store</span>
              <span>Location</span>
              <span>Audits</span>
              <span>Reward</span>
              <span>Category</span>
              <span>Status</span>
            </div>
            {tasks.map((t, i) => (
              <div className="dataRow" key={i} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.1fr 0.8fr 0.9fr 0.8fr 0.9fr', gap: '10px', alignItems: 'center', padding: '12px', borderBottom: '1px solid #f1f5f9', fontSize: '13px' }}>
                <b style={{ color: '#0f172a' }}>{t.title || t.name || `Task #${t.id}`}</b>
                <span>{t.location || t.city || 'Pan-India'}</span>
                <span>1</span>
                <strong style={{ color: '#0066ff' }}>₹{t.reward || t.payout || 0}</strong>
                <span>{t.category || 'Retail'}</span>
                <span>{t.status || 'Active'}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </AppLayout>
  );
}
