import debug from 'debug';
import crypto from 'crypto';
import duplexer2 from 'duplexer2';

const log = debug('SecureSocket');

const SecureSocket = ({
    socket,
    algorithm = 'aes-256-ctr',
    secret
}) => {
    log('Creating');

    const encrypter = crypto.createCipher(this.algorithm, this.secret);
    const decrypter = crypto.createDecipher(this.algorithm, this.secret);

    socket.pipe(decrypter);
    encrypter.pipe(socket);

    return duplexer2(encrypter, decrypter);
};

export default SecureSocket;