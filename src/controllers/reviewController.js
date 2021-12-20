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
            return res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide review details to update.' })
        }
        if (!validator.validString(reviewedBy)) {
            return res.status(400).send({ status: false, message: "Reviewer's name is required" })
        }
        if (!validator.isValid(rating)) {
            return res.status(400).send({ status: false, message: "Rating is required" })
        }
        if (!validator.validRating(rating)) {
            return res.status(400).send({ status: false, message: "Rating must be 1,2,3,4 or 5." })
        }
        if (!(rating >= 1 && rating <= 5)) {
            return res.status(400).send({ status: false, message: "Rating must be in between 1 to 5." })
        }
        const searchBook = await bookModel.findById({
            _id: params
        })

        if (!searchBook) {
            return res.status(404).send({ status: false, message: `Book does not exist by this ${params}.` })
        }
        if (searchBook.isDeleted == true) {
            return res.status(400).send({ status: false, message: "Cannot add review, Book has been already deleted." })
        }
        requestReviewBody.bookId = searchBook._id;
        requestReviewBody.reviewedAt = new Date();

        let count = 0;
        const saveReview = await reviewModel.create(requestReviewBody)
        count = searchBook.reviews + 1;
        if (saveReview) {
            await bookModel.findOneAndUpdate({ _id: params }, { reviews: count })
        }
        return res.status(201).send({ status: true, message: "Review added successfully", data: saveReview })
    } catch (err) {
        return res.status(500).send({ status: false, message: "Something went wrong", Error: err.message })
    }
}

const updateReview = async function(req, res) {
    try {
        const bookParams = req.params.bookId;
        const reviewParams = req.params.reviewId
        const requestUpdateBody = req.body
        const { review, rating, reviewedBy } = requestUpdateBody;

        if (!validator.isValidObjectId(bookParams)) {
            return res.status(400).send({ status: false, message: "Invalid bookId." })
        }
        if (!validator.isValidObjectId(reviewParams)) {
            return res.status(400).send({ status: false, message: "Invalid reviewId." })
        }
        if (!validator.isValidRequestBody(requestUpdateBody)) {
            return res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide review details to update.' })
        }
        if (review || rating || reviewedBy) {

            if (!validator.validString(review)) {
                return res.status(400).send({ status: false, message: "Review is missing ! Please provide the review details to update." })
            }
            if (!validator.validString(rating)) {
                return res.status(400).send({ status: false, message: "rating is missing ! Please provide the rating details to update." })
            };
            if (!validator.validString(reviewedBy)) {
                return res.status(400).send({ status: false, message: "Reviewer's name is missing ! Please provide the name to update." })
            };
        }

        const searchBook = await bookModel.findById({ _id: bookParams })
        if (!searchBook) {
            return res.status(404).send({ status: false, message: `Book does not exist by this ${bookParams}.` })
        }
        const searchReview = await reviewModel.findById({ _id: reviewParams })
        if (!searchReview) {
            return res.status(404).send({ status: false, message: `Review does not exist by this ${reviewParams}.` })
        }
        if (!validator.validRating(rating)) {
            return res.status(400).send({ status: false, message: "Rating must be 1,2,3,4 or 5." })
        }
        if (!(rating > 0 && rating < 6)) {
            return res.status(400).send({ status: false, message: "Rating must be in between 1 to 5." })
        }
        if (searchBook.isDeleted == false) {
            if (searchReview.isdeleted == false) {
                const updateReviewDetails = await reviewModel.findOneAndUpdate({ _id: reviewParams }, { review: review, rating: rating, reviewedBy: reviewedBy }, { new: true })

                return res.status(200).send({ status: true, message: "Successfully updated the review of the book.", data: updateReviewDetails })
            } else {
                return res.status(400).send({ status: false, message: "Unable to update details.Review has been already deleted" })
            }
        } else {
            return res.status(400).send({ status: false, message: "Unable to update details.Book has been already deleted" })
        }
    } catch (err) {
        return res.status(500).send({ status: false, message: "Something went wrong", Error: err.message })
    }
}

const deleteReview = async function(req, res) {
    try {
        const bookParams = req.params.bookId;
        const reviewParams = req.params.reviewId

        if (!validator.isValidObjectId(bookParams)) {
            return res.status(400).send({ status: false, message: "Invalid bookId." })
        }
        if (!validator.isValidObjectId(reviewParams)) {
            return res.status(400).send({ status: false, message: "Invalid reviewId." })
        }

        const searchBook = await bookModel.findById({ _id: bookParams, isDeleted: false })
        if (!searchBook) {
            return res.status(400).send({ status: false, message: `Book does not exist by this ${bookParams}.` })
        }
        const searchReview = await reviewModel.findById({ _id: reviewParams, isDeleted: false })
        if (!searchReview) {
            return res.status(400).send({ status: false, message: `Review does not exist by this ${reviewParams}.` })
        }
        if (searchBook.isDeleted == false) {
            if (searchReview.isDeleted == false) {
                const deleteReviewDetails = await reviewModel.findOneAndUpdate({ _id: reviewParams }, { isDeleted: true, deletedAt: new Date() }, { new: true })

                let count = searchBook.reviews
                count = count - 1;
                if (deleteReviewDetails) {
                    await bookModel.findOneAndUpdate({ _id: bookParams }, { reviews: count })
                }
                return res.status(200).send({ status: true, message: "Review deleted successfully.", data: deleteReviewDetails })

            } else {
                return res.status(400).send({ status: false, message: "Unable to delete review details.Review has been already deleted" })
            }
        } else {
            return res.status(400).send({ status: false, message: "Unable to delete .Book has been already deleted" })
        }
    } catch (err) {
        return res.status(500).send({ status: false, message: "Something went wrong", Error: err.message })
    }
}

module.exports = {
    addReview,
    updateReview,
    deleteReview
}