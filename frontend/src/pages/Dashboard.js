import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { Users, Brain, Briefcase, TrendingUp, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
   PieChart, Pie, Cell, Legend } from 'recharts';
import { useMounted, fadeUp, fadeIn } from '../hooks/useAnimation';


const COLORS = ['#f59e0b', '#6366f1', '#10b981', '#ef4444', '#8b5cf6'];

export default function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const mounted = useMounted();

  useEffect(() => {
    axios.get('/employees').then(res => {
      setEmployees(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === 'active').length;
  const totalSkills = employees.reduce((acc, e) => acc + (e.skills?.length || 0), 0);

  const deptData = employees.reduce((acc, e) => {
    acc[e.department] = (acc[e.department] || 0) + 1;
    return acc;
  }, {});
  const chartData = Object.entries(deptData).map(([name, value]) => ({ name, value }));

  const skillData = employees.reduce((acc, e) => {
    (e.skills || []).forEach(s => {
      acc[s.category] = (acc[s.category] || 0) + 1;
    });
    return acc;
  }, {});
  const skillChartData = Object.entries(skillData).map(([name, value]) => ({ name, value }));

  const stats = [
    { label: 'Total Employees', value: totalEmployees, icon: Users, color: 'text-amber-400', bg: 'bg-amber-400 bg-opacity-10' },
    { label: 'Active Employees', value: activeEmployees, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400 bg-opacity-10' },
    { label: 'Total Skills', value: totalSkills, icon: Brain, color: 'text-purple-400', bg: 'bg-purple-400 bg-opacity-10' },
    { label: 'Departments', value: Object.keys(deptData).length, icon: Briefcase, color: 'text-blue-400', bg: 'bg-blue-400 bg-opacity-10' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
  <div style={fadeIn(mounted)}>
      <div className="mb-8" style={fadeUp(mounted, 100)}>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">Welcome back! Here is your organization overview.</p>
      </div>

      <div className="grid grid-cols-4 gap-5 mb-8" style={fadeUp(mounted, 200)}>
        {stats.map((stat, i) => (
          <div key={i} className="rounded-2xl p-6 border border-slate-800 hover:border-amber-500 transition"
            style={{ background: '#111827' }}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                <stat.icon size={22} className={stat.color} />
              </div>
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium bg-emerald-400 bg-opacity-10 px-2 py-1 rounded-full">
                <ArrowUpRight size={12} /> Live
              </span>
            </div>
            <p className="text-4xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-sm text-slate-400">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6" style={fadeUp(mounted, 300)}>
        <div className="rounded-2xl p-6 border border-slate-800" style={{ background: '#111827' }}>
          <h2 className="text-lg font-bold text-white mb-1">Employees by Department</h2>
          <p className="text-sm text-slate-400 mb-6">Distribution across teams</p>
          {chartData.length === 0 ? (
            <p className="text-slate-500 text-center py-12">Add employees to see data</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} barSize={36}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ background: '#0d1426', border: '1px solid #1e2a45', borderRadius: '12px', color: '#fff' }}
                  cursor={{ fill: 'rgba(245,158,11,0.05)' }}
                />
                <Bar dataKey="value" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-2xl p-6 border border-slate-800" style={{ background: '#111827' }}>
          <h2 className="text-lg font-bold text-white mb-1">Skills Distribution</h2>
          <p className="text-sm text-slate-400 mb-6">Skills by category</p>
          {skillChartData.length === 0 ? (
            <p className="text-slate-500 text-center py-12">Add skills to see data</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={skillChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50}>
                  {skillChartData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0d1426', border: '1px solid #1e2a45', borderRadius: '12px', color: '#fff' }} />
                <Legend formatter={(value) => <span style={{ color: '#94a3b8' }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div style={fadeUp(mounted, 400)} className="rounded-2xl p-6 border border-slate-800" >
        <h2 className="text-lg font-bold text-white mb-4">Recent Employees</h2>
        <div className="divide-y divide-slate-800">
          {employees.slice(0, 5).map((emp, i) => (
            <div key={emp._id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm"
                  style={{ background: '#f59e0b' }}>
                  {emp.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-white">{emp.name}</p>
                  <p className="text-sm text-slate-400">{emp.role} · {emp.department}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-400">{emp.experience} yrs</span>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${emp.status === 'active' ? 'bg-emerald-400 bg-opacity-10 text-emerald-400' : 'bg-red-400 bg-opacity-10 text-red-400'}`}>
                  {emp.status}
                </span>
              </div>
            </div>
          ))}
          {employees.length === 0 && (
            <p className="text-slate-500 text-center py-8">No employees yet</p>
          )}
        </div>
      </div>
    </div>
  );
}