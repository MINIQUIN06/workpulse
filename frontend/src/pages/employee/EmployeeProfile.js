import { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { User, Lock, Save } from 'lucide-react';
import { useMounted, fadeUp, fadeIn } from '../../hooks/useAnimation';

export default function EmployeeProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', department: '', role: '' });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const mounted = useMounted();

  useEffect(() => {
    if (user?.employeeId) {
      axios.get(`/employees/${user.employeeId}`).then(res => {
        setProfile(res.data);
        setForm({
          name: res.data.name || '',
          phone: res.data.phone || '',
          department: res.data.department || '',
          role: res.data.role || ''
        });
      });
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await axios.put(`/employees/${user.employeeId}`, form);
      toast.success('Profile updated successfully!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setPwLoading(true);
    try {
      await axios.post('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div style={fadeIn(mounted)}>
      <div className="mb-8" style={fadeUp(mounted, 100)}>
        <h1 className="text-3xl font-bold text-white">My Profile</h1>
        <p className="text-slate-400 mt-1">Update your personal information</p>
      </div>

      <div className="grid grid-cols-2 gap-6" style={fadeUp(mounted, 200)}>
        <div className="space-y-6">
          <div className="rounded-2xl p-6 border border-slate-800" style={{ background: '#111827' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(16,185,129,0.1)' }}>
                <User size={16} className="text-emerald-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Personal Information</h2>
            </div>

            <div className="flex items-center gap-4 mb-6 p-4 rounded-xl border border-emerald-500 border-opacity-20"
              style={{ background: 'rgba(16,185,129,0.05)' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
                style={{ background: '#10b981' }}>
                {profile?.name?.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-white">{profile?.name}</p>
                <p className="text-emerald-400 font-medium">{profile?.role}</p>
                <p className="text-slate-500 text-sm">{profile?.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-400">Full Name</label>
                <input value={form.name}onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl px-4 py-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-white border border-slate-700"
                  style={{ background: '#0d1426' }} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-400">Phone</label>
                <input value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 9999999999"
                  className="w-full rounded-xl px-4 py-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-white border border-slate-700 placeholder-slate-600"
                  style={{ background: '#0d1426' }} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-400">Department</label>
                <input value={form.department} disabled
                  className="w-full rounded-xl px-4 py-2.5 mt-1 text-slate-500 border border-slate-800"
                  style={{ background: '#0a0f1e' }} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-400">Role</label>
                <input value={form.role} disabled
                  className="w-full rounded-xl px-4 py-2.5 mt-1 text-slate-500 border border-slate-800"
                  style={{ background: '#0a0f1e' }} />
              </div>
            </div>

            <button onClick={handleUpdateProfile} disabled={loading}
              className="w-full flex items-center justify-center gap-2 mt-6 py-3 rounded-xl font-semibold text-white transition disabled:opacity-50"
              style={{ background: '#10b981' }}>
              <Save size={18} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div>
          <div className="rounded-2xl p-6 border border-slate-800" style={{ background: '#111827' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(245,158,11,0.1)' }}>
                <Lock size={16} className="text-amber-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Change Password</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-400">Current Password</label>
                <input type="password"
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  className="w-full rounded-xl px-4 py-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white border border-slate-700 placeholder-slate-600"
                  style={{ background: '#0d1426' }} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-400">New Password</label>
                <input type="password"
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Enter new password"
                  className="w-full rounded-xl px-4 py-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white border border-slate-700 placeholder-slate-600"
                  style={{ background: '#0d1426' }} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-400">Confirm New Password</label><input type="password"
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                  className="w-full rounded-xl px-4 py-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white border border-slate-700 placeholder-slate-600"
                  style={{ background: '#0d1426' }} />
              </div>
            </div>

            <button onClick={handleChangePassword} disabled={pwLoading}
              className="w-full flex items-center justify-center gap-2 mt-6 py-3 rounded-xl font-semibold text-white transition disabled:opacity-50"
              style={{ background: '#f59e0b' }}>
              <Lock size={18} />
              {pwLoading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}