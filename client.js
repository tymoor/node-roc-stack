var Put = require('put');
var Buffers = require('buffers');
var Binary = require('binary');
var roc = require('./roc');
var net = require('net');
var FB107_OPCODES = roc.FB107_OPCODES;
var TYPES = require('./TYPES');

/* TCP ROC Client interface, as it's the most usual use-case. */
function Client () {
  if (!(this instanceof Client)) return new Client();
  net.Stream.call(this);
}
require('util').inherits(Client, net.Stream);

// Causes the client instance to make a ROC request to the remote host.
// This is done by creating a new RocRequestStack instance on `this`.
//   TODO: Either pipelining or throw an error if more than one
//         instance is active at a time.
Client.prototype.request = function() {
  var req = new roc.RocRequestStack(this);
  req.clientInstance = this;
  req.request.apply(req, arguments);
  return req;
}

// Convenience function to create a new Client instance and have it
// `connect()` to the specified remote address.
Client.createClient = function(port, host) {
  var s = new Client();
  s.connect(port, host);
  return s;
}

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

function GENERAL_UPDATE_REQUEST(block) {
	if(!block)
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
	binary.vars.calcSize = (	16 //COUNTS
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
	for(var i = 0; i < 5; i++) {
		binary.buffer('AI_SYSTEM_' + (i+1) + '_eu.buf',4);
		//.end();
		rtn[0] = binary.vars;
		rtn[0]['AI_SYSTEM_' + (i+1) + '_eu'] = rtn[0]['AI_SYSTEM_' + (i+1) + '_eu']['buf'].readFloatLE(0);
	}
	//GET DI's
	for(var i = 0; i < binary.vars.DI_count; i++) {
		var prefix = 'DI_' + (i+1);
		binary.word8(prefix + '.StatusRaw');
		rtn[0] = binary.vars;
		rtn[0][prefix]['Status'] = (rtn[0][prefix]['StatusRaw'] & 1);
		rtn[0][prefix]['PointNumber'] = (rtn[0][prefix]['StatusRaw'] >> 1);
	}
	//GET TDI's
	for(var i = 0; i < binary.vars.TDI_count; i++) {
		binary.word8('TDI_' + (i+1) + '_ptnum')
			.buffer('TDI_' + (i+1) + '_eu.buf',4);
			//.end();
		rtn[0] = binary.vars;
		rtn[0]['TDI_' + (i+1) + '_eu'] = rtn[0]['TDI_' + (i+1) + '_eu']['buf'].readFloatLE(0);
	}
	//GET AI's (Minus 5 System AI's)
	for(var i = 0; i < binary.vars.AI_count-5; i++) {
		var prefix = 'AI_' + (i+1);
		binary.word8(prefix + '.PointNumber')
			.buffer(prefix + '.EU.buf',4);
			//.end();
		rtn[0] = binary.vars;
		rtn[0][prefix]['EU'] = rtn[0][prefix]['EU']['buf'].readFloatLE(0);
	}
	//GET MVS (!ONLY FOR 407!)
	//binary.skip(80).end();
		
	//GET Meter Runs
	for(var i = 0; i < binary.vars.MeterRun_count; i++) {
		var prefix = 'MeterRun_' + (i+1); 
		binary
			.buffer(prefix + '.Current_MCF_perDay.buf',4)
			.buffer(prefix + '.Current_Energy_MMBTU_perDay.buf',4)
			.buffer(prefix + '.Total_MCF_Since_ContractHour.buf',4)
			.buffer(prefix + '.MMBTU_Since_ContractHour.buf',4);
			//.end();
		rtn[0] = binary.vars;
		rtn[0][prefix]['Current_MCF_perDay'] 			= rtn[0][prefix]['Current_MCF_perDay']['buf'].readFloatLE(0);
		rtn[0][prefix]['Current_Energy_MMBTU_perDay'] 	= rtn[0][prefix]['Current_Energy_MMBTU_perDay']['buf'].readFloatLE(0);
		rtn[0][prefix]['Total_MCF_Since_ContractHour'] = rtn[0][prefix]['Total_MCF_Since_ContractHour']['buf'].readFloatLE(0);
		rtn[0][prefix]['MMBTU_Since_ContractHour'] = rtn[0][prefix]['MMBTU_Since_ContractHour']['buf'].readFloatLE(0);
		
	}
	
	//GET PI
	for(var i = 0; i < binary.vars.PI_count; i++) {
		var prefix = 'PI_' + (i+1);
		binary.word8(prefix + '.PointNumber')
			.word32le(prefix + '.RawCounts')
			.word32le(prefix + '.Rate_EU/time')
			.buffer(prefix + '.TotalToday.buf', 4);
			//.end();
		rtn[0] = binary.vars;
		rtn[0][prefix]['TotalToday'] = rtn[0][prefix]['TotalToday']['buf'].readFloatLE(0);
	}
	
	//GET PID
	for(var i = 0; i < binary.vars.PID_count; i++) {
		var prefix = 'PID_' + (i+1);
		binary.word8(prefix + '.Status')
			.buffer(prefix + '.PrimarySetpoint.buf', 4)
			.buffer(prefix + '.SecondarySetpoint.buf', 4);
			//.end();
		rtn[0] = binary.vars;
		rtn[0][prefix]['PrimarySetpoint'] = rtn[0][prefix]['PrimarySetpoint']['buf'].readFloatLE(0);
		rtn[0][prefix]['SecondarySetpoint'] = rtn[0][prefix]['SecondarySetpoint']['buf'].readFloatLE(0);
	}
	
	//GET AO
	for(var i = 0; i < binary.vars.AO_count; i++) {
		var prefix = 'AO_' + (i+1);
		binary.word8(prefix + '.PointNumber')
			.buffer(prefix + '.AO_EU.buf', 4);
			//.end();
		rtn[0] = binary.vars;
		rtn[0][prefix]['AO_EU'] = rtn[0][prefix]['AO_EU']['buf'].readFloatLE(0);
	}
	
	//GET TDO
	for(var i = 0; i < binary.vars.TDO_count; i++) {
		var prefix = 'TDO_' + (i+1);
		binary.word8(prefix + '.PointNumber')
			.buffer(prefix + '.TDO_EU.buf', 4);
			//.end();
		rtn[0] = binary.vars;
		rtn[0][prefix]['TDO_EU'] = rtn[0][prefix]['TDO_EU']['buf'].readFloatLE(0);
	}
	
	//GET DO
	for(var i = 0; i < binary.vars.DO_count; i++) {
		var prefix = 'DO_' + (i+1);
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

function TX_ERR_RESPONSE(bufferlist) {
	throw new error('TX ERR RECEIVED!');
}

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
	for(var i = 0; i < binary.vars.numberOfParams; i++) {
		var prefix = 'TLP_' + i;
		binary.word8(prefix + '.T')
			.word8(prefix + '.L')
			.word8(prefix + '.P')
			.tap(function (vars) {
				TYPES.readTLP.call(this, prefix);
			});
		rtn[0] = binary.vars;
	}
	return rtn;
}

var REQUESTS = {
	0:		GENERAL_UPDATE_REQUEST,
	//6:		GET_CONFIG_REQUEST,
	7:		NULL_REQUEST,			//GET_DATE_TIME
	// 8:		SET_DATE_TIME_REQUEST,
	// 10:		GET_OPCODE_REQUEST,
	// 11:		SET_OPCODE_REQUEST,
	// 17:		SET_OPERATOR_REQUEST,
	// 18:		LOG_EVENT_REQUEST,
	// 103:	GET_DEVICE_INFO_REQUEST,
	// 105:	GET_HISTORY_DEF_REQUEST
	// 107:	GET_HISTORY_PERIOD_REQUEST,
	// 120:	GET_POINTERS_REQUEST,
	// 121:	GET_ALARMS_PTR_REQUEST,
	// 122:	GET_EVENTS_PTR_REQUEST,
	// 123:	GET_TEMPLATE_REQUEST,
	// 126:	GET_HISTORY_HOUR_REQUEST,
	// 128:	GET_HISTORY_DAYHOUR_DTM_REQUEST,
	// 130:	GET_HISTORY_DAYHOUR_PTR_REQUEST,
	// 131:	AUDIT_EVENTS_PTR_REQUEST,
	// 132:	CLEAR_EVENTS_PTR_REQUEST,
	// 133:	GET_EVENTS_COUNT_REQUEST,
	// 148:	READ_240B_PTR_REQUEST,
	// 165:	SET_HISTORY_CONFIG_REQUEST,
	// 166:	SET_CONTIG_PARAMS_REQUEST,
	// 167:	GET_CONTIG_PARAMS_REQUEST,
	180:	GET_PARAMS_REQUEST,
	// 181:	SET_PARAMS_REQUEST,
	// 224:	SEND_RBX_REQUEST,
	// 225:	ACK_RBX_REQUEST,
	// 255:	TX_ERR_REQUEST
};

var RESPONSES = {
	0:		GENERAL_UPDATE_RESPONSE,
	//6:		GET_CONFIG_RESPONSE,
	7:		GET_DATE_TIME_RESPONSE,
	// 8:		SET_DATE_TIME_RESPONSE,
	// 10:		GET_OPCODE_RESPONSE,
	// 11:		SET_OPCODE_RESPONSE,		
	// 17:		SET_OPERATOR_RESPONSE,
	// 18:		LOG_EVENT_RESPONSE,
	// 103:	GET_DEVICE_INFO_RESPONSE,
	// 105:	GET_HISTORY_DEF_RESPONSE,
	// 107:	GET_HISTORY_PERIOD_RESPONSE,
	// 120:	GET_POINTERS_RESPONSE,
	// 121:	GET_ALARMS_PTR_RESPONSE,
	// 122:	GET_EVENTS_PTR_RESPONSE,
	// 123:	GET_TEMPLATE_RESPONSE,
	// 126:	GET_HISTORY_HOUR_RESPONSE,
	// 128:	GET_HISTORY_DAYHOUR_DTM_RESPONSE,
	// 130:	GET_HISTORY_DAYHOUR_PTR_RESPONSE,
	// 131:	AUDIT_EVENTS_PTR_RESPONSE,
	// 132:	CLEAR_EVENTS_PTR_RESPONSE,
	// 133:	GET_EVENTS_COUNT_RESPONSE,
	// 148:	READ_240B_PTR_RESPONSE,
	// 165:	SET_HISTORY_CONFIG_RESPONSE,
	// 166:	SET_CONTIG_PARAMS_RESPONSE,
	// 167:	GET_CONTIG_PARAMS_RESPONSE,
	180:	GET_PARAMS_RESPONSE,
	// 181:	SET_PARAMS_RESPONSE,
	// 224:	SEND_RBX_RESPONSE,
	// 225:	ACK_RBX_RESPONSE,
	255:	TX_ERR_RESPONSE					
};

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
	binary.vars.calcSize = (	16 //COUNTS
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
	var currentBlock = binary.skip(bufferlist.length-binary.offset-1)
		.word8('block')
		//.end()
		.vars
		.block;
	var nextBlock = currentBlock + 1;
	//console.log('next block is: %d', nextBlock);
		
	if (binary.vars.calcSize > bufferlist.length) {
		//console.log('requesting more...');
		return {nextBlock: nextBlock };
	}
	else
		//console.log('no more needed...');
		return ;
	
	//return ;
}

var NEEDMORE = {
	0:		GENERAL_UPDATE_NEEDMORE,
	//6:	GET_CONFIG_REQUEST,
	7:		function() {return ;},			//GET_DATE_TIME
	// 8:	SET_DATE_TIME_REQUEST,
	// 10:	GET_OPCODE_REQUEST,
	// 11:	SET_OPCODE_REQUEST,
	// 17:	SET_OPERATOR_REQUEST,
	// 18:	LOG_EVENT_REQUEST,
	// 103:	GET_DEVICE_INFO_REQUEST,
	// 105:	GET_HISTORY_DEF_REQUEST
	// 107:	GET_HISTORY_PERIOD_REQUEST,
	// 120:	GET_POINTERS_REQUEST,
	// 121:	GET_ALARMS_PTR_REQUEST,
	// 122:	GET_EVENTS_PTR_REQUEST,
	// 123:	GET_TEMPLATE_REQUEST,
	// 126:	GET_HISTORY_HOUR_REQUEST,
	// 128:	GET_HISTORY_DAYHOUR_DTM_REQUEST,
	// 130:	GET_HISTORY_DAYHOUR_PTR_REQUEST,
	// 131:	AUDIT_EVENTS_PTR_REQUEST,
	// 132:	CLEAR_EVENTS_PTR_REQUEST,
	// 133:	GET_EVENTS_COUNT_REQUEST,
	// 148:	READ_240B_PTR_REQUEST,
	// 165:	SET_HISTORY_CONFIG_REQUEST,
	// 166:	SET_CONTIG_PARAMS_REQUEST,
	// 167:	GET_CONTIG_PARAMS_REQUEST,
	180:	function() {return ;},
	// 181:	SET_PARAMS_REQUEST,
	// 224:	SEND_RBX_REQUEST,
	// 225:	ACK_RBX_REQUEST,
	// 255:	TX_ERR_REQUEST
};

module.exports.createClient = Client.createClient;
module.exports.REQUESTS = REQUESTS;
module.exports.RESPONSES = RESPONSES;
module.exports.NEEDMORE = NEEDMORE;
module.exports.Client = Client;