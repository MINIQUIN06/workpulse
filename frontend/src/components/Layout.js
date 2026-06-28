import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, Brain, Layers,Shield,                //FileText, Trophy
  LogOut, Zap, Briefcase, UserCheck, CalendarDays, ListTodo, DollarSign
} from 'lucide-react';
import NotificationBell from './NotificationBell';
import HRChatBot from './HRChatBot';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/home');
  };

  const navClass = ({ isActive }) =>
    isActive
      ? 'flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500 text-white font-semibold shadow-lg'
      : 'flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition';

  return (
    <div className="flex" style={{ background: '#0a0f1e', minHeight: '100vh' }}>
      <div className="w-64 flex flex-col border-r border-slate-800" style={{ background: '#0d1426' }}>
        <div className="p-6 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#f59e0b' }}>
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">WorkPulse</h1>
              <p className="text-xs text-slate-500">Employee Management System</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          <p className="text-xs font-semibold text-slate-600 px-4 py-2 uppercase tracking-wider">Overview</p>
          <NavLink to="/" end className={navClass}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <p className="text-xs font-semibold text-slate-600 px-4 py-2 uppercase tracking-wider">Workforce</p>
          <NavLink to="/employees" className={navClass}>
            <Users size={18} />
            <span>Employees</span>
          </NavLink>

          <NavLink to="/attendance" className={navClass}>
           <UserCheck size={18} />
           <span>Attendance</span>
          </NavLink>

          <NavLink to="/leaves" className={navClass}>
           <CalendarDays size={18} />
           <span>Leave Requests</span>
          </NavLink>

          <NavLink to="/payroll" className={navClass}>
             <DollarSign size={18} />
              <span>Payroll</span>
          </NavLink>

          <NavLink to="/accounts" className={navClass}>
             <Shield size={18} />
              <span>Manage Accounts</span>
          </NavLink>
          
          <p className="text-xs font-semibold text-slate-600 px-4 py-2 mt-4 uppercase tracking-wider">Work Management</p>
          
          <NavLink to="/projects" className={navClass}>
            <Briefcase size={18} />
            <span>Projects</span>
          </NavLink>

           <NavLink to="/tasks" className={navClass}>
             <ListTodo size={18} />
             <span>Tasks</span>
           </NavLink>
           
          <p className="text-xs font-semibold text-slate-600 px-4 py-2 mt-4 uppercase tracking-wider">AI Tools</p>
          
          <NavLink to="/skill-analyzer" className={navClass}>
            <Brain size={18} />
            <span>Skill Analyzer</span>
          </NavLink>

          <NavLink to="/team-builder" className={navClass}>
            <Layers size={18} />
            <span>Team Builder</span>
          </NavLink>
         </nav> 
          


        <div className="p-4 mx-3 mb-4 rounded-xl border border-slate-800" style={{ background: '#111827' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white" style={{ background: '#f59e0b' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{user?.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-amber-400 transition w-full">
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
      <HRChatBot/>
      </div>
  );
}