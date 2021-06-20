'use strict'

const FUNCTIONS         = require('./functions.js')
const { Configuration } = require('./configuration.js')
const { List }          = require('./list.js')
const { DataProvider }  = require('./data_provider.js')

var config              = null
var list                = null
var compositeDisposable = new CompositeDisposable()
var novaTreeViewObjects = {
  dataProvider: null,
  treeView:     null
}

var compositeListeners = new CompositeDisposable()

exports.activate = async function() {
  try {
    console.clear()
    console.log('TODO EXTENSION ACTIVATED')
    console.log('Workspace Environment?', FUNCTIONS.isWorkspace())

    config = new Configuration()
    list   = new List(config)

    await list.loadItems()

    loadTreeView()
    loadActiveEditors()
    // nova.fs.watch(null, onChange)
  } catch (error) {
    FUNCTIONS.showConsoleError(error)
  }
}

function loadActiveEditors() {
  let openEditors = nova.workspace.textEditors

  openEditors.forEach((textEditor) => {
    // compositeListeners.add(textEditor.onDidSave(saveDetected))
    compositeListeners.add(textEditor.onDidSave(onChange))
  })
}

// function saveDetected(textEditor) {
//   console.log('Save Detected', textEditor.document.path)
// }

// function onClose(textEditor) {
//
// }

/*
  NOTE: At time of writing, the TreeView is not editable once it is part of
  the DataProvider object. Therefore, editable ListItem objects are handled
  using an instance of the custom ListItems class. The TreeView is then
  replaced each time a change is needed using the data stored in that ListItems
  instance.
*/
function loadTreeView() {
  novaTreeViewObjects.dataProvider = new DataProvider(list.items)

  novaTreeViewObjects.treeView     = new TreeView('todo', {
    dataProvider: novaTreeViewObjects.dataProvider
  })

  compositeDisposable.add(novaTreeViewObjects.treeView)
  nova.subscriptions.add(novaTreeViewObjects.treeView)
}

function reloadTreeView() {
  novaTreeViewObjects.dataProvider = new DataProvider(list.items)

  novaTreeViewObjects.treeView     = new TreeView('todo', {
    dataProvider: novaTreeViewObjects.dataProvider
  })

  compositeDisposable.add(novaTreeViewObjects.treeView)
  // nova.subscriptions.add(novaTreeViewObjects.treeView)
}

// function reloadTreeView() {
//   load()
// }

function resetTreeView() {
  compositeDisposable.dispose()
  novaTreeViewObjects.dataProvider = null
  novaTreeViewObjects.treeView     = null

  return true
}

async function onChange(textEditor) {
  console.log('change',textEditor.document.path)
  try {
    // if (novaTreeViewObjects.treeView !== null) {
    let updated = await list.updateOnChange(textEditor)

    console.log('Updated', updated)
    if (updated == true) {
      resetTreeView()
      reloadTreeView()
      novaTreeViewObjects.treeView.reload()
    }
    // }
  } catch (error) {
    FUNCTIONS.showConsoleError(error)
  }
}

// function onChange(filePath) {
//   console.log('change')
//   try {
//     if (novaTreeViewObjects.treeView !== null) {
//       let updated = list.updateOnChange(filePath)
//
//       if (updated == true) {
//         resetTreeView()
//         loadTreeView()
//         novaTreeViewObjects.treeView.reload()
//       }
//     }
//   } catch (error) {
//     FUNCTIONS.showConsoleError(error)
//   }
// }

exports.deactivate = function() {
  // resetTreeView()
  // Clean up state before the extension is deactivated
  // treeView = null
  // dataProvider = null
  // if (refreshTimer !== null) {
  //   clearInterval(refreshTimer)
  // }
  compositeDisposable.dispose()
  compositeListeners.dispose()
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
// async function watch() {

// }

if (nova.workspace.path !== undefined && nova.workspace.path !== null) {
  // watch()
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
