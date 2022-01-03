const userModel = require('../models/userModel')
const validator = require('../utils/validator')
const config = require('../utils/aws-s3-config')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const saltRounds = 10

//Registering users
const userCreation = async function (req, res) {
    try {
        let requestBody = req.body;
        let files = req.files;
        let { fname, lname, email, phone, password, address } = requestBody; //Object destructuring

        //Validation starts
        if (!validator.isValidRequestBody(requestBody)) { //to check the empty request body
            return res.status(400).send({ ststus: false, message: "Invalid request parameters,Empty body not accepted." })
        }
        if (!validator.isValid(fname)) {
            return res.status(400).send({ status: false, message: "fname must be present" })
        };
        if (!validator.alphabeticString(fname)) {
            return res.status(400).send({ status: false, message: "You can't use special character or number in fname" });
        }
        if (!validator.isValid(lname)) {
            return res.status(400).send({ status: false, message: "lname is required." })
        }
        if (!validator.alphabeticString(lname)) {
            return res.status(400).send({ status: false, message: "You can't use special character or number in lname" });
        }
        if (!validator.isValid(email)) {
            return res.status(400).send({ status: false, message: "Email id is required" })
        }
        if (!files || (files && files.length === 0)) {
            return res.status(400).send({ status: false, message: "Please provide profile Image or profile Image field" });
        }
        if (!validator.isValid(phone)) {
            return res.status(400).send({ status: false, message: "Phone number is required" })
        }
        if (!validator.isValid(password)) {
            return res.status(400).send({ status: false, message: "password is required" })
        }
        if (!validator.isValid(address)) {
            return res.status(400).send({ status: false, message: "address is required" })
        }
        if (!validator.isValid(address.shipping.street)) {
            return res.status(400).send({ status: false, message: "Please provide shipping address street or address shipping street field" });
        }
        if (!validator.isValid(address.shipping.city)) {
            return res.status(400).send({ status: false, message: "Please provide shipping address city or address shipping city field" });
        }
        if (!validator.isValid(address.shipping.pincode)) {
            return res.status(400).send({ status: false, message: "Please provide shipping address pincode or address shipping pincode field" });
        }
        if (!validator.isValid(address.billing.street)) {
            return res.status(400).send({ status: false, message: "Please provide billing address street or address billing street field" });
        }
        if (!validator.isValid(address.billing.city)) {
            return res.status(400).send({ status: false, message: "Please provide billing address city or address billing city field" });
        }
        if (!validator.isValid(address.billing.pincode)) {
            return res.status(400).send({ status: false, message: "Please provide billing address pincode or address billing pincode field" });
        }
        //validation end.

        //searching phone in DB to maintain uniqueness.
        const verifyPhone = await userModel.findOne({ phone: phone })
        if (verifyPhone) {
            return res.status(400).send({ status: false, message: `${phone} is already used, Please Try different phone number` })
        }

        //searching email in DB to maintain uniqueness.
        const verifyEmail = await userModel.findOne({ email: email })
        if (verifyEmail) {
            return res.status(400).send({ status: false, message: `${email} is already used,Please enter different email` })
        }

        //validating phone number of indian phone only.
        if (!/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/.test(phone.trim())) {
            return res.status(400).send({ status: false, message: `Phone number should be a valid indian number` });
        }
        //validating email using RegEx.
        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email.trim())) {
            return res.status(400).send({ status: false, message: "Invalid Email, please enter a valid email to registed" })
        }
        //validating pincode for shipping.
        if (!/^[1-9][0-9]{5}$/.test(address.shipping.pincode.trim())) {
            return res.status(400).send({ status: false, message: `${address.shipping.pincode} is Invalid Pincode for shipping address` })
        }
        //validating pincode for billing.
        if (!/^[1-9][0-9]{5}$/.test(address.billing.pincode.trim())) {
            return res.status(400).send({ status: false, message: `${address.billing.pincode} is Invalid Pincode for billing address` })
        }
        //setting password's mandatory length in between 8 to 15 characters.
        if (!(password.length >= 8 && password.length <= 15)) {
            return res.status(400).send({ status: false, message: "Password criteria not fulfilled, Password must be content minimum 8 character & maximum 15" })
        }
        // password encryption
        const encryptedPassword = await bcrypt.hash(password, saltRounds)

        // expect this function to take file as input and give url of uploaded file as output 
        let profileImage = await config.uploadFile(files[0]);

        //saving user's data into DB.
        userData = { fname, lname, email, profileImage, phone, password: encryptedPassword, address }
        const userDetails = await userModel.create(userData)
        return res.status(201).send({ status: true, message: "Successfully saved User data", data: userDetails })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: "Something went wrong", Error: err.message })
    }
}

