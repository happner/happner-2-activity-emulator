var async = require('async');

function Client(options) {

  this.__events = {};
}

Client.prototype.attach = function($happn, options, callback){

  var _this = this;

  async.eachSeries(options.eventTypes, function(eventType, eventTypeCB){

    $happn.event.server.on('/random/event/' + eventType, function(data){

      if (data.forcedError) data.eventType = "NOT_EXISTING_ON_SERVER";

      if (!_this.__events[data.eventType]) _this.__events[data.eventType] = 0;

      _this.__events[data.eventType] ++;

    }, eventTypeCB);

  }, callback);
};

Client.prototype.verifyEvents = function($happn, events, callback){

  var _this = this;

  try{

    var verified = {valid:true, matched:{}, message:'', clientEvents: _this.__events};

    Object.keys(events).forEach (function(eventType){

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

Client.prototype.clearEvents = function($happn, callback){

  this.__events = {};

  callback();
};

module.exports = Client;
