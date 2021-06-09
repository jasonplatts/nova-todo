/*
  Module contains the dataProvider functionality used to populate the Nova sidebar
  Treeview object, including the ToDoItem and ToDoDataProvider classes.
*/
const { Configuration } = require('./Configuration.js')
const FUNCTIONS         = require('./functions.js')

exports.ToDoDataProvider = class ToDoDataProvider {
  constructor(tagsArray, groupBy) {
    this.rootItems = tagsArray
    this.groupBy   = groupBy
    // console.log(JSON.stringify(tagsArray))
  }

  /*
    Returns the children tree item(s).
  */
  getChildren(toDoItem) {
    if (!toDoItem) {
      return this.rootItems
    }
    else {
      return toDoItem.children
    }
  }

  /*
    Returns the parent tree item.
  */
  getParent(toDoItem) {
    return toDoItem.parent
  }

  /*
    Returns a specific tree item.
  */
  getTreeItem(toDoItem) {
    console.log(JSON.stringify(toDoItem))
    if (this.groupBy == 'file') {
      var item = new TreeItem(toDoItem.name)

      if (toDoItem.children.length > 0) {
        item.collapsibleState = TreeItemCollapsibleState.Expanded
        item.image            = `__filetype${nova.path.extname(toDoItem.filePath)}`
        item.contextValue     = 'file'
        item.tooltip          = toDoItem.filePath
        item.descriptiveText  = '(' + toDoItem.children.length + ')'
      } else {
        item.image            = this.getIconImage(toDoItem)
        item.command          = 'todo.doubleClick'
        item.contextValue     = 'tag'
        item.descriptiveText  = `${toDoItem.comment} (Ln: ${toDoItem.line}, Col: ${toDoItem.column})`
      }
    } else if (this.sortBy == 'tag') {
      if (toDoItem.children.length > 0) {
        let childItem = new TreeItem(toDoItem.name)
        childItem.collapsibleState = TreeItemCollapsibleState.Expanded
        childItem.image            = this.getIconImage(toDoItem)
        childItem.contextValue     = 'tag'
        childItem.descriptiveText  = '(' + toDoItem.children.length + ')'
      } else {
        let childItem = new TreeItem(toDoItem.filePath)
        childItem.image            = `__filetype${nova.path.extname(toDoItem.filePath)}`
        childItem.command          = 'todo.doubleClick'
        childItem.contextValue     = 'file'
        childItem.tooltip          = `${toDoItem.comment} (Ln: ${toDoItem.line}, Col: ${toDoItem.column})`
      }
    }

    return item
  }

  /*
    Returns an appropriate icon name for a non-file tree item.
  */
  getIconImage(toDoItem) {
    let itemType = toDoItem.name.toLowerCase()

    if (itemType == 'todo' || itemType == 'fixme') {
      return toDoItem.name.toLowerCase()
    } else {
      return 'user';
    }
  }
}
