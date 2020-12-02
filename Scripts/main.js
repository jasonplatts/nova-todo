const { ToDoDataProvider } = require("./ToDoDataProvider.js");

// TODO: Icon revision
// TODO: No Todo Items message
// TODO: Issue#6 - Add check for workspace. Process open files, if no workspace.
console.clear();
var treeView = null;
var dataProvider = null;
var refreshTimer = null;

var activate = exports.activate = function() {
  // Do work when the extension is activated
  dataProvider = new ToDoDataProvider();
  
  // Create the TreeView
  treeView = new TreeView("todo", {
    dataProvider: dataProvider
  });
  
  // TreeView implements the Disposable interface
  nova.subscriptions.add(treeView);
}

exports.deactivate = function() {
  // Clean up state before the extension is deactivated
  treeView = null;
  dataProvider = null;
  if (refreshTimer !== null) {
    clearInterval(refreshTimer);
  }
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
  let selection = treeView.selection;
  let fileStatus = nova.workspace.openFile(selection.map((e) => e.filePath));
  
  fileStatus.then (
    function() { nova.workspace.activeTextEditor.scrollToPosition(selection.map((e) => e.position)); }
  );
});

nova.commands.register("todo.refresh", () => {
  reloadData();
});

if (nova.workspace.path !== undefined && nova.workspace.path !== null) {
  nova.config.observe("todo.global-ignore-names", reloadData);
  nova.config.observe("todo.global-ignore-extensions", reloadData);
  // It is not necessary to observe the workspace config because the file system watch detects these changes.
  nova.fs.watch(null, reloadData);
} else {
  // Must use polling because nova.fs.watch requires a current workspace.
  refreshTimer = setInterval(reloadData, 15000);
}

function reloadData() {
  if (treeView !== null) {
    dataProvider.loadData();
    treeView.reload();
  }
}