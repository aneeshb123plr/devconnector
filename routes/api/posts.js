const express = require('express');
const router = express.Router();

// @route GET /api/users
// @desc Test routes
// @access Public
router.get("/", (req, res) => res.send("Posts Api"));

module.exports = router;