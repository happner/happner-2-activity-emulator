var path = require('path')
  , uuid = require('uuid')
  , spawn = require('child_process').spawn
  , sep = require('path').sep
  , async = require('async')
  , Mesh = require('happner-2')
  , Client = require('./lib/client')
;

function Emulator(config){

  if (!config) config = {};

  if (!config.meshCount) config.meshCount = 1;

  if (!config.clientCount) config.clientCount = 1;

  if (!config.eventsPerSec) config.eventsPerSec = 1;

  if (!config.eventTypes) config.eventTypes = [1,2,3,4,5,6,7,8,9,10];

  if (!config.reportMod) config.reportMod = 100;

  if (!config.username) config.username = '_ADMIN';

  if (!config.password) config.password = 'happn';

  this.__config = config;

  this.__report = {};

  this.__clients = {};

  this.__happnerClients = {};

  this.__meshes = {};
}

Emulator.create = function(config){

  return new Emulator(config);
};

Emulator.prototype.message = function(message, override){

  if (!override && this.__config.silent) return;

  console.log(message);
};

Emulator.prototype.initializeHappnerClient = function(options, callback){

  var _this = this;

  var client = new Mesh.MeshClient({port: options.port});

  client.login({
    username: options.username,
    password: options.password
  }).then(function(e) {

    if (e) return callback(e);

    if (!_this.__happnerClients[options.port]) _this.__happnerClients[options.port] = [];

    _this.__happnerClients[options.port].push(client);

    callback();
  })
};

Emulator.prototype.initializeClient = function(port, callback){

  var _this = this;

  var client = Client.create({port:port, username:'_ADMIN', password:'happn'});

  _this.message('attaching:::');

  client.attach(_this.__config, function(e){

    _this.message('attached:::');

    if (e) return callback(e);

    if (!_this.__clients[port]) _this.__clients[port] = [];

    _this.__clients[port].push(client);

    callback();
  });
};

Emulator.prototype.initialize = function(callback){

  var _this = this;

  var libFolder = __dirname + sep + 'lib' + sep;

  async.timesSeries(_this.__config.meshCount, function(time, timeCB){

    var port = 55000 + time;

    // spawn remote mesh in another process
    var remote = spawn('node', [libFolder + 'mesh.js', port.toString()]);

    remote.stdout.on('data', function (data) {

      _this.message('OUTPUT:::' + data.toString());

      if (data.toString().match(/ERROR/)) return timeCB(new Error('failed to start mesh on port: ' + port.toString()));

      if (data.toString().match(/READY/)) {

        _this.__meshes[port] = remote;

        _this.initializeHappnerClient({port:port, username:'_ADMIN', password:'happn'}, function(e){

          if (e) return timeCB(e);

          async.timesSeries(_this.__config.clientCount, function(time, clientTimeCB){

            console.log('init cli:::');
            _this.initializeClient(port, clientTimeCB);

          }, function(e){

            console.log('init mesh:::');
            timeCB(e);
          });

        });
      }
    });

  }, function(e){

    console.log('calling back:::', e);
    callback(e);
  });
};

Emulator.prototype.start = function(eventsPerSec, callback, forcedError){

  var _this = this;

  try{

    if (typeof eventsPerSec == 'function') {

      forcedError = callback;
      callback = eventsPerSec;
      eventsPerSec = _this.__config.eventsPerSec;
    }

    if (forcedError) _this.__config.forcedError = forcedError;

    if (_this.__stopped == false) return callback(new Error('already running'));

    if (!eventsPerSec) eventsPerSec = _this.__config.eventsPerSec;

    else _this.__config.eventsPerSec = eventsPerSec;

    _this.__report.started = Date.now();

    _this.__report.errored = false;

    _this.__report.valid = [];

    _this.__report.invalid = [];

    _this.__stopped = false;

    _this.__calledStartBack = false;

    async.whilst(

      function() { return !_this.__stopped; },

      function (eventsCB) {

        setTimeout(function() {

          async.eachSeries(Object.keys(_this.__happnerClients), function(clientPort, clientsCB){

            //console.log('pushing random event:::', _this.__config.eventTypes);
            async.eachSeries(_this.__happnerClients[clientPort], function(happnerClient, clientCB){

              happnerClient.exchange.server.pushRandomEvent(_this.__config, function(e){

                if (!_this.__calledStartBack) {
                  callback(e);
                  _this.__calledStartBack = true;
                }

                clientCB(e);
              });

            }, clientsCB);

          }, eventsCB);

        }, 1000 / eventsPerSec);
      },

      function (err) {

        _this.message('paused or stopped:::', err);

        if (err) _this.__report.errored = err;

        _this.__report.ended = Date.now();

        _this.__stoppedHandler(err);
      }
    );

  }catch(e){
    if (!_this.__calledStartBack) callback(e);
  }
};

Emulator.prototype.report = function(callback){

  var _this = this;

  _this.message('stopping:::');

  _this.stop(function(e){

    if (e) return callback(e);

    async.eachSeries(Object.keys(_this.__clients), function(clientPort, clientsCB){

      var happnerClients = _this.__happnerClients[clientPort];

      async.eachSeries(happnerClients, function(happnerClient, happnerClientCB){

        happnerClient.exchange.server.getEvents(function(e, events){

          if (e) return happnerClientCB(e);

          var clients = _this.__clients[clientPort];

          async.eachSeries(clients, function(client, clientCB){

            client.verifyEvents(events, function(e, verified){

              if (e) return clientCB(e);

              _this.message('verified:::' + JSON.stringify(verified));

              if (verified.valid == false){

                _this.__report.invalid.push({clientEvents:verified.clientEvents, serverEvents:events});

              } else _this.__report.valid.push({clientEvents:verified.clientEvents, serverEvents:events});

              client.clearEvents(function(e){

                if (e) return clientCB(e);

                client.clearEvents(clientCB);
              });
            });
          }, function(e){

            if (e) return happnerClientCB(e);

            happnerClient.exchange.component.verifyEvents(events, function(e, verified){

              if (e) return happnerClientCB(e);

              console.log('service component verified:::', verified);

              if (verified.valid == false){

                _this.__report.invalid.push({clientEvents:verified.clientEvents, serverEvents:events});

              } else _this.__report.valid.push({clientEvents:verified.clientEvents, serverEvents:events});

              happnerClient.exchange.another_component.verifyEvents(events, function(e, verified){

                if (e) return happnerClientCB(e);

                console.log('another service component verified:::', verified);

                if (verified.valid == false){

                  _this.__report.invalid.push({clientEvents:verified.clientEvents, serverEvents:events});

                } else _this.__report.valid.push({clientEvents:verified.clientEvents, serverEvents:events});

                happnerClientCB();
              });
            });
          });
        });

      }, clientsCB);

    }, function(e){

      if (e) return callback(e);

      return callback(null, _this.__report);
    });
  });
};

Emulator.prototype.stop = function(callback){

  this.__stoppedHandler = callback;

  this.__stopped = true;
};

Emulator.prototype.tearDown = function(callback){

  var _this = this;

  for (var port in _this.__meshes){
    _this.__meshes[port].kill();
  }

  setTimeout(callback, 1000);
};

module.exports = Emulator;