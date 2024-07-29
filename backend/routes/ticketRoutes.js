const express = require('express');
const { buyTicket, getUserTickets, updateTicketStatus, getAvailableTickets, cancelTickets } = require('../controllers/ticketController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/buy', protect, buyTicket);
router.get('/user-tickets', protect, getUserTickets);
router.post('/update-status', protect, updateTicketStatus);
router.get('/available/:quantity', protect, getAvailableTickets);
router.post('/cancel', protect, cancelTickets);

module.exports = router;
