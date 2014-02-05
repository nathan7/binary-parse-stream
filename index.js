'use strict';
exports = module.exports = BinaryParseStream
var Stream = require('stream')
  , TransformStream = Stream.Transform
  , inherits = require('util').inherits
  , Readable = require('readable')
  , abs = Math.abs

exports.One = -1

inherits(BinaryParseStream, TransformStream)
function BinaryParseStream(options) {
  TransformStream.call(this, options)
  this._writableState.objectMode = false
  this._readableState.objectMode = true

  this.__read = Readable(Buffer(0))
  this.__restart()
}

BinaryParseStream.prototype._transform = function(fresh, encoding, cb) { var self = this
  this.__read.push(fresh)

  while (this.__read.able >= abs(this.__needed)) {
    var ret
      , chunk = this.__read(this.__needed)

    try { ret = this.__parser.next(chunk) }

    catch (e) {
      this.emit('error', e)
      this.__restart()
      continue
    }
    
    if (ret.done) {
      this.push(ret.value)
      this.__restart()
      continue
    }

    this.__needed = ret.value
  }

  return cb()
}

BinaryParseStream.prototype.__restart = function() {
  this.__needed = 0
  this.__parser = this._parse()
}
