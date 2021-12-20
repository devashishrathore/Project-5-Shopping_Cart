const bookModel = require("../models/bookModel")
const userModel = require("../models/userModel")
const validator = require('../validators/validator')
const reviewModel = require('../models/reviewModel')

const bookCreation = async function(req, res) {
    try {
        let requestBody = req.body;

        if (!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide book details' })
        }
        const { title, excerpt, userId, ISBN, category, subcategory, reviews, releasedAt } = requestBody

        if (!validator.isValid(title)) {
            return res.status(400).send({ status: false, message: "Title must be present" })
        };
        if (!validator.isValid(excerpt)) {
            return res.status(400).send({ status: false, message: "excerpt must be present" })
        };
        if (!validator.isValid(userId)) {
            return res.status(400).send({ status: false, message: "userId must be present" })
        };
        if (!validator.isValid(ISBN)) {
            return res.status(400).send({ status: false, message: "ISBN must be present" })
        };
        if (!validator.isValid(category)) {
            return res.status(400).send({ status: false, message: "category must be present" })
        };
        if (!validator.isValid(subcategory)) {
            return res.status(400).send({ status: false, message: "subcategory must be present" })
        };
        if (!validator.isValid(releasedAt)) {
            return res.status(400).send({ status: false, message: "releasedAt must be present" })
        };
        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: `Invalid userId.` })
        }
        const titleAlreadyUsed = await bookModel.findOne({ title: title })
        if (titleAlreadyUsed) {
            return res.status(400).send({ status: false, message: "Title is already used. Try a new title." })
        }
        const isbnAlreadyUsed = await bookModel.findOne({
            ISBN: ISBN
        });
        if (isbnAlreadyUsed) {
            return res.status(400).send({ status: false, message: "ISBN already used. Try a new ISBN." })
        }
        const user = await userModel.findById(userId)
        if (!user) {
            return res.status(400).send({ status: false, message: `User does not exists` })
        }
        if (userId != req.userId) {
            return res.status(403).send({
                status: false,
                message: "Unauthorized access."
            })
        }
        const newBook = await bookModel.create(requestBody);
        return res.status(201).send({ status: true, message: "Book created successfully", data: newBook })
    } catch (err) {
        return res.status(500).send({ status: false, message: "Something went wrong", Error: err.message })
    }
}

const fetchAllBooks = async function(req, res) {
    try {
        const queryParams = req.query
        const {
            userId,
            category,
            subcategory
        } = queryParams
        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Invalid userId in params." })
        }
        if (userId || category || subcategory) {
            let obj = {};
            if (userId) {
                obj.userId = userId
            }
            if (category) {
                obj.category = category;
            }
            if (subcategory) {
                obj.subcategory = subcategory
            }
            obj.isDeleted = false

            const user = await userModel.findById(userId)
            if (!user) {
                return res.status(400).send({ status: false, message: `User does not exists by ${userId}` })
            }
            if (userId != req.userId) {
                return res.status(403).send({
                    status: false,
                    message: "Unauthorized access."
                })
            }
            let books = await bookModel.find(obj).select({ subcategory: 0, ISBN: 0, isDeleted: 0, updatedAt: 0, createdAt: 0, __v: 0 }).sort({
                title: 1
            });
            if (books == false) {
                return res.status(404).send({ status: false, msg: "No books found" });
            } else {
                res.status(200).send({ status: true, message: "Books list", data: books })
            }
        } else {
            return res.status(400).send({ status: false, msg: "Mandatory filter not given" });
        }
    } catch (err) {
        return res.status(500).send({ status: false, message: "Something went wrong", Error: err.message })
    }
}

const fetchBooksById = async function(req, res) {
    try {
        const params = req.params.bookId
        if (!validator.isValidObjectId(params)) {
            return res.status(400).send({ status: false, message: "Inavlid bookId." })
        }

        const findBook = await bookModel.findOne({
            _id: params,
            isDeleted: false
        })
        if (!findBook) {
            return res.status(404).send({ status: false, message: `Book does not exist or is already been deleted for this ${params}.` })
        }

        if (findBook.userId != req.userId) {
            return res.status(403).send({
                status: false,
                message: "Unauthorized access."
            })
        }
        const fetchReviewsData = await reviewModel.find({ bookId: params, isDeleted: false }).select({ deletedAt: 0, isDeleted: 0, createdAt: 0, __v: 0, updatedAt: 0 }).sort({
            reviewedBy: 1
        })

        const { _id, title, excerpt, userId, category, subcategory, isDeleted, reviews, deletedAt, releasedAt, createdAt, updatedAt } = findBook

        const reviewObj = {
            _id: _id,
            title: title,
            excerpt: excerpt,
            userId: userId,
            category: category,
            subcategory: subcategory,
            isDeleted: isDeleted,
            reviews: reviews,
            deletedAt: deletedAt,
            releasedAt: releasedAt,
            createdAt: createdAt,
            updatedAt: updatedAt,
            reviewsData: fetchReviewsData
        };
        return res.status(200).send({ status: true, message: "Book found Successfully.", data: reviewObj })
    } catch (err) {
        return res.status(500).send({ status: false, message: "Something went wrong", Error: err.message })
    }
}

