import { useEffect, useState } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, Trash2, X, CheckSquare, Eye } from 'lucide-react'; //Clock, AlertCircle
import { useMounted, fadeUp, fadeIn } from '../hooks/useAnimation';


const STATUS_COLORS = {
  todo: 'bg-slate-400 bg-opacity-10 text-slate-400',
  inprogress: 'bg-blue-400 bg-opacity-10 text-blue-400',
  review: 'bg-purple-400 bg-opacity-10 text-purple-400',
  done: 'bg-green-400 bg-opacity-10 text-green-400'
};

const PRIORITY_COLORS = {
  low: 'bg-slate-400 bg-opacity-10 text-slate-400',
  medium: 'bg-yellow-400 bg-opacity-10 text-yellow-400',
  high: 'bg-orange-400 bg-opacity-10 text-orange-400',
  urgent: 'bg-red-400 bg-opacity-10 text-red-400'
};

const STATUS_LABELS = {
  todo: 'To Do',
  inprogress: 'In Progress',
  review: 'In Review',
  done: 'Done'
};

export default function TaskManagement() {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [form, setForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    project: '',
    priority: 'medium',
    dueDate: '',
    tags: ''
  });
  const mounted = useMounted();

  const fetchData = async () => {
    try {
      const [tasksRes, statsRes, empsRes, projsRes] = await Promise.all([
        axios.get('/tasks'),
        axios.get('/tasks/stats'),
        axios.get('/employees'),
        axios.get('/projects')
      ]);
      setTasks(tasksRes.data);
      setStats(statsRes.data);
      setEmployees(empsRes.data);
      setProjects(projsRes.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    if (!form.title || !form.assignedTo) {
      toast.error('Please fill title and assign to an employee');
      return;
    }
    try {
      await axios.post('/tasks', {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
        project: form.project || undefined
      });
      toast.success('Task created!');
      setShowModal(false);
      setForm({ title: '', description: '', assignedTo: '', project: '', priority: 'medium', dueDate: '', tags: '' });
      fetchData();
    } catch {
      toast.error('Failed to create task');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await axios.delete(`/tasks/${id}`);
      toast.success('Task deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.put(`/tasks/${id}`, { status });
      toast.success('Status updated!');
      fetchData();
    } catch {
      toast.error('Failed to update');
    }
  };

  const filtered = tasks.filter(t =>
    activeTab === 'all' ? true : t.status === activeTab
  );

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && true;
  };

  const tabClass = (tab) =>
    activeTab === tab
      ? 'px-4 py-2 rounded-xl font-medium text-white text-sm transition'
      : 'px-4 py-2 rounded-xl font-medium text-slate-400 text-sm border border-slate-700 hover:border-amber-500 hover:text-amber-400 transition';

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div style={fadeIn(mounted)}>
      <div className="flex justify-between items-center mb-8" style={fadeUp(mounted, 100)}><div>
          <h1 className="text-3xl font-bold text-white">Task Management</h1>
          <p className="text-slate-400 mt-1">Assign and track employee tasks</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 text-white px-5 py-3 rounded-xl font-medium transition"
          style={{ background: '#f59e0b' }}>
          <Plus size={18} /> New Task
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-6 gap-4 mb-8" style={fadeUp(mounted, 200)}>
        {[
          { label: 'Total', value: stats.total || 0, color: 'text-amber-400' },
          { label: 'To Do', value: stats.todo || 0, color: 'text-slate-400' },
          { label: 'In Progress', value: stats.inprogress || 0, color: 'text-blue-400' },
          { label: 'In Review', value: stats.review || 0, color: 'text-purple-400' },
          { label: 'Done', value: stats.done || 0, color: 'text-green-400' },
          { label: 'Urgent', value: stats.urgent || 0, color: 'text-red-400' },
        ].map((stat, i) => (
          <div key={i} className="rounded-2xl p-4 border border-slate-800 text-center"
            style={{ background: '#111827' }}>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Kanban View */}
      <div className="grid grid-cols-4 gap-5 mb-8" style={fadeUp(mounted, 300)}>
        {['todo', 'inprogress', 'review', 'done'].map(status => (
          <div key={status} className="rounded-2xl border border-slate-800"
            style={{ background: '#111827' }}>
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">{STATUS_LABELS[status]}</h3>
              <span className="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-300">
                {tasks.filter(t => t.status === status).length}
              </span>
            </div>
            <div className="p-3 space-y-3 min-h-32">
              {tasks.filter(t => t.status === status).map(task => (
                <div key={task._id}
                  className="p-3 rounded-xl border border-slate-700 hover:border-amber-500 hover:border-opacity-50 transition cursor-pointer"
                  style={{ background: '#0d1426' }}
                  onClick={() => setSelected(task)}>
                  <p className="font-medium text-white text-sm mb-2">{task.title}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[task.priority]}`}>
                      {task.priority}
                    </span>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: '#f59e0b' }}>
                      {task.assignedTo?.name?.charAt(0)}
                    </div>
                  </div>
                  {task.dueDate && (
                    <p className={`text-xs mt-2 ${isOverdue(task.dueDate) && task.status !== 'done' ? 'text-red-400' : 'text-slate-500'}`}>
                      Due: {task.dueDate}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Table View */}
      <div className="flex gap-3 mb-4">
        {['all', 'todo', 'inprogress', 'review', 'done'].map(tab => (
          <button key={tab}
            onClick={() => setActiveTab(tab)}
            className={tabClass(tab)}
            style={activeTab === tab ? { background: '#f59e0b' } : {}}>
            {tab === 'all' ? 'All Tasks' : STATUS_LABELS[tab]}
          </button>
        ))}
      </div><div className="rounded-2xl border border-slate-800 overflow-hidden"
        style={{ background: '#111827' }}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Task</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Assigned To</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Priority</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Due Date</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-16 text-slate-500">
                  <CheckSquare size={32} className="mx-auto mb-2 text-slate-700" />
                  <p>No tasks found</p>
                </td>
              </tr>
            ) : (
              filtered.map(task => (
                <tr key={task._id} className="hover:bg-slate-800 hover:bg-opacity-30 transition">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-white">{task.title}</p>
                    {task.project && (
                      <p className="text-xs text-slate-500 mt-0.5">{task.project?.name}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs"
                        style={{ background: '#f59e0b' }}>
                        {task.assignedTo?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">{task.assignedTo?.name}</p>
                        <p className="text-xs text-slate-500">{task.assignedTo?.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-3 py-1.5 rounded-full font-medium capitalize ${PRIORITY_COLORS[task.priority]}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {task.dueDate ? (
                      <span className={`text-sm font-medium ${isOverdue(task.dueDate) && task.status !== 'done' ? 'text-red-400' : 'text-slate-300'}`}>
                        {isOverdue(task.dueDate) && task.status !== 'done' && '⚠️ '}
                        {task.dueDate}
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${STATUS_COLORS[task.status]}`}>
                        {STATUS_LABELS[task.status]}
                      </span>
                      {task.status === 'review' && (
                        <button
                          onClick={() => handleStatusUpdate(task._id, 'done')}
                          className="flex items-center gap-1 text-xs text-white px-2.5 py-1.5 rounded-lg font-medium transition"
                          style={{ background: '#10b981' }}>
                          ✓ Approve
                        </button>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setSelected(task)}
                        className="p-2 text-amber-400 hover:bg-amber-400 hover:bg-opacity-10 rounded-lg transition">
                        <Eye size={15} />
                      </button>
                      <button onClick={() => handleDelete(task._id)}
                        className="p-2 text-red-400 hover:bg-red-400 hover:bg-opacity-10 rounded-lg transition">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="rounded-2xl p-8 w-full max-w-lg border border-slate-800 max-h-screen overflow-y-auto"
            style={{ background: '#0d1426' }}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Create New Task</h2>
                <p className="text-sm text-slate-500">Assign a task to an employee</p>
              </div>
              <button onClick={() => setShowModal(false)}
                className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-400">Task Title</label>
                <input value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-xl px-4 py-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white placeholder-slate-600 border border-slate-700"
                  style={{ background: '#111827' }}
                  placeholder="e.g. Design login page" />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-400">Description</label>
                <textarea value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl px-4 py-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white placeholder-slate-600 border border-slate-700 resize-none text-sm"
                  style={{ background: '#111827' }}
                  placeholder="Task description..." />
              </div>

              
              <div>
                <label className="text-sm font-medium text-slate-400">Project (Optional)</label>
                <select value={form.project}
                  onChange={e => setForm({ ...form, project: e.target.value, assignedTo: '' })}
                  className="w-full rounded-xl px-4 py-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white border border-slate-700"
                  style={{ background: '#111827' }}>
                  <option value="">No Project</option>
                  {projects.map(proj => (
                    <option key={proj._id} value={proj._id}>{proj.name}</option>
                  ))}
                </select>
                {form.project && (
                  <p className="text-xs text-amber-400 mt-1.5">
                    ℹ️ Assignee list filtered to this project's team
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-slate-400">Assign To</label>
                <select value={form.assignedTo}
                  onChange={e => setForm({ ...form, assignedTo: e.target.value })}
                  className="w-full rounded-xl px-4 py-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white border border-slate-700"
                  style={{ background: '#111827' }}>
                  <option value="">Select Employee</option>
                  {(() => {
                    const selectedProject = projects.find(p => p._id === form.project);
                    const availableEmployees = selectedProject
                      ? employees.filter(emp =>
                          selectedProject.teamMembers?.some(member =>
                            (member._id || member) === emp._id
                          )
                        )
                      : employees;
                    return availableEmployees.map(emp => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name} — {emp.role}
                      </option>
                    ));
                  })()}
                </select>
                {form.project && projects.find(p => p._id === form.project)?.teamMembers?.length === 0 && (
                  <p className="text-xs text-red-400 mt-1.5">
                    ⚠️ This project has no team members assigned yet
                  </p>
                )}
              </div>


              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-400">Priority</label>
                  <select value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}
                    className="w-full rounded-xl px-4 py-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white border border-slate-700"
                    style={{ background: '#111827' }}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-400">Due Date</label>
                  <input type="date" value={form.dueDate}
                    onChange={e => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full rounded-xl px-4 py-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white border border-slate-700"
                    style={{ background: '#111827' }} />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-400">Tags (comma separated)</label>
                <input value={form.tags}
                  onChange={e => setForm({ ...form, tags: e.target.value })}
                  className="w-full rounded-xl px-4 py-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white placeholder-slate-600 border border-slate-700"
                  style={{ background: '#111827' }}
                  placeholder="frontend, urgent, bug" />
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
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Task Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="rounded-2xl p-8 w-full max-w-md border border-slate-800 max-h-[90vh] overflow-y-auto"
            style={{ background: '#0d1426' }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Task Details</h2>
              <button onClick={() => setSelected(null)}
                className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 rounded-xl border border-amber-500 border-opacity-20 mb-6"
              style={{ background: 'rgba(245,158,11,0.05)' }}>
              <h3 className="text-lg font-bold text-white mb-1">{selected.title}</h3>
              <p className="text-slate-400 text-sm">{selected.description || 'No description'}</p>
            </div><div className="space-y-3">
              {[
                { label: 'Assigned To', value: selected.assignedTo?.name },
                { label: 'Department', value: selected.assignedTo?.department },
                { label: 'Project', value: selected.project?.name || 'No project' },
                { label: 'Due Date', value: selected.dueDate || 'No deadline' },
                { label: 'Created', value: new Date(selected.createdAt).toLocaleDateString() },
              ].map((item, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-500 text-sm">{item.label}</span>
                   <span className="text-white text-sm font-medium">{item.value}</span>
                </div>
              ))}
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-500 text-sm">Priority</span>
                <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${PRIORITY_COLORS[selected.priority]}`}>
                  {selected.priority}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-500 text-sm">Status</span>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_COLORS[selected.status]}`}>
                  {STATUS_LABELS[selected.status]}
                </span>
              </div>
              {selected.tags?.length > 0 && (
                <div className="py-2">
                  <p className="text-slate-500 text-sm mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.tags.map((tag, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-full text-amber-400 border border-amber-400 border-opacity-20"
                        style={{ background: 'rgba(245,158,11,0.05)' }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6">
              <label className="text-sm font-medium text-slate-400 mb-2 block">Current Status</label>
              <div className="flex items-center gap-3">
                <span className={`text-sm px-4 py-2 rounded-xl font-medium ${STATUS_COLORS[selected.status]}`}>
                  {STATUS_LABELS[selected.status]}
                </span>
                {selected.status === 'review' && (
                  <button
                    onClick={() => { handleStatusUpdate(selected._id, 'done'); setSelected(null); }}
                    className="flex items-center gap-2 text-sm text-white px-4 py-2 rounded-xl font-medium transition"
                    style={{ background: '#10b981' }}>
                    ✓ Approve & Mark Done
                  </button>
                )}
              </div>
              {selected.status !== 'review' && selected.status !== 'done' && (
                <p className="text-xs text-slate-500 mt-2">
                  Waiting for employee to move this to "In Review" before you can approve it.
                </p>
              )}
              {selected.status === 'done' && (
                <p className="text-xs text-emerald-400 mt-2">
                  ✅ This task has been completed and approved.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}