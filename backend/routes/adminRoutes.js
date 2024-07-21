const express = require('express');
const { getTickets, getUsers, drawLottery, getLotteryResults } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/tickets', protect, admin, getTickets);
router.get('/users', protect, admin, getUsers);
router.post('/draw', protect, admin, drawLottery);
router.get('/results', protect, admin, getLotteryResults);

module.exports = router;
