var Q = require('q');
var c = require('./client').createClient(4003, '10.10.10.10');
var util = require('util');
var colors = require('colors');

function requestPromise(opCode, arg) {
    var deferred = Q.defer();
    console.log('-------------'.cyan);
    c.request(opCode, arg)
        .on('response', function (response) {
            console.log('%s'.green, util.inspect(response, { depth: null }));
            deferred.resolve(response);
        })
        .on('error', function (error) {
            console.log('got an error:\r\n%s'.red, error);
            deferred.reject(error);
        });

    return deferred.promise;
}

function test() {
    requestPromise(7)
        .timeout(30000, "Could not connect.")
        .then(function () {
            return requestPromise(6);
        })
        .then(function () {
            //return requestPromise(180, [{t:15,l:0,p:2}, {t:15,l:0,p:13}, {t:15,l:0,p:24}, {t:15,l:0,p:25} ]);
            //return requestPromise(180, [{ t: 91, l: 0, p: 0 }, { t: 91, l: 0, p: 1 },{ t: 91, l: 0, p: 2 }]);
        })
        //.then(function () {
        //    //return requestPromise(180, [{t:15,l:0,p:2}, {t:15,l:0,p:13}, {t:15,l:0,p:24}, {t:15,l:0,p:25} ]);
        //    return requestPromise(181, [{ t: 91, l: 0, p: 2, d: 'DUKE_JONES          ' }]);
        //})
        .then(function () {
            //return requestPromise(180, [{t:15,l:0,p:2}, {t:15,l:0,p:13}, {t:15,l:0,p:24}, {t:15,l:0,p:25} ]);
            //return requestPromise(180, [{ t: 91, l: 0, p: 3 }]);
        })
        .finally(function () {
            c.end();
        })
        .done();
}

console.log('you gave me: %s', util.inspect(process.argv));

test();
