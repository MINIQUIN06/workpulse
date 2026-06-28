
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import SkillAnalyzer from './pages/SkillAnalyzer';
import TeamBuilder from './pages/TeamBuilder';
import Layout from './components/Layout';
import EmployeeLayout from './components/EmployeeLayout';
import Projects from './pages/Projects';
import EmployeeProjects from './pages/employee/EmployeeProjects';
import EmployeeProfile from './pages/employee/EmployeeProfile';
import EmployeeHome from './pages/employee/EmployeeHome';
import EmployeeSkills from './pages/employee/EmployeeSkills';
import EmployeeAnalysis from './pages/employee/EmployeeAnalysis';
import MeetingSummarizer from './pages/MeetingSummarizer';
import Leaderboard from './pages/Leaderboard';
import Attendance from './pages/Attendance';
import EmployeeAttendance from './pages/employee/EmployeeAttendance';
import LeaveManagement from './pages/LeaveManagement';
import EmployeeLeave from './pages/employee/EmployeeLeave';
import TaskManagement from './pages/TaskManagement';
import EmployeeTasks from './pages/employee/EmployeeTasks';
import PayrollManagement from './pages/PayrollManagement';
import EmployeePayroll from './pages/employee/EmployeePayroll';
import ManageAccounts from './pages/ManageAccounts';


//const AdminRoute = ({ children }) => {
  //const { user } = useAuth();
  //if (!user) return <Navigate to="/login" />;
  //if (user.role === 'employee') return <Navigate to="/employee" />;
  //return children;
//};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/home" />;
  if (user.role === 'employee') return <Navigate to="/employee" />;
  return children;
};

const EmployeeRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'employee') return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/home" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Routes */}
        <Route path="/" element={<AdminRoute><Layout /></AdminRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="employees" element={<Employees />} />
          <Route path="skill-analyzer" element={<SkillAnalyzer />} />
          <Route path="team-builder" element={<TeamBuilder />} />
          <Route path="projects" element={<Projects />} />
          <Route path="meeting-summarizer" element={<MeetingSummarizer />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="leaves" element={<LeaveManagement />} />
          <Route path="tasks" element={<TaskManagement />} />
          <Route path="payroll" element={<PayrollManagement />} />
          <Route path="accounts" element={<ManageAccounts />} />
        </Route>

        {/* Employee Routes */}
        <Route path="/employee" element={<EmployeeRoute><EmployeeLayout /></EmployeeRoute>}>
          <Route index element={<EmployeeHome />} />
          <Route path="profile" element={<EmployeeProfile />} />
          <Route path="skills" element={<EmployeeSkills />} />
          <Route path="analysis" element={<EmployeeAnalysis />} />
          <Route path="projects" element={<EmployeeProjects />} />
          <Route path="profile" element={<EmployeeProfile />} />
          <Route path="attendance" element={<EmployeeAttendance />} />
          <Route path="leaves" element={<EmployeeLeave />} />
          <Route path="tasks" element={<EmployeeTasks />} />
          <Route path="payroll" element={<EmployeePayroll />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;