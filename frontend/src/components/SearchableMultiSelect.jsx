import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Check, ChevronDown } from 'lucide-react';

export default function SearchableMultiSelect({ 
  options = [], 
  value = [], 
  onChange, 
  placeholder = "Select options...",
  label = "",
  allowCustom = false,
  customPlaceholder = "Add custom value & press Enter"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Ensure value is an array
  const selectedValues = Array.isArray(value) ? value : (value ? [value] : []);

  const filteredOptions = options.filter(opt => {
    const text = typeof opt === 'string' ? opt : opt.label || opt.value;
    return text.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleToggleOption = (optValue) => {
    let newValues;
    if (optValue.toString().startsWith('All')) {
      newValues = [optValue];
    } else {
      // Remove any 'All' variant when selecting a specific option
      const filtered = selectedValues.filter(v => !v.toString().startsWith('All'));
      if (filtered.includes(optValue)) {
        newValues = filtered.filter(v => v !== optValue);
        if (newValues.length === 0) newValues = ['All'];
      } else {
        newValues = [...filtered, optValue];
      }
    }
    onChange(newValues);
  };

  const handleRemoveChip = (e, valToRemove) => {
    e.stopPropagation();
    const updated = selectedValues.filter(v => v !== valToRemove);
    onChange(updated.length > 0 ? updated : ['All']);
  };

  const handleAddCustom = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      e.preventDefault();
      const newCustomVal = searchTerm.trim();
      if (!selectedValues.includes(newCustomVal)) {
        const filtered = selectedValues.filter(v => !v.toString().startsWith('All'));
        onChange([...filtered, newCustomVal]);
      }
      setSearchTerm('');
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', marginBottom: '14px' }} ref={dropdownRef}>
      {label && (
        <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', color: '#334155', marginBottom: '6px' }}>
          {label}
        </label>
      )}

      {/* Select Box Header */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          minHeight: '42px',
          padding: '6px 12px',
          border: isOpen ? '1.5px solid #0066ff' : '1px solid #cbd5e1',
          borderRadius: '8px',
          background: '#ffffff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '6px',
          boxShadow: isOpen ? '0 0 0 3px rgba(0,102,255,0.1)' : 'none',
          transition: 'all 0.15s ease'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', flex: 1 }}>
          {selectedValues.length === 0 ? (
            <span style={{ color: '#94a3b8', fontSize: '13px' }}>{placeholder}</span>
          ) : (
            selectedValues.map(val => (
              <span 
                key={val}
                style={{
                  background: '#eff6ff',
                  color: '#0066ff',
                  border: '1px solid #bfdbfe',
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                {val}
                <X 
                  size={13} 
                  style={{ cursor: 'pointer', opacity: 0.7 }}
                  onClick={(e) => handleRemoveChip(e, val)}
                />
              </span>
            ))
          )}
        </div>
        <ChevronDown size={16} color="#64748b" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '10px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
          zIndex: 1000,
          maxHeight: '260px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Search Bar Input */}
          <div style={{ padding: '8px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={15} color="#94a3b8" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={allowCustom ? handleAddCustom : undefined}
              placeholder={allowCustom ? customPlaceholder : "Type to auto-search..."}
              autoFocus
              style={{
                width: '100%',
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '13px',
                color: '#0f172a'
              }}
            />
            {searchTerm && (
              <X size={14} color="#94a3b8" style={{ cursor: 'pointer' }} onClick={() => setSearchTerm('')} />
            )}
          </div>

          {/* Options List */}
          <div style={{ overflowY: 'auto', flex: 1, padding: '4px 0' }}>
            {filteredOptions.length === 0 ? (
              <div style={{ padding: '12px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                {allowCustom ? 'Press Enter to add custom value' : 'No matching options found'}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const optVal = typeof opt === 'string' ? opt : opt.value;
                const optLabel = typeof opt === 'string' ? opt : opt.label;
                const isSelected = selectedValues.includes(optVal);

                return (
                  <div
                    key={optVal}
                    onClick={() => handleToggleOption(optVal)}
                    style={{
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      fontSize: '13px',
                      background: isSelected ? '#f0f9ff' : 'transparent',
                      color: isSelected ? '#0066ff' : '#334155',
                      fontWeight: isSelected ? 600 : 400,
                      transition: 'background 0.1s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = isSelected ? '#e0f2fe' : '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = isSelected ? '#f0f9ff' : 'transparent'}
                  >
                    <span>{optLabel}</span>
                    {isSelected && <Check size={16} color="#0066ff" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
