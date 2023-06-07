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
                edges: edgeList,
                request: {
                    type: 'POST',
                    desc: 'Create a new graph base on citys',
                    url: req.protocol + '://' + req.get('host') + req.originalUrl + '/create',
                }
            }
        }

        return res.status(201).send(response);
    } catch (error) {
        return res.status(500).send({error: error})
    }
}

exports.getGraph  = async (req, res, next) => {
    try {
        const query = 
            `SELECT
                citys.name AS name,
                CASE
                    WHEN citys.name = edge.from
                        THEN edge.to
                    ELSE edge.from
                END AS edge,
                edge.weight AS weight
            FROM citys
            INNER JOIN edge
                ON edge.from = citys.name OR edge.to = citys.name
            ORDER BY citys.name;`;
        const edges = await mysql.execute(query);

        var graph = []

        edges.forEach(edge => {
            if(graph.findIndex(val => val.node === edge.name) < 0){
                var edg = edges.map(edg => {
                    if(edg.name === edge.name){
                        return {
                            to: edg.edge,
                            weight: edg.weight
                        }
                    }
                })
                edg = edg.filter(function (i) {return i;});
                graph.push({
                    node: edge.name,
                    edges: edg
                })
            }
        });
        const response = {
            message: "success",
            data: {
                graph: graph,
                request: {
                    type: 'GET',
                    desc: 'get the complete graph',
                    url: req.protocol + '://' + req.get('host') + req.originalUrl,
                }
            }
        }

        return res.status(201).send(response);
    } catch (error) {
        return res.status(500).send({error: error})
    }
}