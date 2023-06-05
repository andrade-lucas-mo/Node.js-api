const mysql = require('../mysql').pool;

exports.createCitys = (req, res, next) => {
    mysql.getConnection((error, connection) => {
        if(error) {return res.status(500).send({error: error})}
        connection.query(
            'SELECT * FROM citys WHERE citys.name = ?', [req.body.city], (error, result, field) => {
                if(error) {return res.status(500).send({error: error})}
                if(result.length > 0) {return res.status(401).send({message: "city alredy exist"})}
                connection.query(
                    'INSERT INTO citys (citys.lat,citys.long,citys.name) VALUES(?,?,?);',
                    [parseFloat(req.body.lat), parseFloat(req.body.lng), req.body.city],
                    (error, result, field) => {
                        connection.release();
                        if(error) {return res.status(500).send({error: error})}
                        const response = {
                            message: "success",
                            data: {
                                user: {
                                    id: result.insertId,
                                    name: result.name
                                },
                                request: {
                                    type: 'POST',
                                    desc: 'Create a new City',
                                    url: req.protocol + '://' + req.get('host') + req.originalUrl,
                                }
                            }
                        }
                        return res.status(201).send(response);
                    }
                )
            }
        )

    });
}

exports.getCitys = (req, res, next) => {
    mysql.getConnection((error, connection) => {
        if(error) {return res.status(500).send({error: error})}
        connection.query(
            'SELECT * FROM citys',
            (error, result, field) => {
                if(error) {return res.status(500).send({error: error})}
                const response = {
                    message: "success",
                    data: {
                        qtd: result.length,
                        citys: result.map(city => {
                            return {
                                id_city: city.id_citys,
                                city: city.name,
                                lng: city.long,
                                lat: city.lat,
                            }
                        }),
                        request: {
                            type: 'GET',
                            desc: 'get all Citys',
                            url: req.protocol + '://' + req.get('host') + req.originalUrl,
                        }
                    }
                }
                return res.status(200).send(response);
            }
        )

    });
}