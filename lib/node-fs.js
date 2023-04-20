const fs = require('fs')
const path = require('path')
const url = require('url')

module.exports = {
  exists: (path) => {
    return fs.existsSync(path)
  },
  read: (path, encoding = 'utf8') => {
    return fs.readFileSync(path, encoding)
  },
  dirname: (resourceId) => {
    return path.dirname(resourceId)
  }
}