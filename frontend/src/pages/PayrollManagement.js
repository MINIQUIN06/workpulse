import { useEffect, useState } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, Trash2, X, DollarSign, CheckCircle, Clock, Eye } from 'lucide-react';
import { useMounted, fadeUp, fadeIn } from '../hooks/useAnimation';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

const DEFAULT_PERCENTAGES = {
  hra: 40, da: 20, ta: 10, medical: 5,
  pf: 12, incomeTax: 10, professionalTax: 2, esi: 1
};

const calculatePreview = (basicSalary, percentages) => {
  const basic = Number(basicSalary) || 0;
  const hra = Math.round(basic * (Number(percentages.hra) || 0) / 100);
  const da = Math.round(basic * (Number(percentages.da) || 0) / 100);
  const ta = Math.round(basic * (Number(percentages.ta) || 0) / 100);
  const medical = Math.round(basic * (Number(percentages.medical) || 0) / 100);
  const totalAllowances = hra + da + ta + medical;
  const grossSalary = basic + totalAllowances;
  const pf = Math.round(basic * (Number(percentages.pf) || 0) / 100);
  const incomeTax = Math.round(grossSalary * (Number(percentages.incomeTax) || 0) / 100);
  const professionalTax = Math.round(grossSalary * (Number(percentages.professionalTax) || 0) / 100);
  const esi = Math.round(grossSalary * (Number(percentages.esi) || 0) / 100);
  const totalDeductions = pf + incomeTax + professionalTax + esi;
  const netSalary = grossSalary - totalDeductions;
  return { hra, da, ta, medical, totalAllowances, grossSalary, pf, incomeTax, professionalTax, esi, totalDeductions, netSalary };
};

