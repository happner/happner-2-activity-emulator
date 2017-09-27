describe('happner-activity-emulator-sanity-tests', function () {

  this.timeout(5000);

  var expect = require('expect.js');

  var uuid = require('uuid');

  it('tests the random activity generator running directly for 10 seconds, single client', function (done) {

    this.timeout(15000);

    var emulator = require('..').create();

    emulator.initialize(function(e){
      
      if (e) return done(e);

      emulator.start(function(e){

        if (e) return done(e);

        setTimeout(function(){

          emulator.report(function(e, report){

            if (e) return done(e);

            expect(report.invalid.length).to.be(0);

            emulator.tearDown(done);
          });

        }, 5000)
      })
    });
  });

  it('tests the random activity generator running directly for 10 seconds, 2 clients', function (done) {

    this.timeout(15000);

    var emulator = require('..').create({clientCount:2});

    emulator.initialize(function(e){

      if (e) return done(e);

      emulator.start(function(e){

        if (e) return done(e);

        setTimeout(function(){

          emulator.report(function(e, report){

            if (e) return done(e);

            expect(report.invalid.length).to.be(0);

            emulator.tearDown(done);
          });

        }, 5000)
      })
    });
  });


  it('tests the random activity generator running directly for 10 seconds, 1000 evt per sec', function (done) {

    this.timeout(15000);

    var emulator = require('..').create({eventsPerSec:1000});

    emulator.initialize(function(e){

      if (e) return done(e);

      emulator.start(function(e){

        if (e) return done(e);

        setTimeout(function(){

          emulator.report(function(e, report){

            if (e) return done(e);

            expect(report.invalid.length).to.be(0);

            emulator.tearDown(done);
          });

        }, 5000)
      })
    });
  });

  it('tests we find a non matching item in our report, 10 evt per sec', function (done) {

    this.timeout(15000);

    var emulator = require('..').create({eventsPerSec:10});

    emulator.initialize(function(e){

      if (e) return done(e);

      emulator.start(function(e){

        if (e) return done(e);

        setTimeout(function(){

          emulator.report(function(e, report){

            if (e) return done(e);

            expect(report.invalid.length).to.be(1);

            emulator.tearDown(done);

          }, 10);

        }, 5000);

      }, true);
    });
  });

});