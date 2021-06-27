'use strict'

const FUNCTIONS           = require('./functions.js')
const { Configuration }   = require('./configuration.js')
const { WorkspaceSearch } = require('./workspace_search.js')
const { DocumentSearch }  = require('./document_search.js')
const { Change }          = require('./change.js')
const { Group }           = require('./group.js')

exports.List = class List {
  constructor() {
    this._config = null
    this._items  = []
  }

  async loadConfig() {
    let config   = new Configuration()
    this._config = await config.load()

    return true
  }

  async loadItems() {
    await this.loadConfig()

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
    let filteredFilePaths = FUNCTIONS.filterFilePathArray(await workspaceSearch.search(), this._config)

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

  toggleGroupBy() {
    this._config.toggleGroupBy()
  }

  get config() {
    return this._config
  }

  get items() {
    if (this._items.length > 0) {
      let group        = null
      let groupeditems = []

      this.sortItemsByFileName()

      group        = new Group()
      groupeditems = group.groupListItems(this._items, this._config.groupBy)

      return groupeditems
    } else {
      return this._items
    }
  }

  async updateOnChange(textEditor) {
    // For non-workspace environments, the updateOnChange method will be called before
    // the list.loadItems that otherwise loads the config.
    if (this._config === null) {
      await this.loadConfig()
    }

    let fileExcluded          = FUNCTIONS.isExcluded(textEditor.document.path, this._config)
    let detectListChange      = new Change(textEditor.document, this._config)
    let documentInCurrentList = detectListChange.documentPathExistsInList(this._items, textEditor.document)
    let updateOccurred        = false

    if (fileExcluded) {
      // File can be ignored as it is excluded and does not exist in list items.
      if (documentInCurrentList) {
        this.removeListItemsByFile(textEditor.document.path)

        updateOccurred = true
      }
    } else if (!fileExcluded) {
      let listItemsChanged         = detectListChange.hasListItemsChanged(this._items)
      let documentSearch           = new DocumentSearch(this._config)
      let updatedDocumentListItems = documentSearch.searchOpenDocument(textEditor.document)

      // File can be ignored if not in current list and has no tags detected
      // File can also be ignored if not in current list or tags have not changed.
      if (documentInCurrentList && listItemsChanged) {
        this.removeListItemsByFile(textEditor.document.path)
        this.addListItems(updatedDocumentListItems)

        updateOccurred = true
      } else if (!documentInCurrentList && updatedDocumentListItems.length > 0) {
        this.addListItems(updatedDocumentListItems)
        updateOccurred = true
      }
    }

    return updateOccurred
  }

  /*
    Sorts the list items according to file name.
  */
  sortItemsByFileName() {
    this._items.sort(function(itemA, itemB) {
      // The path.split('/').pop() returns the file name from the file path.
      let fileNameA = itemA.path.split('/').pop().toLowerCase()
      let fileNameB = itemB.path.split('/').pop().toLowerCase()

      if (fileNameA < fileNameB) {
        return -1
      }

      if (fileNameA > fileNameB) {
        return 1
      }

      // File names are equal
      return 0
    })
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