//User login.
const loginUser = async function (req, res) {
    try {
        const requestBody = req.body;
        const { email, password } = requestBody //object destructuring

        //Validation starts.
        if (!validator.isValidRequestBody(requestBody)) { //for empty req body
            return res.status(400).send({ ststus: false, message: "Invalid request parameters,Empty body not accepted." })
        };
        if (!validator.isValid(email.trim())) {
            return res.status(400).send({ status: false, message: "Email id is required" })
        };
        if (!validator.isValid(password)) {
            return res.status(400).send({ status: false, message: "password is required" })
        };
        //validation ends.

        //searching credentials of user in DB to cross verify.
        const findEmail = await userModel.findOne({
            email
        })
        if (!findEmail) {
            return res.status(401).send({ status: false, message: `Invalid login credentials. Please check the Email id.` });
        }
        let hashedPassword = findEmail.password
        const findPassword = await bcrypt.compare(password, hashedPassword)
        if (!findPassword) {
            return res.status(401).send({ status: false, message: `Invalid login credentials. Please check the password.` });
        }

        const userId = findEmail._id //saving userId by sarching the email & password of the specified user.

        //Generating token by the userId
        const token = await jwt.sign({
            userId: userId,
            iat: Math.floor(Date.now() / 1000), //time of issuing the token.
            exp: Math.floor(Date.now() / 1000) + 60 * 30 //setting token expiry time limit.
        }, 'group14')
        return res.status(200).send({ status: true, message: `User logged in successfully.`, data: { userId, token } });
    }
    catch (err) {
        return res.status(500).send({ status: false, message: "Something went wrong", Error: err.message })
    }
}

let getUserProfile = async function (req, res) {
    try {
        let userId = req.params.userId
        userIdFromToken = req.userId
        //validating UserId after accessing it from the params.
        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Inavlid userId." })
        }
        //Finding the User in DB by its Id.
        const findUser = await userModel.findOne({ _id: userId })
        if (!findUser) {
            return res.status(404).send({ status: false, message: `User does not exist for this ${userId}.` })
        }
        //Checking the authorization of the user -> Whether user's Id matches with the user creater's Id or not.
        if (userId != userIdFromToken) {
            return res.status(403).send({
                status: false,
                message: "Unauthorized access, Authentication failed"
            })
        }
        return res.status(200).send({ status: true, message: "User found Successfully.", data: findUser })
    } catch (err) {
        return res.status(500).send({ status: false, message: "Something went wrong", Error: err.message })
    }
}

