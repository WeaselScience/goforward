import EventEmitter from 'events';
import debug from 'debug';
import socketio from 'socket.io-client';

const log = debug('fwdizer:ControlClient');

export default class ControlClient extends EventEmitter {
    constructor({
        host,
        port,
        tlsConfig
    }) {
        super();

        const url = `https://${host}:${port}`;

        log(`Creating: ${url}`);

        const socket = socketio(url, {
            ...tlsConfig,
            rejectUnauthorized: true
        });

        socket.on('error', (error) => {
            log(`Error: ${error.toString()}`);
        });

        socket.on('connect', () => {
            log('Connected');
        });

        socket.on('connect_error', (error) => {
            log(`Connection error: ${error.toString()}`);
        });

        return socket;
    }
}