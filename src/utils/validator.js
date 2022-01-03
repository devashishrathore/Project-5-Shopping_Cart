const mongoose = require('mongoose')

// Validation checking function

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false //it checks whether the value is null or undefined.
    if (typeof value === 'string' && value.trim().length === 0) return false //it checks whether the string contain only space or not 
    return true;
};
const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}
const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0; // it checks, is there any key is available or not in request body
};
const isvalidNumber = function (value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
}
const isvalidCurrencyId = function (currencyId) {
    return ["INR"].indexOf(currencyId) !== -1
}
const isvalidCurrencyFormat = function (currencyFormat) {
    return ["₹"].indexOf(currencyFormat) !== -1
}
const validRemoveKey = function (removeProduct) {
    return [0, 1].indexOf(removeProduct) !== -1
}
const alphabeticString = function (value) {
    let regex = /^[A-Za-z ]+$/
    if (!(regex.test(value))) {
        return false
    }
    return true
};
const validString = function (value) {
    if (typeof value === 'string' && value.trim().length === 0) return false //it checks whether the string contain only space or not 
    return true;
}
const isvalidOrderStatus = function (status) {
    return ["pending", "completed", "cancled"].indexOf(status) !== -1
}

module.exports = {
    isValid,
    isValidRequestBody,
    alphabeticString,
    isValidObjectId,
    validString,
    validRemoveKey,
    isvalidNumber,
    isvalidCurrencyId,
    isvalidCurrencyFormat,
    isvalidOrderStatus
}