import { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, X, Calendar, CheckCircle, Clock, } from 'lucide-react'; //XCircle
import { useMounted, fadeUp, fadeIn } from '../../hooks/useAnimation';

const STATUS_COLORS = {
  pending: 'bg-yellow-400 bg-opacity-10 text-yellow-400',
  approved: 'bg-green-400 bg-opacity-10 text-green-400',
  rejected: 'bg-red-400 bg-opacity-10 text-red-400'
};

const LEAVE_TYPES = ['sick', 'casual', 'annual', 'maternity', 'emergency'];

const LEAVE_COLORS = {
  sick: 'bg-red-400 bg-opacity-10 text-red-400',
  casual: 'bg-blue-400 bg-opacity-10 text-blue-400',
  annual: 'bg-purple-400 bg-opacity-10 text-purple-400',
  maternity: 'bg-pink-400 bg-opacity-10 text-pink-400',
  emergency: 'bg-orange-400 bg-opacity-10 text-orange-400'
};

export default function EmployeeLeave() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    leaveType: 'casual',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const mounted = useMounted();

  //useEffect(() => {
    //const fetchLeaves = async () => {
      //if (!user?.employeeId) { setLoading(false); return; }
      //try {
        //const res = await axios.get(`/leaves/my/${user.employeeId}`);
        //setLeaves(res.data);
      //} catch (err) {
        //console.log(err);
      //} finally {
        //setLoading(false);
      //}
    //};
    //fetchLeaves();
  //}, [user]);


  const fetchLeaves = async () => {
  if (!user?.employeeId) {
    setLoading(false);
    return;
  }

  try {
    const res = await axios.get(`/leaves/my/${user.employeeId}`);
    setLeaves(res.data);
  } catch (err) {
    console.log(err);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchLeaves();
}, [user]);

  const handleSubmit = async () => {
    if (!form.startDate || !form.endDate || !form.reason) {
      toast.error('Please fill all fields');
      return;
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      toast.error('End date cannot be before start date');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post('/leaves', { ...form, employeeId: user.employeeId });
      toast.success('Leave request submitted!');
      setShowModal(false);
      setForm({ leaveType: 'casual', startDate: '', endDate: '', reason: '' });
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply leave');
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount = leaves.filter(l => l.status === 'pending').length;
  const approvedCount = leaves.filter(l => l.status === 'approved').length;
  const totalDays = leaves
    .filter(l => l.status === 'approved')
    .reduce((acc, l) => acc + l.days, 0);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div style={fadeIn(mounted)}>
      <div className="flex justify-between items-center mb-8" style={fadeUp(mounted, 100)}>
        <div>
          <h1 className="text-3xl font-bold text-white">My Leaves</h1>
          <p className="text-slate-400 mt-1">Apply and track your leave requests</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 text-white px-5 py-3 rounded-xl font-medium transition"
          style={{ background: '#10b981' }}>
          <Plus size={18} /> Apply Leave
        </button>
      </div>

      <div className="grid grid-cols-3 gap-5 mb-8" style={fadeUp(mounted, 200)}>
        {[
          { label: 'Pending Requests', value: pendingCount, icon: Clock, color: 'text-yellow-400', bg: 'rgba(234,179,8,0.1)' },
          { label: 'Approved Leaves', value: approvedCount, icon: CheckCircle, color: 'text-emerald-400', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Total Days Taken', value: totalDays, icon: Calendar, color: 'text-amber-400', bg: 'rgba(245,158,11,0.1)' },
        ].map((stat, i) => (<div key={i} className="rounded-2xl p-6 border border-slate-800"
            style={{ background: '#111827' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{ background: stat.bg }}>
              <stat.icon size={22} className={stat.color} />
            </div>
            <p className="text-4xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-sm text-slate-400">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-800 overflow-hidden"
        style={fadeUp(mounted, 300)}>
        <div className="p-5 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">Leave History</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Type</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">From</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">To</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Days</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Reason</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {leaves.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-16 text-slate-500">
                  <Calendar size={32} className="mx-auto mb-2 text-slate-700" />
                  <p>No leave requests yet</p>
                </td>
              </tr>
            ) : (
              leaves.map(leave => (
                <tr key={leave._id} className="hover:bg-slate-800 hover:bg-opacity-30 transition">
                  <td className="px-6 py-4">
                    <span className={`text-xs px-3 py-1.5 rounded-full font-medium capitalize ${LEAVE_COLORS[leave.leaveType]}`}>
                      {leave.leaveType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{leave.startDate}</td>
                  <td className="px-6 py-4 text-slate-300">{leave.endDate}</td>
                  <td className="px-6 py-4">
                    <span className="text-emerald-400 font-bold">{leave.days}</span>
                    <span className="text-slate-500 text-xs ml-1">days</span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm max-w-xs truncate">
                    {leave.reason}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${STATUS_COLORS[leave.status]}`}>
                        {leave.status}
                      </span>
                      {leave.adminComment && (
                        <p className="text-xs text-slate-500 mt-1">{leave.adminComment}</p>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="rounded-2xl p-8 w-full max-w-md border border-slate-800"
            style={{ background: '#0d1426' }}>
            <div className="flex justify-between items-center mb-6"><div>
                <h2 className="text-xl font-bold text-white">Apply for Leave</h2>
                <p className="text-sm text-slate-500">Fill in your leave details</p>
              </div>
              <button onClick={() => setShowModal(false)}
                className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-400 mb-1 block">Leave Type</label>
                <select value={form.leaveType}
                  onChange={e => setForm({ ...form, leaveType: e.target.value })}
                  className="w-full rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-white border border-slate-700 capitalize"
                  style={{ background: '#111827' }}>
                  {LEAVE_TYPES.map(t => (
                    <option key={t} value={t} className="capitalize">{t}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-400 mb-1 block">Start Date</label>
                  <input type="date"
                    value={form.startDate}
                    onChange={e => setForm({ ...form, startDate: e.target.value })}
                    className="w-full rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-white border border-slate-700"
                    style={{ background: '#111827' }} />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-400 mb-1 block">End Date</label>
                  <input type="date"
                    value={form.endDate}
                    onChange={e => setForm({ ...form, endDate: e.target.value })}
                    className="w-full rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-white border border-slate-700"
                    style={{ background: '#111827' }} />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-400 mb-1 block">Reason</label>
                <textarea
                  value={form.reason}
                  onChange={e => setForm({ ...form, reason: e.target.value })}
                  rows={3}
                  placeholder="Briefly describe the reason for your leave..."
                  className="w-full rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-white placeholder-slate-600 border border-slate-700 resize-none text-sm"
                  style={{ background: '#111827' }}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)}
                className="flex-1 border border-slate-700 text-slate-400 py-3 rounded-xl hover:bg-slate-800 font-medium transition">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 text-white py-3 rounded-xl font-medium transition disabled:opacity-50"
                style={{ background: '#10b981' }}>
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}