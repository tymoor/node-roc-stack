var Put = require('put');
var Binary = require('binary');

function SET_PARAMS_REQUEST(tlpList) {
    var req = Put().word8(tlpList.length);
    tlpList.forEach(function (tlp, index, array) {
        req.word8(tlp.t)
            .word8(tlp.l)
            .word8(tlp.p)
            .put(new Buffer(tlp.d));
        //.put(function (vars) {
        //    TYPES.writeTLP.call(this, tlp);
        //});
    });
    return req.buffer();
}

function SET_PARAMS_RESPONSE(bufferlist) {
    return;
}

module.exports.REQUEST = SET_PARAMS_REQUEST;
module.exports.RESPONSE = SET_PARAMS_RESPONSE;