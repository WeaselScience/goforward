import { pki, md } from 'node-forge';
import lodash from 'lodash';






const rootCACertificateExtensions = [{
    name: 'basicConstraints',
    cA: true,
    critical: true
}, {
    name: 'keyUsage',
    critical: true,
    keyCertSign: true,
    digitalSignature: true,
    cRLSign: true
}, {
    name: 'subjectKeyIdentifier'
}, {
    name: 'authorityKeyIdentifier',
    keyid: 'always',
    issuer: true
}];



const rootCACertificateAttributes = [{
    name: 'commonName',
    value: 'a damn good CA'
}, {
    name: 'countryName',
    value: 'US'
}, {
    shortName: 'ST',
    value: 'North Carolina'
}, {
    name: 'localityName',
    value: 'Charlotte'
}, {
    name: 'organizationName',
    value: 'Pebbles Certificate Company'
}];










const serviceCertificateExtensions = [{
    name: 'basicConstraints',
    cA: false
}, {
    name: 'keyUsage',
    digitalSignature: true,
    keyEncipherment: true
}, {
    name: 'extKeyUsage',
    serverAuth: true
}, {
    name: 'nsCertType',
    server: true
}, {
    name: 'authorityKeyIdentifier',
    keyid: true,
    issuer: 'always'
}, {
    name: 'subjectKeyIdentifier'
}, {
    name: 'subjectAltName',
    altNames: [{
        type: 6,
        value: 'http://localhost'
    }, {
        type: 7,
        ip: '127.0.0.1'
    }]
}];



const serviceCertificateAttributes = [{
    name: 'commonName',
    value: 'localhost'
}, {
    name: 'countryName',
    value: 'US'
}, {
    shortName: 'ST',
    value: 'North Carolina'
}, {
    name: 'localityName',
    value: 'Charlotte'
}, {
    name: 'organizationName',
    value: 'Boulders Security Company'
}];










const clientCertificateExtensions = [{
    name: 'basicConstraints',
    cA: false
}, {
    name: 'keyUsage',
    critical: true,
    nonRepudiation: true,
    digitalSignature: true,
    keyEncipherment: true
}, {
    name: 'extKeyUsage',
    clientAuth: true,
    emailProtection: true
}, {
    name: 'nsCertType',
    client: true,
    email: true
}, {
    name: 'authorityKeyIdentifier',
    keyid: true,
    issuer: 'always'
}, {
    name: 'subjectKeyIdentifier',
    hash: true
}, {
    name: 'subjectAltName',
    altNames: [{
        type: 6,
        value: 'https://localhost'
    }, {
        type: 7,
        ip: '127.0.0.1'
    }]
}];



const clientCertificateAttributes = [{
    name: 'commonName',
    value: 'a client god damn it'
}, {
    name: 'countryName',
    value: 'US'
}, {
    shortName: 'ST',
    value: 'North Carolina'
}, {
    name: 'localityName',
    value: 'Charlotte'
}, {
    name: 'organizationName',
    value: 'A Client'
}];









export const GetServiceCertificate = () => {
    const RootCAKeypair = pki.rsa.generateKeyPair(2048);
    const RootCACertificate = pki.createCertificate();
    RootCACertificate.publicKey = RootCAKeypair.publicKey;
    RootCACertificate.serialNumber = '0' + lodash.random(1, 100000000);
    RootCACertificate.validity.notBefore = new Date();
    RootCACertificate.validity.notAfter = new Date(+new Date + 1000 * 60 * 60 * 24 * 365);
    RootCACertificate.setExtensions(
        rootCACertificateExtensions
    );
    RootCACertificate.setSubject(
        rootCACertificateAttributes
    );
    RootCACertificate.setIssuer(
        rootCACertificateAttributes
    );
    RootCACertificate.sign(RootCAKeypair.privateKey, md.sha256.create());
    const RootCACertificatePem = pki.certificateToPem(RootCACertificate);





    const ServerKeypair = pki.rsa.generateKeyPair(2048);
    const ServerCertificate = pki.createCertificate();

    ServerCertificate.publicKey = ServerKeypair.publicKey;
    ServerCertificate.serialNumber = '0' + lodash.random(1, 100000000);
    ServerCertificate.validity.notBefore = new Date();
    ServerCertificate.validity.notAfter = new Date(+new Date + 1000 * 60 * 60 * 24 * 365);
    ServerCertificate.setExtensions(
        serviceCertificateExtensions
    );
    ServerCertificate.setSubject(
        serviceCertificateAttributes
    );
    ServerCertificate.setIssuer(
        rootCACertificateAttributes
    );
    ServerCertificate.sign(RootCAKeypair.privateKey, md.sha256.create());








    const ClientKeypair = pki.rsa.generateKeyPair(2048);
    const ClientCertificate = pki.createCertificate();

    ClientCertificate.publicKey = ClientKeypair.publicKey;
    ClientCertificate.serialNumber = '0' + lodash.random(1, 100000000);
    ClientCertificate.validity.notBefore = new Date();
    ClientCertificate.validity.notAfter = new Date(+new Date + 1000 * 60 * 60 * 24 * 365);
    ClientCertificate.setExtensions(
        clientCertificateExtensions
    );
    ClientCertificate.setSubject(
        clientCertificateAttributes
    );
    ClientCertificate.setIssuer(
        rootCACertificateAttributes
    );
    ClientCertificate.sign(RootCAKeypair.privateKey, md.sha256.create());









    const ServerCertificatePem = pki.certificateToPem(ServerCertificate);
    const ServerPrivateKeyPem = pki.privateKeyToPem(ServerKeypair.privateKey);


    const ClientCertificatePem = pki.certificateToPem(ClientCertificate);
    const ClientPrivateKeyPem = pki.privateKeyToPem(ClientKeypair.privateKey);








    return {
        server: {
            certificate: [ ServerCertificatePem, RootCACertificatePem ].join('\n'),
            key: ServerPrivateKeyPem,
        },
        client: {
            certificate: [ ClientCertificatePem, RootCACertificatePem ].join('\n'),
            key: ClientPrivateKeyPem,
        },
        caCertificate: RootCACertificatePem
    };
};

require('fs').writeFileSync('tls.json', JSON.stringify(GetServiceCertificate(), null, 4));