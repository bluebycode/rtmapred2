/*jslint node: true */
'use strict';

var Datasource = require('./lib/datasource.js').RedisDatasource,
    Streams = require('./lib/streams.js').Streams;

var Extractor = require('./etl.js');

var source = new Datasource.node({
  host: 'localhost',
  port: 7380,
  poolSize: 15
});

var stream1 = new Streams.OutputFile('stream1.log');
var stream2 = new Streams.OutputFile('stream2.log');
var stream3 = new Streams.OutputFile('stream3.log');

var streamChain = new Streams.Select([stream1, stream2]);

var etl = new Extractor(source);
etl.bind('registration', streamChain)
   .bind('session', streamChain)
   .bind('path', stream3)
   .bind('purchase', stream3)
   .start();
