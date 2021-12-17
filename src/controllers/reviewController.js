const reviewModel = require('../models/reviewModel')
const validator = require('../validators/validator')
const bookModel = require('../models/bookModel')

const addReview = async function(req, res) {
    try {
        const params = req.params.bookId
        requestReviewBody = req.body
        const { reviewedBy, rating, review } = requestReviewBody;
        if (!validator.isValidObjectId(params)) {
            return res.status(400).send({ status: false, message: "Invalid bookId." })
        }

        if (!validator.isValidRequestBody(requestReviewBody)) {
            return res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide book details to update.' })
        }

        const searchBook = await bookModel.findById({
            _id: params,
            isDeleted: false
        })
        if (!searchBook) {
            return res.status(404).send({ status: false, message: `Book does not exist by this ${params}.` })
        }
        requestReviewBody.bookId = searchBook._id;
        requestReviewBody.reviewedAt = new Date();

        const saveReview = await reviewModel.create(requestReviewBody)
        return res.status(201).send({ status: true, message: "Review added successfully", data: saveReview })
    } catch (err) {
        return res.status(500).send({ status: false, message: "Something went wrong", Error: err.message })
    }
}

module.exports = {
    addReview
}