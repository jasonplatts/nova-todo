const FUNCTIONS = require("./functions.js");

/*
  Module handles the retrieval of default and user preference configurations
*/
module.exports.Configuration = class Configuration {
  constructor() {
    console.log("CONSTRUCTOR");
    
    this.loadConfig();
  }
  
  loadConfig() {
    console.log("LOAD CONFIG");
    this.keywords = this.getKeywords();
    this.caseSensitiveMatching = this.caseSensitiveMatching();
    this.excludedNames = this.getExcludedNames();
    this.excludedExtensions = this.getExcludedExtensions();
    // this.excludedPaths = this.getExcludedPaths();
  }
  
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
        "err", "fail", "fatal", "fix", "hack", "idea", "info", "note", "optimize", "question",
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
  
  
  caseSensitiveMatching() {
    // console.log("WKS CSE MTCH:", nova.workspace.config.get("todo.workspace-case-sensitive-tag-matching"));
    // console.log("GLB CSE MTCH:", nova.config.get("todo.global-case-sensitive-tag-matching"));
    
    // Set a default setting
    let caseSensitive = true;
    let global = nova.config.get("todo.global-case-sensitive-tag-matching");
    let workspace = nova.workspace.config.get("todo.workspace-case-sensitive-tag-matching")
    
    // Override with a global preference if exists
    if (global == true || global == false) {
      caseSensitive = global;
    }
      
    // If workspace
    if (FUNCTIONS.isWorkspace()) {
      // Override again with a workspace preference if exists
      if (workspace == true || workspace == false) {
        caseSensitive = workspace;
      }
    }
    
    return caseSensitive;
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
    
    let excludedNames = [
      ...DEFAULT_EXCLUDED_NAMES,
      ...workspaceIgnoreNames,
      ...globalIgnoreNames
    ];
    excludedNames = this.cleanArray(excludedNames);
    
    return excludedNames;
  }
  
  /*
    Returns array of excluded file extensions, including default exclusions
    and global and workspace user preference exclusions.
  */
  getExcludedExtensions() {
    const DEFAULT_EXCLUDED_EXTENSIONS = [".json", ".map", ".md"];
    
    let workspaceIgnoreExtensions = [];
    let globalIgnoreExtensions = [];
    
    if (FUNCTIONS.isWorkspace()) {
      workspaceIgnoreExtensions = nova.workspace.config.get("todo.workspace-ignore-extensions");
      workspaceIgnoreExtensions = workspaceIgnoreExtensions.split(",");
    }
    
    globalIgnoreExtensions = nova.config.get("todo.global-ignore-extensions");
    globalIgnoreExtensions = globalIgnoreExtensions.split(",");
    
    let excludedExtensions = [
      ...DEFAULT_EXCLUDED_EXTENSIONS,
      ...workspaceIgnoreExtensions,
      ...globalIgnoreExtensions
    ];
    
    excludedExtensions = this.cleanArray(excludedExtensions);
    
    excludedExtensions = excludedExtensions.map(extension => {
      if (extension.charAt(0) !== ".") {
        return extension = "." + extension;
      } else {
        return extension;
      }
    });
    
    return excludedExtensions;
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
  
  removeWorkspacePreferences() {
    // Remove keywords, ignore paths,
  }
  
  /*
    Returns an array that has been stripped of null, blank, and undefined elements.
  */
  cleanArray(array) {
    array = array.filter(function(element) {
      element = element.trim();
      
      if (element !== null && element !== "" && element!== undefined) {
        return element;
      }
    });
    
    array = array.map(element => element.trim());
    
    return array;
  }
}