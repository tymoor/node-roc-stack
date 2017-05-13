var Put = require('put');
var Binary = require('binary');

function GENERAL_UPDATE_REQUEST(block) {
    if (!block)
        block = 0;
    return Put()
        .word8(block)			//Block Number (start with '0', request more if needed)
        .word8(255)			//Additional Point Selector [0: AGA, PI, PID, TNK, AO, TDO, 6: DO]
        .buffer();
}

function GENERAL_UPDATE_RESPONSE(bufferlist) {
    var rtn = [];
    try {
        var binary = Binary.parse(bufferlist)
            .word8('DI_count')
            .word8('TDI_count')
            .word8('AI_count')
            .word8('MeterRun_count')
            .word8('PI_count')
            .word8('PID_count')
            .word8('Tank_count')
            .word8('AO_count')
            .word8('TDO_count')
            .word8('DO_count')
            .word16le('Alarm_pointer')	//top bit of msb set if power reset
            .word16le('Event_pointer')
            .word16le('HourlyHistory_pointer');
        //.end();

        //CALCULATE DATA SIZE (More Blocks Needed?)
        binary.vars.calcSize = (16 //COUNTS
            + binary.vars.DI_count
            + binary.vars.TDI_count * 5
            + (binary.vars.AI_count - 5) * 5
            + binary.vars.MeterRun_count * 16
            + binary.vars.PI_count * 13
            + binary.vars.PID_count * 9
            + binary.vars.AO_count * 5
            + binary.vars.TDO_count * 5
            + binary.vars.DO_count
            + 1 //BLOCK
        );

        //GET AI's
        for (var i = 0; i < 5; i++) {
            binary.buffer('AI_SYSTEM_' + (i + 1) + '_eu.buf', 4);
            //.end();
            rtn[0] = binary.vars;
            rtn[0]['AI_SYSTEM_' + (i + 1) + '_eu'] = rtn[0]['AI_SYSTEM_' + (i + 1) + '_eu']['buf'].readFloatLE(0);
        }
        //GET DI's
        for (var i = 0; i < binary.vars.DI_count; i++) {
            var prefix = 'DI_' + (i + 1);
            binary.word8(prefix + '.StatusRaw');
            rtn[0] = binary.vars;
            rtn[0][prefix]['Status'] = (rtn[0][prefix]['StatusRaw'] & 1);
            rtn[0][prefix]['PointNumber'] = (rtn[0][prefix]['StatusRaw'] >> 1);
        }
        //GET TDI's
        for (var i = 0; i < binary.vars.TDI_count; i++) {
            binary.word8('TDI_' + (i + 1) + '_ptnum')
                .buffer('TDI_' + (i + 1) + '_eu.buf', 4);
            //.end();
            rtn[0] = binary.vars;
            rtn[0]['TDI_' + (i + 1) + '_eu'] = rtn[0]['TDI_' + (i + 1) + '_eu']['buf'].readFloatLE(0);
        }
        //GET AI's (Minus 5 System AI's)
        for (var i = 0; i < binary.vars.AI_count - 5; i++) {
            var prefix = 'AI_' + (i + 1);
            binary.word8(prefix + '.PointNumber')
                .buffer(prefix + '.EU.buf', 4);
            //.end();
            rtn[0] = binary.vars;
            rtn[0][prefix]['EU'] = rtn[0][prefix]['EU']['buf'].readFloatLE(0);
        }
        //GET MVS (!ONLY FOR 407!)
        //binary.skip(80).end();

        //GET Meter Runs
        for (var i = 0; i < binary.vars.MeterRun_count; i++) {
            var prefix = 'MeterRun_' + (i + 1);
            binary
                .buffer(prefix + '.Current_MCF_perDay.buf', 4)
                .buffer(prefix + '.Current_Energy_MMBTU_perDay.buf', 4)
                .buffer(prefix + '.Total_MCF_Since_ContractHour.buf', 4)
                .buffer(prefix + '.MMBTU_Since_ContractHour.buf', 4);
            //.end();
            rtn[0] = binary.vars;
            rtn[0][prefix]['Current_MCF_perDay'] = rtn[0][prefix]['Current_MCF_perDay']['buf'].readFloatLE(0);
            rtn[0][prefix]['Current_Energy_MMBTU_perDay'] = rtn[0][prefix]['Current_Energy_MMBTU_perDay']['buf'].readFloatLE(0);
            rtn[0][prefix]['Total_MCF_Since_ContractHour'] = rtn[0][prefix]['Total_MCF_Since_ContractHour']['buf'].readFloatLE(0);
            rtn[0][prefix]['MMBTU_Since_ContractHour'] = rtn[0][prefix]['MMBTU_Since_ContractHour']['buf'].readFloatLE(0);

        }

        //GET PI
        for (var i = 0; i < binary.vars.PI_count; i++) {
            var prefix = 'PI_' + (i + 1);
            binary.word8(prefix + '.PointNumber')
                .word32le(prefix + '.RawCounts')
                .word32le(prefix + '.Rate_EU/time')
                .buffer(prefix + '.TotalToday.buf', 4);
            //.end();
            rtn[0] = binary.vars;
            rtn[0][prefix]['TotalToday'] = rtn[0][prefix]['TotalToday']['buf'].readFloatLE(0);
        }

        //GET PID
        for (var i = 0; i < binary.vars.PID_count; i++) {
            var prefix = 'PID_' + (i + 1);
            binary.word8(prefix + '.Status')
                .buffer(prefix + '.PrimarySetpoint.buf', 4)
                .buffer(prefix + '.SecondarySetpoint.buf', 4);
            //.end();
            rtn[0] = binary.vars;
            rtn[0][prefix]['PrimarySetpoint'] = rtn[0][prefix]['PrimarySetpoint']['buf'].readFloatLE(0);
            rtn[0][prefix]['SecondarySetpoint'] = rtn[0][prefix]['SecondarySetpoint']['buf'].readFloatLE(0);
        }

        //GET AO
        for (var i = 0; i < binary.vars.AO_count; i++) {
            var prefix = 'AO_' + (i + 1);
            binary.word8(prefix + '.PointNumber')
                .buffer(prefix + '.AO_EU.buf', 4);
            //.end();
            rtn[0] = binary.vars;
            rtn[0][prefix]['AO_EU'] = rtn[0][prefix]['AO_EU']['buf'].readFloatLE(0);
        }

        //GET TDO
        for (var i = 0; i < binary.vars.TDO_count; i++) {
            var prefix = 'TDO_' + (i + 1);
            binary.word8(prefix + '.PointNumber')
                .buffer(prefix + '.TDO_EU.buf', 4);
            //.end();
            rtn[0] = binary.vars;
            rtn[0][prefix]['TDO_EU'] = rtn[0][prefix]['TDO_EU']['buf'].readFloatLE(0);
        }

        //GET DO
        for (var i = 0; i < binary.vars.DO_count; i++) {
            var prefix = 'DO_' + (i + 1);
            binary.word8(prefix + '.StatusRaw');
            //.end();
            rtn[0] = binary.vars;
            rtn[0][prefix]['Status'] = (rtn[0][prefix]['StatusRaw'] & 1);
            rtn[0][prefix]['PointNumber'] = (rtn[0][prefix]['StatusRaw'] >> 1);
        }

        rtn[0] = binary.vars;
    } catch (e) {
        console.log(e);
    }
    return rtn;

}

