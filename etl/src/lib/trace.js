var util = require('util');

module.exports = function(mod){
  //if (arguments.callee.caller !== null) {
  //var module = arguments.callee.caller.arguments[3].replace(/^.*\/|\.[^.]*$/g, '');
  return function(){
    var now = new Date().toGMTString();
    var trace = console.log.bind(console.log, util.format('\x1b[34m[%s]\t\x1b[37m[%s]\x1b[0m',now, mod));
    trace.apply(this, arguments);
  };
};
