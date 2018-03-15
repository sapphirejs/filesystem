const fs = require('fs')
const fsPath = require('path')
const promisify = require('util').promisify
const FileDoesntExist = require('../errors/file-doesnt-exist')
const FileExists = require('../errors/file-exists')
const InvalidPath = require('../errors/invalid-path')

/**
 * Local driver for the abstract filesystem.
 *
 * @class Local
 */
class Local {
  /**
   * Reads a file.
   *
   * @public
   * @param {string} path
   * @returns {Promise} with the file contents
   * @throws {FileDoesntExist} when path doesn't exist
   * @throws {InvalidPath} when path isn't a file
   */
  async read(path) {
    if (!await this.exists(path))
      throw new FileDoesntExist(`File "${path}" doesn't exist or isn't readable.`)
    if (!await this.isFile(path) && !await this.isSymbolicLink(path))
      throw new InvalidPath(`"${path}" isn't a file.`)

    return promisify(fs.readFile)(this._resolve(path), 'utf8')
  }

  /**
   * Writes to a file.
   *
   * @public
   * @param {string} path
   * @param {string} data
   * @returns {Promise}
   * @throws {InvalidPath} when path isn't a directory
   */
  async write(path, data) {
    if (!await this.isFile(path))
      throw new InvalidPath(`"${path}" isn't a file.`)

    return promisify(fs.writeFile)(this._resolve(path), data, 'utf8')
  }

  /**
   * Checks if file exists.
   *
   * @public
   * @param {string} path
   * @returns {Promise} true or false
   */
  async exists(path) {
    return new Promise(resolve => {
      fs.access(this._resolve(path), fs.constants.R_OK, (err) => {
        if (err) resolve(false)
        resolve(true)
      })
    })
  }

  /**
   * Checks if path is a directory.
   *
   * @public
   * @param {string} path
   * @returns {Promise} true or false
   * @throws {FileDoesntExist} when path doesn't exist
   */
  async isDirectory(path) {
    if (!await this.exists(path))
      throw new FileDoesntExist(`Directory "${path}" doesn't exist or isn't readable.`)

    return new Promise((resolve, reject) => {
      fs.lstat(this._resolve(path), (err, stats) => {
        if (err) reject(err)
        if (stats.isDirectory()) resolve(true)
        resolve(false)
      })
    })
  }

  /**
   * Checks if path is a file.
   *
   * @public
   * @param {string} path
   * @returns {Promise} true or false
   * @throws {FileDoesntExist} when path doesn't exist
   */
  async isFile(path) {
    if (!await this.exists(path))
      throw new FileDoesntExist(`File "${path}" doesn't exist or isn't readable.`)

    return new Promise((resolve, reject) => {
      fs.lstat(this._resolve(path), (err, stats) => {
        if (err) reject(err)
        if (stats.isFile()) resolve(true)
        resolve(false)
      })
    })
  }

  /**
   * Checks if path is a symbolic link.
   *
   * @public
   * @param {string} path
   * @returns {Promise} true or false
   * @throws {FileDoesntExist} when path doesn't exist
   */
  async isSymbolicLink(path) {
    if (!await this.exists(path))
      throw new FileDoesntExist(`File "${path}" doesn't exist or isn't readable.`)

    return new Promise((resolve, reject) => {
      fs.lstat(this._resolve(path), (err, stats) => {
        if (err) reject(err)
        if (stats.isSymbolicLink()) resolve(true)
        resolve(false)
      })
    })
  }

  /**
   * Delete a file or a directory.
   *
   * @public
   * @param {string} path
   * @returns {Promise}
   * @throws {FileDoesntExist} when path doesn't exist
   * @throws {InvalidPath} when path isn't a file, symlink, or directory
   */
  async delete(path) {
    if (!await this.exists(path))
      throw new FileDoesntExist(`File or directory "${path}" doesn't exist or isn't readable.`)

    if (await this.isFile(path) || await this.isSymbolicLink(path)) {
      return promisify(fs.unlink)(this._resolve(path))
    }
    else if (await this.isDirectory(path)) {
      return promisify(fs.rmdir)(this._resolve(path))
    }
    else {
      throw new InvalidPath(`"${path} isn't either a file, symbolic link, or directory. It must be an alien!"`)
    }
  }

