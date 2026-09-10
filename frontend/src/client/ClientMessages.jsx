import React, { useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import { Card, Badge, Stat } from '../components/ui';
import { 
  MessageSquare, Send, CheckCircle2, Clock3, Search, 
  User, Plus
} from 'lucide-react';
import { showSuccess, showToast, showPrompt } from '../utils/swal';

export default function ClientMessages() {
  const [conversations, setConversations] = useState(() => {
    const cached = localStorage.getItem('digitasker_custom_client_messages');
    return cached ? JSON.parse(cached) : [];
  });
  const [activeConvId, setActiveConvId] = useState(() => {
    const cached = localStorage.getItem('digitasker_custom_client_messages');
    const parsed = cached ? JSON.parse(cached) : [];
    return parsed.length > 0 ? parsed[0].id : '';
  });
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const activeConv = conversations.find(c => c.id === activeConvId) || conversations[0];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeConv) return;

    const newMsg = { sender: 'You', text: replyText.trim(), time: 'Just now' };

    const updated = conversations.map(c => {
      if (c.id === activeConv.id) {
        return {
          ...c,
          lastMessage: replyText.trim(),
          time: 'Just now',
          unread: 0,
          messages: [...(c.messages || []), newMsg]
        };
      }
      return c;
    });

    setConversations(updated);
    localStorage.setItem('digitasker_custom_client_messages', JSON.stringify(updated));
    setReplyText('');
    showToast('Message sent successfully.', 'success');
  };

  const handleStartNewConversation = async () => {
    const subject = await showPrompt('New Support Query', 'Enter conversation subject or department (e.g. Field Operations, QC Lead, Billing):', 'Operations Support');
    if (!subject) return;
    const initialText = await showPrompt('Initial Message', 'Enter your query detail:', '');
    if (!initialText) return;

    const newConv = {
      id: `CONV-${Date.now()}`,
      name: subject,
      role: 'InsightLoop Operations',
      lastMessage: initialText,
      time: 'Just now',
      unread: 0,
      messages: [
        { sender: 'You', text: initialText, time: 'Just now' }
      ]
    };
    const updated = [newConv, ...conversations];
    setConversations(updated);
    setActiveConvId(newConv.id);
    localStorage.setItem('digitasker_custom_client_messages', JSON.stringify(updated));
    showSuccess('Conversation Started', 'Your message has been sent to the operations team.');
  };

  const filteredConvs = conversations.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.lastMessage && c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <AppLayout role="client" title="Messages & Communications">
      <div className="statsGrid four">
        <Stat label="Active conversations" value={conversations.length.toString()} icon={<MessageSquare size={20}/>} />
        <Stat label="Unread messages" value={conversations.reduce((acc, c) => acc + (c.unread || 0), 0).toString()} icon={<Clock3 size={20}/>} />
        <Stat label="Avg. ops response time" value={conversations.length > 0 ? "14 mins" : "--"} icon={<CheckCircle2 size={20}/>} />
        <Stat label="Dedicated account manager" value="Operations Team" icon={<User size={20}/>} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Left Side Conversations List */}
        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            <div className="searchBox" style={{ flex: 1 }}>
              <Search size={16} />
              <input 
                placeholder="Search messages..." 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
              />
            </div>
            <button className="primary" onClick={handleStartNewConversation} style={{ height: '38px', width: '38px', padding: 0, display: 'grid', placeItems: 'center' }} title="New Message">
              <Plus size={18} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredConvs.length === 0 ? (
              <div style={{ padding: '20px 10px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                No active conversations.
                <button className="ghostDark" onClick={handleStartNewConversation} style={{ marginTop: '10px', width: '100%', fontSize: '12px' }}>
                  <Plus size={14} /> New Query
                </button>
              </div>
            ) : (
              filteredConvs.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => setActiveConvId(c.id)}
                  style={{ 
                    padding: '12px', 
                    borderRadius: '10px', 
                    background: c.id === (activeConv && activeConv.id) ? '#eff6ff' : '#f8fafc',
                    border: `1px solid ${c.id === (activeConv && activeConv.id) ? '#bfdbfe' : '#e2e8f0'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <b style={{ fontSize: '13px', color: '#0f172a' }}>{c.name}</b>
                    <small style={{ fontSize: '11px', color: '#64748b' }}>{c.time}</small>
                  </div>
                  <span style={{ fontSize: '11px', color: '#0066ff', fontWeight: 600, display: 'block', marginBottom: '4px' }}>{c.role}</span>
                  <p style={{ margin: 0, fontSize: '12px', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.lastMessage}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Right Side Chat Window */}
        <Card style={{ padding: '20px', display: 'flex', flexDirection: 'column', minHeight: '520px' }}>
          {!activeConv ? (
            <div style={{ flex: 1, display: 'grid', placeItems: 'center', textAlign: 'center', padding: '40px' }}>
              <div>
                <MessageSquare size={44} style={{ color: '#94a3b8', marginBottom: '12px' }} />
                <h3 style={{ margin: '0 0 6px', color: '#0f172a', fontSize: '16px' }}>No Active Conversation</h3>
                <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: '13px', maxWidth: '320px' }}>
                  Start a new query to communicate directly with our operations, quality control, or support team.
                </p>
                <button className="primary" onClick={handleStartNewConversation}>
                  <Plus size={16} /> Start Conversation
                </button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ paddingBottom: '14px', borderBottom: '1px solid #e2e8f0', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>{activeConv.name}</h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{activeConv.role}</span>
                </div>
                <Badge tone="green">Active</Badge>
              </div>

              {/* Message Thread */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                {(activeConv.messages || []).map((m, idx) => {
                  const isMe = m.sender === 'You';
                  return (
                    <div 
                      key={idx} 
                      style={{ 
                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                        maxWidth: '75%',
                        background: isMe ? '#0066ff' : '#f1f5f9',
                        color: isMe ? '#ffffff' : '#0f172a',
                        padding: '10px 14px',
                        borderRadius: isMe ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                        fontSize: '13px'
                      }}
                    >
                      <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '2px', fontWeight: 600 }}>{m.sender}</div>
                      <div>{m.text}</div>
                      <div style={{ fontSize: '10px', opacity: 0.7, textAlign: 'right', marginTop: '4px' }}>{m.time}</div>
                    </div>
                  );
                })}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                <input 
                  type="text" 
                  placeholder="Type your message or query..." 
                  value={replyText} 
                  onChange={e => setReplyText(e.target.value)} 
                  style={{ flex: 1, height: '40px', padding: '0 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px' }}
                />
                <button className="primary" type="submit" style={{ height: '40px', padding: '0 18px' }}>
                  <Send size={15} /> Send
                </button>
              </form>
            </>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
