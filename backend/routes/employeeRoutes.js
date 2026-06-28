const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getAllEmployees, getEmployee,
  createEmployee, updateEmployee, deleteEmployee} = require('../controllers/employeeController');

router.get('/', auth, getAllEmployees);
router.get('/:id', auth, getEmployee);
router.post('/', auth, createEmployee);
router.put('/:id', auth, updateEmployee);
router.delete('/:id', auth, deleteEmployee);

module.exports = router;