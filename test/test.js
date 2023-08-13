import WebSocket from 'ws';

const numConnections = 100;

const connections = [];

function createConnection() {
    const ws = new WebSocket('ws://localhost:3000/session1');

    ws.on('open', () => {
        connections.push(ws);

        if (connections.length === numConnections) {
            startSendingMessages();
        }
    });

    ws.on('message', (data) => {
        // Handle received messages if needed
    });
}

function startSendingMessages() {
    const message = {
        type: 'draw',
        data: {
            x1: getRandomValue(),
            y1: getRandomValue(),
            x2: getRandomValue(),
            y2: getRandomValue(),
        },
    };

    const startTime = Date.now();

    connections.forEach((ws) => {
        ws.send(JSON.stringify(message));
    });

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    console.log(`Sent ${numConnections} messages in ${totalTime}ms`);
}

function getRandomValue() {
    return Math.random() * 100 % 2000;
}

for (let i = 0; i < numConnections; i++) {
    createConnection();
}