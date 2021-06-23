const router = require("express").Router();

const rootRoutes = require('./rootRoutes')

router.use('/', rootRoutes)

module.exports = router