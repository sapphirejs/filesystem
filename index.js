const Filesystem = require('./lib/filesystem')
const Local = require('./lib/drivers/local')
const FileDoesntExist = require('./lib/errors/file-doesnt-exist.js')
const FileExists = require('./lib/errors/invalid-path.js')
const InvalidPath = require('./lib/errors/invalid-path.js')

module.exports = {
  Filesystem,
  FileDoesntExist,
  FileExists,
  InvalidPath,
  Driver: {
    Local
  }
}
