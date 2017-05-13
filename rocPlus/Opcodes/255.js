var Binary = require('binary');

function TX_ERR_RESPONSE(bufferlist) {
    //throw new error('TX ERR RECEIVED!');
    return binary = Binary.parse(bufferlist)
        .word8('ErrorCode')
        .word8('ErrorOffset')
        .word8('ErrorByte')
        .vars;
}

module.exports.RESPONSE = TX_ERR_RESPONSE;