const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createPayroll, getAllPayrolls, getMyPayrolls,
  markAsPaid, deletePayroll, getPayrollStats} = require('../controllers/payrollController');

router.post('/', auth, createPayroll);
router.get('/all', auth, getAllPayrolls);
router.get('/stats', auth, getPayrollStats);
router.get('/my/:employeeId', auth, getMyPayrolls);
router.put('/:id/pay', auth, markAsPaid);
router.delete('/:id', auth, deletePayroll);

module.exports = router;