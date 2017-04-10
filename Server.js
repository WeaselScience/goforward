import EventEmitter from 'events';
import debug from 'debug';
import Router from './Router';
import ControlServer from './control/ControlServer';

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
            const routers = [];

            socket.on('createRouter', ({
                externalPort
            }) => {
                const router = new Router({
                    externalPort,
                    tlsConfig
                });

                router.on('ready', () => {
                    socket.emit('routerReady', {
                        externalPort,
                        internalPort: router.internalPort
                    });

                    routers.push({
                        externalPort,
                        router
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