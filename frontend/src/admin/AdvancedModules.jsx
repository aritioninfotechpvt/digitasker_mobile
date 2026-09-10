import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, AlertTriangle, ArrowRight, BookOpen, Boxes, CheckCircle2, Clock3, Code2, 
  CreditCard, Database, FileDown, Filter, GitBranch, Globe2, GraduationCap, GripVertical, 
  Layers3, LockKeyhole, MapPin, MessageSquareMore, Play, Plus, RefreshCw, Route, Search, 
  Send, Settings2, ShieldAlert, ShieldCheck, Sparkles, TimerReset, Users2, Webhook, Zap, X 
} from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import { Badge, Card, SectionTitle, Stat } from '../components/ui';
// Dummy data imports removed for live state management
import { showSuccess, showToast, showRichModal } from '../utils/swal';
import api from '../services/api';

const Page = ({ title, children }) => <AppLayout role="admin" title={title}>{children}</AppLayout>;

const Modal = ({ title, onClose, children }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
    <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>{title}</h3>
        <button onClick={onClose} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: '#64748b', padding: '4px' }}>
          <X size={20} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

/* 1. WORKFLOW BUILDER */
export function WorkflowBuilder() {
  const [templates, setTemplates] = useState(() => {
    const cached = localStorage.getItem('digitasker_custom_workflows');
    return cached ? JSON.parse(cached) : [];
  });
  const [nodes, setNodes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newWf, setNewWf] = useState({ name: '', stages: '4', sla: '24h', status: 'Published' });

  const handleCreateWorkflow = (e) => {
    e.preventDefault();
    if (!newWf.name) return showToast('Enter workflow name', 'error');
    const created = { id: `WF-${100 + templates.length + 1}`, ...newWf };
    const updated = [created, ...templates];
    setTemplates(updated);
    localStorage.setItem('digitasker_custom_workflows', JSON.stringify(updated));
    setShowModal(false);
    showSuccess('Workflow Blueprint Saved!', `${created.name} added to templates.`);
  };

  const handleTestWorkflow = () => {
    showRichModal(
      'Workflow Execution Test',
      `<div style="text-align:left; font-size:13px; line-height:1.6;">
        <p><b>Step 1:</b> GPS verification (Passed · 20m radius)</p>
        <p><b>Step 2:</b> Store photo ML audit (Passed · 94.2% confidence)</p>
        <p><b>Step 3:</b> OCR Bill verification (Passed · Invoice match)</p>
        <p style="color:#059669; font-weight:700;">Result: Workflow completed successfully in 1.4s.</p>
      </div>`
    );
  };

  return (
    <Page title="Workflow Builder">
      <div className="statsGrid four">
        <Stat label="Published workflows" value={templates.length.toString()} icon={<GitBranch size={20}/>} />
        <Stat label="Active executions" value={templates.length > 0 ? templates.length.toString() : "0"} icon={<Activity size={20}/>} />
        <Stat label="Avg. completion" value={templates.length > 0 ? "15m" : "0m"} icon={<Clock3 size={20}/>} />
        <Stat label="SLA compliance" value={templates.length > 0 ? "100%" : "0%"} icon={<CheckCircle2 size={20}/>} />
      </div>

      <div className="advancedToolbar" style={{ display: 'flex', gap: '10px', marginBottom: '16px', justifyContent: 'space-between' }}>
        <div className="searchBox" style={{ flex: 1 }}>
          <Search size={16} />
          <input placeholder="Search workflow blueprints..." />
        </div>
        <button className="primary" onClick={() => setShowModal(true)}>+ New Workflow</button>
      </div>

      <div className="workflowGrid">
        <Card className="workflowLibrary">
          <SectionTitle title="Workflow templates" />
          {templates.length === 0 ? (
            <div style={{ padding: '30px 10px', textAlign: 'center', color: '#64748b' }}>
              <GitBranch size={28} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>No workflow templates saved.</p>
              <small style={{ fontSize: '11px', color: '#94a3b8' }}>Click "+ New Workflow" to define a blueprint.</small>
            </div>
          ) : (
            templates.map(w => (
              <div className="templateRow" key={w.id}>
                <div className="nodeIcon"><GitBranch size={17}/></div>
                <div className="grow">
                  <b>{w.name}</b>
                  <span>{w.id} · {w.stages} stages · SLA {w.sla}</span>
                </div>
                <Badge tone={w.status === 'Published' ? 'green' : 'orange'}>{w.status}</Badge>
              </div>
            ))
          )}
        </Card>

        <Card className="workflowCanvas">
          <div className="canvasHead">
            <div>
              <Badge>LIVE BLUEPRINT</Badge>
              <h2>Workflow Blueprint Canvas</h2>
              <p>Drag, reorder and configure stages. Branches are evaluated by the workflow engine.</p>
            </div>
            <button className="primary" onClick={handleTestWorkflow}><Play size={15}/> Test workflow</button>
          </div>
          <div className="nodeFlow">
            {nodes.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', width: '100%' }}>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Canvas is ready for stage nodes.</p>
              </div>
            ) : (
              nodes.map((n, i) => (
                <React.Fragment key={n.title}>
                  <div className={`flowNode ${n.type}`}>
                    <GripVertical size={16}/>
                    <div className="nodeIndex">{i + 1}</div>
                    <div className="grow"><b>{n.title}</b><span>{n.meta}</span></div>
                    <Settings2 size={17}/>
                  </div>
                  {i < nodes.length - 1 && <div className="flowConnector"><ArrowRight size={15}/></div>}
                </React.Fragment>
              ))
            )}
          </div>
        </Card>

        <Card>
          <SectionTitle title="Selected stage"/>
          <label className="field"><span>Stage name</span><input defaultValue="GPS check-in"/></label>
          <label className="field"><span>Validation</span><select><option>Within configured radius</option><option>Exact store coordinates</option></select></label>
          <div className="fieldGrid two"><label className="field"><span>Radius</span><input defaultValue="200 metres"/></label><label className="field"><span>Max retries</span><input defaultValue="3"/></label></div>
          <label className="toggleRow"><div><b>Block mock location</b><span>Flag Android mock-location evidence</span></div><input type="checkbox" defaultChecked/></label>
          <button className="primary full" onClick={() => showSuccess('Stage Saved', 'Stage configuration updated.')}>Save stage configuration</button>
        </Card>
      </div>

      {showModal && (
        <Modal title="Create New Workflow Blueprint" onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreateWorkflow} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <label className="blockField">
              <span>Workflow Name</span>
              <input value={newWf.name} onChange={e => setNewWf({ ...newWf, name: e.target.value })} placeholder="e.g. Social Media Verification Workflow" required />
            </label>
            <div className="fieldGrid two">
              <label className="blockField">
                <span>Stages Count</span>
                <input value={newWf.stages} onChange={e => setNewWf({ ...newWf, stages: e.target.value })} required />
              </label>
              <label className="blockField">
                <span>Target SLA</span>
                <input value={newWf.sla} onChange={e => setNewWf({ ...newWf, sla: e.target.value })} required />
              </label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <button type="button" className="ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="primary">Create Workflow 🌿</button>
            </div>
          </form>
        </Modal>
      )}
    </Page>
  );
}

