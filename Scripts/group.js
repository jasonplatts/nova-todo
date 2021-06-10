const { ToDoListItem } = require('./todo_list_item.js')

exports.Group = class Group {
  groupListItems(listItemsArray, groupBy='file') {
    let groupedListItems = []

    // Unless specified, group tags by file name.
    if (groupBy == null || groupBy == 'file') {
      groupedListItems = this.groupListItemsByFileName(listItemsArray)
    } else {
      groupedListItems = this.groupListItemsByTagName(listItemsArray)
    }

    return groupedListItems
  }

  /*
    Accepts an ungrouped array of ToDoListItem objects and
    returns an array of ToDoListItem objects grouped by file.
  */
  groupListItemsByFileName(ungroupedListItems) {
    let listItems = []
    let uniquePathsArray = this.getUniqueFiles(ungroupedListItems)

    uniquePathsArray.forEach((uniquePath) => {
      listItems.push(this.createFileParentItem(uniquePath))

      // Collects into an array all of the items to be a child of the current unique path parent item.
      let childListItems = ungroupedListItems.filter(
        listItem => listItem.path == uniquePath
      )

      // For each child item, set its attributes and add to parent item.
      childListItems.forEach(childListItem => {
        childListItem = this.setFileChildAttributes(childListItem)
        listItems[listItems.length - 1].addChild(childListItem)
      })

      listItems[listItems.length - 1].descriptiveText = '(' + listItems[listItems.length - 1].children.length + ')'
    })

    return listItems
  }

  /*
    Sets the attributes of a parent list item when grouping by file name.
  */
  createFileParentItem(filePath) {
    let parentListItem              = new ToDoListItem(nova.path.basename(filePath))
    parentListItem.collapsibleState = TreeItemCollapsibleState.Expanded
    parentListItem.tooltip          = filePath
    parentListItem.path             = filePath // By default, the file type of this path is used as the list item image.

    return parentListItem
  }

  /*
    Sets the attributes of a child list item when grouping by file name.
  */
  setFileChildAttributes(childListItem) {
    childListItem.image           = this.getTagIconImage(childListItem.name)
    childListItem.command         = 'todo.doubleClick'
    childListItem.descriptiveText = `${childListItem.comment} (Ln: ${childListItem.line}, Col: ${childListItem.column})`

    return childListItem
  }

  /*
    Accepts an ungrouped array of ToDoListItem objects and
    returns an array of ToDoListItem objects grouped by tag name.
  */
  groupListItemsByTagName(ungroupedListItems) {
    let listItems = []
    let uniqueTagsArray = this.getUniqueTags(ungroupedListItems)

    uniqueTagsArray.forEach((uniqueTag) => {
      listItems.push(this.createTagParentItem(uniqueTag))

      let childListItems = ungroupedListItems.filter(
        listItem => listItem.name == uniqueTag
      )

      childListItems.forEach(childListItem => {
        childListItem = this.setTagChildAttributes(childListItem)
        listItems[listItems.length - 1].addChild(childListItem)
      })

      listItems[listItems.length - 1].descriptiveText = '(' + listItems[listItems.length - 1].children.length + ')'
    })

    return listItems
  }

  /*
    Sets the attributes of a parent list item when grouping by file name.
  */
  createTagParentItem(tagName) {
    let parentListItem              = new ToDoListItem(tagName)
    parentListItem.collapsibleState = TreeItemCollapsibleState.Expanded
    parentListItem.image            = this.getTagIconImage(tagName)

    return parentListItem
  }

  /*
    Sets the attributes of a child list item when grouping by file name.
  */
  setTagChildAttributes(childListItem) {
    childListItem.command         = 'todo.doubleClick'
    childListItem.descriptiveText = `${childListItem.comment} (Ln: ${childListItem.line}, Col: ${childListItem.column})`

    return childListItem
  }

  /*
    Returns the appropriate image name for a tag listItem.
  */
  getTagIconImage(tagType) {
    tagType = tagType.toLowerCase()

    if (tagType == 'todo' || tagType == 'fixme') {
      return tagType
    } else {
      return 'additional'
    }
  }

  /*
    Accepts an array of ToDoListItem objects and returns an array
    of primitive file name values.
  */
  getUniqueFiles(toDoListItems) {
    // 1) Map array to a new array containing only primitive values (don't want objects, just file names.
    // 2) Then use the Set object to store a collection of unique values,
    // 3) Which then uses the spread operator to construct a new array.
    return [...new Set(toDoListItems.map(item => item.path))]
  }

  /*
    Accepts an array of ToDoListItem objects and returns an array
    of primitive file name values.
  */
  getUniqueTags(toDoListItems) {
    return [...new Set(toDoListItems.map(item => item.name))]
  }


}
