const express = require('express')
const { body, validationResult } = require('express-validator')
const { reset } = require('nodemon')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const router = express.Router()
const fetchuser = require('../middleware/fetchuser')
const JWT_SECRET = 'Nayanis@developer'

// Route 1: Create a user using: Post '/api/auth/createuser'. No login required
router.post('/createuser', [
    body('name', 'Enter a valid name!').isLength({ min: 3 }),
    body('email', 'Enter a valid email!').isEmail(),
    body('password', 'Password must be atleast 5 characters!').isLength({ min: 5 }),
], async (req, res) => {
    let success = false

    // if there are errors, reeturn bad request and the errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({success, errors: errors.array() })
    }

    try {
        // check whether the user with this email already exists or not
        let user = await User.findOne({success, email: req.body.email })
        if (user) {
            return res.status(400).json({ error: "User already exists!" })
        }

        // generating a password hash using bcrypt library
        const salt = await bcrypt.genSalt(10)
        const secPass = await bcrypt.hash(req.body.password, salt)
        // create a new user
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass
        })

        const data = {
            user: {
                id: user.id
            }
        }

        const token = jwt.sign(data, JWT_SECRET)
        success = true
        res.json({success, token })

    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal server error!')
    }

})

// Route 2: Authenticate  a user using: Post '/api/auth/login'. No login required
router.post('/login', [
    body('email', 'Enter a valid email!').isEmail(),
    body('password', 'Password cannot be blank!').exists()
], async(req, res) => {
    let success = false
    // if there are errors return bad request and the errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ erros: errors.array() })
    }

    const { email, password } = req.body

    try {
        let user = await User.findOne({ email })
        if (!user) {
            success = false
            return res.status(400).json({success, error: "Please try to login with correct Credentials!" })
        }

        const comparePass = await bcrypt.compare(password, user.password)
        if (!comparePass) {
            success = false
            return res.status(400).json({success, error: "Please try to login with correct Credentials!" })
        }

        const data = {
            user: {
                id: user.id
            }
        }

        const token = jwt.sign(data, JWT_SECRET)
        success = true
        res.json({ success, token })


    } catch (error) {
        console.log(error.message)
        res.status(500).send('Iternal server error!')
    }

})

// Route 3: Get loggedIn use detail using: post '/api/auth/getuser'. login required

router.post('/getuser', fetchuser, async(req, res)=> {
try {
    userId = req.user.id
    const user = await User.findById(userId).select("-password")
    res.send(user)
} catch (error) {
    console.log(error.message)
        res.status(500).send('Iternal server error!')
}
})

module.exports = router