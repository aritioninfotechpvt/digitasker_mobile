import React, { useState, useMemo } from 'react';
import AppLayout from '../layouts/AppLayout';
import { users as initialUsers } from '../data/dummy';
import { Card, Badge, SectionTitle, Stat } from '../components/ui';
import { Users as UsersIcon, Search, Filter, ShieldCheck, Edit3, Lock, Unlock, Eye, CheckCircle2, AlertTriangle, X, ArrowUpDown } from 'lucide-react';
import { showSuccess, showConfirm, showToast } from '../utils/swal';
import Pagination from '../components/Pagination';
import { Link } from 'react-router-dom';

export default function Users() {
  const [userList, setUserList] = useState(() => {
    const cached = localStorage.getItem('digitasker_custom_users');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('completed');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [editingUser, setEditingUser] = useState(null);

  const filteredUsers = useMemo(() => {
    return userList.filter(u => {
      const matchesSearch = 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.level.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'All' || u.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [userList, searchQuery, statusFilter]);

  const sortedUsers = useMemo(() => {
    const list = [...filteredUsers];
    if (sortBy === 'completed') {
      list.sort((a, b) => b.completed - a.completed);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [filteredUsers, sortBy]);

  const totalPages = Math.ceil(sortedUsers.length / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedUsers.slice(start, start + pageSize);
  }, [sortedUsers, currentPage, pageSize]);

  const handleToggleLock = async (user) => {
    const isLocked = user.status === 'Suspended';
    const confirmed = await showConfirm(
      `${isLocked ? 'Unlock' : 'Suspend'} User Account?`,
      `Are you sure you want to ${isLocked ? 'unlock' : 'suspend'} ${user.name}?`
    );

    if (confirmed) {
      const updated = userList.map(u => u.name === user.name ? { ...u, status: isLocked ? 'Active' : 'Suspended' } : u);
      setUserList(updated);
      localStorage.setItem('digitasker_custom_users', JSON.stringify(updated));
      showToast(`User ${user.name} account ${isLocked ? 'reactivated' : 'suspended'}`, 'info');
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingUser) return;

    const updated = userList.map(u => u.name === editingUser.name ? editingUser : u);
    setUserList(updated);
    localStorage.setItem('digitasker_custom_users', JSON.stringify(updated));
    setEditingUser(null);
    showSuccess('User Profile Updated! 👤', 'User rating and verification status updated successfully.');
  };

  return (
    <AppLayout role="admin" title="Auditor & User Management">
      {/* Top Stat Cards */}
      <div className="statsGrid four">
        <Stat label="Total registered auditors" value={userList.length.toString()} icon={<UsersIcon size={20}/>} />
        <Stat label="Active auditors" value={userList.filter(u => u.status === 'Active').length.toString()} icon={<CheckCircle2 size={20}/>} />
        <Stat label="KYC verified" value={userList.filter(u => u.kyc === 'Verified' || u.kyc_status === 'Verified').length.toString()} icon={<ShieldCheck size={20}/>} />
        <Stat label="Suspended accounts" value={userList.filter(u => u.status === 'Suspended').length.toString()} icon={<AlertTriangle size={20}/>} />
      </div>

      {/* Toolbar */}
      <div className="advancedToolbar" style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
        <div className="searchBox" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0 14px' }}>
          <Search size={16} color="#64748b" />
          <input 
            type="text" 
            placeholder="Search auditor name, city, level..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            style={{ border: 0, padding: '10px 0', width: '100%', outline: 'none', background: 'transparent', fontSize: '13.5px' }}
          />
        </div>

        <select 
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '13.5px', outline: 'none', fontWeight: 600 }}
        >
          <option value="All">All User Statuses</option>
          <option value="Active">Active Only</option>
          <option value="Suspended">Suspended / Locked</option>
        </select>

        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '13.5px', outline: 'none', fontWeight: 600 }}
        >
          <option value="completed">Sort: Tasks Completed (High to Low)</option>
          <option value="rating">Sort: Auditor Rating (High to Low)</option>
          <option value="name">Sort: Name (A-Z)</option>
        </select>

        <Link 
          to="/admin/users/kyc"
          className="primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', background: '#0066ff', color: '#ffffff', textDecoration: 'none' }}
        >
          <ShieldCheck size={16} /> Open KYC Queue
        </Link>
      </div>

      {/* Main Table */}
      <Card style={{ padding: 0, overflow: 'hidden', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
          <SectionTitle title={`Registered Auditor Directory (${sortedUsers.length})`} />
        </div>
        
        <div className="dataTable" style={{ marginTop: 0 }}>
          <div className="dataHead" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 0.8fr 0.8fr 0.6fr 0.8fr 0.6fr 0.8fr 0.8fr', gap: '10px', padding: '10px 16px', background: '#f8fafc', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            <span>Name</span>
            <span>City</span>
            <span>Level</span>
            <span>Completed</span>
            <span>Rating</span>
            <span>Approval</span>
            <span>Risk</span>
            <span>Status</span>
            <span style={{ textAlign: 'right' }}>Actions</span>
          </div>

          {paginatedUsers.map((u, idx) => (
            <div className="dataRow" key={idx} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 0.8fr 0.8fr 0.6fr 0.8fr 0.6fr 0.8fr 0.8fr', gap: '10px', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #f1f5f9', fontSize: '13px' }}>
              <b style={{ color: '#0f172a' }}>{u.name}</b>
              <span style={{ color: '#334155' }}>{u.city}</span>
              <span style={{ color: '#0066ff', fontWeight: 700 }}>{u.level}</span>
              <span style={{ fontWeight: 600 }}>{u.completed} tasks</span>
              <span style={{ color: '#f59e0b', fontWeight: 700 }}>⭐ {u.rating}</span>
              <span style={{ color: '#059669', fontWeight: 700 }}>{u.approval}</span>
              <div>
                <Badge tone={u.risk === 'Low' ? 'green' : 'orange'}>{u.risk}</Badge>
              </div>
              <div>
                <Badge tone={u.status === 'Active' ? 'green' : 'red'}>{u.status}</Badge>
              </div>
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => setEditingUser(u)}
                  title="Edit Auditor Details"
                  style={{ padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer', color: '#475569' }}
                >
                  <Edit3 size={13} />
                </button>
                <button 
                  onClick={() => handleToggleLock(u)}
                  title={u.status === 'Suspended' ? 'Unlock Account' : 'Suspend Account'}
                  style={{ padding: '6px', borderRadius: '6px', border: `1px solid ${u.status === 'Suspended' ? '#bbf7d0' : '#fecdd3'}`, background: u.status === 'Suspended' ? '#f0fdf4' : '#fff1f2', cursor: 'pointer', color: u.status === 'Suspended' ? '#166534' : '#e11d48' }}
                >
                  {u.status === 'Suspended' ? <Unlock size={13} /> : <Lock size={13} />}
                </button>
              </div>
            </div>
          ))}

          {paginatedUsers.length === 0 && (
            <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
              No auditors found matching your search.
            </div>
          )}
        </div>

        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={sortedUsers.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </Card>

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(3px)', zIndex: 1000, display: 'flex', placeItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>Edit Auditor Profile: {editingUser.name}</h3>
              <X size={18} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setEditingUser(null)} />
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Auditor Name</label>
                <input 
                  type="text" 
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Auditor Level</label>
                  <select 
                    value={editingUser.level}
                    onChange={(e) => setEditingUser({ ...editingUser, level: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#fff' }}
                  >
                    <option value="Level 1">Level 1 Auditor</option>
                    <option value="Level 2">Level 2 Senior Auditor</option>
                    <option value="Level 3">Level 3 Master Auditor</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Risk Assessment</label>
                  <select 
                    value={editingUser.risk}
                    onChange={(e) => setEditingUser({ ...editingUser, risk: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#fff' }}
                  >
                    <option value="Low">Low Risk</option>
                    <option value="Medium">Medium Risk</option>
                    <option value="High">High Risk</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button 
                  type="button"
                  onClick={() => setEditingUser(null)}
                  style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  style={{ padding: '10px 20px', borderRadius: '8px', border: 0, background: '#0066ff', color: '#ffffff', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