const updateUserProfile = async function (req, res) {
    try {
        let files = req.files
        let requestBody = req.body
        let userId = req.params.userId
        let userIdFromToken = req.userId

        if (!validator.isValidObjectId(userId)) {
            res.status(400).send({ status: false, message: `${userId} is not a valid User id` })
            return
        }
        if (!validator.isValidObjectId(userIdFromToken)) {
            return res.status(400).send({ status: false, message: `Unauthorized access! User's info doesn't match ` })
        }
        const findUserProfile = await userModel.findOne({ _id: userId })
        if (!findUserProfile) {
            return res.status(400).send({
                status: false,
                message: `User doesn't exists by ${userId}`
            })
        }
        if (findUserProfile._id.toString() != userIdFromToken) {
            res.status(401).send({ status: false, message: `Unauthorized access, Authentication failed! User's info doesn't match` });
            return
        }
        // Extract params
        let { fname, lname, email, phone, password, address } = requestBody;

        //validations for updatation details.
        if (fname || lname || email || profileImage || phone || password || address) {

            if (!validator.validString(fname)) {
                return res.status(400).send({ status: false, message: 'fname is Required' })
            }
            if (!validator.alphabeticString(fname)) {
                return res.status(400).send({ status: false, message: "You can't use special character or number in fname" });
            }
            if (!validator.validString(lname)) {
                return res.status(400).send({ status: false, message: 'lname is Required' })
            }
            if (!validator.alphabeticString(lname)) {
                return res.status(400).send({ status: false, message: "You can't use special character or number in lname" });
            }
            if (email) {
                if (!validator.validString(email)) {
                    return res.status(400).send({ status: false, message: 'email is Required' })
                }
                if (!/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email)) {
                    return res.status(400).send({ status: false, message: `Email should be a valid email address` });
                }
                let isEmailAlredyPresent = await userModel.findOne({ email: email })
                if (isEmailAlredyPresent) {
                    return res.status(400).send({ status: false, message: `Unable to update email. ${email} is already registered.` });
                }
            }
            if (phone) {
                if (!validator.validString(phone)) {
                    return res.status(400).send({ status: false, message: 'phone number is Required' })
                }
                if (!/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/.test(phone)) {
                    return res.status(400).send({ status: false, message: `Please enter a valid Indian phone number.` });
                }
                let isPhoneAlredyPresent = await userModel.findOne({ phone: phone })
                if (isPhoneAlredyPresent) {
                    return res.status(400).send({ status: false, message: `Unable to update phone. ${phone} is already registered.` });
                }
            }
            if (password) {
                if (!validator.validString(password)) {
                    return res.status(400).send({ status: false, message: 'password is missing' })
                }
                if (!(password.length >= 8 && password.length <= 15)) {
                    return res.status(400).send({ status: false, message: "Password should be Valid min 8 character and max 15 " })
                }
                var encryptedPassword = await bcrypt.hash(password, saltRounds)
            }
            //Address validation ->
            if (address) {
                //converting shipping address to string then parsing it.
                let shippingAddressToString = JSON.stringify(address)
                let parsedShippingAddress = JSON.parse(shippingAddressToString)

                if (validator.isValidRequestBody(parsedShippingAddress)) {
                    if (parsedShippingAddress.hasOwnProperty('shipping')) {
                        if (parsedShippingAddress.shipping.hasOwnProperty('street')) {
                            if (!validator.validString(parsedShippingAddress.shipping.street)) {
                                return res.status(400).send({ status: false, message: "shipping address's street is missing" })
                            }
                        }
                        if (parsedShippingAddress.shipping.hasOwnProperty('city')) {
                            if (!validator.validString(parsedShippingAddress.shipping.city)) {
                                return res.status(400).send({ status: false, message: "shipping address's city is missing" })
                            }
                        }
                        if (parsedShippingAddress.shipping.hasOwnProperty('pincode')) {
                            if (!validator.validString(parsedShippingAddress.shipping.pincode)) {
                                return res.status(400).send({ status: false, message: "shipping address's pincode is missing" })
                            }
                            if (!/^[1-9][0-9]{5}$/.test(parsedShippingAddress.shipping.pincode)) {
                                return res.status(400).send({ status: false, message: `${parsedShippingAddress.shipping.pincode} is Invalid Pincode for shipping address` })
                            }
                        }
                        var shippingStreet = address.shipping.street
                        var shippingCity = address.shipping.city
                        var shippingPincode = address.shipping.pincode
                    }
                } else {
                    return res.status(400).send({ status: false, message: " Invalid request parameters. Shipping address cannot be empty" });
                }

                //converting billing address to string them parsing it.
                let billingAddressToString = JSON.stringify(address)
                let parsedBillingAddress = JSON.parse(billingAddressToString)

                if (validator.isValidRequestBody(parsedBillingAddress)) {
                    if (parsedBillingAddress.hasOwnProperty('billing')) {
                        if (parsedBillingAddress.billing.hasOwnProperty('street')) {
                            if (!validator.isValid(parsedBillingAddress.billing.street)) {
                                return res.status(400).send({ status: false, message: "Please provide billing address's Street" });
                            }
                        }
                        if (parsedBillingAddress.billing.hasOwnProperty('city')) {
                            if (!validator.isValid(parsedBillingAddress.billing.city)) {
                                return res.status(400).send({ status: false, message: "Please provide billing address's City" });
                            }
                        }
                        if (parsedBillingAddress.billing.hasOwnProperty('pincode')) {
                            if (!validator.isValid(parsedBillingAddress.billing.pincode)) {
                                return res.status(400).send({ status: false, message: "Please provide billing address's pincode" });
                            }
                            if (!/^[1-9][0-9]{5}$/.test(parsedBillingAddress.billing.pincode)) {
                                return res.status(400).send({ status: false, message: `${parsedBillingAddress.billing.pincode} is Invalid Pincode for billing address` })
                            }
                        }
                        var billingStreet = address.billing.street
                        var billingCity = address.billing.city
                        var billingPincode = address.billing.pincode
                    }
                } else {
                    return res.status(400).send({ status: false, message: " Invalid request parameters. Billing address cannot be empty" });
                }
            }
            if (files) {
                if (validator.isValidRequestBody(files)) {
                    if (!(files && files.length > 0)) {
                        return res.status(400).send({ status: false, message: "profile image is missing" })
                    }
                    var updatedProfileImage = await config.uploadFile(files[0])
                }
            }
        }
        //Validation ends
        var changeProfileDetails = await userModel.findOneAndUpdate({ _id: userId }, {
            $set: {
                fname: fname,
                lname: lname,
                email: email,
                profileImage: updatedProfileImage,
                phone: phone,
                password: encryptedPassword,
                'address.shipping.street': shippingStreet,
                'address.shipping.city': shippingCity,
                'address.shipping.pincode': shippingPincode,
                'address.billing.street': billingStreet,
                'address.billing.city': billingCity,
                'address.billing.pincode': billingPincode
            }
        }, { new: true })
        return res.status(200).send({ status: true, message: "user details update successfully", data: changeProfileDetails })
    } catch (err) {
        return res.status(500).send({ status: false, message: "Something went wrong", error: err.message })
    }
}
module.exports = {
    userCreation,
    loginUser,
    getUserProfile,
    updateUserProfile
}