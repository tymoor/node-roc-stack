var Binary = require('binary');

function TX_ERR_RESPONSE(bufferlist) {
    //throw new error('TX ERR RECEIVED!');
    var rtn = {};
    var binary = Binary.parse(bufferlist)
        .word8('ErrorCode')
        .word8('ErrorOffset');
    rtn = binary.vars;
    return rtn;
}

module.exports.RESPONSE = TX_ERR_RESPONSE;