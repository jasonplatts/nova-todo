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
Sorts an array of file paths by file name alphabetically.
Called in conjunction with the JS sort function.
Eg: filePathArray.sort(this.sortByFileName);
*/
exports.sortByFileName = function sortByFileName(a, b) {
  a = nova.path.basename(a).toLowerCase()
  b = nova.path.basename(b).toLowerCase()

  return a > b ? 1 : b > a ? -1 : 0
}
