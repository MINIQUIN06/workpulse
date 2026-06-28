import { useState } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Brain, Sparkles } from 'lucide-react';
import { useMounted, fadeUp, fadeIn } from '../../hooks/useAnimation';

const ROLES = ['Senior Developer', 'Tech Lead', 'Project Manager',
  'Data Scientist', 'DevOps Engineer', 'UX Designer'];

export default function EmployeeAnalysis() {
  const { user } = useAuth();
  const [targetRole, setTargetRole] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const mounted = useMounted();

  const handleAnalyze = async () => {
    if (!targetRole) { toast.error('Please select a target role'); return; }
    if (!user?.employeeId) { toast.error('Your profile is not linked. Contact admin.'); return; }
    setLoading(true);
    setAnalysis('');
    try {
      const res = await axios.post('/ai/skill-gap', {
        employeeId: user.employeeId,
        targetRole
      });
      setAnalysis(String(res.data.analysis));
      toast.success('Analysis complete!');
    } catch { toast.error('AI analysis failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={fadeIn(mounted)}>
      <div className="mb-8" style={fadeUp(mounted, 100)}>
        <h1 className="text-3xl font-bold text-white">My Skill Analysis</h1>
        <p className="text-slate-400 mt-1">Get AI-powered career growth recommendations</p>
      </div>

      <div className="grid grid-cols-2 gap-6" style={fadeUp(mounted, 200)}>
        <div className="space-y-5">
          <div className="rounded-2xl p-6 border border-slate-800" style={{ background: '#111827' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(16,185,129,0.1)' }}>
                <Sparkles size={16} className="text-emerald-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Analyze My Skills</h2>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium text-slate-400 mb-1 block">Where do you want to go?</label>
              <select value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                className="w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-white border border-slate-700"
                style={{ background: '#0d1426' }}>
                <option value="">Select your dream role...</option>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>

            <button onClick={handleAnalyze} disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition disabled:opacity-50"
              style={{ background: '#10b981' }}>
              <Brain size={18} />
              {loading ? 'AI is analyzing...' : 'Analyze My Skill Gap'}
            </button>

            <div className="mt-6 p-4 rounded-xl border border-emerald-500 border-opacity-20"
              style={{ background: 'rgba(16,185,129,0.05)' }}>
              <p className="text-sm text-emerald-400 font-medium mb-2">How it works:</p>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>1. Select your dream role</li>
                <li>2. AI analyzes your current skills</li>
                <li>3. Get personalized recommendations</li>
                <li>4. Follow the learning roadmap</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          {!analysis && !loading && (
            <div className="rounded-2xl p-8 border border-slate-800 h-full flex flex-col items-center justify-center text-center"
              style={{ background: '#111827' }}>
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"style={{ background: 'rgba(16,185,129,0.1)' }}>
                <Brain size={36} className="text-emerald-400 opacity-50" />
              </div>
              <h3 className="text-lg font-bold text-slate-500">Your AI Analysis</h3>
              <p className="text-slate-600 text-sm mt-2">
                Select your target role and click Analyze
              </p>
            </div>
          )}

          {loading && (
            <div className="rounded-2xl p-8 border border-slate-800 h-full flex flex-col items-center justify-center"
              style={{ background: '#111827' }}>
              <div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mb-6"></div>
              <p className="font-bold text-white text-lg">Analyzing your skills...</p>
              <p className="text-slate-500 text-sm mt-2">AI is building your roadmap</p>
            </div>
          )}

          {analysis && (
            <div className="rounded-2xl p-6 border border-slate-800" style={{ background: '#111827' }}>
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-800">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: '#10b981' }}>
                  <Brain size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Your Personalized Analysis</h3>
                  <p className="text-xs text-slate-500">Powered by LLaMA AI</p>
                </div>
              </div>
              <div className="rounded-xl p-4 max-h-96 overflow-y-auto border border-slate-800"
                style={{ background: '#0d1426' }}>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {analysis}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}