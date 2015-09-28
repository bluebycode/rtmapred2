/*jslint node: true */
'use strict';

var util = require('util');

var mod = {
  Extractor: function(datasource){
    this.bindStreamChain = function(channel, streamChain){
      var self = this;
      console.log(util.format('binging channel: %s to stream %s', channel, streamChain));
      return this;
    };
    this.start = function(){
      console.log(util.format('starting'));
    }
  }
};

module.exports = mod.Extractor;
