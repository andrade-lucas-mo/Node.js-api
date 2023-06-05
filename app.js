const express = require('express');
const morgan = require('morgan');
const cors = require('cors')

const users = require('./routes/users')
const citys = require('./routes/citys')

const app = express();

app.use(morgan('dev'));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const corsOptions = {
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 204
}

app.use((req, res, next) => {
    app.use(cors(corsOptions))
    next();
})

app.use('/users', users)
app.use('/citys', citys)

app.use((req, res, next) => {
    const error = new Error('Route Not Found');
    error.status = 404;
    next(error)
})

app.use((error, req, res, next) => {
    res.status(error.status || 500).send({
        message: error.message,
        status: error.status || 500
    });
})

module.exports = app;