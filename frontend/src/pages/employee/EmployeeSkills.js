import { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Trash2, Star } from 'lucide-react';
import { useMounted, fadeUp, fadeIn } from '../../hooks/useAnimation';

const CATEGORIES = ['technical', 'soft', 'management', 'design', 'other'];
const LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'];

const LEVEL_COLORS = {
  beginner: 'bg-blue-400 bg-opacity-10 text-blue-400',
  intermediate: 'bg-yellow-400 bg-opacity-10 text-yellow-400',
  advanced: 'bg-orange-400 bg-opacity-10 text-orange-400',
  expert: 'bg-red-400 bg-opacity-10 text-red-400',
};

export default function EmployeeSkills() {
  const { user } = useAuth();
  const [skills, setSkills] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'technical', level: 'beginner' });
  const mounted = useMounted();

  const fetchSkills = async () => {
    if (user?.employeeId) {
      const res = await axios.get(`/skills/${user.employeeId}`);
      setSkills(res.data);
    }
  };

  useEffect(() => { fetchSkills(); }, [user]);

  const handleAdd = async () => {
    if (!form.name) { toast.error('Enter skill name'); return; }
    try {
      await axios.post('/skills', { ...form, employee: user.employeeId });
      toast.success('Skill added!');
      setForm({ name: '', category: 'technical', level: 'beginner' });
      setShowForm(false);
      fetchSkills();
    } catch { toast.error('Failed to add skill'); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/skills/${id}`);
      toast.success('Skill removed');
      fetchSkills();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div style={fadeIn(mounted)}>
      <div className="flex justify-between items-center mb-8" style={fadeUp(mounted, 100)}>
        <div>
          <h1 className="text-3xl font-bold text-white">My Skills</h1>
          <p className="text-slate-400 mt-1">{skills.length} skills in your profile</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 text-white px-5 py-3 rounded-xl font-medium transition"
          style={{ background: '#10b981' }}>
          <Plus size={18} /> Add Skill
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl p-6 border border-slate-800 mb-6" style={fadeUp(mounted, 150)}>
          <h2 className="text-lg font-bold text-white mb-4">Add New Skill</h2>
          <div className="grid grid-cols-3 gap-4" style={fadeUp(mounted, 200)}>
            <div>
              <label className="text-sm font-medium text-slate-400">Skill Name</label>
              <input value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. React, Python"
                className="w-full rounded-xl px-4 py-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-white placeholder-slate-600 border border-slate-700"
                style={{ background: '#0d1426' }} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-400">Category</label>
              <select value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-xl px-4 py-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-white border border-slate-700"
                style={{ background: '#0d1426' }}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-400">Level</label>
              <select value={form.level}
                onChange={e => setForm({ ...form, level: e.target.value })}
                className="w-full rounded-xl px-4 py-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-white border border-slate-700"style={{ background: '#0d1426' }}>
                {LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setShowForm(false)}
              className="flex-1 border border-slate-700 text-slate-400 py-2.5 rounded-xl hover:bg-slate-800 transition">
              Cancel
            </button>
            <button onClick={handleAdd}
              className="flex-1 text-white py-2.5 rounded-xl transition"
              style={{ background: '#10b981' }}>
              Save Skill
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {skills.length === 0 ? (
          <div className="col-span-3 rounded-2xl p-12 text-center border border-slate-800"
            style={{ background: '#111827' }}>
            <Star size={48} className="text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500">No skills yet. Add your first skill!</p>
          </div>
        ) : (
          skills.map(skill => (
            <div key={skill._id}
              className="rounded-2xl p-5 border border-slate-800 hover:border-emerald-500 hover:border-opacity-30 transition"
              style={{ background: '#111827' }}>
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-white text-lg">{skill.name}</h3>
                <button onClick={() => handleDelete(skill._id)}
                  className="p-1.5 text-red-400 hover:bg-red-400 hover:bg-opacity-10 rounded-lg transition">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="flex gap-2">
                <span className="text-xs bg-emerald-400 bg-opacity-10 text-emerald-400 px-2 py-1 rounded-full font-medium">
                  {skill.category}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${LEVEL_COLORS[skill.level]}`}>
                  {skill.level}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}