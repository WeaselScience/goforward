import net from 'net';
import EventEmitter from 'events';
import debug from 'debug';

const log = debug('RoutedSocket');

export default class RoutedSocket extends EventEmitter {
    constructor({
        incomingDataSocket,
        outgoingDataSocket,
        port
    }) {
        super();

        log('Initalizing RoutedSocket');

        Object.assign(this, {
            incomingDataSocket,
            outgoingDataSocket,
            port
        });



        /*
            Whenever something bad happens to the socket, just bail
        */
        incomingDataSocket.on('close', () => {
            log('Incoming Data Socket Closed');
            //this.destroy();
        });

        incomingDataSocket.on('error', (error) => {
            log(`Incoming Data Socket Error: ${error.toString()}`);
            //this.destroy();
        });

        incomingDataSocket.on('timeout', () => {
            log('Incoming Data Socket Timeout');
            //this.destroy();
        });

        incomingDataSocket.on('end', () => {
            log('Incoming Data Socket End');
            //this.destroy();
        });



        // The server that will be routed into our router socket.
        const server = this.server = net.createServer();

        server.listen(port);

        // Bail on any server error.
        server.on('error', (error) => {
            log(`RoutedSocket Server Error: ${error.toString()}`);
            //this.destroy();
        });

        server.on('close', () => {
            log('RoutedSocket Server Closed');
            //this.destroy();
        });

        this.sockets = [];

        server.on('connection', (socket) => {
            log('New Client on RoutedSocket Server');

            socket.pipe(outgoingDataSocket);

            incomingDataSocket.pipe(socket);

            this.sockets.push(socket);
        });



        // Inform our parents that we are ready to rock
        server.on('listening', () => {
            log('RoutedSocket server listening');

            this.emit('ready');
        });
    }

    destroy() {
        log('Destroying RoutedSocket');

        this.sockets.forEach((socket) => socket.destroy());

        this.server.close();

        this.emit('dead');
    }
}