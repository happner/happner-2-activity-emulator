var async = require('async'),
  Mesh = require('happner-2');

function Component(options) {

  this.__events = {};
  this.__key = require('uuid').v4();
}

Component.create = function(options){

  return new Component(options);
};

Component.prototype.initialize = function($happn, callback){

  var _this = this;

  $happn.event.server.on('/random/event/*', function(data){

    //console.log('receiving:::', '/random/event/' + data.eventType, _this.__key);

    if (data.forcedError) data.eventType = "NOT_EXISTING_ON_SERVER";

    if (!_this.__events[data.eventType]) _this.__events[data.eventType] = 0;

    _this.__events[data.eventType] ++;

  }, callback);
};

Component.prototype.verifyEvents = function(events, callback){

  var _this = this;

  try{

    console.log('server events:::', events);

    var verified = {valid:true, matched:{}, message:'', ComponentEvents: _this.__events, count:0, ComponentKey: _this.__key};

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

Component.prototype.clearEvents = function(callback){

  this.__events = {};

  callback();
};

module.exports = Component;
