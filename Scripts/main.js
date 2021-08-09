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
exports.activate = async function() {
  if (nova.inDevMode()) {
    console.clear()
    console.log('TODO EXTENSION ACTIVATED')
    console.log('Workspace Environment?', FUNCTIONS.isWorkspace())
  }

  list = new List()
  await list.loadConfig()
  addGlobalConfigurationMonitoring()

  // Workspace environments load via initial egrep, then update on save via extension search.
  // Local non-workspace and remote load items when editors are added and update on save. Both via extension search.
  if (FUNCTIONS.isWorkspace()) {
    try {
      await list.loadItems()
      loadTreeView()
      addWorkspaceConfigurationMonitoring()
      nova.subscriptions.add(nova.workspace.onDidAddTextEditor(onAddWorkspaceTextEditor))
    } catch (error) {
      FUNCTIONS.showConsoleError(error)
    }
  } else {
    // Editor Event Listeners
    nova.subscriptions.add(nova.workspace.onDidAddTextEditor(onAddNonWorkspaceTextEditor))
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
  Reloads the tag data and configuration, then refreshes the sidebar treeView instance.
*/
async function reloadTreeView() {
  try {
    await resetTreeView()
    await list.loadItems()
    await loadTreeView()
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
  and any time a new editor is opened. This is used for workspace environments.
*/
function onAddWorkspaceTextEditor(textEditor) {
  nova.subscriptions.add(textEditor.onDidSave(onChange))
}

/*
  This function is a callback function to the onDidAddTextEditor event listener.
  It fires for each open editor at the time the extension is activated
  and any time a new editor is opened. This is used for local non-workspace and
  remote environments.
*/
function onAddNonWorkspaceTextEditor(textEditor) {
  onChange(textEditor)
  nova.subscriptions.add(textEditor.onDidSave(onChange))
  nova.subscriptions.add(textEditor.onDidDestroy(onChange))
}

/*
  Function opens a local file to a specified location, if available.
*/
function openFile(selection) {
  if (novaTreeViewObjects.treeView.selection !== null) {
    selection  = novaTreeViewObjects.treeView.selection

    if (selection[0] !== undefined) {
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
  }
}

/*
  Adds event listeners for each of the global extension configuration options.
*/
async function addGlobalConfigurationMonitoring() {
  nova.subscriptions.add(nova.config.onDidChange('todo.global-case-sensitive-tag-matching', reloadTreeView))
  nova.subscriptions.add(nova.config.onDidChange('todo.global-ignore-names', reloadTreeView))
  nova.subscriptions.add(nova.config.onDidChange('todo.global-ignore-extensions', reloadTreeView))

  Configuration.PREFERENCE_TAGS.forEach(tag => {
    nova.subscriptions.add(nova.config.onDidChange(`todo.global-tag-${tag}`, reloadTreeView))
  })

  return true
}

/*
  Adds event listeners for each of the workspace extension configuration options.
*/
async function addWorkspaceConfigurationMonitoring() {
  if (FUNCTIONS.isWorkspace()) {
    nova.subscriptions.add(nova.workspace.config.onDidChange('todo.workspace-case-sensitive-tag-matching', reloadTreeView))
    nova.subscriptions.add(nova.workspace.config.onDidChange('todo.workspace-custom-tags', reloadTreeView))

    Configuration.PREFERENCE_TAGS.forEach(tag => {
      nova.subscriptions.add(nova.config.onDidChange(`todo.workspace-tag-${tag}`, reloadTreeView))
    })

    nova.subscriptions.add(nova.workspace.config.onDidChange('todo.workspace-ignore-paths', reloadTreeView))
    nova.subscriptions.add(nova.workspace.config.onDidChange('todo.workspace-ignore-names', reloadTreeView))
    nova.subscriptions.add(nova.workspace.config.onDidChange('todo.workspace-ignore-extensions', reloadTreeView))
  }

  return true
}

// Command Registration
nova.commands.register('todo.ignoreFile', () => {
  try {
    let selection = novaTreeViewObjects.treeView.selection

    if (FUNCTIONS.isWorkspace() && (selection[0].remote !== true)) {
      if (selection[0].path !== null) {
        nova.workspace.config.set('todo.workspace-ignore-paths', FUNCTIONS.normalizePath(selection[0].path))
      }
    } else {
      FUNCTIONS.showNotification('Feature Not Supported in Non-Workspace Environments',
        'This extension does not support the exclusion of file paths in local non-workspace or remote envionrments. ' +
        'If you wish to ignore a file or directory name, please add it to the TODO global configuration options.')
    }
  } catch (error) {
    FUNCTIONS.showConsoleError(error)
  }
})

nova.commands.register('todo.ignoreParentDirectory', () => {
  try {
    let selection = novaTreeViewObjects.treeView.selection

    if (selection[0] !== undefined) {
      if (FUNCTIONS.isWorkspace() && (selection[0].remote !== true)) {
        if (selection[0].path !== null) {
          let parentDir = nova.path.dirname(selection[0].path)
          nova.workspace.config.set('todo.workspace-ignore-paths', parentDir)
        }
      } else {
        FUNCTIONS.showNotification('Feature Not Supported in Remote Environment',
          'This extension does not support the exclusion of file paths in local non-workspace or remote envionrments. ' +
          'If you wish to ignore a file or directory name, please add it to the TODO global configuration options.')
      }
    }
  } catch (error) {
    FUNCTIONS.showConsoleError(error)
  }
})

nova.commands.register('todo.openFile', () => {
  if (novaTreeViewObjects.treeView.selection !== null) {
    openFile(novaTreeViewObjects.treeView.selection)
  }
})

nova.commands.register('todo.doubleClick', () => {
  if (novaTreeViewObjects.treeView.selection !== null) {
    openFile(novaTreeViewObjects.treeView.selection)
  }
})

nova.commands.register('todo.refresh', async() => {
  reloadTreeView()
})

nova.commands.register('todo.group', () => {
  list.toggleGroupBy()
  refreshTreeView()
})

// TODO: Add reloading when adding or deleting files from project.
