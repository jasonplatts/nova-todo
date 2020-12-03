const { ToDoListItem } = require("./ToDoListItem.js");
const { FileLoader } = require("./FileLoader.js");
const { Configuration } = require("./Configuration.js");

module.exports.ToDoDataProvider = class ToDoDataProvider {
  constructor() { 
    this.loadData();
  }
  
  /*
    This is the entry point for the data provider class.
    It serves to load tree items on initial extension
    activation and on reload.
  */
  loadData() {
    this.configuration = new Configuration;
    this.rootItems = [];
    this.KEYWORDS = [
      "TODO",
      "FIXME"
    ];
    
    if (this.isWorkspace()) {
      this.KEYWORDS = this.KEYWORDS.concat(this.configuration.getKeywords())
      this.rootItems = this.getWorkspaceRootItems();
    } else {
      this.rootItems = this.getOpenDocumentsRootItems();
    }

    return this.rootItems;
  }
  
  /*
    Returns a boolean representing whether or not the current
    environment is a workspace or Nova window without a 
    workspace.
  */
  isWorkspace() {
    if (nova.workspace.path == undefined || nova.workspace.path == null) {
      return false;
    } else {
      return true;
    }
  }
  
  /*
    Returns a promise to generates tree view items
    based on files open in the current Nova window.
    This is needed when the user does not have a
    current workspace open.
  */
  getOpenDocumentsRootItems() {
    return new Promise((resolve, reject) => {
      let rootItems = [];
      
      let openDocuments = nova.workspace.textDocuments.filter(doc => {
        if (doc.path !== undefined || doc.path !== null) {
          return doc.path;
        }
      });
      
      openDocuments = openDocuments.map(doc => {
        return (doc.path).toString();
      });
      
      let toDoListItems = this.findToDoItemsInFilePathArray(openDocuments);
      let groupedToDoListItems = this.groupListItemsByFile(toDoListItems);
      
      groupedToDoListItems.forEach((toDoListItem) => {
        rootItems = [...rootItems, toDoListItem];
      });
      
      resolve(rootItems);
    });
  }
  
  /*
    Returns a promise to generate tree view items
    based on files that exist in the current workspace.
  */
  getWorkspaceRootItems() {
    return new Promise((resolve, reject) => {
      let rootItems = [];
      let fileSearchResponse = this.getMatchedWorkspaceFiles();
      
      fileSearchResponse.then((response, reject) => {
        let toDoListItems = this.findToDoItemsInFilePathArray(response);
        let groupedToDoListItems = this.groupListItemsByFile(toDoListItems);
        
        groupedToDoListItems.forEach((toDoListItem) => {
          rootItems = [...rootItems, toDoListItem];
        });
        
        resolve(rootItems);
      });
    })
  }
  
  /*
    Uses the FileLoader class to search the current workspace
    path for files containing tag keywords. The search method
    makes use of the egrep command line application available
    in Unix based operating systems.
  */
  getMatchedWorkspaceFiles() {
    return new Promise((resolve, reject) => {
      let excludedPaths      = this.getExcludedPaths();
      let excludedExtensions = this.getExcludedExtensions();
      let excludedNames      = this.getExcludedNames();
      
      let fileHandler = new FileLoader(nova.workspace.path, this.KEYWORDS);
      
      let files = fileHandler.egrepExec();
      
      files.then((response, reject) => {
        let filteredFiles = response.stdout;
        filteredFiles = filteredFiles.filter(filePath => this.isAllowedName(filePath, excludedNames)); 
        filteredFiles = filteredFiles.filter(filePath => this.isAllowedExtension(filePath, excludedExtensions));
        filteredFiles = filteredFiles.filter(filePath => this.isAllowedPath(filePath, excludedPaths));
        
        resolve(filteredFiles);
      });
    });
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
    Sorts an array of file paths by file name alphabetically.
    Called in conjunction with the JS sort function.
    Eg: filePathArray.sort(this.sortByFileName);
  */
  sortByFileName(a, b) {
    a = nova.path.basename(a).toLowerCase();
    b = nova.path.basename(b).toLowerCase();
    
    return a > b ? 1 : b > a ? -1 : 0;   
  }
  
  /*
    Searches an array of files for keywords and returns an array
    of ToDoListItem objects for all specified files. Accepts an 
    array of file path string.
  */
  findToDoItemsInFilePathArray(filePathArray) {
    let toDoListItemArray = [];

    filePathArray.sort(this.sortByFileName);
    
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
    Searches a file line by line for keywords
    and returns an array of ToDoListItem objects
    for a specific file. Accepts a Nova file object.
  */
  findKeywordsInFile(file) {
    let contents = file.readlines();
    
    let fileMatches = [];
    let fileLineStartPosition = 0;
    
    let replacements = [...this.KEYWORDS.map(elem => elem + ":"), ...this.KEYWORDS];
    let regex = new RegExp(replacements.join("|"), "g");

    for(let i = 0; i < contents.length; i++) {
      let lineMatches = this.findKeywordsInLine(contents[i]);
      
      lineMatches.forEach((match) => {
        let toDoListItem      = new ToDoListItem(match.name);
        toDoListItem.filePath = file.path;
        toDoListItem.line     = i + 1;
        toDoListItem.column   = match.column;
        toDoListItem.position = fileLineStartPosition + match.column;
        match.comment         = match.comment.replace(regex, "");
        toDoListItem.comment  = match.comment.trim();
        
        fileMatches = fileMatches.concat(toDoListItem);
      });
      
      fileLineStartPosition += contents[i].length;
    }
    
    return fileMatches;
  }
  
  /*
    Searches a line of code for keywords
    and returns an array of objects containing the keyword,
    column number of the match as well as the text
    (most likely a comment) following the keyword.
  */
  findKeywordsInLine(line) {
    let lineMatches = [];
    
    this.KEYWORDS.forEach((keyword) => {
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
    Used to exclude specific file and directory names.
  */
  isAllowedName(path, excludedNames) {
    let pathElementArray = path.split("/");
    let exclusionFound = false;
    let count = 0;
    
    while (count < pathElementArray.length && exclusionFound !== true) {
      if (excludedNames.includes(pathElementArray[count])) {
        exclusionFound = true;
      }
      
      count++;
    }
    
    if (exclusionFound == true) {
      return false;
    } else {
      return true;
    }
  }
  
  /*
    Used to exclude specific extensions.
  */
  isAllowedExtension(path, excludedExtensions) {
    if (nova.fs.stat(path).isFile() == true) {
      if (!excludedExtensions.includes(nova.path.extname(path))) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }
  
  /*
    Used to exclude specific file and directory paths.
  */
  isAllowedPath(path, excludedPaths) {
    excludedPaths = this.cleanArray(excludedPaths);
    let pathFound = false;
    let excludedPathsIndex = 0;
    
    while ((excludedPathsIndex < excludedPaths.length) && pathFound !== true) {
      if (nova.path.normalize(path).includes(excludedPaths[excludedPathsIndex])) {
        pathFound = true;
      }
      
      excludedPathsIndex++;
    }

    if (pathFound == true) {
      return false;
    } else {
      return true;
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
  
  getExcludedExtensions() {
    const DEFAULT_EXCLUDED_EXTENSIONS = [".json", ".map"];
    
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
    
    excludedExtensions = this.cleanArray(excludedExtensions);
    
    return excludedExtensions;
  }
  
  cleanArray(array) {
    array = array.filter(function(el) {
      if (el !== null && el !== "" && el!== undefined) {
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
    // If children.length > 0, then the item is a file name. Else, it's a tag item.
    if (toDoListItem.children.length > 0) {
      item.collapsibleState = TreeItemCollapsibleState.Expanded;
      item.image            = `__filetype${nova.path.extname(toDoListItem.filePath)}`;
      item.contextValue     = "file";
      item.tooltip          = toDoListItem.filePath;
    } else {
      item.image            = toDoListItem.name.toLowerCase();
      item.command          = "todo.doubleClick";
      item.contextValue     = "info";
      item.descriptiveText  = `${toDoListItem.comment} (Ln: ${toDoListItem.line}, Col: ${toDoListItem.column})`;
    }
    
    return item;
  }
}