export default function PayrollManagement() {
  const mounted = useMounted();
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    employeeId: '',
    month: MONTHS[new Date().getMonth()],
    year: new Date().getFullYear(),
    basicSalary: '',
    percentages: { ...DEFAULT_PERCENTAGES }
  });

  const fetchData = async () => {
    try {
      const [payrollRes, statsRes, empRes] = await Promise.all([
        axios.get('/payroll/all'),
        axios.get('/payroll/stats'),
        axios.get('/employees')
      ]);
      setPayrolls(payrollRes.data);
      setStats(statsRes.data);
      setEmployees(empRes.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const preview = calculatePreview(form.basicSalary, form.percentages);

  const handlePercentageChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      percentages: { ...prev.percentages, [field]: value }
    }));
  };

  const handleResetPercentages = () => {
    setForm(prev => ({
      ...prev,
      percentages: { ...DEFAULT_PERCENTAGES }
    }));
    toast.success('Reset to default percentages!');
  };

  const handleSubmit = async () => {
    if (!form.employeeId || !form.basicSalary) {
      toast.error('Please select employee and enter basic salary');
      return;
    }
    try {
      await axios.post('/payroll', {
        employeeId: form.employeeId,
        month: form.month,
        year: form.year,
        basicSalary: form.basicSalary,
        percentages: form.percentages
      });
      toast.success('Payroll generated!');
      setShowModal(false);
      setForm({
        employeeId: '',
        month: MONTHS[new Date().getMonth()],
        year: new Date().getFullYear(),
        basicSalary: '',
        percentages: { ...DEFAULT_PERCENTAGES }
      });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate payroll');
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      await axios.put(`/payroll/${id}/pay`);
      toast.success('Marked as paid!');
      fetchData();
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this payroll record?')) return;
    try {
      await axios.delete(`/payroll/${id}`);
      toast.success('Payroll deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div style={fadeIn(mounted)}>
      <div className="flex justify-between items-center mb-8" style={fadeUp(mounted, 100)}>
        <div>
          <h1 className="text-3xl font-bold text-white">Payroll Management</h1>
          <p className="text-slate-400 mt-1">Generate salary slips with custom percentage structure</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 text-white px-5 py-3 rounded-xl font-medium transition hover:scale-105"
          style={{ background: '#f59e0b' }}>
          <Plus size={18} /> Generate Payroll
        </button>
      </div>

      <div className="grid grid-cols-4 gap-5 mb-8" style={fadeUp(mounted, 200)}>
        {[
          { label: 'Total Records', value: stats.total || 0, icon: DollarSign, color: 'text-amber-400', bg: 'rgba(245,158,11,0.1)' },
          { label: 'Pending', value: stats.pending || 0, icon: Clock, color: 'text-yellow-400', bg: 'rgba(234,179,8,0.1)' },
          { label: 'Paid', value: stats.paid || 0, icon: CheckCircle, color: 'text-green-400', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Total Payout', value: `Rs.${(stats.totalPayout || 0).toLocaleString()}`, icon: DollarSign, color: 'text-purple-400', bg: 'rgba(139,92,246,0.1)' },
        ].map((stat, i) => (
          <div key={i} className="rounded-2xl p-6 border border-slate-800 hover:border-amber-500 hover:border-opacity-30 transition"
            style={{ background: '#111827' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{ background: stat.bg }}>
              <stat.icon size={22} className={stat.color} />
            </div>
            <p className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</p>
            <p className="text-sm text-slate-400">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-800 overflow-x-auto" style={{ background: '#111827', ...fadeUp(mounted, 300) }}>
        <table className="w-full min-w-max">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Employee</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Period</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Basic</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Gross</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Deductions</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Net Salary</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {payrolls.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-16 text-slate-500">
                  <DollarSign size={32} className="mx-auto mb-2 text-slate-700" />
                  <p>No payroll records yet</p>
                </td>
              </tr>
            ) : (
              payrolls.map(payroll => (
                <tr key={payroll._id} className="hover:bg-slate-800 hover:bg-opacity-30 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm"
                        style={{ background: '#f59e0b' }}>
                        {payroll.employee?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{payroll.employee?.name}</p>
                        <p className="text-xs text-slate-500">{payroll.employee?.department}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{payroll.month} {payroll.year}</td>
                  <td className="px-6 py-4 text-slate-300">Rs.{payroll.basicSalary?.toLocaleString()}</td>
                  <td className="px-6 py-4 text-white font-medium">Rs.{payroll.grossSalary?.toLocaleString()}</td>
                  <td className="px-6 py-4 text-red-400">-Rs.{payroll.totalDeductions?.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className="text-emerald-400 font-bold text-lg">Rs.{payroll.netSalary?.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                      payroll.status === 'paid'
                        ? 'bg-green-400 bg-opacity-10 text-green-400'
                        : 'bg-yellow-400 bg-opacity-10 text-yellow-400'
                    }`}>
                      {payroll.status === 'paid' ? '✓ Paid' : '⏳ Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setSelected(payroll)}
                        className="p-2 text-amber-400 hover:bg-amber-400 hover:bg-opacity-10 rounded-lg transition">
                        <Eye size={15} />
                      </button>
                      {payroll.status === 'pending' && (
                        <button onClick={() => handleMarkPaid(payroll._id)}
                          className="p-2 text-green-400 hover:bg-green-400 hover:bg-opacity-10 rounded-lg transition">
                          <CheckCircle size={15} />
                        </button>
                      )}
                      <button onClick={() => handleDelete(payroll._id)}
                        className="p-2 text-red-400 hover:bg-red-400 hover:bg-opacity-10 rounded-lg transition">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Generate Payroll Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="rounded-2xl p-8 w-full max-w-3xl border border-slate-800 max-h-[90vh] overflow-y-auto"
            style={{ background: '#0d1426' }}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Generate Payroll</h2>
                <p className="text-sm text-slate-500">Customize percentages for each component</p>
              </div>
              <button onClick={() => setShowModal(false)}
                className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Left Side - Inputs */}
              <div className="space-y-5">

                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-400">Employee</label>
                    <select value={form.employeeId}
                      onChange={e => setForm({ ...form, employeeId: e.target.value })}
                      className="w-full rounded-xl px-4 py-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white border border-slate-700"
                      style={{ background: '#111827' }}>
                      <option value="">Select Employee</option>
                      {employees.map(emp => (
                        <option key={emp._id} value={emp._id}>{emp.name} — {emp.role}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-slate-400">Month</label>
                      <select value={form.month}
                        onChange={e => setForm({ ...form, month: e.target.value })}
                        className="w-full rounded-xl px-4 py-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white border border-slate-700"
                        style={{ background: '#111827' }}>
                        {MONTHS.map(m => <option key={m}>{m}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-400">Year</label>
                      <input type="number" value={form.year}
                        onChange={e => setForm({ ...form, year: e.target.value })}
                        className="w-full rounded-xl px-4 py-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white border border-slate-700"
                        style={{ background: '#111827' }} />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-400">Basic Salary (Rs.)</label>
                    <input type="number" value={form.basicSalary}
                      onChange={e => setForm({ ...form, basicSalary: e.target.value })}
                      className="w-full rounded-xl px-4 py-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white placeholder-slate-600 border border-slate-700"
                      style={{ background: '#111827' }}
                      placeholder="e.g. 50000" />
                  </div>
                </div>

                {/* Allowance Percentages */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Allowances (%)</p>
                    <button onClick={handleResetPercentages}
                      className="text-xs text-slate-400 hover:text-amber-400 transition border border-slate-700 px-2 py-1 rounded-lg">
                      Reset to Default
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'hra', label: 'HRA %' },
                      { key: 'da', label: 'DA %' },
                      { key: 'ta', label: 'TA %' },
                      { key: 'medical', label: 'Medical %' },
                    ].map(item => (
                      <div key={item.key}>
                        <label className="text-xs font-medium text-slate-500 mb-1 block">{item.label}</label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={form.percentages[item.key]}
                            onChange={e => handlePercentageChange(item.key, e.target.value)}
                            className="w-full rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-white border border-slate-700 pr-8"
                            style={{ background: '#111827' }}
                          />
                          <span className="absolute right-3 top-2.5 text-slate-500 text-sm">%</span>
                        </div>
                        {form.basicSalary && (
                          <p className="text-xs text-emerald-400 mt-1">
                            = Rs.{Math.round(Number(form.basicSalary) * Number(form.percentages[item.key]) / 100).toLocaleString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Deduction Percentages */}
                <div>
                  <p className="text-sm font-bold text-red-400 uppercase tracking-wider mb-3">Deductions (%)</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'pf', label: 'PF %' },
                      { key: 'incomeTax', label: 'Income Tax %' },
                      { key: 'professionalTax', label: 'Prof. Tax %' },
                      { key: 'esi', label: 'ESI %' },
                    ].map(item => (
                      <div key={item.key}>
                        <label className="text-xs font-medium text-slate-500 mb-1 block">{item.label}</label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={form.percentages[item.key]}
                            onChange={e => handlePercentageChange(item.key, e.target.value)}
                            className="w-full rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-400 text-white border border-slate-700 pr-8"
                            style={{ background: '#111827' }}
                          />
                          <span className="absolute right-3 top-2.5 text-slate-500 text-sm">%</span>
                        </div>
                        {form.basicSalary && (
                          <p className="text-xs text-red-400 mt-1">
                            = Rs.{Math.round(Number(form.basicSalary) * Number(form.percentages[item.key]) / 100).toLocaleString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side - Live Preview */}
              <div>
                <div className="rounded-2xl p-6 border border-amber-500 border-opacity-20 sticky top-0"
                  style={{ background: 'rgba(245,158,11,0.05)' }}>
                  <h3 className="font-bold text-white mb-5">Live Salary Preview</h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm py-1">
                      <span className="text-slate-400">Basic Salary</span>
                      <span className="text-white font-medium">
                        Rs.{(Number(form.basicSalary) || 0).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-emerald-400 font-semibold mt-3 mb-1">ALLOWANCES</p>
                    {[
                      { label: `HRA (${form.percentages.hra}%)`, value: preview.hra },
                      { label: `DA (${form.percentages.da}%)`, value: preview.da },
                      { label: `TA (${form.percentages.ta}%)`, value: preview.ta },
                      { label: `Medical (${form.percentages.medical}%)`, value: preview.medical },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between text-xs py-0.5">
                        <span className="text-slate-500">{item.label}</span>
                        <span className="text-emerald-400">+Rs.{item.value.toLocaleString()}</span>
                      </div>
                    ))}

                    <div className="flex justify-between text-sm py-2 border-t border-slate-700 mt-2">
                      <span className="text-white font-semibold">Gross Salary</span>
                      <span className="text-white font-bold">Rs.{preview.grossSalary.toLocaleString()}</span>
                    </div>

                    <p className="text-xs text-red-400 font-semibold mt-3 mb-1">DEDUCTIONS</p>
                    {[
                      { label: `PF (${form.percentages.pf}%)`, value: preview.pf },
                      { label: `Income Tax (${form.percentages.incomeTax}%)`, value: preview.incomeTax },
                      { label: `Prof. Tax (${form.percentages.professionalTax}%)`, value: preview.professionalTax },
                      { label: `ESI (${form.percentages.esi}%)`, value: preview.esi },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between text-xs py-0.5">
                        <span className="text-slate-500">{item.label}</span>
                        <span className="text-red-400">-Rs.{item.value.toLocaleString()}</span>
                      </div>
                    ))}

                    <div className="flex justify-between text-sm py-2 border-t border-slate-700 mt-2">
                      <span className="text-slate-400">Total Deductions</span>
                      <span className="text-red-400 font-semibold">-Rs.{preview.totalDeductions.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between pt-4 border-t-2 border-amber-500 border-opacity-30 mt-2">
                      <span className="text-white font-bold text-lg">Net Salary</span>
                      <span className="text-2xl font-bold text-amber-400">
                        Rs.{preview.netSalary.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Percentage Summary */}
                  <div className="mt-4 p-3 rounded-xl border border-slate-700" style={{ background: '#111827' }}>
                    <p className="text-xs text-slate-500 mb-2">Current Structure</p>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <span className="text-emerald-400">
                        Total Allowances: {Number(form.percentages.hra) + Number(form.percentages.da) + Number(form.percentages.ta) + Number(form.percentages.medical)}%
                      </span>
                      <span className="text-red-400">
                        Total Deductions: {Number(form.percentages.pf) + Number(form.percentages.incomeTax) + Number(form.percentages.professionalTax) + Number(form.percentages.esi)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)}
                className="flex-1 border border-slate-700 text-slate-400 py-3 rounded-xl hover:bg-slate-800 font-medium transition">
                Cancel
              </button>
              <button onClick={handleSubmit}
                className="flex-1 text-white py-3 rounded-xl font-medium transition hover:opacity-90"
                style={{ background: '#f59e0b' }}>
                Generate Payroll
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Payroll Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="rounded-2xl p-8 w-full max-w-md border border-slate-800 max-h-[90vh] overflow-y-auto"
            style={{ background: '#0d1426' }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Salary Slip</h2>
              <button onClick={() => setSelected(null)}
                className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 rounded-xl border border-amber-500 border-opacity-20 mb-5"
              style={{ background: 'rgba(245,158,11,0.05)' }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white"
                  style={{ background: '#f59e0b' }}>
                  {selected.employee?.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-white">{selected.employee?.name}</p>
                  <p className="text-amber-400 text-sm">{selected.employee?.role}</p>
                  <p className="text-slate-500 text-xs">{selected.employee?.department}</p>
                </div>
              </div>
              <p className="text-slate-500 text-sm mt-2">Pay Period: {selected.month} {selected.year}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Earnings</p>
              {[
                { label: 'Basic Salary', value: selected.basicSalary },
                { label: `HRA (${selected.percentages?.hra || 0}%)`, value: selected.allowances?.hra },
                { label: `DA (${selected.percentages?.da || 0}%)`, value: selected.allowances?.da },
                { label: `TA (${selected.percentages?.ta || 0}%)`, value: selected.allowances?.ta },
                { label: `Medical (${selected.percentages?.medical || 0}%)`, value: selected.allowances?.medical },
              ].map((item, i) => (
                <div key={i} className="flex justify-between py-1.5 text-sm border-b border-slate-800">
                  <span className="text-slate-400">{item.label}</span>
                  <span className="text-white">Rs.{item.value?.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between py-2 font-bold">
                <span className="text-white text-sm">Gross Salary</span>
                <span className="text-white">Rs.{selected.grossSalary?.toLocaleString()}</span>
              </div>

              <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2 mt-4">Deductions</p>
              {[
                { label: `PF (${selected.percentages?.pf || 0}%)`, value: selected.deductions?.pf },
                { label: `Income Tax (${selected.percentages?.incomeTax || 0}%)`, value: selected.deductions?.incomeTax },
                { label: `Prof. Tax (${selected.percentages?.professionalTax || 0}%)`, value: selected.deductions?.professionalTax },
                { label: `ESI (${selected.percentages?.esi || 0}%)`, value: selected.deductions?.esi },
              ].map((item, i) => (
                <div key={i} className="flex justify-between py-1.5 text-sm border-b border-slate-800">
                  <span className="text-slate-400">{item.label}</span>
                  <span className="text-red-400">-Rs.{item.value?.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between py-2 font-bold">
                <span className="text-white text-sm">Total Deductions</span>
                <span className="text-red-400">-Rs.{selected.totalDeductions?.toLocaleString()}</span>
              </div>

              <div className="flex justify-between py-4 mt-2 border-t-2 border-amber-500 border-opacity-30">
                <span className="text-white font-bold text-lg">Net Salary</span>
                <span className="text-emerald-400 font-bold text-2xl">
                  Rs.{selected.netSalary?.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-500 text-sm">Payment Status</span>
                <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                  selected.status === 'paid'
                    ? 'bg-green-400 bg-opacity-10 text-green-400'
                    : 'bg-yellow-400 bg-opacity-10 text-yellow-400'
                }`}>
                  {selected.status === 'paid' ? '✓ Paid' : '⏳ Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}