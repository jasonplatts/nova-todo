const { ToDoDataProvider } = require("./ToDoDataProvider.js");

var treeView = null;

exports.activate = function() {
  // Do work when the extension is activated
  
  // Create the TreeView
  treeView = new TreeView("todo", {
    dataProvider: new ToDoDataProvider()
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

nova.commands.register("todo.group", () => {
  // Invoked when the "add" header button is clicked
  console.log("Change grouping!");
});

nova.commands.register("todo.refresh", () => {
  // Invoked when the "remove" header button is clicked
  let selection = treeView.selection;
  console.log("Refresh!");
});

nova.commands.register("todo.doubleClick", () => {
  // Invoked when an item is double-clicked
  let selection = treeView.selection;
  // console.log("DoubleClick: " + selection.map((e) => e.name));
  nova.workspace.openFile(selection.map((e) => e.filePath));
  nova.workspace.activeTextEditor.scrollToPosition(selection.map((e) => e.position));
});





