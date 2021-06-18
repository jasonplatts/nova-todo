const FUNCTIONS           = require('./functions.js')
const { WorkspaceSearch } = require('./workspace_search.js')
const { DocumentSearch }  = require('./document_search.js')
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

    filteredFilePaths.sort(FUNCTIONS.sortByFileName)

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

  /*
    Determines if the listItem objects found in a document
    match the tags in the existing listItems array.
  */
  hasListItemsChanged(filePath) {
    let newFileSearch = new DocumentSearch(this._config)
    let newListItems = newFileSearch.searchFile(filePath)
    let existingListItems = this.getListItemsForFile(filePath)

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
    // console.log('ItemA', itemA.name + ', ' + itemA.line + ', ' + itemA.column + ', ' + itemA.position + ', ' + itemA.comment)
    // console.log('ItemB', itemB.name + ', ' + itemB.line + ', ' + itemB.column + ', ' + itemB.position + ', ' + itemB.comment)
    if ((itemA.name     == itemB.name) &&
        (itemA.line     == itemB.line) &&
        (itemA.column   == itemB.column) &&
        (itemA.position == itemB.position) &&
        (itemA.comment  == itemB.comment)) {
      // console.log('true')
      return true
    } else {
      // console.log('false')
      return false
    }
  }

  /*
    Returns an array of listItem objects with a specified file path.
  */
  getListItemsForFile(filePath) {
    let existingListItems = []

    filePath = FUNCTIONS.normalizePath(filePath)

    this.listItems.forEach((listItem) => {
      if (listItem.path == filePath) {
        existingListItems = [...existingListItems, listItem]
      }
    })

    return existingListItems
  }

  /*
    Removes listItems with a specified path and returns a new listItem array
  */
  removeFileListItems(filePath) {
    let removeIndexes = []
    let itemCount     = 0

    for(0; itemCount < this.listItems.length; itemCount++) {
      if (this.listItems[itemCount].path == filePath ) {
        removeIndexes = [...removeIndexes, itemCount]
      }
    }

    console.log('removeIndexes', removeIndexes)
  }
}
