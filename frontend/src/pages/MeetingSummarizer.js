import { useState } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { FileText, Sparkles, Copy, Trash2, Clock, Users, CheckSquare, Brain } from 'lucide-react';

export default function MeetingSummarizer() {
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingText, setMeetingText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const handleSummarize = async () => {
    if (!meetingText.trim()) {
      toast.error('Please paste your meeting notes first');
      return;
    }
    if (meetingText.length < 50) {
      toast.error('Meeting notes are too short');
      return;
    }
    setLoading(true);
    setSummary('');
    try {
      const res = await axios.post('/ai/summarize-meeting', {
        meetingTitle: meetingTitle || 'Team Meeting',
        meetingText
      });
      const result = res.data.summary;
      setSummary(result);
      setHistory(prev => [{
        title: meetingTitle || 'Team Meeting',
        date: new Date().toLocaleDateString(),
        summary: result
      }, ...prev.slice(0, 4)]);
      toast.success('Meeting summarized!');
    } catch {
      toast.error('AI summarization failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    toast.success('Copied to clipboard!');
  };

  const handleClear = () => {
    setMeetingTitle('');
    setMeetingText('');
    setSummary('');
  };

  const exampleMeeting = `Date: June 22, 2026
Attendees: Sarah (HR), John (Engineering Lead), Priya (Developer), Rahul (Designer)

Sarah: Good morning everyone. Today we need to discuss the new product launch and team assignments.

John: We need to hire 2 more React developers by end of month. The current team is overloaded.

Priya: I can handle the frontend but I need training on TypeScript. Can we arrange that?

Sarah: Sure, I will look into TypeScript training courses this week.

Rahul: The design system needs to be updated. I will complete the new UI components by June 15.

John: We also decided to migrate from REST to GraphQL. Rahul and Priya please start learning GraphQL basics.

Sarah: Action items - I will post job listings for React developers, arrange TypeScript training for Priya, and schedule next meeting for June 25.`;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">AI Meeting Summarizer</h1>
        <p className="text-slate-400 mt-1">Paste meeting notes and AI extracts key insights instantly</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-5">
          <div className="rounded-2xl p-6 border border-slate-800" style={{ background: '#111827' }}>
            <h2 className="text-base font-bold text-white mb-4">Meeting Details</h2>

            <div className="mb-4">
              <label className="text-sm font-medium text-slate-400 mb-1 block">Meeting Title</label>
              <input
                value={meetingTitle}
                onChange={e => setMeetingTitle(e.target.value)}
                placeholder="e.g. Weekly Sprint Review"
                className="w-full rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white placeholder-slate-600 border border-slate-700"
                style={{ background: '#0d1426' }}
              />
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-slate-400">Meeting Notes</label>
                <button
                  onClick={() => setMeetingText(exampleMeeting)}className="text-xs text-amber-400 hover:underline">
                  Use Example
                </button>
              </div>
              <textarea
                value={meetingText}
                onChange={e => setMeetingText(e.target.value)}
                rows={12}
                placeholder="Paste your meeting notes or transcript here..."
                className="w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white placeholder-slate-600 border border-slate-700 resize-none text-sm"
                style={{ background: '#0d1426' }}
              />
              <p className="text-xs text-slate-600 mt-1">{meetingText.length} characters</p>
            </div>

            <div className="flex gap-3">
              <button onClick={handleClear}
                className="flex items-center gap-2 border border-slate-700 text-slate-400 px-4 py-2.5 rounded-xl hover:bg-slate-800 text-sm font-medium transition">
                <Trash2 size={16} />
                Clear
              </button>
              <button onClick={handleSummarize} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 text-white py-2.5 rounded-xl font-semibold disabled:opacity-50 transition"
                style={{ background: '#f59e0b' }}>
                <Sparkles size={18} />
                {loading ? 'AI is analyzing...' : 'Summarize Meeting'}
              </button>
            </div>
          </div>

          {history.length > 0 && (
            <div className="rounded-2xl p-6 border border-slate-800" style={{ background: '#111827' }}>
              <h2 className="text-base font-bold text-white mb-4">Recent Summaries</h2>
              <div className="space-y-3">
                {history.map((item, i) => (
                  <div key={i}
                    onClick={() => setSummary(item.summary)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-800 cursor-pointer hover:border-amber-500 hover:border-opacity-50 transition"
                    style={{ background: '#0d1426' }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ background: 'rgba(245,158,11,0.1)' }}>
                      <FileText size={16} className="text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <p className="text-xs text-slate-500">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          {!summary && !loading && (
            <div className="rounded-2xl p-8 border border-slate-800 h-full flex flex-col items-center justify-center text-center"
              style={{ background: '#111827' }}>
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(245,158,11,0.1)' }}>
                <FileText size={36} className="text-amber-400 opacity-50" />
              </div>
              <h3 className="text-lg font-bold text-slate-500">AI Summary</h3>
              <p className="text-slate-600 text-sm mt-2 max-w-xs">
                Paste your meeting notes and click Summarize to get instant AI insights
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 w-full max-w-xs">
                {[
                  { icon: CheckSquare, label: 'Action Items', color: 'text-green-400' },
                  { icon: Brain, label: 'Skill Needs', color: 'text-purple-400' },
                  { icon: Users, label: 'Assignments', color: 'text-blue-400' },{ icon: Clock, label: 'Deadlines', color: 'text-amber-400' },
                ].map((item, i) => (
                  <div key={i}
                    className="flex items-center gap-2 p-3 rounded-xl border border-slate-800"
                    style={{ background: '#0d1426' }}>
                    <item.icon size={16} className={item.color} />
                    <span className="text-xs text-slate-500 font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="rounded-2xl p-8 border border-slate-800 h-full flex flex-col items-center justify-center"
              style={{ background: '#111827' }}>
              <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-6"></div>
              <p className="font-bold text-white text-lg">Analyzing meeting...</p>
              <p className="text-slate-500 text-sm mt-2">AI is extracting key insights</p>
            </div>
          )}

          {summary && (
            <div className="rounded-2xl p-6 border border-slate-800"
              style={{ background: '#111827' }}>
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: '#f59e0b' }}>
                    <Sparkles size={18} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Meeting Summary</h3>
                    <p className="text-xs text-slate-500">Powered by LLaMA AI</p>
                  </div>
                </div>
                <button onClick={handleCopy}
                  className="flex items-center gap-1.5 text-sm text-amber-400 hover:bg-amber-400 hover:bg-opacity-10 px-3 py-1.5 rounded-lg transition">
                  <Copy size={14} />
                  Copy
                </button>
              </div>
              <div className="rounded-xl p-4 max-h-96 overflow-y-auto border border-slate-800"
                style={{ background: '#0d1426' }}>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {summary}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}