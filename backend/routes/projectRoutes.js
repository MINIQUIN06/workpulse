const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getAllProjects,
  getMyProjects,
  createProject,
  updateProject,
  deleteProject
} = require('../controllers/projectController');

router.get('/', auth, getAllProjects);
router.get('/my/:employeeId', auth, getMyProjects);
router.post('/', auth, createProject);
router.put('/:id', auth, updateProject);
router.delete('/:id', auth, deleteProject);

module.exports = router;