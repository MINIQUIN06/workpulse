import { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, Calendar, Users } from 'lucide-react';
import { useMounted, fadeUp, fadeIn } from '../../hooks/useAnimation';

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

export default function EmployeeProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const mounted = useMounted();

  useEffect(() => {
    if (user?.employeeId) {
      axios.get(`/projects/my/${user.employeeId}`)
        .then(res => { setProjects(res.data); setLoading(false); })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div style={fadeIn(mounted)}>
      <div className="mb-8" style={fadeUp(mounted, 100)}>
        <h1 className="text-3xl font-bold text-white">My Projects</h1>
        <p className="text-slate-400 mt-1">{projects.length} projects assigned to you</p>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-2xl p-12 text-center border border-slate-800"
          style={{ background: '#111827' }}>
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(16,185,129,0.1)' }}>
            <Briefcase size={36} className="text-emerald-400 opacity-50" />
          </div>
          <h3 className="text-lg font-bold text-slate-500">No Projects Yet</h3>
          <p className="text-slate-600 text-sm mt-2">
            You have not been assigned to any projects yet
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5" style={fadeUp(mounted, 200)}>
          {projects.map(project => (
            <div key={project._id}
              className="rounded-2xl p-6 border border-slate-800 hover:border-emerald-500 hover:border-opacity-30 transition"
              style={{ background: '#111827' }}>
              <div className="mb-4">
                <h3 className="font-bold text-white text-xl">{project.name}</h3>
                <p className="text-slate-400 text-sm mt-1">{project.description}</p>
              </div>

              <div className="flex gap-2 mb-4">
                <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${STATUS_COLORS[project.status]}`}>
                  {project.status}
                </span>
                <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${PRIORITY_COLORS[project.priority]}`}>
                  {project.priority} priority
                </span>
              </div>

              {project.startDate && (
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                  <Calendar size={14} className="text-emerald-400" />
                  <span>
                    {new Date(project.startDate).toLocaleDateString()} —
                    {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Ongoing'}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                <Users size={14} className="text-emerald-400" />
                <span>{project.teamMembers?.length || 0} team members</span>
              </div>

              {project.requiredSkills?.length > 0 && (<div>
                  <p className="text-xs text-slate-500 mb-2">Required Skills:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.requiredSkills.map((skill, i) => (
                      <span key={i}
                        className="text-xs px-2 py-1 rounded-full font-medium text-emerald-400 border border-emerald-400 border-opacity-20"
                        style={{ background: 'rgba(16,185,129,0.05)' }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-slate-800">
                <p className="text-xs text-slate-500 mb-2">Team:</p>
                <div className="flex -space-x-2">
                  {project.teamMembers?.slice(0, 5).map((member, i) => (
                    <div key={i}
                      className="w-8 h-8 rounded-full border-2 border-slate-900 flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: '#10b981' }}
                      title={member.name}>
                      {member.name?.charAt(0)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}