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

exports.activate = function() {
  console.clear()
  console.log('TODO EXTENSION ACTIVATED')
  console.log('Workspace Environment?', FUNCTIONS.isWorkspace())

  config = new Configuration()
  list   = new List(config)

  if (FUNCTIONS.isWorkspace()) {
    list.loadItems()
      .then(loadTreeView)
      .catch(error => FUNCTIONS.showConsoleError(error))
  } else {
    setTimeout(reloadTreeView, 10000)
  }
}

exports.deactivate = function() {
  treeViewDisposables.dispose()
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

async function reloadTreeView() {
  await resetTreeView()
  await list.loadItems()
  await loadTreeView()
  novaTreeViewObjects.treeView.reload()
}

function refreshTreeView() {
  resetTreeView()
  loadTreeView()
  novaTreeViewObjects.treeView.reload()
}

function onChange(textEditor) {
  // Prevents the extension from attempting to evaluate a brand new unsaved document.
  if (textEditor.document.isUntitled !== true) {
    list.updateOnChange(textEditor)
      .then(updated => {
        if (updated === true) {
          refreshTreeView()
        }
      })
      .catch(error => FUNCTIONS.showConsoleError(error))
  }
}

nova.subscriptions.add(nova.workspace.onDidAddTextEditor(onAddTextEditor))

/*
  This function is a callback function to the onDidAddTextEditor event listener.
  It fires for each open editor at the time the extension is activated
  and any time a new editor is opened.
*/
function onAddTextEditor(textEditor) {
  nova.subscriptions.add(textEditor.onDidSave(onChange))

  // Local workspaces get all tags on load and only need to be monitored when a document is saved.
  if (!FUNCTIONS.isWorkspace()) {
    // The onDidDestroy event listener callback is not immediately run like onDidSave
    nova.subscriptions.add(textEditor.onDidDestroy(onChange))
    onChange(textEditor)
  }
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
  let selection  = novaTreeViewObjects.treeView.selection
  let remote     = selection.map(e => e.remote)
  let path       = selection.map(e => e.path)
  let line       = selection.map(e => e.line)
  let column     = selection.map(e => e.column)

  // The Nova API does not currently support setting the activeEditor or opening remote files.
  if (FUNCTIONS.isWorkspace() || remote == false) {
    nova.workspace.openFile(path, [line, column])
      .then(textEditor => {
        let position = parseInt(selection.map(e => e.position))
        let range    = new Range(position, position)

        textEditor.selectedRange = range
        textEditor.scrollToPosition(position)
      })
      .catch(error => FUNCTIONS.showConsoleError(error))
  } else {
    FUNCTIONS.showNotification('Feature Not Supported in Remote Environment', 'Nova does not support opening of remote files or setting of the active editor, which is required for navigating to this tag. If important to you, please submit a feature request to Panic for additional remote file support.')
  }
})

nova.commands.register('todo.refresh', async() => {
  reloadTreeView()
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
