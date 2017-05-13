var Name = 'Digital Input';

var PARAMETERS = {
	0:  {r: true,	w: true,	type: 'AC',		bytes: 10,	description: 'Point Tag Identification' }, 
	1:  {r: true,	w: true,	type: 'UINT8',	bytes: 1,	description: 'Filter' },
	2:  {r: true,	w: true,	type: 'UNIT8',	bytes: 1,	description: 'Status' },
	3:  {r: true,	w: true,	type: 'BIN',	bytes: 1, 	description: 'Mode',
		sub: {
				InvertEnable:	0x01,
				LatchEnable:	0x02,
				FilterInterval:	0x04,
				TDIEnable:		0x08,
				AlarmEnable:	0x10,
				RBXOnClear:		0x20,
				RBXOnSet:		0x40,
				ManualMode:		0x80
			}
		},
	4:	{r: true,	w: false,	type: 'BIN',	bytes: 1,	description: 'Alarm Code',
		sub: {
                TDILowAlarm:        0x01,
                TDILowLowAlarm:     0x02,
                TDIHighAlarm:       0x04,
                TDIHighHighAlarm:   0x08,
                TDIRateAlarm:       0x10,
                StatusChange:       0x20,
                PointFail:          0x40,
                ManualMode:         0x80
			}
		},
	5:	{r: true,	w: true,	type: 'UINT32',	bytes: 4,	description: 'Accumulated Values' },
	6:	{r: true,	w: true,	type: 'UINT32',	bytes: 4,	description: 'On counter (50 millisecond interval)' },
	7:	{r: true,	w: true,	type: 'UINT32',	bytes: 4,	description: 'Off counter (50 millisecond interval)' },
	8:	{r: true,	w: true,	type: 'INT16',	bytes: 2,	description: '0% pulse width (ROC300-Series and FloBoss 407)' },
	9:	{r: true,	w: true,	type: 'INT16',	bytes: 2,	description: '100% pulse width (ROC300-Series and FloBoss 407)' },
	10:	{r: true,	w: true,	type: 'UNIT16',	bytes: 2,	description: 'Maximum time between pulses / maximum count (ROC300-Series and FloBoss 407)' },
	11:	{r: true,	w: true,	type: 'AC',		bytes: 10,	description: 'Units (ROC300-series and FloBoss 407)' },
	12:	{r: true,	w: true,	type: 'UINT16',	bytes: 2,	description: 'Scan Period (50 millisecond intervals)' },
	13:	{r: true,	w: true,	type: 'FL',		bytes: 4,	description: 'Low Reading (Zero) Engineering Units (EU)' },
	14:	{r: true,	w: true,	type: 'FL',		bytes: 4,	description: 'High Reading (Span) EU (ROC300-series and FloBoss 407)' },
	15:	{r: true,	w: true,	type: 'FL',		bytes: 4,	description: 'Low Alarm EU (ROC300-series and FloBoss 407)' },
	16:	{r: true,	w: true,	type: 'FL',		bytes: 4,	description: 'High Alarm EU (ROC300-series and FloBoss 407)' },
	17:	{r: true,	w: true,	type: 'FL',		bytes: 4,	description: 'Low Low Alarm EU (ROC300-series and FloBoss 407)' },
	18:	{r: true,	w: true,	type: 'FL',		bytes: 4,	description: 'Hi Hi Alarm EU (ROC300-series and FloBoss 407)' },
	19:	{r: true,	w: true,	type: 'FL',		bytes: 4,	description: 'Rate Alarm EU (ROC300-series and FloBoss 407)' },
	20:	{r: true,	w: true,	type: 'FL',		bytes: 4,	description: 'Alarm Deadband (ROC300-series and FloBoss 407)' },
	21:	{r: true,	w: true,	type: 'FL',		bytes: 4,	description: 'EU Value (ROC300-series and FloBoss 407)' },
	22:	{r: true,	w: false,	type: 'UINT16',	bytes: 2,	description: 'TDI Count (ROC300-series and Floboss 407)' }
	
};

module.exports.Name = Name;
module.exports.PARAMETERS = PARAMETERS;