const express = require('express');
const gravatar = require('gravatar');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const User = require('../../models/User');

// @route GET /api/users
// @desc Register route
// @access Public
router.post("/", [
    check('name', "Name is required").not().isEmpty(),
    check('email', "Provide valid email").isEmail(),
    check('password', "Minimum 6 charcter").isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
    }
    try {
        const { name, email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ errors: [{ msg: "User already exist" }] });
        }

        const avatar = await gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'

        });

        user = new User({
            name,
            email,
            password,
            avatar
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        const payload = {
            user: {
                id: user.id
            }
        }
        jwt.sign(
            payload,
            config.get('jwtSecret'),
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.json(token);
            })

    } catch (err) {
        console.error('Server Error');
        return res.status(500).send('Server error');
    }


});

module.exports = router;