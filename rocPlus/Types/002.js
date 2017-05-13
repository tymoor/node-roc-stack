var Name = 'Digital Output';

var PARAMETERS = {
    0: { r: true, w: true, type: 'AC', bytes: 10, description: 'Point Tag Identification' },
    1: { r: true, w: true, type: 'UINT16', bytes: 1, description: 'Time On (50ms Intervals)' },
    2: { r: true, w: true, type: 'UNIT8', bytes: 1, description: 'Status' },
    3: {
        r: true, w: true, type: 'BIN', bytes: 1, description: 'Mode',
        sub: {
            Momentary:      0x01,
            Toggle:         0x02,
            Reserved:       0x04,
            TDOEnabled:     0x08,
            ClearOnReset:   0x10,
            ManualMode:     0x80
        }
    },
    4: {
        r: true, w: false, type: 'BIN', bytes: 1, description: 'Alarm Code',
        sub: {
            PointFail:  0x40,
            ManualMode: 0x80
        }
    },
    5: { r: true, w: true, type: 'UINT32', bytes: 4, description: 'Accumulated Values' },
    6: { r: true, w: true, type: 'AC', bytes: 10, description: 'Units' },
    7: { r: true, w: true, type: 'UINT16', bytes: 2, description: 'Cycle Time' },
    8: { r: true, w: true, type: 'INT16', bytes: 2, description: '0% count' },
    9: { r: true, w: true, type: 'INT16', bytes: 2, description: '100% count' },
    10: { r: true, w: true, type: 'FL', bytes: 4, description: 'Low Reading EU' },
    11: { r: true, w: true, type: 'FL', bytes: 4, description: 'High Reading EU' },
    12: { r: true, w: true, type: 'FL', bytes: 2, description: 'EU Value' },
    13: {
        r: true, w: true, type: 'BIN', bytes: 1, description: 'Alarm Mode',
        sub: {
            RBXOnSet: 0x40
        }
    },
    14: {
        r: true, w: true, type: 'BIN', bytes: 1, description: 'Scanning Mode',
        sub: {
            Manual: 0x01
        }
    },
    15: { r: true, w: true, type: 'UINT8', bytes: 1, description: 'Manual Status' },
    16: { r: true, w: true, type: 'UINT8', bytes: 1, description: 'Physical Status' }}

};

module.exports.Name = Name;
module.exports.PARAMETERS = PARAMETERS;