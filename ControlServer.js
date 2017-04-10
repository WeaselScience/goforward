import debug from 'debug';
import https from 'https';
import socketio from 'socket.io';

const log = debug('fwdizer:ControlServer');

const ControlServer = ({
    port,
    tlsConfig
}) => {
    log(`Creating on ${port}`);

    const httpsServer = https.createServer({
        ...tlsConfig,
        requestCert: true,
        rejectUnauthorized: true
    });

    httpsServer.on('close', () => {
        log('Closed');
    });

    httpsServer.on('secureConnection', () => {
        log('new connection');
    });

    httpsServer.listen(port, () => {
        log('listening');
    });

    const server = socketio(httpsServer);

    server.on('connection', (socket) => {
        console.log('New socket on socket.io');
    });

    return server;
};

export default ControlServer;