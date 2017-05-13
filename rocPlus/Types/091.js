var PARAMETERS = {
	0:		{ r: true, w: true, type: 'UINT8', bytes: 1, description: 'ROC Address' },
	1:		{ r: true, w: true, type: 'UINT8', bytes: 1, description: 'ROC Group' },
	2:		{ r: true, w: true, type: 'AC', bytes: 20, description: 'Station Name' },
    3:      { r: true, w: false, type: 'AC', bytes: 20, description: 'Part Number and Version' },
	4:		{ r: true, w: false, type: 'AC', bytes: 20, description: 'Time Created' },
	5:		{ r: true, w: false, type: 'AC', bytes: 20, description: 'Manufacturer ID' },
	6:		{ r: true, w: false, type: 'AC', bytes: 20, description: 'Product Description' },
    7:      { r: true, w: false, type: 'UINT32', bytes: 1, description: 'Serial Number' },
    8:      { r: true, w: false, type: 'UINT16', bytes: 1, description: 'Maximum Events' },
    9:      { r: true, w: false, type: 'UINT16', bytes: 1, description: 'Maximum Alarms' },
    10:     { r: true, w: false, type: 'UINT8', bytes: 1, description: 'Maximum PIDs' },

	11:		{ r: true, w: false, type: 'AC', bytes: 20, description: 'Version Name - Part Number' },
	12:		{ r: true, w: false, type: 'AC', bytes: 20, description: 'Manufacturing Identification' },
	13:		{ r: true, w: false, type: 'AC', bytes: 20, description: 'Time Created' },
	14:		{ r: true, w: false, type: 'AC', bytes: 20, description: 'Unit Serial Number' },
	15:		{ r: true, w: false, type: 'AC', bytes: 20, description: 'Customer Name' },
	16:		{ r: true, w: false, type: 'UINT8', bytes: 1, description: 'Maximum PIDs' },
	17:		{ r: true, w: false, type: 'UINT8', bytes: 1, description: 'Maximum AGA Meter Runs' },
	
	18:		{ r: true, w: false, type: 'UINT8', bytes: 1, description: 'Maximum Tanks' },
	19:		{ r: true, w: false, type: 'UINT8', bytes: 1, description: 'FSTs Possible' },
	20:		{ r: true, w: false, type: 'UINT8', bytes: 1, description: 'Not Used' },
	21:		{ r: true, w: false, type: 'UINT8', bytes: 1, description: 'Not Used' },
	22:		{ r: true, w: false, type: 'FLP', bytes: 4, description: 'MPU Loading' },
	23:		{ r: true, w: false, type: 'UINT8', bytes: 1, description: 'Not Used' },
	24:		{ r: true, w: false, type: 'UINT16', bytes: 2, description: 'Type of ROC' },
	
	25:		{ r: true, w: true, type: 'UINT8', bytes: 1, description: 'Units Flag',
				interpret: { 0: 'English', 1: 'Metric (kPA)'}
			}
	
};

module.exports.PARAMETERS = PARAMETERS;