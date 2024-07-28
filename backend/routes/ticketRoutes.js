const express = require('express');
const { buyTicket, getUserTickets, updateTicketStatus, getAvailableTickets } = require('../controllers/ticketController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/buy', protect, buyTicket);
router.get('/user-tickets', protect, getUserTickets);
router.put('/update-status', protect, updateTicketStatus);
router.get('/available/:quantity', protect, getAvailableTickets);

module.exports = router;
