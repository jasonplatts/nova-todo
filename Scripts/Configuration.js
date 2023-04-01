const FUNCTIONS = require('./functions.js')

/*
  Class handles the retrieval of default and user preference configurations.
*/
exports.Configuration = class Configuration {
  async load() {
    await this.updatePreVersion3Settings()

    this._groupBy               = 'file'
    this._tags                  = await this.loadTags()
    this._caseSensitiveMatching = await this.loadCaseSensitiveMatching()
    this._whitespaceTagging     = await this.loadWhitespaceTagging()
    this._excludedNames         = await this.loadExcludedNames()
    this._excludedPaths         = await this.loadExcludedPaths()
    this._excludedExtensions    = await this.loadExcludedExtensions()

    return this
  }

  static get DEFAULT_TAGS() {
    return ['todo', 'fixme']
  }

  static get PREFERENCE_TAGS() {
    return [
      'broken', 'bug', 'debug', 'deprecated', 'example', 'error',
      'err', 'fail', 'fatal', 'fix', 'hack', 'idea', 'info', 'note', 'optimize', 'question',
      'refactor', 'remove', 'review', 'task', 'trace', 'update', 'upstream', 'warn', 'warning'
    ]
  }

  static get DEFAULT_EXCLUDED_NAMES() {
    return ['node_modules', 'tmp', '.git', 'vendor', '.nova', '.gitignore', 'env', 'venv']
  }

  static get DEFAULT_EXCLUDED_EXTENSIONS() {
    return ['.json', '.map']
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

  toggleGroupBy() {
    this._groupBy = (this._groupBy == 'tag') ? 'file' : 'tag'
  }

  /*
    Returns array of tag tags used for search. Includes default tags
    and the tags selected by the user in the workspace preferences.
  */
  async loadTags() {
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
  async loadCaseSensitiveMatching() {
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

  get caseSensitiveMatching() {
    return this._caseSensitiveMatching
  }

  async loadWhitespaceTagging() {
    let whitespaceTagging = false
    let global            = nova.config.get('todo.global-whitespace-tagging')
    let workspace         = nova.config.get('todo.workspace-whitespace-tagging')

    if (global == true || global == false) {
      whitespaceTagging = global
    }

    if (FUNCTIONS.isWorkspace() && (workspace !== 'Use Global Preference')) {
      if (workspace == 'Allowed') {
        whitespaceTagging = true
      } else if (workspace == 'Not Allowed') {
        whitespaceTagging = false
      }
    }

    return whitespaceTagging
  }

  get whitespaceTagging() {
    return this._whitespaceTagging
  }

  /*
    Returns array of excluded file and directory names, including default exclusions
    and global and workspace user preference exclusions.
  */
  async loadExcludedNames() {
    let workspaceIgnoreNames = []
    let globalIgnoreNames    = []

    if (FUNCTIONS.isWorkspace()) {
      workspaceIgnoreNames = nova.workspace.config.get('todo.workspace-ignore-names')
    }

    globalIgnoreNames = nova.config.get('todo.global-ignore-names')

    let excludedNames = [
      ...Configuration.DEFAULT_EXCLUDED_NAMES,
      ...FUNCTIONS.cleanArray(workspaceIgnoreNames),
      ...FUNCTIONS.cleanArray(globalIgnoreNames)
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
  async loadExcludedExtensions() {
    let workspaceIgnoreExtensions = []
    let globalIgnoreExtensions    = []

    if (FUNCTIONS.isWorkspace()) {
      workspaceIgnoreExtensions = nova.workspace.config.get('todo.workspace-ignore-extensions')
    }

    globalIgnoreExtensions = nova.config.get('todo.global-ignore-extensions')

    let excludedExtensions = [
      ...Configuration.DEFAULT_EXCLUDED_EXTENSIONS,
      ...FUNCTIONS.cleanArray(workspaceIgnoreExtensions),
      ...FUNCTIONS.cleanArray(globalIgnoreExtensions)
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

  /*
    Returns the excluded extensions.
  */
  get excludedExtensions() {
    return this._excludedExtensions
  }

  /*
    Returns array of excluded paths specified by the user in the workspace preferences.
  */
  async loadExcludedPaths() {
    let workspaceIgnorePaths = []

    if (FUNCTIONS.isWorkspace()) {
      workspaceIgnorePaths = nova.workspace.config.get('todo.workspace-ignore-paths')
      workspaceIgnorePaths = FUNCTIONS.cleanArray(workspaceIgnorePaths)
      workspaceIgnorePaths = workspaceIgnorePaths.map((path) => { return nova.path.normalize(path) })
      workspaceIgnorePaths = FUNCTIONS.cleanArray(workspaceIgnorePaths)
    }

    return workspaceIgnorePaths
  }

  /*
    Returns the excluded paths.
  */
  get excludedPaths() {
    return this._excludedPaths
  }

  /*
    Updates settings created prior to version 3.
  */
  async updatePreVersion3Settings() {
    try {
      this.removeSelectedIgnorePath()
      this.updateExcludedNamesToV3()
      this.updateExcludedPathsToV3()
      this.updateExcludedExtensionsToV3()
    } catch (error) {
      FUNCTIONS.showConsoleError(error)
    }

    return true
  }

  /*
    Method removes the 'todo.selected-ignore-path' removed in TODO version 3.
  */
  removeSelectedIgnorePath() {
    if (nova.workspace.config.get('todo.selected-ignore-path') !== null) {
      nova.workspace.config.set('todo.selected-ignore-path', null)
    }
  }

  /*
    Updates the excluded names configuration string used in TODO version 1-2, to an
    array compatible with the stringArray configuration UI used in TODO version 3.
    This feature was added to the Nova API in V4.
  */
  updateExcludedNamesToV3() {
    let tempGlobalNames    = nova.config.get('todo.global-ignore-names')
    let tempWorkspaceNames = nova.workspace.config.get('todo.workspace-ignore-names')

    if (typeof(tempGlobalNames) === 'string') {
      let globalNames = this.formatStringConfigsToArray(tempGlobalNames)
      nova.config.set('todo.global-ignore-names', globalNames)
    }

    if (typeof(tempWorkspaceNames) === 'string') {
      let workspaceNames = this.formatStringConfigsToArray(tempWorkspaceNames)
      nova.workspace.config.set('todo.workspace-ignore-names', workspaceNames)
    }
  }

  /*
    Updates the excluded paths configuration string used in TODO version 1-2, to an
    array compatible with the pathArray configuration UI used in TODO version 3.
    This feature was added to the Nova API in V4.
  */
  updateExcludedPathsToV3() {
    let tempPaths = nova.workspace.config.get('todo.workspace-ignore-paths')

    if (typeof(tempPaths) === 'string') {
      let pathArray = this.formatStringConfigsToArray(tempPaths)
      pathArray = pathArray.map(path => FUNCTIONS.normalizePath(path))
      nova.workspace.config.set('todo.workspace-ignore-paths', pathArray)
    }
  }

  /*
    Updates the excluded extensions configuration string used in TODO version 1-2, to an
    array compatible with the stringArray configuration UI used in TODO version 3.
    This feature was added to the Nova API in V4.
  */
  updateExcludedExtensionsToV3() {
    let tempGlobalExtensions    = nova.config.get('todo.global-ignore-extensions')
    let tempWorkspaceExtensions = nova.workspace.config.get('todo.workspace-ignore-extensions')

    if (typeof(tempGlobalExtensions) === 'string') {
      let globalExtensions = this.formatStringConfigsToArray(tempGlobalExtensions)
      nova.config.set('todo.global-ignore-extensions', globalExtensions)
    }

    if (typeof(tempWorkspaceExtensions) === 'string') {
      let workspaceExtensions = this.formatStringConfigsToArray(tempWorkspaceExtensions)
      nova.workspace.config.set('todo.workspace-ignore-extensions', workspaceExtensions)
    }
  }

  /*
    Converts configuration strings when upgrading to version 3 from a prior version.
  */
  formatStringConfigsToArray(string) {
    let array = string.split(',')
    array = array.map(path => path.trim()) // Removes any additional whitespace around elements.
    array = array.filter(path => path) // Removes blank elements.

    return array
  }
}
