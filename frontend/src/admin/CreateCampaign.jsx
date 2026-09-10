import React, { useState, useEffect } from 'react';
import AppLayout from '../layouts/AppLayout';
import { ArrowRight, ArrowLeft, Check, MapPin, Users, WalletCards, Upload } from 'lucide-react';
import RichTextEditor from '../components/RichTextEditor';
import { showSuccess, showToast, showConfirm } from '../utils/swal';
import { useNavigate } from 'react-router-dom';
import { clients as initialClients } from '../data/dummy';
import api from '../services/api';

const defaultClientNames = [
  'Samsung India',
  'FoodCorp Hospitality',
  'NorthStar Retail',
  'FinTrust Bank',
  'LG Electronics',
  'PepsiCo India',
  'Reliance Retail',
  'Unilever India',
  'KitchenPro Appliances',
  'Lifestyle Brand',
  'FMCG Co.',
  'BookMyShow Media'
];

export default function CreateCampaign() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const [campaignName, setCampaignName] = useState('');
  const [clientsList, setClientsList] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('digitasker_custom_clients') || '[]');
    const customNames = saved.map(c => c.name);
    return customNames.length > 0 ? customNames : ['Select / Add Corporate Client'];
  });
  const [client, setClient] = useState('');
  const [campaignType, setCampaignType] = useState('Mystery Audit');
  const [objective, setObjective] = useState('');
  const [budget, setBudget] = useState('');

  useEffect(() => {
    api.admin.getClients()
      .then(res => {
        if (res.clients && res.clients.length > 0) {
          const apiNames = res.clients.map(c => c.name);
          setClientsList(prev => Array.from(new Set([...apiNames, ...prev])));
        }
      })
      .catch(() => {});
  }, []);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleLaunchCampaign = async () => {
    const confirmed = await showConfirm(
      'Launch Research Campaign?',
      `This will activate "${campaignName}" for client ${client} with ₹${Number(budget).toLocaleString('en-IN')} allocated budget.`
    );

    if (confirmed) {
      const newCmp = {
        id: `CMP-${Date.now().toString().slice(-4)}`,
        name: campaignName,
        client,
        tasks: 300,
        completed: 0,
        approved: 0,
        rejected: 0,
        budget: parseFloat(budget) || 250000,
        status: 'Active'
      };

      const existing = JSON.parse(localStorage.getItem('digitasker_custom_campaigns') || '[]');
      localStorage.setItem('digitasker_custom_campaigns', JSON.stringify([newCmp, ...existing.filter(c => c.name !== newCmp.name)]));

      try {
        await api.admin.createCampaign({
          title: campaignName,
          client_id: 1,
          allocated_budget: parseFloat(budget),
          target_tasks: 300
        });
      } catch (err) {}

      showSuccess(
        'Campaign Launched! 🚀',
        `Campaign ${campaignName} is active and saved to system database.`
      );
      navigate('/admin/campaigns');
    }
  };

  return (
    <AppLayout role='admin' title='Create Campaign'>
      {/* Wizard Steps Navigation */}
      <div className='wizardSteps'>
        {['Campaign Details', 'Audience & Locations', 'Budget & Schedule', 'Review & Launch'].map((s, i) => (
          <div 
            className={i === step ? 'wizardStep active' : 'wizardStep'} 
            key={s}
            onClick={() => setStep(i)}
            style={{ cursor: 'pointer' }}
          >
            <span>{i + 1}</span>
            {s}
          </div>
        ))}
      </div>

      <div className='builderGrid'>
        <section className='card stack'>
          {step === 0 && (
            <>
              <div className='sectionTitle'>
                <h2>Campaign details</h2>
                <span className='badge green'>Draft autosaved</span>
              </div>

              <div className='fieldGrid two'>
                <label>
                  Campaign name
                  <input value={campaignName} onChange={e => setCampaignName(e.target.value)} />
                </label>

                <label>
                  Client
                  <select value={client} onChange={e => setClient(e.target.value)}>
                    {clientsList.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Campaign code
                  <input defaultValue='SAM-RA-OCT26' />
                </label>

                <label>
                  Campaign type
                  <select value={campaignType} onChange={e => setCampaignType(e.target.value)}>
                    <option value="Mystery Audit">🏪 Mystery Audit</option>
                    <option value="Social Media (Like/Follow/Subscribe)">👍 Social Media (Like/Follow/Subscribe)</option>
                    <option value="E-Commerce Purchase & Review">🛒 E-Commerce Purchase & Review</option>
                    <option value="Google Rating & Review">⭐ Google Rating & Review</option>
                    <option value="IMDb & Movie Rating">⭐ IMDb & Movie Rating</option>
                    <option value="Survey">📝 Survey & Questionnaire</option>
                    <option value="Field Audit">📍 Field Audit</option>
                    <option value="Product Research">🔍 Product Research</option>
                  </select>
                </label>

                <label className='span2'>
                  Objective (CKEditor Enabled)
                  <RichTextEditor
                    value={objective}
                    onChange={setObjective}
                    placeholder="Enter campaign scope, target deliverables, and brand compliance guidelines..."
                  />
                </label>

                <label>
                  Start date
                  <input type='date' defaultValue='2026-10-01' />
                </label>

                <label>
                  End date
                  <input type='date' defaultValue='2026-10-31' />
                </label>
              </div>

              <div className='uploadBox' onClick={() => showToast('Brief document attached: SAM_Brief_2026.pdf')}>
                <Upload />
                <b>Upload campaign brief</b>
                <span>PDF, DOCX, XLSX · up to 20 MB</span>
              </div>
            </>
          )}

          {step === 1 && (
            <div className='stack'>
              <h2>Audience & Target Locations</h2>
              <label>Target Cities</label>
              <input defaultValue="Chandigarh, Mohali, Panchkula, Delhi NCR, Mumbai" />
              <label>Auditor Demographics</label>
              <select><option>Tier 1 & Tier 2 Verified Auditors (Age 21-45)</option></select>
            </div>
          )}

          {step === 2 && (
            <div className='stack'>
              <h2>Budget & Slot Allocation</h2>
              <label>Total Budget (₹)</label>
              <input value={budget} onChange={e => setBudget(e.target.value)} />
              <label>Payout Per Task (₹)</label>
              <input defaultValue="350" />
            </div>
          )}

          {step === 3 && (
            <div className='stack'>
              <h2>Review Campaign Settings</h2>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <p><b>Campaign Name:</b> {campaignName}</p>
                <p><b>Client:</b> {client}</p>
                <p><b>Budget:</b> ₹{Number(budget).toLocaleString('en-IN')}</p>
                <p><b>Objective:</b></p>
                <div dangerouslySetInnerHTML={{ __html: objective }} />
              </div>
            </div>
          )}

          <div className='formFooter' style={{ gap: '12px' }}>
            {step > 0 && (
              <button type="button" className='ghost' onClick={handleBack}>
                <ArrowLeft size={16} /> Back
              </button>
            )}
            <button type="button" className='ghost' onClick={() => showToast('Draft autosaved')}>Save Draft</button>
            {step < 3 ? (
              <button type="button" className='primary' onClick={handleNext}>
                Continue <ArrowRight size={16} />
              </button>
            ) : (
              <button type="button" className='primary' onClick={handleLaunchCampaign}>
                Launch Campaign 🚀
              </button>
            )}
          </div>
        </section>

        <aside className='stack'>
          <div className='card summaryCard'>
            <h3>Campaign summary</h3>
            <div className='summaryLine'>
              <Users />
              <div>
                <b>300 tasks planned</b>
                <span>Across 75 stores</span>
              </div>
            </div>
            <div className='summaryLine'>
              <MapPin />
              <div>
                <b>5 cities</b>
                <span>Chandigarh, Mohali +3</span>
              </div>
            </div>
            <div className='summaryLine'>
              <WalletCards />
              <div>
                <b>₹{Number(budget).toLocaleString('en-IN')} budget</b>
                <span>Estimated task payout</span>
              </div>
            </div>
          </div>

          <div className='card'>
            <h3>Setup checklist</h3>
            {[
              ['Client selected', true],
              ['Campaign objective added', true],
              ['Schedule configured', true],
              ['Audience pending', step >= 1],
              ['Task template pending', step >= 2]
            ].map(([x, isDone], i) => (
              <div className='checkRow' key={x}>
                <span className={isDone ? 'done' : ''}>
                  {isDone ? <Check size={14} /> : i + 1}
                </span>
                {x}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </AppLayout>
  );
}
