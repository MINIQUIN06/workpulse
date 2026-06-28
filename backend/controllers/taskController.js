const Task = require('../models/Task');
const { notifyByEmployeeId, notifyAdmins } = require('../utils/notify');


exports.createTask = async (req, res) => {
  try {
    const task = await Task.create(req.body);
    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name role department')
      .populate('project', 'name');
    res.status(201).json(populated);
  
   await notifyByEmployeeId({
  employeeId: req.body.assignedTo,
  title: 'New Task Assigned',
  message: `You have been assigned a new task: "${req.body.title}". Priority: ${req.body.priority}.${req.body.dueDate ? ' Due: ' + req.body.dueDate : ''}`,
  type: 'task_assigned',
  link: '/employee/tasks'
});

  }
  catch (err) {
    res.status(500).json({ message: err.message });
  }
  
 

};

exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('assignedTo', 'name role department')
      .populate('project', 'name')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.params.employeeId })
      .populate('project', 'name')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    if (req.body.status === 'done') {
      req.body.completedAt = new Date();
    }
     const { notifyAdmins } = require('../utils/notify');

// After updating task, add:
if (req.body.status === 'review') {
  await notifyAdmins({
    title: 'Task Ready for Approval',
    message: `Task "${task.title}" has been moved to In Review by ${task.assignedTo?.name}. Please review and approve.`,
    type: 'general',
    link: '/tasks'
  });
}
       
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('assignedTo', 'name role department')
     .populate('project', 'name');
    res.json(task);

    if (req.body.status === 'done') {
  await notifyByEmployeeId({
    employeeId: task.assignedTo._id,
    title: 'Task Approved!',
    message: `Your task "${task.title}" has been approved and marked as complete.`,
    type: 'task_approved',
    link: '/employee/tasks'
  });
}
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTaskStats = async (req, res) => {
  try {
    const total = await Task.countDocuments();
    const todo = await Task.countDocuments({ status: 'todo' });
    const inprogress = await Task.countDocuments({ status: 'inprogress' });
    const review = await Task.countDocuments({ status: 'review' });
    const done = await Task.countDocuments({ status: 'done' });
    const urgent = await Task.countDocuments({ priority: 'urgent' });
    res.json({ total, todo, inprogress, review, done, urgent });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};