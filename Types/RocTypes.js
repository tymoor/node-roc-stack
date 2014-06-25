
function getSubFromDotName(base, dottedName) {
	var out = base;
	dottedName.split('.').forEach(function(varName) {
		out = out[varName];
	});
	return out;
}

var READ = {
	'UINT8':	function(varName) {
					this.word8(varName);
				},
	'AC':		function(varName, bytes) {
					this.buffer(varName + '.buf', bytes);
					getSubFromDotName(this.vars, [varName]) = getSubFromDotName(this.vars, varName + '.buf').toString();
				}
};

var TYPES = {
	//15: require('./15.js');
};

module.exports.TYPES = TYPES;

getBaseVar(null, 'this.test');