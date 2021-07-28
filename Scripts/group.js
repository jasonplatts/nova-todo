'use strict'

const { ListItem } = require('./list_item.js')

/*
  Class provides the final list item grouping and attribute completion of an ungrouped ListItem object array.
  It should be used prior to sending the ungrouped ListItem object array to the DataProvider for display in
  a Nova sidebar TreeView object.
*/
exports.Group = class Group {
  groupListItems(ungroupedListItems, groupBy) {
    let listItems = []

    if (groupBy !== 'tag') {
      listItems = this.groupListItemsByFileName(ungroupedListItems)
    } else {
      listItems = this.groupListItemsByTagName(ungroupedListItems)
    }

    return listItems
  }

  /*
    Accepts an ungrouped array of ListItem objects and
    returns an array of ListItem objects grouped by file.
  */
  groupListItemsByFileName(ungroupedListItems) {
    let listItems = []
    let uniquePaths = this.getUniqueFiles(ungroupedListItems)

    uniquePaths.forEach((uniquePath) => {
      listItems = [...listItems, this.createFileParentItem(uniquePath)]

      // Collects into an array all of the items to be a child of the current unique path parent item.
      let childListItems = ungroupedListItems.filter(
        listItem => listItem.path == uniquePath
      )

      // For each child item, set its attributes and add to parent list item.
      childListItems.forEach(childListItem => {
        childListItem = this.setFileChildAttributes(childListItem)
        listItems[listItems.length - 1].addChild(childListItem)
      })

      // Set the remote status of parent to that of the child.
      if (listItems[listItems.length - 1].children.length > 0) {
        listItems[listItems.length - 1].remote = listItems[listItems.length - 1].children[0].remote
      }

      listItems[listItems.length - 1].descriptiveText = `(${listItems[listItems.length - 1].children.length})`
    })

    return listItems
  }

  /*
    Sets the attributes of a parent list item when grouping by file name.
  */
  createFileParentItem(filePath) {
    let parentListItem              = new ListItem(nova.path.basename(filePath))
    parentListItem.collapsibleState = TreeItemCollapsibleState.Expanded
    parentListItem.tooltip          = filePath
    // By default, the file type of this path is used as the list item image.
    parentListItem.path             = filePath

    return parentListItem
  }

  /*
    Sets the attributes of a child list item when grouping by file name.
  */
  setFileChildAttributes(childListItem) {
    childListItem.name            = childListItem.tag
    childListItem.image           = this.getTagIconImage(childListItem.name)
    childListItem.descriptiveText = `${childListItem.comment} (Ln: ${childListItem.line}, Col: ${childListItem.column})`

    return childListItem
  }

  /*
    Accepts an ungrouped array of ListItem objects and
    returns an array of ListItem objects grouped by tag name.
  */
  groupListItemsByTagName(ungroupedListItems) {
    let listItems = []
    let uniqueTagsArray = this.getUniqueTags(ungroupedListItems)

    uniqueTagsArray.forEach((uniqueTag) => {
      listItems = [...listItems, this.createTagParentItem(uniqueTag)]

      let childListItems = ungroupedListItems.filter(
        listItem => listItem.name == uniqueTag
      )

      listItems[listItems.length - 1].descriptiveText = `(${childListItems.length})`

      childListItems.forEach(childListItem => {
        childListItem = this.setTagChildAttributes(childListItem)
        listItems[listItems.length - 1].addChild(childListItem)
      })
    })

    return listItems
  }

  /*
    Sets the attributes of a parent list item when grouping by file name.
  */
  createTagParentItem(tagName) {
    let parentListItem              = new ListItem(tagName)
    parentListItem.collapsibleState = TreeItemCollapsibleState.Expanded
    parentListItem.image            = this.getTagIconImage(tagName)

    return parentListItem
  }

  /*
    Sets the attributes of a child list item when grouping by file name.
  */
  setTagChildAttributes(childListItem) {
    childListItem.name    = nova.path.basename(childListItem.path)
    childListItem.image   = null
    childListItem.tooltip = childListItem.path

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
    Accepts an array of ListItem objects and returns an array
    of primitive file name values.
  */
  getUniqueFiles(listItems) {
    // 1) Map array to a new array containing only primitive values (don't want objects, just file names.
    // 2) Then use the Set object to store a collection of unique values,
    // 3) Which then uses the spread operator to construct a new array.
    return [...new Set(listItems.map(item => item.path))]
  }

  /*
    Accepts an array of ToDoListItem objects and returns an array
    of primitive file name values.
  */
  getUniqueTags(listItems) {
    return [...new Set(listItems.map(item => item.name))]
  }
}
