const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const orderSchema = new mongoose.Schema({
    userId: { type: ObjectId, required: "userId is required", ref: 'User_Collection', trim: true },

    items: [{ productId: { type: ObjectId, required: "productId is required", ref: 'Products_Collection', trim: true }, 
    quantity: { type: Number, required: "quantity is required", min: 1, trim: true } }],

    totalPrice: { type: Number, required: "totalPrice is required", comment: "Holds total price of all the items in the cart", trim: true },

    totalItems: { type: Number, required: "totalItems is required", comment: "Holds total number of items in the cart", trim: true },

    totalQuantity: { type: Number, required: "totalQuantity is required", comment: "Holds total number of items in the cart", trim: true },

    cancellable: {type:Boolean, default: true},

    status: {type:String, default: 'pending', enum:["pending", "completed", "cancled"]},

    deletedAt: {type:Date},

    isDeleted: {type:Boolean, default: false},

}, { timestamps: true })

module.exports = mongoose.model("Order_Collection", orderSchema)
