const loginRegister = require('./register_login/router')
const dashboard = require('./dashboard/dashboard')
const gwRouter = require('./gogWebx.js/google_webex')

const router = require('express').Router()

router.use('/', loginRegister)
router.use('/', dashboard)
router.use('/', gwRouter)
module.exports = router