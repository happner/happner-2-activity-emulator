function Server(options) {

  this.__events = {};

  this.__totalEvents = 0;
}

Server.prototype.getEvents = function($happn, callback){

  callback(null, this.__events);
};

Server.prototype.clearEvents = function($happn, callback){

  this.__events = {};

  callback();
};

Server.prototype.pushRandomEvent = function($happn, options, callback){

  var randomindex = Math.floor(Math.random() * (options.eventTypes.length - 1));

  var eventType = options.eventTypes[randomindex];

  if (!options.reportMod) options.reportMod = 100;

  if (!this.__events[eventType]) this.__events[eventType] = 0;

  var _this = this;

  _this.__totalEvents++;

  if (_this.__totalEvents % options.reportMod == 0)
    console.log('PUSHING RANDOM:::', '/random/event/' + options.eventTypes[randomindex].toString() + ' event no: ' + _this.__totalEvents);

  $happn.emit('/random/event/' + options.eventTypes[randomindex].toString(), {
    eventType:eventType,
    forcedError:options.forcedError
  }, function(e){

    if (e) return callback(e);

    _this.__events[eventType]++;

    callback();
  });
};

module.exports = Server;