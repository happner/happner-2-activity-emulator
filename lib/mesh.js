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
    "component": {
      path: __dirname + "/component"
    },
    "another-component": {
      path: __dirname + "/another-component"
    }
  },
  components: {
    "server": {
      moduleName: "server",
      schema: {
        "exclusive": false
      }
    },
    "component": {
      moduleName: "component",
      startMethod: "initialize",
      schema: {
        "exclusive": false
      }
    },
    "another_component": {
      moduleName: "another-component",
      startMethod: "initialize",
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
