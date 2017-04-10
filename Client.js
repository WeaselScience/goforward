import tls from 'tls';
import net from 'net';
import EventEmitter from 'events';
import debug from 'debug';
import ControlClient from './ControlClient';
import find from 'lodash/find';

const log = debug('fwdizer:Client');

export default class Client extends EventEmitter {
    expose({
        localPort,
        externalPort,
        callback = () => {}
    }) {
        log(`Exposing local port ${localPort} on remote port ${externalPort}`);

        return new Promise((resolve, reject) => {
            this.control.emit('createRouter', {
                externalPort
            }, ({
                error,
                internalPort
            }) => {
                if (error) {
                    log(`createRouter error: ${error.toString()}`);

                    reject(error);
                } else {
                    log(`createRouter success ${externalPort} - ${
                        internalPort
                    } - ${localPort}`);

                    this.exposures.push({
                        externalPort,
                        internalPort,
                        localPort
                    });

                    resolve({
                        internalPort
                    });
                }
            });
        });
    }

    constructor({
        host,
        port,
        tlsConfig
    }) {
        super();



        this.exposures = [];



        log('Creating');



        const control = this.control = ControlClient({
            host,
            port,
            tlsConfig
        });

        control.on('requestTunnel', ({
            externalPort,
            internalPort
        }) => {
            log('Processing a request for a new tunnel');

            const exposure = find(this.exposures, {
                externalPort
            });

            const localSocket = net.createConnection(exposure.localPort);

            const remoteSocket = tls.connect({
                ...tlsConfig,
                rejectUnauthorized: true,
                host,
                port: exposure.internalPort
            });

            localSocket.pipe(remoteSocket);
            remoteSocket.pipe(localSocket);
        });
    }

    selfDestruct() {
        log('Self-destructing');

        this.emit('dead');
    }
}