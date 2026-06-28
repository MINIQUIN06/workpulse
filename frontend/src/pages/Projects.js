import { useEffect, useState } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, Trash2, X, Briefcase, Calendar, Users } from 'lucide-react';
import { useMounted, fadeUp, fadeIn } from '../hooks/useAnimation';

const STATUS_COLORS = {
  planning: 'bg-yellow-400 bg-opacity-10 text-yellow-400',
  active: 'bg-green-400 bg-opacity-10 text-green-400',
  completed: 'bg-blue-400 bg-opacity-10 text-blue-400'
};

const PRIORITY_COLORS = {
  low: 'bg-slate-400 bg-opacity-10 text-slate-400',
  medium: 'bg-orange-400 bg-opacity-10 text-orange-400',
  high: 'bg-red-400 bg-opacity-10 text-red-400'
};

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    requiredSkills: '',
    teamMembers: [],
    status: 'planning',
    priority: 'medium',
    startDate: '',
    endDate: ''
  });
  const mounted = useMounted();

  const fetchProjects = async () => {
    const res = await axios.get('/projects');
    setProjects(res.data);
  };

  useEffect(() => {
    fetchProjects();
    axios.get('/employees').then(res => setEmployees(res.data));
  }, []);

  const toggleMember = (id) => {
    setForm(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.includes(id)
        ? prev.teamMembers.filter(m => m !== id)
        : [...prev.teamMembers, id]
    }));
  };

  const handleSubmit = async () => {
    try {
      await axios.post('/projects', {
        ...form,
        requiredSkills: form.requiredSkills.split(',').map(s => s.trim())
      });
      toast.success('Project created!');
      setShowModal(false);
      setForm({
        name: '', description: '', requiredSkills: '',
        teamMembers: [], status: 'planning', priority: 'medium',
        startDate: '', endDate: ''
      });
      fetchProjects();
    } catch {
      toast.error('Failed to create project');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await axios.delete(`/projects/${id}`);
      toast.success('Project deleted');
      fetchProjects();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div style={fadeIn(mounted)}>
      <div className="flex justify-between items-center mb-8" style={fadeUp(mounted, 100)}>
        <div>
          <h1 className="text-3xl font-bold text-white">Projects</h1>
          <p className="text-slate-400 mt-1">{projects.length} total projects</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 text-white px-5 py-3 rounded-xl font-medium transition"
          style={{ background: '#f59e0b' }}>
          <Plus size={18} /> New Project
        </button>
      </div>

      <div className="grid grid-cols-3 gap-5" style={fadeUp(mounted, 200)}>
        {projects.length === 0 ? (
          <div className="col-span-3 rounded-2xl p-12 text-center border border-slate-800"
            style={{ background: '#111827' }}>
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(245,158,11,0.1)' }}>
              <Briefcase size={36} className="text-amber-400 opacity-50" />
            </div>
            <h3 className="text-lg font-bold text-slate-500">No Projects Yet</h3>
            <p className="text-slate-600 text-sm mt-2">Create your first project!</p>
          </div>
        ) : (
          projects.map(project => (
            <div key={project._id}
              onClick={() => setSelectedProject(project)}
              className="rounded-2xl p-6 border border-slate-800 hover:border-amber-500 hover:border-opacity-30 transition cursor-pointer"
              style={{ background: '#111827' }}><div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-white text-lg">{project.name}</h3>
                <button
                  onClick={e => { e.stopPropagation(); handleDelete(project._id); }}
                  className="p-1.5 text-red-400 hover:bg-red-400 hover:bg-opacity-10 rounded-lg transition">
                  <Trash2 size={14} />
                </button>
              </div>

              <p className="text-slate-400 text-sm mb-4 line-clamp-2">{project.description}</p>

              <div className="flex gap-2 mb-4">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[project.status]}`}>
                  {project.status}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${PRIORITY_COLORS[project.priority]}`}>
                  {project.priority}
                </span>
              </div>

              {project.startDate && (
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                  <Calendar size={12} className="text-amber-400" />
                  <span>{new Date(project.startDate).toLocaleDateString()}</span>
                  {project.endDate && (
                    <span>→ {new Date(project.endDate).toLocaleDateString()}</span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {project.teamMembers?.slice(0, 4).map((member, i) => (
                    <div key={i}
                      className="w-7 h-7 rounded-full border-2 border-slate-900 flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: ['#f59e0b', '#6366f1', '#10b981', '#ef4444'][i % 4] }}
                      title={member.name}>
                      {member.name?.charAt(0)}
                    </div>
                  ))}
                  {project.teamMembers?.length > 4 && (
                    <div className="w-7 h-7 rounded-full border-2 border-slate-900 flex items-center justify-center text-xs font-bold text-slate-400"
                      style={{ background: '#1e2a45' }}>
                      +{project.teamMembers.length - 4}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Users size={12} />
                  <span>{project.teamMembers?.length || 0} members</span>
                </div>
              </div>

              {project.requiredSkills?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-slate-800">
                  {project.requiredSkills.slice(0, 3).map((skill, i) => (
                    <span key={i}
                      className="text-xs px-2 py-0.5 rounded-full text-amber-400 border border-amber-400 border-opacity-20"
                      style={{ background: 'rgba(245,158,11,0.05)' }}>
                      {skill}
                    </span>
                  ))}
                  {project.requiredSkills.length > 3 && (
                    <span className="text-xs text-slate-500">+{project.requiredSkills.length - 3} more</span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="rounded-2xl p-8 w-full max-w-lg shadow-2xl border border-slate-800 max-h-screen overflow-y-auto"
            style={{ background: '#0d1426' }}><div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Create New Project</h2>
                <p className="text-sm text-slate-500">Fill in the project details</p>
              </div>
              <button onClick={() => setShowModal(false)}
                className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-400">Project Name</label>
                <input value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl px-4 py-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white placeholder-slate-600 border border-slate-700"
                  style={{ background: '#111827' }}
                  placeholder="e.g. E-commerce Website" />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-400">Description</label>
                <textarea value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl px-4 py-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white placeholder-slate-600 border border-slate-700 resize-none"
                  style={{ background: '#111827' }}
                  placeholder="Project description..." />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-400">Required Skills (comma separated)</label>
                <input value={form.requiredSkills}
                  onChange={e => setForm({ ...form, requiredSkills: e.target.value })}
                  className="w-full rounded-xl px-4 py-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white placeholder-slate-600 border border-slate-700"
                  style={{ background: '#111827' }}
                  placeholder="React, Node.js, MongoDB" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-400">Status</label>
                  <select value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full rounded-xl px-4 py-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white border border-slate-700"
                    style={{ background: '#111827' }}>
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-400">Priority</label>
                  <select value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}
                    className="w-full rounded-xl px-4 py-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white border border-slate-700"
                    style={{ background: '#111827' }}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-400">Start Date</label><input type="date" value={form.startDate}
                    onChange={e => setForm({ ...form, startDate: e.target.value })}
                    className="w-full rounded-xl px-4 py-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white border border-slate-700"
                    style={{ background: '#111827' }} />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-400">End Date</label>
                  <input type="date" value={form.endDate}
                    onChange={e => setForm({ ...form, endDate: e.target.value })}
                    className="w-full rounded-xl px-4 py-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white border border-slate-700"
                    style={{ background: '#111827' }} />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-400 mb-2 block">Select Team Members</label>
                <div className="max-h-40 overflow-y-auto space-y-2 rounded-xl border border-slate-700 p-3"
                  style={{ background: '#111827' }}>
                  {employees.map(emp => (
                    <div key={emp._id}
                      onClick={() => toggleMember(emp._id)}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition ${
                        form.teamMembers.includes(emp._id)
                          ? 'border border-amber-500 border-opacity-30'
                          : 'hover:bg-slate-800'
                      }`}
                      style={form.teamMembers.includes(emp._id) ? { background: 'rgba(245,158,11,0.05)' } : {}}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: '#f59e0b' }}>
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{emp.name}</p>
                        <p className="text-xs text-slate-500">{emp.role}</p>
                      </div>
                      {form.teamMembers.includes(emp._id) && (
                        <span className="ml-auto text-xs text-amber-400 font-medium">Selected</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)}
                className="flex-1 border border-slate-700 text-slate-400 py-3 rounded-xl hover:bg-slate-800 font-medium transition">
                Cancel
              </button>
              <button onClick={handleSubmit}
                className="flex-1 text-white py-3 rounded-xl font-medium transition"
                style={{ background: '#f59e0b' }}>
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Project Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="rounded-2xl p-8 w-full max-w-lg shadow-2xl border border-slate-800"
            style={{ background: '#0d1426' }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Project Details</h2>
              <button onClick={() => setSelectedProject(null)}
                className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition">
                <X size={20} />
              </button>
            </div><div className="p-4 rounded-xl border border-amber-500 border-opacity-20 mb-6"
              style={{ background: 'rgba(245,158,11,0.05)' }}>
              <h3 className="text-xl font-bold text-white mb-1">{selectedProject.name}</h3>
              <p className="text-slate-400 text-sm">{selectedProject.description}</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between py-3 border-b border-slate-800">
                <span className="text-slate-500">Status</span>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_COLORS[selectedProject.status]}`}>
                  {selectedProject.status}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b border-slate-800">
                <span className="text-slate-500">Priority</span>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${PRIORITY_COLORS[selectedProject.priority]}`}>
                  {selectedProject.priority}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b border-slate-800">
                <span className="text-slate-500">Team Size</span>
                <span className="text-white font-semibold">{selectedProject.teamMembers?.length || 0} members</span>
              </div>
              {selectedProject.startDate && (
                <div className="flex justify-between py-3 border-b border-slate-800">
                  <span className="text-slate-500">Timeline</span>
                  <span className="text-white font-semibold">
                    {new Date(selectedProject.startDate).toLocaleDateString()} —
                    {selectedProject.endDate ? new Date(selectedProject.endDate).toLocaleDateString() : 'Ongoing'}
                  </span>
                </div>
              )}
              {selectedProject.requiredSkills?.length > 0 && (
                <div className="py-3">
                  <p className="text-slate-500 mb-2">Required Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.requiredSkills.map((skill, i) => (
                      <span key={i}
                        className="text-xs px-3 py-1 rounded-full text-amber-400 border border-amber-400 border-opacity-20"
                        style={{ background: 'rgba(245,158,11,0.05)' }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="py-3">
                <p className="text-slate-500 mb-2">Team Members</p>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.teamMembers?.map((member, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700"
                      style={{ background: '#111827' }}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: '#f59e0b' }}>
                        {member.name?.charAt(0)}
                      </div>
                      <span className="text-sm text-white">{member.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}