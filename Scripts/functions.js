'use strict'

/*
  Generic functions used in the extension are kept in this file.
  Some functions rely on the Nova API.
*/

/*
  Returns a boolean representing whether or not the current
  environment is a workspace or Nova window without a
  workspace.
*/
exports.isWorkspace = function isWorkspace() {
  if (nova.workspace.path == undefined || nova.workspace.path == null) {
    // Opening single file in a Nova editor does not define a workspace. A project must exist.
    // Opening a remote server environment is also not considered a workspace.
    return false
  } else {
    // A local project is the only environment considered a Nova workspace.
    return true
  }
}

/*
  Sorts an array of Nova file paths by file name alphabetically.
  Called in conjunction with the JS sort function.
  Eg: filePathArray.sort(this.sortByFileName);
*/
exports.sortByFileName = function sortByFileName(a, b) {
  a = nova.path.basename(a).toLowerCase()
  b = nova.path.basename(b).toLowerCase()

  return a > b ? 1 : b > a ? -1 : 0
}

/*
  Evaluates if a specific file or directory should be excluded
  based on a provided array of names.
*/
exports.isAllowedName = function isAllowedName(path, excludedNames) {
  let pathElementArray = path.split('/')
  let exclusionFound = false
  let count = 0

  while (count < pathElementArray.length && exclusionFound !== true) {
    if (excludedNames.includes(pathElementArray[count])) {
      exclusionFound = true
    }

    count++
  }

  if (exclusionFound == true) {
    return false
  } else {
    return true
  }
}

/*
  Evaluates if a specific file should be excluded based on array
  of file extensions.
*/
exports.isAllowedExtension = function isAllowedExtension(path, excludedExtensions, remote=false) {
  if (remote == false) {
    if (nova.fs.stat(path).isFile() == true) {
      if (excludedExtensions.includes(nova.path.extname(path)) || nova.path.extname(path) == '') {
        return false
      } else {
        return true
      }
    } else {
      return true
    }
  } else {
    // nova.fs.stat does not work with remote project paths
    let extension = path.split('.').pop()

    if (excludedExtensions.includes(nova.path.extname(path)) || nova.path.extname(path) == '') {
      return false
    } else {
      return true
    }
  }
}

/*
  Evaluates if a specific path should be excluded based on
  array of file and/or directory names.
*/
exports.isAllowedPath = function isAllowedPath(path, excludedPaths) {
  let pathFound = false
  let excludedPathsIndex = 0

  while ((excludedPathsIndex < excludedPaths.length) && pathFound !== true) {
    if (nova.path.normalize(path).includes(excludedPaths[excludedPathsIndex])) {
      pathFound = true
    }

    excludedPathsIndex++
  }

  if (pathFound == true) {
    return false
  } else {
    return true
  }
}

/*
  Evaluates an array of file paths, returning an array of only the allowed files.
*/
exports.filterFilePathArray = function filterFilePathArray(filePathArray, config) {
  filePathArray = filePathArray.filter(filePath => this.isAllowedName(filePath, config.excludedNames))
  filePathArray = filePathArray.filter(filePath => this.isAllowedExtension(filePath, config.excludedExtensions))
  filePathArray = filePathArray.filter(filePath => this.isAllowedPath(filePath, config.excludedPaths))

  return filePathArray
}

/*
  Evaluates an array of Nova TextDocument objects, returning an array of only the allowed documents.
*/
exports.filterOpenDocumentArray = function filterOpenDocumentArray(textDocuments, config) {
  textDocuments = textDocuments.filter(textDocument => this.isAllowedName(textDocument.path, config.excludedNames))
  textDocuments = textDocuments.filter(textDocument => this.isAllowedExtension(textDocument.path, config.excludedExtensions, true))
  textDocuments = textDocuments.filter(textDocument => this.isAllowedPath(textDocument.path, config.excludedPaths))

  return textDocuments
}

exports.isExcluded = function isExcluded(filePath, config) {
  if ((this.isAllowedExtension(filePath, config.excludedExtensions) == false) ||
      (this.isAllowedPath(filePath, config.excludedPaths) == false) ||
      (this.isAllowedName(filePath, config.excludedNames) == false)) {
    return true
  } else {
    return false
  }
}

/*
  Removes the preceding Volumes and HDD portion of a standard returned path.
*/
exports.normalizePath = function normalizePath(path) {
  return '/' + path.split('/').slice(3).join('/')
}

/*
  Format extension errors in the console.
*/
exports.showConsoleError = function showConsoleError(error) {
  let prefix = 'TODO Extension Error:'
  console.log(prefix, error)
}

/*
  Returns an array that has been stripped of null, blank, and undefined elements.
*/
exports.cleanArray = function cleanArray(array) {
  array = array.filter(function(element) {
    element = element.trim()

    if (element !== null && element !== '' && element!== undefined) {
      return element
    }
  })

  array = array.map(element => element.trim())

  return array
}
