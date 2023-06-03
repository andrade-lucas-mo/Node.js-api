const express = require('express');
const mysql = require('../mysql');
const app = express.Router();

app.get('/', (req, res, next) => {
    mysql.getConnection((error, connection) => {
        if(error) {return res.status(500).send({error: error})}
        connection.query(
            'SELECT * FROM table WHERE condition = ?;',
            [req.body.condition],
            (error, res, fields) => {
                connection.release();
                if(error) {return res.status(500).send({error: error})}
                if(res.length === 0) {return res.status(404).send({message: 'No data Found'})}
                const response = {
                    message: "success",
                    data: {
                        request: {
                            type: 'GET',
                            desc: 'search for data',
                            url: req.protocol + '://' + req.get('host') + req.originalUrl,
                        }
                    }
                }
                return res.status(200).send(response);
            }
        )
    });
})

app.post('/', (req, res, next) => {
    mysql.getConnection((error, connection) => {
        if(error) {return res.status(500).send({error: error})}
        connection.query(
            'INSERT INTO table (column1, column2) VALUES (?,?);',
            [req.body.value1, req.body.value2],
            (error, res, fields) => {
                connection.release();
                if(error) {return res.status(500).send({error: error})}
                const response = {
                    message: "success",
                    data: {
                        request: {
                            type: 'POST',
                            desc: 'search for data',
                            url: req.protocol + '://' + req.get('host') + req.originalUrl,
                        }
                    }
                }
                return res.status(200).send(response);
            }
        )
    });
})

module.exports = app;