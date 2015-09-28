
/*jslint node: true */
'use strict';

var stream  = require('stream'),
    duplexer2   = require('duplexer2'),
    through2    = require('through2'),
    mergeStream = require('merge-stream'),
    MultiStream = require('./MultiStream.js').MultiStream;

/**
 * Selector class: resolve next iteration
 * from a number of options or nodes.
 * @param {number] total number of options/nodes}
 */
var Select = function Selector(size){
  this._index = 0;
  this._size = size;
};

/**
 * Next selection.
 * @return {number] index of selection}.
 */
Select.prototype.next = function(){
  this._index++;
  if (this._index >= this._size) {
    this._index = 0;
  }
  return this._index;
};

/**
 * Makes a readable-writable stream, which makes a context switching
 * between the streams, which are connected to outbounds of stream.
 * @param  {array of streams objects}
 * @return {readable-writable stream composed by provided streams}
 */
var SelectStream = function(streams){

  // through2 provides us a readable-writable simple stream as readable stream
  // which all streams will be connected by.
  var outStream = through2.obj();

  // Switch between streams
  // @todo: we should validate the healthy of streams provided
  var _selector = new Select(streams.length);

  // Forking streams from main one
  // classifier method provides functionality of switching
  // between streams basically (selector algorithm..)
  var multiStream = new MultiStream({
    classifier: function (e, cb) {
      return cb(null, _selector.next());
    }
  }, streams.length);

  var mergedStream;

  // pipeling streams with channels
  streams.forEach(function(forward,n){
    multiStream.channel(n).pipe(forward);
    if (n === 0){
      mergedStream = forward;
    }else{
      mergedStream = mergeStream(forward, mergedStream);
    }
  });

  // **
  // MUST TO FIX: error propagation
  // **
  streams.forEach(function(forward,n){
    forward.on('error', function(err) {
      console.log('forward !!!!!!!!',err);
    });
  });

  // Sending everything down-stream
  mergedStream.pipe(outStream);
  mergedStream.on('error', function(err) {
    console.log('mergedStream !!!!!!!!',err);
    //outStream.emit('error', err);
  });

  outStream.on('error', function(err){
    console.log('outStream !!!!!!!!',err);
  });

  // Consumers write in to forked stream, we write out to outStream
  var duplex = duplexer2({objectMode: true}, multiStream, outStream);

  duplex.on("data", function(e) {
    console.log("got data", e);
  });

  duplex.on("finish", function() {
    console.log("got finish event");
  });

  duplex.on("end", function() {
    console.log("got end event");
  });

  return duplex;
};

module.exports.SelectStream = SelectStream;
