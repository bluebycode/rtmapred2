/*jslint node: true */
'use strict';

var util    = require('util'),
    Q       = require('q'),
    Streams = require('./lib/streams.js').Streams,
    trace   = require('./lib/trace.js')('etl');

var mod = {
  Extractor: function(datasource){
    if (!datasource) throw new Error('source not defined');

    var self = this;
    this._listeners = [];
    this._streams = {};

    this._context = Q.defer();
    this._initializer = function(connection) {
      try {
        self._listeners.map(function(func){
          func(connection);
        });

        connection.on('message', function(channelId, message){
          try {
            trace('message received!!', channelId, message);
            var stream = self._streams[channelId];
            if (stream){
              stream.push(message+'\n');
            }
          }catch (err){
            console.log(err.stack);
          }
        });
        trace('ETL started.')
        return 1;
      }catch (err){
        trace(err.stack);
      }
      return 0;
    };

    datasource.on('ready', function(context){
      self._context.resolve(context.conn());
    });

    this._bindStreamChain = function(channel, streamChain, connection){
      var pasarel = new Streams.Pasarel(channel);
          pasarel
            .pipe(streamChain);

      self._streams[channel] = pasarel;

      trace('Subscribing to ... ' + channel);
      connection.subscribe(channel);
    };

    this.bind = function(channel, streamChain){
      trace(util.format('binging channel: %s to stream %s', channel, streamChain));
      self._listeners.push(function(connection){
        self._bindStreamChain(channel, streamChain, connection);
      });
      return this;
    };
    this.start = function(){
      trace(util.format('starting'));
      self._context.promise.then(function(connection){
        trace('ret=',self._initializer(connection));
      });
    }
  }
};

module.exports = mod.Extractor;
