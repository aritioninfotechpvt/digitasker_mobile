import React, { useState, useMemo } from 'react';
import AppLayout from '../layouts/AppLayout';
import { Card, Badge } from '../components/ui';
import { Search, Download, Activity, Filter, Clock } from 'lucide-react';
import { auditLogs as initialLogs } from '../data/dummy';
import { showSuccess } from '../utils/swal';
import Pagination from '../components/Pagination';
import api from '../services/api';

export default function AuditLogs() {
  const [logsList, setLogsList] = useState(initialLogs);

  React.useEffect(() => {
    api.admin.getAuditLogs()
      .then(res => {
        const rawLogs = Array.isArray(res) ? res : (res.logs || []);
        if (rawLogs.length > 0) {
          setLogsList(rawLogs.map(l => ({
            id: `LOG-${l.id}`,
            time: l.created_at ? new Date(l.created_at).toLocaleString() : 'Just now',
            actor: l.user_name || 'System Admin',
            action: l.action,
            resource: l.target,
            ip: l.ip_address || '127.0.0.1 (Web Portal)',
            result: l.status || 'Success'
          })));
        }
      })
      .catch(() => {});
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All');
  const [resultFilter, setResultFilter] = useState('All');
  const [sortBy, setSortBy] = useState('time');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const handleExportLogs = () => {
    const headers = ['Log ID', 'Time', 'Actor', 'Action', 'Resource', 'IP & Device', 'Result'];
    const rows = filteredLogs.map(l => [
      l.id,
      `"${l.time}"`,
      `"${l.actor}"`,
      `"${l.action}"`,
      `"${l.resource}"`,
      `"${l.ip}"`,
      l.result
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    showSuccess('Export Complete!', 'Downloaded audit log CSV.');
  };

  const filteredLogs = useMemo(() => {
    let result = logsList.filter(l => {
      const matchesSearch = 
        l.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.ip.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesModule = moduleFilter === 'All' || 
        (moduleFilter === 'Payments' && (l.action.toLowerCase().includes('payout') || l.action.toLowerCase().includes('payment'))) ||
        (moduleFilter === 'Tasks' && (l.action.toLowerCase().includes('task') || l.action.toLowerCase().includes('submission')));

      const matchesResult = resultFilter === 'All' || l.result === resultFilter;

      return matchesSearch && matchesModule && matchesResult;
    });

    result.sort((a, b) => {
      if (sortBy === 'actor') return a.actor.localeCompare(b.actor);
      return 0; // default time order
    });

    return result;
  }, [logsList, searchQuery, moduleFilter, resultFilter, sortBy]);

  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  return (
    <AppLayout role='admin' title='Audit Logs'>
      <Card style={{ padding: '20px' }}>
        <div className='between' style={{ marginBottom: '16px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px' }}>System Security & Activity Trail</h2>
            <p className='muted' style={{ margin: '2px 0 0', fontSize: '13px' }}>Immutable audit trail for all sensitive admin actions, payouts, and system changes.</p>
          </div>
          <button className='ghost' onClick={handleExportLogs}>
            <Download size={16} /> Export CSV Logs
          </button>
        </div>

        <div className='tableToolbar' style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <div className='searchBox' style={{ flex: 1, minWidth: '220px', display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0 12px' }}>
            <Search size={17} color="#64748b" />
            <input 
              placeholder='Search actor, resource, action or IP...' 
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              style={{ border: 0, outline: 'none', width: '100%', padding: '8px 0', fontSize: '13px' }}
            />
          </div>

          <select value={moduleFilter} onChange={e => { setModuleFilter(e.target.value); setCurrentPage(1); }} style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px' }}>
            <option value="All">All Modules</option>
            <option value="Payments">Payments & Wallet</option>
            <option value="Tasks">Tasks & Submissions</option>
          </select>

          <select value={resultFilter} onChange={e => { setResultFilter(e.target.value); setCurrentPage(1); }} style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px' }}>
            <option value="All">All Statuses</option>
            <option value="Success">Success</option>
            <option value="Failed">Failed</option>
          </select>

          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px' }}>
            <option value="time">Sort: Timestamp (Newest)</option>
            <option value="actor">Sort: Actor Name</option>
          </select>
        </div>

        <div className='auditTable'>
          <div className='dataHead' style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr 1.2fr 1.4fr 1.3fr 0.7fr', padding: '10px 12px', background: '#f8fafc', fontWeight: 700, fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>
            <span>Timestamp</span>
            <span>Actor</span>
            <span>Action</span>
            <span>Resource</span>
            <span>IP / Device</span>
            <span>Result</span>
          </div>

          {paginatedLogs.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No audit logs match filter criteria.</div>
          ) : (
            paginatedLogs.map(l => (
              <div className='dataRow' key={l.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr 1.2fr 1.4fr 1.3fr 0.7fr', gap: '10px', alignItems: 'center', padding: '12px', borderBottom: '1px solid #f1f5f9', fontSize: '13px' }}>
                <span style={{ color: '#64748b', fontSize: '12px' }}>{l.time}</span>
                <b style={{ color: '#0f172a' }}>{l.actor}</b>
                <span>{l.action}</span>
                <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#0066ff' }}>{l.resource}</span>
                <small style={{ color: '#64748b', fontSize: '11px' }}>{l.ip}</small>
                <div>
                  <Badge tone={l.result === 'Success' ? 'green' : 'red'}>{l.result}</Badge>
                </div>
              </div>
            ))
          )}
        </div>

        <Pagination 
          currentPage={currentPage}
          totalPages={Math.ceil(filteredLogs.length / pageSize)}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          totalItems={filteredLogs.length}
        />
      </Card>
    </AppLayout>
  );
}
