var http = require('http');

function Utilities(options) {

  this.__options = options;
}

Utilities.create = function (options) {
  return new Utilities(options);
};

Utilities.prototype.__splitOptions = function(arg, configArgv){

  var argSplit = arg.split('=');

  var key = argSplit[0];

  configArgv[key] = {};

  if (argSplit.length > 1) {

    var optionsString = argSplit.slice(1).join('=');//put the second half back together again

    configArgv[key] = this.__optionStringToJSON(optionsString);
  }
};

Utilities.prototype.__optionStringToJSON = function(str){

  // ie: proxy.port=55555,proxy.target=http://localhost:9200

  var options = {};

  str.split(',').forEach(function(option){

    var optionPair = option.split('=');

    var levels = optionPair[0].split('.');

    var currentLevel = options;

    levels.forEach(function(level, levelIndex){

      if (levelIndex == levels.length - 1) {
        currentLevel[level] = optionPair[1];
        return;
      }

      if (currentLevel[level] == null) currentLevel[level] = {};

      currentLevel = currentLevel[level];
    });
  });

  return options;
};

Utilities.prototype.readConfigArgv = function (options) {

  var _this = this;

  var configArgs = {};

  process.argv.forEach(function (arg, argIndex) {

    try {

      if (argIndex > 1) _this.__splitOptions(arg, configArgs);

    } catch (e) {

      console.warn('badly formatted argument: ' + arg + ', error: ' + e);
      if (options.exitOnFail) process.exit(1);
    }
  });

  return configArgs;
};

Utilities.prototype.stringifyError = function(err) {

  var plainError = {};

  Object.getOwnPropertyNames(err).forEach(function(key) {
    plainError[key] = err[key];
  });

  return JSON.stringify(plainError);
};

module.exports = Utilities;
