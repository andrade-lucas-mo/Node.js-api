const mysql = require('../mysql');

var time = 0;

let forest = []
let root = 0;

function visitaAresta(v,w,type)
{
    var tree = forest[forest.findIndex(edge => edge.node === v.vertex)];
    tree.edges[tree.edges.findIndex(edge => edge.to === w.vertex)].type = type;
    tree.degree = tree.edges.filter((edge)=>{
        return edge.type == 'arvore'
    }).length
    if(root === 0){
        tree.root = true;
        root = 1;
    }
    tree = forest[forest.findIndex(edge => edge.node === w.vertex)];
    tree.edges[tree.edges.findIndex(edge => edge.to === v.vertex)].type = type;
    tree.degree = tree.edges.filter((edge)=>{
        return edge.type == 'arvore'
    }).length
}

exports.searchDepth = async (req, res, next) => {
    try {
        time = 0
        const query = 'SELECT citys.* FROM citys;';
        const vertices = await mysql.execute(query);
        const edges = await getEdgesData();
        root = 0;
        forest = edges.graph;
        var depth = vertices.map(vertex => {
            return {
                id_vertex: vertex.id_citys,
                vertex: vertex.name,
                father: null,
                td: 0,
                tt: 0
            }
        });
        while (depth.some(vertex => vertex.td === 0)) {
            newDepth = depthSearch(depth, edges, depth[depth.findIndex(vertex => vertex.td === 0)])
            newDepth.forEach(element => {
                var index = depth.findIndex(vertex => vertex.id_vertex === element.id_vertex)
                depth[index].father = element.father
                depth[index].td = element.td
                depth[index].tt = element.tt
            });
        }
        
        return res.status(201).send({depth, forest});
    } catch (error) {
        return res.status(500).send({error: error})
    }
}

function depthSearch(vertices, edges, v)
{
    time++;
    v = vertices[vertices.findIndex(vertex => vertex.id_vertex === v.id_vertex)];
    v.td = time
    var edgesV = edges.graph[edges.graph.findIndex(edge => edge.id_node === v.id_vertex)].edges
    edgesV.forEach(edgeV => {
        let w = vertices[vertices.findIndex(vertex => vertex.vertex === edgeV.to)];
        if(w.td === 0){
            visitaAresta(v, w, 'arvore')
            w.father = v.vertex
            let newDepth = depthSearch(vertices, edges, w)
            newDepth.forEach(element => {
                var index = vertices.findIndex(vertex => vertex.id_vertex === element.id_vertex)
                vertices[index].father = element.father
                vertices[index].td = element.td
                vertices[index].tt = element.tt
            });
            
        }else if(w.tt === 0 && w.vertex !== v.father){
            visitaAresta(v, w, 'retorno')
        }
    });
    time++;
    v.tt = time;
    return vertices
}

exports.searchBreadthFirst = async (req, res, next) => {
    try {
        let t = 0;
        let line = [];
        const query = 'SELECT citys.* FROM citys;';
        const vertices = await mysql.execute(query);
        const edges = await getEdgesData();
        root = 0;
        forest = edges.graph;

        var breadthFirst = vertices.map(vertex => {
            return {
                id_vertex: vertex.id_citys,
                vertex: vertex.name,
                father: null,
                td: 0,
                tt: 0
            }
        });
        while (breadthFirst.some(vertex => vertex.td === 0)) {
            var vertex = breadthFirst[breadthFirst.findIndex(vertex => vertex.td === 0)]
            t++;
            vertex.td = t;
            line.push(vertex)
            while (line.length !== 0) {
                vertex = breadthFirst[breadthFirst.findIndex(vertex => vertex.vertex === line[0].vertex)]
                line.shift()
                var siblings = edges.graph.filter(function(edgeData){
                    return (edgeData.id_node === vertex.id_vertex);
                })[0].edges;
                siblings.forEach(sibling => {
                    var index = breadthFirst.findIndex(vertexSibling => vertexSibling.vertex === sibling.to)
                    if(breadthFirst[index].td === 0){
                        visitaAresta(vertex, breadthFirst[index], 'arvore')
                        breadthFirst[index].father = vertex.vertex
                        t++;
                        breadthFirst[index].td = t
                        line.push(breadthFirst[index])
                    }else if(breadthFirst[index].tt === 0 && breadthFirst[index].vertex !== vertex.father){
                        visitaAresta(vertex, breadthFirst[index], 'retorno')
                    }
                });
                t++;
                vertex.tt = t;
            }
        }
        
        return res.status(201).send({breadthFirst, forest});
    } catch (error) {
        return res.status(500).send({error: error})
    }
}

async function getEdgesData(){
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