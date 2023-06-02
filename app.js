const express = required('express');
const app = express();

app.use((req, res, next) => {
    res.status(200).send({
        status: 200,
        mensage: 'status 200 de teste da primeira request'
    })
})