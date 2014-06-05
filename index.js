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
      , chunk = this.__needed === null
        ? undefined
        : this.__read(this.__needed)

    try { ret = this.__parser.next(chunk) }
    catch (e) { return cb(e) }

    if (this.__needed)
      this.__fresh = false

    if (!ret.done)
      this.__needed = ret.value | 0
    else {
      this.push(ret.value)
      this.__restart()
    }
  }

  return cb()
}

BinaryParseStream.prototype.__restart = function() {
  this.__needed = null
  this.__parser = this._parse()
  this.__fresh = true
}

BinaryParseStream.prototype._flush = function(cb) {
  cb(this.__fresh && new Error('unexpected end of input'))
}

BinaryParseStream.extend = function(parser) {
  inherits(CustomBinaryParseStream, BinaryParseStream)
  function CustomBinaryParseStream(options) {
    BinaryParseStream.call(this, options)
  }
  CustomBinaryParseStream.prototype._parse = parser
  return CustomBinaryParseStream
}