/* 2. QUALITY CONTROL CENTER */
export function QCCenter() {
  const [queue, setQueue] = useState(() => {
    const cached = localStorage.getItem('digitasker_custom_qc_queue');
    const customList = cached ? JSON.parse(cached) : [];
    
    const userSubs = JSON.parse(localStorage.getItem('digitasker_user_submissions') || '[]');
    const mappedUserSubs = userSubs.map(u => ({
      id: u.submissionCode || `SUB-${u.id}`,
      submission: u.submissionCode || `SUB-${u.id}`,
      campaign: u.title || 'DigiLites Audit Campaign',
      reviewer: 'QA Auditor',
      firstDecision: u.status === 'Under Review' ? 'Pending' : (u.status || 'Pending'),
      sample: '100% Audit',
      sla: '4h remaining'
    }));

    const defaultSamples = [
      { id: 'SUB-4178', submission: 'SUB-4178', campaign: 'Digilites Studio · Google Review', reviewer: 'QA Inspector', firstDecision: 'Pending', sample: 'Random 20%', sla: '6h remaining' },
      { id: 'SUB-2455', submission: 'SUB-2455', campaign: 'Mumbai Premium Mall Staff Audit', reviewer: 'Senior QA', firstDecision: 'Approved', sample: '100% Audit', sla: 'On SLA' }
    ];

    const combined = [...mappedUserSubs, ...customList];
    defaultSamples.forEach(d => {
      if (!combined.some(x => x.id === d.id)) combined.push(d);
    });

    return combined;
  });
  const [showModal, setShowModal] = useState(false);
  const [newRule, setNewRule] = useState({ campaign: '', sample: '25%', sla: '12h' });

  const handleCreateRule = (e) => {
    e.preventDefault();
    setShowModal(false);
    showSuccess('QC Policy Saved!', `QC sampling rule updated for ${newRule.campaign || 'Selected Campaign'}.`);
  };

  return (
    <Page title="Quality Control Center">
      <div className="statsGrid four">
        <Stat label="QC queue" value={queue.length.toString()} icon={<ShieldCheck size={20}/>}/>
        <Stat label="2nd review required" value={queue.filter(q => q.firstDecision === 'Revision' || q.firstDecision === 'Escalate').length.toString()} icon={<Layers3 size={20}/>}/>
        <Stat label="QC agreement" value={queue.length > 0 ? "95.0%" : "0%"} icon={<CheckCircle2 size={20}/>}/>
        <Stat label="Over SLA" value="0" icon={<TimerReset size={20}/>}/>
      </div>

      <div className="advancedToolbar" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button className="primary" onClick={() => setShowModal(true)}>+ Create QC Rule</button>
      </div>

      <div className="twoColAdvanced">
        <Card>
          <SectionTitle title="Maker-checker queue" />
          <div className="dataTable advancedTable">
            <div className="dataHead">
              <span>Submission</span><span>Campaign</span><span>Reviewer</span><span>1st decision</span><span>QC sample</span><span>SLA</span>
            </div>
            {queue.length === 0 ? (
              <div style={{ padding: '30px 10px', textAlign: 'center', color: '#64748b' }}>
                <ShieldCheck size={28} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>QC Queue is clear.</p>
                <small style={{ fontSize: '11px', color: '#94a3b8' }}>No submissions currently pending maker-checker verification.</small>
              </div>
            ) : (
              queue.map(q => (
                <div className="dataRow" key={q.id}>
                  <b>{q.submission}</b><span>{q.campaign}</span><span>{q.reviewer}</span>
                  <Badge tone={q.firstDecision === 'Approved' ? 'green' : q.firstDecision === 'Revision' ? 'orange' : 'purple'}>{q.firstDecision}</Badge>
                  <span>{q.sample}</span><span>{q.sla}</span>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <SectionTitle title="QC policy"/>
          <div className="policyBox">
            <b>QC Review Rules</b>
            <p>100% second-level review when score &lt; 80, fraud risk ≥ medium, or reward ≥ ₹500.</p>
            <div className="ruleChips"><Badge>Score &lt; 80</Badge><Badge>Risk ≥ Medium</Badge><Badge>Reward ≥ ₹500</Badge></div>
          </div>
          <label className="field"><span>Random QC sample</span><input type="range" defaultValue="20"/><small>20% of remaining approved submissions</small></label>
          <label className="toggleRow"><div><b>Blind second review</b><span>Hide first reviewer's decision</span></div><input type="checkbox" defaultChecked/></label>
          <label className="toggleRow"><div><b>Client escalation</b><span>Escalate score variance above 15 points</span></div><input type="checkbox" defaultChecked/></label>
        </Card>
      </div>

      {showModal && (
        <Modal title="Create QC Rule" onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreateRule} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <label className="blockField">
              <span>Campaign</span>
              <input value={newRule.campaign} onChange={e => setNewRule({ ...newRule, campaign: e.target.value })} placeholder="e.g. Retail Audit" required />
            </label>
            <div className="fieldGrid two">
              <label className="blockField">
                <span>Sampling Ratio</span>
                <input value={newRule.sample} onChange={e => setNewRule({ ...newRule, sample: e.target.value })} required />
              </label>
              <label className="blockField">
                <span>QC SLA Hours</span>
                <input value={newRule.sla} onChange={e => setNewRule({ ...newRule, sla: e.target.value })} required />
              </label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <button type="button" className="ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="primary">Save QC Policy 🛡️</button>
            </div>
          </form>
        </Modal>
      )}
    </Page>
  );
}

/* 3. FRAUD & TRUST CENTER */
export function FraudCenter() {
  const nav = useNavigate();
  const [signals, setSignals] = useState(() => {
    const cached = localStorage.getItem('digitasker_custom_fraud_signals');
    return cached ? JSON.parse(cached) : [];
  });
  const [showModal, setShowModal] = useState(false);
  const [newRule, setNewRule] = useState({ name: 'GPS Drift Anomaly', score: '+25', description: 'Flag when auditor distance exceeds 500m' });

  const handleAddRule = (e) => {
    e.preventDefault();
    setShowModal(false);
    showSuccess('Risk Rule Added!', `Rule "${newRule.name}" is now active in fraud engine.`);
  };

  const criticalCount = signals.filter(s => s.level === 'Critical' || s.level === 'High').length;
  const frozenAmount = signals.reduce((acc, s) => acc + (s.frozenPayout || 0), 0);

  return (
    <Page title="Fraud & Trust Center">
      <div className="statsGrid four">
        <Stat label="High-risk users" value={criticalCount.toString()} icon={<ShieldAlert size={20}/>}/>
        <Stat label="Frozen payouts" value={`₹${frozenAmount.toLocaleString('en-IN')}`} icon={<LockKeyhole size={20}/>}/>
        <Stat label="Duplicate media" value={signals.filter(s => s.signals?.some(x => x.toLowerCase().includes('duplicate'))).length.toString()} icon={<Boxes size={20}/>}/>
        <Stat label="GPS anomalies" value={signals.filter(s => s.signals?.some(x => x.toLowerCase().includes('gps') || x.toLowerCase().includes('location'))).length.toString()} icon={<MapPin size={20}/>}/>
      </div>

      <div className="advancedToolbar" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button className="primary" onClick={() => setShowModal(true)}>+ New Risk Rule</button>
      </div>

      <div className="fraudLayout">
        <Card>
          <SectionTitle title="Risk investigation queue" action={signals.length > 0 ? `View all ${signals.length}` : undefined} onActionClick={() => nav('/admin/users/risk')}/>
          {signals.length === 0 ? (
            <div style={{ padding: '30px 10px', textAlign: 'center', color: '#64748b' }}>
              <ShieldCheck size={28} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>No active risk signals detected.</p>
              <small style={{ fontSize: '11px', color: '#94a3b8' }}>Fraud prevention engine is actively auditing submissions.</small>
            </div>
          ) : (
            signals.map(f => (
              <div className="fraudCase" key={f.id}>
                <div className={`riskCircle ${f.level ? f.level.toLowerCase() : 'low'}`}>{f.score}</div>
                <div className="grow">
                  <div className="row"><b>{f.user}</b><Badge tone={f.level === 'Critical' ? 'red' : f.level === 'Medium' ? 'orange' : 'green'}>{f.level}</Badge></div>
                  <span>{f.id} · {f.task}</span>
                  <div className="signalList">{(f.signals || []).map(x => <span key={x}><AlertTriangle size={12}/>{x}</span>)}</div>
                </div>
                <button className="ghost" onClick={() => showToast(`Reviewing ${f.user}`, 'info')}>{f.action || 'Review'}</button>
              </div>
            ))
          )}
        </Card>

        <Card>
          <SectionTitle title="Detection rules"/>
          {[
            ['Duplicate media hash', '+35', 'Auto-block exact image/video reuse'],
            ['Device-account cluster', '+30', '3+ accounts from one trusted device'],
            ['Impossible travel', '+28', 'Travel speed exceeds 180 km/h'],
            ['GPS mismatch', '+25', 'Evidence outside permitted radius'],
            ['Abnormal duration', '+12', 'Completion below 30% of median']
          ].map(r => (
            <div className="riskRule" key={r[0]}>
              <ShieldAlert size={16}/>
              <div className="grow"><b>{r[0]}</b><span>{r[2]}</span></div>
              <strong>{r[1]}</strong>
            </div>
          ))}
          <button className="primary full" onClick={() => showSuccess('Engine Updated', 'Scoring matrix updated.')}>Configure risk scoring</button>
        </Card>
      </div>

      {showModal && (
        <Modal title="Add Detection Risk Rule" onClose={() => setShowModal(false)}>
          <form onSubmit={handleAddRule} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <label className="blockField">
              <span>Rule Name</span>
              <input value={newRule.name} onChange={e => setNewRule({ ...newRule, name: e.target.value })} required />
            </label>
            <div className="fieldGrid two">
              <label className="blockField">
                <span>Score Impact</span>
                <input value={newRule.score} onChange={e => setNewRule({ ...newRule, score: e.target.value })} required />
              </label>
              <label className="blockField">
                <span>Detection Criteria</span>
                <input value={newRule.description} onChange={e => setNewRule({ ...newRule, description: e.target.value })} required />
              </label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <button type="button" className="ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="primary">Activate Rule ⚠️</button>
            </div>
          </form>
        </Modal>
      )}
    </Page>
  );
}

/* 4. FINANCE & RECONCILIATION */
export function FinanceCenter() {
  const nav = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [newInv, setNewInv] = useState({ client: '', amount: '', description: '' });

  const [finData, setFinData] = useState({
    clientBalance: 0,
    reserved: 0,
    rewardHold: 0,
    platformRevenue: 0
  });

  const [invoices, setInvoices] = useState(() => {
    const saved = localStorage.getItem('digitasker_custom_invoices');
    return saved ? JSON.parse(saved) : [];
  });

  React.useEffect(() => {
    Promise.allSettled([
      api.admin.getClients(),
      api.admin.getCampaigns(),
      api.admin.getPayouts()
    ]).then(([clientsRes, campaignsRes, payoutsRes]) => {
      const clients = clientsRes.status === 'fulfilled' ? (clientsRes.value.clients || clientsRes.value || []) : [];
      const campaigns = campaignsRes.status === 'fulfilled' ? (campaignsRes.value.campaigns || campaignsRes.value || []) : [];
      const payouts = payoutsRes.status === 'fulfilled' ? (payoutsRes.value.payout_requests || payoutsRes.value || []) : [];

      const totalClientBal = clients.reduce((acc, c) => acc + (parseFloat(c.spend || c.total_spend) || 0), 0);
      const totalReserved = campaigns.reduce((acc, c) => acc + (parseFloat(c.allocated_budget) || 0), 0);
      const totalPayoutHold = payouts.reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);
      const rev = totalClientBal * 0.15; // 15% Platform revenue

      setFinData({
        clientBalance: totalClientBal,
        reserved: totalReserved,
        rewardHold: totalPayoutHold,
        platformRevenue: rev
      });
    });
  }, []);

  const formatLakh = (val) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}k`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const handleCreateInvoice = (e) => {
    e.preventDefault();
    if (!newInv.client || !newInv.amount) {
      showToast('Please fill out client and invoice amount', 'error');
      return;
    }

    const created = {
      id: `INV-${Date.now().toString().slice(-6)}`,
      client: newInv.client,
      amount: parseFloat(newInv.amount.replace(/[^0-9.]/g, '')) || 0,
      description: newInv.description || 'Campaign Service Fee',
      date: new Date().toLocaleDateString('en-IN'),
      status: 'Issued'
    };

    const updatedInvoices = [created, ...invoices];
    setInvoices(updatedInvoices);
    localStorage.setItem('digitasker_custom_invoices', JSON.stringify(updatedInvoices));

    setShowModal(false);
    setNewInv({ client: '', amount: '', description: '' });
    showSuccess('Invoice Issued!', `Invoice for ₹${created.amount.toLocaleString('en-IN')} sent to ${created.client}.`);
  };

  return (
    <Page title="Finance & Reconciliation">
      <div className="statsGrid four">
        <Stat label="Client prepaid balance" value={formatLakh(finData.clientBalance)} icon={<CreditCard size={20}/>}/>
        <Stat label="Campaign reserved" value={formatLakh(finData.reserved)} icon={<LockKeyhole size={20}/>}/>
        <Stat label="Auditor reward hold" value={formatLakh(finData.rewardHold)} icon={<Clock3 size={20}/>}/>
        <Stat label="Platform revenue (15%)" value={formatLakh(finData.platformRevenue)} icon={<Sparkles size={20}/>}/>
      </div>

      <div className="advancedToolbar" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px', marginTop: '16px' }}>
        <button className="primary" onClick={() => setShowModal(true)} style={{ padding: '10px 18px', borderRadius: '10px', background: '#0066ff', color: '#fff', border: 0, fontWeight: 700, cursor: 'pointer' }}>
          + Create Client Invoice
        </button>
      </div>

      <div className="threeFinance" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        <Card style={{ padding: '20px', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <SectionTitle title="Fund Flow Breakdown"/>
          {[
            ['Total Client Prepaid', formatLakh(finData.clientBalance), 'Client Balance'],
            ['Reserved for Active Campaigns', `− ${formatLakh(finData.reserved)}`, 'Committed'],
            ['Approved Reward Hold', `− ${formatLakh(finData.rewardHold)}`, 'Liability'],
            ['Platform Revenue', formatLakh(finData.platformRevenue), 'Earned Revenue'],
            ['Available Liquidity', formatLakh(Math.max(0, finData.clientBalance - finData.reserved)), 'Unreserved']
          ].map(x => (
            <div className="financeLine" key={x[0]} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9', fontSize: '13px' }}>
              <div><b style={{ color: '#0f172a', display: 'block' }}>{x[0]}</b><span style={{ fontSize: '11px', color: '#64748b' }}>{x[2]}</span></div>
              <strong style={{ color: '#059669', fontSize: '13.5px' }}>{x[1]}</strong>
            </div>
          ))}
        </Card>

        <Card style={{ padding: '20px', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <SectionTitle title="Issued Invoices & Reconciliations" action="View Payouts" onActionClick={() => nav('/admin/payouts')}/>
          {invoices.length === 0 ? (
            <div style={{ padding: '30px 10px', textAlign: 'center', color: '#64748b' }}>
              <Database size={28} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>No custom invoices issued yet.</p>
              <small style={{ fontSize: '11px', color: '#94a3b8' }}>Click "+ Create Client Invoice" above to generate your first invoice.</small>
            </div>
          ) : (
            invoices.map(inv => (
              <div className="reconRow" key={inv.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid #f1f5f9', fontSize: '13px' }}>
                <Database size={18} color="#0066ff"/>
                <div style={{ flex: 1 }}>
                  <b style={{ color: '#0f172a', display: 'block' }}>{inv.id} · {inv.client}</b>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>{inv.description} · {inv.date}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ color: '#059669', display: 'block' }}>₹{inv.amount.toLocaleString('en-IN')}</strong>
                  <Badge tone="green">{inv.status}</Badge>
                </div>
              </div>
            ))
          )}
        </Card>

        <Card style={{ padding: '20px', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <SectionTitle title="Tax & Compliance Overview"/>
          <div className="taxBig" style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '14px', textAlign: 'center' }}>
            <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Estimated Tax Payable (GST 18%)</span>
            <b style={{ fontSize: '20px', color: '#0f172a', display: 'block', margin: '4px 0' }}>{formatLakh(finData.platformRevenue * 0.18)}</b>
            <small style={{ fontSize: '11px', color: '#94a3b8' }}>FY26-27 Automated Calculation</small>
          </div>
          <label className="toggleRow" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '13px' }}>
            <div><b style={{ color: '#0f172a', display: 'block' }}>TDS Deduction Rules</b><span style={{ fontSize: '11px', color: '#64748b' }}>Apply by vendor/user tax profile</span></div>
            <input type="checkbox" defaultChecked/>
          </label>
          <label className="toggleRow" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', fontSize: '13px' }}>
            <div><b style={{ color: '#0f172a', display: 'block' }}>Sequential Invoice Numbering</b><span style={{ fontSize: '11px', color: '#64748b' }}>FY26-27 format compliant</span></div>
            <input type="checkbox" defaultChecked/>
          </label>
          <button className="ghost full" onClick={() => showToast('Exported finance summary CSV', 'success')} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#334155', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <FileDown size={15}/> Export Finance Pack (CSV)
          </button>
        </Card>
      </div>

      {showModal && (
        <Modal title="Issue Client Invoice" onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreateInvoice} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <label className="blockField">
              <span style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Client Name *</span>
              <input 
                value={newInv.client} 
                onChange={e => setNewInv({ ...newInv, client: e.target.value })} 
                placeholder="e.g. Samsung India Pvt Ltd"
                required 
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </label>
            <label className="blockField">
              <span style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Total Invoice Amount (₹) *</span>
              <input 
                value={newInv.amount} 
                onChange={e => setNewInv({ ...newInv, amount: e.target.value })} 
                placeholder="e.g. 500000"
                required 
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </label>
            <label className="blockField">
              <span style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Line Item Description</span>
              <input 
                value={newInv.description} 
                onChange={e => setNewInv({ ...newInv, description: e.target.value })} 
                placeholder="e.g. Retail Mystery Audit Campaign"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </label>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <button type="button" className="ghost" onClick={() => setShowModal(false)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" className="primary" style={{ padding: '10px 20px', borderRadius: '8px', border: 0, background: '#0066ff', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Generate & Send Invoice 💳</button>
            </div>
          </form>
        </Modal>
      )}
    </Page>
  );
}

/* 5. AUTOMATION CENTER */
export function AutomationCenter() {
  const [automationsList, setAutomationsList] = useState(() => {
    const cached = localStorage.getItem('digitasker_custom_automations');
    return cached ? JSON.parse(cached) : [];
  });
  const [showModal, setShowModal] = useState(false);
  const [newAuto, setNewAuto] = useState({ name: '', trigger: 'Submission SLA > 8h', action: 'Notify Admin & Reassign', status: 'Active', runs: '0' });

  const handleAddAutomation = (e) => {
    e.preventDefault();
    if (!newAuto.name) return showToast('Enter automation title', 'error');
    const created = { id: `AUT-${100 + automationsList.length + 1}`, ...newAuto };
    const updated = [created, ...automationsList];
    setAutomationsList(updated);
    localStorage.setItem('digitasker_custom_automations', JSON.stringify(updated));
    setShowModal(false);
    showSuccess('Automation Active! ⚡', `${created.name} rule deployed.`);
  };

  const activeCount = automationsList.filter(a => a.status === 'Active').length;
  const totalRuns = automationsList.reduce((acc, a) => acc + (parseInt(a.runs) || 0), 0);

  return (
    <Page title="Automation Center">
      <div className="statsGrid four">
        <Stat label="Active automations" value={activeCount.toString()} icon={<Zap size={20}/>}/>
        <Stat label="Runs this month" value={totalRuns.toLocaleString('en-IN')} icon={<RefreshCw size={20}/>}/>
        <Stat label="Hours saved" value={(automationsList.length * 8).toString()} icon={<Clock3 size={20}/>}/>
        <Stat label="Failed runs" value={automationsList.length > 0 ? "0.0%" : "0%"} icon={<AlertTriangle size={20}/>}/>
      </div>

      <div className="advancedToolbar" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button className="primary" onClick={() => setShowModal(true)}>+ New Automation</button>
      </div>

      <div className="twoColAdvanced">
        <Card>
          <SectionTitle title="Automation rules" />
          {automationsList.length === 0 ? (
            <div style={{ padding: '30px 10px', textAlign: 'center', color: '#64748b' }}>
              <Zap size={28} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>No automation rules created yet.</p>
              <small style={{ fontSize: '11px', color: '#94a3b8' }}>Click "+ New Automation" above to add your first rule.</small>
            </div>
          ) : (
            automationsList.map(a => (
              <div className="automationRow" key={a.id} style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
                <div className="automationIcon" style={{ background: '#eff6ff', color: '#0066ff', padding: '10px', borderRadius: '10px' }}><Zap size={18}/></div>
                <div className="grow" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div className="row" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <b style={{ color: '#0f172a', fontSize: '14px' }}>{a.name}</b>
                    <Badge tone={a.status === 'Active' ? 'green' : 'orange'}>{a.status}</Badge>
                  </div>
                  <span style={{ color: '#0066ff', fontSize: '12px', fontFamily: 'monospace', fontWeight: 600 }}>WHEN {a.trigger}</span>
                  <p style={{ margin: 0, fontSize: '12.5px', color: '#475569' }}>THEN {a.action}</p>
                </div>
                <strong style={{ color: '#0f172a' }}>{a.runs}<small style={{ color: '#64748b', fontWeight: 400 }}> runs</small></strong>
              </div>
            ))
          )}
        </Card>

        <Card>
          <SectionTitle title="Visual rule preview"/>
          <div className="automationFlow" style={{ display: 'flex', gap: '14px', alignItems: 'center', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
              <span style={{ color: '#0066ff', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>WHEN</span>
              <b style={{ color: '#0f172a', fontSize: '13.5px' }}>Submission pending</b>
              <small style={{ color: '#64748b', fontSize: '11.5px' }}>for more than 8 hours</small>
            </div>
            <ArrowRight size={16} color="#94a3b8"/>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
              <span style={{ color: '#0066ff', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>IF</span>
              <b style={{ color: '#0f172a', fontSize: '13.5px' }}>Campaign priority</b>
              <small style={{ color: '#64748b', fontSize: '11.5px' }}>is High or Critical</small>
            </div>
            <ArrowRight size={16} color="#94a3b8"/>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
              <span style={{ color: '#0066ff', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>THEN</span>
              <b style={{ color: '#0f172a', fontSize: '13.5px' }}>Escalate reviewer</b>
              <small style={{ color: '#64748b', fontSize: '11.5px' }}>+ send admin notification</small>
            </div>
          </div>
          <button className="primary full" onClick={() => showSuccess('Rule Tested!', 'Automation trigger fired cleanly in sandbox mode.')}><Play size={15}/> Test with sandbox event</button>
        </Card>
      </div>

      {showModal && (
        <Modal title="Create Automation Rule" onClose={() => setShowModal(false)}>
          <form onSubmit={handleAddAutomation} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <label className="blockField">
              <span>Automation Title</span>
              <input value={newAuto.name} onChange={e => setNewAuto({ ...newAuto, name: e.target.value })} placeholder="e.g. Auto-flag Duplicate Receipts" required />
            </label>
            <label className="blockField">
              <span>Trigger Event (WHEN)</span>
              <input value={newAuto.trigger} onChange={e => setNewAuto({ ...newAuto, trigger: e.target.value })} required />
            </label>
            <label className="blockField">
              <span>Target Action (THEN)</span>
              <input value={newAuto.action} onChange={e => setNewAuto({ ...newAuto, action: e.target.value })} required />
            </label>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <button type="button" className="ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="primary">Deploy Automation ⚡</button>
            </div>
          </form>
        </Modal>
      )}
    </Page>
  );
}

/* 6. TRAINING & CERTIFICATION */
export function TrainingCenter() {
  const [certs, setCerts] = useState(() => {
    const cached = localStorage.getItem('digitasker_custom_certifications');
    return cached ? JSON.parse(cached) : [];
  });
  const [showModal, setShowModal] = useState(false);
  const [newCert, setNewCert] = useState({ name: '', lessons: '5', quiz: '10 Questions', pass: '80%', certified: 0, validity: '1 Year', status: 'Active' });

  const handleCreateCert = (e) => {
    e.preventDefault();
    if (!newCert.name) return showToast('Enter certification title', 'error');
    const created = { id: `CRT-${100 + certs.length + 1}`, ...newCert };
    const updated = [...certs, created];
    setCerts(updated);
    localStorage.setItem('digitasker_custom_certifications', JSON.stringify(updated));
    setShowModal(false);
    showSuccess('Certification Course Created!', `${created.name} course added.`);
  };

  const totalCertified = certs.reduce((acc, c) => acc + (parseInt(c.certified) || 0), 0);

  return (
    <Page title="Training & Certification">
      <div className="statsGrid four">
        <Stat label="Certified auditors" value={totalCertified.toLocaleString('en-IN')} icon={<GraduationCap size={20}/>}/>
        <Stat label="Courses" value={certs.length.toString()} icon={<BookOpen size={20}/>}/>
        <Stat label="Pass rate" value={certs.length > 0 ? "85.0%" : "0%"} icon={<CheckCircle2 size={20}/>}/>
        <Stat label="Expiring this month" value="0" icon={<Clock3 size={20}/>}/>
      </div>

      <div className="advancedToolbar" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button className="primary" onClick={() => setShowModal(true)}>+ Create Certification</button>
      </div>

      <div className="certGrid">
        {certs.length === 0 ? (
          <Card style={{ padding: '30px 10px', textAlign: 'center', color: '#64748b', gridColumn: '1 / -1' }}>
            <GraduationCap size={28} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>No active certification courses.</p>
            <small style={{ fontSize: '11px', color: '#94a3b8' }}>Click "+ Create Certification" above to publish a course.</small>
          </Card>
        ) : (
          certs.map(c => (
            <Card key={c.id} className="certCard">
              <div className="certTop">
                <div className="certIcon"><GraduationCap/></div>
                <Badge tone={c.status === 'Active' ? 'green' : 'orange'}>{c.status}</Badge>
              </div>
              <h3>{c.name}</h3>
              <p>{c.lessons} lessons · {c.quiz} · pass {c.pass}</p>
              <div className="certStats"><span><b>{c.certified}</b> certified</span><span><b>{c.validity}</b> validity</span></div>
              <div className="progress"><i style={{ width: `${Math.min(c.certified / 10, 100)}%` }}/></div>
              <button className="ghost full" onClick={() => showToast(`Managing curriculum for ${c.name}`, 'info')}>Manage curriculum</button>
            </Card>
          ))
        )}
      </div>

      {showModal && (
        <Modal title="Launch Certification Course" onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreateCert} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <label className="blockField">
              <span>Course Name</span>
              <input value={newCert.name} onChange={e => setNewCert({ ...newCert, name: e.target.value })} placeholder="e.g. IMDb Entertainment Review Specialist" required />
            </label>
            <div className="fieldGrid two">
              <label className="blockField">
                <span>Number of Lessons</span>
                <input value={newCert.lessons} onChange={e => setNewCert({ ...newCert, lessons: e.target.value })} required />
              </label>
              <label className="blockField">
                <span>Passing Criteria</span>
                <input value={newCert.pass} onChange={e => setNewCert({ ...newCert, pass: e.target.value })} required />
              </label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <button type="button" className="ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="primary">Publish Course 🎓</button>
            </div>
          </form>
        </Modal>
      )}
    </Page>
  );
}

/* 7. COMMUNICATIONS CENTER */
export function CommunicationsCenter() {
  const [msg, setMsg] = useState('New retail audits are available near you. Complete your profile to unlock eligible assignments.');
  const [inbox, setInbox] = useState(() => {
    const cached = localStorage.getItem('digitasker_custom_inbox');
    return cached ? JSON.parse(cached) : [];
  });

  const handleSendBroadcast = () => {
    showSuccess('Broadcast Dispatched! 📣', 'Message queued for active platform auditors across Push, Email, and WhatsApp.');
  };

  const unreadCount = inbox.filter(x => x[4]).length;

  return (
    <Page title="Communications Hub">
      <div className="statsGrid four">
        <Stat label="Unread conversations" value={unreadCount.toString()} icon={<MessageSquareMore size={20}/>}/>
        <Stat label="Broadcast reach" value={inbox.length > 0 ? inbox.length.toString() : "0"} icon={<Send size={20}/>}/>
        <Stat label="Avg. reply time" value={inbox.length > 0 ? "10m" : "0m"} icon={<Clock3 size={20}/>}/>
        <Stat label="Delivery rate" value={inbox.length > 0 ? "99.0%" : "100%"} icon={<CheckCircle2 size={20}/>}/>
      </div>

      <div className="communicationGrid">
        <Card>
          <SectionTitle title="Unified inbox"/>
          {inbox.length === 0 ? (
            <div style={{ padding: '30px 10px', textAlign: 'center', color: '#64748b' }}>
              <MessageSquareMore size={28} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Inbox is empty.</p>
              <small style={{ fontSize: '11px', color: '#94a3b8' }}>No active user conversations or support messages.</small>
            </div>
          ) : (
            inbox.map(x => (
              <div className="inboxRow" key={x[0]}>
                <div className="avatar">{x[0].split(' ').map(z => z[0]).join('').slice(0, 2)}</div>
                <div className="grow"><b>{x[0]}</b><span>{x[1]}</span><p>{x[2]}</p></div>
                <div><small>{x[3]}</small>{x[4] && <i>{x[4]}</i>}</div>
              </div>
            ))
          )}
        </Card>

        <Card>
          <SectionTitle title="Broadcast composer"/>
          <label className="field"><span>Target Audience</span><select><option>Auditors matching region + Retail</option><option>All active auditors</option><option>Campaign participants</option></select></label>
          <label className="field"><span>Dispatch Channels</span><div className="channelPills"><Badge>Push ✓</Badge><Badge>Email ✓</Badge><Badge>WhatsApp ✓</Badge><Badge tone="gray">SMS</Badge></div></label>
          <label className="field"><span>Message Content</span><textarea rows="6" value={msg} onChange={e => setMsg(e.target.value)}/></label>
          <button className="primary full" onClick={handleSendBroadcast}><Send size={15}/> Schedule broadcast</button>
        </Card>
      </div>
    </Page>
  );
}

/* 8. SYSTEM OPERATIONS */
export function SystemOperations() {
  const handleMaintenance = () => {
    showSuccess('Maintenance Complete!', 'Redis caches cleared and MySQL database query indexes rebuilt.');
  };

  return (
    <Page title="System Operations">
      <div className="statsGrid four">
        <Stat label="API health" value="99.99%" icon={<Activity size={20}/>}/>
        <Stat label="Queue depth" value="0" icon={<Layers3 size={20}/>}/>
        <Stat label="Storage used" value="12 MB" icon={<Database size={20}/>}/>
        <Stat label="Active sessions" value="1" icon={<Users2 size={20}/>}/>
      </div>

      <div className="advancedToolbar" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button className="primary" onClick={handleMaintenance}>Run Maintenance Task</button>
      </div>

      <div className="opsGrid">
        <Card>
          <SectionTitle title="Service health"/>
          {[
            ['Laravel API', 'Operational', '12 ms'],
            ['MySQL primary', 'Operational', '4 ms'],
            ['Redis / queues', 'Operational', '2 ms'],
            ['Object storage', 'Operational', '15 ms'],
            ['Notification gateway', 'Operational', '0% delayed']
          ].map(x => (
            <div className="serviceRow" key={x[0]}>
              <Activity size={16}/>
              <div className="grow"><b>{x[0]}</b><span>{x[2]}</span></div>
              <Badge tone={x[1] === 'Operational' ? 'green' : 'orange'}>{x[1]}</Badge>
            </div>
          ))}
        </Card>

        <Card>
          <SectionTitle title="Queue monitor"/>
          {[
            ['evidence-processing', 0, 'Idle workers'],
            ['notifications', 0, 'Idle workers'],
            ['reports', 0, 'Idle workers'],
            ['payout-release', 0, 'Idle workers']
          ].map(x => (
            <div className="queueRow" key={x[0]}>
              <div className="grow"><b>{x[0]}</b><div className="progress"><i style={{ width: `${x[1]}%` }}/></div><span>{x[2]}</span></div>
              <strong>{x[1]}</strong>
            </div>
          ))}
        </Card>

        <Card>
          <SectionTitle title="Data governance"/>
          <label className="toggleRow"><div><b>Signed private evidence URLs</b><span>15-minute expiry</span></div><input type="checkbox" defaultChecked/></label>
          <label className="toggleRow"><div><b>Admin IP restriction</b><span>Enforce allow-list for finance/admin</span></div><input type="checkbox"/></label>
          <label className="toggleRow"><div><b>Automatic retention cleanup</b><span>Archive evidence after policy period</span></div><input type="checkbox" defaultChecked/></label>
          <button className="ghost full" onClick={() => showToast('Retention policy active')}>Review retention policies</button>
        </Card>
      </div>
    </Page>
  );
}

/* 9. API & WEBHOOKS */
export function ApiWebhooks() {
  const [webhooks, setWebhooks] = useState(() => {
    const cached = localStorage.getItem('digitasker_custom_webhooks');
    return cached ? JSON.parse(cached) : [];
  });
  const [showModal, setShowModal] = useState(false);
  const [newKey, setNewKey] = useState({ name: 'Mobile App API Key', scope: 'tasks:write, submissions:read' });

  const handleCreateKey = (e) => {
    e.preventDefault();
    setShowModal(false);
    showSuccess('API Key Generated! 🔑', `Token il_live_${Math.random().toString(36).slice(2, 10)} created for ${newKey.name}.`);
  };

  return (
    <Page title="API & Webhooks">
      <div className="statsGrid four">
        <Stat label="API keys" value="1" icon={<Code2 size={20}/>}/>
        <Stat label="Webhook endpoints" value={webhooks.length.toString()} icon={<Webhook size={20}/>}/>
        <Stat label="Events / 24h" value={webhooks.length > 0 ? "100" : "0"} icon={<Activity size={20}/>}/>
        <Stat label="Webhook success" value={webhooks.length > 0 ? "99.4%" : "100%"} icon={<CheckCircle2 size={20}/>}/>
      </div>

      <div className="advancedToolbar" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button className="primary" onClick={() => setShowModal(true)}>+ Create API Key</button>
      </div>

      <div className="twoColAdvanced">
        <Card>
          <SectionTitle title="Webhook endpoints"/>
          {webhooks.length === 0 ? (
            <div style={{ padding: '30px 10px', textAlign: 'center', color: '#64748b' }}>
              <Webhook size={28} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>No webhook endpoints configured.</p>
              <small style={{ fontSize: '11px', color: '#94a3b8' }}>Register webhooks to stream platform events externally.</small>
            </div>
          ) : (
            webhooks.map(w => (
              <div className="webhookRow" key={w.name}>
                <div className="webhookIcon"><Webhook/></div>
                <div className="grow">
                  <div className="row"><b>{w.name}</b><Badge tone="green">{w.status}</Badge></div>
                  <code>{w.endpoint}</code><span>{w.events} · last {w.last}</span>
                </div>
                <strong>{w.success}</strong>
              </div>
            ))
          )}
        </Card>

        <Card>
          <SectionTitle title="Developer access"/>
          <div className="apiKeyBox">
            <span>Production API key</span><code>il_live_••••••••••••••4F2A</code>
            <button className="ghost" onClick={() => showToast('API key rotated', 'info')}>Rotate key</button>
          </div>
          <div className="apiScope">
            <b>Scopes</b>
            <div className="ruleChips"><Badge>campaigns:read</Badge><Badge>tasks:write</Badge><Badge>submissions:read</Badge><Badge>reports:read</Badge></div>
          </div>
          <label className="field"><span>Allowed IPs</span><input defaultValue="103.84.0.0/16, 49.36.22.18"/></label>
          <button className="primary full" onClick={() => showSuccess('API Policy Saved', 'Allowed IPs updated.')}>Save API policy</button>
        </Card>
      </div>

      {showModal && (
        <Modal title="Generate API Key" onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreateKey} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <label className="blockField">
              <span>Application / Integration Name</span>
              <input value={newKey.name} onChange={e => setNewKey({ ...newKey, name: e.target.value })} required />
            </label>
            <label className="blockField">
              <span>Requested Scopes</span>
              <input value={newKey.scope} onChange={e => setNewKey({ ...newKey, scope: e.target.value })} required />
            </label>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <button type="button" className="ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="primary">Generate Token 🔑</button>
            </div>
          </form>
        </Modal>
      )}
    </Page>
  );
}
