class Graph {
    constructor() {
        this.adjacencyList = new Map();
    }

    addEdge(src, dest, weight) {
        if (weight < 0) throw new Error("Negative weights are not allowed");
        
        if (!this.adjacencyList.has(src)) {
            this.adjacencyList.set(src, []);
        }
        if (!this.adjacencyList.has(dest)) {
            this.adjacencyList.set(dest, []);
        }
        this.adjacencyList.get(src).push({ node: dest, weight });
    }

    dijkstra(start, end) {
        const distances = new Map();
        const previous = new Map();
        const pq = [];
        const visited = new Set();

        for (let node of this.adjacencyList.keys()) {
            distances.set(node, Infinity);
            previous.set(node, null);
        }
        distances.set(start, 0);
        pq.push({ node: start, dist: 0 });

        while (pq.length > 0) {
            pq.sort((a, b) => a.dist - b.dist);
            const { node: current } = pq.shift();

            if (visited.has(current)) continue;
            visited.add(current);

            if (current === end) break;

            const neighbors = this.adjacencyList.get(current) || [];
            for (let neighbor of neighbors) {
                if (visited.has(neighbor.node)) continue;
                
                const newDist = distances.get(current) + neighbor.weight;
                if (newDist < distances.get(neighbor.node)) {
                    distances.set(neighbor.node, newDist);
                    previous.set(neighbor.node, current);
                    pq.push({ node: neighbor.node, dist: newDist });
                }
            }
        }

        if (distances.get(end) === Infinity) {
            return { path: null, distance: null };
        }

        const path = [];
        let current = end;
        while (current !== null) {
            path.unshift(current);
            current = previous.get(current);
        }

        return { path, distance: distances.get(end) };
    }
}

function parseGraph(input) {
    const graph = new Graph();
    const edges = input.split(';').map(edge => edge.trim());
    
    for (let edge of edges) {
        if (!edge) continue;
        const [nodes, weight] = edge.split(',');
        const [src, dest] = nodes.split('-');
        graph.addEdge(src.trim(), dest.trim(), parseInt(weight));
    }
    return graph;
}

function drawGraph(graph, path) {
    const canvas = document.getElementById('graphCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const nodes = Array.from(graph.adjacencyList.keys());
    const positions = {};
    const radius = 20;
    const angleStep = (2 * Math.PI) / nodes.length;

    // Position nodes in a circle
    nodes.forEach((node, i) => {
        const x = canvas.width/2 + 150 * Math.cos(angleStep * i);
        const y = canvas.height/2 + 150 * Math.sin(angleStep * i);
        positions[node] = { x, y };
    });

    // Draw edges
    graph.adjacencyList.forEach((neighbors, src) => {
        neighbors.forEach(({ node: dest, weight }) => {
            const isPathEdge = path && path.includes(src) && path.includes(dest) && 
                Math.abs(path.indexOf(src) - path.indexOf(dest)) === 1;
            
            ctx.beginPath();
            ctx.moveTo(positions[src].x, positions[src].y);
            ctx.lineTo(positions[dest].x, positions[dest].y);
            ctx.strokeStyle = isPathEdge ? '#1a73e8' : '#666';
            ctx.lineWidth = isPathEdge ? 3 : 1;
            ctx.stroke();

            // Draw weight
            const midX = (positions[src].x + positions[dest].x) / 2;
            const midY = (positions[src].y + positions[dest].y) / 2;
            ctx.fillStyle = '#333';
            ctx.fillText(weight, midX, midY);
        });
    });

    // Draw nodes
    nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(positions[node].x, positions[node].y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = path && path.includes(node) ? '#e8f0fe' : '#fff';
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.stroke();

        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node, positions[node].x, positions[node].y);
    });
}

function findShortestPath() {
    const graphInput = document.getElementById('graphInput').value;
    const startNode = document.getElementById('startNode').value.trim();
    const endNode = document.getElementById('endNode').value.trim();
    const resultDiv = document.getElementById('result');

    try {
        const graph = parseGraph(graphInput);
        
        if (!graph.adjacencyList.has(startNode) || !graph.adjacencyList.has(endNode)) {
            throw new Error("Start or end node not found in graph");
        }

        const { path, distance } = graph.dijkstra(startNode, endNode);
        
        if (!path) {
            resultDiv.className = 'result error';
            resultDiv.textContent = `No path exists between ${startNode} and ${endNode}`;
            drawGraph(graph, null);
            return;
        }

        resultDiv.className = 'result success';
        resultDiv.textContent = `Shortest Path: ${path.join(' -> ')} (Distance: ${distance})`;
        drawGraph(graph, path);
    } catch (error) {
        resultDiv.className = 'result error';
        if (error.message === "Negative weights are not allowed") {
            resultDiv.textContent = "Invalid input: Negative weights are not allowed in Dijkstra's algorithm";
        } else {
            resultDiv.textContent = error.message;
        }
        drawGraph(new Graph(), null);
    }
}
