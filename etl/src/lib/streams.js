/*jslint node: true */
'use strict';

var util    = require('util'),
    stream  = require('stream'),
    PassThrough  = stream.PassThrough || require('readable-stream').PassThrough;

var OutputFileStream  = require('./streams/OutputFileStream.js').OutputFileStream,
    SelectStream      = require('./streams/SelectStream.js').SelectStream;


var PasarelStream = function(id){
  this._id = id;
  PassThrough.call(this);
};
util.inherits(PasarelStream, PassThrough);

module.exports = {
  Streams: {
    OutputFile:   OutputFileStream,
    Select:       SelectStream,
    Pasarel:      PasarelStream
  }
};



