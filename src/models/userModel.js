const mongoose = require("mongoose")
const userSchema = new mongoose.Schema({
    fname: { type: String, required: [true, "fname is required"], trim: true },
    lname: { type: String, required: [true, "lname is required"], trim: true },
    email: { type: String, required: [true, "email is required"], unique: true, trim: true, lowercase: true },
    profileImage: { type: String, required: [true, "profileImage is required"], trim: true, lowercase: true }, // s3 link
    phone: { type: String, required: [true, "phone number is required"], unique: true, trim: true }, // phone: { type: String, required: true, unique: true, trim: true, valid: 'valid Indian mobile number' },
    password: { type: String, required: [true, "password is required"], trim: true }, // encrypted password
    address: {
        shipping: {
            street: { type: String, required: [true, "shipping street is required"], trim: true },
            city: { type: String, required: [true, "shipping city is required"], trim: true },
            pincode: { type: Number, required: [true, "shipping pincode is required"], trim: true }
        },
        billing: {
            street: { type: String, required: [true, "billing street is required"], trim: true },
            city: { type: String, required: [true, "billing city is required"], trim: true },
            pincode: { type: Number, required: [true, "billing pincode is required"], trim: true }
        },
    },
}, { timestamps: true })
module.exports = mongoose.model("User_collection", userSchema)