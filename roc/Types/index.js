var TYPES = {
    1: require('./001'),
    2: require('./002'),
    15: require('./015'),
    85: require('./085')
};

function getSubFromDotName(base, dottedName) {
    var out = base;
    dottedName.split('.').forEach(function (varName) {
        out = out[varName];
    });
    return out;
}

function replaceBuffer(varName, val) {
    //Get the parent variable
    var parentVar = getSubFromDotName(this.vars, varName.slice(0, varName.lastIndexOf('.')));
    //Find the last parameter (ie: '.value')
    var lastVarName = varName.slice(varName.lastIndexOf('.') + 1, varName.length);
    //Delete the last parameter (buffer is usually a child)
    delete parentVar[lastVarName];
    //Replace the value (or last) buffer with the value only
    parentVar[lastVarName] = val;
}

function readTLP(prefix) {
    var t = getSubFromDotName(this.vars, prefix + '.T');
    var p = getSubFromDotName(this.vars, prefix + '.P');
    validateType(t, p);
    var ty = TYPES[t];
    var tlp = ty.PARAMETERS[p];
    getSubFromDotName(this.vars, prefix).tlp_def = tlp;
    READ[tlp.type].call(this, prefix + '.value', tlp.bytes);
}

function writeTLP(tlp) {
    validateType(tlp.t, tlp.p);
    var tlpDef = TYPES[tlp.t].PARAMETERS[tlp.p];
    WRITE[tlpDef.type].call(this, tlp.d, tlpDef.bytes);
}

var READ = {
    'UINT8': function (varName) {
        this.word8(varName);
    },
    'UINT16': function (varName) {
        this.word16le(varName);
    },
    'UINT32': function (varName) {
        this.word32le(varName);
    },
	'AC': function (varName, bytes) {
        this.buffer(varName + '.buf', bytes);
        var val = getSubFromDotName(this.vars, varName + '.buf').toString();
        replaceBuffer.call(this, varName, val);
    },
    'FLT': function (varName) {
        this.buffer(varName + '.buf', 4);
        var val = getSubFromDotName(this.vars, varName + '.buf').readFloatLE(0);
        replaceBuffer.call(this, varName, val);
    }
};

var WRITE = {
    'UINT8': function (data) {
        this.word8(data);
    },
    'UINT16': function (data) {
        this.word16le(data);
    },
    'UINT32': function (data) {
        this.word32le(data);
    },
    'AC': function (data) {
        this.put(new Buffer(data));
    },
    'FLT': function (data) {
        this.word32le(data);
    }
};

function validateType(type, parameter) {
    if (!TYPES[type] || !TYPES[type].PARAMETERS[parameter]) {
        throw new Error('No Implementation for T.L.P "' + type + '.L.' + parameter + '" yet!');
    }
}

module.exports.TYPES = TYPES;
module.exports.readTLP = readTLP;
module.exports.READ = READ;
module.exports.getSubFromDotName = getSubFromDotName;
