
var treeView = null;


exports.activate = function() {
    // Do work when the extension is activated
    
    // Create the TreeView
    treeView = new TreeView("mysidebar", {
        dataProvider: new FruitDataProvider()
    });
    
    treeView.onDidChangeSelection((selection) => {
        // console.log("New selection: " + selection.map((e) => e.name));
    });
    
    treeView.onDidExpandElement((element) => {
        // console.log("Expanded: " + element.name);
    });
    
    treeView.onDidCollapseElement((element) => {
        // console.log("Collapsed: " + element.name);
    });
    
    treeView.onDidChangeVisibility(() => {
        // console.log("Visibility Changed");
    });
    
    // TreeView implements the Disposable interface
    nova.subscriptions.add(treeView);
}

exports.deactivate = function() {
    // Clean up state before the extension is deactivated
}


nova.commands.register("mysidebar.add", () => {
    // Invoked when the "add" header button is clicked
    console.log("Add");
});

nova.commands.register("mysidebar.remove", () => {
    // Invoked when the "remove" header button is clicked
    let selection = treeView.selection;
    console.log("Remove: " + selection.map((e) => e.name));
});

nova.commands.register("mysidebar.doubleClick", () => {
    // Invoked when an item is double-clicked
    let selection = treeView.selection;
    console.log("DoubleClick: " + selection.map((e) => e.name));
});


class FruitItem {
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


class FruitDataProvider {
    constructor() {
        let rootItems = [];
        
        let fruits = ["Apple", "Banana", "Cherry", "Date", "Fig", "Grapefruit", "Kiwi", "Lemon", "Mango", "Nectarine", "Orange", "Pear", "Raspberry", "Strawberry", "Tangerine", "Watermellon"];
        
        fruits.forEach((f) => {
            let element = new FruitItem(f);
            
            for (let i = 0; i < 3; i++) {
                element.addChild(new FruitItem("Test " + (i + 1)));
            }
            
            rootItems.push(element);
        });
        
        this.rootItems = rootItems;
    }
    
    getChildren(element) {
        // Requests the children of an element
        if (!element) {
            return this.rootItems;
        }
        else {
            return element.children;
        }
    }
    
    getParent(element) {
        // Requests the parent of an element, for use with the reveal() method
        return element.parent;
    }
    
    getTreeItem(element) {
        // Converts an element into its display (TreeItem) representation
        let item = new TreeItem(element.name);
        if (element.children.length > 0) {
            item.collapsibleState = TreeItemCollapsibleState.Collapsed;
            item.image = "__filetype.png";
            item.contextValue = "fruit";
        }
        else {
            item.image = "__filetype.txt";
            item.command = "mysidebar.doubleClick";
            item.contextValue = "info";
        }
        return item;
    }
}

