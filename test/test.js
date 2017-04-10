import Client from '../Client';
import Server from '../Server';
import fs from 'fs';

const tlsConfig = JSON.parse(fs.readFileSync('tls.json'));

const server = new Server({
    port: 3000,
    tlsConfig
});

server.on('ready', () => {
    const client = new Client({
        serverHost: '127.0.0.1',
        serverPort: 3000,
        tlsConfig
    });

    client.expose({
        localPort: 1234,
        externalPort: 8080
    });
});