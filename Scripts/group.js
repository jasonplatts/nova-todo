const { ToDoListItem } = require('./todo_list_item.js')

exports.Group = class Group {
  groupListItems(tagsArray, groupBy='file') {
    let groupedListItems = []

    // Unless specified, tags are grouped by file name.
    if (groupBy == null || groupBy == 'file') {
      groupedListItems = this.groupListItemsByFileName(tagsArray)
    } else {
      groupedListItems = this.groupListItemsByTagName(tagsArray)
    }

    return groupedListItems
  }

  /*
    Accepts an ungrouped array of ToDoListItem objects and
    returns an array of ToDoListItem objects grouped by file.
  */
  groupListItemsByFileName(toDoListItems) {
    let groupedToDoListItems = []
    let distinctFilePaths    = this.getUniqueFiles(toDoListItems)

    distinctFilePaths.forEach((distinctFilePath) => {
      groupedToDoListItems.push(new ToDoListItem(nova.path.basename(distinctFilePath)))
      groupedToDoListItems[groupedToDoListItems.length - 1].filePath = distinctFilePath

      let filePathToDoItems = toDoListItems.filter(
        toDoListItem => toDoListItem.filePath == distinctFilePath
      )

      filePathToDoItems.forEach(filePathToDoItem => {
        groupedToDoListItems[groupedToDoListItems.length - 1].addChild(filePathToDoItem)
      })
    })

    return groupedToDoListItems
  }

  /*
    Accepts an ungrouped array of ToDoListItem objects and
    returns an array of ToDoListItem objects grouped by tag name.
  */
  groupListItemsByTagName(toDoListItems) {
    let groupedtoDoListItems = []
    let distinctTags = this.getUniqueTags(toDoListItems)

    distinctTags.forEach((distinctTag) => {
      groupedtoDoListItems.push(new ToDoListItem(distinctTag))

      let tagToDoItems = toDoListItems.filter(
        toDoListItem => toDoListItem.name == distinctTag
      )

      tagToDoItems.forEach(tagToDoItem => {
        groupedtoDoListItems[groupedtoDoListItems.length - 1].addChild(tagToDoItem)
      })
    })

    return groupedtoDoListItems
  }

  /*
    Accepts an array of ToDoListItem objects and returns an array
    of primitive file name values.
  */
  getUniqueFiles(toDoListItems) {
    // 1) Map array to a new array containing only primitive values (don't want objects, just file names.
    // 2) Then use the Set object to store a collection of unique values,
    // 3) Which then uses the spread operator to construct a new array.
    return [...new Set(toDoListItems.map(item => item.filePath))]
  }

  /*
    Accepts an array of ToDoListItem objects and returns an array
    of primitive file name values.
  */
  getUniqueTags(toDoListItems) {
    return [...new Set(toDoListItems.map(item => item.name))]
  }
}
