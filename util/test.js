import Client from './Client';
import Server from './Server';

const server = new Server({
    port: 3000,
    secret: 'asd'
});

server.on('ready', () => {
    console.log('Server Ready!');

    const client = new Client({
        serverHost: '127.0.0.1',
        serverPort: 3000,
        secret: 'asd'
    });

    client.expose({
        localPort: 1234,
        remotePort: 8080
    });
});