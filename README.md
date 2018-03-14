# Filesystem

An abstract filesystem that makes it working with files and directories a breeze. It's main advantage are drivers, swappable pieces of code that interact with a specific filesystem. It includes a `Local` driver, with plans to add interfaces for at least AWS, FTP/SFTP, and a Test driver. Adding to the list of benefits are things like Promises, and abstractions and error checking over native functions.

## Usage

We'll install and setup a new instance of Filesystem with the included Local driver.

```
$ npm install --save @sapphirejs/filesystem
```

```js
const { Filesystem, Driver } = require('@sapphirejs/filesystem')

const fs = new Filesystem(new Driver.Local())
const contents = await fs.read('some/file.txt')
```

Simple and with `await`, a pleasure to work with. All Filesystem's functions return a Promise, so no more `promisify` or wrapping the functions into your own promises. As you may imagine, `await` needs to be called in an `async` function, but we're ommiting that for simplicity's sake.

Drivers can even be switched on the fly. Currently we have only one, but imagine we have a `Memory` driver that for some reason we want to write a file into.

```js
const fs = new Filesystem(new Driver.Local())
// Fictitious Memory driver
const memory = new Transport.Memory()

// Using the Local driver.
const exists = await fs.exists('file.txt')
if (!exists) {
  // Switching to the Memory driver.
  await fs.in(memory).write('file.txt', 'Hello from Memory')
}

// Now we're back to the Local driver.
await fs.createDir('some/dir')
```

## API

**read(path) : string**  
Read the contents of the file in `path`.

**write(path, data)**  
Write `data` to the file in `path`.

**exists(path) : boolean**  
Check if file in `path` exists.

**isDirectory(path) : boolean**  
Check if `path` is a directory.

**isFile(path) : boolean**  
Check if `path` is a file.

**isSymbolicLink(path) : boolean**  
Check if `path` is a symbolic link.

**delete(path)**  
Delete `path`. Supports both files and directories.

**append(path, data)**  
Append `data` to the file in `path`.

**chmod(path, mode)**  
Set `mode` (octal, ie: 0o755) permissions to the file in `path`.

**copy(source, destination, overwrite = true)**  
Copy file `source` into `destination`.

**createDir(path, mode = 0o777)**  
Create a directory in `path` with `mode` permissions.

**readDir(path) : array**  
Read non-recursively files and directories in directory `path`.

**rename(oldPath, newPath) : array**  
Rename file in `oldPath` to `newPath` if it doesn't exist.

## Drivers

Drivers are classes that need to implement all of the above methods and wrap the return value into a Promise. Those methods that don't make sense in the environment the driver is being built for, you can just return a dummy Promise and consider it's call always valid. For example, let's say you're developing a `Dropbox` driver but won't be using `chmod`.

```js
class DropboxDriver {
  chmod(path, mode) {
    return Promise.resolve(true)
  }
}
```
