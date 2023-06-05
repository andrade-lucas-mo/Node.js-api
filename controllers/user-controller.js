const mysql = require('../mysql').pool;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.singinUser = (req, res, next) => {
    mysql.getConnection((error, connection) => {
        if(error) {return res.status(500).send({error: error})}
        connection.query(
            'SELECT * FROM users WHERE name = ?', [req.body.name], (error, result, field) => {
                if(error) {return res.status(500).send({error: error})}
                if(result.length > 0) {return res.status(401).send({message: "user alredy exist"})}
                bcrypt.hash(req.body.password, 10, (errorBcrypt, hash) => {
                    if(errorBcrypt) {return res.status(500).send({error: errorBcrypt})}
                    connection.query(
                        'INSERT INTO users (name,password) VALUES(?,?);',
                        [req.body.name, hash],
                        (error, result, field) => {
                            connection.release();
                            if(error) {return res.status(500).send({error: error})}
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
                        }
                    )
                })

            }
        )
    });
}

exports.loginUser = (req, res, next) => {
    mysql.getConnection((error, connection) => {
        if(error) {return res.status(500).send({error: error})}
        connection.query(
            "SELECT * FROM users WHERE name = ?",
            [req.body.name],
            (error, result, fields) => {
                connection.release();
                if(error) {return res.status(500).send({error: error})}
                if(result.length < 1) {
                    return res.status(401).send({message: "Unauthorized login. Check your name and password"})
                }
                bcrypt.compare(
                    req.body.password,
                    result[0].password,
                    (errorBcrypt, resultBcrypt) => {
                        if(errorBcrypt) {
                            return res.status(401).send({message: "Unauthorized login. Check your name and password"})
                        }
                        if(resultBcrypt) {
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
                    }
                )
            }
        )
    })
}