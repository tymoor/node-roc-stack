var Put = require('put');
var Binary = require('binary');

function SYSTEM_CONFIGURATION_REQUEST() {
    return Put().buffer();
}

function SYSTEM_CONFIGURATION_RESPONSE(bufferlist) {
    var binary = Binary.parse(bufferlist)
        .word8('SystemMode')   //0-Firmware Update, 1-Run
        .word16le('CommPort')  //The Comm Port, or port number that the request was received on.
        .word8('SecurityAccessMode')
        .word8('LogicalCompatabilityStatus')
        .word8('Opcode6Revision')
        .word8('ROC_Subtype')   //1-Series1, 0-Series2
        .buffer('reserved_1', 11)   //11 bytes for future use
        .word8('ROC_Type');  // ROC Type
    //1 = ROCPAC ROC300- Series
    //2 = FloBoss 407
    //3 = FlashPAC ROC300- Series
    //4 = FloBoss 503
    //5 = FloBoss 504
    //6 = ROC800(809 / 827)
    //11 = DL8000
    //X = FB100 - Series
    for (var i = 60; i < 256; i++) {
        binary.word8('Logical' + i + '_count');
    }

    return binary.vars;
}

module.exports.REQUEST = SYSTEM_CONFIGURATION_REQUEST;
module.exports.RESPONSE = SYSTEM_CONFIGURATION_RESPONSE;