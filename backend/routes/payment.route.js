const router = require('express').Router();
const { addPayment, getAllPayments } = require('../controllers/payment.controller');

router.get('/', getAllPayments);
router.post('/add', addPayment);

module.exports = router;
