const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { addSkill, getEmployeeSkills, deleteSkill } = require('../controllers/skillController');

router.post('/', auth, addSkill);
router.get('/:employeeId', auth, getEmployeeSkills);
router.delete('/:id', auth, deleteSkill);

module.exports = router;