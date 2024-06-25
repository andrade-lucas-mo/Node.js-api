const bcrypt = require('bcrypt');
const mysql = require('../mysql');
const jwt = require('jsonwebtoken');

exports.getUserByName = async (name) => {
    const query = 'SELECT * FROM users WHERE name = ?;';
    return await mysql.execute(
        query,
        [name]
    );
}

exports.createUser = async (name, password) => {
    const hash = await bcrypt.hashSync(password, 10)
    const query = 'INSERT INTO users (name,password) VALUES(?,?);';
    return await mysql.execute(
        query,
        [name, hash]
    );
}

exports.validateHash = async (name, password) => {
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
        );
        return token;
    }
    return false;
}
