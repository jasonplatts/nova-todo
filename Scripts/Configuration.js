const FUNCTIONS = require('./functions.js')

/*
  Module handles the retrieval of default and user preference configurations
*/
exports.Configuration = class Configuration {
  constructor() {
    this.loadConfig()
  }

  loadConfig() {
    this.keywords              = this.getKeywords()
    this.caseSensitiveMatching = this.caseSensitiveMatching()
    this.excludedNames         = this.getExcludedNames()
    this.excludedExtensions    = this.getExcludedExtensions()
    this.excludedPaths         = this.getExcludedPaths()
    this.groupBy               = 'file'
  }

  /*
    Returns array of tag keywords used for search. Includes default tags
    and the tags selected by the user in the workspace preferences.
  */
  getKeywords() {
    const DEFAULT_KEYWORDS    = ['todo', 'fixme']
    const PREFERENCE_KEYWORDS = [
      'broken', 'bug', 'debug', 'deprecated', 'example', 'error',
      'err', 'fail', 'fatal', 'fix', 'hack', 'idea', 'info', 'note', 'optimize', 'question',
      'refactor', 'remove', 'review', 'task', 'trace', 'update', 'warn', 'warning'
    ]

    let additionalKeywords = []

    /*
      If a workspace exists and user has chosen to use the workspace preferences for tags,
      else use global settings.
    */
    if (FUNCTIONS.isWorkspace() &&
    (nova.workspace.config.get('todo.workspace-custom-tags') == 'Use Workspace Preferences')) {
      additionalKeywords = PREFERENCE_KEYWORDS.filter(elem => {
        return nova.workspace.config.get(`todo.workspace-keyword-${elem}`)
      })
    } else {
      additionalKeywords = PREFERENCE_KEYWORDS.filter(elem => {
        return nova.config.get(`todo.global-keyword-${elem}`)
      })
    }

    let keywords = [...DEFAULT_KEYWORDS, ...additionalKeywords]
    keywords = keywords.map(elem => { return elem.toUpperCase() })

    return keywords
  }

  /*
    Determines from the global and workspace configuration if tags should be case sensitive.
    Returns a boolean value of true if only to match upper case (TODO:) or false if matching
    both upper and lower case (TODO: and todo:).
  */
  caseSensitiveMatching() {
    // Set a default setting
    let caseSensitive = true

    let global = nova.config.get('todo.global-case-sensitive-tag-matching')
    let workspace = nova.workspace.config.get('todo.workspace-case-sensitive-tag-matching')

    // Override default with a global preference if it exists
    if (global == true || global == false) {
      caseSensitive = global
    }

    // Override global setting with a workspace preference if in a workspace and non-global setting is selected.
    if (FUNCTIONS.isWorkspace() && (workspace !== 'Use Global Preference')) {
      if (workspace == 'Upper Case Only') {
        caseSensitive = true
      } else if (workspace == 'Upper and Lower Case') {
        caseSensitive = false
      }
    }

    return caseSensitive
  }

  /*
    Returns array of excluded file and directory names, including default exclusions
    and global and workspace user preference exclusions.
  */
  getExcludedNames() {
    const DEFAULT_EXCLUDED_NAMES = [
      'node_modules', 'tmp', '.git', 'vendor', '.nova', '.gitignore', 'env', 'venv'
    ]

    let workspaceIgnoreNames = []
    let globalIgnoreNames    = []

    if (FUNCTIONS.isWorkspace()) {
      workspaceIgnoreNames = nova.workspace.config.get('todo.workspace-ignore-names')
      workspaceIgnoreNames = workspaceIgnoreNames.split(',')
    }

    globalIgnoreNames = nova.config.get('todo.global-ignore-names')
    globalIgnoreNames = globalIgnoreNames.split(',')

    let excludedNames = [
      ...DEFAULT_EXCLUDED_NAMES,
      ...workspaceIgnoreNames,
      ...globalIgnoreNames
    ]
    excludedNames = this.cleanArray(excludedNames)

    return excludedNames
  }

  /*
    Returns array of excluded file extensions, including default exclusions
    and global and workspace user preference exclusions.
  */
  getExcludedExtensions() {
    const DEFAULT_EXCLUDED_EXTENSIONS = ['.json', '.map', '.md']

    let workspaceIgnoreExtensions = []
    let globalIgnoreExtensions    = []

    if (FUNCTIONS.isWorkspace()) {
      workspaceIgnoreExtensions = nova.workspace.config.get('todo.workspace-ignore-extensions')
      workspaceIgnoreExtensions = workspaceIgnoreExtensions.split(',')
    }

    globalIgnoreExtensions = nova.config.get('todo.global-ignore-extensions')
    globalIgnoreExtensions = globalIgnoreExtensions.split(',')

    let excludedExtensions = [
      ...DEFAULT_EXCLUDED_EXTENSIONS,
      ...workspaceIgnoreExtensions,
      ...globalIgnoreExtensions
    ]

    excludedExtensions = this.cleanArray(excludedExtensions)

    excludedExtensions = excludedExtensions.map(extension => {
      if (extension.charAt(0) !== '.') {
        return extension = '.' + extension
      } else {
        return extension
      }
    })

    return excludedExtensions
  }

  /*
    Returns array of excluded paths specified by the user in the workspace preferences.
  */
  getExcludedPaths() {
    let workspaceIgnorePaths = []

    if (FUNCTIONS.isWorkspace()) {
      workspaceIgnorePaths = nova.workspace.config.get('todo.workspace-ignore-paths')
      workspaceIgnorePaths = workspaceIgnorePaths.split(',')
      workspaceIgnorePaths = workspaceIgnorePaths.map(function (path) {
        return nova.path.normalize(path)
      })
      workspaceIgnorePaths = this.cleanArray(workspaceIgnorePaths)
    }

    return workspaceIgnorePaths
  }

  /*
    Returns an array that has been stripped of null, blank, and undefined elements.
  */
  cleanArray(array) {
    array = array.filter(function(element) {
      element = element.trim()

      if (element !== null && element !== '' && element!== undefined) {
        return element
      }
    })

    array = array.map(element => element.trim())

    return array
  }
}
