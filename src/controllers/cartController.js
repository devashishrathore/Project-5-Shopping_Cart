const userModel = require('../models/userModel')
const productModel = require('../models/productModel')
const cartModel = require('../models/cartModel')
const validator = require('../utils/validator')

//Adding Cart for a specific User. =>
const addCart = async function (req, res) {
        try {
                let params = req.params.userId  //accessing userId from params

                //validation starts. =>
                if (!validator.isValidObjectId(params)) {
                        return res.status(400).send({ status: false, message: `${params} is Invalid userId.` })
                }
                const searchUser = await userModel.findById({ _id: params })
                if (!searchUser) {
                        return res.status(400).send({ status: false, message: `user does not exist with this id ${params}` })
                }
                //To check Authantication Details of User =>
                let userTokenId = req.userId
                if (!(params == userTokenId)) {
                        return res.status(403).send({ status: false, message: "Cannot add Cart, Unauthorized access" })
                };
                requestBody = req.body;
                const { items } = requestBody;
                if (!validator.isValidRequestBody(requestBody)) { //to check the empty request body
                        return res.status(400).send({ ststus: false, message: "Invalid request parameters,Empty body not accepted." })
                };
                const AlreadyCartAdded = await cartModel.findOne({ userId: params })
                if (!AlreadyCartAdded) {
                        if (!validator.isValid(items)) {
                                return res.status(400).send({ status: false, message: "items is required" })
                        }
                        if (!validator.isValidObjectId(items[0].productId)) {
                                return res.status(400).send({ status: false, message: `${items[0].productId} is Invalid productId.` })
                        }
                        const product = await productModel.findOne({ _id: items[0].productId })

                        if (!product) {
                                return res.status(400).send({ status: false, message: `product does not exist with this id ${items[0].productId}` })
                        }
                        //verifying the product is deleted or not so that we can add a cart for it =>
                        if (product.isDeleted == true) {
                                return res.status(400).send({ status: false, message: "Cannot add Cart, Product has been already deleted." })
                        }
                        if (!validator.isValid(items[0].quantity)) {
                                return res.status(400).send({ status: false, message: "quantity must be present" })
                        };
                        if (!validator.isvalidNumber(items[0].quantity)) {
                                return res.status(400).send({ status: false, message: "quantity must be content numeric values only." })
                        };
                        if (items[0].quantity <= 0) {
                                return res.status(400).send({ status: false, message: "quantity must be content positive number only." })
                        };
                        //count total items
                        const totalItems = items.length;
                        // check total price of selected product
                        const productPrice = product.price;
                        const totalPrice = productPrice * items[0].quantity;
                        // cart added in DB
                        const cartData = { userId: params, items: items, totalItems: totalItems, totalPrice: totalPrice }
                        const createCart = await cartModel.create(cartData)
                        return res.status(201).send({ status: true, message: "cart added successfully", data: createCart })

                } // to add the Products in exist Cart of User =>
                else {
                        const checkProduct = await productModel.findOne({ _id: items[0].productId })
                        if (!checkProduct) {
                                return res.status(400).send({ status: false, message: `product does not exist with this id ${items[0].productId}` })
                        }
                        //verifying the product is deleted or not so that we can add a cart for it =>
                        if (checkProduct.isDeleted == true) {
                                return res.status(400).send({ status: false, message: "Cannot add Product, Product has been already deleted." })
                        }
                        // check total price of selected products =>
                        const totalPrice = AlreadyCartAdded.totalPrice + (checkProduct.price * items[0].quantity);
                        // to increase the qunatity of already exist product =>
                        for (let i = 0; i < AlreadyCartAdded.items.length; i++) {
                                if (AlreadyCartAdded.items[i].productId == items[0].productId) {
                                        AlreadyCartAdded.items[i].quantity = AlreadyCartAdded.items[i].quantity + items[0].quantity
                                        // increas product quantity and price in DB =>
                                        const cartDetails = await cartModel.findOneAndUpdate({ userId: params }, { items: AlreadyCartAdded.items, totalPrice: totalPrice }, { new: true })
                                        return res.status(201).send({ status: true, message: `increase quantity in exist ${items[0].productId} Product successfully.`, data: cartDetails })
                                }
                        }
                        // Count total itmes in Cart =>
                        const totalItems = items.length + AlreadyCartAdded.totalItems;
                        // add Product in DB =>
                        const addProduct = await cartModel.findOneAndUpdate({ userId: params }, { $addToSet: { items: { $each: items } }, totalItems: totalItems, totalPrice: totalPrice }, { new: true })
                        return res.status(201).send({ status: true, message: `Add this ${items[0].productId} Product successfully.`, data: addProduct })
                }

        } catch (err) {
                res.status(500).send({ status: false, msg: err.message })
        }
}
const updateCart = async function (req, res) {
        try {
                let params = req.params.userId  //accessing userId from params

                //validation starts. =>
                if (!validator.isValidObjectId(params)) {
                        return res.status(400).send({ status: false, message: `${params} is Invalid userId.` })
                }
                const searchUser = await userModel.findById({ _id: params })
                if (!searchUser) {
                        return res.status(400).send({ status: false, message: `user does not exist with this id ${params}` })
                }
                //To check Authantication Details of User =>
                let userTokenId = req.userId
                if (!(params == userTokenId)) {
                        return res.status(403).send({ status: false, message: "Cannot add Cart, Unauthorized access" })
                };
                requestBody = req.body;
                const { cartId, productId, removeProduct } = requestBody;
                if (!validator.isValidRequestBody(requestBody)) { //to check the empty request body
                        return res.status(400).send({ ststus: false, message: "Invalid request parameters,Empty body not accepted." })
                };
                if (!validator.isValid(cartId)) {
                        return res.status(400).send({ status: false, message: "cartId is required" })
                }
                // check the cart exist or not =>
                const searchCart = await cartModel.findOne({ _id: cartId });
                if (!validator.isValidObjectId(cartId)) {
                        return res.status(400).send({ status: false, message: `${cartId} is Invalid cartId.` })
                }
                if (!searchCart) {
                        return res.status(400).send({ status: false, message: `cart does not exist with this id ${cartId}` })
                };
                if (!validator.isValid(productId)) {
                        return res.status(400).send({ status: false, message: "productId is required" })
                }
                // check the product exist or not in cart =>
                const product = await productModel.findOne({ _id: productId })
                if (!validator.isValidObjectId(productId)) {
                        return res.status(400).send({ status: false, message: `${productId} is Invalid productId.` })
                }
                if (!product) {
                        return res.status(400).send({ status: false, message: `product does not exist with this id ${productId}` })
                }
                //verifying the product is deleted or not so that we can add a cart for it =>
                if (product.isDeleted == true) {
                        return res.status(400).send({ status: false, message: `Cannot find Product, ${productId} Product has been already deleted.` })
                }
                if (!validator.isValid(removeProduct)) {
                        return res.status(400).send({ status: false, message: "removeProduct Key is required" })
                }
                if (!validator.validRemoveKey(removeProduct)) {
                        return res.status(400).send({ status: false, message: "removeProduct Key is only content 0 or 1." })
                }
                if (removeProduct == 0) {
                        for (let i = 0; searchCart.items.length > 0; i++) {
                                if (searchCart.items[i].productId == productId) {
                                        const changePrice = searchCart.totalPrice - (product.price * searchCart.items[i].quantity)
                                        const totalItems = searchCart.totalItems - 1
                                        // to remove the Product from items list =>
                                        searchCart.items.splice(i, 1)
                                        const removedProduct = await cartModel.findByIdAndUpdate({ _id: cartId }, { items: searchCart.items, totalItems: totalItems, totalPrice: changePrice }, { new: true })
                                        return res.status(201).send({ status: true, message: `${productId} Product removed Successfully`, data: removedProduct })
                                }
                        }
                }
                if (removeProduct == 1) {
                        for (let i = 0; i < searchCart.items.lenght; i++) {
                                if (searchCart.items[i].productId == productId) {
                                        const changePrice = searchCart.totalPrice - product.price
                                        searchCart.items[i].quantity = searchCart.items[i].quantity - 1
                                        // check if quantity is more than 1 =>
                                        if (searchCart.items[i].quantity > 0) {
                                                const removeProductQantity = await cartModel.findOneAndUpdate({ _id: cartId }, { items: searchCart.items, totalPrice: changePrice }, { new: true })
                                                return res.status(201).send({ status: true, message: `remove One quantity of the ${productId} Product Successfully`, data: removeProductQantity })
                                        } // if quantity is only One and remove Product from items List =>
                                        else {
                                                const totalItems = searchCart.totalItems - 1
                                                searchCart.items.splice(i, 1)
                                                const removeItem = await cartModel.findOneAndUpdate({ _id: cartId }, { items: searchCart.items, totalItems: totalItems, totalPrice: changePrice }, { new: true })
                                                return res.status(201).send({ status: true, message: `${productId} remove Product from items list`, data: removeItem })
                                        }

                                }
                        }
                }
        }
        catch (err) {
                res.status(500).send({ status: false, msg: err.message })
        }
}
const getCartDetails = async function (req, res) {
        try {
                let params = req.params.userId  //accessing userId from params

                //validation starts. =>
                if (!validator.isValidObjectId(params)) {
                        return res.status(400).send({ status: false, message: `${params} is Invalid userId.` })
                }
                // check the User exist or not =>
                const searchUser = await userModel.findById({ _id: params })
                if (!searchUser) {
                        return res.status(400).send({ status: false, message: `user does not exist with this id ${params}` })
                }
                //To check Authantication Details of User =>
                let userTokenId = req.userId
                if (!(params == userTokenId)) {
                        return res.status(403).send({ status: false, message: "Cannot add Cart, Unauthorized access" })
                };
                // check the Cart exist or not =>
                const searchCart = await cartModel.findOne({ userId: params });
                if (!searchCart) {
                        return res.status(400).send({ status: false, message: `cart does not exist with this id ${params}` })
                };
                return res.status(200).send({ status: true, message: "User Cart Details found Successfully", data: searchCart })
        }
        catch (err) {
                res.status(500).send({ status: false, msg: err.message })
        }
}

