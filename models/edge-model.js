const mysql = require('../mysql');

exports.getGraph = async () => {
    try {
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
            ORDER BY citys.name;`;
        const edges = await mysql.execute(query);

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
        return {graph: graph}
    } catch (error) {
        return error
    }
}

exports.getAll = async () => {
    const query = 
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
    return await mysql.execute(
        query
    );
}

exports.deleteAll = async () => {
    const query = 'DELETE FROM edge;';
    return await mysql.execute(
        query
    );
}

exports.createByList = async (edgeList) => {
    const query = 'INSERT INTO edge (edge.from,edge.to,edge.weight) VALUES ?;';
    return await mysql.execute(
        query,
        [edgeList]
    );
}