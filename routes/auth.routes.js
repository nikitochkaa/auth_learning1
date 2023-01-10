const {Router} = require('express')
const bcrypt = require('bcryptjs')
const config = require('config')
const jwt = require('jsonwebtoken')
const {check, validationResult} = require('express-validator')
const User = require('../models/User')
const router = new Router()

router.post(
  '/register',
  [
    check('email', 'Email is incorrect').isEmail(),
    check('password', 'Password should be at least 6 symbols long')
      .isLength({min: 6})
  ],
  async(req, res) => {
  try {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: 'Incorrect data during registration'
      })
    }

    const {email, password} = req.body

    const candidate = await User.findOne({ email })

    if (candidate) {
      return res.status(400).json({message: 'User already exists'})
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = new User({email, password: hashedPassword})

    await user.save()

    res.status(201).json({message: 'User created'})

  } catch (e) {
    console.log(e)
    res.status(500).json({message: 'Something went wrong, try again'})
  }
})

router.post(
  '/login',
  [
    check('email', 'Enter correct email').normalizeEmail().isEmail(),
    check('password', 'Enter password').exists()
  ],
  async(req, res) => {
    try {
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: 'Incorrect data during sign in'
        })
      }

      const {email, password} = req.body
      const user = await User.findOne({email})

      if(!user) {
        return res.status(400).json({message: 'User not found'})
      }

      const isMatch = await bcrypt.compare(password, user.password)

      if (!isMatch) {
        return res.status(400).json({message: 'Incorrect password, try again'})
      }

      const token = jwt.sign(
        {userId: user.id},
        config.get('jwtSecret'),
        {expiresIn: '1h'}
      )

      res.setHeader('Access-Control-Allow-Origin', "*");
      res.setHeader('Access-Control-Allow-Methods', '*');

      res.json({token, userId: user.id})

    } catch (e) {
      res.status(500).json({message: 'Something went wrong, try again'})
    }
})

module.exports = router
