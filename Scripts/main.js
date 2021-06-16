const FUNCTIONS            = require('./functions.js')
const { Configuration }    = require('./configuration.js')
const { WorkspaceSearch }  = require('./workspace_search.js')
const { DocumentSearch }   = require('./document_search.js')
const { Group }            = require('./group.js')
const { WorkspaceChange }  = require('./workspace_change.js')
const { ToDoDataProvider } = require('./todo_data_provider.js')

var compositeDisposable = new CompositeDisposable()
var config              = new Configuration()
var groupBy             = 'file'
var listItems           = []
var dataProvider        = null
var treeView            = null

// var refreshTimer = null
// var dataProvider = null

/*
ON CHANGE DETECTED

if file !ignored
  get tags of changed file using extension function

  if tags different (compare arrays for file)
    reload tree
  end
end
*/
exports.activate = function() {
  console.clear()
  console.log('TODO EXTENSION ACTIVATED')

  load()
}

function loadTreeView() {
  /*
    NOTE: At time of writing, the TreeView is not editable once it is part of
    the DataProvider object. Therefore, the original ListItem array must be edited, then the Nova TreeView
    disposed and replaced by a completely new TreeView object.
  */
  let group            = new Group()
  let groupedListItems = group.groupListItems(listItems, groupBy)
  dataProvider         = new ToDoDataProvider(groupedListItems)

  // Convert array of editable ListItem objects to a Nova TreeView object.
  treeView = new TreeView('todo', {
    dataProvider: dataProvider
  })

  compositeDisposable.add(treeView)
  nova.subscriptions.add(treeView)
}

function reloadTreeView() {
  load()
}

function reset() {
  compositeDisposable.dispose()
  listItems    = []
  dataProvider = null
  treeView     = null
}

function load() {
  if (FUNCTIONS.isWorkspace()) {
    let workspaceSearch = new WorkspaceSearch(nova.workspace.path, config)
    let files           = workspaceSearch.search()

    files
      .then((response, reject) => {
        response = FUNCTIONS.filterFilePathArray(response, config)
        response.sort(FUNCTIONS.sortByFileName)

        response.forEach((filePath) => {
          let fileSearch = new DocumentSearch(config)
          listItems      = [...listItems, ...fileSearch.searchFile(filePath)]
        })

        loadTreeView()
      })
      .catch((error) => {
        FUNCTIONS.showConsoleError(error)
      })
  } else {
    let openDocuments = nova.workspace.textDocuments

    openDocuments = FUNCTIONS.filterOpenDocumentArray(openDocuments, config)

    openDocuments.forEach((textDocument) => {
      let documentSearch = new DocumentSearch(config)
      listItems = [...listItems, ...documentSearch.searchOpenDocument(textDocument)]
    })

    let group = new Group()
    listItems = group.groupListItems(listItems, groupBy)

    loadTreeView()
  }
}

async function onChange(filePath) {
  if (treeView !== null) {
    let fileExcluded     = FUNCTIONS.isExcluded(filePath, config)
    let workspaceChange  = new WorkspaceChange(listItems)
    let fileExists       = workspaceChange.fileExists(filePath)
    let listItemsChanged = workspaceChange.hasListItemsChanged(filePath, config)
    let newSaveFileListItems = new DocumentSearch

    if (fileExcluded && fileExists) {
      console.log('HERE')
      workspaceChange.removeFileListItems(filePath)
    }

    if (listItemsChanged == true) {
      reset()
      reloadTreeView()
      await treeView.reload()
    }

    if (fileExcluded == false) {
      if (fileExists) {


      }
    }


    /*

    get if file is excluded
    get if is in listitems

    if file exlucded && inlistitems
      remove file tags from listitems

    if file excluded && not in list items
      ignore it

    if file not excluded
      if file in listItems && listItemsChanged
        remove file tags from listItems
        add file tags to list items (getTagsForFile)
        reset
        refresh tree

      if file not in listItems && (getTagsForFile > 0)
        add file tags to listItems (getTagsForFile)

      if file in listItems && notChanged
        ignore it

      if file not in listItems && getTagsForFile < 1)
        ignore it

    */
  }



  //console.log(filePath)
  //console.log('File Excluded?', fileExcluded)
  //console.log('File Exists?', fileExists)

  // if ((!fileExcluded) && (fileExists)) {

  // console.log('Not excluded')
  // workspaceChange = new WorkspaceChange(tagsArray)
  // console.log('File exists',workspaceChange.fileExists(file))

  /*

      does file exist in tagsArray?
      is file excluded



      if is excluded && doesnt exists tagsarray
        do nothing
      end

      if not excluded
        get current tags in tags array
        search tags

        if tags found == current tags in array
          do nothing
        else
          remove all listItems with that filepath
          reload tree
        end
    */
  // } else {
    /*
    if is excluded && exists in tagsArray
    remove all listItems with that filepath
    reload tree
    end*/
  // }
  // openDocuments = FUNCTIONS.isAllowedPath(openDocuments, config)
  // console.log("CHANGE DETECTED")
  //
}


