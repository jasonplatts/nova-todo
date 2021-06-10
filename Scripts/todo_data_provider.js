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
    Converts a listItem object into a TreeItem object.
  */
  getTreeItem(listItem) {
    var item = new TreeItem(listItem.name)

    item.collapsibleState = listItem.collapsibleState
    item.command          = listItem.command
    item.color            = listItem.color
    item.contextValue     = listItem.contextValue
    item.descriptiveText  = listItem.descriptiveText
    item.identifier       = listItem.identifier
    item.image            = listItem.image
    item.path             = listItem.path
    item.tooltip          = listItem.tooltip

    return item
  }
}
