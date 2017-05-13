var StreamStack = require('stream-stack').StreamStack;
var Put = require('put');
var Buffers = require('buffers');
var Binary = require('binary');
var inherits = require('util').inherits;
//var client = require('../client');
var OPCODES = require('./Opcodes');
var slice = Array.prototype.slice;
var crc = require('crc');
var Q = require('q');

// The byte length of the ROC Protocol header.
const ROC_HEADER_LENGTH = 6;
const ROC_CRC_LENGTH = 2;

//REQUEST STRUCTURE (TO-FROM):
//ROC UNIT		: 1 BYTE	: [240]
//ROC GROUP		: 1 BYTE	: [240]
//HOST UNIT		: 1 BYTE	: [1]
//HOST GROUP	: 1 BYTE	: [0]
//OPCODE		: 1 BYTE	: [7]		(TIME_AND_DATE)
//DATA LENGTH	: 1 BYTE	: [0]	
//DATA			: X BYTES	: []
//CRC			: 2 BYTES	: [LSB,MSB]

// Each of the function codes has a potentially different body payload
// and potentially different parameters to send. Each function code needs
// a 'request' and 'response' parser in the "client.js" and "server.js" files.
//exports.FB107_OPCODES = {
//    GENERAL_UPDATE: 0,
//    GET_CONFIG: 6,
//    GET_DATE_TIME: 7,
//    SET_DATE_TIME: 8,
//    GET_OPCODE: 10,
//    SET_OPCODE: 11,
//    SET_OPERATOR: 17,
//    LOG_EVENT: 18,
//    GET_DEVICE_INFO: 103,
//    GET_HISTORY_DEF: 105,
//    GET_HISTORY_PERIOD: 107,
//    GET_POINTERS: 120,
//    GET_ALARMS_PTR: 121,
//    GET_EVENTS_PTR: 122,
//    GET_TEMPLATE: 123,
//    GET_HISTORY_HOUR: 126,
//    GET_HISTORY_DAYHOUR_DTM: 128,
//    GET_HISTORY_DAYHOUR_PTR: 130,
//    AUDIT_EVENTS_PTR: 131,
//    CLEAR_EVENTS_PTR: 132,
//    GET_EVENTS_COUNT: 133,
//    READ_240B_PTR: 148,
//    SET_HISTORY_CONFIG: 165,
//    SET_CONTIG_PARAMS: 166,
//    GET_CONTIG_PARAMS: 167,
//    GET_PARAMS: 180,
//    SET_PARAMS: 181,
//    SEND_RBX: 224,
//    ACK_RBX: 225,
//    TX_ERR: 255
//};

function RocRequestStack(stream) {
    StreamStack.call(this, stream, {
        data: this._onData
    });
    this.bufferlist = Buffers();
    if (this.stream._reqNum) {
        this.stream._reqNum++;
    } else {
        this.stream._reqNum = 1;
    }
}
inherits(RocRequestStack, StreamStack);
exports.RocRequestStack = RocRequestStack;

//ROC 'Unit' to poll - important for Serial, but not so much for TCP
RocRequestStack.prototype.rocUnitIdentifier = 240;
RocRequestStack.prototype.rocGroupIdentifier = 240;
RocRequestStack.prototype.hostUnitIdentifier = 1;
RocRequestStack.prototype.hostGroupIdentifier = 0;

