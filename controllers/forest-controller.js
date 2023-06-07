const mysql = require('../mysql');

exports.minimumTree = async (req, res, next) => {
    try {
        const query = 'SELECT citys.* FROM citys;';
        const vertices = await mysql.execute(query);
        const queryEdges = 
            `SELECT
                edge.id_edge,
                edge.from,
                edge.to,
                edge.weight,
                from_city.id_citys as from_city_id,
                to_city.id_citys as to_city_id
            FROM edge
            LEFT JOIN citys from_city
                ON edge.from = from_city.name
            LEFT JOIN citys to_city
                ON edge.to = to_city.name`;
        const edges = await mysql.execute(queryEdges);

        const primTree = vertices.map(vertex => {
            return {
                id_vertex: vertex.id_citys,
                vertex: vertex.name
            }
        });
        
        const vt = [];
        const et = []
        vt.push(primTree.filter((vertex) => {
            return vertex.id_vertex === parseInt(req.params.vertex)
        })[0].id_vertex)

        primTree.filter((vertex) => {
            return vertex.id_vertex === parseInt(req.params.vertex)
        })[0].root = true

        while (vt.length !== primTree.length) {
            var possibleEdges = edges.filter((edge) => {
                return (vt.includes(edge.to_city_id) || vt.includes(edge.from_city_id)) && (!et.includes(edge.id_edge))
            })
            var minEdge = possibleEdges.reduce(function(prev, current) { 
                return prev.weight < current.weight ? prev : current; 
            });
            vt.indexOf(minEdge.from_city_id) > -1 ? vt.push(minEdge.to_city_id) : vt.push(minEdge.from_city_id)
            et.push(minEdge.id_edge)
        }

        const treeEdges = edges.filter((edge) => {
            return et.includes(edge.id_edge)
        })

        const cost = treeEdges.reduce((sum, item) => {
            return sum + (item.weight);
        }, 0);

        const response = {
            message: "success",
            data: {
                cost: cost,
                edges: treeEdges.map(edge => {
                    return {
                        id_edge: edge.id_edge,
                        to: edge.to,
                        from: edge.from,
                        weight: edge.weight
                    }
                }),
                vertices: primTree,
                request: {
                    type: 'GET',
                    desc: 'Minimum tree by Prim method',
                    url: req.protocol + '://' + req.get('host') + req.originalUrl + req.params.vertex,
                }
            }
        }
        
        return res.status(201).send(response);

    } catch (error) {
        return res.status(500).send({error: error})
    }
}
