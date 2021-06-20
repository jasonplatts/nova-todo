'use strict'

const FUNCTIONS           = require('./functions.js')
const { WorkspaceSearch } = require('./workspace_search.js')
const { DocumentSearch }  = require('./document_search.js')
const { Change }          = require('./change.js')
const { Group }           = require('./group.js')

exports.List = class List {
  constructor(config) {
    this._config = config
    this._items  = null
  }

  async loadItems() {
    if (FUNCTIONS.isWorkspace()) {
      this._items = await this.loadWorkspaceEnvironment()
    } else {
      this._items = await this.loadNonWorkspaceEnvironment()
    }

    return true
  }

  async loadWorkspaceEnvironment() {
    let listItems         = []
    let workspaceSearch   = new WorkspaceSearch(nova.workspace.path, this._config)
    let filePaths         = await workspaceSearch.search()
    let filteredFilePaths = FUNCTIONS.filterFilePathArray(filePaths, this._config)

    // SORTING SHOULD OCCUR AT THE DISPLAY LEVEL SO THAT IT RETAINS ORDER FOR CHANGES TOO
    // filteredFilePaths.sort(FUNCTIONS.sortByFileName)

    filteredFilePaths.forEach((filePath) => {
      let documentSearch = new DocumentSearch(this._config)
      listItems = [...listItems, ...documentSearch.searchFile(filePath)]
    })

    return listItems
  }

  async loadNonWorkspaceEnvironment() {
    let openDocuments = nova.workspace.textDocuments

    openDocuments = FUNCTIONS.filterOpenDocumentArray(openDocuments, this._config)

    let listItems = []

    openDocuments.forEach((textDocument) => {
      let documentSearch = new DocumentSearch(this._config)
      listItems = [...listItems, ...documentSearch.searchOpenDocument(textDocument)]
    })

    return listItems
  }

  get items() {
    let group            = new Group()
    let groupedListItems = group.groupListItems(this._items, this._config.groupBy)

    return groupedListItems
  }

  async updateOnChange(textEditor) {
    let fileExcluded          = FUNCTIONS.isExcluded(textEditor.document.path, this._config)
    let detectListChange      = new Change(textEditor.document, this._config)
    let documentInCurrentList = detectListChange.documentPathExistsInList(this._items, textEditor.document)
    let updateOccurred        = false

    if (fileExcluded) {
      console.log('fileExcluded')
      if (documentInCurrentList) {
        console.log('documentInCurrentList -- REMOVE')
        // Remove all listItems with the file path.
        // this.removeListItems(detectListChange.getFilePathListItemIndexes(this._items))
        this.removeListItemsByFile(textEditor.document.path)

        updateOccurred = true
      } else {
        console.log('!documentInCurrentList -- IGNORE')
        // File can be ignored as it is excluded and does not exist in list items.
      }
    } else if (!fileExcluded) {
      console.log('!fileExcluded')
      let listItemsChanged         = await detectListChange.hasListItemsChanged(this._items)
      console.log(`documentInCurrentList: ${documentInCurrentList}, listItemsChanged: ${listItemsChanged}`)
      let documentSearch           = new DocumentSearch(this._config)
      let updatedDocumentListItems = documentSearch.searchOpenDocument(textEditor.document)

      if (documentInCurrentList && listItemsChanged) {
        // this.removeListItems(detectListChange.getFilePathListItemIndexes(this._items))
        this.removeListItemsByFile(textEditor.document.path)
        this.addListItems(updatedDocumentListItems)

        updateOccurred = true
      } else if (!documentInCurrentList && updatedDocumentListItems > 0) {
        this.addListItems(updatedDocumentListItems)
        updateOccurred = true
      } else if (!documentInCurrentList && updatedDocumentListItems <= 0) {
        console.log('File is not an existing list item && has no new tags')
      } else {
        console.log('File is not an existing list item or tags have not changed')
      }
    }

    console.log('UPDATE OCCURRED?', updateOccurred)

    return updateOccurred
  }

  /*
    Removes existing list items with a specific file path.
  */
  removeListItemsByFile(filePath) {
    this._items = this._items.filter((item) => {
      if (FUNCTIONS.normalizePath(item.path) !== FUNCTIONS.normalizePath(filePath)) {
        return item
      }
    })
  }

  addListItems(items) {
    items.forEach((item) => {
      this.addListItem(item)
    })
  }

  addListItem(item) {
    this._items = [...this._items, item]
  }
}
