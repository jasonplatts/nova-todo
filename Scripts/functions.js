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
    return false
  } else {
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
exports.isAllowedExtension = function isAllowedExtension(path, excludedExtensions) {
  if (nova.fs.stat(path).isFile() == true) {
    if (excludedExtensions.includes(nova.path.extname(path)) || nova.path.extname(path) == '') {
      return false
    } else {
      return true
    }
  } else {
    return true
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
  Removes the preceding Volumes and HDD portion of a standard returned path.
*/
exports.normalizePath = function normalizePath(path) {
  return '/' + path.split('/').slice(3).join('/')
}

