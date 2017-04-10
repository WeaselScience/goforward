import net from 'net';
import EventEmitter from 'events';
import debug from 'debug';
import http from 'http';
import socketio from 'socket.io-client';
import crypto from 'crypto';
import duplexer2 from 'duplexer2';

const log = debug('fwdizer:ControlClient');

export default class ControlClient extends EventEmitter {
    constructor({
        host,
        port,
        caCertificate,
        privateKey,
        certificate
    }) {
        super();

        log('Creating');

        const socket = socketio(`https://${host}:${port}`, {
            key: privateKey,
            cert: certificate,
            ca: caCertificate,
            rejectUnauthorized: true
        });

        return socket;
    }
}