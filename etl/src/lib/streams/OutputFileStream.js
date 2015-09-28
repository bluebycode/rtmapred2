/*jslint node: true */
'use strict';

var util    = require('util'),
    fs      = require('fs'),
    through = require('through');


var OutputFileStream = function(filename){
  var _throughpass = through(function(data){
    console.log(util.format('[%s] received: %s\n', Date.now(), data));
    this.queue(data);
  });
  _throughpass
    .pipe(fs.createWriteStream(filename), {end: false});
  return _throughpass;
};

module.exports.OutputFileStream = OutputFileStream;
