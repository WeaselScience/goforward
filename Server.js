import net from 'net';
import EventEmitter from 'events';
import crypto from 'crypto';
import debug from 'debug';
import RoutedSocket from './RoutedSocket';

const log = debug('Server');

export default class Server extends EventEmitter {
    constructor({
        port = 55365,
        algorithm = 'aes-256-ctr',
        secret
    }) {
        log(`Constructing a Server on port ${port}`);

        super();

        this.routedSockets = [];

        Object.assign(this, {
            port,
            algorithm,
            secret
        });

        const server = this.server = net.createServer();

        server.listen(port, () => {
            log(`Server is listening`);

            this.emit('ready');
        });

        server.on('connection', (socket) => {
            log(`Received a connection`);

            this.handleConnection(socket);
        });

        // Bail on any server error.
        server.on('error', (error) => {
            log(`Server Error: ${error.toString()}`);

            this.destroy();
        });

        server.on('close', () => {
            log('Server Closed');

            this.destroy();
        });
    }

    destroy() {
        log('Destroying Server');

        this.server.close();

        this.routedSockets.forEach((routedSocket) => routedSocket.destroy());

        this.emit('dead');
    }

    handleConnection(socket) {
        const encrypter = crypto.createCipher(this.algorithm, this.secret);
        const decrypter = crypto.createDecipher(this.algorithm, this.secret);

        socket.pipe(decrypter);
        const incomingDataSocket = decrypter;

        encrypter.pipe(socket);
        const outgoingDataSocket = encrypter;

        const establishDataListener = (data) => {
            log('Received establishment request');

            const jsonString = data.toString();

            let jsonData;

            try {
                jsonData = JSON.parse(jsonString);
            } catch (error) {
                log('FAILED TO PARSE INITIAL REQUEST');

                outgoingDataSocket.end(JSON.stringify({
                    error: true,
                    reason: 'Could not parse configuration JSON'
                }));
            }

            if (!jsonData) {
                return;
            }

            outgoingDataSocket.write(JSON.stringify({
                status: 'ready'
            }));

            incomingDataSocket.removeListener('data', establishDataListener);

            const routedSocket = new RoutedSocket({
                incomingDataSocket,
                outgoingDataSocket,
                port: jsonData.port
            });

            routedSocket.on('ready', () => log('RoutedServer ready'));

            this.routedSockets.push(routedSocket);
        };

        incomingDataSocket.on('data', establishDataListener);

        socket.on('end', () => {
            log('Original Socket Closed');
        });
    }
}