  /**
   * Delete a directory recursively, by
   * deleting every file and subdirectory.
   *
   * @public
   * @param {string} path
   * @returns {Promise}
   */
  async deleteAll(path) {
    const files = await this.readDir(path)
    for (const file of files) {
      const curr = fsPath.join(path, file)
      if (await this.isFile(curr))
        await this.delete(curr)
      else
        await this.deleteAll(curr)
    }

    await this.delete(path)
  }

  /**
   * Append data to a file.
   *
   * @public
   * @param {string} path
   * @param {string} data
   * @returns {Promise}
   */
  async append(path, data) {
    return promisify(fs.appendFile)(this._resolve(path), data, 'utf8')
  }

  /**
   * Chmod a file.
   *
   * @public
   * @param {string} path
   * @param {int} mode
   * @returns {Promise}
   * @throws {FileDoesntExist} when path doesn't exist
   */
  async chmod(path, mode) {
    if (!await this.exists(path))
      throw new FileDoesntExist(`File "${path}" doesn't exist or isn't readable.`)

    return promisify(fs.chmod)(this._resolve(path), mode)
  }

  /**
   * Copy a source file into the destination.
   *
   * @public
   * @param {string} source
   * @param {string} destination
   * @param {boolean} overwrite
   * @returns {Promise}
   * @throws {FileDoesntExist} when source path doesn't exist
   * @throws {FileExists} when destination path exists and overwrite is disabled
   */
  async copy(source, destination, overwrite = true) {
    if (!await this.exists(source))
      throw new FileDoesntExist(`File "${source}" doesn't exist or isn't readable.`)

    if (!overwrite && await this.exists(destination))
      throw new FileExists(`File "${destination} already exists."`)

    return promisify(fs.copyFile)(this._resolve(source), this._resolve(destination))
  }

  /**
   * Create a directory.
   *
   * @public
   * @param {string} path
   * @param {int} mode
   * @param {boolean} recursively
   * @returns {Promise}
   * @throws {FileExists} when path exists
   */
  async createDir(path, mode = 0o777, recursively = false) {
    if (recursively) {
      return new Promise((resolve, reject) => {
        // Start from the left-most parent and try
        // creating the directories if they don't exist.
        fsPath.join(fsPath.dirname(path), fsPath.basename(path))
          .split(fsPath.sep)
          .reduce((parent, current) => {
            const dir = fsPath.join(parent, current)
            fs.mkdir(dir, mode, err => {
              if (err && err.code !== 'EEXIST')
                reject(err)
            })
            return dir
          }, '')

        resolve(true)
      })
    }
    else {
      if (await this.exists(path))
        throw new FileExists(`Directory "${path}" already exists.`)

      return promisify(fs.mkdir)(this._resolve(path), mode)
    }
  }

  /**
   * Read the contents of a directory non
   * recursively.
   *
   * @public
   * @param {string} path
   * @returns {Promise} with an array containing files and directories
   * @throws {FileDoesntExist} when path doesn't exist
   */
  async readDir(path) {
    if (!await this.exists(path))
      throw new FileDoesntExist(`Directory "${path}" doesn't exist or isn't readable.`)

    return promisify(fs.readdir)(this._resolve(path))
  }

  /**
   * Rename a file.
   *
   * @public
   * @param {string} oldPath
   * @param {string} newPath
   * @returns {Promise}
   * @throws {FileDoesntExist} when old path doesn't exist
   * @throws {FileExists} when new path exists
   */
  async rename(oldPath, newPath) {
    if (!await this.exists(oldPath))
      throw new FileDoesntExist(`File "${oldPath}" doesn't exist or isn't readable.`)

    if (await this.exists(newPath))
      throw new FileExists(`File "${newPath}" already exists.`)

    return promisify(fs.rename)(this._resolve(oldPath), this._resolve(newPath))
  }

  /**
   * Resolves a path.
   *
   * @private
   * @param {string} path
   * @returns {string}
   */
  _resolve(path) {
    return fsPath.resolve(path)
  }
}

module.exports = Local
