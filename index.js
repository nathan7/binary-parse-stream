'use strict';
exports = module.exports = BinaryParseStream
var Stream = require('stream')
  , TransformStream = Stream.Transform
  , inherits = require('util').inherits

var One = exports.One = { valueOf: function() { return 1 } }

inherits(BinaryParseStream, TransformStream)
function BinaryParseStream(options) {
  TransformStream.call(this, options)
  this._writableState.objectMode = false
  this._readableState.objectMode = true

  this._queue = null
  this._needed = 0
  this._parser = this._parse()
}

BinaryParseStream.prototype._transform = function(fresh, encoding, cb) {
  var queue = this._queue === null
    ? fresh
    : Buffer.concat(this._queue, fresh)

  var needed = this._needed

  while (queue.length >= needed) {
    var chunk = queue.slice(0, +needed)
    queue = queue.slice(+needed)
    
    var ret
      , err
    try {
      if (needed === One)
        ret = this._parser.next(chunk[0])
      else
        ret = this._parser.next(chunk)
    }
    catch (e) {
      err = e
      ret = { done: true }
    }

    if (!ret.done)
      needed = ret.value
    else {
      if (err)
        this.emit('error', err)
      else
        this.push(ret.value)
      needed = 0
      this._parser = this._parse()
    }
  }

  this._queue = queue
  this._needed = needed
  return cb()
}
