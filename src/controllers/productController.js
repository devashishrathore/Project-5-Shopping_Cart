const productModel = require("../models/productModel")
const validator = require('../utils/validator')
const config = require('../utils/aws-s3-config');

//creating Product
const productCreation = async function (req, res) {
    try {
        let requestBody = req.body;
        let files = req.files;
        const { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments, deletedAt, isDeleted } = requestBody
        //Validation starts
        if (!validator.isValidRequestBody(requestBody)) { //for empty req body.
            return res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide Product details' })
        }
        if (!validator.isValid(title)) {
            return res.status(400).send({ status: false, message: "Title must be present" })
        };
        if (!validator.isValid(description)) {
            return res.status(400).send({ status: false, message: "description must be present" })
        };
        if (!validator.isValid(price)) {
            return res.status(400).send({ status: false, message: "price must be present" })
        };
        if (!validator.isvalidNumber(price)) {
            return res.status(400).send({ status: false, message: "price must be content numeric values only." })
        };
        if (!validator.isValid(currencyId)) {
            return res.status(400).send({ status: false, message: "currencyId must be present" })
        };
        if (!validator.isvalidCurrencyId(currencyId)) {
            return res.status(400).send({ status: false, message: "currencyId must be coded for Indian Rupee only, like 'INR' " })
        };
        if (!validator.isValid(currencyFormat)) {
            return res.status(400).send({ status: false, message: "currencyFormat must be present" })
        }
        if (!validator.isvalidCurrencyFormat(currencyFormat)) {
            return res.status(400).send({ status: false, message: "currencyFormat must be coded for Indian Symbol only, like '₹'" })
        };
        if (!files || (files && files.length === 0)) {
            return res.status(400).send({ status: false, message: "Please provide product Image or product Image field" });
        }
        if (!validator.validString(style)) {
            return res.status(400).send({ status: false, message: "style string is missing" })
        };
        if (!validator.isValid(availableSizes)) {
            return res.status(400).send({ status: false, message: "availableSizes is requried" })
        }
        if (!validator.validString(installments)) {
            return res.status(400).send({ status: false, message: "installments is missing" })
        }
        if (installments) {
            if (!/^[0-9]+$/.test(installments)) {
                return res.status(400).send({ status: false, message: "Please only enter numeric characters only for your installments! (Allowed input:0-9)" })
            }
        }
        //validation ends.
        //searching title in database to maintain uniqueness.
        const titleAlreadyUsed = await productModel.findOne({ title: title })
        if (titleAlreadyUsed) {
            return res.status(400).send({ status: false, message: "Title is already used. Try a new title." })
        }
        let productImage = await config.uploadFile(files[0]);
        let productData = { title, description, price, currencyId, currencyFormat, isFreeShipping, productImage: productImage, style, availableSizes, installments, deletedAt, isDeleted }
        let array = availableSizes.split(",").map(x => x.trim())
        for (let i = 0; i < array.length; i++) {
            if (!(["S", "XS", "M", "X", "L", "XXL", "XL"].includes(array[i]))) {
                return res.status(400).send({ status: false, msg: `Available sizes must be among ${["S", "XS", "M", "X", "L", "XXL", "XL"].join(',')}` })
            }
            if (Array.isArray(array)) {
                productData['availableSizes'] = array
            }
            const newproduct = await productModel.create(productData);
            return res.status(201).send({ status: true, message: "product created successfully", data: newproduct })
        }
    }
    catch (err) {
        return res.status(500).send({ status: false, message: "Something went wrong", Error: err.message })
    }
}

const getproduct = async (req, res) => {
    try {
        let filterQuery = req.query;
        let { size, name, priceGreaterThan, priceLessThan, priceSort } = filterQuery;
        if (size || name || priceGreaterThan || priceLessThan || priceSort) {
            let query = {}
            query['isDeleted'] = false;
            if (size) {
                query['availableSizes'] = size
            }
            if (name) {
                name = name.trim()
                query['title'] = { $regex: name }
            }
            if (priceGreaterThan) {
                query['price'] = { $gt: priceGreaterThan }
                if (!validator.isvalidNumber(priceGreaterThan)) {
                    return res.status(400).send({ status: false, message: "priceGreaterThan must be content numeric values only." })
                };
                if ((priceGreaterThan <= 0)) {
                    return res.status(400).send({ status: false, message: "priceGreaterThan must be content Positive numeric values only, Invalid Price" })
                };
            }
            if (priceLessThan) {
                query['price'] = { $lt: priceLessThan }
                if (!validator.isvalidNumber(priceLessThan)) {
                    return res.status(400).send({ status: false, message: "priceLessThan must be content numeric values only." })
                };
                if ((priceLessThan <= 0)) {
                    return res.status(400).send({ status: false, message: "priceLessThan must be content Positive numeric values only, Invalid Price" })
                };
            }
            if (priceGreaterThan && priceLessThan) {
                query['price'] = { '$gt': priceGreaterThan, '$lt': priceLessThan }
            }
            if (priceSort) {
                if (priceSort == -1 || priceSort == 1) {
                    query['priceSort'] = priceSort
                } else {
                    return res.status(400).send({ status: false, message: "Please provide valid value of priceSort" })
                }
            }
            let getAllProducts = await productModel.find(query).sort({ price: query.priceSort })
            const countproducts = getAllProducts.length
            if (!(countproducts > 0)) {
                return res.status(404).send({ status: false, msg: "No products found" })
            }
            return res.status(200).send({ status: true, message: `${countproducts} Products Found`, data: getAllProducts });
        }
    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, msg: err.message })
    }
}
const getProductById = async function (req, res) {
    try {
        const params = req.params.productId;
        if (!validator.isValidObjectId(params)) {
            return res.status(400).send({ status: false, message: `${params} is Invalid ProductId` })
        }
        const findProduct = await productModel.findOne({ _id: params });
        if (!findProduct) {
            return res.status(404).send({ status: false, message: `product does not exists by this Id ${params}` })
        }
        if (findProduct.isDeleted == true) {
            return res.status(400).send({ status: false, message: `Cannot find this id ${params} product, Product has been already deleted.` })
        }
        return res.status(201).send({ status: true, message: "product found successfully", data: findProduct })

    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message });
    }
}

