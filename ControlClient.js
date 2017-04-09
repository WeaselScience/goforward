import net from 'net';
import EventEmitter from 'events';
import debug from 'debug';
import http from 'http';
import socketio from 'socket.io-client';
import crypto from 'crypto';
import duplexer2 from 'duplexer2';

const log = debug('fwdizer:ControlClient');

export default class ControlClient extends EventEmitter {
    constructor({
        host,
        port,
        algorithm = 'aes-256-ctr',
        secret
    }) {
        super();



        const internalServer = net.createServer();

        internalServer.listen(() => {
            const localPort = internalServer.address().port;

            const ioClient = this.client
                = socketio(`http://localhost:${localPort}`);

            this.emit('ready', ioClient);
        });

        internalServer.on('connection', (socket) => {
            const socketToRemoteServer = net.createConnection({
                host,
                port
            });

            const encrypter = crypto.createCipher(algorithm, secret);
            const decrypter = crypto.createDecipher(algorithm, secret);

            socket.pipe(encrypter);
            decrypter.pipe(socket);

            encrypter.pipe(socketToRemoteServer);
            socketToRemoteServer.pipe(decrypter);
        });
    }
}