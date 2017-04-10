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



        Object.assign(this, {
            externalPort
        });



        const externalSocketQueue = [];

        const externalServer = this.externalServer = net.createServer();

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
            log('New Client on External Server');

            externalSocketQueue.push(socket);

            this.emit('newConnection');
        });



        const internalServer = this.internalServer = tls.createServer({
            ...tlsConfig,
            requestCert: true,
            rejectUnauthorized: true
        });

        internalServer.listen(internalPort, () => {
            this.internalPort = internalServer.address().port;

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
            if (externalSocketQueue.length === 0) {
                return socket.end();
            }

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