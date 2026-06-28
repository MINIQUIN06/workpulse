const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createTask, getAllTasks, getMyTasks,
  updateTask, deleteTask, getTaskStats
} = require('../controllers/taskController');

router.post('/', auth, createTask);
router.get('/', auth, getAllTasks);
router.get('/stats', auth, getTaskStats);
router.get('/my/:employeeId', auth, getMyTasks);
router.put('/:id', auth, updateTask);
router.delete('/:id', auth, deleteTask);

module.exports = router;