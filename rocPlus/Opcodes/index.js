var OPCODES = {
    6: require('./006'),        //System Configuration
    7: require('./007'),        //Read Real-Time Clock
    //8: require('./008'),          //Set Real-Time Clock
    //10: require('./010'),         //Read Configurable Opcode Point Data
    //11: require('./011'),         //Write Configurable Opcode Point Data
    //17: require('./017'),         //Login Request
    //24: require('./024'),        //Store and Forward
    //50: require('./050'),        //Request I/ O Point Position
    //100: require('./100'),       //Access User- defined Information
    //105: require('./105'),       //Request Today’s and Yesterday’s Min/ Max Values
    //108: require('./108'),       //Request History Tag and Periodic Index
    //118: require('./118'),       //Request Alarm Data
    //119: require('./119'),       //Request Event Data
    //135: require('./135'),       //Request Single History Point Data
    //136: require('./136'),       //Request Mutiple History Point Data
    //137: require('./137'),       //Request History Index for a Day
    //138: require('./138'),       //Request Daily and Periodic History for a Day
    //139: require('./139'),       //History Information Data
    //166: require('./166'),       //Set Single Point Parameters
    //167: require('./167'),       //Request Single Point Parameters
    180: require('./180'),      //Read Parameters
    181: require('./181'),      //Set Parameters
    //203: require('./203'),      //General File Transfer
    //205: require('./205'),      //Peer - to - Peer Network Messages
    //206: require('./206'),      //Read Transaction History Data
    //224: require('./224'),      //SRBX Signal
    //225: require('./225'),      //Acknowledge SRBX
    255: require('./255')       //Error Response
}

module.exports = OPCODES;