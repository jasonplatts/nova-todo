const { ToDoDataProvider } = require("./ToDoDataProvider.js");

console.clear();

var treeView = null;
var dataProvider = new ToDoDataProvider();  

var activate = exports.activate = function() {
  // Do work when the extension is activated
  // Create the TreeView 
  // treeView = new TreeView("todo", {
  //   dataProvider: dataProvider
  // });
  setTreeView();
  
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
  treeView = null;
  dataProvider = null;
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

function change(path) {
  console.clear();
  // // console.log("ROOT", dataProvider.rootItems);
  // // console.log(path);
  // // console.log(dataProvider.loadData());
  // console.log("CHANGE");
  // setTimeout(() => {
  //   dataProvider = new ToDoDataProvider();
  //   
  //   dataProvider.rootItems.then(() => {
  //     console.log("LOADED");
  //     setTreeView();
  //     treeView.reload();
  //   })
  //   // let updateResponse = dataProvider.loadData();
  //     console.log("REALOADING");
  //     // treeView.dispose()
  //     // setTreeView();
  //     
  //   // 
  //   // updateResponse.then((response) => {
  //   // });
  // }, 5000);
  
  // setTimeout(() => {
  //   console.log("HERE NOW");
  //   treeView.reload();
  // }, 1000);
  
  // let file = nova.fs.open(path);
  // let fileEvaluation = dataProvider.findKeywordsInFile(file);
  // if (fileEvaluation.length > 0) {
  //   console.log("THERE IS A KEYWORD FOUND");
  //   // Remove any any ref. to that file and add the new parent element.
  //   // console.log(t)
  //   // console.log("ROOT ITEMS", dataProvider.rootItems);
  //   let results = dataProvider.getRootItems();
  //   
  //   results.then((items) => {
  //     console.log("DONE");
  //     console.log("ITEMS", JSON.stringify(items));
  //     // treeView.reload()
  //   });
  //   // console.log("TREE VIEW", JSON.stringify(treeView));
  // } else {
  //  console.log("NO KEYWORDS FOUND");
  //  // Remove any ref. to that file in RootItems array by removing parent element.
  // }
  // loadData();
}

function reloadData() {
  console.clear();
  if (treeView !== null) {
    // treeView.dispose();
    // setTreeView();
    dataProvider.loadData();
    treeView.reload();
  }
}
