/**
 * Abstract filesystem meant to work with
 * different drivers.
 *
 * @class Filesystem
 */
class Filesystem {
  /**
   * @param {Object} driver
   */
  constructor(driver) {
    this._driver = driver
    this._tempDriver = null
  }

  /**
   * Reads a file.
   *
   * @public
   * @param {string} path
   * @returns {Promise} with the file contents
   */
  read(path) {
    const driver = this._resolveDriver()
    return driver.read(path)
  }

  /**
   * Writes to a file.
   *
   * @public
   * @param {string} path
   * @param {string} data
   * @returns {Promise}
   */
  write(path, data) {
    const driver = this._resolveDriver()
    return driver.write(path, data)
  }

  /**
   * Checks if file exists.
   *
   * @public
   * @param {string} path
   * @returns {Promise} true or false
   */
  exists(path) {
    const driver = this._resolveDriver()
    return driver.exists(path)
  }

  /**
   * Checks if path is a directory.
   *
   * @public
   * @param {string} path
   * @returns {Promise} true or false
   */
  isDirectory(path) {
    const driver = this._resolveDriver()
    return driver.isDirectory(path)
  }

  /**
   * Checks if path is a file.
   *
   * @public
   * @param {string} path
   * @returns {Promise} true or false
   */
  isFile(path) {
    const driver = this._resolveDriver()
    return driver.isFile(path)
  }

  /**
   * Checks if path is a symbolic link.
   *
   * @public
   * @param {string} path
   * @returns {Promise} true or false
   */
  isSymbolicLink(path) {
    const driver = this._resolveDriver()
    return driver.isSymbolicLink(path)
  }

  /**
   * Delete a file or a directory.
   *
   * @public
   * @param {string} path
   * @returns {Promise}
   */
  delete(path) {
    const driver = this._resolveDriver()
    return driver.delete(path)
  }

  /**
   * Append data to a file.
   *
   * @public
   * @param {string} path
   * @param {string} data
   * @returns {Promise}
   */
  append(path, data) {
    const driver = this._resolveDriver()
    return driver.append(path, data)
  }

  /**
   * Chmod a file.
   *
   * @public
   * @param {string} path
   * @param {int} mode
   * @returns {Promise}
   */
  chmod(path, mode) {
    const driver = this._resolveDriver()
    return driver.chmod(path, mode)
  }

  /**
   * Copy a source file into the destination.
   *
   * @public
   * @param {string} source
   * @param {string} destination
   * @param {boolean} overwrite
   * @returns {Promise}
   */
  copy(source, destination, overwrite = true) {
    const driver = this._resolveDriver()
    return driver.copy(source, destination, overwrite)
  }

  /**
   * Create a directory.
   *
   * @public
   * @param {string} path
   * @param {int} mode
   * @param {boolean} recursively
   * @returns {Promise}
   */
  createDir(path, mode = 0o777, recursively = false) {
    const driver = this._resolveDriver()
    return driver.createDir(path, mode, recursively)
  }

  /**
   * Read the contents of a directory non
   * recursively.
   *
   * @public
   * @param {string} path
   * @returns {Promise} with an array containing files and directories
   */
  readDir(path) {
    const driver = this._resolveDriver()
    return driver.readDir(path)
  }

  /**
   * Rename a file.
   *
   * @public
   * @param {string} oldPath
   * @param {string} newPath
   * @returns {Promise}
   */
  rename(oldPath, newPath) {
    const driver = this._resolveDriver()
    return driver.rename(oldPath, newPath)
  }

  /**
   * Swaps the driver for the next function call.
   *
   * @public
   * @param {Object} driver
   * @returns {Filesystem}
   */
  in(driver) {
    this._tempDriver = driver
    return this
  }

  /**
   * Sets the active driver by checking the temporary
   * and base ones.
   *
   * @private
   * @returns {Object}
   */
  _resolveDriver() {
    const driver = this._tempDriver || this._driver
    this._tempDriver = null
    return driver
  }
}

module.exports = Filesystem
