const mysql = require('../mysql');

exports.createCitys = async (req, res, next) => {
    try {
        const queryDelete = 'DELETE FROM citys;';
        await mysql.execute(queryDelete);

        const citys = req.body.citys.map(city => [
            parseFloat(city.lat),
            parseFloat(city.lng),
            city.city + ' - ' + city.admin_name
        ])

        const queryInsert = 'INSERT INTO citys (citys.lat,citys.long,citys.name) VALUES ?;';
        await mysql.execute(
            queryInsert,
            [citys]
        );
        const response = {
            message: "success",
            data: {
                citys: req.body.citys.map(city => {
                    return {name: city.city + ' - ' + city.admin_name}
                })
            },
            request: {
                type: 'POST',
                desc: 'Create a new City',
                url: req.protocol + '://' + req.get('host') + req.originalUrl,
            }
        }
        return res.status(201).send(response);
    } catch (error) {
        return res.status(500).send({error: error})
    }
}

exports.getCitys = async (req, res, next) => {
    try {
        const query = 'SELECT * FROM citys';
        const result = await mysql.execute(query);
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
                })
            },
            request: {
                type: 'GET',
                desc: 'get all Citys',
                url: req.protocol + '://' + req.get('host') + req.originalUrl,
            }
        }
        return res.status(200).send(response);
    } catch (error) {
        return res.status(500).send({error: error})
    }
}