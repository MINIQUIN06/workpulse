import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Brain, Star, LogOut, Zap, User, Briefcase, UserCheck,
   CalendarDays, ListTodo, DollarSign} from 'lucide-react';
import NotificationBell from './NotificationBell';   

export default function EmployeeLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/home');
  };

  const navClass = ({ isActive }) =>
    isActive
      ? 'flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-white'
      : 'flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition';

  const activeStyle = { background: '#10b981' };

  return (
    //<div className="flex h-screen" style={{ background: '#0a0f1e' }}>
    <div className="flex" style={{ background: '#0a0f1e', minHeight: '100vh' }}>
      <div className="w-64 flex flex-col border-r border-slate-800" style={{ background: '#0d1426' }}>
        <div className="p-6 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#10b981' }}>
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">WorkPulse</h1>
              <p className="text-xs text-slate-500">Employee Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          <p className="text-xs font-semibold text-slate-600 px-4 py-2 uppercase tracking-wider">My Space</p>
          <NavLink to="/employee" end
            className={navClass}
            style={({ isActive }) => isActive ? activeStyle : {}}>
            <Home size={18} />
            <span>Dashboard</span>
          </NavLink>

           <NavLink to="/employee/tasks"
              className={navClass}
              style={({ isActive }) => isActive ? activeStyle : {}}>
              <ListTodo size={18} />
              <span>Tasks</span>
          </NavLink>

           <NavLink to="/employee/attendance"
            className={navClass}
             style={({ isActive }) => isActive ? activeStyle : {}}>
             <UserCheck size={18} />
            <span>Attendance</span>
           </NavLink>
           
          <NavLink to="/employee/leaves"
              className={navClass}
              style={({ isActive }) => isActive ? activeStyle : {}}>
             <CalendarDays size={18} />
             <span>Leave Requests</span>
           </NavLink> 

          <NavLink to="/employee/projects"
            className={navClass}
            style={({ isActive }) => isActive ? activeStyle : {}}>
            <Briefcase size={18} />
            <span>Projects</span>
          </NavLink>

          <NavLink to="/employee/skills"
            className={navClass}
            style={({ isActive }) => isActive ? activeStyle : {}}>
            <Star size={18} />
            <span>Skills & Competencies</span>
          </NavLink>
         
          <NavLink to="/employee/payroll"
             className={navClass}
             style={({ isActive }) => isActive ? activeStyle : {}}>
             <DollarSign size={18} />
              <span>Payroll & Compensation</span>
          </NavLink>

          <p className="text-xs font-semibold text-slate-600 px-4 py-2 mt-4 uppercase tracking-wider">AI Tools</p>
          <NavLink to="/employee/analysis"
            className={navClass}
            style={({ isActive }) => isActive ? activeStyle : {}}>
            <Brain size={18} />
            <span>Skill Analysis</span>
          </NavLink>

          <p className="text-xs font-semibold text-slate-600 px-4 py-2 mt-4 uppercase tracking-wider">Account</p>
          <NavLink to="/employee/profile"
            className={navClass}
            style={({ isActive }) => isActive ? activeStyle : {}}>
            <User size={18} />
            <span>Profile Settings</span>
          </NavLink>
        </nav>

        <div className="p-4 mx-3 mb-4 rounded-xl border border-slate-800" style={{ background: '#111827' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white"
              style={{ background: '#10b981' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{user?.name}</p>
              <p className="text-xs text-slate-500">Employee</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-emerald-400 transition w-full">
            <LogOut size={14} />
            <span>Sign out</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto min-h-screen" style={{ background: '#0a0f1e' }}>
        <div className="flex items-center justify-end px-8 py-4 border-b border-slate-800"
          style={{ background: '#0d1426' }}>
          <NotificationBell />
        </div>
        <div className="p-8 min-h-screen" style={{ background: '#0a0f1e' }}>
          <Outlet />
        </div>
      </div>

    </div>
  );
}