import React, { useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import { Plus, GripVertical, Copy, Trash2, Type, CheckSquare, Star, SlidersHorizontal, Image, Upload, GitBranch } from 'lucide-react';
import { showSuccess, showToast, showRichModal } from '../utils/swal';
import { useNavigate } from 'react-router-dom';

const initialQs = [
  { q: 'Did the employee greet you within 30 seconds?', type: 'Single Choice', opts: ['Yes', 'No'] },
  { q: 'Rate staff product knowledge', type: 'Rating', opts: ['1', '2', '3', '4', '5'] },
  { q: 'Which product categories were visibly displayed?', type: 'Multiple Choice', opts: ['Smartphones', 'TVs', 'Appliances', 'Accessories'] },
  { q: 'Describe your overall experience', type: 'Long Text', opts: [] }
];

export default function SurveyBuilder() {
  const navigate = useNavigate();
  const [qs, setQs] = useState(initialQs);

  const handleAddQuestion = (type = 'Single Choice') => {
    const newQ = {
      q: `New ${type} question prompt...`,
      type,
      opts: type === 'Rating' ? ['1', '2', '3', '4', '5'] : type === 'Long Text' ? [] : ['Option A', 'Option B']
    };
    setQs([...qs, newQ]);
    showToast(`Added new ${type} question`);
  };

  const handleDuplicate = (idx) => {
    const item = qs[idx];
    const dup = { ...item, q: `${item.q} (Copy)` };
    const updated = [...qs];
    updated.splice(idx + 1, 0, dup);
    setQs(updated);
    showToast('Question duplicated');
  };

  const handleDelete = (idx) => {
    setQs(qs.filter((_, i) => i !== idx));
    showToast('Question removed');
  };

  const handlePreview = () => {
    const html = `<div style="text-align:left;max-height:400px;overflow:auto">
      ${qs.map((x, i) => `
        <div style="margin-bottom:14px;padding:10px;background:#f8fafc;border-radius:8px">
          <b>Q${i + 1}: ${x.q}</b> <span style="font-size:11px;color:#64748b">(${x.type})</span>
          ${x.opts.length > 0 ? `<ul style="margin:4px 0 0 18px">${x.opts.map(o => `<li>${o}</li>`).join('')}</ul>` : '<p style="margin:4px 0 0;font-style:italic">Open text response</p>'}
        </div>
      `).join('')}
    </div>`;

    showRichModal('Survey Live Preview', html);
  };

  const handleSave = () => {
    showSuccess(
      'Survey Questionnaire Saved! 📝',
      `${qs.length} questions attached to current campaign task.`
    );
    navigate('/admin/tasks');
  };

  return (
    <AppLayout role='admin' title='Survey Builder'>
      <div className='surveyLayout'>
        {/* Question Types Toolbox */}
        <aside className='card toolbox'>
          <h3>Question types</h3>
          {[
            [Type, 'Short text'],
            [CheckSquare, 'Choice'],
            [Star, 'Rating'],
            [SlidersHorizontal, 'NPS / Scale'],
            [Image, 'Image upload'],
            [Upload, 'File upload'],
            [GitBranch, 'Conditional logic']
          ].map(([I, n]) => (
            <button key={n} type="button" onClick={() => handleAddQuestion(n)}>
              <I size={17} />{n}
            </button>
          ))}
        </aside>

        {/* Survey Main Content */}
        <section className='stack'>
          <div className='card'>
            <div className='between'>
              <div>
                <span className='eyebrow'>AUDIT QUESTIONNAIRE</span>
                <h2>Retail Experience Audit</h2>
                <p className='muted'>{qs.length} questions · Estimated time 8 minutes</p>
              </div>
              <button className='ghost' onClick={handlePreview}>
                Preview Survey
              </button>
            </div>
          </div>

          {qs.map((x, i) => (
            <div className='card questionCard' key={i}>
              <div className='questionTop'>
                <GripVertical />
                <span className='qNo'>{i + 1}</span>
                <div className='grow'>
                  <input 
                    className='questionInput' 
                    value={x.q}
                    onChange={(e) => {
                      const copy = [...qs];
                      copy[i].q = e.target.value;
                      setQs(copy);
                    }}
                  />
                  <span className='muted'>{x.type}</span>
                </div>
                <button type="button" className='iconBtn' onClick={() => handleDuplicate(i)} title="Duplicate">
                  <Copy size={16} />
                </button>
                <button type="button" className='iconBtn' onClick={() => handleDelete(i)} title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>

              {x.opts.length > 0 && (
                <div className='optionGrid'>
                  {x.opts.map(o => (
                    <label key={o}>
                      <input type={x.type === 'Multiple Choice' ? 'checkbox' : 'radio'} name={`q${i}`} />
                      {o}
                    </label>
                  ))}
                </div>
              )}

              <div className='questionFooter'>
                <label>
                  <input type='checkbox' defaultChecked /> Required
                </label>
                <button type="button" className='linkBtn' onClick={() => showToast('Branching logic configured')}>
                  + Add logic
                </button>
              </div>
            </div>
          ))}

          <button type="button" className='addQuestion' onClick={() => handleAddQuestion('Single Choice')}>
            <Plus /> Add another question
          </button>

          <div className='formFooter'>
            <button type="button" className='ghost' onClick={() => showToast('Draft saved.')}>Save Draft</button>
            <button type="button" className='primary' onClick={handleSave}>Save & Attach to Task</button>
          </div>
        </section>

        {/* Settings Panel */}
        <aside className='card settingsPanel'>
          <h3>Survey settings</h3>
          <label className='blockField'>
            Scoring
            <select>
              <option>Weighted scoring</option>
              <option>No scoring</option>
            </select>
          </label>

          <label className='blockField'>
            Passing score
            <input defaultValue='70%' />
          </label>

          <label className='blockField'>
            Allow revision
            <select>
              <option>Yes</option>
              <option>No</option>
            </select>
          </label>

          <label className='blockField'>
            Question randomisation
            <select>
              <option>Disabled</option>
              <option>Enabled</option>
            </select>
          </label>

          <hr />
          <h4>Logic summary</h4>
          <p className='muted'>2 conditional branches configured.</p>
        </aside>
      </div>
    </AppLayout>
  );
}
