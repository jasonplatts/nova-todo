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
  let extension = this.getFileExtension(path)

  if (excludedExtensions.includes(extension) || extension == '') {
    return false
  } else {
    return true
  }
}

/*
  Evaluates a file path and return a file extension. If no extension is present
  it will return and empty string. This function works for local and remote files
  as it only uses the path string to determine the extension, as opposed to the
  inbuilt nova.path.extname() method.
*/
exports.getFileExtension = function getFileExtension(path) {
  let fileName = path.split('/').pop()
  let index = fileName.lastIndexOf('.')

  if (index < 0) {
    // No dot present in fileName
    return ''
  } else if (index == 0) {
    // fileName begins with a dot
    return ''
  } else {
    return '.' + fileName.substr(index + 1)
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
  textDocuments = textDocuments.filter(textDocument => this.isAllowedExtension(textDocument.path, config.excludedExtensions))
  textDocuments = textDocuments.filter(textDocument => this.isAllowedPath(textDocument.path, config.excludedPaths))

  return textDocuments
}

/*
  Evaluates a given file path, returning true if it should be excluded.
*/
exports.isExcluded = function isExcluded(filePath, config) {
  let normalizedPath = this.normalizePath(filePath)

  if ((this.isAllowedExtension(normalizedPath, config.excludedExtensions) == false) ||
      (this.isAllowedPath(normalizedPath, config.excludedPaths) == false) ||
      (this.isAllowedName(normalizedPath, config.excludedNames) == false)) {
    return true
  } else {
    return false
  }
}

/*
  Removes the preceding Volumes and HDD portion of a standard returned path.
*/
exports.normalizePath = function normalizePath(path) {
  // The first element returned from split is anything before the first separator.
  // This will be empty string if nothing is before the first separator.
  let firstDirectory = path.split('/', 2)[1]

  if (firstDirectory == 'Volumes') {
    let newPath = '/' + path.split('/').slice(3).join('/')
    return newPath
  } else {
    return path
  }
}

/*
  Format extension errors in the console.
*/
exports.showConsoleError = function showConsoleError(error) {
  let prefix = 'TODO Extension --'
  console.error(prefix, error)
}

exports.showNotification = function showNotification(title, body) {
  let notification = new NotificationRequest('todo-notification')

  notification.title   = title
  notification.body    = body
  notification.actions = [nova.localize('OK')]

  nova.notifications.add(notification)
}

/*
  Returns an array that has been stripped of null, blank, and undefined elements.
*/
exports.cleanArray = function cleanArray(array) {
  if (array !== null) {
    array = array.filter(function(element) {
      element = element.trim()

      if (element !== null && element !== '' && element!== undefined) {
        return element
      }
    })

    array = array.map(element => element.trim())
  } else {
    array = []
  }

  return array
}

/*
  This is a purely development related function to loop through list items, returning useful data.
*/
exports.dig = function dig(listItems) {
  console.log('---------- DIAGNOSTICS SRT ---------- ')

  listItems.forEach((item, index) => {
    console.log(`Index: ${index} Name: ${item.name}, Path: ${item.path}, Comment: ${item.comment}`)
  })

  console.log('# Elements:', listItems.length)
  console.log('---------- DIAGNOSTICS END ---------- ')
}
