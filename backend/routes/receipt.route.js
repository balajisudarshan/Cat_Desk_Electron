const express = require("express");
const router = express.Router();

const generateReceipt = require("../controllers/receipt.controller");

router.get("/:reg_no", generateReceipt);
router.post("/:reg_no", generateReceipt);

module.exports = router;
