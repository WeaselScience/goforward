import tls from 'tls';
import net from 'net';
import EventEmitter from 'events';
import debug from 'debug';

const log = debug('fwdizer:Router');

export default class Router extends EventEmitter {
    constructor({
        externalPort,
        internalPort = 0,
        tlsConfig
    }) {
        super();

        log(`Creating for external port ${externalPort} (internal port - ${
            internalPort
        })`);



        const externalSocketQueue = [];

        const externalServer = net.createServer();

        externalServer.listen(externalPort);

        externalServer.on('error', (error) => {
            log(`External Server Error: ${error.toString()}`);
            this.selfDestruct();
        });

        externalServer.on('close', () => {
            log('External Server Closed');
            this.selfDestruct();
        });

        externalServer.on('connection', (socket) => {
            log('New Client on External Server - emit newConnection');

            externalSocketQueue.push(socket);

            this.emit('newConnection');
        });



        const internalServer = tls.createServer({
            ...tlsConfig,
            requestCert: true,
            rejectUnauthorized: true
        });

        internalServer.listen(internalPort, () => {
            this.internalPort = internalServer.address().port;

            log(`Duplex ready - external ${externalPort} internal ${
                this.internalPort
            } - emitting ready.`);

            this.emit('ready', {
                internalPort: this.internalPort
            });
        });

        internalServer.on('error', (error) => {
            log(`Internal Server Error: ${error.toString()}`);
            this.selfDestruct();
        });

        internalServer.on('close', () => {
            log('Internal Server Closed');
            this.selfDestruct();
        });

        internalServer.on('secureConnection', (socket) => {
            log('Received secure connection on internal server...');

            if (externalSocketQueue.length === 0) {
                log('...but no sockets are in the queue.');

                return socket.end();
            }

            log('...Forwarding a pending socket.');

            const queuedExternalSocket = externalSocketQueue.shift();

            queuedExternalSocket.pipe(socket);
            socket.pipe(queuedExternalSocket);
        });
    }

    selfDestruct() {
        log('Self-Destructing');

        this.externalServer.close();
        this.internalServer.close();

        this.emit('dead');
    }
}