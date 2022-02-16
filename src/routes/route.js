const express = require('express');
const router = express.Router();

//Imported controllers files and models files with middlewares.
const userController = require("../controllers/userController")
const productController = require("../controllers/productController")
const cartController = require("../controllers/cartController")
const orderController = require("../controllers/orderController")
const middleware = require("../middlewares/auth")

//User APIs =>
router.post('/register', userController.userCreation)
router.post('/login', userController.loginUser)
router.get('/user/:userId/profile', middleware.userAuth, userController.getUserProfile)
router.put('/user/:userId/profile', middleware.userAuth, userController.updateUserProfile)
// Product APIs =>
router.post('/products', productController.productCreation)
router.get('/products', productController.getproduct)
router.get('/products/:productId', productController.getProductById)
router.put('/products/:productId', productController.updateProduct)
router.delete('/products/:productId', productController.deleteProduct)
// Cart APIs =>
router.post('/users/:userId/cart', middleware.userAuth, cartController.addCart)
router.put('/users/:userId/cart', middleware.userAuth, cartController.updateCart)
router.get('/users/:userId/cart', middleware.userAuth, cartController.getCartDetails)
router.delete('/users/:userId/cart', middleware.userAuth, cartController.deleteCart)
// Order API's =>
router.post('/users/:userId/orders', middleware.userAuth, orderController.takeOrder)
router.put('/users/:userId/orders', middleware.userAuth, orderController.updateOrder)

module.exports = router;
