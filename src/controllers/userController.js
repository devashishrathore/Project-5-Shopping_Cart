const userModel = require('../models/userModel')
const jwt = require('jsonwebtoken')
const validator = require('../validators/validator')

//global variables


//Registering users
const userCreation = async function(req, res) {
    try {
        const requestBody = req.body;
        const {
            title,
            name,
            phone,
            email,
            password
        } = requestBody;

        if (!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({ ststus: false, message: "Invalid request parameters,Empty body not accepted." })
        }

        if (!validator.isValid(title)) {
            return res.status(400).send({ status: false, message: "Title must be present" })
        };
        if (!validator.isValidTitle(title)) {
            return res.status(400).send({ status: false, message: `Title should be among Mr, Mrs or Miss` })
        }
        if (!validator.isValid(name)) {
            return res.status(400).send({ status: false, message: "Name is required." })
        }
        if (!validator.isValid(phone)) {
            return res.status(400).send({ status: false, message: "Phone number is required" })
        }
        if (!validator.isValid(email)) {
            return res.status(400).send({ status: false, message: "Email id is required" })
        }
        if (!validator.isValid(password)) {
            return res.status(400).send({ status: false, message: "password is required" })
        }

        const verifyPhone = await userModel.findOne({ phone: phone })
        if (verifyPhone) {
            return res.status(400).send({ status: false, message: "Phone number already used" })
        }

        const verifyEmail = await userModel.findOne({ email: email })
        if (verifyEmail) {
            return res.status(400).send({ status: false, message: "Email id is already used" })
        }
        if (!/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(phone))
            return res.status(400).send({ status: false, message: "Invalid Phone number." })

        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))
            return res.status(400).send({ status: false, message: "Invalid Email id." })

        if (!(password.length >= 8 && password.length <= 15)) {
            return res.status(400).send({ status: false, message: "Password criteria not fulfilled." })
        }

        const userData = await userModel.create(requestBody)
        return res.status(201).send({ status: true, message: "Successfully saved User data", data: userData })

    } catch (err) {
        return res.status(500).send({ status: false, message: "Something went wrong", Error: err.message })
    }
}

const loginUser = async function(req, res) {
    try {
        const requestBody = req.body;
        const { email, password } = requestBody
        if (!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({ ststus: false, message: "Invalid request parameters,Empty body not accepted." })
        };
        if (!validator.isValid(email)) {
            return res.status(400).send({ status: false, message: "Email id is required" })
        };
        if (!validator.isValid(password)) {
            return res.status(400).send({ status: false, message: "password is required" })
        };
        const findEmail = await userModel.findOne({
            email
        })
        if (!findEmail) {
            return res.status(401).send({ status: false, message: `Invalid login credentials. Please check the Email id.` });
        }
        const findPassword = await userModel.findOne({ password })
        if (!findPassword) {
            return res.status(401).send({ status: false, message: `Invalid login credentials. Please check the password.` });
        }
        const token = jwt.sign({
            userId: findEmail._id,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (60 * 30),
        }, 'group7')

        res.header('x-api-key', token);
        res.status(200).send({ status: true, message: `User login successfull`, data: { token } })
    } catch (err) {
        return res.status(500).send({ status: false, message: "Something went wrong", Error: err.message })
    }
}

module.exports = {
    userCreation,
    loginUser
}