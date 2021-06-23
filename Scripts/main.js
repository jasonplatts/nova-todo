'use strict'

const FUNCTIONS         = require('./functions.js')
const { Configuration } = require('./configuration.js')
const { List }          = require('./list.js')
const { DataProvider }  = require('./data_provider.js')

var list                = null
var novaTreeViewObjects = {
  dataProvider: null,
  treeView:     null
}
var treeViewDisposables = new CompositeDisposable()

/*
  Function runs when the Nova TODO extension is first activated.
*/
exports.activate = function() {
  console.clear()
  console.log('TODO EXTENSION ACTIVATED')
  console.log('Workspace Environment?', FUNCTIONS.isWorkspace())

  list   = new List()

  if (FUNCTIONS.isWorkspace()) {
    list.loadItems()
      .then(() => {
        loadTreeView()
        addConfigurationMonitoring()
      })
      .catch(error => FUNCTIONS.showConsoleError(error))
  } else {
    setTimeout(reloadTreeView, 10000)
  }
}

/*
  Function runs when the Nova TODO extension is deactivated.
*/
exports.deactivate = function() {
  treeViewDisposables.dispose()
}

/*
  Loads the Nova sidebar treeView instance with data provided by the DataProvider instance.
  The DataProvider uses the List class to generate its data.

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

/*
  Refreshes the sidebar treeView without the data reloading overhead.
*/
function resetTreeView() {
  treeViewDisposables.dispose()
  novaTreeViewObjects.dataProvider = null
  novaTreeViewObjects.treeView     = null
}

/*
  Adds event listeners for each of the extension configuration options.
*/
function addConfigurationMonitoring() {
  nova.subscriptions.add(nova.config.onDidChange('todo.global-case-sensitive-tag-matching', reloadTreeView))
  nova.subscriptions.add(nova.config.onDidChange('todo.global-ignore-names', reloadTreeView))
  nova.subscriptions.add(nova.config.onDidChange('todo.global-ignore-extensions', reloadTreeView))

  Configuration.PREFERENCE_TAGS.forEach(tag => {
    nova.subscriptions.add(nova.config.onDidChange(`todo.global-tag-${tag}`, reloadTreeView))
  })
}

/*
  Reloads the tag data and configuration, then refreshes the sidebar treeView instance.
*/
async function reloadTreeView() {
  try {
    // console.log('1', list.config.caseSensitiveMatching)
    await resetTreeView()
    await list.loadItems()
    await loadTreeView()
    // console.log('2', list.config.caseSensitiveMatching)
  } catch(error) {
    FUNCTIONS.showConsoleError(error)
  }
}

/*
  Refreshes the sidebar treeView without reloading the tag data
  and configuration, which requires much less overhead.
*/
function refreshTreeView() {
  resetTreeView()
  loadTreeView()
  novaTreeViewObjects.treeView.reload()
}

/*
  Function is used when a Nova textEditor object is added or destroyed to
  update the tag list with changes after initial loading.
*/
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

function addWorkspaceIgnorePath(path) {
//   path = nova.path.normalize(path)
//   let workspaceIgnorePaths = nova.workspace.config.get('todo.workspace-ignore-paths') + ',' + path
//   workspaceIgnorePaths = workspaceIgnorePaths.replace('null,', '')
//
//   nova.workspace.config.set('todo.workspace-ignore-paths', workspaceIgnorePaths)
}

/*
  Function opens a local file to a specified location, if available.
*/
function openFile(selection) {
  selection  = novaTreeViewObjects.treeView.selection

  if (((selection[0].remote) == false) && (selection[0].path !== null)) {
    nova.workspace.openFile(selection[0].path, [selection[0].line, selection[0].column])
      .then(textEditor => {
        let position = parseInt(selection[0].position)
        let range    = new Range(position, position)

        textEditor.selectedRange = range
        textEditor.scrollToPosition(position)
      })
      .catch(error => FUNCTIONS.showConsoleError(error))
  } else {
    if ((selection[0].remote) == true) {
      FUNCTIONS.showNotification('Feature Not Supported in Remote Environment',
        'Nova does not support opening of remote files or setting of the active editor, ' +
        'which is required for navigating to this tag. If important to you, please ' +
        'submit a feature request to Panic for additional remote file support.')
    }
  }
}

// Editor Event Listeners
nova.subscriptions.add(nova.workspace.onDidAddTextEditor(onAddTextEditor))

// Command Registration
nova.commands.register('todo.addPath', () => {
//   addWorkspaceIgnorePath(nova.workspace.config.get('todo.selected-ignore-path'))
//
//   nova.workspace.config.set('todo.selected-ignore-path', '')
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

nova.commands.register('todo.openFile', () => {
  openFile(novaTreeViewObjects.treeView.selection)
})

nova.commands.register('todo.doubleClick', () => {
  openFile(novaTreeViewObjects.treeView.selection)
})

nova.commands.register('todo.refresh', async() => {
  reloadTreeView()
})

nova.commands.register('todo.group', () => {
  list.toggleGroupBy()
  refreshTreeView()
})
