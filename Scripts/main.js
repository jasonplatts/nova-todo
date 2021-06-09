const FUNCTIONS            = require('./functions.js')

const { Configuration }    = require('./configuration.js')
const { WorkspaceSearch }  = require('./workspace_search.js')
const { FileSearch }       = require('./file_search.js')

const { TagTree }          = require('./tag_tree.js')
const { ToDoDataProvider } = require('./todo_data_provider.js')

var tagTree = null

// var refreshTimer = null
var sortBy = 'file'
var config = new Configuration()

// var treeView = null
// var dataProvider = null
/*
ON ACTIVATE

If workspace
   get positive tags using egrep
   get tags using extension function
else
  get tags of open files using extension function
end

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

  let tags = []

  if (FUNCTIONS.isWorkspace()) {
    let workspaceSearch = new WorkspaceSearch(nova.workspace.path, config)
    let files           = workspaceSearch.search()

    files.then((response, reject) => {
      let filteredFiles = FUNCTIONS.filePathArray(response, config)

      let tags = []

      filteredFiles.forEach((filePath) => {
        let fileSearch = new FileSearch(filePath, config)
        tags           = [...tags, ...fileSearch.search()]
      })

      console.log(JSON.stringify(tags))
      setTagTree(tags)
    })
  } else {
    // remote or single file.
    // find open files.
  }



  // Create the TreeView
  // treeView = new TreeView('todo', {
  //   dataProvider: new ToDoDataProvider(sortBy)
  // })

  // TreeView implements the Disposable interface
  // nova.subscriptions.add(treeView)
}

function setTagTree(tags) {
  // Convert array of tags to editable extension version of the treeview
  tagTree = new TagTree(tags)
}

exports.deactivate = function() {
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

if (nova.workspace.path !== undefined && nova.workspace.path !== null) {
  // It is not necessary to observe the workspace config because the file system watch detects these changes.
  // nova.fs.watch(null, reloadData)
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
