/*
  Module contains the DataProvider functionality. Due to limitations in the Nova API
  at time of writing, the TreeView is not editable once part of the DataProvider.
*/
const { Configuration } = require('./Configuration.js')
const FUNCTIONS         = require('./functions.js')

exports.ToDoDataProvider = class ToDoDataProvider {
  constructor(tagsArray, groupBy) {
    this.rootItems = tagsArray
    this.groupBy   = groupBy
  }

  /*
    Returns the children tree item(s).
  */
  getChildren(toDoListItem) {
    if (!toDoListItem) {
      return this.rootItems
    }
    else {
      return toDoListItem.children
    }
  }

  /*
    Returns the parent tree item.
  */
  getParent(toDoListItem) {
    return toDoListItem.parent
  }

  /*
    Returns a specific tree item.
  */
  getTreeItem(toDoListItem) {
    if (this.groupBy == 'file') {
      var item = new TreeItem(toDoListItem.name)

      if (toDoListItem.children.length > 0) {
        item.collapsibleState = TreeItemCollapsibleState.Expanded
        item.image            = `__filetype${nova.path.extname(toDoListItem.filePath)}`
        item.contextValue     = 'file'
        item.tooltip          = toDoListItem.filePath
        item.descriptiveText  = '(' + toDoListItem.children.length + ')'
      } else {
        item.image            = this.getIconImage(toDoListItem)
        item.command          = 'todo.doubleClick'
        item.contextValue     = 'tag'
        item.descriptiveText  = `${toDoListItem.comment} (Ln: ${toDoListItem.line}, Col: ${toDoListItem.column})`
      }
    } else if (this.groupBy == 'tag') {
      if (toDoListItem.children.length > 0) {
        item = new TreeItem(toDoListItem.name)
        item.collapsibleState = TreeItemCollapsibleState.Expanded
        item.image            = this.getIconImage(toDoListItem)
        item.contextValue     = 'tag'
        item.descriptiveText  = '(' + toDoListItem.children.length + ')'
      } else {
        item = new TreeItem(toDoListItem.filePath)
        item.image            = `__filetype${nova.path.extname(toDoListItem.filePath)}`
        item.command          = 'todo.doubleClick'
        item.contextValue     = 'file'
        item.tooltip          = `${toDoListItem.comment} (Ln: ${toDoListItem.line}, Col: ${toDoListItem.column})`
      }
    }

    return item
  }

  /*
    Returns an appropriate icon name for a non-file tree item.
  */
  getIconImage(toDoListItem) {
    let itemType = toDoListItem.name.toLowerCase()

    if (itemType == 'todo' || itemType == 'fixme') {
      return toDoListItem.name.toLowerCase()
    } else {
      return 'user'
    }
  }
}
