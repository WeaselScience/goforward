import net from 'net';
import EventEmitter from 'events';
import crypto from 'crypto';
import debug from 'debug';
import SecureSocket from './SecureSocket';

const log = debug('Client');

export default class Client extends EventEmitter {
    constructor({
        localPort,
        remotePort,
        serverHost,
        serverPort,
        algorithm = 'aes-256-ctr',
        secret
    }) {
        super();

        Object.assign(this, {
            localPort,
            remotePort,
            serverHost,
            serverPort,
            algorithm,
            secret
        });

        this.controlSocket = net.createConnection({
            host: serverHost,
            port: serverPort
        });

        this.secureControlSocket = SecureSocket(this.controlSocket);

        this.secureControlSocket.on('data', (data) => {
            const jsonString = JSON.parse(data.toString());

            let jsonData;

            try {
                jsonData = JSON.parse(jsonString);
            } catch (error) {
                log(`Error while parsing control request: ${error.toString()}`);
                return;
            }
        });

        this.controlSocket.on('connect', () => {
            log('Control socket connected');

            this.secureControlSocket.write(JSON.stringify({
                port: remotePort
            }));
        });









        socketToServer.on('connect', () => {
            log('Connected to the server');

            outgoingSocketToServer.write(JSON.stringify({
                port: remotePort
            }));
        });

        const readinessListener = (data) => {
            log('Server responded that it is ready to continue');

            const jsonString = data.toString();

            let jsonData;

            try {
                jsonData = JSON.parse(jsonString);
            } catch (error) {
                return this.destroy();
            }

            if (!jsonData) {
                return this.destroy();
            }

            incomingSocketToServer.removeListener('data', readinessListener);

            this.socketToLocalServer = net.createConnection(localPort);

            this.socketToLocalServer.on('connect', () => {
                log('Connected to the local service');

                this.socketToLocalServer.pipe(outgoingSocketToServer);
                incomingSocketToServer.pipe(this.socketToLocalServer);
            });
        };

        incomingSocketToServer.on('data', readinessListener);
    }

    destroy() {
        log('Destroying');

        this.socketToServer.destroy();

        this.socketToLocalServer.destroy();

        this.emit('dead');
    }
}