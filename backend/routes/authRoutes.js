const { register, login, changePassword, createAccount, 
    getAllAccounts, deleteAccount } = require('../controllers/authController');

const express = require('express');
const router = express.Router();
//const { register, login, changePassword } = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/change-password', auth, changePassword);
router.post('/create-account', auth, createAccount);
router.get('/accounts', auth, getAllAccounts);
router.delete('/accounts/:id', auth, deleteAccount);

module.exports = router;