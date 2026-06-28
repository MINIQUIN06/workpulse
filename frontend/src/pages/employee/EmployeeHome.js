import { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Brain, Star, Briefcase, TrendingUp } from 'lucide-react';
import { useMounted, fadeUp, fadeIn } from '../../hooks/useAnimation';

export default function EmployeeHome() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const mounted = useMounted();

  useEffect(() => {
    if (user?.employeeId) {
      Promise.all([
        axios.get(`/employees/${user.employeeId}`),
        axios.get(`/skills/${user.employeeId}`),
        axios.get(`/projects/my/${user.employeeId}`)
      ]).then(([empRes, skillRes, projRes]) => {
        setProfile(empRes.data);
        setSkills(skillRes.data);
        setProjects(projRes.data);
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!profile) return (
    <div className="rounded-2xl p-8 text-center border border-slate-800" style={{ background: '#111827' }}>
      <Brain size={48} className="text-slate-700 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-white">Profile Not Linked</h2>
      <p className="text-slate-500 mt-2">Ask your admin to add you as an employee first.</p>
    </div>
  );

  const stats = [
    { label: 'My Skills', value: skills.length, icon: Star, color: 'text-emerald-400', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Experience', value: `${profile.experience} yrs`, icon: TrendingUp, color: 'text-blue-400', bg: 'rgba(99,102,241,0.1)' },
    { label: 'Projects', value: projects.length, icon: Briefcase, color: 'text-purple-400', bg: 'rgba(139,92,246,0.1)' },
    { label: 'Department', value: profile.department, icon: Brain, color: 'text-amber-400', bg: 'rgba(245,158,11,0.1)' },
  ];

  return (
    <div style={fadeIn(mounted)}>
      <div className="mb-8" style={fadeUp(mounted, 100)}>
        <h1 className="text-3xl font-bold text-white">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-slate-400 mt-1">Here is your personal workspace overview</p>
      </div>

      <div className="rounded-2xl p-6 border border-slate-800 mb-6" style={fadeUp(mounted, 200)}>
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white"
            style={{ background: '#10b981' }}>
            {profile.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
            <p className="text-emerald-400 font-semibold">{profile.role}</p>
            <p className="text-slate-500">{profile.department} · {profile.email}</p>
          </div>
          <div className="ml-auto">
            <span className="px-4 py-2 rounded-full font-medium text-sm text-emerald-400 border border-emerald-400 border-opacity-30"
              style={{ background: 'rgba(16,185,129,0.05)' }}>
              Active Employee
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5 mb-6" style={fadeUp(mounted, 300)}>
        {stats.map((stat, i) => (
          <div key={i} className="rounded-2xl p-6 border border-slate-800 hover:border-emerald-500 hover:border-opacity-30 transition"
            style={{ background: '#111827' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{ background: stat.bg }}>
              <stat.icon size={22} className={stat.color} />
            </div>
            <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-sm text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div><div className="rounded-2xl p-6 border border-slate-800" style={fadeUp(mounted, 400)}>
        <h2 className="text-lg font-bold text-white mb-4">My Skills Overview</h2>
        {skills.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No skills yet. Go to My Skills to add some!</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map(skill => (
              <span key={skill._id}
                className="px-4 py-2 rounded-xl text-sm font-medium text-emerald-400 border border-emerald-400 border-opacity-20"
                style={{ background: 'rgba(16,185,129,0.05)' }}>
                {skill.name} · {skill.level}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}