const cityModel = require("../models/city-model");
const edgeModel = require("../models/edge-model");


exports.minimumTree = async (req, res, next) => {
    try {
        const nodes = await cityModel.getAll();
        const edges = await edgeModel.getAll();

        const primTree = nodes.map(node => {
            return {
                id_node: node.id_citys,
                node: node.name
            }
        });
        
        const nodesTree = [];
        const edgesTree = []
        nodesTree.push(primTree.filter((node) => {
            return node.id_node === parseInt(req.params.node)
        })[0].id_node)

        primTree.filter((node) => {
            return node.id_node === parseInt(req.params.node)
        })[0].root = true

        while (nodesTree.length !== primTree.length) {
            var possibleEdges = edges.filter((edge) => {
                return (
                    (nodesTree.includes(edge.to_city_id) || nodesTree.includes(edge.from_city_id))
                    && !(nodesTree.includes(edge.to_city_id) && nodesTree.includes(edge.from_city_id))
                    && (!edgesTree.includes(edge.id_edge))
                )
            })
            if(possibleEdges.length === 0){
                break;
            }
            var minEdge = possibleEdges.reduce(function(prev, current) { 
                return prev.weight < current.weight ? prev : current; 
            });
            nodesTree.indexOf(minEdge.from_city_id) > -1 ? nodesTree.push(minEdge.to_city_id) : nodesTree.push(minEdge.from_city_id)
            edgesTree.push(minEdge.id_edge)
        }

        const treeEdges = edges.filter((edge) => {
            return edgesTree.includes(edge.id_edge)
        })

        const cost = treeEdges.reduce((sum, item) => {
            return sum + (item.weight);
        }, 0);

        const primTreeNodes = primTree.filter((node) => {
            return nodesTree.includes(node.id_node)
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
                nodes: primTreeNodes
            },
            request: {
                type: 'GET',
                desc: 'Minimum tree by Prim method',
                url: req.protocol + '://' + req.get('host') + req.originalUrl + req.params.node
            }
        }
        
        return res.status(200).send(response);

    } catch (error) {
        return res.status(500).send({error: error})
    }
}
