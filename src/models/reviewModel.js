const mongoose = require("mongoose")
const ObjectId = mongoose.Schema.Types.ObjectId
const reviewSchema = new mongoose.Schema({
    bookId: {
        type: ObjectId,
        required: true,
        ref: 'Book_Collection'
    },
    reviewedBy: {
        type: String,
        required: true,
        default: 'Guest',
        trim: true
    },
    reviewedAt: {
        type: Date,
        required: true
    },
    rating: { type: Number, required: true },
    review: { type: String, default: 'No comments on this book yet.', trim: true },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: { type: Date }
}, { timestamps: true })
module.exports = mongoose.model('Reviews_collection', reviewSchema)