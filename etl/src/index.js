/*jslint node: true */
'use strict';

var Datasource = require('./lib/datasource.js').RedisDatasource,
    Streams = require('./lib/streams.js').Streams;

var Extractor = require('./etl.js');

var source = new Datasource.node({
  host: 'localhost',
  port: 7379,
  poolSize: 15
});

source.on('ready', function(context){
  try {
    context.conn().set('test', 'testing_values');
  }catch (err){
    console.log(err.stack);
  }
});

var stream1 = new Streams.OutputFile('stream1.log');
var stream2 = new Streams.OutputFile('stream2.log');
var stream3 = new Streams.OutputFile('stream3.log');

var etl = new Extractor(source);
etl.bindStreamChain('registration', new Streams.Selector([stream1, stream2]))
   .bindStreamChain('session', stream3)
   .start();
