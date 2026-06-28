const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  applyLeave, getMyLeaves, getAllLeaves,
  getPendingLeaves, updateLeaveStatus, deleteLeave
} = require('../controllers/leaveController');

router.post('/', auth, applyLeave);
router.get('/my/:employeeId', auth, getMyLeaves);
router.get('/all', auth, getAllLeaves);
router.get('/pending', auth, getPendingLeaves);
router.put('/:id', auth, updateLeaveStatus);
router.delete('/:id', auth, deleteLeave);

module.exports = router;