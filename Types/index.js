
function getSubFromDotName(base, dottedName) {
	var out = base;
	dottedName.split('.').forEach(function(varName) {
		out = out[varName];
	});
	return out;
}

function replaceBuffer(varName, val) {
	//Get the parent variable
	var parentVar = getSubFromDotName(this.vars, varName.slice(0, varName.lastIndexOf('.')));
	//Find the last parameter (ie: '.value')
	var lastVarName = varName.slice(varName.lastIndexOf('.')+1, varName.length);
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

var READ = {
	'UINT8':	function(varName) {
					this.word8(varName);
				},
	'UINT16':	function(varName) {
					this.word16le(varName);
				},
	'AC':		function(varName, bytes) {
					this.buffer(varName + '.buf', bytes);
					var val = getSubFromDotName(this.vars, varName + '.buf').toString();
					replaceBuffer.call(this, varName, val);
				},
	'FLT':		function(varName) {
					this.buffer(varName + '.buf', 4);
					var val = getSubFromDotName(this.vars, varName + '.buf').readFloatLE(0);
					replaceBuffer.call(this, varName, val);
				}
};

var TYPES = {
	1:	require('./1.js'),
	15: require('./15.js'),
	85: require('./85.js')
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
