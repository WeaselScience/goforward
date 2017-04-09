import debug from 'debug';
import crypto from 'crypto';
import duplexer2 from 'duplexer2';

const log = debug('SecureSocket');

const SecureSocketMaker = ({
    algorithm = 'aes-256-ctr',
    secret
}) => (socket) => {
    const encrypter = crypto.createCipher(algorithm, secret);
    const decrypter = crypto.createDecipher(algorithm, secret);

    socket.pipe(decrypter);
    encrypter.pipe(socket);

    return duplexer2(encrypter, decrypter);
};

export default SecureSocketMaker;