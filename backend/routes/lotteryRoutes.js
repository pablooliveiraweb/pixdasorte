const express = require('express');
const { createLottery } = require('../controllers/lotteryController');
const router = express.Router();

router.post('/create', createLottery);

module.exports = router;
