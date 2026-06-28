import { useState, useRef, useEffect } from 'react';
import axios from '../api/axios';
import { MessageCircle, X, Send, Bot, User, Loader } from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  "How many employees are present today?",
  "Who has pending leave requests?",
  "What tasks are overdue?",
  "How many employees are in Engineering?",
  "Which tasks are awaiting my approval?",
  "What projects are currently active?"
];

export default function HRChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your AI HR Assistant. I have access to real-time employee, attendance, leave, task and project data. How can I help you today?",
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const sendMessage = async (text) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    const userMessage = {
      role: 'user',
      content: messageText,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('/hr-chat', { message: messageText });
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data.reply,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I am having trouble connecting right now. Please try again.',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        error: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: "Hi! I'm your AI HR Assistant. I have access to real-time employee, attendance, leave, task and project data. How can I help you today?",
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      {open && (
        <div className="mb-4 w-96 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col"
          style={{ background: '#0d1426', height: '520px' }}>

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-800"
            style={{ background: '#111827' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: '#f59e0b' }}>
                <Bot size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">AI HR Assistant</h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-emerald-400">Online — Real-time data</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={clearChat}
                className="text-xs text-slate-500 hover:text-slate-300 transition px-2 py-1 rounded-lg hover:bg-slate-800">
                Clear
              </button>
              <button onClick={() => setOpen(false)}
                className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center ${
                  msg.role === 'user' ? 'bg-amber-500' : 'bg-slate-700'
                }`}>
                  {msg.role === 'user'
                    ? <User size={14} className="text-white" />
                    : <Bot size={14} className="text-amber-400" />
                  }
                </div>
                <div className={`flex flex-col max-w-xs ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'text-white rounded-tr-sm'
                      : msg.error
                        ? 'bg-red-400 bg-opacity-10 text-red-400 rounded-tl-sm'
                        : 'text-slate-200 rounded-tl-sm border border-slate-700'
                  }`}
                    style={msg.role === 'user' ? { background: '#f59e0b' } : msg.error ? {} : { background: '#111827' }}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <span className="text-xs text-slate-600 mt-1 px-1">{msg.time}</span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-700 flex-shrink-0 flex items-center justify-center">
                  <Bot size={14} className="text-amber-400" />
                </div>
                <div className="rounded-2xl rounded-tl-sm px-4 py-3 border border-slate-700"
                  style={{ background: '#111827' }}>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length === 1 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-slate-500 mb-2">Suggested questions:</p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_QUESTIONS.slice(0, 4).map((q, i) => (
                  <button key={i}
                    onClick={() => sendMessage(q)}
                    className="text-xs text-amber-400 border border-amber-400 border-opacity-30 px-2.5 py-1 rounded-full hover:bg-amber-400 hover:bg-opacity-10 transition">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-slate-800">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about your team..."
                rows={1}
                className="flex-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 text-white placeholder-slate-600 border border-slate-700 resize-none"
                style={{ background: '#111827' }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="w-10 h-10 flex items-center justify-center rounded-xl text-white transition disabled:opacity-40 flex-shrink-0"
                style={{ background: '#f59e0b' }}>
                {loading ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
            <p className="text-xs text-slate-600 mt-2 text-center">Press Enter to send</p>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition hover:scale-105 active:scale-95 ml-auto"
        style={{ background: '#f59e0b' }}>
        {open
          ? <X size={22} className="text-white" />
          : <MessageCircle size={22} className="text-white" />
        }
      </button>
    </div>
  );
}