const mysql = require('../mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.singinUser = async (req, res, next) => {
    try {
        const queryUsers = 'SELECT * FROM users WHERE name = ?;';
        const usersSelect = await mysql.execute(
            queryUsers,
            [req.body.name]
        );
        if(usersSelect.length > 0){
            return res.status(409).send({message: "user alredy exist"})
        }

        const hash = await bcrypt.hashSync(req.body.password, 10)

        const queryInsert = 'INSERT INTO users (name,password) VALUES(?,?);';
        const result = await mysql.execute(
            queryInsert,
            [req.body.name, hash]
        );
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
        const query = 'SELECT * FROM users WHERE name = ?;';
        const result = await mysql.execute(
            query,
            [req.body.name]
        );
        if(result.length < 1) {
            return res.status(401).send({message: "Unauthorized login. Check your name and password"})
        }
        if(await bcrypt.compare(req.body.password, result[0].password)){
            const token = jwt.sign(
                {
                    id_users: result[0].id_users,
                    name: result[0].name,
                }, 
                process.env.JWT_KEY,
                {
                    expiresIn: "1h"
                }
            )
            const response = {
                message: "Authorized",
                token: token
            };
            return res.status(200).send(response)
        }
        return res.status(401).send({message: "Unauthorized login. Check your name and password"})
    } catch (error) {
        return res.status(401).send({message: "Unauthorized login. Check your name and password"})
    }

}