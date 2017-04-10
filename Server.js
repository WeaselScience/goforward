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



        log(`Constructing`);



        const control = this.control = new ControlServer({
            port,
            tlsConfig
        });

        control.on('connection', (socket) => {
            socket.on('createRouter', ({
                externalPort
            }, callback) => {
                const router = new Router({
                    externalPort,
                    tlsConfig
                });

                router.on('ready', () => {
                    callback({
                        error: null,
                        internalPort: router.internalPort
                    });

                    router.on('newConnection', () => {
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