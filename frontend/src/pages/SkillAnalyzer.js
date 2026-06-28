import { useEffect, useState } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { Brain, Plus, Trash2, Sparkles } from 'lucide-react';
import { useMounted, fadeUp, fadeIn } from '../hooks/useAnimation';

const CATEGORIES = ['technical', 'soft', 'management', 'design', 'other'];
const LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'];
const ROLES = ['Senior Developer', 'Tech Lead', 'Project Manager',
  'Data Scientist', 'DevOps Engineer', 'UX Designer'];

const LEVEL_COLORS = {
  beginner: 'bg-blue-400 bg-opacity-10 text-blue-400',
  intermediate: 'bg-yellow-400 bg-opacity-10 text-yellow-400',
  advanced: 'bg-orange-400 bg-opacity-10 text-orange-400',
  expert: 'bg-red-400 bg-opacity-10 text-red-400',
};

const CATEGORY_COLORS = {
  technical: 'bg-indigo-400 bg-opacity-10 text-indigo-400',
  soft: 'bg-green-400 bg-opacity-10 text-green-400',
  management: 'bg-purple-400 bg-opacity-10 text-purple-400',
  design: 'bg-pink-400 bg-opacity-10 text-pink-400',
  other: 'bg-slate-400 bg-opacity-10 text-slate-400',
};

