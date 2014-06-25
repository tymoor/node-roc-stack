var Name = 'HART Points';

var PARAMETERS = {
	0:		{ r: true,	w: true,	type: 'AC',		bytes: 10,	description: 'Channel Tag' },
	1:		{ r: true,	w: true,	type: 'UINT8',	bytes: 1,	description: 'Channel I/O Mode' },
	
	4:		{ r: true,	w: false,	type: 'UINT8',	bytes: 1,	description: 'ROC Address' },
	5:		{ r: true,	w: true,	type: 'UINT8',	bytes: 1,	description: 'ROC Address' },
	
	25:		{ r: true,	w: true,	type: 'AC',		bytes: 10,	description: 'Device 1 Tag' },
	32:		{ r: true,	w: false,	type: 'FLT',	bytes: 4,	description: 'Device 1 PV' },
	35:		{ r: true,	w: false,	type: 'FLT',	bytes: 4,	description: 'Device 1 SV' },
	38:		{ r: true,	w: false,	type: 'FLT',	bytes: 4,	description: 'Device 1 TV' },
	41:		{ r: true,	w: false,	type: 'FLT',	bytes: 4,	description: 'Device 1 QV' },
	
	72:		{ r: true,	w: true,	type: 'AC',		bytes: 10,	description: 'Device 2 Tag' },
	79:		{ r: true,	w: false,	type: 'FLT',	bytes: 4,	description: 'Device 2 PV' },
	82:		{ r: true,	w: false,	type: 'FLT',	bytes: 4,	description: 'Device 2 SV' },
	85:		{ r: true,	w: false,	type: 'FLT',	bytes: 4,	description: 'Device 2 TV' },
	88:		{ r: true,	w: false,	type: 'FLT',	bytes: 4,	description: 'Device 2 QV' },
	
	119:	{ r: true,	w: true,	type: 'AC',		bytes: 10,	description: 'Device 3 Tag' },
	126:	{ r: true,	w: false,	type: 'FLT',	bytes: 4,	description: 'Device 3 PV' },
	129:	{ r: true,	w: false,	type: 'FLT',	bytes: 4,	description: 'Device 3 SV' },
	132:	{ r: true,	w: false,	type: 'FLT',	bytes: 4,	description: 'Device 3 TV' },
	135:	{ r: true,	w: false,	type: 'FLT',	bytes: 4,	description: 'Device 3 QV' },
	
	166:	{ r: true,	w: true,	type: 'AC',		bytes: 10,	description: 'Device 4 Tag' },
	173:	{ r: true,	w: false,	type: 'FLT',	bytes: 4,	description: 'Device 4 PV' },
	176:	{ r: true,	w: false,	type: 'FLT',	bytes: 4,	description: 'Device 4 SV' },
	179:	{ r: true,	w: false,	type: 'FLT',	bytes: 4,	description: 'Device 4 TV' },
	182:	{ r: true,	w: false,	type: 'FLT',	bytes: 4,	description: 'Device 4 QV' },
	
	213:	{ r: true,	w: true,	type: 'AC',		bytes: 10,	description: 'Device 5 Tag' },
	220:	{ r: true,	w: false,	type: 'FLT',	bytes: 4,	description: 'Device 5 PV' },
	223:	{ r: true,	w: false,	type: 'FLT',	bytes: 4,	description: 'Device 5 SV' },
	226:	{ r: true,	w: false,	type: 'FLT',	bytes: 4,	description: 'Device 5 TV' },
	229:	{ r: true,	w: false,	type: 'FLT',	bytes: 4,	description: 'Device 5 QV' },
	
};

module.exports.Name = Name;
module.exports.PARAMETERS = PARAMETERS;