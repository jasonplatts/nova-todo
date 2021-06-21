'use strict'

const FUNCTIONS          = require('./functions.js')
const { DocumentSearch } = require('./document_search.js')

exports.Change = class Change {
  constructor(textDocument, config) {
    this._textDocument = textDocument
    this._config       = config
  }

  /*
    Determines if the listItem objects found in a document
    match the tags in the existing listItems array.
  */
  hasListItemsChanged(listItems) {
    let documentSearch    = new DocumentSearch(this._config)
    let newListItems      = documentSearch.searchOpenDocument(this._textDocument)

    let existingListItems = this.findExistingListItemsByFilePath(listItems)

    if (newListItems.length !== existingListItems.length) {
      return true
    } else {
      let itemCount = 0
      let itemMatch = true

      while ((itemCount < newListItems.length) && (itemMatch == true)) {
        if (this.listItemMatch(newListItems[itemCount], existingListItems[itemCount]) == false) {
          itemMatch = false
        }

        itemCount++
      }

      if (itemMatch == true) {
        return false
      } else {
        return true
      }
    }
  }

  listItemMatch(itemA, itemB) {
    if ((itemA.name     == itemB.name) &&
        (itemA.line     == itemB.line) &&
        (itemA.column   == itemB.column) &&
        (itemA.comment  == itemB.comment)) {
      return true
    } else {
      return false
    }
  }

  /*
    Determines if a document path exists in an array of listItem objects.
  */
  documentPathExistsInList(listItems) {
    let fileFound = false
    let itemCount = 0

    let filePath = FUNCTIONS.normalizePath(this._textDocument.path)

    while((fileFound == false) && (itemCount < (listItems.length))) {
      let listItemPath = FUNCTIONS.normalizePath(listItems[itemCount].path)

      if (listItemPath == filePath) {
        fileFound = true
      }

      itemCount++
    }

    return fileFound
  }

  /*
    Returns an array of listItem objects with a specified file path.
  */
  findExistingListItemsByFilePath(listItems) {
    let existingListItems = []

    listItems.forEach((listItem) => {
      if (FUNCTIONS.normalizePath(listItem.path) == FUNCTIONS.normalizePath(this._textDocument.path)) {
        existingListItems = [...existingListItems, listItem]
      }
    })

    return existingListItems
  }
}
