const express = require("express");
const router = express.Router();

const { getAllBatches, createBatch } = require("../controllers/batch.controller");

router.get("/", getAllBatches);
router.post("/", createBatch);
module.exports = router;
