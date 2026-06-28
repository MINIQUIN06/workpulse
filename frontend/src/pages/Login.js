import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { Zap, Mail, Lock, ArrowRight } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/auth/login', form);
      login(res.data.user, res.data.token);
      toast.success('Welcome back! 👋');
      if (res.data.user.role === 'employee') {
        navigate('/employee');
      } else {
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden"
      style={{ background: '#0a0f1e' }}>

      {/* Animated background blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-10 blur-3xl animate-pulse"
          style={{ background: '#f59e0b' }}></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-5 blur-3xl animate-pulse"
          style={{ background: '#6366f1', animationDelay: '1s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">

        {/* Logo */}
        <div
          className="text-center mb-10 transition-all duration-700"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(-30px)'
          }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-500 hover:scale-110 hover:rotate-3"
            style={{ background: '#f59e0b' }}>
            <Zap size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">WorkPulse</h1>
          <p className="text-slate-400 mt-2">Sign in to your account</p>
        </div>

        {/* Form Card */}
        <div
          className="rounded-2xl p-8 border border-slate-800 transition-all duration-700 delay-200"
          style={{
            background: '#111827',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(30px)'
          }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="transition-all duration-500 delay-300"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateX(0)' : 'translateX(-20px)'
              }}>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail size={16} className="absolute left-4 top-3.5 text-slate-500 transition-colors duration-300 group-focus-within:text-amber-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white placeholder-slate-600 border border-slate-700 transition-all duration-300 hover:border-slate-600"
                  style={{ background: '#0d1426' }}
                  placeholder="admin@workpulse.com"
                  required
                />
              </div>
            </div>

            <div className="transition-all duration-500 delay-400"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateX(0)' : 'translateX(-20px)'
              }}>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Password
              </label>
              <div className="relative group">
                <Lock size={16} className="absolute left-4 top-3.5 text-slate-500 transition-colors duration-300 group-focus-within:text-amber-400" />
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white placeholder-slate-600 border border-slate-700 transition-all duration-300 hover:border-slate-600"
                  style={{ background: '#0d1426' }}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="transition-all duration-500 delay-500"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(20px)'
              }}>
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white transition-all duration-300 disabled:opacity-50 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/25 active:scale-95"
                style={{ background: '#f59e0b' }}>
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : (
                  <>Sign In <ArrowRight size={18} /></>
                )}
              </button>
            </div>
          </form>

          <div
            className="transition-all duration-500 delay-700"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(20px)'
            }}>
            <p className="text-center text-sm text-slate-500 mt-6">
              Don't have an account?{' '}
              <Link to="/register"
                className="font-medium hover:underline transition-colors duration-300"
                style={{ color: '#f59e0b' }}>
                Register here
              </Link>
            </p>
          </div>
        </div>

        <div
          className="transition-all duration-500 delay-700"
          style={{
            opacity: mounted ? 1 : 0
          }}>
          <p className="text-center text-sm text-slate-600 mt-4">
            <Link to="/home" className="hover:text-slate-400 transition-colors duration-300">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}