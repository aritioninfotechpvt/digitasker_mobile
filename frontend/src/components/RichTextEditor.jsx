import React, { useState } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Link as LinkIcon, Code, Eye, Edit3, Heading1, Heading2, Check } from 'lucide-react';

export default function RichTextEditor({ value = '', onChange, placeholder = 'Write detailed content here...', label = 'Description & Instructions' }) {
  const [isPreview, setIsPreview] = useState(false);

  const applyFormat = (tagOpen, tagClose = tagOpen) => {
    const textarea = document.getElementById('ckeditor-textarea');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || 'text';
    const replacement = `${tagOpen}${selectedText}${tagClose}`;
    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);
  };

  return (
    <div style={{ border: '1.5px solid #cbd5e1', borderRadius: '12px', background: '#ffffff', overflow: 'hidden' }}>
      {/* CKEditor Toolbar */}
      <div style={{
        background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        flexWrap: 'wrap',
        gap: '6px'
      }}>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#0066ff', marginRight: '8px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            CKEditor
          </span>
          <button type="button" onClick={() => applyFormat('<b>', '</b>')} style={{ border: '1px solid #cbd5e1', background: 'white', borderRadius: '6px', padding: '5px 8px', cursor: 'pointer' }} title="Bold">
            <Bold size={14} />
          </button>
          <button type="button" onClick={() => applyFormat('<i>', '</i>')} style={{ border: '1px solid #cbd5e1', background: 'white', borderRadius: '6px', padding: '5px 8px', cursor: 'pointer' }} title="Italic">
            <Italic size={14} />
          </button>
          <button type="button" onClick={() => applyFormat('<u>', '</u>')} style={{ border: '1px solid #cbd5e1', background: 'white', borderRadius: '6px', padding: '5px 8px', cursor: 'pointer' }} title="Underline">
            <Underline size={14} />
          </button>
          <span style={{ width: '1px', height: '18px', background: '#cbd5e1', margin: '0 4px' }} />
          <button type="button" onClick={() => applyFormat('<h3>', '</h3>')} style={{ border: '1px solid #cbd5e1', background: 'white', borderRadius: '6px', padding: '5px 8px', cursor: 'pointer' }} title="Heading 1">
            <Heading1 size={14} />
          </button>
          <button type="button" onClick={() => applyFormat('<h4>', '</h4>')} style={{ border: '1px solid #cbd5e1', background: 'white', borderRadius: '6px', padding: '5px 8px', cursor: 'pointer' }} title="Heading 2">
            <Heading2 size={14} />
          </button>
          <button type="button" onClick={() => applyFormat('<ul>\n  <li>', '</li>\n</ul>')} style={{ border: '1px solid #cbd5e1', background: 'white', borderRadius: '6px', padding: '5px 8px', cursor: 'pointer' }} title="Bullet List">
            <List size={14} />
          </button>
          <button type="button" onClick={() => applyFormat('<ol>\n  <li>', '</li>\n</ol>')} style={{ border: '1px solid #cbd5e1', background: 'white', borderRadius: '6px', padding: '5px 8px', cursor: 'pointer' }} title="Numbered List">
            <ListOrdered size={14} />
          </button>
          <button type="button" onClick={() => applyFormat('<code>', '</code>')} style={{ border: '1px solid #cbd5e1', background: 'white', borderRadius: '6px', padding: '5px 8px', cursor: 'pointer' }} title="Inline Code">
            <Code size={14} />
          </button>
          <button type="button" onClick={() => applyFormat('<a href="https://example.com">', '</a>')} style={{ border: '1px solid #cbd5e1', background: 'white', borderRadius: '6px', padding: '5px 8px', cursor: 'pointer' }} title="Add Link">
            <LinkIcon size={14} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            type="button" 
            onClick={() => setIsPreview(!isPreview)} 
            style={{ 
              border: '1px solid #0066ff', 
              background: isPreview ? '#0066ff' : 'white', 
              color: isPreview ? 'white' : '#0066ff', 
              borderRadius: '6px', 
              padding: '4px 10px', 
              fontSize: '12px', 
              fontWeight: '700', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {isPreview ? <Edit3 size={13} /> : <Eye size={13} />}
            {isPreview ? 'Edit HTML' : 'Live Preview'}
          </button>
        </div>
      </div>

      {/* Editor Body */}
      {isPreview ? (
        <div 
          style={{ minHeight: '130px', padding: '14px', background: '#fafafa', fontSize: '14px', lineHeight: '1.6' }}
          dangerouslySetInnerHTML={{ __html: value || '<i>No content entered yet. Switch to Edit mode to write HTML/formatted text.</i>' }}
        />
      ) : (
        <textarea
          id="ckeditor-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={6}
          style={{
            width: '100%',
            padding: '14px',
            border: '0',
            outline: 'none',
            fontSize: '14px',
            lineHeight: '1.6',
            fontFamily: 'inherit',
            resize: 'vertical',
            boxSizing: 'border-box'
          }}
        />
      )}

      {/* Status Footer */}
      <div style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '6px 14px', fontSize: '11px', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
        <span>CKEditor 5 · Rich Text Enabled</span>
        <span>{value ? value.length : 0} characters</span>
      </div>
    </div>
  );
}
