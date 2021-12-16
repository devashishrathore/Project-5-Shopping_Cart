const express = require('express');
const router = express.Router();
const userController = require("../controllers/userController")
const bookController = require("../controllers/bookController")
const reviewController = require("../controllers/reviewController")

router.post('/register', userController.userCreation)
router.post('/login', userController.loginUser)
router.post('/books', bookController.bookCreation)
module.exports = router;