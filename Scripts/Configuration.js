const FUNCTIONS = require("./functions.js");

module.exports.Configuration = class Configuration {
  /*
    Returns array of tag keywords used for search. Includes default tags
    and the tags selected by the user in the workspace preferences.
  */
  getKeywords() {
    const DEFAULT_KEYWORDS = ["todo", "fixme"];
    let preferenceKeywords = [];
    
    //  A workspace must exist in order to retrieve saved preferences.
    if (FUNCTIONS.isWorkspace()) {
      preferenceKeywords = [
        "broken", "bug", "debug", "deprecated", "example", "error",
        "err", "fail", "fatal", "hack", "idea", "info", "note", "optimize", "question",
        "refactor", "remove", "review", "task", "trace", "update", "warn", "warning"
      ];
      
      preferenceKeywords = preferenceKeywords.filter(elem => {
          return nova.workspace.config.get(`todo.workspace-keyword-${elem}`)
      });
    }
    
    let keywords = [...DEFAULT_KEYWORDS, ...preferenceKeywords];
    keywords = keywords.map(elem => { return elem.toUpperCase() });
    
    return keywords;
  }
 
  /*
    Returns array of excluded file and directory names, including default exclusions
    and global and workspace user preference exclusions.
  */
  getExcludedNames() {
    const DEFAULT_EXCLUDED_NAMES = [
      "node_modules", "tmp", ".git", "vendor", ".nova", ".gitignore"
    ];
    
    let workspaceIgnoreNames = [];
    let globalIgnoreNames = [];
    
    if (FUNCTIONS.isWorkspace()) {
      workspaceIgnoreNames = nova.workspace.config.get("todo.workspace-ignore-names");
      workspaceIgnoreNames = workspaceIgnoreNames.split(",");
    }
    
    globalIgnoreNames = nova.config.get("todo.global-ignore-names");
    globalIgnoreNames = globalIgnoreNames.split(",");
    
    let excludedNames = [...DEFAULT_EXCLUDED_NAMES, ...workspaceIgnoreNames, ...globalIgnoreNames];
    excludedNames = this.cleanArray(excludedNames);
    
    return excludedNames;
  }
 
  /*
    Returns array of excluded paths specified by the user in the workspace preferences.
  */
  getExcludedPaths() {
    let workspaceIgnorePaths = [];
    
    if (FUNCTIONS.isWorkspace()) {
      workspaceIgnorePaths = nova.workspace.config.get("todo.workspace-ignore-paths");
      workspaceIgnorePaths = workspaceIgnorePaths.split(",");
      workspaceIgnorePaths = workspaceIgnorePaths.map(function (path) {
        return nova.path.normalize(path);
      });
      workspaceIgnorePaths = this.cleanArray(workspaceIgnorePaths);
    }
    
    return workspaceIgnorePaths;
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
     el = el.trim();
     
     if (el !== null && el !== "" && el!== undefined) {
       return el;
     }
   });
   
   array = array.map(element => element.trim());
   
   return array;
 }
}