const express = require('express')
const { addEnrollment,getStudentEnrollment } = require('../controllers/enrollment.controller')
const router = express.Router()

router.post('/',addEnrollment);
router.get('/student/:id',getStudentEnrollment);

module.exports = router