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

const isValidSize = function (availableSizes) {
    return ["S, XS, M, X, L, XXL, XL"].indexOf(availableSizes) !== -1
}
const isvalidNumber = function (value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
}
const isvalidCurrencyId = function (currencyId) {
    return ["INR"].indexOf(currencyId) !== -1
}
const isvalidCurrencyFormat = function (currencyFormat) {
    return ["₹"].indexOf(currencyFormat) !== -1
}
//   const isvalidCurrencyFormat = function(currencyFormat){
//   let test = currencyFormat:{style = "font-weight:bold;", currencyFormat:"&#8377"} //Item Price<span style="font-weight:bold;">{{price | currency:"&#8377;"}}</span>
//   }
const alphabeticString = function (value) {
    let regex = /^[A-Za-z ]+$/
    if (!(regex.test(value))) {
        return false
    }
    return true
};
const validfiles = function (value) {
    if (typeof value === 'file' && value.trim().length === 0) return false //it checks whether the string contain only space or not 
    return true;
}
const validString = function (value) {
    if (typeof value === 'string' && value.trim().length === 0) return false //it checks whether the string contain only space or not 
    return true;
}
const validNumber = function (installments) {
    if (typeof installments === 'undefined' || installments === null) return false //it checks whether the string contain only space or not 
    if (typeof installments === 'number' && value.trim().length === 0) return false 
    if (Object.keys(installments).length === 0) return false
    return true;
}
const validAddress = function (address) {
    if (typeof address === 'undefined' || address === null) return false //it checks whether the value is null or undefined.
    if (Object.keys(address).length === 0) return false
    return true;
}
const validRating = function isInteger(value) {
    return value % 1 == 0;
}

const validatingInvalidObjectId = function (objectId) {
    if (objectId.length == 24) return true //verifying the length of objectId -> it must be of 24 hex characters.
    return false
}

const verifyReviewerName = function (value) {
    if (typeof value === 'number') return false
    return true
}

module.exports = {
    isValid,
    isValidSize,
    validNumber,
    isValidRequestBody,
    alphabeticString,
    isValidObjectId,
    validString,
    isvalidNumber,
    isvalidCurrencyId,
    isvalidCurrencyFormat,
    validfiles,
    validAddress,
    validRating,
    validatingInvalidObjectId,
    verifyReviewerName
}