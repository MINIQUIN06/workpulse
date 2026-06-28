const Employee = require('../models/Employee');
const { notifyAdmins } = require('../utils/notify');
const User = require('../models/User');
const { notify } = require('../utils/notify');


exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().populate('skills').populate('projects');
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate('skills').populate('projects');
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    const employee = await Employee.create(req.body);
    
const newUser = await User.findOne({ email: employee.email });
if (newUser) {
  await notify({
    recipientUserId: newUser._id,
    title: 'Welcome to WorkPulse!',
    message: `Hi ${employee.name}, your employee account has been created. Welcome aboard!`,
    type: 'welcome',
    link: '/employee'
  });
}
    res.status(201).json(employee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



exports.updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};