const { ToDoListItem } = require("./ToDoListItem.js");

module.exports.ToDoDataProvider = class ToDoDataProvider {
  constructor() {
    const GROUP_BY = "file"; // Could also be "todo".
    
    let rootItems = [];
    
    //let files = this.getMatchedWorkspaceFilePaths(nova.workspace.path);
    
    let workspaceFiles = this.getDirectoryFilePaths(nova.workspace.path);
    workspaceFiles.sort(this.sortByFileName);
    
    let matchedFiles = this.findToDoItemsInFilePathArray(workspaceFiles);
    
    let files = workspaceFiles
    
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
    
    // results.forEach((result) => {
    //   console.log(`Ln: ${result.line} Col: ${result.column}, ${result.comment}`);
    // })
    
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
  
  findToDoItemsInFilePathArray(filepathArray) {
    let toDoListItemArray = [];
    
    filepathArray.forEach((filepath) => {
      console.log(filepath);
      let file = nova.fs.open(filepath);
      let matches = this.findKeywordsInFile(file);
      file.close();
      console.log("FIND KEYWORDS IN FILE PATH ARRAY: ", matches);
    });
    
    // let element = new ToDoListItem(nova.path.basename(file));
    
    // this.getDirectoryFilePaths(workspacePath).forEach((file) => {
    //   files.push(file);  
    // });
    
    return toDoListItemArray;
  }
  
  /*
    Searches a file line by line for "TODO" or "FIXME"
    keywords and returns an array of ToDoListItem objects.
  */
  findKeywordsInFile(file) {
    let contents = file.readlines();
    
    let matches = [];

    for(let i = 0; i < contents.length; i++) {
      let lineMatches = this.findKeywordsInLine(contents[i]);
      
      if (lineMatches.length > 0) {
        matches = matches.concat(lineMatches);
        console.log("FIND KEYWORDS IN FILE: ", JSON.stringify(matches[0]));
      }
    }
    
    return matches;
  }
  
  /*
    Searches a line of code for "TODO" or "FIXME" keywords
    and returns an array of objects containing the keyword,
    column number of the match as well as the text
    (most likely a comment) following the keyword.
  */
  findKeywordsInLine(line) {
    const KEYWORDS = ["TODO", "FIXME"];
    
    let lineMatches = [];
    
    KEYWORDS.forEach((keyword) => {
      let lineMatchIndex = line.indexOf(keyword);
      
      while(lineMatchIndex >= 0) {
        lineMatches.push(
          {
            type: keyword,
            column: lineMatchIndex + 1,
            comment: line.substring(lineMatchIndex)
          }
        );
        
        lineMatchIndex = line.indexOf(keyword, (lineMatchIndex + 1)); 
      }
    });
    
    return lineMatches;
  }
  
  sortByFileName(a, b) {
    a = nova.path.basename(a).toLowerCase();
    b = nova.path.basename(b).toLowerCase();
    
    return a > b ? 1 : b > a ? -1 : 0;   
  }
  
  /*
    Returns an array of all files within a directory and its
    subdirectories, except for specified ignored files.
  */
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
