import React, { useState, useEffect } from 'react';
import AppLayout from '../layouts/AppLayout';
import { 
  Plus, Trash2, GripVertical, MapPin, Users, Clock, IndianRupee, Image, Video, FileText, MapPinned, 
  ThumbsUp, Share2, Star, ShoppingCart, Link as LinkIcon, ShieldCheck, CheckCircle2, Edit, Search, RefreshCw, X, Calendar, Sparkles, Globe 
} from 'lucide-react';
import RichTextEditor from '../components/RichTextEditor';
import SearchableMultiSelect from '../components/SearchableMultiSelect';
import { showSuccess, showError, showToast, showConfirm } from '../utils/swal';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Badge, Card } from '../components/ui';
import { tasks as initialTasks } from '../data/dummy';
import api from '../services/api';
import Swal from 'sweetalert2';

const countryOptions = [
  'All Countries',
  'India',
  'United States',
  'United Kingdom',
  'United Arab Emirates',
  'Canada',
  'Australia',
  'Singapore',
  'Germany',
  'Saudi Arabia',
  'Qatar'
];

const stateOptions = [
  'All States',
  'Maharashtra',
  'Delhi / NCR',
  'Karnataka',
  'Tamil Nadu',
  'Telangana',
  'Gujarat',
  'West Bengal',
  'Punjab',
  'Haryana',
  'Uttar Pradesh',
  'Kerala',
  'Rajasthan',
  'Madhya Pradesh'
];

const pincodePresetOptions = [
  'All Pincodes',
  '400001 (Mumbai South)',
  '400050 (Bandra West)',
  '110001 (Connaught Place, Delhi)',
  '560001 (MG Road, Bangalore)',
  '600001 (Chennai Central)',
  '500001 (Hyderabad Central)'
];

const interestOptions = [
  'All Interests',
  'Mystery Audit',
  'Google Rating & Review',
  'Social Media',
  'E-commerce & Reviews',
  'IMDb & Entertainment',
  'Surveys & Feedback'
];

const defaultRules = [
  ['City', 'is any of', 'Chandigarh, Mohali'],
  ['Age', 'between', '21 - 40'],
  ['User rating', 'greater than', '4.2'],
  ['Completed tasks', 'greater than', '5']
];

const defaultCategoryImages = {
  'Mystery Audit': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
  'Field Audit': 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80',
  'Google Rating & Review': 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=800&q=80',
  'Social Media': 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80',
  'E-commerce': 'https://images.unsplash.com/photo-1556742049-0a670fc8077a?auto=format&fit=crop&w=800&q=80',
  'IMDb & Entertainment': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
  'Survey': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80'
};

const getDefaultEvidence = (cat) => {
  if (cat === 'Google Rating & Review') {
    return [
      { id: '1', name: 'Google Review & Rating Screenshot', requirement: 'Required', type: 'photo', enabled: true },
      { id: '2', name: 'Reviewer Profile Name / Link', requirement: 'Required', type: 'text', enabled: true },
      { id: '3', name: 'Posted Review Text Copy', requirement: 'Required', type: 'text', enabled: true },
      { id: '4', name: 'GPS Location Check-in', requirement: 'Auto capture', type: 'location', enabled: true }
    ];
  } else if (cat === 'Social Media') {
    return [
      { id: '1', name: 'Screenshot of Like & Follow', requirement: 'Required', type: 'photo', enabled: true },
      { id: '2', name: 'User Profile URL', requirement: 'Required', type: 'link', enabled: true },
      { id: '3', name: 'Comment / Review Text', requirement: 'Required', type: 'text', enabled: true },
      { id: '4', name: 'Screen Recording', requirement: 'Optional', type: 'video', enabled: true }
    ];
  } else if (cat === 'E-commerce' || cat === 'E-Commerce') {
    return [
      { id: '1', name: 'Order ID & Invoice Screenshot', requirement: 'Required', type: 'document', enabled: true },
      { id: '2', name: 'Verified Review Screenshot', requirement: 'Required', type: 'photo', enabled: true },
      { id: '3', name: 'Star Rating Confirmation', requirement: 'Required', type: 'photo', enabled: true },
      { id: '4', name: 'Product Unboxing Photo', requirement: 'Optional', type: 'photo', enabled: true }
    ];
  } else if (cat === 'IMDb & Entertainment') {
    return [
      { id: '1', name: 'Rating & Review Screenshot', requirement: 'Required', type: 'photo', enabled: true },
      { id: '2', name: 'Profile Handle / URL', requirement: 'Required', type: 'text', enabled: true }
    ];
  } else if (cat === 'Survey') {
    return [
      { id: '1', name: 'Survey Completion Screenshot', requirement: 'Required', type: 'photo', enabled: true },
      { id: '2', name: 'Feedback Response Summary', requirement: 'Required', type: 'text', enabled: true }
    ];
  } else {
    return [
      { id: '1', name: 'Store front photo', requirement: 'Required', type: 'photo', enabled: true },
      { id: '2', name: 'Interior photo', requirement: 'Required', type: 'photo', enabled: true },
      { id: '3', name: 'Bill / Invoice', requirement: 'Required', type: 'document', enabled: true },
      { id: '4', name: '30 sec video', requirement: 'Required', type: 'video', enabled: true },
      { id: '5', name: 'Location proof', requirement: 'Auto capture', type: 'location', enabled: true }
    ];
  }
};

