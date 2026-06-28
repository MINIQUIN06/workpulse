import { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { CheckSquare, Clock, AlertCircle, ChevronRight } from 'lucide-react';
import { useMounted, fadeUp, fadeIn } from '../../hooks/useAnimation';

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

const STATUS_NEXT = {
  todo: 'inprogress',
  inprogress: 'review',
  review: null,
  done: null
};

export default function EmployeeTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const mounted = useMounted();

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user?.employeeId) { setLoading(false); return; }
      try {
        const res = await axios.get(`/tasks/my/${user.employeeId}`);
        setTasks(res.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [user]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.put(`/tasks/${id}`, { status });
      toast.success('Task updated!');
      const res = await axios.get(`/tasks/my/${user.employeeId}`);
      setTasks(res.data);
    } catch {
      toast.error('Failed to update task');
    }
  };

  const filtered = tasks.filter(t =>
    activeTab === 'all' ? true : t.status === activeTab
  );

  const todoCount = tasks.filter(t => t.status === 'todo').length;
  const inprogressCount = tasks.filter(t => t.status === 'inprogress').length;
  const doneCount = tasks.filter(t => t.status === 'done').length;
  const urgentCount = tasks.filter(t => t.priority === 'urgent').length;

  const isOverdue = (dueDate) => dueDate && new Date(dueDate) < new Date();

  const tabClass = (tab) =>
    activeTab === tab
      ? 'px-4 py-2 rounded-xl font-medium text-white text-sm transition'
      : 'px-4 py-2 rounded-xl font-medium text-slate-400 text-sm border border-slate-700 hover:border-emerald-500 hover:text-emerald-400 transition';

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div style={fadeIn(mounted)}>
      <div className="mb-8" style={fadeUp(mounted, 100)}>
        <h1 className="text-3xl font-bold text-white">My Tasks</h1>
        <p className="text-slate-400 mt-1">Track and update your assigned tasks</p>
      </div>

      <div className="grid grid-cols-4 gap-5 mb-8" style={fadeUp(mounted, 200)}>
        {[
          { label: 'To Do', value: todoCount, color: 'text-slate-400', bg: 'rgba(148,163,184,0.1)' },
          { label: 'In Progress', value: inprogressCount, color: 'text-blue-400', bg: 'rgba(96,165,250,0.1)' },
          { label: 'Completed', value: doneCount, color: 'text-emerald-400', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Urgent', value: urgentCount, color: 'text-red-400', bg: 'rgba(239,68,68,0.1)' },
        ].map((stat, i) => (
          <div key={i} className="rounded-2xl p-6 border border-slate-800"
            style={{ background: '#111827' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{ background: stat.bg }}>
              <CheckSquare size={22} className={stat.color} />
            </div>
            <p className={`text-4xl font-bold ${stat.color} mb-1`}>{stat.value}</p>
            <p className="text-sm text-slate-400">{stat.label}</p>
          </div>
        ))}
      </div><div className="flex gap-3 mb-6" style={fadeUp(mounted, 300)}>
     Find:
        {['all', 'todo', 'inprogress', 'review', 'done'].map(tab => (
          <button key={tab}
            onClick={() => setActiveTab(tab)}
            className={tabClass(tab)}
            style={activeTab === tab ? { background: '#10b981' } : {}}>
            {tab === 'all' ? 'All Tasks' : STATUS_LABELS[tab]}
          </button>
        ))}
      </div>

      <div className="space-y-4" style={fadeUp(mounted, 400)}>
        {filtered.length === 0 ? (
          <div className="rounded-2xl p-12 text-center border border-slate-800"
            style={{ background: '#111827' }}>
            <CheckSquare size={48} className="text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500">No tasks found</p>
          </div>
        ) : (
          filtered.map(task => (
            <div key={task._id}
              className="rounded-2xl p-6 border border-slate-800 hover:border-emerald-500 hover:border-opacity-30 transition"
              style={{ background: '#111827' }}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-white text-lg">{task.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${PRIORITY_COLORS[task.priority]}`}>
                      {task.priority}
                    </span>
                    {task.priority === 'urgent' && (
                      <AlertCircle size={16} className="text-red-400" />
                    )}
                  </div>

                  {task.description && (
                    <p className="text-slate-400 text-sm mb-3">{task.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    {task.project && (
                      <span className="flex items-center gap-1">
                        📁 {task.project?.name}
                      </span>
                    )}
                    {task.dueDate && (
                      <span className={`flex items-center gap-1 ${isOverdue(task.dueDate) && task.status !== 'done' ? 'text-red-400' : ''}`}>
                        <Clock size={12} />
                        {isOverdue(task.dueDate) && task.status !== 'done' ? '⚠️ Overdue: ' : 'Due: '}
                        {task.dueDate}
                      </span>
                    )}
                  </div>

                  {task.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {task.tags.map((tag, i) => (
                        <span key={i}
                          className="text-xs px-2 py-0.5 rounded-full text-emerald-400 border border-emerald-400 border-opacity-20"
                          style={{ background: 'rgba(16,185,129,0.05)' }}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-3 ml-4">
                  <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${STATUS_COLORS[task.status]}`}>
                    {STATUS_LABELS[task.status]}
                  </span>

                  {STATUS_NEXT[task.status] && (
                    <button
                      onClick={() => handleStatusUpdate(task._id, STATUS_NEXT[task.status])}
                      className="flex items-center gap-1.5 text-xs text-white px-3 py-2 rounded-lg font-medium transition"
                      style={{ background: '#10b981' }}>
                      Move to {STATUS_LABELS[STATUS_NEXT[task.status]]}
                      <ChevronRight size={12} />
                    </button>
                  )}{task.status === 'review' && (
                    <span className="text-xs text-purple-400">
                      ⏳ Waiting for admin approval
                    </span>
                  )}
                  {task.status === 'done' && (
                    <span className="text-xs text-emerald-400">
                      ✅ Completed
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}