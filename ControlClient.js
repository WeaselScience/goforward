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

        log('Creating');

        const socket = socketio(`https://${host}:${port}`, {
            ...tlsConfig,
            rejectUnauthorized: true
        });

        return socket;
    }
}