const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const prisma = require('./config/prisma');

const courseRoute = require('./routes/course.route');
const studentRoute = require('./routes/student.route');
const enrollmentRoute = require('./routes/enrollment.route');
const historyRoute = require('./routes/history.route');
const paymentRoute = require('./routes/payment.route');
const receiptRoute = require('./routes/receipt.route');
const batchRoute = require('./routes/batch.route');

app.use(cors());
app.use(express.json());

app.use('/api/course', courseRoute);
app.use('/api/student', studentRoute);
app.use('/api/batch', batchRoute);
app.use('/api/enrollment', enrollmentRoute);
app.use('/api/history', historyRoute);
app.use('/api/payment', paymentRoute);
app.use('/api/receipt', receiptRoute);

// Test database connection
prisma.$connect()
  .then(() => {
    console.log('Database connected successfully via Prisma');
  })
  .catch((err) => {
    console.error('DB connection failure:', err.message);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});