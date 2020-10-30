const { ToDoListItem } = require("./ToDoListItem.js");
const MAX_FILES = 500;

module.exports.ToDoDataProvider = class ToDoDataProvider {
  constructor() {
    console.clear();
    
    // const EXCLUDES = this.addExcludes();
    const EXCLUDES = [];
    
    const GROUP_BY = "file"; // Could also be "tag".
    
    let rootItems = [];
    
    let workspaceFiles = this.getDirectoryFilePaths(nova.workspace.path, EXCLUDES);
    // let workspaceFiles = this.getDirectoryFilePaths("/Users/jasonplatts/Sites/Personal/nova-extensions/sidebars/todo/todo.novaextension/Sample Files", EXCLUDES);
    // console.log(workspaceFiles.files);
    // console.log(workspaceFiles.count);
    console.log("TOTAL NUMBER OF NON-EXCLUDED WORKSPACE FILES:", workspaceFiles.files.length);
    console.log("NON-EXCLUDED WORKSPACE FILES:");
    workspaceFiles.files.forEach(file => {
      console.log(file);
    });
    
    // console.log(workspaceFiles.length);
    if (workspaceFiles.max_count !== true) {
    // if (workspaceFiles.files.length <= MAX_FILES) {
      
      let toDoListItems = this.findToDoItemsInFilePathArray(workspaceFiles.files);
      console.log("TOTAL NUMBER OF TODO & FIXME KEYWORDS FOUND:", toDoListItems.length);
      
      if (GROUP_BY == "file") {
        var groupedtoDoListItems = this.groupListItemsByFile(toDoListItems);
      } else {
        // add ToDoListItem object called ToDo and type as ToDo
        // For each ToDoListItem with type of ToDo add todos as child
        
        // add ToDoListItem object called FixMe and type as FixMe
        // For each ToDoListItem object with type of FixMe add fixme as child
      }
      
      groupedtoDoListItems.forEach((toDoListItem) => {
        rootItems = [...rootItems, toDoListItem];
      });
    } else {
      let request = new NotificationRequest("Too Many Files");
      
      request.title = nova.localize("Too Many Workspace Files");
      request.body = nova.localize("Monitoring the current workspace would cause this extension to become unresponsive. Please consider adding additional excluded paths in preferences or including a git ignore file.");
      
      request.actions = [nova.localize("OK")];
      let promise = nova.notifications.add(request);
    }

    this.rootItems = rootItems; 
  }
  
  readGitIgnoreFile() {
    let gitIgnorePath = nova.path.join(nova.workspace.path, ".gitignore");
    let fileContentArray = [];
    let gitIgnoreFiles = [];
    
    if (nova.fs.access(gitIgnorePath, nova.fs.F_OK)) {
      let gitIgnoreFile = nova.fs.open(gitIgnorePath);
      fileContentArray = gitIgnoreFile.readlines();
      
      for (let i = 0; i < fileContentArray.length; i++) {
        let line = fileContentArray[i].trim();
        
        if (line !== "") {
          gitIgnoreFiles = [...gitIgnoreFiles, line]
        }
      }
      
      // console.log(gitIgnoreFiles);
      // console.log(gitIgnoreFiles.length);
    }
    
    return gitIgnoreFiles;
  }
  
  /*
    Accepts an ungrouped array of ToDoListItem objects and
    returns an array of ToDoListItem objects grouped by file.
  */
  groupListItemsByFile(toDoListItems) {
    let groupedtoDoListItems = [];
    let distinctFilePaths    = this.getUniqueFiles(toDoListItems);
    
    distinctFilePaths.forEach((distinctFilePath) => {
      groupedtoDoListItems.push(new ToDoListItem(nova.path.basename(distinctFilePath)));
      groupedtoDoListItems[groupedtoDoListItems.length - 1].filePath = distinctFilePath;
      
      let filePathToDoItems = toDoListItems.filter(
        toDoListItem => toDoListItem.filePath == distinctFilePath
      );
      
      filePathToDoItems.forEach(filePathToDoItem => {
        groupedtoDoListItems[groupedtoDoListItems.length - 1].addChild(filePathToDoItem);
      });
    });
    
    return groupedtoDoListItems;
  }
  
  /*
    Searches an array of files for "TODO" or "FIXME"
    keywords and returns an array of ToDoListItem objects
    for all specified files. Accepts an array of file path string.
  */
  findToDoItemsInFilePathArray(filePathArray) {
    let toDoListItemArray = [];
    
    filePathArray.forEach((filePath) => {
      let file = nova.fs.open(filePath);
      let fileSearchResults = this.findKeywordsInFile(file);
      
      if (fileSearchResults.length > 0) {
        toDoListItemArray = toDoListItemArray.concat(fileSearchResults);
      }
      
      file.close();
    });
    
    return toDoListItemArray;
  }
  
  /*
    Searches a file line by line for "TODO" or "FIXME"
    keywords and returns an array of ToDoListItem objects
    for a specific file. Accepts a Nova file object.
  */
  findKeywordsInFile(file) {
    let contents = file.readlines();
    
    let fileMatches = [];

    for(let i = 0; i < contents.length; i++) {
      let lineMatches = this.findKeywordsInLine(contents[i]);
      
      lineMatches.forEach((match) => {
        let toDoListItem      = new ToDoListItem(match.name);
        toDoListItem.filePath = file.path;
        toDoListItem.line     = i + 1;
        toDoListItem.column   = match.column;
        match.comment         = match.comment.replace(/(TODO:|FIXME:|TODO|FIXME)/, "");
        toDoListItem.comment  = match.comment.trim();
        
        fileMatches = fileMatches.concat(toDoListItem); 
      });
    }
    
    return fileMatches;
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
            name: keyword,
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
    Accepts an array of ToDoListItem objects and returns an array
    of primitive file name values.
  */
  getUniqueFiles(toDoListItems) {
    // 1) Map array to a new array containing only primitive values (don't want objects, just file names.
    // 2) Then use the Set object to store a collection of unique values,
    // 3) Which then uses the spread operator to construct a new array.
    return [...new Set(toDoListItems.map(item => item.filePath))];
  }
  
  /*
    Returns an array of all FILES within a directory and its
    subdirectories, except for those excluded.
  */
  getDirectoryFilePaths(directoryPath, EXCLUDES) {
    // const MAX_FILES = 200;
    
    let directoryItems = nova.fs.listdir(directoryPath);
    // fileCount will be a count of all the files in the directory, not a count of those
    // with TODO keywords. This occurs in the findToDoItemsInFilePathArray method.
    let directory = {
      'max_count': false,
      'fileCount': 0,
      'files':[]
    };
    
    let i = 0;
    
    while (i < directoryItems.length && directory.max_count == false) {
      let currentEvaluationPath = nova.path.join(directoryPath, directoryItems[i]);
  
      // if (!EXCLUDES.includes(directoryItems[i])) {
        // console.log("EXT INCLUDED: ", `${currentEvaluationPath} - ${this.isAllowedDirectoryItem(currentEvaluationPath)}`);
      if (this.isAllowedDirectoryItem(currentEvaluationPath)) {
        if (nova.fs.stat(currentEvaluationPath).isFile()) {
          directory.fileCount += 1;
          directory.files.push(currentEvaluationPath);
        } else if (nova.fs.stat(currentEvaluationPath).isDirectory())  {
          let subDirectories = this.getDirectoryFilePaths(currentEvaluationPath, EXCLUDES);
          
          if (subDirectories.files.length > 0) {
            directory.files = directory.files.concat(subDirectories.files);
            directory.fileCount += subDirectories.fileCount;
          }
        }
      }
      
      if (directory.fileCount > MAX_FILES - 1) {
        directory.max_count = true;
      }

      i++;
    }
    
    directory.files.sort(this.sortByFileName);
    
    return directory;
  }
  
  isAllowedDirectoryItem(path) {
    if (this.isAllowedName(path) && this.isAllowedPath(path) && 
      this.isAllowedExtension(path)) {
      return true;
    } else {
      return false;
    }
  }
  
  /*
    Used to exclude specific file and directory names.
  */
  isAllowedName(path) {
    const DEFAULT_EXCLUDED_NAMES = [
      "node_modules", "tmp", ".git", "vendor", ".nova", ".gitignore"
    ];
    
    // console.log(nova.path.basename(path));
    if (!DEFAULT_EXCLUDED_NAMES.includes(nova.path.basename(path))) {
      return true;
    } else {
      return false;
    }
    return true;
  }
  
  /*
    Used to exclude specific file and directory paths.
  */
  isAllowedPath(path) {
    return true;
  }
  
  /*
    Used to exclude specific extensions.
  */
  isAllowedExtension(path) {
    const DEFAULT_EXCLUDED_EXTENSIONS = [".json", ".jpg", ".png", ".sketch", ".psd",
      ".bmp", ".svg"];
    
    if (!DEFAULT_EXCLUDED_EXTENSIONS.includes(nova.path.extname(path))) {
      return true;
    } else {
      return false;
    }
  }
  
  getChildren(toDoListItem) {
    if (!toDoListItem) {
      return this.rootItems;
    }
    else {
      return toDoListItem.children;
    }
  }
  
  getParent(toDoListItem) {
    return toDoListItem.parent;
  }
  
  getTreeItem(toDoListItem) {
    let item = new TreeItem(toDoListItem.name);
    // If children.length > 0, then the item is a file name. Else, it's a TODO or FIXME item.
    if (toDoListItem.children.length > 0) {
      item.collapsibleState = TreeItemCollapsibleState.Expanded;
      item.image            = `__filetype${nova.path.extname(toDoListItem.filePath)}`;
      item.contextValue     = "fruit";
      item.tooltip          = "This is a parent.";
    } else {
      item.image            = toDoListItem.name.toLowerCase();
      item.command          = "todo.doubleClick";
      item.contextValue     = "info";
      item.descriptiveText  = 
        `${toDoListItem.comment} (Ln: ${toDoListItem.line}, Col: ${toDoListItem.column})`;
      item.tooltip          = "This is a parent.";
    }
    
    return item;
  }
}
