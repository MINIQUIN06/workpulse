import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Brain, Users, Layers, Zap, ArrowRight,
  BarChart2, Shield, MessageCircle
} from 'lucide-react';

const useInView = (threshold = 0.1) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, inView];
};

export default function Landing() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [heroRef, heroInView] = useInView(0.1);
  const [statsRef, statsInView] = useInView(0.1);
  const [featuresRef, featuresInView] = useInView(0.1);
  const [stepsRef, stepsInView] = useInView(0.1);
  const [ctaRef, ctaInView] = useInView(0.1);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: Brain,
      title: 'AI Skill Gap Analyzer',
      description: 'Identify missing skills and get personalized AI recommendations for career growth.',
      color: 'text-amber-400',
      bg: 'rgba(245,158,11,0.1)'
    },
    {
      icon: Layers,
      title: 'AI Team Builder',
      description: 'AI suggests the perfect team for any project based on skills and experience.',
      color: 'text-purple-400',
      bg: 'rgba(139,92,246,0.1)'
    },
    {
      icon: Users,
      title: 'Employee Self Service',
      description: 'Employees manage attendance, leaves, tasks and view payroll from their own portal.',
      color: 'text-emerald-400',
      bg: 'rgba(16,185,129,0.1)'
    },
    {
      icon: BarChart2,
      title: 'Smart Dashboard',
      description: 'Real-time analytics and charts showing organization health at a glance.',
      color: 'text-blue-400',
      bg: 'rgba(99,102,241,0.1)'
    },
    {
      icon: MessageCircle,
      title: 'AI HR Assistant',
      description: 'Ask anything about your team in natural language and get instant AI-powered answers.',
      color: 'text-pink-400',
      bg: 'rgba(244,63,94,0.1)'
    },
    {
      icon: Shield,
      title: 'Role Based Access',
      description: 'Secure dual portal system with separate access for admins and employees.',
      color: 'text-yellow-400',
      bg: 'rgba(234,179,8,0.1)'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Add Your Employees',
      description: 'Add employees with their roles, departments and experience to build your talent database.'
    },
    {
      number: '02',
      title: 'Map Their Skills',
      description: 'Employees add their skills with proficiency levels to create a complete skill inventory.'
    },
    {
      number: '03',
      title: 'Let AI Do the Magic',
      description: 'AI analyzes gaps, suggests perfect teams and provides personalized career roadmaps.'
    }
  ];

  const stats = [
    { value: 'AI', label: 'Powered Analysis' },
    { value: '2', label: 'Smart Portals' },
    { value: '6+', label: 'AI Features' },
    { value: '100%', label: 'Free to Use' }
  ];

  return (
    <div className="min-h-screen overflow-hidden" style={{ background: '#0a0f1e' }}>

      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-10 blur-3xl animate-pulse"
          style={{ background: '#f59e0b' }}></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-5 blur-3xl animate-pulse"
          style={{ background: '#6366f1', animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full opacity-5 blur-3xl animate-pulse"
          style={{ background: '#10b981', animationDelay: '2s' }}></div>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800 transition-all duration-300"
        style={{
          background: scrollY > 50 ? 'rgba(10,15,30,0.98)' : 'rgba(10,15,30,0.8)',
          backdropFilter: 'blur(10px)',
          boxShadow: scrollY > 50 ? '0 4px 30px rgba(0,0,0,0.3)' : 'none'
        }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center animate-pulse"
              style={{ background: '#f59e0b' }}>
              <Zap size={18} className="text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-white">WorkPulse</span>
              <span className="text-xs text-slate-500 ml-2">Employee Management System</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/login')}
              className="text-slate-400 hover:text-white font-medium transition duration-300">
              Login
            </button>
            <button onClick={() => navigate('/register')}
              className="text-white px-5 py-2.5 rounded-xl font-medium transition duration-300 hover:opacity-90 hover:scale-105"
              style={{ background: '#f59e0b' }}>
              Get Started Free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-24 px-6 text-center relative" ref={heroRef}>
        <div className="max-w-4xl mx-auto">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 border border-amber-500 border-opacity-30 transition-all duration-1000"
            style={{
              background: 'rgba(245,158,11,0.05)',
              color: '#f59e0b',
              opacity: heroInView ? 1 : 0,
              transform: heroInView ? 'translateY(0)' : 'translateY(30px)'
            }}>
            <Zap size={14} />
            AI-Powered HR Intelligence Platform
          </div>

          <h1
            className="text-6xl font-bold text-white mb-6 leading-tight transition-all duration-1000 delay-200"
            style={{
              opacity: heroInView ? 1 : 0,
              transform: heroInView ? 'translateY(0)' : 'translateY(40px)'
            }}>
            Employee Management<br />
            <span style={{ color: '#f59e0b' }}>System</span>
          </h1>

          <p
            className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed transition-all duration-1000 delay-300"
            style={{
              opacity: heroInView ? 1 : 0,
              transform: heroInView ? 'translateY(0)' : 'translateY(40px)'
            }}>
            WorkPulse helps HR teams identify skill gaps, build perfect project teams
            and empower employees with AI-powered career growth recommendations.
          </p>

          <div
            className="flex items-center justify-center gap-4 transition-all duration-1000 delay-500"
            style={{
              opacity: heroInView ? 1 : 0,
              transform: heroInView ? 'translateY(0)' : 'translateY(40px)'
            }}>
            <button onClick={() => navigate('/register')}
              className="flex items-center gap-2 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-2xl hover:scale-105 hover:shadow-amber-500/25"
              style={{ background: '#f59e0b' }}>
              Get Started Free
              <ArrowRight size={20} />
            </button>
            <button onClick={() => navigate('/login')}
              className="flex items-center gap-2 text-slate-300 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 border border-slate-700 hover:border-amber-500 hover:text-amber-400 hover:scale-105">
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-slate-800 relative" ref={statsRef}
        style={{ background: '#0d1426' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-4 gap-8 text-center">
            {stats.map((stat, i) => (
              <div key={i}
                className="transition-all duration-700"
                style={{
                  opacity: statsInView ? 1 : 0,
                  transform: statsInView ? 'translateY(0)' : 'translateY(30px)',
                  transitionDelay: `${i * 150}ms`
                }}>
                <p className="text-4xl font-bold mb-2" style={{ color: '#f59e0b' }}>{stat.value}</p>
                <p className="text-slate-400 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 relative" ref={featuresRef}>
        <div className="max-w-6xl mx-auto">
          <div
            className="text-center mb-16 transition-all duration-1000"
            style={{
              opacity: featuresInView ? 1 : 0,
              transform: featuresInView ? 'translateY(0)' : 'translateY(30px)'
            }}>
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything You Need to Manage Talent
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Powerful AI features designed for modern HR teams and employees
            </p>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div key={i}
                className="rounded-2xl p-6 border border-slate-800 hover:border-amber-500 hover:border-opacity-50 transition-all duration-500 group cursor-default hover:-translate-y-2 hover:shadow-2xl"
                style={{
                  background: '#111827',
                  opacity: featuresInView ? 1 : 0,
                  transform: featuresInView ? 'translateY(0)' : 'translateY(40px)',
                  transitionDelay: `${i * 100}ms`,
                  boxShadow: 'none'
                }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: feature.bg }}>
                  <feature.icon size={22} className={feature.color} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 border-y border-slate-800 relative" ref={stepsRef}
        style={{ background: '#0d1426' }}>
        <div className="max-w-6xl mx-auto">
          <div
            className="text-center mb-16 transition-all duration-1000"
            style={{
              opacity: stepsInView ? 1 : 0,
              transform: stepsInView ? 'translateY(0)' : 'translateY(30px)'
            }}>
            <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-slate-400 text-lg">Get started in 3 simple steps</p>
          </div>
          <div className="grid grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i}
                className="text-center transition-all duration-700 group"
                style={{
                  opacity: stepsInView ? 1 : 0,
                  transform: stepsInView ? 'translateY(0)' : 'translateY(40px)',
                  transitionDelay: `${i * 200}ms`
                }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                  style={{ background: '#f59e0b' }}>
                  <span className="text-2xl font-bold text-white">{step.number}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-slate-400 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 relative" ref={ctaRef}>
        <div className="max-w-4xl mx-auto text-center">
          <div
            className="rounded-3xl p-16 border border-amber-500 border-opacity-20 transition-all duration-1000"
            style={{
              background: 'rgba(245,158,11,0.05)',
              opacity: ctaInView ? 1 : 0,
              transform: ctaInView ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.98)'
            }}>
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Build Smarter Teams?
            </h2>
            <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">
              Join WorkPulse today and transform how your organization manages talent with the power of AI.
            </p>
            <div className="flex items-center justify-center gap-4">
              <button onClick={() => navigate('/register')}
                className="flex items-center gap-2 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                style={{ background: '#f59e0b' }}>
                Get Started Free
                <ArrowRight size={20} />
              </button>
              <button onClick={() => navigate('/login')}
                className="flex items-center gap-2 text-slate-300 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 border border-slate-700 hover:border-amber-500 hover:text-amber-400 hover:scale-105">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-slate-800" style={{ background: '#0d1426' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: '#f59e0b' }}>
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white">WorkPulse</span>
          </div>
          <p className="text-slate-500 text-sm">
            Built with React, Node.js, MongoDB and AI
          </p>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/login')}
              className="text-slate-500 hover:text-amber-400 text-sm transition duration-300">
              Login
            </button>
            <button onClick={() => navigate('/register')}
              className="text-slate-500 hover:text-amber-400 text-sm transition duration-300">
              Register
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}