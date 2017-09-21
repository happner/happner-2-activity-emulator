var Mesh = require('happner-2');

var utilities = require("./utilities").create();

var port = parseInt(process.argv[2]);

var config = {
  name: 'remote',
  happn: {
    port: port,
    secure: true
  },
  endpoints: {},
  modules: {
    "server": {
      path: __dirname + "/server",
      constructor: {
        type: "sync",
        parameters: []
      }
    },
    "client": {
      path: __dirname + "/client",
      constructor: {
        type: "sync",
        parameters: []
      }
    }
  },
  components: {
    "server": {
      moduleName: "server",
      schema: {
        "exclusive": false
      }
    },
    "client": {
      moduleName: "client",
      schema: {
        "exclusive": false
      }
    }
  }
};

Mesh.create(config, function (err) {

  if (err) {

    console.log('ERROR: ', err);

    console.log('ERROR');

    return setTimeout(function(){
      process.exit(err.code || 1)
    }, 1000);
  }

  console.log('READY');
});
