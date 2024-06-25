const mysql = require('../mysql');

exports.getAll = async () => {
    const query = 'SELECT citys.* FROM citys;';
    return await mysql.execute(
        query
    );
}

exports.getWithEdges = async () => {
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
    return await mysql.execute(
        query
    );
}

exports.getWithEdgesById = async (id) => {
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
        WHERE citys.id_citys = ?
        ORDER BY citys.name;`;
    return await mysql.execute(
        query,
        [id]
    );
}

exports.getByIdList = async (id) => {
    const query =
        `SELECT *
            FROM citys
            WHERE id_citys IN (?)`;
    return await mysql.execute(
        query,
        [id]
    );
}

exports.getCompleteGraph = async () => {
    const query =
        `SELECT *
        FROM (
            SELECT
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
                ON (edge.from = citys.name OR edge.to = citys.name)
            ORDER BY citys.name
        ) graph;`
    return await mysql.execute(
        query
    );
}

exports.getCompleteGraphWithoutEdgesList = async (edgesList) => {
    const query =
        `SELECT *
        FROM (
            SELECT
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
                ON (edge.from = citys.name OR edge.to = citys.name)
                    AND edge.id_edge NOT IN (?)
            ORDER BY citys.name
        ) graph;`
    return await mysql.execute(
        query,
        edgesList
    );
}

exports.getCompleteGraphWithoutCitysList = async (citysList) => {
    const query =
        `SELECT *
        FROM (
            SELECT
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
                ON (edge.from = citys.name OR edge.to = citys.name)
            ORDER BY citys.name
        ) graph
        WHERE graph.name NOT IN (?)
            AND graph.edge NOT IN (?);`
    return await mysql.execute(
        query,
        citysList
    );
}

exports.getCompleteGraphWithoutEdgesAndCitysList = async (params) => {
    const query =
        `SELECT *
        FROM (
            SELECT
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
                ON (edge.from = citys.name OR edge.to = citys.name)
                    AND edge.id_edge NOT IN (?)
            ORDER BY citys.name
        ) graph
        WHERE graph.name NOT IN (?)
            AND graph.edge NOT IN (?);`
    return await mysql.execute(
        query,
        params
    );
}

exports.deleteAll = async () => {
    const query = 'DELETE FROM citys;';
    return await mysql.execute(
        query
    );
}

exports.createByList = async (citysList) => {
    const query = 'INSERT INTO citys (citys.lat,citys.long,citys.name) VALUES ?;';
    return await mysql.execute(
        query,
        [citysList]
    );
}