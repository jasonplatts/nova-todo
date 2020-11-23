const { ToDoDataProvider } = require("./ToDoDataProvider.js");

var treeView = null;
var dataProvider = new ToDoDataProvider();

var activate = exports.activate = function() {
  // Do work when the extension is activated
  
  // Create the TreeView 
  treeView = new TreeView("todo", {
    dataProvider: dataProvider
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

function setTreeView() {
  treeView = new TreeView("todo", {
    dataProvider: new ToDoDataProvider()
  });
}

exports.deactivate = function() {
  // Clean up state before the extension is deactivated
}

nova.commands.register("todo.addPath", () => {
  addWorkspaceIgnorePath(nova.workspace.config.get("todo.selected-ignore-path"));

  nova.workspace.config.set("todo.selected-ignore-path", "");
});

nova.commands.register("todo.openFile", () => {
  let selection = treeView.selection;
  
  nova.workspace.openFile(selection.map((e) => e.filePath));
});

nova.commands.register("todo.ignoreFile", () => {
  let selection = treeView.selection;
  
  addWorkspaceIgnorePath(nova.path.normalize(selection.map((e) => e.filePath)));
});

nova.commands.register("todo.ignoreParentDirectory", () => {
  let selection = treeView.selection;
  
  addWorkspaceIgnorePath(nova.path.dirname(selection.map((e) => e.filePath)));
});

function addWorkspaceIgnorePath(path) {
  path = nova.path.normalize(path);
  let workspaceIgnorePaths = nova.workspace.config.get("todo.workspace-ignore-paths") + "," + path;
  workspaceIgnorePaths = workspaceIgnorePaths.replace("null,", "");
  
  nova.workspace.config.set("todo.workspace-ignore-paths", workspaceIgnorePaths);
}

nova.commands.register("todo.doubleClick", () => {
  // Invoked when an item is double-clicked
  let selection = treeView.selection;
  let fileStatus = nova.workspace.openFile(selection.map((e) => e.filePath));
  
  fileStatus.then (
    function() { nova.workspace.activeTextEditor.scrollToPosition(selection.map((e) => e.position)); }
  );
});

nova.commands.register("todo.refresh", () => {
  reloadData();
});

nova.config.observe("todo.global-ignore-names", reloadData);
nova.config.observe("todo.global-ignore-extensions", reloadData);
nova.workspace.config.observe("todo.workspace-ignore-paths", reloadData);
nova.workspace.config.observe("todo.workspace-ignore-names", reloadData);
nova.workspace.config.observe("todo.workspace-ignore-extensions", reloadData);
nova.fs.watch(null, reloadData);

function reloadData() {
  if (treeView !== null) {
    // treeView = null;
    // activate();
    dataProvider.getRootItems();
    treeView.reload();
  }
}
