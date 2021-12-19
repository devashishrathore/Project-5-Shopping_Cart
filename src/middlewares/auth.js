const jwt = require("jsonwebtoken")

const userAuth = function(req, res, next) {
    try {
        const token = req.header('x-api-key')
            // console.log("token", token)
        if (!token) {
            return res.status(403).send({ status: false, message: `Missing authentication token in request` })
        }
        try {
            const decoded = jwt.verify(token, 'group7');
            if (Date.now() > (decoded.exp) * 1000) {
                return res.status(403).send({ status: false, message: "Session expired! Please login again." })
            }
            req.userId = decoded.userId;
            next()
        } catch (err) {
            return res.status(403).send({ status: false, message: `Invalid authentication token in headers .` })
        }

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

module.exports = {
    userAuth
}