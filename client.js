var roc = require('./roc/roc');
var rocPlus = require('./rocPlus/rocPlus')
var net = require('net');
var myRoc;

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
  var req = new myRoc.RocRequestStack(this);
  req.clientInstance = this;
  req.request.apply(req, arguments);
  return req;
}

// Convenience function to create a new Client instance and have it
// `connect()` to the specified remote address.
Client.createClient = function (port, host, rocType) {
    switch (rocType) {
        case "roc":
            myRoc = roc;
            break;
        default:
            myRoc = rocPlus;
    }
  var s = new Client();
  s.connect(port, host);
  return s;
}

module.exports.createClient = Client.createClient;
module.exports.Client = Client;
