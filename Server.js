import EventEmitter from 'events';
import debug from 'debug';
import Router from './Router';
import ControlServer from './ControlServer';

const log = debug('fwdizer:Server');

export default class Server extends EventEmitter {
    constructor({
        port = 55365,
        tlsConfig
    }) {
        super();



        log(`Constructing - control on ${port}`);



        const control = this.control = ControlServer({
            port,
            tlsConfig
        });

        control.on('connection', (socket) => {
            log('New connection on control server');

            socket.on('createRouter', ({
                externalPort
            }, callback) => {
                log('Received createRouter request');

                const router = new Router({
                    externalPort,
                    tlsConfig
                });

                router.on('ready', () => {
                    log('Router is ready');

                    callback({
                        error: null,
                        internalPort: router.internalPort
                    });

                    router.on('newConnection', () => {
                        log('Sending request for new tunnel');

                        socket.emit('requestTunnel', {
                            externalPort,
                            internalPort: router.internalPort
                        });
                    });
                });
            });
        });
    }

    selfDestruct() {
        log('Self-Destructing');

        this.control.close();

        this.emit('dead');
    }
}