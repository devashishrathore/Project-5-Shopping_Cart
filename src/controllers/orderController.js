const userModel = require('../models/userModel')
const cartModel = require('../models/cartModel')
const orderModel = require('../models/orderModel')
const validator = require('../utils/validator')

//Taking Order for a specific User. =>
const takeOrder = async function (req, res) {
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
            return res.status(403).send({ status: false, message: "Cannot Take Order, Unauthorized access" })
        };
        requestBody = req.body;
        const { cartId, cancellable, status, deletedAt, isDeleted } = requestBody;
        if (!validator.isValidRequestBody(requestBody)) { //to check the empty request body
            return res.status(400).send({ ststus: false, message: "Invalid request parameters,Empty body not accepted." })
        };
        if (!validator.isValid(cartId)) {
            return res.status(400).send({ status: false, message: "cartId is required" })
        }
        if (!validator.isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, message: `${cartId} is Invalid cartId.` })
        }

        const checkCart = await cartModel.findOne({ _id: cartId })
        if (!checkCart) {
            return res.status(400).send({ status: false, message: `cart does not exist with this id ${cartId}` })
        }

        const checkUser = await cartModel.findOne({ userId: params })
        if (!checkUser) {
            return res.status(400).send({ status: false, message: `User does not belong with this cartId ${cartId}` })
        }

        let product = checkCart.items[0].productId
        if (!product) {
            return res.status(400).send({ status: false, message: `product does not exist with this id ${product} to Take Order or User's Cart is Empty` })
        }

        if (product.isDeleted == true) {
            return res.status(400).send({ status: false, message: `Cannot Take Order, ${product} Product has been already deleted. OR this Product is Out of Stock` })
        }
        const items = checkCart.items;
        const totalPrice = checkCart.totalPrice;
        const totalItems = checkCart.totalItems;
        let totalQuantity = 0;
        //Count the total Quantity of all Items => 
        for (let i in checkCart.items) {
            totalQuantity += checkCart.items[i].quantity;
        }
        if (status) {
            if (!validator.isvalidOrderStatus(status)) {
                return res.status(400).send({ status: false, message: "Order Status is pending, completed and cancled foam only." })
            }
        }
        const order = { userId: params, items: items, totalPrice: totalPrice, totalItems: totalItems, totalQuantity: totalQuantity, cancellable: cancellable, status: status, deletedAt: deletedAt, isDeleted: isDeleted }
        const takingOrder = await orderModel.create(order)
        return res.status(201).send({ status: true, message: "Taking Order Successfully", data: takingOrder })
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}

const updateOrder = async function (req, res) {
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
            return res.status(403).send({ status: false, message: "Cannot Take Order, Unauthorized access" })
        };
        requestBody = req.body;
        const { orderId, status } = requestBody;
        if (!validator.isValidRequestBody(requestBody)) { //to check the empty request body
            return res.status(400).send({ ststus: false, message: "Invalid request parameters,Empty body not accepted." })
        };
        if (!validator.isValid(orderId)) {
            return res.status(400).send({ status: false, message: "orderId is required" })
        }
        // check the Order exist or not =>
        const searchOrder = await orderModel.findOne({ _id: orderId });
        if (!validator.isValidObjectId(orderId)) {
            return res.status(400).send({ status: false, message: `${orderId} is Invalid orderId.` })
        }
        if (!searchOrder) {
            return res.status(400).send({ status: false, message: `Order does not exist with this id ${orderId}` })
        };
        if (searchOrder.isDeleted == true) {
            return res.status(400).send({ status: false, message: `Cannot find Order Details, ${orderId} Order has been already deleted.` })
        }

        const checkUser = await orderModel.findOne({ userId: params })
        if (!checkUser) {
            return res.status(400).send({ status: false, message: `User does not belong with this orderId ${orderId}` })
        }

        if (!validator.isValid(status)) {
            return res.status(400).send({ status: false, message: "Order Status is required" })
        }
        if (!validator.validString(status)) {
            return res.status(400).send({ status: false, message: "Order Status is missing" })
        }
        if (!validator.isvalidOrderStatus(status)) {
            return res.status(400).send({ status: false, message: "Order Status is pending, completed and cancled foam only." })
        }

        if (!(searchOrder.cancellable) == "true") {
            return res.status(400).send({ status: false, message: "Order is not Cancellable Condition, So can not to Update it's Status" })
        }
        if ((searchOrder.status) == "completed") {
            return res.status(400).send({ status: false, message: "Order is already completed, So can not to Update it's Status" })
        }
        if ((searchOrder.status) == "cancelled") {
            return res.status(400).send({ status: false, message: "Order is already cancelled, So can not to Update it's Status" })
        }
        const orderUpdate = await orderModel.findOneAndUpdate({ _id: orderId }, { status: status }, { new: true })
        return res.status(200).send({ status: true, message: "Order Update Successfully", data: orderUpdate })
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}
module.exports = { takeOrder, updateOrder }
