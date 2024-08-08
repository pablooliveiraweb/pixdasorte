const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const uuid = require('uuid');
const pool = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const lotteryRoutes = require('./routes/lotteryRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');
const { releasePendingTickets, updatePaymentStatusPeriodically } = require('./controllers/cronController');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Chamar os cron jobs
releasePendingTickets();
updatePaymentStatusPeriodically();

const fs = require('fs');
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuid.v4()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

app.use('/api/users', userRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/lotteries', lotteryRoutes);
app.use('/api/admin', adminRoutes);

app.post('/api/lotteries', upload.single('image'), (req, res, next) => {
  next();
});

app.use('/uploads', express.static(uploadDir));

app.use(errorHandler);

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