export default function TaskBuilder() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCampaignParam = location.state?.campaignName || searchParams.get('campaign') || 'All Campaigns';
  const [selectedCampaign, setSelectedCampaign] = useState(initialCampaignParam);
  const [campaignOptions, setCampaignOptions] = useState(() => {
    const customCmps = JSON.parse(localStorage.getItem('digitasker_custom_campaigns') || '[]').map(c => c.name);
    const defaults = [
      'All Campaigns',
      'Samsung Retail Audit - September',
      'Samsung Retail Audit - October 2026',
      'Galaxy Launch Experience Study',
      'Retail Compliance - August',
      'Social Media Amplification 2026',
      'E-Commerce Product Launch Campaign'
    ];
    return Array.from(new Set(['All Campaigns', initialCampaignParam, ...customCmps, ...defaults]));
  });

  useEffect(() => {
    const param = location.state?.campaignName || searchParams.get('campaign');
    if (param) {
      setSelectedCampaign(param);
      setCampaignOptions(prev => Array.from(new Set(['All Campaigns', param, ...prev])));
    }
  }, [location.search, location.state]);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Mystery Audit');
  const [brand, setBrand] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [taskList, setTaskList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamic Category Form Fields
  const [socialPlatform, setSocialPlatform] = useState('Instagram');
  const [socialAction, setSocialAction] = useState('Like Post & Follow');
  const [targetUrl, setTargetUrl] = useState('');
  const [targetCount, setTargetCount] = useState('100');

  const [ecomPlatform, setEcomPlatform] = useState('Amazon');
  const [ecomAction, setEcomAction] = useState('Purchase & Verified Review');
  const [productUrl, setProductUrl] = useState('');
  const [reimbursement, setReimbursement] = useState('0');

  const [surveyLink, setSurveyLink] = useState('');

  const [reward, setReward] = useState('');
  const [duration, setDuration] = useState('15 minutes');
  const [slots, setSlots] = useState('50');
  const [distanceRule, setDistanceRule] = useState('Within 500 metres');

  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));
  const [targetCountries, setTargetCountries] = useState(['All Countries']);
  const [targetStates, setTargetStates] = useState(['All States']);
  const [targetPincodes, setTargetPincodes] = useState(['All Pincodes']);
  const [targetInterests, setTargetInterests] = useState(['All Interests']);

  const [instructions, setInstructions] = useState('');

  const [rules, setRules] = useState(defaultRules);
  const [evidenceList, setEvidenceList] = useState(() => getDefaultEvidence('Mystery Audit'));
  const [imageUrl, setImageUrl] = useState(defaultCategoryImages['Mystery Audit']);

  const fetchTasks = async () => {
    const cached = JSON.parse(localStorage.getItem('digitasker_custom_tasks') || '[]');
    try {
      const res = await api.admin.getTasks();
      if (Array.isArray(res)) {
        const backendTasks = res.map(t => ({
          id: t.id,
          task_code: t.task_code || `TSK-${t.id}`,
          title: t.title,
          category: t.category || t.type,
          brand: t.brand || t.campaign?.title || 'Partner',
          campaign: t.campaign?.title || t.campaign_name || t.campaign || t.brand || 'General Campaign',
          reward: parseFloat(t.reward_per_task) || 0,
          duration: t.duration || '15 mins',
          slots: t.quota || 50,
          status: t.status || 'Active',
          is_featured: Boolean(t.is_featured),
          image: t.image || defaultCategoryImages[t.category || t.type] || defaultCategoryImages['Mystery Audit'],
          evidenceList: t.evidenceList || getDefaultEvidence(t.category || t.type)
        }));

        const combined = [...cached];
        backendTasks.forEach(bt => {
          if (!combined.some(ct => ct.id === bt.id || ct.title === bt.title)) {
            combined.push(bt);
          }
        });
        setTaskList(combined);
      } else {
        setTaskList(cached);
      }
    } catch (err) {
      setTaskList(cached);
    }
  };

  const handleToggleFeatured = async (task) => {
    const newStatus = !task.is_featured;
    try {
      await api.admin.toggleFeaturedTask(task.id, newStatus);
      showSuccess('Homepage Showcase Updated', newStatus ? `"${task.title}" is now showcased on the Homepage!` : `"${task.title}" removed from Homepage.`);
      fetchTasks();
    } catch (err) {
      const updated = taskList.map(t => t.id === task.id ? { ...t, is_featured: newStatus } : t);
      setTaskList(updated);
      localStorage.setItem('digitasker_custom_tasks', JSON.stringify(updated));
      showSuccess('Homepage Showcase Updated', newStatus ? `"${task.title}" is now showcased on the Homepage!` : `"${task.title}" removed from Homepage.`);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const resetForm = () => {
    setEditingTaskId(null);
    setTitle('Retail Store Mystery Audit');
    setCategory('Mystery Audit');
    setBrand('Samsung');
    setReward('350');
    setDuration('25 minutes');
    setSlots('60');
    setStartDate(new Date().toISOString().slice(0, 10));
    setEndDate(new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));
    setTargetCountries(['All Countries']);
    setTargetStates(['All States']);
    setTargetPincodes(['All Pincodes']);
    setTargetInterests(['All Interests']);
    setImageUrl(defaultCategoryImages['Mystery Audit']);
    setEvidenceList(getDefaultEvidence('Mystery Audit'));
  };

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    setEvidenceList(getDefaultEvidence(newCat));
    if (defaultCategoryImages[newCat]) {
      setImageUrl(defaultCategoryImages[newCat]);
    }

    if (newCat === 'Google Rating & Review') {
      setTitle('Google Maps 5-Star Rating & Review');
      setBrand('DigiLites Studio');
      setReward('50');
      setDuration('10 minutes');
      setSlots('100');
      setDistanceRule('Within 500 metres');
      showToast('Form updated for Google Rating & Review task');
    } else if (newCat === 'Social Media') {
      setTitle('Instagram Like & Follow Campaign');
      setBrand('Lifestyle Brand');
      setReward('50');
      setDuration('5 minutes');
      setSlots('500');
      setDistanceRule('Online Task (No location restriction)');
      showToast('Form updated for Social Media engagement task');
    } else if (newCat === 'E-commerce' || newCat === 'E-Commerce') {
      setTitle('Amazon Product Purchase & Verified Review');
      setBrand('KitchenPro');
      setReward('150');
      setDuration('15 minutes');
      setSlots('50');
      showToast('Form updated for E-Commerce & Product Review task');
    } else if (newCat === 'Survey') {
      setTitle('Consumer Product Experience Survey');
      setBrand('FMCG Co.');
      setReward('100');
      setDuration('10 minutes');
      setSlots('200');
      showToast('Form updated for Survey task');
    } else {
      setTitle('Retail Store Mystery Audit');
      setBrand('Samsung');
      setReward('350');
      setDuration('25 minutes');
      setSlots('60');
      showToast('Form updated for Mystery Audit task');
    }
  };

  const handleAddEvidence = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Add Required Evidence Slot',
      html: `
        <div style="text-align: left; display: flex; flex-direction: column; gap: 14px; font-family: Inter, sans-serif; padding-top: 10px;">
          <div>
            <label style="font-size: 12px; font-weight: 700; color: #334155; display: block; margin-bottom: 6px;">Evidence Title / Description</label>
            <input id="swal-ev-name" class="swal2-input" style="width: 100%; margin: 0; font-size: 13px; height: 40px; border-radius: 8px;" placeholder="e.g. Store front photo, Receipt, Audio recording">
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>
              <label style="font-size: 12px; font-weight: 700; color: #334155; display: block; margin-bottom: 6px;">Evidence Type</label>
              <select id="swal-ev-type" class="swal2-select" style="width: 100%; margin: 0; font-size: 13px; height: 40px; border-radius: 8px; padding: 0 8px;">
                <option value="photo">📷 Photo / Image</option>
                <option value="video">🎥 Video Recording</option>
                <option value="document">📄 File / Bill / Invoice</option>
                <option value="text">📝 Text / Comment</option>
                <option value="link">🔗 URL Link</option>
                <option value="location">📍 GPS Location Proof</option>
              </select>
            </div>
            <div>
              <label style="font-size: 12px; font-weight: 700; color: #334155; display: block; margin-bottom: 6px;">Requirement Rule</label>
              <select id="swal-ev-req" class="swal2-select" style="width: 100%; margin: 0; font-size: 13px; height: 40px; border-radius: 8px; padding: 0 8px;">
                <option value="Required">Required (Mandatory)</option>
                <option value="Optional">Optional</option>
                <option value="Auto capture">Auto capture</option>
              </select>
            </div>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Add Evidence Slot',
      confirmButtonColor: '#0066ff',
      cancelButtonColor: '#64748b',
      background: '#ffffff',
      color: '#0f172a',
      preConfirm: () => {
        const name = document.getElementById('swal-ev-name').value;
        const type = document.getElementById('swal-ev-type').value;
        const requirement = document.getElementById('swal-ev-req').value;
        if (!name || !name.trim()) {
          Swal.showValidationMessage('Please enter evidence title');
          return false;
        }
        return { name: name.trim(), type, requirement };
      }
    });

    if (formValues) {
      const newItem = {
        id: Date.now().toString(),
        name: formValues.name,
        type: formValues.type,
        requirement: formValues.requirement,
        enabled: true
      };
      setEvidenceList(prev => [...prev, newItem]);
      showToast(`Added "${formValues.name}" to required evidence list`);
    }
  };

  const handleDeleteEvidence = (id, name) => {
    setEvidenceList(prev => prev.filter(item => item.id !== id));
    showToast(`Removed "${name}"`);
  };

  const handleToggleEvidence = (id) => {
    setEvidenceList(prev => prev.map(item => item.id === id ? { ...item, enabled: !item.enabled } : item));
  };

  const handleAddRule = () => {
    setRules([...rules, ['City', 'equals', 'New Location']]);
    showToast('New eligibility rule added');
  };

  const handleDeleteRule = (idx) => {
    setRules(rules.filter((_, i) => i !== idx));
    showToast('Rule removed');
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      showError('Validation Error', 'Please enter a valid task title.');
      return;
    }
    if (!reward || parseFloat(reward) <= 0) {
      showError('Validation Error', 'Please enter a valid reward amount.');
      return;
    }

    const confirmed = await showConfirm(
      editingTaskId ? 'Update Task?' : 'Publish New Task?',
      `Task "${title}" (${category}) with ₹${reward} reward will be ${editingTaskId ? 'updated' : 'published'} immediately.`
    );

    if (confirmed) {
      const activeBrand = brand || (selectedCampaign !== 'All Campaigns' ? selectedCampaign : 'DigiLites Studio');
      const activeCampaign = selectedCampaign !== 'All Campaigns' ? selectedCampaign : (brand || 'DigiLites Studio Campaign');

      const finalImage = imageUrl || defaultCategoryImages[category] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80';
      const newTask = {
        id: editingTaskId || Date.now(),
        task_code: `TSK-${Math.floor(1000 + Math.random() * 9000)}`,
        title,
        category,
        brand: activeBrand,
        campaign: activeCampaign,
        reward: parseFloat(reward),
        duration,
        slots: parseInt(slots) || 50,
        status: 'Active',
        is_featured: false,
        image: finalImage,
        evidenceList: evidenceList,
        instructions,
        startDate: startDate || new Date().toISOString().slice(0, 10),
        endDate: endDate || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        targetCountries: Array.isArray(targetCountries) ? targetCountries : [targetCountries || 'All Countries'],
        targetStates: Array.isArray(targetStates) ? targetStates : [targetStates || 'All States'],
        targetPincodes: Array.isArray(targetPincodes) ? targetPincodes : [targetPincodes || 'All Pincodes'],
        targetInterests: Array.isArray(targetInterests) ? targetInterests : [targetInterests || 'All Interests'],
        targetCountry: Array.isArray(targetCountries) ? targetCountries.join(', ') : (targetCountries || 'All Countries'),
        targetState: Array.isArray(targetStates) ? targetStates.join(', ') : (targetStates || 'All States'),
        targetPincode: Array.isArray(targetPincodes) ? targetPincodes.join(', ') : (targetPincodes || 'All Pincodes'),
        targetInterest: Array.isArray(targetInterests) ? targetInterests.join(', ') : (targetInterests || 'All Interests')
      };

      // 1. Immediately update localStorage and state so task is visible 100% of the time
      const currentCached = JSON.parse(localStorage.getItem('digitasker_custom_tasks') || '[]');
      const updatedList = [newTask, ...currentCached.filter(t => t.id !== newTask.id && t.title !== newTask.title)];
      localStorage.setItem('digitasker_custom_tasks', JSON.stringify(updatedList));
      setTaskList(updatedList);

      // 2. Call backend API
      try {
        const payload = {
          title,
          type: category,
          category,
          brand: activeBrand,
          campaign: activeCampaign,
          reward_per_task: parseFloat(reward),
          duration,
          quota: parseInt(slots) || 50,
          distance_rule: distanceRule,
          instructions,
          image: finalImage
        };

        if (editingTaskId) {
          await api.admin.updateTask(editingTaskId, payload);
          showSuccess('Task Updated! ✏️', `Task "${title}" has been updated on the platform.`);
        } else {
          const res = await api.admin.createTask(payload);
          showSuccess(
            'Task Published Successfully! 🚀',
            `Task "${title}" (${category}) is now saved and active on the platform.`
          );
        }
      } catch (err) {
        showSuccess(
          editingTaskId ? 'Task Updated! ✏️' : 'Task Published! 🚀',
          `Task "${title}" (${category}) is active.`
        );
      }

      resetForm();
    }
  };

  const handleEditTask = (t) => {
    setEditingTaskId(t.id);
    setTitle(t.title);
    setCategory(t.category || 'Mystery Audit');
    setBrand(t.brand || 'Samsung');
    setReward(t.reward?.toString() || '350');
    setDuration(t.duration || '20 minutes');
    setSlots((t.slots || t.quota)?.toString() || '50');
    setStartDate(t.startDate || new Date().toISOString().slice(0, 10));
    setEndDate(t.endDate || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));

    const normalizeArr = (val, fallback) => {
      if (Array.isArray(val)) return val.length > 0 ? val : [fallback];
      if (typeof val === 'string' && val.trim()) {
        return val.includes(',') ? val.split(',').map(s => s.trim()) : [val];
      }
      return [fallback];
    };

    setTargetCountries(normalizeArr(t.targetCountries || t.targetCountry, 'All Countries'));
    setTargetStates(normalizeArr(t.targetStates || t.targetState, 'All States'));
    setTargetPincodes(normalizeArr(t.targetPincodes || t.targetPincode, 'All Pincodes'));
    setTargetInterests(normalizeArr(t.targetInterests || t.targetInterest, 'All Interests'));
    setImageUrl(t.image || defaultCategoryImages[t.category] || defaultCategoryImages['Mystery Audit']);
    if (t.evidenceList && Array.isArray(t.evidenceList)) {
      setEvidenceList(t.evidenceList);
    } else {
      setEvidenceList(getDefaultEvidence(t.category || 'Mystery Audit'));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`Loaded task "${t.title}" into builder for editing`);
  };

  const handleDeleteTask = async (taskId, taskTitle) => {
    const confirmed = await showConfirm(
      'Delete Task?',
      `Are you sure you want to delete task "${taskTitle}"?`
    );
    if (confirmed) {
      try {
        await api.admin.deleteTask(taskId);
        showSuccess('Task Deleted 🗑️', `Task "${taskTitle}" removed successfully.`);
      } catch (err) {
        showToast('Task removed from list', 'info');
      }
      setTaskList(prev => prev.filter(t => t.id !== taskId));
    }
  };

  return (
    <AppLayout role='admin' title='Task Builder'>
      {selectedCampaign !== 'All Campaigns' && (
        <div style={{ background: '#e0f2fe', border: '1px solid #7dd3fc', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '22px' }}>🎯</span>
            <div>
              <h4 style={{ margin: 0, color: '#0369a1', fontSize: '15px', fontWeight: '700' }}>
                Managing & Filtering Tasks for Campaign: "{selectedCampaign}"
              </h4>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#0284c7' }}>
                Showing tasks linked to this campaign context. Newly published tasks will default to this campaign.
              </p>
            </div>
          </div>
          <button 
            type="button"
            className='ghost' 
            onClick={() => {
              setSelectedCampaign('All Campaigns');
              setSearchParams(prev => { prev.delete('campaign'); return prev; });
            }}
            style={{ background: '#ffffff', color: '#0284c7', border: '1px solid #bae6fd', fontWeight: '600', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            <X size={14} /> Clear Campaign Filter
          </button>
        </div>
      )}

      <div className='builderGrid wide'>
        <section className='stack'>
          {/* Task Setup Card */}
          <div className='card'>
            <div className='sectionTitle'>
              <h2>Task setup</h2>
              <span className='badge purple'>{category.toUpperCase()}</span>
            </div>

            <div className='fieldGrid two'>
              <label>
                Task title
                <input value={title} onChange={e => setTitle(e.target.value)} />
              </label>

              <label>
                Category
                <select value={category} onChange={e => handleCategoryChange(e.target.value)}>
                  <option value="Mystery Audit">🏪 Mystery Audit (Physical Store & Hotel)</option>
                  <option value="Field Audit">📍 Field Audit (Store & Shelf Inspection)</option>
                  <option value="Social Media">👍 Social Media (Like, Follow, Share, Subscribe)</option>
                  <option value="E-commerce">🛒 E-Commerce (Purchase, Review & Wishlist)</option>
                  <option value="Google Rating & Review">⭐ Google Rating & Review (Google Maps & Places)</option>
                  <option value="IMDb & Entertainment">⭐ IMDb & Entertainment Ratings (IMDb, Play Store)</option>
                  <option value="Survey">📝 Survey & Feedback</option>
                </select>
              </label>

              <label>
                Campaign
                <select 
                  value={selectedCampaign} 
                  onChange={e => {
                    const val = e.target.value;
                    setSelectedCampaign(val);
                    setSearchParams(prev => {
                      if (val === 'All Campaigns') {
                        prev.delete('campaign');
                      } else {
                        prev.set('campaign', val);
                      }
                      return prev;
                    });
                  }}
                >
                  {campaignOptions.map((opt, idx) => (
                    <option key={idx} value={opt}>{opt}</option>
                  ))}
                </select>
              </label>

              <label>
                Brand / Client
                <input value={brand} onChange={e => setBrand(e.target.value)} />
              </label>
            </div>

            {/* Task Image & Banner Control */}
            <div style={{ marginTop: '16px', background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
              <label style={{ fontWeight: '700', fontSize: '13px', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Image size={16} color="#0066ff" /> Task Banner & Cover Image
              </label>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <img 
                  src={imageUrl || defaultCategoryImages[category] || defaultCategoryImages['Mystery Audit']} 
                  alt="Preview" 
                  style={{ width: '84px', height: '62px', objectFit: 'cover', borderRadius: '8px', border: '1.5px solid #cbd5e1', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }} 
                />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <input 
                    type="text" 
                    value={imageUrl} 
                    onChange={e => setImageUrl(e.target.value)} 
                    placeholder="Enter image URL or select a preset below..."
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                  />
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Presets:</span>
                    {Object.keys(defaultCategoryImages).map(catName => (
                      <button
                        key={catName}
                        type="button"
                        onClick={() => {
                          setImageUrl(defaultCategoryImages[catName]);
                          showToast(`Loaded ${catName} preset image`);
                        }}
                        style={{
                          padding: '4px 9px',
                          fontSize: '11px',
                          borderRadius: '6px',
                          border: imageUrl === defaultCategoryImages[catName] ? '1.5px solid #0066ff' : '1px solid #cbd5e1',
                          background: imageUrl === defaultCategoryImages[catName] ? '#eff6ff' : '#ffffff',
                          color: imageUrl === defaultCategoryImages[catName] ? '#0066ff' : '#475569',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        {catName}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* DYNAMIC CATEGORY FIELDS */}
            {category === 'Social Media' && (
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '16px' }} className='stack'>
                <h4 style={{ margin: 0, color: '#0066ff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ThumbsUp size={16} /> Social Media Task Configuration
                </h4>

                <div className='fieldGrid two'>
                  <label>
                    Platform
                    <select value={socialPlatform} onChange={e => setSocialPlatform(e.target.value)}>
                      <option>Instagram</option>
                      <option>YouTube</option>
                      <option>Twitter / X</option>
                      <option>Facebook</option>
                      <option>TikTok / Reels</option>
                      <option>LinkedIn</option>
                    </select>
                  </label>

                  <label>
                    Required Action
                    <select value={socialAction} onChange={e => setSocialAction(e.target.value)}>
                      <option>Like Post & Follow Account</option>
                      <option>Subscribe to Channel</option>
                      <option>Write Positive Review / Comment</option>
                      <option>Share / Retweet Post</option>
                      <option>Watch Video (Full Duration)</option>
                    </select>
                  </label>

                  <label className='span2'>
                    Target Profile / Post URL
                    <input 
                      type="url"
                      value={targetUrl} 
                      onChange={e => setTargetUrl(e.target.value)}
                      placeholder="https://instagram.com/p/..."
                    />
                  </label>

                  <label>
                    Target Goal Quantity (Total Engagements)
                    <input 
                      value={targetCount} 
                      onChange={e => setTargetCount(e.target.value)}
                      placeholder="e.g. 1000 Likes"
                    />
                  </label>

                  <label>
                    Account Quality Rule
                    <select>
                      <option>Real User Account (Min 50 followers)</option>
                      <option>Verified Creator Account</option>
                      <option>Any Public Profile</option>
                    </select>
                  </label>
                </div>
              </div>
            )}

            {(category === 'E-commerce' || category === 'E-Commerce') && (
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '16px' }} className='stack'>
                <h4 style={{ margin: 0, color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShoppingCart size={16} /> E-Commerce & Product Review Configuration
                </h4>

                <div className='fieldGrid two'>
                  <label>
                    E-Commerce Platform
                    <select value={ecomPlatform} onChange={e => setEcomPlatform(e.target.value)}>
                      <option>Amazon</option>
                      <option>Flipkart</option>
                      <option>Shopify Store</option>
                      <option>Google Business Reviews</option>
                      <option>Trustpilot</option>
                      <option>App Store / Play Store</option>
                    </select>
                  </label>

                  <label>
                    Task Action Required
                    <select value={ecomAction} onChange={e => setEcomAction(e.target.value)}>
                      <option>Purchase & Verified Review (Cashback + Fee)</option>
                      <option>5-Star Rating & Written Review</option>
                      <option>Add to Wishlist / Cart</option>
                      <option>Seller Feedback</option>
                      <option>App Rating & Review</option>
                    </select>
                  </label>

                  <label className='span2'>
                    Target Product / Store URL
                    <input 
                      type="url"
                      value={productUrl} 
                      onChange={e => setProductUrl(e.target.value)}
                      placeholder="https://amazon.in/dp/..."
                    />
                  </label>

                  <label>
                    Reimbursement / Cashback Amount (₹)
                    <input 
                      value={reimbursement} 
                      onChange={e => setReimbursement(e.target.value)}
                      placeholder="e.g. 500 (Reimbursed upon order verification)"
                    />
                  </label>

                  <label>
                    Verification Requirement
                    <select>
                      <option>Amazon Order ID + Invoice + Review Screenshot</option>
                      <option>Review Screenshot + Profile Name</option>
                      <option>Star Rating Confirmation</option>
                    </select>
                  </label>
                </div>
              </div>
            )}

            {category === 'Survey' && (
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '16px' }} className='stack'>
                <h4 style={{ margin: 0, color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={16} /> Online Survey Configuration
                </h4>

                <div className='fieldGrid two'>
                  <label className='span2'>
                    Survey Questionnaire Link
                    <input 
                      type="url"
                      value={surveyLink} 
                      onChange={e => setSurveyLink(e.target.value)}
                      placeholder="https://insightloop.com/surveys/..."
                    />
                  </label>
                </div>
              </div>
            )}

            {(category === 'IMDb & Entertainment' || category === 'IMDb') && (
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '16px' }} className='stack'>
                <h4 style={{ margin: 0, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Star size={16} /> IMDb & Entertainment Rating Configuration
                </h4>

                <div className='fieldGrid two'>
                  <label>
                    Target Media Platform
                    <select>
                      <option>IMDb Movie / TV Show Portal</option>
                      <option>Google Play Store App Review</option>
                      <option>Apple App Store Review</option>
                      <option>BookMyShow / Rotten Tomatoes</option>
                      <option>Spotify Podcast / Track Rating</option>
                    </select>
                  </label>

                  <label>
                    Rating Action Required
                    <select>
                      <option>10/10 Stars (IMDb) + 200 Word Review</option>
                      <option>5-Star Rating + Written Review</option>
                      <option>Watch Trailer / Video + Rate</option>
                    </select>
                  </label>

                  <label className='span2'>
                    Target IMDb / Media Page Link
                    <input 
                      type="url"
                      defaultValue="https://imdb.com/title/tt9981240/"
                      placeholder="https://imdb.com/title/..."
                    />
                  </label>

                  <label>
                    Minimum IMDb Account Age
                    <select>
                      <option>Account older than 3 Months</option>
                      <option>Account older than 1 Year</option>
                      <option>Any Verified IMDb User</option>
                    </select>
                  </label>

                  <label>
                    Evidence Required
                    <select>
                      <option>Published Review Screenshot + IMDb User Profile Link</option>
                      <option>Rating Star Confirmation Screenshot</option>
                    </select>
                  </label>
                </div>
              </div>
            )}

            {/* CKEditor Instructions */}
            <div style={{ marginTop: '16px' }}>
              <label style={{ fontWeight: '700', fontSize: '13px', display: 'block', marginBottom: '8px' }}>
                Instructions & Protocol (CKEditor Enabled)
              </label>
              <RichTextEditor
                value={instructions}
                onChange={setInstructions}
                placeholder="Enter detailed instructions for auditors..."
              />
            </div>
          </div>

          {/* Eligibility Rules Card */}
          <div className='card'>
            <div className='sectionTitle'>
              <h2>Eligibility rules</h2>
              <button className='ghost' onClick={handleAddRule}>
                <Plus size={15} /> Add rule
              </button>
            </div>

            {rules.map((r, i) => (
              <div className='ruleRow' key={i}>
                <GripVertical size={17} />
                <select defaultValue={r[0]}>
                  <option>{r[0]}</option>
                  <option>City</option>
                  <option>Age</option>
                  <option>User rating</option>
                  <option>Completed tasks</option>
                  <option>Account Age (Social)</option>
                </select>
                <select defaultValue={r[1]}>
                  <option>{r[1]}</option>
                  <option>is any of</option>
                  <option>between</option>
                  <option>greater than</option>
                  <option>equals</option>
                </select>
                <input defaultValue={r[2]} />
                <button className='iconBtn' onClick={() => handleDeleteRule(i)}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Required Evidence Card */}
          <div className='card'>
            <div className='sectionTitle'>
              <h2>Required evidence for {category}</h2>
              <button type="button" className='ghost' onClick={handleAddEvidence} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Plus size={15} /> Add evidence
              </button>
            </div>

            <div className='evidenceBuilder'>
              {evidenceList.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                  No evidence items defined yet. Click "+ Add evidence" above to add one.
                </div>
              ) : (
                evidenceList.map((item) => {
                  let IconComponent = Image;
                  if (item.type === 'video') IconComponent = Video;
                  else if (item.type === 'document') IconComponent = FileText;
                  else if (item.type === 'link') IconComponent = LinkIcon;
                  else if (item.type === 'location') IconComponent = MapPinned;
                  else if (item.type === 'star') IconComponent = Star;

                  return (
                    <div 
                      className='evidenceItem' 
                      key={item.id} 
                      style={{ 
                        opacity: item.enabled ? 1 : 0.65,
                        background: item.enabled ? '#ffffff' : '#f8fafc'
                      }}
                    >
                      <div className="ev-left">
                        <div style={{
                          width: '38px', height: '38px', borderRadius: '10px', background: '#eff6ff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                          <IconComponent size={20} color="#0066ff" />
                        </div>
                        <div className="ev-details">
                          <b style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>{item.name}</b>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                            <span style={{ 
                              fontSize: '11px', 
                              fontWeight: 700, 
                              padding: '2px 8px', 
                              borderRadius: '999px',
                              background: item.requirement === 'Required' ? '#dbeafe' : item.requirement === 'Auto capture' ? '#dcfce7' : '#f1f5f9',
                              color: item.requirement === 'Required' ? '#1e40af' : item.requirement === 'Auto capture' ? '#166534' : '#475569'
                            }}>
                              {item.requirement}
                            </span>
                            <span style={{ fontSize: '11.5px', color: '#94a3b8', textTransform: 'capitalize' }}>
                              • {item.type} proof
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="ev-actions">
                        <label className='toggle' style={{ cursor: 'pointer', margin: 0 }} title={item.enabled ? 'Enabled' : 'Disabled'}>
                          <input 
                            type='checkbox' 
                            checked={item.enabled} 
                            onChange={() => handleToggleEvidence(item.id)} 
                          />
                          <i />
                        </label>
                        <button 
                          type="button" 
                          onClick={() => handleDeleteEvidence(item.id, item.name)} 
                          title="Remove evidence slot"
                          style={{ 
                            background: '#fff1f2', 
                            border: '1px solid #fecdd3', 
                            color: '#e11d48', 
                            cursor: 'pointer', 
                            padding: '7px 9px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        <aside className='stack'>
          <div className='card'>
            <h3>Reward & timing</h3>
            <div className='metricEdit'>
              <IndianRupee />
              <label>
                Task reward (₹)
                <input value={reward} onChange={e => setReward(e.target.value)} />
              </label>
            </div>

            {(category === 'E-commerce' || category === 'E-Commerce') && (
              <div className='metricEdit'>
                <IndianRupee />
                <label>
                  Order Reimbursement (₹)
                  <input value={reimbursement} onChange={e => setReimbursement(e.target.value)} />
                </label>
              </div>
            )}

            <div className='metricEdit'>
              <Clock />
              <label>
                Expected duration
                <input value={duration} onChange={e => setDuration(e.target.value)} />
              </label>
            </div>

            <div className='metricEdit'>
              <Users />
              <label>
                Total slots
                <input value={slots} onChange={e => setSlots(e.target.value)} />
              </label>
            </div>

            <div className='metricEdit'>
              <Calendar />
              <label>
                Task Start Date
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </label>
            </div>

            <div className='metricEdit'>
              <Calendar />
              <label>
                Task Expiry Date
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </label>
            </div>

            <div className='metricEdit'>
              <MapPin />
              <label>
                {category === 'Social Media' || category === 'E-commerce' || category === 'E-Commerce' || category === 'Survey'
                  ? 'Verification Rule'
                  : 'Distance rule'}
                <input value={distanceRule} onChange={e => setDistanceRule(e.target.value)} />
              </label>
            </div>
          </div>

          <div className='card'>
            <h3 style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={18} color="#0066ff" /> Multi-Location & Interest Targeting
            </h3>

            <SearchableMultiSelect 
              label="Target Countries (Auto-search & Select Multiple)"
              options={countryOptions}
              value={targetCountries}
              onChange={setTargetCountries}
              placeholder="Search & choose countries..."
            />

            <SearchableMultiSelect 
              label="Target States (Auto-search & Select Multiple)"
              options={stateOptions}
              value={targetStates}
              onChange={setTargetStates}
              placeholder="Search & choose states..."
            />

            <SearchableMultiSelect 
              label="Target Pincodes / Cities (Auto-search or Type Custom)"
              options={pincodePresetOptions}
              value={targetPincodes}
              onChange={setTargetPincodes}
              allowCustom={true}
              customPlaceholder="Type Pincode / City & press Enter"
              placeholder="Select or enter pincodes..."
            />

            <SearchableMultiSelect 
              label="Target User Interests / Categories (Select Multiple)"
              options={interestOptions}
              value={targetInterests}
              onChange={setTargetInterests}
              placeholder="Choose target user interests..."
            />

            <label className='blockField'>
              Assignment mode
              <select>
                <option>Instant join</option>
                <option>Admin approval</option>
                <option>Slot booking</option>
              </select>
            </label>

            <label className='blockField'>
              Payment hold
              <select>
                <option>Instant upon QA approval</option>
                <option>7 days after approval</option>
                <option>14 days after approval</option>
              </select>
            </label>

            <button className='primary full' onClick={handlePublish}>
              {editingTaskId ? 'Update Task ✏️' : 'Publish Task 🚀'}
            </button>
            {editingTaskId && (
              <button className='ghost full' style={{ marginTop: '8px' }} onClick={resetForm}>
                Cancel Editing
              </button>
            )}
          </div>
        </aside>
      </div>

      {/* Task Catalog CRUD Table */}
      <div className='card' style={{ marginTop: '24px' }}>
        <div className='sectionTitle' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px' }}>Active & Published Tasks Catalog</h2>
            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>
              Manage, edit, search, and monitor all tasks created across DigiTasker platform
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '260px' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text" 
                placeholder="Search title, brand or category..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', paddingLeft: '32px', height: '36px', fontSize: '13px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <button className='ghost' onClick={fetchTasks} title="Refresh Task List" style={{ padding: '8px 12px' }}>
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px' }}>Task Code</th>
                <th style={{ padding: '12px 16px' }}>Title & Brand</th>
                <th style={{ padding: '12px 16px' }}>Category</th>
                <th style={{ padding: '12px 16px' }}>Reward</th>
                <th style={{ padding: '12px 16px' }}>Duration / Slots</th>
                <th style={{ padding: '12px 16px' }}>Home Showcase</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {taskList
                .filter(t => {
                  const matchSearch = !searchQuery || 
                    t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    t.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    t.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    t.campaign?.toLowerCase().includes(searchQuery.toLowerCase());
                  
                  const selLower = selectedCampaign.toLowerCase().trim();
                  const matchCampaign = selectedCampaign === 'All Campaigns' || 
                    (t.campaign && t.campaign.toLowerCase() === selLower) ||
                    (t.brand && t.brand.toLowerCase() === selLower) ||
                    (t.campaign && t.campaign.toLowerCase().includes(selLower)) ||
                    (t.brand && t.brand.toLowerCase().includes(selLower)) ||
                    t.title?.toLowerCase().includes(selLower) ||
                    (selLower.includes('samsung') && (t.brand?.toLowerCase() === 'samsung' || t.category === 'Mystery Audit' || t.category === 'Field Audit')) ||
                    (selLower.includes('social') && (t.category === 'Social Media' || t.title?.toLowerCase().includes('social'))) ||
                    (selLower.includes('e-commerce') && (t.category === 'E-commerce' || t.title?.toLowerCase().includes('ecommerce'))) ||
                    (selLower.includes('google') && (t.category === 'Google Rating & Review' || t.title?.toLowerCase().includes('google'))) ||
                    (selLower.includes('imdb') && (t.category === 'IMDb & Entertainment'));

                  return matchSearch && matchCampaign;
                })
                .map(t => (
                  <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '600', color: '#0066ff' }}>{t.task_code || `TSK-${t.id}`}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: '600', color: '#1e293b' }}>{t.title}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Brand: {t.brand}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className='badge purple' style={{ fontSize: '12px' }}>{t.category}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: '700', color: '#10b981' }}>
                      ₹{t.reward}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>
                      <div>{t.duration}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{t.slots} slots</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        style={{
                          padding: '6px 12px',
                          borderRadius: '20px',
                          border: t.is_featured ? '1px solid #10b981' : '1px solid #cbd5e1',
                          background: t.is_featured ? '#ecfdf5' : '#f8fafc',
                          color: t.is_featured ? '#059669' : '#64748b',
                          fontWeight: 700,
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s'
                        }}
                        onClick={() => handleToggleFeatured(t)}
                        title={t.is_featured ? "Click to remove from Homepage" : "Click to feature on Homepage"}
                      >
                        <Star size={13} style={{ fill: t.is_featured ? '#10b981' : 'none', color: t.is_featured ? '#10b981' : '#94a3b8' }} />
                        {t.is_featured ? 'Showcased ⭐' : 'Show on Home'}
                      </button>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`statusPill ${t.status === 'Active' ? 'green' : 'gray'}`} style={{ fontSize: '12px' }}>
                        {t.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button className='iconBtn' onClick={() => handleEditTask(t)} title="Edit Task">
                          <Edit size={16} style={{ color: '#0066ff' }} />
                        </button>
                        <button className='iconBtn' onClick={() => handleDeleteTask(t.id, t.title)} title="Delete Task">
                          <Trash2 size={16} style={{ color: '#ef4444' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
