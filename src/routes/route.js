const express = require('express');
const router = express.Router();

//Imported controllers files and models files with middlewares.
const userController = require("../controllers/userController")
const productController = require("../controllers/productController")
//const cartController = require("../controllers/cartController")
const middleware = require("../middlewares/auth")

// //User APIs --> To Register & login.
router.post('/register', userController.userCreation)
router.post('/login', userController.loginUser)
router.get('/user/:userId/profile', middleware.userAuth, userController.getUserProfile)
router.put('/user/:userId/profile', middleware.userAuth, userController.updateUserProfile)
// Product APIs 
router.post('/products', productController.productCreation)

module.exports = router;