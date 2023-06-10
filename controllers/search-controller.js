const mysql = require('../mysql');

exports.searchDepth = async (req, res, next) => {
    try {
        time = 0
        const query = 'SELECT citys.* FROM citys;';
        const nodes = await mysql.execute(query);
        const edges = await getEdgesData();
        root = 0;
        forest = edges.graph;
        var depth = nodes.map(node => {
            return {
                id_node: node.id_citys,
                node: node.name,
                father: null,
                td: 0,
                tt: 0
            }
        });
        while (depth.some(node => node.td === 0)) {
            newDepth = depthSearch(depth, edges, depth[depth.findIndex(node => node.td === 0)])
            newDepth.forEach(element => {
                var index = depth.findIndex(node => node.id_node === element.id_node)
                depth[index].father = element.father
                depth[index].td = element.td
                depth[index].tt = element.tt
            });
        }
        
        const response = {
            message: "success",
            data: {
                depth: depth,
                forest: forest
            },
            request: {
                type: 'GET',
                desc: 'Get a complete search on depth based on citys',
                url: req.protocol + '://' + req.get('host') + req.originalUrl ,
            }
        }

        return res.status(200).send(response);
    } catch (error) {
        return res.status(500).send({error: error})
    }
}

exports.searchBreadthFirst = async (req, res, next) => {
    try {
        let t = 0;
        let line = [];
        const query = 'SELECT citys.* FROM citys;';
        const nodes = await mysql.execute(query);
        const edges = await getEdgesData();
        root = 0;
        forest = edges.graph;

        var breadthFirst = nodes.map(node => {
            return {
                id_node: node.id_citys,
                node: node.name,
                father: null,
                td: 0,
                tt: 0
            }
        });
        while (breadthFirst.some(node => node.td === 0)) {
            var node = breadthFirst[breadthFirst.findIndex(node => node.td === 0)]
            t++;
            node.td = t;
            line.push(node)
            while (line.length !== 0) {
                node = breadthFirst[breadthFirst.findIndex(node => node.node === line[0].node)]
                line.shift()
                var siblings = edges.graph.filter(function(edgeData){
                    return (edgeData.id_node === node.id_node);
                })[0].edges;
                siblings.forEach(sibling => {
                    var index = breadthFirst.findIndex(nodeSibling => nodeSibling.node === sibling.to)
                    if(breadthFirst[index].td === 0){
                        visitaAresta(node, breadthFirst[index], 'arvore')
                        breadthFirst[index].father = node.node
                        t++;
                        breadthFirst[index].td = t
                        line.push(breadthFirst[index])
                    }else if(breadthFirst[index].tt === 0 && breadthFirst[index].node !== node.father){
                        visitaAresta(node, breadthFirst[index], 'retorno')
                    }
                });
                t++;
                node.tt = t;
            }
        }

        const response = {
            message: "success",
            data: {
                breadthFirst: breadthFirst,
                forest: forest
            },
            request: {
                type: 'GET',
                desc: 'Get a complete search on breadth first based on citys',
                url: req.protocol + '://' + req.get('host') + req.originalUrl,
            }
        }

        return res.status(200).send(response);
    } catch (error) {
        return res.status(500).send({error: error})
    }
}

var time = 0;
let forest = []
let root = 0;

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

function depthSearch(nodes, edges, v)
{
    time++;
    v = nodes[nodes.findIndex(node => node.id_node === v.id_node)];
    v.td = time
    var edgesV = edges.graph[edges.graph.findIndex(edge => edge.id_node === v.id_node)].edges
    edgesV.forEach(edgeV => {
        let w = nodes[nodes.findIndex(node => node.node === edgeV.to)];
        if(w.td === 0){
            visitaAresta(v, w, 'arvore')
            w.father = v.node
            let newDepth = depthSearch(nodes, edges, w)
            newDepth.forEach(element => {
                var index = nodes.findIndex(node => node.id_node === element.id_node)
                nodes[index].father = element.father
                nodes[index].td = element.td
                nodes[index].tt = element.tt
            });
            
        }else if(w.tt === 0 && w.node !== v.father){
            visitaAresta(v, w, 'retorno')
        }
    });
    time++;
    v.tt = time;
    return nodes
}

function visitaAresta(v,w,type)
{
    var tree = forest[forest.findIndex(edge => edge.node === v.node)];
    tree.edges[tree.edges.findIndex(edge => edge.to === w.node)].type = type;
    tree.degree = tree.edges.filter((edge)=>{
        return edge.type == 'arvore'
    }).length
    if(root === 0){
        tree.root = true;
        root = 1;
    }
    tree = forest[forest.findIndex(edge => edge.node === w.node)];
    tree.edges[tree.edges.findIndex(edge => edge.to === v.node)].type = type;
    tree.degree = tree.edges.filter((edge)=>{
        return edge.type == 'arvore'
    }).length
}