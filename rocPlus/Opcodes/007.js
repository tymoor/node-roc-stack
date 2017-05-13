var Put = require('put');
var Binary = require('binary');

//GET DATE TIME

function NULL_REQUEST() {
    return Put().buffer();
}

function GET_DATE_TIME_RESPONSE(bufferlist) {
    var rtn = [];
    var binary = Binary.parse(bufferlist)
        .word8('currentSecond')
        .word8('currentMinute')
        .word8('currentHour')
        .word8('currentDay')
        .word8('currentMonth')
        .word8('currentYear')
        .word8('yearsSinceLastLeapYear')
        .word8('dayOfWeek');
    //.end();
    rtn.push(binary.vars);
    return rtn;
}

module.exports.REQUEST = NULL_REQUEST;
module.exports.RESPONSE = GET_DATE_TIME_RESPONSE;
