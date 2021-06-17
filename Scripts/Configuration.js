const FUNCTIONS = require('./functions.js')

/*
  Class handles the retrieval of default and user preference configurations
*/
exports.Configuration = class Configuration {
  constructor() {
    this._groupBy               = 'file'
    this._tags                  = this.loadTags()
    this._caseSensitiveMatching = this.loadCaseSensitiveMatching()
    this._excludedNames         = this.loadExcludedNames()
    this._excludedPaths         = this.loadExcludedPaths()
    this._excludedExtensions    = this.loadExcludedExtensions()
  }

  static get DEFAULT_TAGS() {
    return ['todo', 'fixme']
  }

  static get PREFERENCE_TAGS() {
    return [
      'broken', 'bug', 'debug', 'deprecated', 'example', 'error',
      'err', 'fail', 'fatal', 'fix', 'hack', 'idea', 'info', 'note', 'optimize', 'question',
      'refactor', 'remove', 'review', 'task', 'trace', 'update', 'warn', 'warning'
    ]
  }

  static get DEFAULT_EXCLUDED_NAMES() {
    return ['node_modules', 'tmp', '.git', 'vendor', '.nova', '.gitignore', 'env', 'venv']
  }

  static get DEFAULT_EXCLUDED_EXTENSIONS() {
    return ['.json', '.map', '.md']
  }

  get groupBy() {
    return this._groupBy
  }

  set groupBy(groupBy) {
    if (groupBy == 'tag') {
      this._groupBy = 'tag'
    } else {
      this._groupBy = 'file'
    }
  }

  /*
    Returns array of tag tags used for search. Includes default tags
    and the tags selected by the user in the workspace preferences.
  */
  loadTags() {
    let additionalTags = []

    /*
      If a workspace exists and user has chosen to use the workspace preferences for tags,
      else use global settings.
    */
    if (FUNCTIONS.isWorkspace() &&
    (nova.workspace.config.get('todo.workspace-custom-tags') == 'Use Workspace Preferences')) {
      additionalTags = Configuration.PREFERENCE_TAGS.filter((tag) => {
        return nova.workspace.config.get(`todo.workspace-tag-${tag}`)
      })
    } else {
      additionalTags = Configuration.PREFERENCE_TAGS.filter((tag) => {
        return nova.config.get(`todo.global-tag-${tag}`)
      })
    }

    let tags = [...Configuration.DEFAULT_TAGS, ...additionalTags]
    tags     = tags.map((tag) => { return tag.toUpperCase() })

    return tags
  }

  get tags() {
    return this._tags
  }

  /*
    Determines from the global and workspace configuration if tags should be case sensitive.
    Returns a boolean value of true if only to match upper case (TODO:) or false if matching
    both upper and lower case (TODO: and todo:).
  */
  loadCaseSensitiveMatching() {
    let caseSensitive = true
    let global        = nova.config.get('todo.global-case-sensitive-tag-matching')
    let workspace     = nova.workspace.config.get('todo.workspace-case-sensitive-tag-matching')

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

  get CaseSensitiveMatching() {
    return this._caseSensitiveMatching
  }

  /*
    Returns array of excluded file and directory names, including default exclusions
    and global and workspace user preference exclusions.
  */
  loadExcludedNames() {
    let workspaceIgnoreNames = []
    let globalIgnoreNames    = []

    if (FUNCTIONS.isWorkspace()) {
      workspaceIgnoreNames = nova.workspace.config.get('todo.workspace-ignore-names')
      workspaceIgnoreNames = workspaceIgnoreNames.split(',')
    }

    globalIgnoreNames = nova.config.get('todo.global-ignore-names')
    globalIgnoreNames = globalIgnoreNames.split(',')

    let excludedNames = [
      ...Configuration.DEFAULT_EXCLUDED_NAMES,
      ...workspaceIgnoreNames,
      ...globalIgnoreNames
    ]
    excludedNames = FUNCTIONS.cleanArray(excludedNames)

    return excludedNames
  }

  get excludedNames() {
    return this._excludedNames
  }

  /*
    Returns array of excluded file extensions, including default exclusions
    and global and workspace user preference exclusions.
  */
  loadExcludedExtensions() {
    let workspaceIgnoreExtensions = []
    let globalIgnoreExtensions    = []

    if (FUNCTIONS.isWorkspace()) {
      workspaceIgnoreExtensions = nova.workspace.config.get('todo.workspace-ignore-extensions')
      workspaceIgnoreExtensions = workspaceIgnoreExtensions.split(',')
    }

    globalIgnoreExtensions = nova.config.get('todo.global-ignore-extensions')
    globalIgnoreExtensions = globalIgnoreExtensions.split(',')

    let excludedExtensions = [
      ...Configuration.DEFAULT_EXCLUDED_EXTENSIONS,
      ...workspaceIgnoreExtensions,
      ...globalIgnoreExtensions
    ]

    excludedExtensions = FUNCTIONS.cleanArray(excludedExtensions)

    excludedExtensions = excludedExtensions.map(extension => {
      if (extension.charAt(0) !== '.') {
        return extension = '.' + extension
      } else {
        return extension
      }
    })

    return excludedExtensions
  }

  get excludedExtensions() {
    return this._excludedExtensions
  }

  /*
    Returns array of excluded paths specified by the user in the workspace preferences.
  */
  loadExcludedPaths() {
    let workspaceIgnorePaths = []

    if (FUNCTIONS.isWorkspace()) {
      workspaceIgnorePaths = nova.workspace.config.get('todo.workspace-ignore-paths')
      workspaceIgnorePaths = workspaceIgnorePaths.split(',')
      workspaceIgnorePaths = workspaceIgnorePaths.map(function (path) {
        return nova.path.normalize(path)
      })
      workspaceIgnorePaths = FUNCTIONS.cleanArray(workspaceIgnorePaths)
    }

    return workspaceIgnorePaths
  }

  get excludedPaths() {
    return this._excludedPaths
  }
}
