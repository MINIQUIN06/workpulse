import { useEffect, useState, useCallback } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Clock, CheckCircle, LogIn, LogOut } from 'lucide-react'; //AlertCircle, XCircle
import { useMounted, fadeUp, fadeIn } from '../../hooks/useAnimation';

const STATUS_COLORS = {
  present: 'bg-green-400 bg-opacity-10 text-green-400',
  late: 'bg-yellow-400 bg-opacity-10 text-yellow-400',
  absent: 'bg-red-400 bg-opacity-10 text-red-400',
  'half-day': 'bg-orange-400 bg-opacity-10 text-orange-400'
};

export default function EmployeeAttendance() {
  const { user } = useAuth();
  const [todayStatus, setTodayStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const mounted = useMounted();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = useCallback(async() => {
    if (!user?.employeeId) { 
      setLoading(false); 
      return; }
    try {
      const [todayRes, historyRes] = await Promise.all([
        axios.get(`/attendance/today/${user.employeeId}`),
        axios.get(`/attendance/my/${user.employeeId}`)
      ]);
      setTodayStatus(todayRes.data);
      setHistory(historyRes.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  },[user]);

  useEffect(() => { 
    fetchData(); 
  }, [user, fetchData]);

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      await axios.post('/attendance/check-in', { employeeId: user.employeeId });
      toast.success('Checked in successfully!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check in failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      await axios.post('/attendance/check-out', { employeeId: user.employeeId });
      toast.success('Checked out successfully!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check out failed');
    } finally {
      setActionLoading(false);
    }
  };

  const presentDays = history.filter(h => h.status === 'present').length;
  const lateDays = history.filter(h => h.status === 'late').length;
  const halfDays = history.filter(h => h.status === 'half-day').length;
  const totalHours = history.reduce((acc, h) => acc + (h.workHours || 0), 0).toFixed(1);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div style={fadeIn(mounted)}>
      <div className="mb-8" style={fadeUp(mounted, 100)}>
        <h1 className="text-3xl font-bold text-white">My Attendance</h1>
        <p className="text-slate-400 mt-1">Track your daily attendance</p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6" style={fadeUp(mounted, 200)}>
        {/* Check In/Out Card */}
        <div className="rounded-2xl p-8 border border-slate-800 text-center"
          style={{ background: '#111827' }}>
          <div className="mb-6">
            <p className="text-slate-400 text-sm mb-1">Current Time</p>
            <p className="text-4xl font-bold text-white font-mono">
              {currentTime.toLocaleTimeString('en-US', {
                hour: '2-digit', minute: '2-digit', second: '2-digit'
              })}
            </p>
            <p className="text-slate-500 text-sm mt-1">
              {currentTime.toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              })}
            </p>
          </div>

          {!todayStatus ? (<div>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-slate-700"
                style={{ background: '#0d1426' }}>
                <Clock size={32} className="text-slate-500" />
              </div>
              <p className="text-slate-400 mb-6">You haven't checked in yet</p>
              <button onClick={handleCheckIn} disabled={actionLoading}
                className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-semibold text-white transition disabled:opacity-50"
                style={{ background: '#10b981' }}>
                <LogIn size={20} />
                {actionLoading ? 'Processing...' : 'Check In'}
              </button>
            </div>
          ) : !todayStatus.checkOut ? (
            <div>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-emerald-500"
                style={{ background: 'rgba(16,185,129,0.1)' }}>
                <CheckCircle size={32} className="text-emerald-400" />
              </div>
              <p className="text-emerald-400 font-semibold mb-1">Checked In</p>
              <p className="text-slate-400 text-sm mb-2">at {todayStatus.checkIn}</p>
              <span className={`text-xs px-3 py-1 rounded-full font-medium mb-6 inline-block ${STATUS_COLORS[todayStatus.status]}`}>
                {todayStatus.status}
              </span>
              <button onClick={handleCheckOut} disabled={actionLoading}
                className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-semibold text-white transition disabled:opacity-50 mt-4"
                style={{ background: '#f59e0b' }}>
                <LogOut size={20} />
                {actionLoading ? 'Processing...' : 'Check Out'}
              </button>
            </div>
          ) : (
            <div>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-amber-500"
                style={{ background: 'rgba(245,158,11,0.1)' }}>
                <CheckCircle size={32} className="text-amber-400" />
              </div>
              <p className="text-amber-400 font-semibold mb-1">Day Complete!</p>
              <div className="space-y-2 mt-4 text-sm">
                <div className="flex justify-between px-4 py-2 rounded-lg border border-slate-800"
                  style={{ background: '#0d1426' }}>
                  <span className="text-slate-400">Check In</span>
                  <span className="text-emerald-400 font-medium">{todayStatus.checkIn}</span>
                </div>
                <div className="flex justify-between px-4 py-2 rounded-lg border border-slate-800"
                  style={{ background: '#0d1426' }}>
                  <span className="text-slate-400">Check Out</span>
                  <span className="text-amber-400 font-medium">{todayStatus.checkOut}</span>
                </div>
                <div className="flex justify-between px-4 py-2 rounded-lg border border-slate-800"
                  style={{ background: '#0d1426' }}>
                  <span className="text-slate-400">Work Hours</span>
                  <span className="text-white font-bold">{todayStatus.workHours} hrs</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Card */}
        <div className="space-y-4">
          <div className="rounded-2xl p-6 border border-slate-800" style={{ background: '#111827' }}>
            <h2 className="text-lg font-bold text-white mb-4">My Stats (Last 30 Days)</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Present Days', value: presentDays, color: 'text-emerald-400', bg: 'rgba(16,185,129,0.1)' },{ label: 'Late Days', value: lateDays, color: 'text-yellow-400', bg: 'rgba(234,179,8,0.1)' },
                { label: 'Half Days', value: halfDays, color: 'text-orange-400', bg: 'rgba(249,115,22,0.1)' },
                { label: 'Total Hours', value: `${totalHours}h`, color: 'text-amber-400', bg: 'rgba(245,158,11,0.1)' },
              ].map((stat, i) => (
                <div key={i} className="rounded-xl p-4 border border-slate-800"
                  style={{ background: '#0d1426' }}>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Attendance History */}
      <div className="rounded-2xl border border-slate-800 overflow-hidden"
        style={fadeUp(mounted, 300)}>
        <div className="p-5 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">Attendance History</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Date</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Check In</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Check Out</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Hours</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {history.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-16 text-slate-500">
                  <Clock size={32} className="mx-auto mb-2 text-slate-700" />
                  <p>No attendance history yet</p>
                </td>
              </tr>
            ) : (
              history.map(record => (
                <tr key={record._id} className="hover:bg-slate-800 hover:bg-opacity-30 transition">
                  <td className="px-6 py-4 text-white font-medium">{record.date}</td>
                  <td className="px-6 py-4 text-emerald-400">{record.checkIn || '—'}</td>
                  <td className="px-6 py-4 text-slate-300">{record.checkOut || '—'}</td>
                  <td className="px-6 py-4 text-amber-400 font-medium">
                    {record.workHours ? `${record.workHours} hrs` : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${STATUS_COLORS[record.status]}`}>
                    {record.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}