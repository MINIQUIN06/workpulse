const Skill = require('../models/Skill');
const Employee = require('../models/Employee');

exports.addSkill = async (req, res) => {
  try {
    const skill = await Skill.create(req.body);
    await Employee.findByIdAndUpdate(req.body.employee, 
      { $push: { skills: skill._id } }
    );
    res.status(201).json(skill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getEmployeeSkills = async (req, res) => {
  try {
    const skills = await Skill.find({ employee: req.params.employeeId });
    res.json(skills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);
    await Employee.findByIdAndUpdate(skill.employee, 
      { $pull: { skills: skill._id } }
    );
    res.json({ message: 'Skill deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};