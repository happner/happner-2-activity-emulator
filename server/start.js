var inquirer = require('inquirer')
  ;

process.on('SIGTERM', __tearDown);

process.on('SIGINT', __tearDown);

var evtCount = process.argv.length >= 3 ? parseInt(process.argv[2]) : 100;

var meshCount = process.argv.length >= 4 ? parseInt(process.argv[3]) : 1;

var reportMod = process.argv.length >= 5 ? parseInt(process.argv[4]) : 100;

var silent = process.argv.length >= 6 ? process.argv[5] : false;

var config = {
  eventsPerSec:evtCount,
  meshCount:meshCount,
  reportMod:reportMod,
  silent:silent
};

var emulator = require('../index').create(config);

var emulatorStarted = false;

emulator.initialize(function(e){

  if (e) throw e;

  emulator.start(function(e){

    if (e)  throw e;

    emulatorStarted = true;

    inquirer.prompt([{name:'stop', message:'started, type s to stop'}]).then(function (answers) {

      if (answers['stop'] == 's') __stop();
    });
  })
});

function __stop() {

  if (emulatorStarted)
    emulator.report(function(e, report){

      if (e)  return __tearDown(e);

      console.log('report:::', JSON.stringify(report, null, 2));

      __tearDown();
  });

  else __tearDown();
}

function __tearDown(e) {

  if (e) console.log('error:::', e.toString());

  if (emulatorStarted)
    emulator.tearDown(function(){
      process.exit(0);
    });
  else process.exit(1);
}