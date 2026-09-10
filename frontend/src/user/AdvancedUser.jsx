import React, { useState } from 'react';
import { 
  BookOpen, Camera, CheckCircle2, CloudOff, Download, GraduationCap, MapPin, 
  Navigation, RefreshCw, ShieldCheck, Smartphone, WifiOff 
} from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import { Badge, Card, SectionTitle, Stat } from '../components/ui';
import { showSuccess, showToast, showRichModal } from '../utils/swal';

const Page = ({ title, children }) => <AppLayout role="user" title={title}>{children}</AppLayout>;

export function UserTraining() {
  const [certs, setCerts] = useState(() => {
    const cached = localStorage.getItem('digitasker_custom_certifications');
    return cached ? JSON.parse(cached) : [];
  });

  return (
    <Page title="Training & Certifications">
      <div className="statsGrid four">
        <Stat label="Certifications" value={certs.filter(c => c.status === 'Active' || c.status === 'Certified').length.toString()} icon={<GraduationCap size={20}/>}/>
        <Stat label="Courses enrolled" value={certs.length.toString()} icon={<BookOpen size={20}/>}/>
        <Stat label="Average quiz score" value={certs.length > 0 ? "88%" : "0%"} icon={<CheckCircle2 size={20}/>}/>
        <Stat label="Premium tasks unlocked" value={certs.length > 0 ? certs.length.toString() : "0"} icon={<ShieldCheck size={20}/>}/>
      </div>

      <div className="certGrid">
        {certs.length === 0 ? (
          <Card style={{ padding: '30px', textAlign: 'center', color: '#64748b', gridColumn: '1 / -1' }}>
            <GraduationCap size={28} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>No training courses enrolled.</p>
            <small style={{ fontSize: '11px', color: '#94a3b8' }}>Certifications will appear here once published by admin or assigned.</small>
          </Card>
        ) : (
          certs.map(c => (
            <Card key={c.id} className="certCard">
              <div className="certTop">
                <div className="certIcon"><GraduationCap size={20}/></div>
                <Badge tone={c.status === 'Active' ? 'green' : 'orange'}>{c.status}</Badge>
              </div>
              <h3>{c.name}</h3>
              <p>{c.lessons} lessons · {c.quiz} · pass {c.pass}</p>
              <div className="progress"><i style={{ width: `${Math.min((c.certified || 1) * 20, 100)}%` }}/></div>
              <button className="ghost full" onClick={() => showRichModal(
                `📜 Certificate of Completion`,
                `<div style="text-align:center;padding:20px;border:4px double #0066ff;border-radius:12px;background:#f8fafc">
                  <h2 style="color:#0066ff;margin:0 0 4px">DigiLites Studio</h2>
                  <p style="font-size:11px;letter-spacing:1px;color:#64748b">CERTIFICATE OF ACCOMPLISHMENT</p>
                  <p style="margin:16px 0 4px;font-size:13px">This certifies that the user has completed</p>
                  <h3 style="font-size:18px;color:#0f172a;margin:0 0 8px">${c.name}</h3>
                  <p style="font-size:12px;color:#475569">${c.lessons} Lessons Completed · Quiz Score: Pass (${c.pass})</p>
                  <p style="font-size:11px;color:#94a3b8;margin-top:12px">Issued: ${new Date().toLocaleDateString()} · Certificate ID: DGS-CERT-${c.id}</p>
                </div>`
              )}>
                <Download size={15}/> Download Certificate
              </button>
            </Card>
          ))
        )}
      </div>
    </Page>
  );
}

export function OfflineMode() {
  const [offlineTasks, setOfflineTasks] = useState(() => {
    const cached = localStorage.getItem('digitasker_custom_offline_tasks');
    return cached ? JSON.parse(cached) : [];
  });

  const handleSync = () => {
    showSuccess('Sync Complete! 🔄', 'All offline draft submissions and cached photo evidence uploaded cleanly.');
  };

  return (
    <Page title="Offline & Field Mode">
      <div className="statsGrid four">
        <Stat label="Downloaded assignments" value={offlineTasks.length.toString()} icon={<CloudOff size={20}/>}/>
        <Stat label="Pending sync" value={offlineTasks.filter(t => t.pendingSync || t.status === 'Needs update').length.toString()} icon={<RefreshCw size={20}/>}/>
        <Stat label="Offline storage" value={offlineTasks.length > 0 ? `${offlineTasks.length * 15} MB` : "0 MB"} icon={<Smartphone size={20}/>}/>
        <Stat label="Last sync" value={offlineTasks.length > 0 ? "Just now" : "Never"} icon={<CheckCircle2 size={20}/>}/>
      </div>

      <div className="twoColAdvanced">
        <Card>
          <SectionTitle title="Downloaded field assignments"/>
          {offlineTasks.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
              <CloudOff size={28} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>No offline assignments downloaded.</p>
              <small style={{ fontSize: '11px', color: '#94a3b8' }}>Download tasks from "Find Tasks" to execute assignments without internet connectivity.</small>
            </div>
          ) : (
            offlineTasks.map(x => (
              <div className="offlineTask" key={x.id || x[0]}>
                <div className="offlineIcon"><WifiOff size={18}/></div>
                <div className="grow">
                  <b>{x.title || x[1]}</b>
                  <span>{x.id || x[0]} · {x.time || x[2]}</span>
                </div>
                <Badge tone={(x.status || x[3]) === 'Ready offline' ? 'green' : 'orange'}>{x.status || x[3]}</Badge>
              </div>
            ))
          )}
        </Card>

        <Card>
          <SectionTitle title="Field capture policy"/>
          {[
            [Camera, 'Native camera only', 'Gallery upload disabled for this campaign'],
            [MapPin, 'GPS check-in required', 'Must be within 200m of store'],
            [Navigation, 'Visit duration', 'Minimum 12 minutes between check-in/out'],
            [RefreshCw, 'Automatic sync', 'Uploads resume when network becomes stable']
          ].map(([Icon, title, desc]) => (
            <div className="serviceRow" key={title}>
              <Icon size={18}/>
              <div className="grow">
                <b>{title}</b>
                <span>{desc}</span>
              </div>
              <CheckCircle2 size={17}/>
            </div>
          ))}
          <button className="primary full" onClick={handleSync} style={{ marginTop: '16px' }}>Sync now</button>
        </Card>
      </div>
    </Page>
  );
}
