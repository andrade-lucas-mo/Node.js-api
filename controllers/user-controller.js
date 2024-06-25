const userModel = require("../models/user-model");

exports.singinUser = async (req, res, next) => {
    try {
        const usersSelect = await userModel.getUserByName(req.body.name);

        if(usersSelect.length > 0){
            return res.status(409).send({message: "user alredy exist"})
        }

        const result = await userModel.createUser(req.body.name, req.body.password);
        const response = {
            message: "success",
            data: {
                user: {
                    id: result.insertId,
                    name: req.body.name
                },
                request: {
                    type: 'POST',
                    desc: 'Create a new User',
                    url: req.protocol + '://' + req.get('host') + req.originalUrl,
                }
            }
        }
        return res.status(201).send(response);
    } catch (error) {
        return res.status(500).send({error: error})
    }
}

exports.loginUser = async (req, res, next) => {
    try {
        const result = await userModel.getUserByName(req.body.name);
        if(result.length < 1) {
            return res.status(401).send({message: "Unauthorized login. Check your name and password"})
        }

        const validate = await userModel.validateHash(req.body.password, result[0].password);
        if(validate){
            const response = {
                message: "Authorized",
                token: validate
            };
            return res.status(200).send(response)
        }
        return res.status(401).send({message: "Unauthorized login. Check your name and password"})
    } catch (error) {
        return res.status(401).send({message: "Unauthorized login. Check your name and password"})
    }

}