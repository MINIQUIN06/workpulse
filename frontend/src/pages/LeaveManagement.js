import { useEffect, useState } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Clock, Calendar, FileText, X } from 'lucide-react'; //Users
import { useMounted, fadeUp, fadeIn } from '../hooks/useAnimation';


const STATUS_COLORS = {
  pending: 'bg-yellow-400 bg-opacity-10 text-yellow-400',
  approved: 'bg-green-400 bg-opacity-10 text-green-400',
  rejected: 'bg-red-400 bg-opacity-10 text-red-400'
};

const LEAVE_COLORS = {
  sick: 'bg-red-400 bg-opacity-10 text-red-400',
  casual: 'bg-blue-400 bg-opacity-10 text-blue-400',
  annual: 'bg-purple-400 bg-opacity-10 text-purple-400',
  maternity: 'bg-pink-400 bg-opacity-10 text-pink-400',
  emergency: 'bg-orange-400 bg-opacity-10 text-orange-400'
};

export default function LeaveManagement() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [selected, setSelected] = useState(null);
  const [adminComment, setAdminComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const mounted = useMounted();

  const fetchLeaves = async () => {
    try {
      const res = await axios.get('/leaves/all');
      setLeaves(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaves(); }, []);

  const handleUpdateStatus = async (id, status) => {
    setActionLoading(true);
    try {
      await axios.put(`/leaves/${id}`, { status, adminComment });
      toast.success(`Leave ${status} successfully!`);
      setSelected(null);
      setAdminComment('');
      fetchLeaves();
    } catch {
      toast.error('Failed to update leave status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this leave request?')) return;
    try {
      await axios.delete(`/leaves/${id}`);
      toast.success('Leave request deleted');
      fetchLeaves();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const filtered = leaves.filter(l =>
    activeTab === 'all' ? true : l.status === activeTab
  );

  const pendingCount = leaves.filter(l => l.status === 'pending').length;
  const approvedCount = leaves.filter(l => l.status === 'approved').length;
  const rejectedCount = leaves.filter(l => l.status === 'rejected').length;

  const stats = [
    { label: 'Total Requests', value: leaves.length, icon: FileText, color: 'text-amber-400', bg: 'rgba(245,158,11,0.1)' },
    { label: 'Pending', value: pendingCount, icon: Clock, color: 'text-yellow-400', bg: 'rgba(234,179,8,0.1)' },
    { label: 'Approved', value: approvedCount, icon: CheckCircle, color: 'text-green-400', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Rejected', value: rejectedCount, icon: XCircle, color: 'text-red-400', bg: 'rgba(239,68,68,0.1)' },
  ];

  const tabClass = (tab) =>
    activeTab === tab
      ? 'px-5 py-2.5 rounded-xl font-medium text-white transition'
      : 'px-5 py-2.5 rounded-xl font-medium text-slate-400 border border-slate-700 hover:border-amber-500 hover:text-amber-400 transition';

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div style={fadeIn(mounted)}>
      <div className="mb-8" style={fadeUp(mounted, 100)}>
        <h1 className="text-3xl font-bold text-white">Leave Management</h1>
        <p className="text-slate-400 mt-1">Manage and approve employee leave requests</p>
      </div>

      <div className="grid grid-cols-4 gap-5 mb-8" style={fadeUp(mounted, 200)}>
        {stats.map((stat, i) => (
          <div key={i} className="rounded-2xl p-6 border border-slate-800 hover:border-amber-500 hover:border-opacity-30 transition"
            style={{ background: '#111827' }}><div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{ background: stat.bg }}>
              <stat.icon size={22} className={stat.color} />
            </div>
            <p className="text-4xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-sm text-slate-400">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mb-6" style={fadeUp(mounted, 300)}>
        {['pending', 'approved', 'rejected', 'all'].map(tab => (
          <button key={tab}
            onClick={() => setActiveTab(tab)}
            className={tabClass(tab)}
            style={activeTab === tab ? { background: '#f59e0b' } : {}}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'pending' && pendingCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-800 overflow-hidden"
        style={{ background: '#111827' }}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Employee</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Leave Type</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Duration</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Days</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-16 text-slate-500">
                  <Calendar size={32} className="mx-auto mb-2 text-slate-700" />
                  <p>No {activeTab} leave requests</p>
                </td>
              </tr>
            ) : (
              filtered.map(leave => (
                <tr key={leave._id} className="hover:bg-slate-800 hover:bg-opacity-30 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm"
                        style={{ background: '#f59e0b' }}>
                        {leave.employee?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{leave.employee?.name}</p>
                        <p className="text-xs text-slate-500">{leave.employee?.department}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-3 py-1.5 rounded-full font-medium capitalize ${LEAVE_COLORS[leave.leaveType]}`}>
                      {leave.leaveType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300 text-sm">
                    {leave.startDate} → {leave.endDate}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-amber-400 font-bold">{leave.days}</span>
                    <span className="text-slate-500 text-xs ml-1">days</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${STATUS_COLORS[leave.status]}`}>
                      {leave.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setSelected(leave); setAdminComment(''); }}
                        className="p-2 text-amber-400 hover:bg-amber-400 hover:bg-opacity-10 rounded-lg transition">
                        <FileText size={15} />
                      </button>
                      {leave.status === 'pending' && (
                        <>
                          <button onClick={() => handleUpdateStatus(leave._id, 'approved')}
                            className="p-2 text-green-400 hover:bg-green-400 hover:bg-opacity-10 rounded-lg transition">
                            <CheckCircle size={15} />
                          </button>
                          <button onClick={() => handleUpdateStatus(leave._id, 'rejected')}
                            className="p-2 text-red-400 hover:bg-red-400 hover:bg-opacity-10 rounded-lg transition">
                            <XCircle size={15} />
                          </button>
                        </>
                      )}
                      <button onClick={() => handleDelete(leave._id)}
                        className="p-2 text-slate-500 hover:bg-slate-700 rounded-lg transition">
                        <X size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="rounded-2xl p-8 w-full max-w-md border border-slate-800"
            style={{ background: '#0d1426' }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Leave Details</h2>
              <button onClick={() => setSelected(null)}
                className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 rounded-xl border border-amber-500 border-opacity-20 mb-6"
              style={{ background: 'rgba(245,158,11,0.05)' }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white"
                  style={{ background: '#f59e0b' }}>
                  {selected.employee?.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-white">{selected.employee?.name}</p>
                  <p className="text-amber-400 text-sm">{selected.employee?.role}</p>
                  <p className="text-slate-500 text-xs">{selected.employee?.department}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {[
                { label: 'Leave Type', value: selected.leaveType },
                { label: 'From', value: selected.startDate },
                { label: 'To', value: selected.endDate },
                { label: 'Total Days', value: `${selected.days} days` },
                { label: 'Status', value: selected.status },
              ].map((item, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-500 text-sm">{item.label}</span>
                  <span className="text-white text-sm font-medium capitalize">{item.value}</span></div>
              ))}
              <div className="py-2">
                <p className="text-slate-500 text-sm mb-1">Reason</p>
                <p className="text-white text-sm">{selected.reason}</p>
              </div>
              {selected.adminComment && (
                <div className="py-2">
                  <p className="text-slate-500 text-sm mb-1">Admin Comment</p>
                  <p className="text-amber-400 text-sm">{selected.adminComment}</p>
                </div>
              )}
            </div>

            {selected.status === 'pending' && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-slate-400 mb-1 block">
                    Comment (Optional)
                  </label>
                  <textarea
                    value={adminComment}
                    onChange={e => setAdminComment(e.target.value)}
                    rows={2}
                    placeholder="Add a comment..."
                    className="w-full rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white placeholder-slate-600 border border-slate-700 resize-none text-sm"
                    style={{ background: '#111827' }}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleUpdateStatus(selected._id, 'rejected')}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-red-400 border border-red-400 border-opacity-30 hover:bg-red-400 hover:bg-opacity-10 transition disabled:opacity-50">
                    <XCircle size={16} />
                    Reject
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selected._id, 'approved')}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-white transition disabled:opacity-50"
                    style={{ background: '#10b981' }}>
                    <CheckCircle size={16} />
                    {actionLoading ? 'Processing...' : 'Approve'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}