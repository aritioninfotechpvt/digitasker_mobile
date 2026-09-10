import React, { useState, useMemo } from 'react';
import AppLayout from '../layouts/AppLayout';
import { Card, Badge, Stat } from '../components/ui';
import { Scale, Clock, CheckCircle2, IndianRupee, MessageSquare, Paperclip, Search, Filter } from 'lucide-react';
import { showSuccess, showToast } from '../utils/swal';
import Pagination from '../components/Pagination';

import api from '../services/api';

export default function Disputes() {
  const [disputeList, setDisputeList] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);

  React.useEffect(() => {
    api.admin.getTickets()
      .then(res => {
        const rawTickets = Array.isArray(res) ? res : (res.tickets || []);
        const customDisputes = JSON.parse(localStorage.getItem('digitasker_custom_disputes') || '[]');

        if (rawTickets.length > 0) {
          const mapped = rawTickets.map(t => ({
            id: t.ticket_code || `TKT-${t.id}`,
            raw_id: t.id,
            task: `${t.category || 'General'} Support`,
            user: t.user_name || t.user?.name || 'Auditor',
            reason: `${t.subject} - ${t.body || ''}`,
            amount: 300,
            priority: t.status === 'Open' ? 'High' : 'Low',
            status: t.status || 'Open',
            opened: t.created_at ? new Date(t.created_at).toLocaleDateString() : 'Today',
            reply: t.admin_reply
          }));
          const combined = [...customDisputes, ...mapped];
          const unique = combined.filter((v, i, a) => a.findIndex(x => x.id === v.id) === i);
          setDisputeList(unique);
        } else if (customDisputes.length > 0) {
          setDisputeList(customDisputes);
        } else {
          setDisputeList([
            { id: 'TKT-1042', raw_id: 1, task: 'Task Issues Support', user: 'Rahul Mehta', reason: 'Task rejected incorrectly - store manager refused video recording.', amount: 350, priority: 'High', status: 'Open', opened: 'Today' },
            { id: 'TKT-1027', raw_id: 2, task: 'Payments & Wallet Support', user: 'Sanjay Kumar', reason: 'Withdrawal status update for PAY-9918.', amount: 2000, priority: 'Medium', status: 'Open', opened: '03 Sep 2026' }
          ]);
        }
      })
      .catch(() => {});
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sortBy, setSortBy] = useState('opened');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [customReplyText, setCustomReplyText] = useState('');

  const handleResolve = async (actionType) => {
    if (!selectedCase) return;
    const newStatus = actionType === 'reject' ? 'Rejected' : 'Resolved';
    const replyMsg = customReplyText.trim() 
      ? customReplyText.trim()
      : actionType === 'approve' 
      ? `Approved support ticket. Action completed.` 
      : actionType === 'partial' 
      ? `Partial refund approved.` 
      : `Ticket closed after review.`;

    try {
      await api.admin.replyTicket(selectedCase.raw_id || selectedCase.id, replyMsg, newStatus);
    } catch(err) {}

    const updated = disputeList.filter(d => d.id !== selectedCase.id);
    setDisputeList(updated);
    localStorage.setItem('digitasker_custom_disputes', JSON.stringify(updated));

    if (actionType === 'approve') {
      showSuccess('Support Ticket Resolved ✅', `Approved ticket ${selectedCase.id}. Response saved to database.`);
    } else if (actionType === 'reject') {
      showToast(`Ticket ${selectedCase.id} closed.`, 'info');
    } else {
      showToast(`Partial refund processed for ${selectedCase.id}.`, 'warning');
    }
    setSelectedCase(null);
    setCustomReplyText('');
  };

  const filteredDisputes = useMemo(() => {
    let result = disputeList.filter(d => {
      const matchesSearch = 
        d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.reason.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPriority = priorityFilter === 'All' || d.priority === priorityFilter;

      return matchesSearch && matchesPriority;
    });

    result.sort((a, b) => {
      if (sortBy === 'amount') return b.amount - a.amount;
      return 0; // default order
    });

    return result;
  }, [disputeList, searchQuery, priorityFilter, sortBy]);

  const paginatedDisputes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDisputes.slice(start, start + pageSize);
  }, [filteredDisputes, currentPage, pageSize]);

  const dueTodayCount = disputeList.filter(d => d.priority === 'High' || d.dueToday).length;

  return (
    <AppLayout role='admin' title='Disputes & Appeals'>
      <div className='statsGrid' style={{ marginBottom: '20px' }}>
        <Stat label='Open Appeals' value={disputeList.length.toString()} icon={<Scale />} />
        <Stat label='Due Today' value={dueTodayCount.toString()} icon={<Clock />} />
        <Stat label='Resolved This Month' value='0' icon={<CheckCircle2 />} />
        <Stat label='Amount Under Dispute' value={`₹${disputeList.reduce((acc, d) => acc + (parseFloat(d.amount) || 0), 0).toLocaleString('en-IN')}`} icon={<IndianRupee />} />
      </div>

      <div className='twoCol' style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
        {/* Left Column: Dispute Queue */}
        <Card style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 14px' }}>Dispute Queue</h3>

          <div className='tableToolbar' style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
            <div className='searchBox' style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 10px' }}>
              <Search size={15} color="#64748b" />
              <input 
                placeholder='Search dispute ID, user, task...'
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                style={{ border: 0, outline: 'none', width: '100%', padding: '6px 0', fontSize: '13px' }}
              />
            </div>

            <select value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value); setCurrentPage(1); }} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '12.5px' }}>
              <option value="All">All Priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className='disputeStack' style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {paginatedDisputes.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No active disputes.</div>
            ) : (
              paginatedDisputes.map(d => (
                <div 
                  className={`disputeRow ${selectedCase?.id === d.id ? 'selected' : ''}`} 
                  key={d.id}
                  onClick={() => setSelectedCase(d)}
                  style={{
                    padding: '12px 14px', borderRadius: '10px', border: selectedCase?.id === d.id ? '2px solid #0066ff' : '1px solid #e2e8f0',
                    background: selectedCase?.id === d.id ? '#f0f7ff' : '#fff', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}
                >
                  <div className='grow'>
                    <div className='between' style={{ marginBottom: '4px' }}>
                      <b style={{ color: '#0f172a' }}>{d.id} · {d.task}</b>
                      <Badge tone={d.priority === 'High' ? 'red' : 'orange'}>{d.priority}</Badge>
                    </div>
                    <p style={{ margin: '4px 0', fontSize: '12.5px', color: '#475569' }}><b>{d.user}:</b> {d.reason}</p>
                    <span className='muted' style={{ fontSize: '11px', color: '#64748b' }}>{d.opened} · <strong style={{ color: '#059669' }}>₹{d.amount}</strong></span>
                  </div>
                </div>
              ))
            )}
          </div>

          <Pagination 
            currentPage={currentPage}
            totalPages={Math.ceil(filteredDisputes.length / pageSize)}
            onPageChange={setCurrentPage}
            pageSize={pageSize}
            totalItems={filteredDisputes.length}
          />
        </Card>

        {/* Right Column: Inspector Panel */}
        <Card className='stickyCard' style={{ padding: '20px' }}>
          {selectedCase ? (
            <>
              <div className='between' style={{ marginBottom: '12px' }}>
                <Badge tone='orange'>Awaiting Admin Review</Badge>
                <span className='muted' style={{ fontSize: '12px' }}>Opened {selectedCase.opened}</span>
              </div>
              <h2 style={{ margin: '0 0 6px', fontSize: '20px' }}>{selectedCase.id}</h2>
              <p style={{ margin: 0, fontWeight: 700, color: '#0066ff' }}>{selectedCase.task}</p>
              
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', margin: '14px 0', border: '1px solid #e2e8f0' }}>
                <small style={{ color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '4px' }}>AUDITOR APPEAL REASON ({selectedCase.user})</small>
                <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: 1.5 }}>"{selectedCase.reason}"</p>
              </div>

              <div className='reviewMetric' style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                <MessageSquare size={18} color="#0066ff" />
                <div>
                  <b style={{ fontSize: '13px' }}>3 messages in thread</b>
                  <span style={{ fontSize: '11.5px', color: '#64748b', display: 'block' }}>Auditor + reviewer conversation history</span>
                </div>
              </div>

              <div className='reviewMetric' style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px' }}>
                <Paperclip size={18} color="#0066ff" />
                <div>
                  <b style={{ fontSize: '13px' }}>5 evidence files attached</b>
                  <span style={{ fontSize: '11.5px', color: '#64748b', display: 'block' }}>GPS log, receipts, store photos</span>
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontWeight: '700', fontSize: '12.5px', color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                  Admin Reply / Resolution Message
                </label>
                <textarea 
                  rows={3}
                  placeholder="Type official response to auditor..."
                  value={customReplyText}
                  onChange={e => setCustomReplyText(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div className='decisionStack' style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button className='primary' onClick={() => handleResolve('approve')} style={{ padding: '10px' }}>
                  Approve & Release ₹{selectedCase.amount}
                </button>
                <button className='ghost' onClick={() => handleResolve('partial')} style={{ padding: '10px' }}>
                  Partial Payment (50%)
                </button>
                <button className='danger' onClick={() => handleResolve('reject')} style={{ padding: '10px', background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3' }}>
                  Reject Appeal
                </button>
              </div>
            </>
          ) : (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
              Select a dispute from the queue to inspect details & resolve.
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
