const express = require('express');
const multer = require('multer');
const path = require('path');
const uuid = require('uuid');
const { createLottery, getLotteries, getTicketsByLotteryId, drawLottery, deleteLottery, getActiveLottery } = require('../controllers/lotteryController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${uuid.v4()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

router.post('/', protect, admin, upload.single('image'), createLottery);
router.get('/', protect, admin, getLotteries);
router.get('/active', getActiveLottery); // Nova rota para buscar o sorteio ativo
router.get('/:id/tickets', protect, admin, getTicketsByLotteryId);
router.post('/:id/draw', protect, admin, drawLottery);
router.delete('/:id', protect, admin, deleteLottery);

module.exports = router;
