const cityModel = require("../models/city-model");
const edgeModel = require("../models/edge-model");

exports.createGraph = async (req, res, next) => {
    try {
        const citys = cityModel.getAll();
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

        edgeModel.deleteAll();
        edgeModel.createByList(edgeList);

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
                desc: 'Created a new graph base on citys',
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
        var edges;
        if(req.params.node){
            edges = cityModel.getWithEdgesById(req.params.node);
        }else{
            edges = cityModel.getWithEdges();
        }

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
        const select = {
            edge: req.body.edges && req.body.edges.length !== 0,
            city: false
        };

        if(select.edge){
            select.push(req.body.edges)
        }
        
        if(req.body.node && req.body.node.length !== 0){
            const citys = await cityModel.getByIdList(req.body.node)
            const name_citys = citys.map(city => {
                return city.name
            })
            if(name_citys.length !== 0){
                params.push(name_citys)
                params.push(name_citys)
                select.city = true;
            }
        }
        
        const graphFunction = getGraphFunction(select);
        const edges = await graphFunction(params);

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

function getGraphFunction(select) {
    const key = `${select.city ? 'C' : 'N'}${select.edge ? 'E' : 'N'}`;
    const functions = {
        'CE': async (params) => await cityModel.getCompleteGraphWithoutEdgesAndCitysList(params),
        'CN': async (params) => await cityModel.getCompleteGraphWithoutCitysList(params),
        'NE': async (params) => await cityModel.getCompleteGraphWithoutEdgesList(params),
        'NN': async (params) => await cityModel.getCompleteGraph()
    };
    return functions[key];
}