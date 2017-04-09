import net from 'net';
import EventEmitter from 'events';
import debug from 'debug';

const log = debug('fwdizer:Router');

export default class Router extends EventEmitter {
    constructor({
        port
    }) {
        super();



        const socketQueue = [];



        const server = this.server = net.createServer();

        server.listen(port);

        // Bail on any server error.
        server.on('error', (error) => {
            log(`Server Error: ${error.toString()}`);
            this.selfDestruct();
        });

        server.on('close', () => {
            log('Server Closed');
            this.selfDestruct();
        });

        server.on('connection', (socket) => {
            log('New Client on Server');

            socketQueue.push(socket);

            this.emit('newConnection');
        });



        this.on('newTunnel', (tunnelSocket) => {
            if (socketQueue.length === 0) {
                tunnelSocket.end();
            } else {
                const queuedSocket = socketQueue.shift();

                tunnelSocket.pipe(queuedSocket);
                queuedSocket.pipe(tunnelSocket);
            }
        });
    }

    selfDestruct() {
        log('Self-Destructing');

        this.emit('selfDestruct');
    }
}