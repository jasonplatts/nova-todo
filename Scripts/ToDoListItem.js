module.exports.ToDoListItem = class ToDoListItem {
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
