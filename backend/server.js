const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { createUserTable } = require('./models/User');
const { createTicketTable } = require('./models/Ticket');
const { createLotteryTable } = require('./models/Lottery');

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

// Rotas
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/lotteries', require('./routes/lotteryRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes')); // Adicione esta linha

// Conectar ao banco e criar tabelas
createUserTable();
createTicketTable();
createLotteryTable();

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
