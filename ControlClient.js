import debug from 'debug';
import socketio from 'socket.io-client';

const log = debug('fwdizer:ControlClient');

const ControlClient = ({
    host,
    port,
    tlsConfig
}) => {
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
};

export default ControlClient;