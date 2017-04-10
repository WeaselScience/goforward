import Client from '../Client';
import Server from '../Server';
import fs from 'fs';

const tlsConfig = JSON.parse(fs.readFileSync('tls.json'));

const server = new Server({
    port: 8081,
    tlsConfig: {
        ca: tlsConfig.caCertificate,
        cert: tlsConfig.server.certificate,
        key: tlsConfig.server.key,
    }
});

const client = new Client({
    host: '127.0.0.1',
    port: 8081,
    tlsConfig: {
        ca: tlsConfig.caCertificate,
        cert: tlsConfig.client.certificate,
        key: tlsConfig.client.key,
    }
});

client.expose({
    localPort: 8082,
    externalPort: 8080
});