const updateBookDetails = async function(req, res) {
    try {
        const params = req.params.bookId
        const requestUpdateBody = req.body
        const userIdFromToken = req.userId
        const { title, excerpt, releasedAt, ISBN } = requestUpdateBody;

        if (!validator.isValidObjectId(userIdFromToken)) {
            return res.status(402).send({ status: false, message: "Unauthorized access !" })
        }
        if (!validator.isValidObjectId(params)) {
            return res.status(400).send({ status: false, message: "Invalid bookId." })
        }

        if (!validator.isValidRequestBody(requestUpdateBody)) {
            return res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide book details to update.' })
        }
        if (title || excerpt || ISBN || releasedAt) {
            if (!validator.validString(title)) {
                return res.status(400).send({ status: false, message: "Title is missing ! Please provide the title details to update." })
            }
            if (!validator.validString(excerpt)) {
                return res.status(400).send({ status: false, message: "Excerpt is missing ! Please provide the Excerpt details to update." })
            };
            if (!validator.validString(ISBN)) {
                return res.status(400).send({ status: false, message: "ISBN is missing ! Please provide the ISBN details to update." })
            };
            if (!validator.validString(releasedAt)) {
                return res.status(400).send({ status: false, message: "Released date is missing ! Please provide the released date details to update." })
            };
        }

        const searchBook = await bookModel.findById({
            _id: params,
            isDeleted: false
        })
        if (!searchBook) {
            return res.status(404).send({ status: false, message: `Book does not exist by this ${params}.` })
        }

        if (searchBook.userId != req.userId) {
            return res.status(403).send({
                status: false,
                message: "Unauthorized access."
            })
        }

        const findTitle = await bookModel.findOne({ title: title, isDeleted: false })
        if (findTitle) {
            return res.status(400).send({ status: false, message: `${title.trim()} is already exists.Please try a new title.` })
        }
        const findIsbn = await bookModel.findOne({ ISBN: ISBN, isDeleted: false })
        if (findIsbn) {
            return res.status(400).send({ status: false, message: `${ISBN.trim()} is already registered.` })
        }
        if (searchBook.isDeleted == false) {
            const changeDetails = await bookModel.findOneAndUpdate({ _id: params }, { title: title, excerpt: excerpt, releasedAt: releasedAt, ISBN: ISBN }, { new: true })

            res.status(200).send({ status: true, message: "Successfully updated book details.", data: changeDetails })
        } else {
            return res.status(400).send({ status: false, message: "Unable to update details.Book has been already deleted" })
        }
    } catch (err) {
        return res.status(500).send({ status: false, message: "Something went wrong", Error: err.message })
    }
}

const deleteBook = async function(req, res) {
    try {
        const params = req.params.bookId;

        if (!validator.isValidObjectId(params)) {
            return res.status(400).send({ status: false, message: "Inavlid bookId." })
        }
        const findBook = await bookModel.findById({ _id: params })

        if (!findBook) {
            return res.status(404).send({ status: false, message: `No book found by ${params}` })
        } else if (findBook.userId != req.userId) {
            return res.status(403).send({
                status: false,
                message: "Unauthorized access."
            })
        } else if (findBook.isDeleted == true) {
            return res.status(400).send({ status: false, message: `Book has been already deleted.` })
        } else {
            const deleteData = await bookModel.findOneAndUpdate({ _id: { $in: findBook } }, { $set: { isDeleted: true, deletedAt: new Date() } }, { new: true });
            return res.status(200).send({ status: true, message: "Book deleted successfullly.", data: deleteData })
        }
    } catch (err) {
        return res.status(500).send({ status: false, message: "Something went wrong", Error: err.message })
    }
}
module.exports = {
    bookCreation,
    fetchAllBooks,
    fetchBooksById,
    updateBookDetails,
    deleteBook
}