// Make a ROC request for a given 'opCode'.
RocRequestStack.prototype.request = function (opCode) {
    this.deferreds = [];
    this.promises = [];
    //if (!client.REQUESTS[opCode]) {
    if (!OPCODES[opCode].REQUEST) {
        throw new Error('"OPCODES[' + opCode + '].REQUEST" is not implemented!');
    }
    this.opCode = opCode;
    var argsLen = arguments.length;
    if (argsLen > 1) {
        var callback = arguments[argsLen - 1];
        if (typeof (callback) == 'function') {
            this.on('error', callback);
            this.on('response', function (res) {
                callback(null, res);
            });
        } else { callback = null; }
    }
    var args = slice.call(arguments, 1, argsLen - (callback ? 1 : 0));
	/* this.clientInstance = client_inst;
	var args = slice.call(arguments, 2, argsLen); //skip 2 'known' arguments */
    try {
        //var pdu = client.REQUESTS[opCode].apply(this, args);
        var pdu = OPCODES[opCode].REQUEST.apply(this, args);
    } catch (e) {
        this.emit('error', e);
        return false;
    }
    var buf = Put()
        .word8(this.rocUnitIdentifier)
        .word8(this.rocGroupIdentifier)
        .word8(this.hostUnitIdentifier)
        .word8(this.hostGroupIdentifier)
        .word8(opCode)
        .word8(pdu.length)
        .put(pdu)
        .buffer();
    //Calculate CRC16 Checksum
    var checksum = new crc.CRC16();
    checksum.update(String.fromCharCode.apply(null, new Uint8Array(buf)));
    buf = Put()
        .put(buf)
        .word16le(checksum.checksum())
        .buffer();
    return this.stream.write(buf);
}

RocRequestStack.prototype._onData = function (chunk) {
    if (chunk) { // && !this.requestingMore) {
        this.bufferlist.push(chunk);
        //console.log(chunk);
    }
    /* else if {chunk && this.requestingMore) {
      return chunk;
    } */

    if (!this.responseHeader && this.bufferlist.length >= ROC_HEADER_LENGTH) {
        this.responseHeader = readHeader(this.bufferlist);
        // Re-check the bufferlist to see if we have the rest of the response already
        this._onData();
    } else if (this.responseHeader && this.bufferlist.length == (ROC_HEADER_LENGTH + this.responseHeader.dataLength + ROC_CRC_LENGTH)) {
        // We have the complete response - read header and validate the CRC.
        var receivedCrc = Binary.parse(this.bufferlist).skip(ROC_HEADER_LENGTH).skip(this.responseHeader.dataLength).word16le('crc').vars.crc;
        var checksum = new crc.CRC16();
        //var checksumBuffer = this.bufferlist.take(this.bufferlist.length - ROC_CRC_LENGTH);
        var checksumBuffer = this.bufferlist.slice(0, this.bufferlist.length - ROC_CRC_LENGTH);
        checksum.update(String.fromCharCode.apply(null, new Uint8Array(checksumBuffer)));
        if (checksum.checksum() !== receivedCrc)
            throw new error('bad checksum');
        //console.log('calculated: %d', checksum.checksum());
        //console.log('received: %d', receivedCrc);
        //console.log(this.responseHeader);

        if (!this.dataBufferList) {
            //console.log('there was no dataBufferList');
            this.dataBufferList = Buffers();
        }
        //this.bufferlist.advance(ROC_HEADER_LENGTH);
        //Remove 1 extra byte for 'BLOCK' code.
        //this.dataBufferList.push(this.bufferlist.take(this.bufferlist.length - ROC_CRC_LENGTH - 1));
        //var blockBytes = 0;
        if (this.dataBufferList.length > 0) {
            this.dataBufferList.splice(this.dataBufferList.length - 1, 1);
            //blockBytes = 1;
        }
        this.dataBufferList.push(this.bufferlist.slice(ROC_HEADER_LENGTH, this.bufferlist.length - ROC_CRC_LENGTH));
        //console.log('dataBuffer length is: %d', this.dataBufferList.length);

        if (this.responseHeader.opCode == 255) {
            // An exception was returned as the response!
            var err = 'Response contained an error code\r\n';
            //var out = client.RESPONSES[this.responseHeader.opCode].call(this, this.dataBufferList);
            var out = OPCODES[this.responseHeader.opCode].REQUEST.call(this, this.dataBufferList);
            console.log(out);
            this.emit('error', err);
            this.cleanup();
        }
        else {
            //See if we need more data?	
            finishRequest(this);
            Q.all(this.promises)
                .then(function (results) {
                    //all the returned references are the same, just take the first one...
                    var ref = results[0];
                    //if (!client.RESPONSES[ref.responseHeader.opCode]) {
                    if (!OPCODES[ref.responseHeader.opCode].RESPONSE) {
                        return ref.emit('error', new Error('"OPCODES[' + ref.responseHeader.opCode + '].RESPONSE" is not implemented!'));
                    }
                    try {
                        var response = { Header: ref.responseHeader };
                        delete response.Header.dataLength;
                        //Parse the response!
                        //response.Values = client.RESPONSES[ref.responseHeader.opCode].call(ref, ref.dataBufferList);
                        response.Values = OPCODES[ref.responseHeader.opCode].RESPONSE.call(ref, ref.dataBufferList);
                    } catch (e) {
                        return ref.emit('error', e);
                    }
                    //delete ref._resFunctionCode;

                    ref.emit('response', response);
                    this.cleanup();
                });
        }
        //this.cleanup();
    }
}

