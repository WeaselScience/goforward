import ControlServer from './ControlServer';
import ControlClient from './ControlClient';

const controlServer = new ControlServer({
    port: 3001,
    secret: 'asd'
});

controlServer.on('ready', (server) => {
    server.on('connection', (socket) => {
        socket.on('blast', (data) => console.log(`It's a pokemon: ${data}!`));
    });

    const client = new ControlClient({
        host: 'localhost',
        port: 3001,
        secret: 'asd'
    });

    client.on('ready', (socket) => {
        socket.emit('blast', 'oise');
    });
});