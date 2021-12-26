const mongoose = require("mongoose")
const productSchema = new mongoose.Schema(
    {
        title: { type: String, required: "Title is required", unique: true, trim: true },
        description: { type: String, required: "description is required", trim: true },
        price: { type: Number, required: "price is required", trim: true }, //valid-number/decimal      //TODO
        currencyId: { type: String, required: "currencyId is required", trim: true }, //INR            //TODO
        currencyFormat: { type: String, required: "currencyFormat is required", trim: true }, //₹       //TODO
        isFreeShipping: { type: Boolean, default: false },
        productImage: { type: String, required: "productImage is required", lowercase: true, trim: true }, // s3 link
        style: { type: String, trim: true },
        availableSizes: {
            "type": "array",
            "items": {
                "type": "string",
                "enum": ["S", "XS", "M", "X", "L", "XXL", "XL"]
            }
        },                                                                                         //TODO
        installments: { type: Number, trim: true },
        deletedAt: { type: Date },
        isDeleted: { type: Boolean, default: false },
    }, { timestamps: true })

module.exports = mongoose.model('Products_collection', productSchema)