const deleteCart = async function (req, res) {
        try {
                let params = req.params.userId  //accessing userId from params

                //validation starts. =>
                if (!validator.isValidObjectId(params)) {
                        return res.status(400).send({ status: false, message: `${params} is Invalid userId.` })
                }
                // check the User exist or not =>
                const searchUser = await userModel.findById({ _id: params })
                if (!searchUser) {
                        return res.status(400).send({ status: false, message: `user does not exist with this id ${params}` })
                }
                //To check Authantication Details of User =>
                let userTokenId = req.userId
                if (!(params == userTokenId)) {
                        return res.status(403).send({ status: false, message: "Cannot add Cart, Unauthorized access" })
                };
                // check the Cart exist or not =>
                const searchCart = await cartModel.findOne({ userId: params });
                if (!searchCart) {
                        return res.status(400).send({ status: false, message: `cart does not exist with this id ${params}` })
                };
                const DeleteCart = await cartModel.findOneAndUpdate({ userId: params }, { items: [], totalItems: 0, totalPrice: 0 }, { new: true })
                return res.status(200).send({ status: true, message: "User Cart deleted Successfully", data: DeleteCart })
        }
        catch (err) {
                res.status(500).send({ status: false, msg: err.message })
        }
}
module.exports = {
        addCart,
        updateCart,
        getCartDetails,
        deleteCart
}
