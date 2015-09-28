/*jslint node: true */
'use strict';

var util = require('util');

/**
 *
var source = new Datasource.node({
  host: 'localhost',
  port: 7379,
  poolSize: 15
});
 */

var mod = {
  RedisDatasource: {
    node: function(configuration){
      console.log(util.format('host: %s, port: %d, pool: %d', configuration.host, configuration.port, configuration.poolSize));
    }
  }
};
module.exports = mod;
