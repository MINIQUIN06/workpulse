import { useEffect, useState } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { Layers, Brain, Users, Sparkles, X } from 'lucide-react';
import { useMounted, fadeUp, fadeIn } from '../hooks/useAnimation';

const SKILL_OPTIONS = [
  'React', 'Node.js', 'Python', 'MongoDB', 'SQL',
  'Machine Learning', 'UI/UX Design', 'DevOps',
  'Java', 'AWS', 'Docker', 'TypeScript'
];

export default function TeamBuilder() {
  const [projectDesc, setProjectDesc] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const mounted = useMounted(); 

  useEffect(() => {
    axios.get('/employees').then(res => setEmployees(res.data));
  }, []);

  const toggleSkill = (skill) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleSuggest = async () => {
    if (!projectDesc) {
      toast.error('Please describe your project');
      return;
    }
    if (selectedSkills.length === 0) {
      toast.error('Please select at least one required skill');
      return;
    }
    setLoading(true);
    setSuggestion('');
    try {
      const res = await axios.post('/ai/suggest-team', {
        projectDescription: projectDesc,
        requiredSkills: selectedSkills.join(', ')
      });
      setSuggestion(res.data.suggestion);
    } catch {
      toast.error('AI suggestion failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={fadeIn(mounted)}>
      <div className="mb-8" style={fadeUp(mounted, 100)}>
        <h1 className="text-3xl font-bold text-white">AI Team Builder</h1>
        <p className="text-slate-400 mt-1">Describe your project and AI will suggest the perfect team</p>
      </div>

      <div className="grid grid-cols-2 gap-6" style={fadeUp(mounted, 200)}>
        <div className="space-y-5">
          <div className="rounded-2xl p-6 border border-slate-800" style={{ background: '#111827' }}>
            <h2 className="text-base font-bold text-white mb-3">Project Description</h2>
            <textarea
              value={projectDesc}
              onChange={e => setProjectDesc(e.target.value)}
              rows={4}
              placeholder="e.g. Build an e-commerce website with payment integration..."
              className="w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white placeholder-slate-600 border border-slate-700 resize-none text-sm"
              style={{ background: '#0d1426' }}
            />
          </div>

          <div className="rounded-2xl p-6 border border-slate-800" style={{ background: '#111827' }}>
            <h2 className="text-base font-bold text-white mb-3">
              Required Skills
              {selectedSkills.length > 0 && (
                <span className="ml-2 text-xs bg-amber-400 bg-opacity-10 text-amber-400 px-2 py-0.5 rounded-full">
                  {selectedSkills.length} selected
                </span>
              )}
            </h2>
            <div className="flex flex-wrap gap-2">
              {SKILL_OPTIONS.map(skill => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition border ${
                    selectedSkills.includes(skill)
                      ? 'text-white border-amber-500'
                      : 'text-slate-400 border-slate-700 hover:border-amber-500 hover:text-amber-400'
                  }`}
                  style={selectedSkills.includes(skill) ? { background: '#f59e0b' } : { background: '#0d1426' }}>
                  {skill}
                </button>
              ))}
            </div>

            {selectedSkills.length > 0 && (<div className="mt-4 p-3 rounded-xl border border-amber-500 border-opacity-20"
                style={{ background: 'rgba(245,158,11,0.05)' }}>
                <p className="text-xs text-amber-400 font-medium mb-2">Selected:</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSkills.map(skill => (
                    <span key={skill}
                      className="flex items-center gap-1 text-xs text-white px-2 py-1 rounded-lg"
                      style={{ background: '#f59e0b' }}>
                      {skill}
                      <button onClick={() => toggleSkill(skill)}>
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl p-6 border border-slate-800" style={{ background: '#111827' }}>
            <div className="flex items-center gap-2 mb-4">
              <Users size={18} className="text-amber-400" />
              <h2 className="text-base font-bold text-white">
                Available Team ({employees.length})
              </h2>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {employees.map((emp, index) => (
                <div key={emp._id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-800 hover:border-slate-700 transition"
                  style={{ background: '#0d1426' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: ['#f59e0b', '#6366f1', '#10b981', '#ef4444', '#8b5cf6'][index % 5] }}>
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{emp.name}</p>
                      <p className="text-xs text-slate-500">{emp.role}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-amber-400 bg-opacity-10 text-amber-400 px-2 py-1 rounded-lg font-medium">
                    {emp.skills?.length || 0} skills
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleSuggest}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-white transition disabled:opacity-50"
            style={{ background: '#f59e0b' }}>
            <Sparkles size={18} />
            {loading ? 'AI is building your team...' : 'Suggest Best Team'}
          </button>
        </div>

        <div>
          {!suggestion && !loading && (
            <div className="rounded-2xl p-8 border border-slate-800 h-full flex flex-col items-center justify-center text-center"
              style={{ background: '#111827' }}>
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(245,158,11,0.1)' }}>
                <Layers size={36} className="text-amber-400 opacity-50" />
              </div>
              <h3 className="text-lg font-bold text-slate-500">AI Team Suggestion</h3>
              <p className="text-slate-600 text-sm mt-2 max-w-xs">
                Describe your project and select required skills then click Suggest Best Team
              </p>
            </div>
          )}

          {loading && (
            <div className="rounded-2xl p-8 border border-slate-800 h-full flex flex-col items-center justify-center"
              style={{ background: '#111827' }}><div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-6"></div>
              <p className="font-bold text-white text-lg">Building your team...</p>
              <p className="text-slate-500 text-sm mt-2">AI is analyzing employee skills</p>
            </div>
          )}

          {suggestion && (
            <div className="rounded-2xl p-6 border border-slate-800 h-full"
              style={{ background: '#111827' }}>
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-800">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: '#f59e0b' }}>
                  <Brain size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">AI Team Recommendation</h3>
                  <p className="text-xs text-slate-500">Powered by LLaMA AI</p>
                </div>
                <button onClick={() => setSuggestion('')}
                  className="ml-auto p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition">
                  <X size={16} />
                </button>
              </div>
              <div className="rounded-xl p-4 max-h-96 overflow-y-auto border border-slate-800"
                style={{ background: '#0d1426' }}>
                <pre className="whitespace-pre-wrap text-sm text-slate-300 font-sans leading-relaxed">
                  {suggestion}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}