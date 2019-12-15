const express = require('express');
const router = express.Router();

// @route GET /api/users
// @desc Test routes
// @access Public
router.get("/", (req, res) => res.send("Users Api"));

module.exports = router;