import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { Zap, Mail, Lock, User, ArrowRight } from 'lucide-react';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee'
  });
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (!form.email.endsWith('@workpulse.com')) {
      toast.error('Email must end with @workpulse.com');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role
      });
      toast.success('Account created successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden"
      style={{ background: '#0a0f1e' }}>

      {/* Animated background blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 rounded-full opacity-10 blur-3xl animate-pulse"
          style={{ background: '#f59e0b' }}></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full opacity-5 blur-3xl animate-pulse"
          style={{ background: '#10b981', animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-48 h-48 rounded-full opacity-5 blur-3xl animate-pulse"
          style={{ background: '#6366f1', animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">

        {/* Logo */}
        <div
          className="text-center mb-8 transition-all duration-700"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(-30px)'
          }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-500 hover:scale-110 hover:rotate-3"
            style={{ background: '#f59e0b' }}>
            <Zap size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">WorkPulse</h1>
          <p className="text-slate-400 mt-2">Create your account</p>
        </div>

        {/* Form Card */}
        <div
          className="rounded-2xl p-8 border border-slate-800 transition-all duration-700 delay-200"
          style={{
            background: '#111827',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(30px)'
          }}>
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div
              className="transition-all duration-500 delay-300"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateX(0)' : 'translateX(-20px)'
              }}>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Full Name
              </label>
              <div className="relative group">
                <User size={16} className="absolute left-4 top-3.5 text-slate-500 transition-colors duration-300 group-focus-within:text-amber-400" />
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white placeholder-slate-600 border border-slate-700 transition-all duration-300 hover:border-slate-600"
                  style={{ background: '#0d1426' }}
                  placeholder="keerth"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div
              className="transition-all duration-500 delay-350"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateX(0)' : 'translateX(-20px)'
              }}>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Email Address (@workpulse.com)
              </label>
              <div className="relative group">
                <Mail size={16} className="absolute left-4 top-3.5 text-slate-500 transition-colors duration-300 group-focus-within:text-amber-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white placeholder-slate-600 border border-slate-700 transition-all duration-300 hover:border-slate-600"
                  style={{ background: '#0d1426' }}
                  placeholder="keerth@workpulse.com"
                  required
                />
              </div>
              {form.email && !form.email.endsWith('@workpulse.com') && (
                <p className="text-xs text-red-400 mt-1 animate-pulse">Must end with @workpulse.com</p>
              )}
              {form.email && form.email.endsWith('@workpulse.com') && (
                <p className="text-xs text-emerald-400 mt-1">✓ Valid email</p>
              )}
            </div>

            {/* Role */}
            <div
              className="transition-all duration-500 delay-400"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateX(0)' : 'translateX(-20px)'
              }}>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Role
              </label>
              <div className="w-full rounded-xl px-4 py-3 border border-slate-700 flex items-center gap-2 transition-all duration-300 hover:border-slate-600"
                style={{ background: '#0d1426' }}>
                <span className="text-emerald-400">👤</span>
                <span className="text-white font-medium">Employee</span>
                <span className="ml-auto text-xs text-slate-500">Default role</span>
              </div>
            </div>

            {/* Password */}
            <div
              className="transition-all duration-500 delay-450"
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
                  placeholder="Min 6 characters"
                  required
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div
              className="transition-all duration-500 delay-500"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateX(0)' : 'translateX(-20px)'
              }}>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Confirm Password
              </label>
              <div className="relative group">
                <Lock size={16} className="absolute left-4 top-3.5 text-slate-500 transition-colors duration-300 group-focus-within:text-amber-400" />
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  className="w-full rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white placeholder-slate-600 border border-slate-700 transition-all duration-300 hover:border-slate-600"
                  style={{ background: '#0d1426' }}
                  placeholder="Re-enter password"
                  required
                />
              </div>
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="text-xs text-red-400 mt-1 animate-pulse">Passwords do not match</p>
              )}
              {form.confirmPassword && form.password === form.confirmPassword && (
                <p className="text-xs text-emerald-400 mt-1">✓ Passwords match</p>
              )}
            </div>

            {/* Submit */}
            <div
              className="transition-all duration-500 delay-600"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(20px)'
              }}>
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white transition-all duration-300 disabled:opacity-50 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/25 active:scale-95 mt-2"
                style={{ background: '#f59e0b' }}>
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Account...
                  </>
                ) : (
                  <>Create Account <ArrowRight size={18} /></>
                )}
              </button>
            </div>
          </form>

          <div
            className="transition-all duration-500 delay-700"
            style={{
              opacity: mounted ? 1 : 0
            }}>
            <p className="text-center text-sm text-slate-500 mt-6">
              Already have an account?{' '}
              <Link to="/login"
                className="font-medium hover:underline transition-colors duration-300"
                style={{ color: '#f59e0b' }}>
                Sign in here
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