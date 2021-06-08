/*
  Module contains the dataProvider functionality used to populate the Nova sidebar
  Treeview object, including the ToDoItem and ToDoDataProvider classes.
*/
// const { Egrep }         = require('./Egrep.js')
const { Configuration } = require('./Configuration.js')
const FUNCTIONS         = require('./functions.js')

exports.ToDoItem = class ToDoItem {
  constructor(name) {
    this.name = name
    this.filePath = null
    this.line = null
    this.column = null
    this.position = null
    this.comment = null

    this.children = []
    this.parent = null
  }

  addChild(element) {
    element.parent = this
    this.children.push(element)
  }
}

exports.ToDoDataProvider = class ToDoDataProvider {
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
    if (this.sortBy == 'file') {
      var item = new TreeItem(toDoItem.name)

      if (toDoItem.children.length > 0) {
        item.collapsibleState = TreeItemCollapsibleState.Expanded
        item.image            = `__filetype${nova.path.extname(toDoItem.filePath)}`
        item.contextValue     = 'file';
        item.tooltip          = toDoItem.filePath
        item.descriptiveText  = '(' + toDoItem.children.length + ')';
      } else {
        item.image            = this.getIconImage(toDoItem)
        item.command          = 'todo.doubleClick';
        item.contextValue     = 'tag';
        item.descriptiveText  = `${toDoItem.comment} (Ln: ${toDoItem.line}, Col: ${toDoItem.column})`
      }
    } else if (this.sortBy == 'tag') {
      if (toDoItem.children.length > 0) {
        var item = new TreeItem(toDoItem.name)
        item.collapsibleState = TreeItemCollapsibleState.Expanded
        item.image            = this.getIconImage(toDoItem)
        item.contextValue     = 'tag';
        item.descriptiveText  = '(' + toDoItem.children.length + ')';
      } else {
        var item = new TreeItem(toDoItem.filePath)
        item.image            = `__filetype${nova.path.extname(toDoItem.filePath)}`
        item.command          = 'todo.doubleClick';
        item.contextValue     = 'file';
        item.tooltip          = `${toDoItem.comment} (Ln: ${toDoItem.line}, Col: ${toDoItem.column})`
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
