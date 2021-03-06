var async = require('async'),
  Mesh = require('happner-2');

function Client(options) {

  this.__events = {};
  this.__key = require('uuid').v4();
}

Client.create = function(options){

  return new Client(options);
};

Client.prototype.attach = function(options, callback){

  var _this = this;

  var client = new Mesh.MeshClient({port: options.port});

  client.login({
    username: options.username,
    password: options.password
  }).then(function(e){

    if (e) return callback(e);

    client.event.server.on('/random/event/*', function(data){

        //console.log('receiving:::', '/random/event/' + data.eventType, _this.__key);

        if (data.forcedError) data.eventType = "NOT_EXISTING_ON_SERVER";

        if (!_this.__events[data.eventType]) _this.__events[data.eventType] = 0;

        _this.__events[data.eventType] ++;

      }, callback);
  });
};

Client.prototype.verifyEvents = function(events, callback){

  var _this = this;

  try{

    console.log('server events:::', events);

    var verified = {valid:true, matched:{}, message:'', clientEvents: _this.__events, count:0, clientKey: _this.__key};

    Object.keys(events).forEach (function(eventType){

      console.log('validating:::', _this.__events[eventType], events[eventType]);

      if (!_this.__events[eventType]){

        verified.count += events[eventType];
        verified.message += ' expected eventType not found: ' + eventType;
        verified.valid = false;

        return;
      }

      if (_this.__events[eventType] != events[eventType]) {

        verified.count += events[eventType] - _this.__events[eventType];
        verified.message += ' expected eventType lengths differ by: ' + verified.count;
        verified.valid = false;

        return;
      }

      verified.matched[eventType] = events[eventType];
    });

    console.log(verified.message);

    return callback(null, verified);

  }catch(e){
    callback(e);
  }
};

Client.prototype.clearEvents = function(callback){

  this.__events = {};

  callback();
};

module.exports = Client;
