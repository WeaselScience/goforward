import net from 'net';
import EventEmitter from 'events';
import debug from 'debug';
import http from 'http';
import socketio from 'socket.io';
import crypto from 'crypto';
import duplexer2 from 'duplexer2';

const log = debug('fwdizer:ControlServer');

export default class ControlServer extends EventEmitter {
    constructor({
        port,
        algorithm = 'aes-256-ctr',
        secret
    }) {
        super();



        log('Creating');



        let internalPort;



        const externalServer = net.createServer();

        externalServer.listen(port);

        externalServer.on('connection', (socket) => {
            log('Connection');

            const encrypter = crypto.createCipher(algorithm, secret);
            const decrypter = crypto.createDecipher(algorithm, secret);

            socket.pipe(decrypter);
            encrypter.pipe(socket);

            const localSocket = net.createConnection({
                host: 'localhost',
                port: internalPort
            });

            localSocket.pipe(encrypter);
            decrypter.pipe(localSocket);
        });



        const internalServer = net.createServer();

        internalServer.listen(() => {
            log('Listening');

            internalPort = internalServer.address().port;

            const httpServer = http.createServer();

            httpServer.listen(internalServer);

            this.server = new socketio(httpServer);

            this.emit('ready', this.server);
        });
    }
}