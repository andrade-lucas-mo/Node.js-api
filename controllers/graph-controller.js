const mysql = require('../mysql');

exports.createGraph = async (req, res, next) => {
    try {
        const query = 'SELECT * FROM citys;';
        const citys = await mysql.execute(query);
        var dist = 0;
        var edgeList = [];

        citys.forEach(principalNode => {
            var weight = [];
            var edges = []
            citys.forEach(testNode => {
                dist = Math.sqrt(((principalNode.lat - testNode.lat)**2) + ((principalNode.long - testNode.long)**2))
                if(testNode.name !== principalNode.name){
                    var maxWeight = Math.max(...weight);
                    if(dist < maxWeight || weight.length < 4){
                        weight.push(dist)
                        edges.push({
                            to: testNode.name,
                            weight: dist
                        })
                        if(weight.length > 4){
                            var index = weight.indexOf(maxWeight);
                            weight.splice(index, 1);
                            edges.splice(index, 1);
                        }
                    }
                }
            });

            edges.forEach(edge => {

                var hasedge = edgeList.filter(function(edgeData){
                    return (edgeData[0] === principalNode.name && edgeData[1] === edge.to);
                });
                if(hasedge.length === 0){
                    edgeList.push([
                        edge.to,
                        principalNode.name,
                        edge.weight
                    ])
                }
            });

        });

        const queryDelete = 'DELETE FROM edge;';
        await mysql.execute(queryDelete);

        const queryInsert = 'INSERT INTO edge (edge.from,edge.to,edge.weight) VALUES ?;';
        await mysql.execute(
            queryInsert,
            [edgeList]
        );
        const response = {
            message: "success",
            data: {
                edges: edgeList.map( (edge) => {
                    return {
                        fromNode: edge[0],
                        toNode: edge[1],
                        weight: edge[2]
                    }
                }),
                nodes: citys.map((city) => {
                    return {
                        id_node: city.id_citys,
                        name: city.name
                    }
                }),
            },
            request: {
                type: 'POST',
                desc: 'Create a new graph base on citys',
                url: req.protocol + '://' + req.get('host') + req.originalUrl + '/create',
            }
        }

        return res.status(201).send(response);
    } catch (error) {
        return res.status(500).send({error: error})
    }
}

exports.getNodeData  = async (req, res, next) => {
    try {
        var where = '';
        if(req.params.node){
            where = 'WHERE citys.id_citys = ?'
        }
        const query = 
            `SELECT
                citys.id_citys,
                citys.name,
                CASE
                    WHEN citys.name = edge.from
                        THEN edge.to
                    ELSE edge.from
                END AS edge,
                edge.id_edge,
                edge.weight
            FROM citys
            INNER JOIN edge
                ON edge.from = citys.name OR edge.to = citys.name
            ${where}
            ORDER BY citys.name;`;
        const edges = await mysql.execute(query, [req.params.node]);

        var graph = []

        edges.forEach(edge => {
            if(graph.findIndex(val => val.node === edge.name) < 0){
                var edg = edges.map(edg => {
                    if(edg.name === edge.name){
                        return {
                            id_edge: edg.id_edge,
                            to: edg.edge,
                            weight: edg.weight
                        }
                    }
                })
                edg = edg.filter(function (i) {return i;});
                graph.push({
                    id_node: edge.id_citys,
                    node: edge.name,
                    degree: edg.length,
                    edges: edg
                })
            }
        });
        const response = {
            message: "success",
            data: {
                graph: graph
            },
            request: {
                type: 'GET',
                desc: 'get the complete graph or a specific node data',
                url: req.protocol + '://' + req.get('host') + req.originalUrl,
            }
        }

        return res.status(200).send(response);
    } catch (error) {
        return res.status(500).send({error: error})
    }
}

exports.getSubGraph  = async (req, res, next) => {
    try {
        const params = []
        let where = 'WHERE 1 = 1';
        let left = ''
        if(req.body.node && req.body.node.length !== 0){
            const querycitys = 
            `SELECT *
            FROM citys
            WHERE id_citys IN (?)`;
            const citys = await mysql.execute(querycitys, [req.body.node]);
            const name_citys = citys.map(city => {
                return city.name
            })
            if(name_citys.length !== 0){
                params.push(name_citys)
                params.push(name_citys)
                where += `
                    AND graph.name NOT IN (?)
                    AND graph.edge NOT IN (?)
                `
            }
        }

        if(req.body.edges && req.body.edges.length !== 0){
            params.push(req.body.edges)
            left = `
                AND edge.id_edge NOT IN (?)
            `
        }

        const query = 
            `SELECT * FROM
            (SELECT
                citys.id_citys,
                citys.name,
                CASE
                    WHEN citys.name = edge.from
                        THEN edge.to
                    ELSE edge.from
                END AS edge,
                edge.id_edge,
                edge.weight
            FROM citys
            LEFT JOIN edge
                ON (edge.from = citys.name OR edge.to = citys.name) ${left}
            ORDER BY citys.name) graph
            ${where};`;
        const edges = await mysql.execute(query, params);

        var graph = []

        edges.forEach(edge => {
            if(graph.findIndex(val => val.node === edge.name) < 0){
                var edg = null;
                if(edge.edge !== null){
                    edg = edges.map(edg => {
                        if(edg.name === edge.name){
                            return {
                                id_edge: edg.id_edge,
                                to: edg.edge,
                                weight: edg.weight
                            }
                        }
                    })
                    edg = edg.filter(function (i) {return i;});
                }
                graph.push({
                    id_node: edge.id_citys,
                    node: edge.name,
                    degree: edg ? edg.length : 0,
                    edges: edg
                })
            }
        });
        const response = {
            message: "success",
            data: {
                graph: graph
            },
            request: {
                type: 'POST',
                desc: 'get the subgraph without the nodes and edges in the body',
                url: req.protocol + '://' + req.get('host') + req.originalUrl,
            }
        }

        return res.status(200).send(response);
    } catch (error) {
        return res.status(500).send({error: error})
    }
}