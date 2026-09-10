import React, { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import { Stat, Card, SectionTitle } from '../components/ui';
import { Users, Briefcase, CheckSquare, Landmark } from 'lucide-react';
import { campaigns as initialCampaigns, submissions as initialSubmissions } from '../data/dummy';
import api from '../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users_count: 0,
    active_campaigns: 0,
    tasks_completed: 0,
    total_payout: '₹0'
  });
  const [campaignList, setCampaignList] = useState([]);
  const [submissionList, setSubmissionList] = useState([]);

  useEffect(() => {
    const userSubs = JSON.parse(localStorage.getItem('digitasker_user_submissions') || '[]');
    const localMapped = userSubs.map(s => ({
      id: s.submissionCode || `SUB-${s.id}`,
      task: s.title || 'Audit Task',
      user: s.user || 'User Account (Auditor)',
      city: s.city || 'Chandigarh',
      status: s.status || 'Under Review'
    }));

    const defaultSamples = [
      { id: 'SUB-4178', task: 'Digilites Studio · Google Rating & Review', user: 'User Account (Auditor)', city: 'Chandigarh, NCR', status: 'Under Review' },
      { id: 'SUB-2455', task: 'Mumbai Premium Mall Staff Courtesy Audit', user: 'Rahul Mehta', city: 'Mumbai Metro', status: 'Pending QC' }
    ];

    api.admin.getDashboard()
      .then(res => {
        if (res.metrics) {
          setStats({
            users_count: res.metrics.total_users || 0,
            active_campaigns: res.metrics.active_campaigns || 0,
            tasks_completed: 1840,
            total_payout: res.metrics.payout_ready_amount ? `₹${res.metrics.payout_ready_amount.toLocaleString()}` : '₹4,850'
          });
        } else if (res.stats) {
          setStats(res.stats);
        }
        if (res.campaigns && res.campaigns.length > 0) {
          setCampaignList(res.campaigns.map(c => ({
            name: c.title,
            client: c.client?.name || 'Corporate Client',
            completed: c.completed_tasks || 0,
            tasks: c.target_tasks || 0,
            status: c.status
          })));
        }
        let apiMapped = [];
        if (res.submissions && res.submissions.length > 0) {
          apiMapped = res.submissions.map(s => ({
            id: s.submission_code || `SUB-${s.id}`,
            task: s.task?.title || 'Audit Task',
            user: s.user?.name || 'Auditor',
            city: s.vendor?.coverage_area || 'Location',
            status: s.qc_status || s.first_decision
          }));
        }

        const combined = [...localMapped];
        apiMapped.forEach(a => { if (!combined.some(c => c.id === a.id)) combined.push(a); });
        defaultSamples.forEach(d => { if (!combined.some(c => c.id === d.id)) combined.push(d); });
        setSubmissionList(combined);
      })
      .catch(() => {
        const combined = [...localMapped];
        defaultSamples.forEach(d => { if (!combined.some(c => c.id === d.id)) combined.push(d); });
        setSubmissionList(combined);
      });
  }, []);

  return (
    <AppLayout role='admin' title='Admin Dashboard'>
      <div className='statsGrid'>
        <Stat label='Registered Users' value={stats.users_count.toLocaleString()} icon={<Users/>} />
        <Stat label='Active Campaigns' value={stats.active_campaigns.toString()} icon={<Briefcase/>} />
        <Stat label='Tasks Completed' value={stats.tasks_completed.toLocaleString()} icon={<CheckSquare/>} />
        <Stat label='Total Payout' value={stats.total_payout} icon={<Landmark/>} />
      </div>
      <div className='twoCol'>
        <Card>
          <SectionTitle title='Task Completion · Last 30 Days'/>
          <div className='chartMock'>{[35,48,44,62,58,74,83,96,92,105,118,132].map((h,i)=><span style={{height:h}} key={i}></span>)}</div>
        </Card>
        <Card>
          <SectionTitle title='Tasks by Category'/>
          <div className='donut'>{stats.tasks_completed.toLocaleString()}<span>Total Tasks</span></div>
        </Card>
      </div>
      <div className='twoCol'>
        <Card>
          <SectionTitle title='Active Campaigns'/>
          {campaignList.map((c, i) => (
            <div className='adminRow' key={i}>
              <div><b>{c.name}</b><span>{c.client}</span></div>
              <b>{c.completed}/{c.tasks}</b>
              <span>{c.status}</span>
            </div>
          ))}
        </Card>
        <Card>
          <SectionTitle title='Recent Submissions'/>
          {submissionList.map((s, i) => (
            <div className='adminRow' key={i}>
              <div><b>{s.id} · {s.task}</b><span>{s.user} · {s.city}</span></div>
              <span>{s.status}</span>
            </div>
          ))}
        </Card>
      </div>
    </AppLayout>
  );
}
