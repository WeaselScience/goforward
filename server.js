import ControlServer from './ControlServer';
import crypto from 'crypto';

const server = new ControlServer({
    secret: 'asd'
});

server.on('ready', () => {
    const socket = require('net').createConnection({
        port: 55365
    });

    const secureSocket = crypto.createCipher('aes-256-ctr', 'asd');

    secureSocket.pipe(socket);

    socket.on('connect', () => {
        secureSocket.write('hello!!')
    });
});