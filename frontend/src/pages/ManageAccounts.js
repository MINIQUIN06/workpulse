import { useEffect, useState } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, Trash2, X, Shield, User, Mail, Lock } from 'lucide-react';
import { useMounted, fadeUp, fadeIn } from '../hooks/useAnimation';

const ROLE_COLORS = {
  admin: 'bg-red-400 bg-opacity-10 text-red-400',
  hr: 'bg-purple-400 bg-opacity-10 text-purple-400',
  manager: 'bg-blue-400 bg-opacity-10 text-blue-400',
  employee: 'bg-emerald-400 bg-opacity-10 text-emerald-400'
};

const ROLE_ICONS = {
  admin: '👑',
  hr: '🧑‍💼',
  manager: '📊',
  employee: '👤'
};

export default function ManageAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'hr'
  });
  const mounted = useMounted();

  const fetchAccounts = async () => {
    try {
      const res = await axios.get('/auth/accounts');
      setAccounts(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAccounts(); }, []);

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill all fields');
      return;
    }
    if (!form.email.endsWith('@workpulse.com')) {
      toast.error('Email must end with @workpulse.com');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      await axios.post('/auth/create-account', {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role
      });
      toast.success('Account created successfully!');
      setShowModal(false);
      setForm({ name: '', email: '', password: '', confirmPassword: '', role: 'hr' });
      fetchAccounts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create account');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this account? This cannot be undone.')) return;
    try {
      await axios.delete(`/auth/accounts/${id}`);
      toast.success('Account deleted');
      fetchAccounts();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const adminCount = accounts.filter(a => a.role === 'admin').length;
  const hrCount = accounts.filter(a => a.role === 'hr').length;
  const managerCount = accounts.filter(a => a.role === 'manager').length;
  const employeeCount = accounts.filter(a => a.role === 'employee').length;

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div style={fadeIn(mounted)}>
      <div className="flex justify-between items-center mb-8" style={fadeUp(mounted, 100)}>
        <div>
          <h1 className="text-3xl font-bold text-white">Manage Accounts</h1>
          <p className="text-slate-400 mt-1">Create and manage system user accounts</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 text-white px-5 py-3 rounded-xl font-medium transition"
          style={{ background: '#f59e0b' }}>
          <Plus size={18} /> Create Account
        </button>
      </div>

      <div className="grid grid-cols-4 gap-5 mb-8" style={fadeUp(mounted, 200)}>
        {[
          { label: 'Admins', value: adminCount, icon: '👑', color: 'text-red-400', bg: 'rgba(239,68,68,0.1)' },
          { label: 'HR Managers', value: hrCount, icon: '🧑‍💼', color: 'text-purple-400', bg: 'rgba(139,92,246,0.1)' },
          { label: 'Managers', value: managerCount, icon: '📊', color: 'text-blue-400', bg: 'rgba(96,165,250,0.1)' },
          { label: 'Employees', value: employeeCount, icon: '👤', color: 'text-emerald-400', bg: 'rgba(16,185,129,0.1)' },
        ].map((stat, i) => (
          <div key={i} className="rounded-2xl p-6 border border-slate-800"
            style={{ background: '#111827' }}>
            <div className="text-3xl mb-3">{stat.icon}</div>
            <p className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</p>
            <p className="text-sm text-slate-400">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-800 overflow-hidden"
        style={{ background: '#111827' }}>
        <div className="p-5 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">All Accounts ({accounts.length})</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">User</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Email</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Role</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Created</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {accounts.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-16 text-slate-500">
                  <Shield size={32} className="mx-auto mb-2 text-slate-700" />
                  <p>No accounts found</p>
                </td>
              </tr>
            ) : (
              accounts.map(account => (
                <tr key={account._id} className="hover:bg-slate-800 hover:bg-opacity-30 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white"
                        style={{ background: account.role === 'admin' ? '#ef4444' : account.role === 'hr' ? '#8b5cf6' : account.role === 'manager' ? '#3b82f6' : '#10b981' }}>
                        {account.name?.charAt(0).toUpperCase()}
                      </div>
                      <p className="font-semibold text-white">{account.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-300 text-sm">{account.email}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-3 py-1.5 rounded-full font-medium capitalize ${ROLE_COLORS[account.role]}`}>
                      {ROLE_ICONS[account.role]} {account.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm">
                    {new Date(account.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleDelete(account._id)}
                      className="p-2 text-red-400 hover:bg-red-400 hover:bg-opacity-10 rounded-lg transition">
                      <Trash2 size={15} />
                    </button>
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
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Create Account</h2>
                <p className="text-sm text-slate-500">Add a new system user</p>
              </div>
              <button onClick={() => setShowModal(false)}
                className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-400">Full Name</label>
                <div className="relative mt-1">
                  <User size={16} className="absolute left-4 top-3.5 text-slate-500" />
                  <input value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white placeholder-slate-600 border border-slate-700"
                    style={{ background: '#111827' }}
                    placeholder="Jane Smith" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-400">Email (@workpulse.com)</label>
                <div className="relative mt-1">
                  <Mail size={16} className="absolute left-4 top-3.5 text-slate-500" />
                  <input value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white placeholder-slate-600 border border-slate-700"
                    style={{ background: '#111827' }}
                    placeholder="jane@workpulse.com" />
                </div>
                {form.email && !form.email.endsWith('@workpulse.com') && (
                  <p className="text-xs text-red-400 mt-1">Must end with @workpulse.com</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-slate-400">Role</label>
                <select value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  className="w-full rounded-xl px-4 py-3 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white border border-slate-700"
                  style={{ background: '#111827' }}>
                  <option value="hr">HR Manager</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-400">Password</label>
                <div className="relative mt-1">
                  <Lock size={16} className="absolute left-4 top-3.5 text-slate-500" />
                  <input type="password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className="w-full rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white placeholder-slate-600 border border-slate-700"
                    style={{ background: '#111827' }}
                    placeholder="Min 6 characters" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-400">Confirm Password</label>
                <div className="relative mt-1">
                  <Lock size={16} className="absolute left-4 top-3.5 text-slate-500" />
                  <input type="password"
                    value={form.confirmPassword}
                    onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                    className="w-full rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white placeholder-slate-600 border border-slate-700"
                    style={{ background: '#111827' }}
                    placeholder="Re-enter password" />
                </div>
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                )}
                {form.confirmPassword && form.password === form.confirmPassword && (
                  <p className="text-xs text-emerald-400 mt-1">✓ Passwords match</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)}
                className="flex-1 border border-slate-700 text-slate-400 py-3 rounded-xl hover:bg-slate-800 font-medium transition">
                Cancel
              </button>
              <button onClick={handleSubmit}
                className="flex-1 text-white py-3 rounded-xl font-medium transition"
                style={{ background: '#f59e0b' }}>
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}