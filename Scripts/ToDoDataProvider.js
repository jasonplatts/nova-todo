const { ToDoListItem } = require("./ToDoListItem.js");
const MAX_FILES = 300;

module.exports.ToDoDataProvider = class ToDoDataProvider {
  constructor() {
    this.process();
  }
  
  process() {
    // console.clear();
    // console.log("GLOBAL CONFIG EXAMPLE:",nova.config.get("todo.default-file"));
    // console.log("WORKSPACE CONFIG EXAMPLE:",nova.workspace.config.get("todo.default-config.printWidth"));
    
    const GROUP_BY = "file"; // Could also be "tag".
    
    let rootItems = [];
    
    let workspaceFiles = this.getDirectoryFilePaths(nova.workspace.path);

    // console.log("TOTAL NUMBER OF NON-EXCLUDED WORKSPACE FILES:", workspaceFiles.files.length);
    // console.log("NON-EXCLUDED WORKSPACE FILES:");
    
    // workspaceFiles.files.forEach(file => {
    //   console.log(file);
    // });
    
    if (workspaceFiles.max_count !== true) {
      let toDoListItems = this.findToDoItemsInFilePathArray(workspaceFiles.files);
      // console.log("TOTAL NUMBER OF TODO & FIXME KEYWORDS FOUND:", toDoListItems.length);
      
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
    let fileLineStartPosition = 0;

    for(let i = 0; i < contents.length; i++) {
      let lineMatches = this.findKeywordsInLine(contents[i]);
      
      lineMatches.forEach((match) => {
        let toDoListItem      = new ToDoListItem(match.name);
        toDoListItem.filePath = file.path;
        toDoListItem.line     = i + 1;
        toDoListItem.column   = match.column;
        toDoListItem.position = fileLineStartPosition + match.column;
        match.comment         = match.comment.replace(/(TODO:|FIXME:|TODO|FIXME)/, "");
        toDoListItem.comment  = match.comment.trim();
        
        fileMatches = fileMatches.concat(toDoListItem);
      });
      
      fileLineStartPosition += contents[i].length;
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
    Returns an object with a max_count boolean, fileCount, and an array of all FILES
    within a directory and its subdirectories, except for those excluded.
  */
  getDirectoryFilePaths(directoryPath) {
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

      if (this.isAllowedDirectoryItem(currentEvaluationPath)) {
        if (nova.fs.stat(currentEvaluationPath).isFile()) {
          directory.fileCount += 1;
          directory.files.push(currentEvaluationPath);
        } else if (nova.fs.stat(currentEvaluationPath).isDirectory())  {
          let subDirectories = this.getDirectoryFilePaths(currentEvaluationPath);
          
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
    // console.log("DIRECTORY ITEM", path);
    // console.log("ALLOWED NAME", this.isAllowedName(path));
    // console.log("ALLOWED PATH", this.isAllowedPath(path));
    // console.log("ALLOWED EXT", this.isAllowedExtension(path));
    if (this.isAllowedName(path) && this.isAllowedPath(path) && 
      this.isAllowedExtension(path)) {
      // console.log("ALLOWED");
      return true;
    } else {
      // console.log("NOT ALLOWED");
      return false;
    }
  }
  
  /*
    Used to exclude specific file and directory names.
  */
  isAllowedName(path) {
    let excludedNames = this.getExcludedNames();
  
    if (!excludedNames.includes(nova.path.basename(path))) {
      return true;
    } else {
      return false;
    }
    return true;
  }
  
  getExcludedNames() {
    const DEFAULT_EXCLUDED_NAMES = [
      "node_modules", "tmp", ".git", "vendor", ".nova", ".gitignore"
    ];
    
    let workspaceIgnoreNames = nova.workspace.config.get("todo.workspace-ignore-names");
    
    if (workspaceIgnoreNames !== null) {
      workspaceIgnoreNames = workspaceIgnoreNames.split(",");
    } else {
      workspaceIgnoreNames = [];
    }
    
    let globalIgnoreNames = nova.config.get("todo.global-ignore-names");
    
    if (globalIgnoreNames !== null) {
      globalIgnoreNames = globalIgnoreNames.split(",");
    } else {
      globalIgnoreNames = [];
    }
    
    let excludedNames = [...DEFAULT_EXCLUDED_NAMES, ...workspaceIgnoreNames, ...globalIgnoreNames];
    
    excludedNames = this.cleanArray(excludedNames);
    
    return excludedNames;
  }
  
  /*
    Used to exclude specific file and directory paths.
  */
  isAllowedPath(path) {
    const USER_EXCLUDED_PATHS = this.getExcludedPaths();
    
    if (!USER_EXCLUDED_PATHS.includes(path)) {
      return true;
    } else {
      return false;
    }
  }
  
  getExcludedPaths() {
    let workspaceIgnorePaths = nova.workspace.config.get("todo.workspace-ignore-paths");
    
    if (workspaceIgnorePaths !== null) {
      workspaceIgnorePaths = workspaceIgnorePaths.split(",");
      
      let normalizedPaths = workspaceIgnorePaths.map(function (path) {
        return nova.path.normalize(path);
      });
      
      return normalizedPaths;
    } else {
      return [];
    }
  }
  
  /*
    Used to exclude specific extensions.
  */
  isAllowedExtension(path) {
    if (nova.fs.stat(path).isFile() == true) {
      let excludedExtensions = this.getExcludedExtensions();
      // console.log(excludedExtensions);
      // console.log("IS DIR?", nova.fs.stat(path).isDirectory());
      if (!excludedExtensions.includes(nova.path.extname(path))) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }
  
  getExcludedExtensions() {
    const DEFAULT_EXCLUDED_EXTENSIONS = [".json", ".jpg", ".png",
      ".sketch", ".psd", ".bmp", ".svg", ".ai"];
    
    let workspaceIgnoreExtensions = nova.workspace.config.get("todo.workspace-ignore-extensions");
    
    if (workspaceIgnoreExtensions !== null) {
      workspaceIgnoreExtensions = workspaceIgnoreExtensions.split(",");
    } else {
      workspaceIgnoreExtensions = [];
    }
    
    let globalIgnoreExtensions = nova.config.get("todo.global-ignore-extensions");
    
    if (globalIgnoreExtensions !== null) {
      globalIgnoreExtensions = globalIgnoreExtensions.split(",");
    } else {
      globalIgnoreExtensions = [];
    }
    
    let excludedExtensions = [...DEFAULT_EXCLUDED_EXTENSIONS, ...workspaceIgnoreExtensions,
      ...globalIgnoreExtensions];
    
    // console.log("PRE-CLEAN", excludedExtensions);
    excludedExtensions = this.cleanArray(excludedExtensions);
    // console.log("POST-CLEAN", excludedExtensions);
    
    // excludedExtensions = excludedExtensions.map(extension => extension.trim());
    
    return excludedExtensions;
  }
  
  cleanArray(array) {
    array = array.filter(function(el) {
      if (el !== null && el !== "" && el!== 'undefined') {
        return el;
      }
    });
    
    array = array.map(element => element.trim());
    
    return array;
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
      item.contextValue     = "file";
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
