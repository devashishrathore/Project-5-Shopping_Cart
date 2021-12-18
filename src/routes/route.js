const express = require('express');
const router = express.Router();
const userController = require("../controllers/userController")
const bookController = require("../controllers/bookController")
const reviewController = require("../controllers/reviewController")
const middleware = require("../middlewares/auth")

router.post('/register', userController.userCreation)
router.post('/login', userController.loginUser)
router.post('/books', middleware.userAuth, bookController.bookCreation)
router.get('/books', bookController.fetchAllBooks)
router.get('/books/:bookId', bookController.fetchBooksById)
router.put('/books/:bookId', bookController.updateBookDetails)
router.delete('/books/:bookId', bookController.deleteBook)
router.post('/books/:bookId/review', reviewController.addReview)
router.put('/books/:bookId/review/:reviewId', reviewController.updateReview)

module.exports = router;