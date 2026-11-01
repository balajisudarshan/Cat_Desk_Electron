const router = require('express').Router();

const getFullHistory = require('../controllers/history.controller');

router.get('/:regNo',getFullHistory)

module.exports = router