const express = require('express');
const { getTickets, getUsers, drawLottery, getLotteryResults } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', protect, admin, (req, res) => {
  res.send('Admin Dashboard');});
router.get('/users', protect, admin, getUsers);
router.post('/draw', protect, admin, drawLottery);
router.get('/results', protect, admin, getLotteryResults);

module.exports = router;
