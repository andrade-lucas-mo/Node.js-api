const express = require('express');
const morgan = require('morgan');
const cors = require('cors')
const users = require('./routes/users')
const citys = require('./routes/citys')
const graph = require('./routes/graph')
const search = require('./routes/search')
const forest = require('./routes/forest')
const path = require('./routes/path')
const swaggerUi = require('swagger-ui-express');
const app = express();

const swaggerDocs = require('./swagger.json');

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

app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerDocs))

app.use('/users', users)
app.use('/citys', citys)
app.use('/graph', graph)
app.use('/search', search)
app.use('/forest', forest)
app.use('/path', path)

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