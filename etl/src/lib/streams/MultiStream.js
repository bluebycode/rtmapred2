
/*jslint node: true */
'use strict';

var stream  = require('stream');

/**
 * [exports description]
 * @param  {type}
 * @param  {type}
 * @return {type}
 */
var MultiStream = function MultiStream(options, nodes) {
  options = options || {};
  options.objectMode = true;

  stream.Writable.call(this, options);

  if (options.classifier) {
    this._classifier = options.classifier;
  }

  var self = this;

  var resume = function resume() {
    if (self.resume) {
      var r = self.resume;
      self.resume = null;
      r.call(null);
    }
  };

  this._channels = [];
  for (var n = 0; n < nodes; n++){
    var channel = new stream.Readable(options);
    channel._read = resume;
    this._channels.push(channel);
  }

  this.on('finish', function() {
    self._channels.forEach(function(channel){
      channel.push(null);
    });
  });
};

/**
 * Extending class as a Writable object.
 * @type {MultiStream] extended object from [stream.Writable}
 */
MultiStream.prototype = Object.create(stream.Writable.prototype, {constructor: {value: MultiStream}});

/**
 * Classification criteria by default.
 * @param  {Function] criteria / predicate}
 * @param  {Function] callback when done}
 * @return {type] ?}
 */
MultiStream.prototype._classifier = function(e, done) {
  return done(null, !!e);
};

/**
 * Retrieve the channel linked to nth stream node.
 * @param  {number] index}
 * @return {Stream] stream}
 */
MultiStream.prototype.channel = function(n){
  return this._channels[n];
};

/**
 * Writes on channel give by selection criteria.
 * @param  {Buffer} data.
 * @param  {String} encoding.
 * @param  {Function} callback.
 * @return {Function} void.
 */
MultiStream.prototype._write = function _write(input, encoding, done) {
  var self = this;

  this._classifier.call(null, input, function(err, node) {
    if (err) {
      return done(err);
    }
    var out = self._channels[node %  self._channels.length];
    if (out.push(input)) {
      return done();
    } else {
      self.resume = done;
    }
  });
};

module.exports.MultiStream = MultiStream;
