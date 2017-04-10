import ControlServer from './ControlServer';
import ControlClient from './ControlClient';
import fs from 'fs';

const tls = JSON.parse(fs.readFileSync('tls.json'));

const controlServer = new ControlServer({
    port: 3001,
    caCertificate: tls.caCertificate,
    privateKey: tls.server.key,
    certificate: tls.server.certificate
});

controlServer.on('connection', (socket) => {
    socket.on('blast', (data) => console.log(`It's a pokemon: ${data}!`));
});

const client = new ControlClient({
    host: 'localhost',
    port: 3001,
    caCertificate: tls.caCertificate,
    privateKey: tls.client.key,
    certificate: tls.client.certificate
});

client.emit('blast', 'oise');