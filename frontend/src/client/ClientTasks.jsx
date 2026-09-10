import React, { useState, useMemo } from 'react';
import AppLayout from '../layouts/AppLayout';
import { Card, Badge, Stat, SectionTitle } from '../components/ui';
import { 
  ClipboardList, CheckCircle2, Clock3, AlertTriangle, Search, Filter, Plus, Eye, 
  Download, MapPinned, BadgeIndianRupee, Layers, FileCheck2, ArrowUpDown
} from 'lucide-react';
import { showSuccess, showToast, showRichModal } from '../utils/swal';
import Pagination from '../components/Pagination';

import api from '../services/api';

export default function ClientTasks() {
  const [taskList, setTaskList] = useState([]);

  React.useEffect(() => {
    let currentUser = null;
    try {
      const u = localStorage.getItem('insightloop_user');
      currentUser = u ? JSON.parse(u) : null;
    } catch (e) {}

    const cacheKey = currentUser?.id ? `digitasker_custom_client_tasks_${currentUser.id}` : 'digitasker_custom_client_tasks';
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        setTaskList(JSON.parse(cached));
      } catch (e) {}
    }

    api.client.getTasks()
      .then(res => {
        const rawTasks = res.tasks || (Array.isArray(res) ? res : []);
        if (Array.isArray(rawTasks) && rawTasks.length > 0) {
          const fetched = rawTasks.map(t => ({
            id: t.task_code || (t.id ? `TSK-${t.id}` : 'TSK-001'),
            title: t.title || t.name || 'Field Audit Task',
            campaign: t.campaign?.title || t.campaign_name || 'Active Campaign',
            location: t.location || 'Pan-India',
            type: t.type || 'Mystery Audit',
            targetQuota: parseInt(t.target_quota) || 50,
            completed: parseInt(t.completed_count) || 0,
            rewardPerTask: typeof t.reward_per_task === 'string' && t.reward_per_task.startsWith('₹') ? t.reward_per_task : `₹${parseFloat(t.reward_per_task) || 350}`,
            status: t.status || 'In Progress',
            submissionsPendingQC: parseInt(t.pending_qc) || 0,
            dueDate: t.due_date || '30 Sep 2026'
          }));
          setTaskList(fetched);
          localStorage.setItem(cacheKey, JSON.stringify(fetched));
        }
      })
      .catch(() => {});
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const filteredTasks = useMemo(() => {
    let result = taskList.filter(t => {
      const matchesSearch = 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.campaign.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
      const matchesType = typeFilter === 'All' || t.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });

    if (sortBy === 'completion') {
      result = [...result].sort((a, b) => (b.completed / b.targetQuota) - (a.completed / a.targetQuota));
    } else if (sortBy === 'dueDate') {
      result = [...result].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    } else if (sortBy === 'title') {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [taskList, searchQuery, statusFilter, typeFilter, sortBy]);

  const totalPages = Math.ceil(filteredTasks.length / pageSize);
  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTasks.slice(start, start + pageSize);
  }, [filteredTasks, currentPage, pageSize]);

  const avgTaskReward = useMemo(() => {
    if (!taskList || taskList.length === 0) return '₹0';
    const totalReward = taskList.reduce((sum, t) => {
      const num = typeof t.rewardPerTask === 'number' 
        ? t.rewardPerTask 
        : Number(t.rewardPerTask?.toString().replace(/[^0-9.]/g, '')) || 0;
      return sum + num;
    }, 0);
    const avg = Math.round(totalReward / taskList.length);
    return `₹${avg.toLocaleString('en-IN')}`;
  }, [taskList]);

  const handleReviewTask = (t) => {
    showRichModal(
      `Task Details: ${t.title}`,
      `<div style="text-align:left; font-size:13px; line-height:1.6;">
        <p><b>Task ID:</b> ${t.id}</p>
        <p><b>Campaign:</b> ${t.campaign}</p>
        <p><b>Location Scope:</b> ${t.location}</p>
        <p><b>Audit Type:</b> ${t.type}</p>
        <p><b>Audit Quota:</b> ${t.completed} of ${t.targetQuota} completed (${Math.round((t.completed / t.targetQuota) * 100)}%)</p>
        <p><b>Pending Verification:</b> ${t.submissionsPendingQC} submissions</p>
        <p><b>Audit Reward:</b> ${t.rewardPerTask} / audit</p>
        <p><b>Due Date:</b> ${t.dueDate}</p>
      </div>`
    );
  };

  const handleExportData = () => {
    showToast('Exporting task compliance report CSV...', 'info');
  };

  return (
    <AppLayout role="client" title="Campaign Task Monitoring">
      <div className="statsGrid four">
        <Stat label="Active tasks" value={taskList.length.toString()} icon={<ClipboardList size={20}/>} />
        <Stat label="Completed audits" value={taskList.reduce((acc, t) => acc + t.completed, 0).toString()} icon={<CheckCircle2 size={20}/>} />
        <Stat label="Pending verification" value={taskList.reduce((acc, t) => acc + t.submissionsPendingQC, 0).toString()} icon={<Clock3 size={20}/>} />
        <Stat label="Avg. task reward" value={avgTaskReward} icon={<BadgeIndianRupee size={20}/>} />
      </div>

      <div className="advancedToolbar" style={{ display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'center' }}>
        <div className="searchBox" style={{ flex: 1 }}>
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Search task title, campaign, location, ID..." 
            value={searchQuery} 
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} 
          />
        </div>

        <select 
          style={{ height: '38px', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '0 12px', fontSize: '13px', background: 'white' }}
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
        >
          <option value="All">All Statuses</option>
          <option value="In Progress">In Progress</option>
          <option value="In Verification">In Verification</option>
          <option value="Completed">Completed</option>
        </select>

        <select 
          style={{ height: '38px', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '0 12px', fontSize: '13px', background: 'white' }}
          value={typeFilter}
          onChange={e => { setTypeFilter(e.target.value); setCurrentPage(1); }}
        >
          <option value="All">All Task Types</option>
          <option value="Mystery Audit">Mystery Audit</option>
          <option value="Photo Verification">Photo Verification</option>
          <option value="Price Check">Price Check</option>
          <option value="Audit & Survey">Audit & Survey</option>
        </select>

        <select 
          style={{ height: '38px', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '0 12px', fontSize: '13px', background: 'white' }}
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
        >
          <option value="default">Sort: Default</option>
          <option value="completion">Sort: Completion Rate</option>
          <option value="dueDate">Sort: Due Date</option>
          <option value="title">Sort: Title (A-Z)</option>
        </select>

        <button className="ghostDark" onClick={handleExportData}>
          <Download size={15} /> Export Tasks
        </button>
      </div>

      <Card style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px 0' }}>
          <SectionTitle title="Live campaign tasks & execution progress" />
        </div>

        <div className="dataTable" style={{ gridTemplateColumns: '1.6fr 1.2fr 1.1fr 0.9fr 1.1fr 0.8fr 0.7fr' }}>
          <div className="dataHead" style={{ gridTemplateColumns: '1.6fr 1.2fr 1.1fr 0.9fr 1.1fr 0.8fr 0.7fr' }}>
            <span>Task / Campaign</span>
            <span>Location</span>
            <span>Audit Type</span>
            <span>Progress</span>
            <span>Pending QC</span>
            <span>Status</span>
            <span>Action</span>
          </div>

          {paginatedTasks.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No matching tasks found.</div>
          ) : (
            paginatedTasks.map(t => {
              const pct = Math.round((t.completed / t.targetQuota) * 100);
              return (
                <div className="dataRow" key={t.id} style={{ gridTemplateColumns: '1.6fr 1.2fr 1.1fr 0.9fr 1.1fr 0.8fr 0.7fr' }}>
                  <div className="cellColumn">
                    <b>{t.title}</b>
                    <small>{t.campaign} · {t.id}</small>
                  </div>
                  <span>{t.location}</span>
                  <Badge tone="purple">{t.type}</Badge>
                  <div className="cellColumn">
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>{t.completed}/{t.targetQuota} ({pct}%)</span>
                    <div style={{ height: '5px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? '#10b981' : '#0066ff', borderRadius: '999px' }} />
                    </div>
                  </div>
                  <span>{t.submissionsPendingQC} ready for review</span>
                  <Badge tone={t.status === 'Completed' ? 'green' : t.status === 'In Verification' ? 'orange' : 'purple'}>
                    {t.status}
                  </Badge>
                  <button className="ghostDark" style={{ height: '30px', padding: '0 10px', fontSize: '12px' }} onClick={() => handleReviewTask(t)}>
                    <Eye size={14} /> Review
                  </button>
                </div>
              );
            })
          )}
        </div>

        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredTasks.length}
          pageSize={pageSize}
          onPageChange={p => setCurrentPage(p)}
        />
      </Card>
    </AppLayout>
  );
}
