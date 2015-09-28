/*jslint node: true */
'use strict';

var util = require('util'),
    Streams = require('./lib/streams.js').Streams;

var mod = {
  Extractor: function(datasource){
    if (!datasource) throw new Error('source not defined');
    var self = this;
    this._listeners = [];
    this._streams = {};

    datasource.on('ready', function(context){
      try {
        var connection = context.conn();
        self._listeners.map(function(func){
          func(connection);
        });

        connection.on('message', function(channelId, message){
          try {
            console.log('message received!!', channelId, message);
            var stream = self._streams[channelId];
            if (stream){
              stream.push(message+'\n');
            }
          }catch (err){
            console.log(err.stack);
          }
        });

      }catch (err){
        console.log(err.stack);
      }
    });

    this._bindStreamChain = function(channel, streamChain, connection){
      var pasarel = new Streams.Pasarel(channel);
          pasarel
            .pipe(streamChain);

      self._streams[channel] = pasarel;

      console.log('Subscribing to ... ' + channel);
      connection.subscribe(channel);
    };

    this.bindStreamChain = function(channel, streamChain){
      console.log(util.format('binging channel: %s to stream %s', channel, streamChain));
      self._listeners.push(function(connection){
        self._bindStreamChain(channel, streamChain, connection);
      });
      return this;
    };
    this.start = function(){
      console.log(util.format('starting'));
    }
  }
};

module.exports = mod.Extractor;
