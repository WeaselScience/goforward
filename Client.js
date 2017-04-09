import net from 'net';
import EventEmitter from 'events';
import crypto from 'crypto';
import debug from 'debug';
import SecureSocketMaker from './SecureSocketMaker';
import uuid from 'uuid/v4';
import find from 'lodash/find';

const log = debug('fwdizer:Client');

export default class Client extends EventEmitter {
    expose({
        localPort,
        remotePort
    }) {
        log(`Exposing local port ${localPort} on remote port ${remotePort}`);

        this.exposures.push({
            localPort,
            remotePort
        });

        this.sendControlMessage({
            startForwardingOnPort: remotePort
        });
    }

    sendControlMessage(message) {
        const finalMessage = Object.assign({}, message, {
            clientId: this.clientId
        });

        this.secureControlSocket.write(JSON.stringify(finalMessage));
    }

    constructor({
        serverHost,
        serverPort,
        algorithm = 'aes-256-ctr',
        secret
    }) {
        super();

        Object.assign(this, {
            serverHost,
            serverPort,
            algorithm,
            secret
        });



        log('Creating');



        const clientId = this.clientId = uuid();



        const exposures = this.exposures = [];



        const secureSocket = this.secureSocket = SecureSocketMaker({
            algorithm,
            secret
        });

        this.controlSocket = net.createConnection({
            host: serverHost,
            port: serverPort
        });

        this.secureControlSocket = secureSocket(this.controlSocket);



        this.secureControlSocket.on('data', (data) => {
            const jsonString = JSON.parse(data.toString());

            let jsonData;

            try {
                jsonData = JSON.parse(jsonString);
            } catch (error) {
                log(`Error while parsing control request: ${error.toString()}`);
                return this.selfDestruct();
            }

            if (jsonData.requestTunnel) {
                const exposure = find(exposures, {
                    remotePort: jsonData.remotePort
                });

                log(`Server received a connection on remote port ${
                    exposure.remotePort
                } and wants us to create a socket piped to local port ${
                    exposure.localPort
                }`);

                const socketToLocalPort = net.createConnection(exposure.localPort);

                const socketToRemotePort = net.createConnection({
                    host: serverHost,
                    port: serverPort
                });

                const secureSocketToRemotePort = secureSocket(socketToRemotePort);

                secureSocketToRemotePort.write(JSON.stringify({
                    newTunnel: true,
                    remotePort: exposure.remotePort,
                    clientId
                }));

                secureSocketToRemotePort.pipe(socketToLocalPort);
                socketToLocalPort.pipe(secureSocketToRemotePort);
            }
        });



        this.sendControlMessage({
            controlSocket: true
        });



        this.controlSocket.on('connect', () => {
            this.controlSocketReady = true;
        });

        this.controlSocket.on('close', () => {
            this.controlSocketReady = false;

            this.selfDestruct();
        });

        this.controlSocket.on('end', () => {
            this.controlSocketReady = false;

            this.selfDestruct();
        });

        this.controlSocket.on('error', () => {
            this.controlSocketReady = false;

            this.selfDestruct();
        });

        this.controlSocket.on('timeout', () => {
            this.controlSocketReady = false;

            this.selfDestruct();
        });
    }

    selfDestruct() {
        log('Self-destructing');

        this.controlSocket.destroy();

        this.socketToServer.destroy();

        this.socketToLocalServer.destroy();

        this.emit('dead');
    }
}