const router = require('express').Router();
const { addPayment, getAllPayments, editPaymentHistory } = require('../controllers/payment.controller');

router.get('/', getAllPayments);
router.post('/add', addPayment);
router.put('/history/:id', editPaymentHistory);

module.exports = router;
