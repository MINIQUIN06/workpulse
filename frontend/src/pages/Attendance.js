import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { Users, Clock, CheckCircle, XCircle, AlertCircle, Calendar } from 'lucide-react';
import { useMounted, fadeUp, fadeIn } from '../hooks/useAnimation';

const STATUS_COLORS = {
  present: 'bg-green-400 bg-opacity-10 text-green-400',
  late: 'bg-yellow-400 bg-opacity-10 text-yellow-400',
  absent: 'bg-red-400 bg-opacity-10 text-red-400',
  'half-day': 'bg-orange-400 bg-opacity-10 text-orange-400'
};

const STATUS_ICONS = {
  present: CheckCircle,
  late: AlertCircle,
  absent: XCircle,
  'half-day': Clock
};

export default function Attendance() {
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('today');
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const mounted = useMounted();

  const fetchTodayAttendance = async () => {
    try {
      const res = await axios.get('/attendance/all');
      setTodayAttendance(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchReport = async () => {
    try {
      const res = await axios.get(`/attendance/report?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
      setReport(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    Promise.all([
      fetchTodayAttendance(),
      axios.get('/employees').then(res => setEmployees(res.data))
    ]).finally(() => setLoading(false));
  }, []);

  const presentCount = todayAttendance.filter(a => a.status === 'present').length;
  const lateCount = todayAttendance.filter(a => a.status === 'late').length;
  const absentCount = employees.length - todayAttendance.length;

  const stats = [
    { label: 'Total Employees', value: employees.length, icon: Users, color: 'text-amber-400', bg: 'rgba(245,158,11,0.1)' },
    { label: 'Present Today', value: presentCount, icon: CheckCircle, color: 'text-green-400', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Late Today', value: lateCount, icon: AlertCircle, color: 'text-yellow-400', bg: 'rgba(234,179,8,0.1)' },
    { label: 'Absent Today', value: absentCount, icon: XCircle, color: 'text-red-400', bg: 'rgba(239,68,68,0.1)' },
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
      <div className="flex justify-between items-center mb-8" style={fadeUp(mounted, 100)}>
        <div>
          <h1 className="text-3xl font-bold text-white">Attendance</h1>
          <p className="text-slate-400 mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-green-500 border-opacity-30"
          style={{ background: 'rgba(16,185,129,0.05)' }}>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-sm font-medium">Live</span>
        </div>
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
        <button onClick={() => setActiveTab('today')}
          className={tabClass('today')}
          style={activeTab === 'today' ? { background: '#f59e0b' } : {}}>
          Today
        </button>
        <button onClick={() => { setActiveTab('report'); fetchReport(); }}
          className={tabClass('report')}
          style={activeTab === 'report' ? { background: '#f59e0b' } : {}}>
          Report
        </button>
      </div>

      {activeTab === 'today' && (
        <div className="rounded-2xl border border-slate-800 overflow-hidden"
          style={{ background: '#111827' }}>
          <div className="p-5 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white">Today's Attendance</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Employee</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Check In</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Check Out</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Work Hours</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {todayAttendance.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-16 text-slate-500">
                    <Clock size={32} className="mx-auto mb-2 text-slate-700" />
                    <p>No attendance recorded today</p>
                  </td>
                </tr>
              ) : (
                todayAttendance.map((record, i) => {
                  const StatusIcon = STATUS_ICONS[record.status] || CheckCircle;
                  return (
                    <tr key={record._id} className="hover:bg-slate-800 hover:bg-opacity-30 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm"
                            style={{ background: '#f59e0b' }}>
                            {record.employee?.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{record.employee?.name}</p>
                            <p className="text-xs text-slate-500">{record.employee?.department}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-emerald-400 font-medium">{record.checkIn || '—'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-300">{record.checkOut || '—'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-amber-400 font-medium">
                          {record.workHours ? `${record.workHours} hrs`: '—'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium w-fit ${STATUS_COLORS[record.status]}`}>
                          <StatusIcon size={12} />
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {employees.length > todayAttendance.length && (
            <div className="p-5 border-t border-slate-800">
              <p className="text-sm text-slate-500 mb-3">Absent Today:</p>
              <div className="flex flex-wrap gap-2">
                {employees
                  .filter(emp => !todayAttendance.find(a => a.employee?._id === emp._id))
                  .map((emp, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-500 border-opacity-20"
                      style={{ background: 'rgba(239,68,68,0.05)' }}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white bg-red-500">
                        {emp.name.charAt(0)}
                      </div>
                      <span className="text-sm text-red-400">{emp.name}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'report' && (
        <div className="space-y-5">
          <div className="rounded-2xl p-6 border border-slate-800" style={{ background: '#111827' }}>
            <h2 className="text-base font-bold text-white mb-4">Date Range Report</h2>
            <div className="flex gap-4 items-end">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Start Date</label>
                <input type="date"
                  value={dateRange.startDate}
                  onChange={e => setDateRange({ ...dateRange, startDate: e.target.value })}
                  className="rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white border border-slate-700"
                  style={{ background: '#0d1426' }} />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">End Date</label>
                <input type="date"
                  value={dateRange.endDate}
                  onChange={e => setDateRange({ ...dateRange, endDate: e.target.value })}
                  className="rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white border border-slate-700"
                  style={{ background: '#0d1426' }} />
              </div>
              <button onClick={fetchReport}
                className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl font-medium"
                style={{ background: '#f59e0b' }}>
                <Calendar size={16} />
                Generate Report
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 overflow-hidden"
            style={{ background: '#111827' }}>
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Employee</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Date</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Check In</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Check Out</th><th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Hours</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {report.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-16 text-slate-500">
                      Select date range and generate report
                    </td>
                  </tr>
                ) : (
                  report.map(record => {
                    const StatusIcon = STATUS_ICONS[record.status] || CheckCircle;
                    return (
                      <tr key={record._id} className="hover:bg-slate-800 hover:bg-opacity-30 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs"
                              style={{ background: '#f59e0b' }}>
                              {record.employee?.name?.charAt(0)}
                            </div>
                            <p className="font-medium text-white">{record.employee?.name}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-400">{record.date}</td>
                        <td className="px-6 py-4 text-emerald-400">{record.checkIn || '—'}</td>
                        <td className="px-6 py-4 text-slate-300">{record.checkOut || '—'}</td>
                        <td className="px-6 py-4 text-amber-400">{record.workHours ? `${record.workHours} hrs` : '—'}</td>
                        <td className="px-6 py-4">
                          <span className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium w-fit ${STATUS_COLORS[record.status]}`}>
                            <StatusIcon size={12} />
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}