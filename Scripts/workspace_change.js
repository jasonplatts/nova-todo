const FUNCTIONS            = require('./functions.js')
const { DocumentSearch }   = require('./document_search.js')

exports.WorkspaceChange = class WorkspaceChange {
  constructor(listItems) {
    this.listItems = listItems
  }

  /*
    Determines if a file path exists in an array of listItem objects.
  */
  fileExists(filePath) {
    let fileFound = false
    let itemCount = 0

    filePath = FUNCTIONS.normalizePath(filePath)

    while((fileFound == false) && (itemCount < (this.listItems.length))) {
      let listItemPath = this.listItems[itemCount].path

      if (listItemPath == filePath) {
        fileFound = true
      }

      itemCount++
    }

    return fileFound
  }
}