export default function SkillAnalyzer() {
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [targetProjectId, setTargetProjectId] = useState('');
  const [analysisMode, setAnalysisMode] = useState('role');;
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [employeeSkills, setEmployeeSkills] = useState([]);
  const [skillForm, setSkillForm] = useState({
    name: '', category: 'technical', level: 'beginner'
  })
  const mounted = useMounted();

  useEffect(() => {
    axios.get('/employees').then(res => setEmployees(res.data));
    axios.get('/projects').then(res => setProjects(res.data));
  }, []);


  useEffect(() => {
    if (selectedEmp) {
      axios.get(`/skills/${selectedEmp}`)
        .then(res => setEmployeeSkills(res.data));
    }
  }, [selectedEmp]);

  const handleAnalyze = async () => {
    if (!selectedEmp) {
      toast.error('Please select an employee first');
      return;
    }
    if (analysisMode === 'role' && !targetRole) {
      toast.error('Please select a target role');
      return;
    }
    if (analysisMode === 'project' && !targetProjectId) {
      toast.error('Please select a target project');
      return;
    }
    setLoading(true);
    setAnalysis('');
    try {
      const res = await axios.post('/ai/skill-gap', {
        employeeId: selectedEmp,
        targetRole: analysisMode === 'role' ? targetRole : undefined,
        targetProjectId: analysisMode === 'project' ? targetProjectId : undefined
      });

      setAnalysis(res.data.analysis);
    } catch (err) {
      console.error(err);
      toast.error('Analysis failed');
    }finally{
      setLoading(false);
    }
    };

  const handleAddSkill = async () => {
    if (!skillForm.name) {
      toast.error('Enter skill name');
      return;
    }
    try {
      await axios.post('/skills', { ...skillForm, employee: selectedEmp });
      toast.success('Skill added!');
      setSkillForm({ name: '', category: 'technical', level: 'beginner' });
      setShowAddSkill(false);
      const res = await axios.get(`/skills/${selectedEmp}`);
      setEmployeeSkills(res.data);
    } catch {
      toast.error('Failed to add skill');
    }
  };

  const handleDeleteSkill = async (skillId) => {
    try {
      await axios.delete(`/skills/${skillId}`);
      toast.success('Skill removed');
      const res = await axios.get(`/skills/${selectedEmp}`);
      setEmployeeSkills(res.data);
    } catch {
      toast.error('Failed to delete');
    }
  };

  const selectedEmployee = employees.find(e => e._id === selectedEmp);

  return (
    <div style={fadeIn(mounted)}>
      <div className="mb-8" style={fadeUp(mounted, 100)}>
        <h1 className="text-3xl font-bold text-white">AI Skill Analyzer</h1>
        <p className="text-slate-400 mt-1">Analyze skill gaps and get AI-powered recommendations</p>
      </div>

      <div className="grid grid-cols-2 gap-6" style={fadeUp(mounted, 200)}>
        <div className="space-y-5">
          <div className="rounded-2xl p-6 border border-slate-800" style={{ background: '#111827' }}>
<h2 className="text-base font-bold text-white mb-4">Select Employee</h2>
            <select
              value={selectedEmp}
              onChange={e => setSelectedEmp(e.target.value)}
              className="w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white border border-slate-700"
              style={{ background: '#0d1426' }}>
              <option value="">Choose an employee...</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} — {emp.role}
                </option>
              ))}
            </select>

            {selectedEmployee && (
              <div className="mt-4 p-4 rounded-xl border border-amber-500 border-opacity-30"
                style={{ background: 'rgba(245,158,11,0.05)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-lg"
                    style={{ background: '#f59e0b' }}>
                    {selectedEmployee.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-white">{selectedEmployee.name}</p>
                    <p className="text-amber-400 text-sm">{selectedEmployee.role}</p>
                    <p className="text-slate-500 text-xs">{selectedEmployee.department} · {selectedEmployee.experience} yrs</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {selectedEmp && (
            <div className="rounded-2xl p-6 border border-slate-800" style={{ background: '#111827' }}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-bold text-white">
                  Current Skills
                  <span className="ml-2 text-xs bg-amber-400 bg-opacity-10 text-amber-400 px-2 py-0.5 rounded-full">
                    {employeeSkills.length}
                  </span>
                </h2>
                <button onClick={() => setShowAddSkill(!showAddSkill)}
                  className="flex items-center gap-1.5 text-sm text-white px-3 py-1.5 rounded-lg transition"
                  style={{ background: '#f59e0b' }}>
                  <Plus size={14} /> Add Skill
                </button>
              </div>

              {showAddSkill && (
                <div className="mb-4 p-4 rounded-xl border border-slate-700 space-y-3"
                  style={{ background: '#0d1426' }}>
                  <input
                    placeholder="Skill name (e.g. React, Python)"
                    value={skillForm.name}
                    onChange={e => setSkillForm({ ...skillForm, name: e.target.value })}
                    className="w-full rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white placeholder-slate-600 border border-slate-700 text-sm"
                    style={{ background: '#111827' }} />
                  <div className="grid grid-cols-2 gap-2">
                    <select value={skillForm.category}
                      onChange={e => setSkillForm({ ...skillForm, category: e.target.value })}
                      className="rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 text-white border border-slate-700"
                      style={{ background: '#111827' }}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <select value={skillForm.level}
                      onChange={e => setSkillForm({ ...skillForm, level: e.target.value })}
                      className="rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 text-white border border-slate-700"style={{ background: '#111827' }}>
                      {LEVELS.map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowAddSkill(false)}
                      className="flex-1 border border-slate-700 text-slate-400 py-2 rounded-xl text-sm hover:bg-slate-800 transition">
                      Cancel
                    </button>
                    <button onClick={handleAddSkill}
                      className="flex-1 text-white py-2 rounded-xl text-sm transition"
                      style={{ background: '#f59e0b' }}>
                      Save Skill
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {employeeSkills.length === 0 ? (
                  <div className="text-center py-8">
                    <Brain size={32} className="text-slate-700 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">No skills added yet</p>
                  </div>
                ) : (
                  employeeSkills.map(skill => (
                    <div key={skill._id}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-800 hover:border-slate-700 transition"
                      style={{ background: '#0d1426' }}>
                      <div>
                        <p className="font-semibold text-white text-sm">{skill.name}</p>
                        <div className="flex gap-1.5 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[skill.category]}`}>
                            {skill.category}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LEVEL_COLORS[skill.level]}`}>
                            {skill.level}
                          </span>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteSkill(skill._id)}
                        className="p-1.5 text-red-400 hover:bg-red-400 hover:bg-opacity-10 rounded-lg transition">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl p-6 border border-slate-800" style={{ background: '#111827' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(245,158,11,0.1)' }}>
                <Sparkles size={16} className="text-amber-400" />
              </div>
              <h2 className="text-base font-bold text-white">AI Skill Gap Analysis</h2>
            </div>

             <div className="mb-4">
              <label className="text-sm font-medium text-slate-400 mb-2 block">Analyze Against</label>
              <div className="flex gap-2 mb-3">
                <button onClick={() => setAnalysisMode('role')}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition border ${
                    analysisMode === 'role'
                      ? 'border-amber-500 text-amber-400'
                      : 'border-slate-700 text-slate-400 hover:border-amber-500 hover:text-amber-400'
                  }`}
                  style={analysisMode === 'role' ? { background: 'rgba(245,158,11,0.1)' } : { background: '#0d1426' }}>
                  🎯 Career Role
                </button>
                <button onClick={() => setAnalysisMode('project')}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition border ${
                    analysisMode === 'project'
                      ? 'border-amber-500 text-amber-400'
                      : 'border-slate-700 text-slate-400 hover:border-amber-500 hover:text-amber-400'
                  }`}
                  style={analysisMode === 'project' ? { background: 'rgba(245,158,11,0.1)' } : { background: '#0d1426' }}>
                  📁 Project Fit
                </button>
              </div>

              {analysisMode === 'role' ? (
                <select value={targetRole}
                  onChange={e => setTargetRole(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white border border-slate-700"
                  style={{ background: '#0d1426' }}>
                  <option value="">Select target role...</option>
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
              ) : (
                <select value={targetProjectId}
                  onChange={e => setTargetProjectId(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white border border-slate-700"
                  style={{ background: '#0d1426' }}>
                  <option value="">Select project...</option>
                  {projects.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              )}
            </div>

            <button onClick={handleAnalyze} disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition disabled:opacity-50"
              style={{ background: '#f59e0b' }}>
              <Brain size={18} />
              {loading ? 'Analyzing...' : 'Analyze Skill Gap'}
            </button>
          </div>{loading && (
            <div className="rounded-2xl p-8 border border-slate-800 text-center"
              style={{ background: '#111827' }}>
              <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="font-semibold text-white">AI is analyzing skills...</p>
              <p className="text-sm text-slate-500 mt-1">This may take a few seconds</p>
            </div>
          )}

          {analysis && (
            <div className="rounded-2xl p-6 border border-slate-800" style={{ background: '#111827' }}>
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-800">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: '#f59e0b' }}>
                  <Brain size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">AI Analysis Result</h3>
                  <p className="text-xs text-slate-500">Powered by LLaMA AI</p>
                </div>
              </div>
              <div className="rounded-xl p-4 border border-slate-800 max-h-96 overflow-y-auto"
                style={{ background: '#0d1426' }}>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {analysis}
                </p>
              </div>
            </div>
          )}

          {!analysis && !loading && (
            <div className="rounded-2xl p-8 border border-slate-800 text-center"
              style={{ background: '#111827' }}>
              <Brain size={40} className="text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500">Select an employee and target role then click Analyze</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}