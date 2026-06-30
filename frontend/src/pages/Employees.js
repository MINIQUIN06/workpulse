import { useEffect, useState } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, Trash2, Eye, X, Search, Filter, Edit2, Save } from 'lucide-react';
import { useMounted, fadeUp, fadeIn } from '../hooks/useAnimation';

const DEPARTMENTS = ['Engineering', 'Design', 'Marketing', 'HR', 'Finance', 'Sales'];
const ROLES = ['Developer', 'Designer', 'Manager', 'Analyst', 'Lead', 'Intern'];

const DEPT_COLORS = {
  Engineering: 'bg-blue-400 bg-opacity-10 text-blue-400',
  Design: 'bg-pink-400 bg-opacity-10 text-pink-400',
  Marketing: 'bg-orange-400 bg-opacity-10 text-orange-400',
  HR: 'bg-green-400 bg-opacity-10 text-green-400',
  Finance: 'bg-yellow-400 bg-opacity-10 text-yellow-400',
  Sales: 'bg-purple-400 bg-opacity-10 text-purple-400',
};

const AVATAR_COLORS = [
  '#f59e0b', '#6366f1', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'
];

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', phone: '', department: '',
    role: '', experience: 0, status: 'active'
  });
  const mounted = useMounted();

  const fetchEmployees = async () => {
    const res = await axios.get('/employees');
    setEmployees(res.data);
  };

  useEffect(() => { fetchEmployees(); }, []);

  const filtered = employees.filter(emp => {
    const matchSearch = emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase());
    const matchDept = filterDept ? emp.department === filterDept : true;
    return matchSearch && matchDept;
  });

  const validateForm = (data) => {
    if (!data.name || !data.email || !data.department || !data.role) {
      toast.error('Please fill all required fields');
      return false;
    }
    if (!data.email.endsWith('@workpulse.com')) {
      toast.error('Email must end with @workpulse.com');
      return false;
    }
    if (data.phone && data.phone.replace(/\D/g, '').length !== 10) {
      toast.error('Phone number must be exactly 10 digits');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm(form)) return;
    try {
      await axios.post('/employees', form);
      toast.success('Employee added successfully!');
      setShowModal(false);
      setForm({
        name: '', email: '', phone: '', department: '',
        role: '', experience: 0, status: 'active'
      });
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add employee');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this employee?')) return;
    try {
      await axios.delete(`/employees/${id}`);
      toast.success('Employee deleted');
      fetchEmployees();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleViewEmployee = (emp) => {
    setSelected(emp);
    setEditMode(false);
    setEditForm({
      name: emp.name,
      email: emp.email,
      phone: emp.phone || '',
      department: emp.department,
      role: emp.role,
      experience: emp.experience,
      status: emp.status
    });
  };

  const handleSaveEdit = async () => {
    if (!validateForm(editForm)) return;
    try {
      await axios.put(`/employees/${selected._id}`, editForm);
      toast.success('Employee updated successfully!');
      setEditMode(false);
      fetchEmployees();
      setSelected({ ...selected, ...editForm });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update employee');
    }
  };

  const handlePhoneInput = (value, isEdit = false) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (isEdit) {
      setEditForm({ ...editForm, phone: digits });
    } else {
      setForm({ ...form, phone: digits });
    }
  };

  return (
    <div style={fadeIn(mounted)}>
      <div className="flex justify-between items-center mb-8" style={fadeUp(mounted, 100)}>
        <div>
          <h1 className="text-3xl font-bold text-white">Employees</h1>
          <p className="text-slate-400 mt-1">{employees.length} total members</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 text-white px-5 py-3 rounded-xl font-medium transition"
          style={{ background: '#f59e0b' }}>
          <Plus size={18} /> Add Employee
        </button>
      </div>

      <div className="flex gap-4 mb-6" style={fadeUp(mounted, 200)}>
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white placeholder-slate-500 border border-slate-800"
            style={{ background: '#111827' }}
          />
        </div>
        <div className="relative">
          <Filter size={16} className="absolute left-3 top-3.5 text-slate-500" />
          <select
            value={filterDept}
            onChange={e => setFilterDept(e.target.value)}
            className="rounded-xl pl-10 pr-8 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white border border-slate-800 appearance-none"
            style={{ background: '#111827' }}>
            <option value="">All Departments</option>
            {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <div style={fadeUp(mounted, 300)} className="rounded-2xl border border-slate-800 overflow-x-auto">
        <table className="w-full min-w-max">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Experience</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Skills</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-16 text-slate-500">
                  <Search size={32} className="mx-auto mb-2 text-slate-700" />
                  <p>No employees found</p>
                </td>
              </tr>
            ) : (
              filtered.map((emp, index) => (
                <tr key={emp._id} className="hover:bg-slate-800 hover:bg-opacity-50 transition">
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono text-amber-400 font-semibold">
                      {emp.employeeCode || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                        style={{ background: AVATAR_COLORS[index % AVATAR_COLORS.length] }}>
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{emp.name}</p>
                        <p className="text-xs text-slate-500">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${DEPT_COLORS[emp.department] || 'bg-slate-700 text-slate-300'}`}>
                      {emp.department}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300 font-medium">{emp.role}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-white">{emp.experience}</span>
                    <span className="text-xs text-slate-500 ml-1">yrs</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs px-3 py-1.5 rounded-full font-medium bg-amber-400 bg-opacity-10 text-amber-400">
                      {emp.skills?.length || 0} skills
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${emp.status === 'active' ? 'bg-emerald-400 bg-opacity-10 text-emerald-400' : 'bg-red-400 bg-opacity-10 text-red-400'}`}>
                      {emp.status === 'active' ? '● Active' : '● Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleViewEmployee(emp)}
                        className="p-2 text-amber-400 hover:bg-amber-400 hover:bg-opacity-10 rounded-lg transition">
                        <Eye size={15} />
                      </button>
                      <button onClick={() => handleDelete(emp._id)}
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

      {/* Add Employee Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="rounded-2xl p-8 w-full max-w-lg shadow-2xl border border-slate-800 max-h-[90vh] overflow-y-auto"
            style={{ background: '#0d1426' }}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Add New Employee</h2>
                <p className="text-sm text-slate-500">Fill in the details below</p>
              </div>
              <button onClick={() => setShowModal(false)}
                className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-400">Full Name *</label>
                  <input value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-xl px-4 py-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white placeholder-slate-600 border border-slate-700"
                    style={{ background: '#111827' }}
                    placeholder="keerth" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-400">Email * (@workpulse.com)</label>
                  <input value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-xl px-4 py-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white placeholder-slate-600 border border-slate-700"
                    style={{ background: '#111827' }}
                    placeholder="keerth@workpulse.com" />
                  {form.email && !form.email.endsWith('@workpulse.com') && (
                    <p className="text-xs text-red-400 mt-1">Must end with @workpulse.com</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-400">Phone (10 digits)</label>
                  <input
                    value={form.phone}
                    onChange={e => handlePhoneInput(e.target.value)}
                    className="w-full rounded-xl px-4 py-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white placeholder-slate-600 border border-slate-700"
                    style={{ background: '#111827' }}
                    placeholder="9999999999"
                    maxLength={10} />
                  {form.phone && form.phone.length !== 10 && (
                    <p className="text-xs text-red-400 mt-1">{form.phone.length}/10 digits</p>
                  )}
                  {form.phone && form.phone.length === 10 && (
                    <p className="text-xs text-emerald-400 mt-1">✓ Valid</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-400">Experience (years)</label>
                  <input type="number" value={form.experience}
                    onChange={e => setForm({ ...form, experience: e.target.value })}
                    className="w-full rounded-xl px-4 py-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white border border-slate-700"
                    style={{ background: '#111827' }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-400">Department *</label>
                  <select value={form.department}
                    onChange={e => setForm({ ...form, department: e.target.value })}
                    className="w-full rounded-xl px-4 py-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white border border-slate-700"
                    style={{ background: '#111827' }}>
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-400">Role *</label>
                  <select value={form.role}
                    onChange={e => setForm({ ...form, role: e.target.value })}
                    className="w-full rounded-xl px-4 py-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white border border-slate-700"
                    style={{ background: '#111827' }}>
                    <option value="">Select Role</option>
                    {ROLES.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
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
                Add Employee
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View/Edit Employee Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="rounded-2xl p-8 w-full max-w-md shadow-2xl border border-slate-800 max-h-[90vh] overflow-y-auto"
            style={{ background: '#0d1426' }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {editMode ? 'Edit Employee' : 'Employee Profile'}
              </h2>
              <div className="flex items-center gap-2">
                {!editMode && (
                  <button onClick={() => setEditMode(true)}
                    className="flex items-center gap-1.5 text-sm text-amber-400 px-3 py-1.5 rounded-lg border border-amber-400 border-opacity-30 hover:bg-amber-400 hover:bg-opacity-10 transition">
                    <Edit2 size={14} />
                    Edit
                  </button>
                )}
                <button onClick={() => { setSelected(null); setEditMode(false); }}
                  className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition">
                  <X size={20} />
                </button>
              </div>
            </div>

            {!editMode ? (
              <>
                <div className="flex items-center gap-4 mb-6 p-4 rounded-xl border border-slate-800"
                  style={{ background: '#111827' }}>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
                    style={{ background: '#f59e0b' }}>
                    {selected.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{selected.name}</h3>
                    <p className="text-amber-400 font-medium">{selected.role}</p>
                    <p className="text-slate-500 text-sm">{selected.department}</p>
                    {selected.employeeCode && (
                      <p className="text-xs font-mono text-emerald-400 mt-1">{selected.employeeCode}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Email', value: selected.email },
                    { label: 'Phone', value: selected.phone || 'N/A' },
                    { label: 'Experience', value: `${selected.experience} years` },
                    { label: 'Skills', value: `${selected.skills?.length || 0} skills added` },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-3 border-b border-slate-800">
                      <span className="text-sm text-slate-500">{item.label}</span>
                      <span className="text-sm font-semibold text-white">{item.value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center py-3">
                    <span className="text-sm text-slate-500">Status</span>
                    <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${selected.status === 'active' ? 'bg-emerald-400 bg-opacity-10 text-emerald-400' : 'bg-red-400 bg-opacity-10 text-red-400'}`}>
                      {selected.status === 'active' ? '● Active' : '● Inactive'}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-400">Full Name</label>
                    <input value={editForm.name}
                      onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full rounded-xl px-4 py-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white border border-slate-700"
                      style={{ background: '#111827' }} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-400">Email (@workpulse.com)</label>
                    <input value={editForm.email}
                      onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full rounded-xl px-4 py-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white border border-slate-700"
                      style={{ background: '#111827' }} />
                    {editForm.email && !editForm.email.endsWith('@workpulse.com') && (
                      <p className="text-xs text-red-400 mt-1">Must end with @workpulse.com</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-400">Phone (10 digits)</label>
                    <input
                      value={editForm.phone}
                      onChange={e => handlePhoneInput(e.target.value, true)}
                      className="w-full rounded-xl px-4 py-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white border border-slate-700"
                      style={{ background: '#111827' }}
                      maxLength={10} />
                    {editForm.phone && editForm.phone.length !== 10 && (
                      <p className="text-xs text-red-400 mt-1">{editForm.phone.length}/10 digits</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-400">Department</label>
                      <select value={editForm.department}
                        onChange={e => setEditForm({ ...editForm, department: e.target.value })}
                        className="w-full rounded-xl px-4 py-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white border border-slate-700"
                        style={{ background: '#111827' }}>
                        {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-400">Role</label>
                      <select value={editForm.role}
                        onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                        className="w-full rounded-xl px-4 py-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white border border-slate-700"
                        style={{ background: '#111827' }}>
                        {ROLES.map(r => <option key={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-400">Experience (years)</label>
                    <input type="number" value={editForm.experience}
                      onChange={e => setEditForm({ ...editForm, experience: e.target.value })}
                      className="w-full rounded-xl px-4 py-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white border border-slate-700"
                      style={{ background: '#111827' }} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-400">Status</label>
                    <select value={editForm.status}
                      onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                      className="w-full rounded-xl px-4 py-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white border border-slate-700"
                      style={{ background: '#111827' }}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setEditMode(false)}
                    className="flex-1 border border-slate-700 text-slate-400 py-3 rounded-xl hover:bg-slate-800 font-medium transition">
                    Cancel
                  </button>
                  <button onClick={handleSaveEdit}
                    className="flex-1 flex items-center justify-center gap-2 text-white py-3 rounded-xl font-medium transition"
                    style={{ background: '#f59e0b' }}>
                    <Save size={16} />
                    Save Changes
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}