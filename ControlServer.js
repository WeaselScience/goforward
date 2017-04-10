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
        console.log('ControlServer unexpectedly closed');
        log('Closed');
    });

    httpsServer.listen(port, () => {
        log('Listening');
    });

    const server = socketio(httpsServer);

    server.on('connection', (socket) => {
        log('New connection');
    });

    return server;
};

export default ControlServer;