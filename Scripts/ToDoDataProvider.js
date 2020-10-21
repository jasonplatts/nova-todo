const { ToDoItem } = require("./ToDoItem.js");

module.exports.ToDoDataProvider = class ToDoDataProvider {
  constructor() {
    let rootItems = [];
    
    let todos = this.getMatchedWorkspaceFiles(nova.workspace.path);
    
    //let file = nova.fs.open(nova.workspace.path + "/Sample Files/index.php");
    
    //let results = this.matchKeywordsInFile(file);
    
    console.clear();
    
    //results.forEach((result) => {
      // console.log(`Ln: ${result.line} Col: ${result.column}, ${result.comment}`);
    //})
    
    todos.forEach((f) => {
      let element = new ToDoItem(f);
      
      for (let i = 0; i < 3; i++) {
        element.addChild(new ToDoItem("Comment that doesn't fit. " + (i + 1)));
      }
      
      rootItems.push(element);
    });
    
    this.rootItems = rootItems;
  }
  
  getMatchedWorkspaceFiles(workspacePath) {
    // return this.getDirectoryFiles(workspacePath);
    let files = [];
    
    this.getDirectoryFiles(workspacePath).forEach((file) => {
      files.push(file.name);  
    });
    
    return files;
    
    
    // let workspaceFiles
    // let matchedWorkspaceFiles = nova.fs.listdir(workspacePath);
    // 
    // for(let i = 0; i < matchedWorkspaceFiles.length; i++) {
    //   console.log(workspacePath + matchedWorkspaceFiles[i]);
    // }
    // 
    // return matchedWorkspaceFiles;
  }
  
  getDirectoryFiles(directoryPath) {
    const IGNORES = [".git", ".nova"];
    
    let directoryItems = nova.fs.listdir(directoryPath);
    let directoryFiles = [];
    
    for(let i = 0; i < directoryItems.length; i++) {
      let currentEvaluationPath = directoryPath + "/" + directoryItems[i];
      
      // console.log(directoryPath + "/" + directoryItems[i]);
      // console.log(IGNORES.includes(directoryItems[i]));
      
      if (!IGNORES.includes(directoryItems[i])) {
        if (nova.fs.stat(currentEvaluationPath).isFile()) {
          // console.log("Is File");
          directoryFiles.push(
            {
              name: directoryItems[i],
              path: currentEvaluationPath
            }
          );
        } else if (nova.fs.stat(currentEvaluationPath).isDirectory())  {
          let subDirectories = this.getDirectoryFiles(currentEvaluationPath);
          
          if (subDirectories.length > 0) {
            directoryFiles = directoryFiles.concat(subDirectories);
          }
          
          // console.log("Is Directory");
        } else {
          console.log("Something Else"); 
        }
      }
      
      // console.log(nova.fs.stat(currentEvaluationPath));
    }
    
    return directoryFiles;
  }
  
  // searchFilesInDirectory() {
    // const fileContent = 
    // if(REGEX.test(contents)) {
    //   console.log(file.tell());
    //   console.log(nova.fs.stat(nova.workspace.path + "/Sample Files/index.php").size);
    //   console.log('TODO FOUND!');
    // } else {
    //   console.log('NOTHING FOUND!');
    // }
    // const REGEX = new RegExp('\\b' + "TODO" + '\\b');
    
    // let contents = file.read();
  //}
  
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
    // Converts an element into its display (TreeItem) representation
    let item = new TreeItem(element.name);
    if (element.children.length > 0) {
      item.collapsibleState = TreeItemCollapsibleState.Collapsed;
      item.image = "__filetype.erb";
      item.contextValue = "fruit";
    } else {
      item.image = "__symbol.todo";
      item.command = "todo.doubleClick";
      item.contextValue = "info";
    }
    return item;
  }
}