function GENERAL_UPDATE_NEEDMORE(bufferlist, client) {
    var binary = Binary.parse(bufferlist)
        .word8('DI_count')
        .word8('TDI_count')
        .word8('AI_count')
        .word8('MeterRun_count')
        .word8('PI_count')
        .word8('PID_count')
        .word8('Tank_count')
        .word8('AO_count')
        .word8('TDO_count')
        .word8('DO_count')
        .word16le('Alarm_pointer')	//top bit of msb set if power reset
        .word16le('Event_pointer')
        .word16le('HourlyHistory_pointer');
    //.end();
    //CALCULATE DATA SIZE (More Blocks Needed?)
    binary.vars.calcSize = (16 //COUNTS
        + binary.vars.DI_count
        + binary.vars.TDI_count * 5
        + (binary.vars.AI_count - 5) * 5
        + binary.vars.MeterRun_count * 16
        + binary.vars.PI_count * 13
        + binary.vars.PID_count * 9
        + binary.vars.AO_count * 5
        + binary.vars.TDO_count * 5
        + binary.vars.DO_count
        + 1 //BLOCK
    );
    //console.log('we need: %d', binary.vars.calcSize);
    //console.log('we have: %d', bufferlist.length);
    var currentBlock = binary.skip(bufferlist.length - binary.offset - 1)
        .word8('block')
        //.end()
        .vars
        .block;
    var nextBlock = currentBlock + 1;
    //console.log('next block is: %d', nextBlock);

    if (binary.vars.calcSize > bufferlist.length) {
        //console.log('requesting more...');
        return { nextBlock: nextBlock };
    }
    else
        //console.log('no more needed...');
        return;

    //return ;
}

module.exports.REQUEST = GENERAL_UPDATE_REQUEST;
module.exports.REQUESTMORE = GENERAL_UPDATE_NEEDMORE;
module.exports.RESPONSE = GENERAL_UPDATE_RESPONSE;