const express = require('express');
const { getTickets, getUsers, drawLottery, 
  getUserCount, getLotterySummary, getWinners, } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();


router.get('/', protect, admin, (req, res) => {
  res.send('Admin Dashboard');});
router.get('/users', protect, admin, getUsers);
router.post('/draw', protect, admin, drawLottery);
router.get('/results', protect, admin, );

router.get('/user-count', protect, admin, getUserCount);
router.get('/lottery-summary', protect, admin, getLotterySummary);
router.get('/winners', protect, admin, getWinners);
module.exports = router;
