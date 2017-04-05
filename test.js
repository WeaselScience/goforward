import Client from './Client';
import Server from './Server';

const server = new Server({
    port: 3000,
    secret: 'asd'
});

server.on('ready', () => {
    console.log('Server Ready!');

    const client = new Client({
        localPort: 1234,
        remotePort: 8080,
        serverHost: '127.0.0.1',
        serverPort: 3000,
        secret: 'asd'
    });

    client.on('ready', () => {
        console.log('Client Ready!');
    });
});