const updateProduct = async function (req, res) {
    try {
        const params = req.params.productId;
        const files = req.files
        const requestUpdateBody = req.body
        if (!validator.isValidObjectId(params)) {
            return res.status(400).send({ status: false, message: `${params} is Invalid ProductId to update the Product` })
        }
        const findProduct = await productModel.findOne({ _id: params });
        if (!findProduct) {
            return res.status(404).send({ status: false, message: `product does not exists by this Id ${params}` })
        }
        if (findProduct.isDeleted == true) {
            return res.status(400).send({ status: false, message: `Cannot update Details this id ${params} product, Product has been already deleted.` })
        }
        const { title, description, price, isFreeShipping, style, installments } = requestUpdateBody;
        if (title || description || price || isFreeShipping || productImage || style || installments) {
            if (!validator.validString(title)) {
                return res.status(400).send({ status: false, message: 'title is missing' })
            }
            const titleAlreadyUsed = await productModel.findOne({ title: title })
            if (titleAlreadyUsed) {
                return res.status(400).send({ status: false, message: "Title is already used. Try a new title to update product title." })
            }
            if (!validator.validString(description)) {
                return res.status(400).send({ status: false, message: 'description is missing' })
            }
            if (price) {
                if (!validator.validString(price)) {
                    return res.status(400).send({ status: false, message: 'price is missing' })
                }
                if (!validator.isvalidNumber(price)) {
                    return res.status(400).send({ status: false, message: "price must be content numeric values only." })
                };
            }
            if (!validator.validString(isFreeShipping)) {
                return res.status(400).send({ status: false, message: 'isFreeShipping flag is missing' })
            }
            if (files) {
                if (validator.isValidRequestBody(files)) {
                    if (!(files && files.length > 0)) {
                        return res.status(400).send({ status: false, message: "profile image is missing" })
                    }
                    var updatedProductImage = await config.uploadFile(files[0])
                }
            }
            //     if(productImage){ 
            //     if (!files || (files && files.length === 0)) {
            //         return res.status(400).send({ status: false, message: "Please provide product Image or product Image field to update the productImage" });
            //     }
            // }
            if (!validator.validString(style)) {
                return res.status(400).send({ status: false, message: 'style is missing' })
            }
            if (!validator.validString(installments)) {
                return res.status(400).send({ status: false, message: 'installments is missing' })
            }
            if (installments) {
                if (!/^[0-9]+$/.test(installments)) {
                    return res.status(400).send({ status: false, message: "cannot Update, Please only enter numeric characters only for your installments! (Allowed input:0-9)" })
                }
            }
        }
        const changeProduct = await productModel.findOneAndUpdate({ _id: params }, {
            $set: {
                title: title,
                description: description,
                price: price,
                isFreeShipping: isFreeShipping,
                productImage: updatedProductImage,
                style: style,
                installments: installments
            }
        }, { new: true })
        return res.status(200).send({ status: true, message: "Prouct details update successfully", data: changeProduct })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: "something went wrong", msg: err.message });
    }
}

const deleteProduct = async function (req, res) {
    try {
        let params = req.params.productId;
        if (!validator.isValidObjectId(params)) {
            return res.status(400).send({ status: false, message: `${params} is Invalid productId.` })
        }
        const product = await productModel.findOne({ _id: params })
        if (!product) {
            return res.status(400).send({ status: false, message: `product does not exist with this id ${params}` })
        }
        //verifying the product is deleted or not so that we can add a cart for it =>
        if (product.isDeleted == true) {
            return res.status(400).send({ status: false, message: `Cannot Delete Product,this ${params} Product has been already deleted.` })
        }
        const DeleteProduct = await productModel.findByIdAndUpdate({ _id: params }, { isDeleted: true, deletedAt: new Date() }, { new: true })
        return res.status(200).send({ status: true, message: `This ${params} Product Deleted Successfully`, data: DeleteProduct })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: "something went wrong", msg: err.message });
    }
}
module.exports = {
    productCreation,
    getproduct,
    getProductById,
    updateProduct,
    deleteProduct
}