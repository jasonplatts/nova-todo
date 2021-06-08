/*
  Module provides single file tag search functionality.
*/



exports.TagTree = class TagTree {
  constructor(tags) {
    this.rootItems = []
    console.log('HERE')
    // this.filePath = filePath
  }

}

// constructor(sortBy) {
//   this.loadData(sortBy)
// }

/*
  This is the entry point for the data provider class.
  It serves to load tree items on initial extension
  activation and on reload.
*/
// loadData(sortBy) {
//   this.rootItems = []
//   this.sortBy    = sortBy
//
//   this.configuration = new Configuration
//   this.KEYWORDS      = this.configuration.keywords
//
//   if (FUNCTIONS.isWorkspace()) {
//     this.rootItems = this.getWorkspaceRootItems()
//   } else {
//     this.rootItems = this.getOpenDocumentsRootItems()
//   }
//
//   return this.rootItems
// }


/*
ToDoDataProvider class is an interface for objects providing
data to the Nova TreeView.
*/
exports.ToDoDataProvider = class ToDoDataProvider {


/*
  Returns a promise to generates tree view items
  based on files open in the current Nova window.
  This is needed when the user does not have a
  current workspace open.
*/
getOpenDocumentsRootItems() {
  return new Promise((resolve, reject) => {
    let rootItems = []

    let openDocuments = nova.workspace.textDocuments.filter(doc => {
      if (doc.path !== undefined || doc.path !== null) {
        return doc.path
      }
    })

    openDocuments = openDocuments.map(doc => {
      return (doc.path).toString()
    })
    openDocuments = openDocuments.filter(filePath => this.isAllowedName(filePath))
    openDocuments = openDocuments.filter(filePath => this.isAllowedExtension(filePath))

    let toDoListItems = this.findToDoItemsInFilePathArray(openDocuments)
    let groupedToDoListItems = this.groupListItems(toDoListItems)

    groupedToDoListItems.forEach((toDoListItem) => {
      rootItems = [...rootItems, toDoListItem]
    })

    resolve(rootItems)
  })
}

/*
  Returns a promise to generate tree view items
  based on files that exist in the current workspace.
*/
getWorkspaceRootItems() {
  return new Promise((resolve, reject) => {
    let rootItems = []
    let fileSearchResponse = this.getMatchedWorkspaceFiles()

    fileSearchResponse.then((response, reject) => {
      let toDoListItems = this.findToDoItemsInFilePathArray(response)
      let groupedToDoListItems = this.groupListItems(toDoListItems)

      groupedToDoListItems.forEach((toDoListItem) => {
        rootItems = [...rootItems, toDoListItem]
      })

      resolve(rootItems)
    })
    fileSearchResponse.catch((alert) => {
      reject(alert)
    })
  })
}

/*
  Uses the TagEgrep class to search the current workspace
  path for files containing tag keywords. The search method
  makes use of the egrep command line application available
  in Unix based operating systems.
*/
getMatchedWorkspaceFiles() {
  return new Promise((resolve, reject) => {
    let fileHandler = new TagEgrep(nova.workspace.path, this.KEYWORDS)

    let files = fileHandler.egrepExec()

    files.then((response, reject) => {
      let filteredFiles = response.stdout
      filteredFiles = filteredFiles.filter(filePath => this.isAllowedName(filePath))
      filteredFiles = filteredFiles.filter(filePath => this.isAllowedExtension(filePath))
      filteredFiles = filteredFiles.filter(filePath => this.isAllowedPath(filePath))

      resolve(filteredFiles)
    })
    files.catch((alert) => {
      reject(alert)
    })
  })
}

groupListItems(toDoListItems) {
  let groupedToDoListItems

  if (this.sortBy == null || this.sortBy == 'file') {
    groupedToDoListItems = this.groupListItemsByFile(toDoListItems)
  } else {
    groupedToDoListItems = this.groupListItemsByTag(toDoListItems)
  }

  return groupedToDoListItems
}

/*
  Accepts an ungrouped array of ToDoListItem objects and
  returns an array of ToDoListItem objects grouped by file.
*/
groupListItemsByFile(toDoListItems) {
  let groupedtoDoListItems = []
  let distinctFilePaths    = this.getUniqueFiles(toDoListItems)
  distinctFilePaths.forEach((distinctFilePath) => {
    groupedtoDoListItems.push(new ToDoListItem(nova.path.basename(distinctFilePath)))
    groupedtoDoListItems[groupedtoDoListItems.length - 1].filePath = distinctFilePath

    let filePathToDoItems = toDoListItems.filter(
      toDoListItem => toDoListItem.filePath == distinctFilePath
    )

    filePathToDoItems.forEach(filePathToDoItem => {
      groupedtoDoListItems[groupedtoDoListItems.length - 1].addChild(filePathToDoItem)
    })
  })

  return groupedtoDoListItems
}

/*
  Accepts an array of ToDoListItem objects and returns an array
  of primitive file name values.
*/
getUniqueFiles(toDoListItems) {
  // 1) Map array to a new array containing only primitive values (don't want objects, just file names.
  // 2) Then use the Set object to store a collection of unique values,
  // 3) Which then uses the spread operator to construct a new array.
  return [...new Set(toDoListItems.map(item => item.filePath))]
}

groupListItemsByTag(toDoListItems) {
  let groupedtoDoListItems = []
  let distinctTags = this.getUniqueTags(toDoListItems)

  distinctTags.forEach((distinctTag) => {
    groupedtoDoListItems.push(new ToDoListItem(distinctTag))

    let tagToDoItems = toDoListItems.filter(
      toDoListItem => toDoListItem.name == distinctTag
    )

    tagToDoItems.forEach(tagToDoItem => {
      groupedtoDoListItems[groupedtoDoListItems.length - 1].addChild(tagToDoItem)
    })
  })

  return groupedtoDoListItems
}

getUniqueTags(toDoListItems) {
  return [...new Set(toDoListItems.map(item => item.name))]
}

/*
  Searches an array of files for keywords and returns an array
  of ToDoListItem objects for all specified files. Accepts an
  array of file path string.
*/
findToDoItemsInFilePathArray(filePathArray) {
  let toDoListItemArray = []

  filePathArray.sort(FUNCTIONS.sortByFileName)

  filePathArray.forEach((filePath) => {
    let file = nova.fs.open(filePath)
    let fileSearchResults = this.findKeywordsInFile(file)

    if (fileSearchResults.length > 0) {
      toDoListItemArray = toDoListItemArray.concat(fileSearchResults)
    }

    file.close()
  })

  return toDoListItemArray
}

/*
  Searches a file line by line for keywords
  and returns an array of ToDoListItem objects
  for a specific file. Accepts a Nova file object.
*/
findKeywordsInFile(file) {
  let contents = file.readlines()

  let fileMatches = []
  let fileLineStartPosition = 0

  for(let i = 0; i < contents.length; i++) {
    let lineMatches = this.findKeywordsInLine(contents[i])

    lineMatches.forEach((match) => {
      let toDoListItem      = new ToDoListItem(match.name)
      toDoListItem.filePath = file.path
      toDoListItem.line     = i + 1
      toDoListItem.column   = match.column
      toDoListItem.position = fileLineStartPosition + (match.column - 1)
      toDoListItem.comment  = match.comment

      fileMatches = fileMatches.concat(toDoListItem)
    })

    fileLineStartPosition += contents[i].length
  }

  return fileMatches
}



//
}
