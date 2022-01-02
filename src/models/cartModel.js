const mongoose = require("mongoose")
const ObjectId = mongoose.Schema.Types.ObjectId

const cartSchema = new mongoose.Schema({
    userId: { type: ObjectId, required: "userId is required", unique: true, ref: 'User_Collection', trim: true },

    items: [{ productId: { type: ObjectId, required: "productId is required", ref: 'Products_Collection', trim: true }, 
    quantity: { type: Number, required: "quantity is required", min: 1, trim: true } }],

    totalPrice: { type: Number, required: "totalPrice is required", comment: "Holds total price of all the items in the cart", trim: true },

    totalItems: { type: Number, required: "totalItems is required", comment: "Holds total number of items in the cart", trim: true }
}, { timestamps: true })

module.exports = mongoose.model('cart_collection', cartSchema)