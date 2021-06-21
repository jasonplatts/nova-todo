'use strict'

const FUNCTIONS         = require('./functions.js')
const { Configuration } = require('./configuration.js')
const { List }          = require('./list.js')
const { DataProvider }  = require('./data_provider.js')

var config              = null
var list                = null
var novaTreeViewObjects = {
  dataProvider: null,
  treeView:     null
}
var treeViewDisposables = new CompositeDisposable()

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
  } catch (error) {
    FUNCTIONS.showConsoleError(error)
  }
}

function loadActiveEditors() {
  let openEditors = nova.workspace.textEditors

  openEditors.forEach((textEditor) => {
    nova.subscriptions.add(textEditor.onDidSave(onChange))
  })
}

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

  treeViewDisposables.add(novaTreeViewObjects.treeView)
}

function resetTreeView() {
  treeViewDisposables.dispose()
  novaTreeViewObjects.dataProvider = null
  novaTreeViewObjects.treeView     = null
}

async function onChange(textEditor) {
  try {
    let updated = await list.updateOnChange(textEditor)

    if (updated == true) {
      await resetTreeView()
      await loadTreeView()
      novaTreeViewObjects.treeView.reload()
    }
  } catch (error) {
    FUNCTIONS.showConsoleError(error)
  }
}

exports.deactivate = function() {
  treeViewDisposables.dispose()
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
// nova.config.observe('todo.global-ignore-names', reloadData)
// nova.config.observe('todo.global-ignore-extensions', reloadData)
// PREFERENCE_KEYWORDS.forEach(keyword => {
//   nova.config.observe(`todo.global-keyword-${keyword}`, reloadData)
// })
