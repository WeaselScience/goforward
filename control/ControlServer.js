import EventEmitter from 'events';
import debug from 'debug';
import https from 'https';
import socketio from 'socket.io';

const log = debug('fwdizer:ControlServer');

export default class ControlServer extends EventEmitter {
    constructor({
        port,
        tlsConfig
    }) {
        super();

        log('Creating');

        const httpsServer = https.createServer({
            ...tlsConfig,
            requestCert: true,
            rejectUnauthorized: true
        });

        httpsServer.on('close', () => {
            log('Closed');
            this.selfDestruct();
        });

        httpsServer.on('secureConnection', () => {
            log('new connection');
        });

        httpsServer.listen(port);

        return socketio(httpsServer);
    }

    selfDestruct() {
        log('Self-Destructing');
    }
}