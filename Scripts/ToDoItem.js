module.exports.ToDoItem = class ToDoItem {
    constructor(name) {
        this.name = name;
        this.children = [];
        this.parent = null;
    }
    
    addChild(element) {
        element.parent = this;
        this.children.push(element);
    }
}