const FUNCTIONS = require('./functions')

exports.Filter = class Filter {
  constructor(config) {
    this.config = config
  }

  /*
    Evaluates an array of file paths, returning an array of only the allowed files.
  */
  filePathArray(filePathArray) {
    filePathArray = filePathArray.filter(filePath => FUNCTIONS.isAllowedName(filePath, this.config.excludedNames))
    filePathArray = filePathArray.filter(filePath => FUNCTIONS.isAllowedExtension(filePath, this.config.excludedExtensions))
    filePathArray = filePathArray.filter(filePath => FUNCTIONS.isAllowedPath(filePath, this.config.excludedPaths))

    return filePathArray
  }
}