function finishRequest(ref) {
    //add a new promise to the queue
    var deferred = Q.defer();
    ref.promises.push(deferred.promise);
    ref.deferreds.push(deferred);
    //do we need more data?
    var needMore = function () { return; };
    if (OPCODES[ref.opCode].REQUESTMORE) {
        //needMore = client.NEEDMORE[ref.opCode].call(ref, ref.dataBufferList);
        needMore = OPCODES[ref.opCode].REQUESTMORE.call(ref, ref.dataBufferList);
    }
    //TODO: does this ever get hit???
    if (needMore && needMore.nextBlock) {
        //set ref back to starting state
        ref.bufferlist = Buffers();
        delete ref.responseHeader;

        var args = [ref.opCode, needMore.nextBlock];
        ref.request.apply(ref, args);
    }
    else {
        //resolve all the deferred promises!
        for (var i = 0; i < ref.deferreds.length; i++) {
            ref.deferreds.pop().resolve(ref);
        }
    }
    //return ref;
};

//RESPONSE STRUCTURE: (TO-FROM)
//HOST UNIT		: 1 BYTE
//HOST GROUP	: 1 BYTE
//ROC UNIT		: 1 BYTE
//ROC GROUP		: 1 BYTE
//OPCODE		: 1 BYTE
//DATA LENGTH	: 1 BYTE
//DATA			: X BYTES
//CRC			: 2 BYTES (LSB, MSB)

/* function RocResponseStack(stream) {
  StreamStack.call(this, stream, {
    data: this._onData
  });
  this.bufferlist = new BufferList();
}
inherits(RocResponseStack, StreamStack);
exports.RocResponseStack = RocResponseStack;

RocResponseStack.prototype._onData = function(chunk) {
  if (chunk) {
    this.bufferlist.push(chunk);
    //console.log(chunk);
  }
  if (!this.requestHeader && this.bufferlist.length >= ROC_HEADER_LENGTH) {
    this.requestHeader = readHeader(this.bufferlist);
    //console.log(this.requestHeader);
    // Re-check the bufferlist to see if we have the rest of the request
    // already (we probably do, it's usually sent in the same packet).
    this._onData();
  } else if (this.requestHeader && this.requestHeader.opCode != 255 && this.bufferlist.length == (this.requestHeader.dataLength + ROC_CRC_LENGTH)) {
    // We have the complete request.
    if (!server.REQUESTS[this.requestHeader.opCode]) {
      return this.emit('error', new Error('"REQUESTS['+this.requestHeader.opCode+']" in "server.js" is not implemented!'));
    }
    try {
      this.request = server.REQUESTS[this.requestHeader.opCode].call(this, this.bufferlist);
    } catch(e) {
      return this.emit('error', e);
    }
    this.request.functionCode = this.requestHeader.opCode;
    for (var key in this.requestHeader) {
      this.request[key] = this.requestHeader[key];
    }
    delete this.request.length; 
    this.bufferlist.advance(this.requestHeader.length-2);
    //console.log('bufferlist.length: ' + this.bufferlist.length);
    this._gotRequest = true;
    this.emit('request', this.request);
  }
} */

function readHeader(bufferlist) {
    return Binary.parse(bufferlist)
        .word8('toUnit')
        .word8('toGroup')
        .word8('fromUnit')
        .word8('fromGroup')
        .word8('opCode')
        .word8('dataLength')
        .vars;
}
exports.readHeader = readHeader;