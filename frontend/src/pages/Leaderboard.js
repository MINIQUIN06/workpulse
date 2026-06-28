import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { Trophy } from 'lucide-react';

const SKILL_SCORES = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4
};

const BADGES = [
  { min: 16, label: 'Legend', color: 'bg-yellow-400 bg-opacity-10 text-yellow-400', icon: '👑' },
  { min: 12, label: 'Expert', color: 'bg-purple-400 bg-opacity-10 text-purple-400', icon: '💎' },
  { min: 8, label: 'Advanced', color: 'bg-blue-400 bg-opacity-10 text-blue-400', icon: '🚀' },
  { min: 4, label: 'Rising Star', color: 'bg-green-400 bg-opacity-10 text-green-400', icon: '⭐' },
  { min: 0, label: 'Beginner', color: 'bg-slate-400 bg-opacity-10 text-slate-400', icon: '🌱' },
];

const AVATAR_COLORS = [
  '#f59e0b', '#6366f1', '#10b981', '#ef4444',
  '#8b5cf6', '#06b6d4', '#f43f5e', '#84cc16'
];

export default function Leaderboard() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overall');
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get('/employees');
      setEmployees(res.data);
      setDepartments([...new Set(res.data.map(e => e.department))]);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  const getScore = (emp) =>
    (emp.skills || []).reduce((acc, skill) => acc + (SKILL_SCORES[skill.level] || 0), 0);

  const getBadge = (score) =>
    BADGES.find(b => score >= b.min) || BADGES[BADGES.length - 1];

  const getRanked = () => {
    let filtered = employees;
    if (activeTab === 'department' && selectedDept) {
      filtered = employees.filter(e => e.department === selectedDept);
    }
    return filtered
      .map(emp => ({ ...emp, score: getScore(emp) }))
      .sort((a, b) => b.score - a.score);
  };

  const ranked = getRanked();
  const topThree = ranked.slice(0, 3);
  //const rest = ranked.slice(3);

  const deptStats = departments.map(dept => {
    const emps = employees.filter(e => e.department === dept);
    const total = emps.reduce((acc, e) => acc + getScore(e), 0);
    return { dept, total, avg: emps.length ? (total / emps.length).toFixed(1) : 0, count: emps.length };
  }).sort((a, b) => b.total - a.total);

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
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Skill Leaderboard</h1>
          <p className="text-slate-400 mt-1">Live rankings based on skill scores</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-green-500 border-opacity-30"
          style={{ background: 'rgba(16,185,129,0.05)' }}>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400">Live Updates</span>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <button onClick={() => setActiveTab('overall')}
          className={tabClass('overall')}
          style={activeTab === 'overall' ? { background: '#f59e0b' } : {}}>Overall Rankings
        </button>
        <button onClick={() => setActiveTab('department')}
          className={tabClass('department')}
          style={activeTab === 'department' ? { background: '#f59e0b' } : {}}>
          By Department
        </button>
        <button onClick={() => setActiveTab('deptStats')}
          className={tabClass('deptStats')}
          style={activeTab === 'deptStats' ? { background: '#f59e0b' } : {}}>
          Department Stats
        </button>
      </div>

      {activeTab === 'department' && (
        <div className="mb-6">
          <select value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
            className="rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white border border-slate-700"
            style={{ background: '#111827' }}>
            <option value="">All Departments</option>
            {departments.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
      )}

      {activeTab === 'deptStats' ? (
        <div className="rounded-2xl border border-slate-800 overflow-hidden"
          style={{ background: '#111827' }}>
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white">Department Rankings</h2>
          </div>
          <div className="divide-y divide-slate-800">
            {deptStats.map((dept, i) => (
              <div key={dept.dept}
                className="flex items-center justify-between p-5 hover:bg-slate-800 hover:bg-opacity-30 transition">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white"
                    style={{ background: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#f97316' : '#6366f1' }}>
                    {i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}
                  </div>
                  <div>
                    <p className="font-bold text-white">{dept.dept}</p>
                    <p className="text-sm text-slate-500">{dept.count} employees</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-amber-400">{dept.total}</p>
                    <p className="text-xs text-slate-500">Total Score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-400">{dept.avg}</p>
                    <p className="text-xs text-slate-500">Avg Score</p>
                  </div>
                  <div className="w-32 bg-slate-800 rounded-full h-2">
                    <div className="h-2 rounded-full"
                      style={{
                        background: '#f59e0b',
                        width: `${Math.min((dept.total / (deptStats[0]?.total || 1)) * 100, 100)}%`
                      }}>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          {topThree.length > 0 && (
            <div className="grid grid-cols-3 gap-5 mb-6">
              {[topThree[1], topThree[0], topThree[2]].filter(Boolean).map((emp, i) => {
                const actualRank = i === 0 ? 2 : i === 1 ? 1 : 3;
                const badge = getBadge(emp.score);
                return (
                  <div key={emp._id}
                    className="rounded-2xl p-6 text-center border transition"
                    style={{
                      background: '#111827',
                      borderColor: actualRank === 1 ? '#f59e0b' : actualRank === 2 ? '#94a3b8' : '#f97316'}}>
                    <div className="text-4xl mb-3">
                      {actualRank === 1 ? '🥇' : actualRank === 2 ? '🥈' : '🥉'}
                    </div>
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white mx-auto mb-3"
                      style={{ background: AVATAR_COLORS[employees.indexOf(emp) % AVATAR_COLORS.length] }}>
                      {emp.name.charAt(0)}
                    </div>
                    <h3 className="font-bold text-white text-lg">{emp.name}</h3>
                    <p className="text-slate-400 text-sm mb-3">{emp.role}</p>
                    <div className="text-3xl font-bold text-amber-400 mb-1">{emp.score}</div>
                    <p className="text-xs text-slate-500 mb-3">Skill Points</p>
                    <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${badge.color}`}>
                      {badge.icon} {badge.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="rounded-2xl border border-slate-800 overflow-hidden"
            style={{ background: '#111827' }}>
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Full Rankings</h2>
              <span className="text-sm text-slate-500">{ranked.length} employees</span>
            </div>
            <div className="divide-y divide-slate-800">
              {ranked.map((emp, index) => {
                const badge = getBadge(emp.score);
                return (
                  <div key={emp._id}
                    className="flex items-center justify-between p-5 hover:bg-slate-800 hover:bg-opacity-30 transition">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
                        style={{
                          background: index < 3
                            ? (index === 0 ? '#f59e0b' : index === 1 ? '#94a3b8' : '#f97316')
                            : '#1e2a45',
                          color: 'white',
                          fontSize: index < 3 ? '18px' : '14px'
                        }}>
                        {index < 3 ? ['🥇', '🥈', '🥉'][index] : index + 1}
                      </div>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm"
                        style={{ background: AVATAR_COLORS[index % AVATAR_COLORS.length] }}>
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-white">{emp.name}</p>
                        <p className="text-sm text-slate-500">{emp.role} · {emp.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="font-bold text-slate-300">{emp.skills?.length || 0}</p>
                        <p className="text-xs text-slate-500">Skills</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-amber-400 text-lg">{emp.score}</p>
                        <p className="text-xs text-slate-500">Points</p>
                      </div>
                      <div className="w-32 bg-slate-800 rounded-full h-2">
                        <div className="h-2 rounded-full transition-all"
                          style={{
                            background: '#f59e0b',
                            width: `${Math.min((emp.score / (ranked[0]?.score || 1)) * 100, 100)}%`}}>
                        </div>
                      </div>
                      <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${badge.color}`}>
                        {badge.icon} {badge.label}
                      </span>
                    </div>
                  </div>
                );
              })}
              {ranked.length === 0 && (
                <div className="text-center py-16">
                  <Trophy size={48} className="text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-500">Add employees and skills to see rankings!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}