exports.deactivate = function() {
  reset()
  // Clean up state before the extension is deactivated
  // treeView = null
  // dataProvider = null
  // if (refreshTimer !== null) {
  //   clearInterval(refreshTimer)
  // }
}

nova.commands.register('todo.addPath', () => {
//   addWorkspaceIgnorePath(nova.workspace.config.get('todo.selected-ignore-path'))
//
//   nova.workspace.config.set('todo.selected-ignore-path', '')
})

nova.commands.register('todo.openFile', () => {
//   let selection = treeView.selection
//
//   nova.workspace.openFile(selection.map((e) => e.filePath))
})

nova.commands.register('todo.ignoreFile', () => {
//   let selection = treeView.selection
//
//   addWorkspaceIgnorePath(nova.path.normalize(selection.map((e) => e.filePath)))
})

nova.commands.register('todo.ignoreParentDirectory', () => {
//   let selection = treeView.selection
//
//   addWorkspaceIgnorePath(nova.path.dirname(selection.map((e) => e.filePath)))
})

function addWorkspaceIgnorePath(path) {
//   path = nova.path.normalize(path)
//   let workspaceIgnorePaths = nova.workspace.config.get('todo.workspace-ignore-paths') + ',' + path
//   workspaceIgnorePaths = workspaceIgnorePaths.replace('null,', '')
//
//   nova.workspace.config.set('todo.workspace-ignore-paths', workspaceIgnorePaths)
}

nova.commands.register('todo.doubleClick', () => {
//   let selection = treeView.selection
//
//   let path = selection.map((e) => e.filePath)
//   let line = selection.map((e) => e.line)
//   let column = selection.map((e) => e.column)
//
//   let fileStatus = nova.workspace.openFile(path, [line, column])
//
//   fileStatus.then (
//     function() {
//       let editor = nova.workspace.activeTextEditor
//       let position = parseInt(selection.map((e) => e.position))
//       let range = new Range(position, position)
//
//       editor.selectedRange = range
//       editor.scrollToPosition(position)
//     }
//   )
})

nova.commands.register('todo.refresh', () => {
  // reloadData()
})

nova.commands.register('todo.sort', () => {
//   if (sortBy == 'file') {
//     sortBy = 'tag'
//   } else {
//     sortBy = 'file'
//   }
//
//   reloadData(sortBy)
})

// nova.config.observe('todo.global-case-sensitive-tag-matching', reloadData)

// TODO: Remove this and retrieve from extension.json or a Nova API if provided - Duplicated in Configuration.js too.
// const PREFERENCE_KEYWORDS = [
//   'broken', 'bug', 'debug', 'deprecated', 'example', 'error',
//   'err', 'fail', 'fatal', 'fix', 'hack', 'idea', 'info', 'note', 'optimize', 'question',
//   'refactor', 'remove', 'review', 'task', 'trace', 'update', 'warn', 'warning'
// ]
//
// PREFERENCE_KEYWORDS.forEach(keyword => {
//   nova.config.observe(`todo.global-keyword-${keyword}`, reloadData)
// })

// nova.config.observe('todo.global-ignore-names', reloadData)
// nova.config.observe('todo.global-ignore-extensions', reloadData)
// nova.fs.watch()
if (nova.workspace.path !== undefined && nova.workspace.path !== null) {
  nova.fs.watch(null, onChange)
  // It is not necessary to observe the workspace config because the file system watch detects these changes.

} else {
  // Must use polling because nova.fs.watch requires a current workspace.
  // refreshTimer = setInterval(reloadData, 15000)
}

function updateData() {
//   if (treeView !== null) {
//
//   }
}


function reloadData() {
  // if (treeView !== null) {
  //   // dataProvider.loadData(sortBy)
  //   // dataProvider.refresh()
  //   treeView.reload()
  // }
}
