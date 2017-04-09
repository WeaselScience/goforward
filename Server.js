import net from 'net';
import EventEmitter from 'events';
import crypto from 'crypto';
import debug from 'debug';
import Router from './Router';
import SecureSocketMaker from './SecureSocketMaker';
import find from 'lodash/find';

const log = debug('fwdizer:Server');

export default class Server extends EventEmitter {
    constructor({
        port = 55365,
        algorithm = 'aes-256-ctr',
        secret
    }) {
        super();

        log(`Constructing a Server on port ${port}`);

        this.controlSockets = {};
        this.routers = {};

        Object.assign(this, {
            port,
            algorithm,
            secret
        });

        this.secureSocket = SecureSocketMaker({
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

            this.selfDestruct();
        });

        server.on('close', () => {
            log('Server Closed');

            this.selfDestruct();
        });
    }

    selfDestruct() {
        log('Self-Destructing');

        this.server.close();

        this.emit('dead');
    }

    handleControlData({
        data,
        socket
    }) {
        const jsonString = data.toString();

        let jsonData;

        try {
            jsonData = JSON.parse(jsonString);
        } catch (error) {
            log('Failed to parse control data');

            return this.selfDestruct();
        }

        if (jsonData.startForwardingOnPort) {
            /*
            The client is requesting us to listen on the given port.
            We will inform the client once someone connects to that port,
            and will expect the client to establish a new socket on which
            communications with the new connection will happen.
            */

            const router = new Router({
                port: jsonData.startForwardingOnPort
            });

            this.routers[jsonData.startForwardingOnPort] = router;

            router.on('newConnection', () => {
                socket.write(JSON.stringify({
                    requestTunnel: true,
                    remotePort: jsonData.startForwardingOnPort
                }));
            });
        }
    }

    handleConnection(socket) {
        const secureClientSocket = this.secureSocket(socket);

        secureClientSocket.on('data', (data) => {
            const jsonString = data.toString();

            let jsonData;

            try {
                jsonData = JSON.parse(jsonString);
            } catch (error) {
                log(`Failed to parse handshake: ${jsonString}`);

                return this.selfDestruct();
            }

            if (jsonData.controlSocket) {
                this.controlSockets[jsonData.clientId] = secureClientSocket;

                secureClientSocket.on('data', (data) => {
                    this.handleControlData({
                        data,
                        socket: secureClientSocket
                    });
                });
            } else if (jsonData.newTunnel) {
                const router = this.routers[jsonData.remotePort];

                router.emit('newTunnel', secureClientSocket);
            }
        });

        socket.on('end', () => {
            log('Client Socket Ended');
        });
    }
}