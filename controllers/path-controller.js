const cityModel = require("../models/city-model");
const edgeModel = require("../models/edge-model");

exports.shortestPath = async (req, res, next) => {
    try {

        const nodes = cityModel.getAll();
        const edges = await edgeModel.getAll();

        const dijkstra = nodes.map(node => {
            return {
                id_node: node.id_citys,
                node: node.name,
                dist: null,
                pred: null
            }
        });

        const exploredNodes = [];
        const exploredEdges = [];
        exploredNodes.push(req.body.initNode);
        dijkstra.filter((dij) => {
            return dij.id_node === req.body.initNode
        })[0].dist = 0;

        for (let index = 0; index < (dijkstra.length - 1); index++) {
            var possibleEdges = edges.filter((edge) => {
                return (
                    (exploredNodes.includes(edge.to_city_id) || exploredNodes.includes(edge.from_city_id)) 
                    & !(exploredNodes.includes(edge.to_city_id) && exploredNodes.includes(edge.from_city_id))
                    && (!exploredEdges.includes(edge.id_edge))
                )
            })
            var minEdge = possibleEdges.reduce(function(prev, current) { 
                return prev.weight < current.weight ? prev : current; 
            });

            var toNode = fromNode = null;

            if(exploredNodes.includes(minEdge.from_city_id)){
                fromNode = minEdge.from_city_id
                toNode = minEdge.to_city_id
            }else{
                fromNode = minEdge.to_city_id
                toNode = minEdge.from_city_id
            }

            const dijToNode = dijkstra.filter((dij) => {
                return dij.id_node === toNode
            })[0];

            const dijFromNode = dijkstra.filter((dij) => {
                return dij.id_node === fromNode
            })[0];

            dijToNode.dist = minEdge.weight + dijFromNode.dist
            dijToNode.pred = dijFromNode.node
            exploredNodes.push(toNode);
            exploredEdges.push(minEdge.id_edge)
        }

        var node = dijkstra.filter((dij) => {
            return dij.id_node === req.body.endNode
        })[0];
        const distance = node.dist

        var shortestPath = [node.node];
        var pred = node.pred;

        while (pred !== null) {
            shortestPath.push(node.pred);
            node = dijkstra.filter((dij) => {
                return dij.node === pred
            })[0];
            pred=node.pred
        }

        const response = {
            message: "success",
            data: {
                distance: distance,
                path: shortestPath.reverse().toString(),
                dijkstra: dijkstra
            },
            request: {
                type: 'POST',
                desc: 'Shortest Path using Dijkstra method',
                url: req.protocol + '://' + req.get('host') + req.originalUrl,
            }
        }
        
        return res.status(200).send(response);

    } catch (error) {
        return res.status(500).send({error: error})
    }
}