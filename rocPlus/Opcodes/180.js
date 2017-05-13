var Put = require('put');
var Binary = require('binary');
var TYPES = require('../Types');

function GET_PARAMS_REQUEST(tlpList) {
    var req = Put().word8(tlpList.length);
    tlpList.forEach(function (tlp, index, array) {
        req.word8(tlp.t)
            .word8(tlp.l)
            .word8(tlp.p)
    });
    return req.buffer();
}

function GET_PARAMS_RESPONSE(bufferlist) {
    var rtn = [];
    var binary = Binary.parse(bufferlist)
        .word8('numberOfParams');
    for (var i = 0; i < binary.vars.numberOfParams; i++) {
        var prefix = 'TLP_' + i;
        binary.word8(prefix + '.T')
            .word8(prefix + '.L')
            .word8(prefix + '.P')
            .tap(function (vars) {
                TYPES.readTLP.call(this, prefix);
            });
    }
    rtn.push(binary.vars);
    return rtn;
}

module.exports.REQUEST = GET_PARAMS_REQUEST;
module.exports.RESPONSE = GET_PARAMS_RESPONSE;