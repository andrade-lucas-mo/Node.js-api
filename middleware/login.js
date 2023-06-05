const jwt = require('jsonwebtoken');

exports.requiredToken = (req, res, next) => {
    try {
        if(req.headers.authorization.split(' ')[0] === 'Bearer') {
            const token = req.headers.authorization.split(" ")[1];
            const decode = jwt.verify(token, process.env.JWT_KEY)
            req.user = decode;
            next();
        }else{
            return res.status(401).send({message: "Unauthorized token"})
        }
    } catch (error) {
        return res.status(401).send({message: "Unauthorized token"})
    }
}