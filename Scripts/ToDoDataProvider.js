const { ToDoListItem } = require("./ToDoListItem.js");

module.exports.ToDoDataProvider = class ToDoDataProvider {
  constructor() {
    const GROUP_BY = "file"; // Could also be "todo".
    
    let rootItems = [];
    
    let files = this.getMatchedWorkspaceFilePaths(nova.workspace.path);
    files.sort(this.sortByFileName);
    
    console.clear();
    
    if (GROUP_BY == "file") {
      files.forEach((file) => {
        // console.log("f: ", file);
        let element = new ToDoListItem(nova.path.basename(file));
        
        for (let i = 0; i < 3; i++) {
          element.addChild(new ToDoListItem("Comment that doesn't fit. " + (i + 1)));
        }
        
        rootItems.push(element);
      });
      
      this.rootItems = rootItems;
    } else {
      // Group by Todo Tags (Todo or Fixme).
    }
    
    //results.forEach((result) => {
      // console.log(`Ln: ${result.line} Col: ${result.column}, ${result.comment}`);
    //})
    
    // todos.forEach((listItem) => {
    //   console.log("f: ", listItem);
    //   let groupBy = "file";
    //   let element = null;
    //   if (groupBy == "file") {
    //     // If grouping by file, the item will be a path.
    //     element = new ToDoListItem("A FILE NAME");
    //   } else {
    //     // Group by Tag  
    //     element = new ToDoListItem("TAG NAME");
    //   }
    //   
    //   
    //   for (let i = 0; i < 3; i++) {
    //     element.addChild(new ToDoListItem("Comment that doesn't fit. " + (i + 1)));
    //   }
    //   
    //   rootItems.push(element);
    // });
    // 
    // this.rootItems = rootItems;
  }
  
  sortByFileName(a, b) {
    a = nova.path.basename(a).toLowerCase();
    b = nova.path.basename(b).toLowerCase();
    
    return a > b ? 1 : b > a ? -1 : 0;   
  }
  
  getMatchedWorkspaceFilePaths(workspacePath) {
    let files = [];
    
    this.getDirectoryFilePaths(workspacePath).forEach((file) => {
      files.push(file);  
    });
    
    return files;
  }
  
  getDirectoryFilePaths(directoryPath) {
    const IGNORES = [".git", ".nova"];
    
    let directoryItems = nova.fs.listdir(directoryPath);
    let directoryFiles = [];
    
    for(let i = 0; i < directoryItems.length; i++) {
      let currentEvaluationPath = nova.path.join(directoryPath, directoryItems[i]);

      if (!IGNORES.includes(directoryItems[i])) {
        if (nova.fs.stat(currentEvaluationPath).isFile()) {
          directoryFiles.push(currentEvaluationPath);
        } else if (nova.fs.stat(currentEvaluationPath).isDirectory())  {
          let subDirectories = this.getDirectoryFilePaths(currentEvaluationPath);
          
          if (subDirectories.length > 0) {
            directoryFiles = directoryFiles.concat(subDirectories);
          }
        }
      }
    }
    
    return directoryFiles;
  }
  
  matchKeywordsInFile(file) {
    const KEYWORDS = ["TODO", "FIXME"];
    
    let contents = file.readlines();
    
    let matches = [];

    for(let i = 0; i < contents.length; i++) {
      let lineMatches = this.matchKeywordsInLine(i, contents[i], KEYWORDS);
      
      if (lineMatches.length > 0) {
        matches = matches.concat(lineMatches);
      }
    }
    
    return matches;
  }
  
  matchKeywordsInLine(lineNumber, line, keywords) {
    let lineMatches = [];
    
    keywords.forEach((keyword) => {
      let lineMatchIndex = line.indexOf(keyword);
      
      while(lineMatchIndex >= 0) {
        lineMatches.push(
          {
            type: keyword,
            line: lineNumber,
            column: lineMatchIndex + 1,
            comment: line.substring(lineMatchIndex)
          }
        );
        
        lineMatchIndex = line.indexOf(keyword, (lineMatchIndex + 1)); 
      }
    });
    
    return lineMatches;
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
    // Element could be 1) A file, 2) A TODO, 3), A FIXME
    // Converts an element into its display (TreeItem) representation
    let item = new TreeItem(element.name);
    if (element.children.length > 0) {
      item.collapsibleState = TreeItemCollapsibleState.Collapsed;
      item.image = "__filetype.erb";
      item.contextValue = "fruit";
      item.tooltip = "This is a parent.";
    } else {
      item.image = "__symbol.todo";
      item.command = "todo.doubleClick";
      item.contextValue = "info";
      item.tooltip = "This is a parent.";
    }
    return item;
  }
}
