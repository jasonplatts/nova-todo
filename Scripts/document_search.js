'use strict'
const FUNCTIONS    = require('./functions.js')
const { ListItem } = require('./list_item.js')

exports.DocumentSearch = class DocumentSearch {
  constructor(config) {
    this._config = config
  }

  /*
    Opens a file into an array of lines for tag searching.
    Accepts a file path and returns an array of tag
    matches as ListItem objects.
  */
  searchFile(filePath) {
    try {
      let file        = nova.fs.open(filePath)
      let lines       = file.readlines()
      let fileMatches = this.searchLines(lines)

      fileMatches.forEach((listItem) => {
        listItem.path = file.path
      })

      file.close()

      return fileMatches
    } catch (error) {
      FUNCTIONS.showConsoleError(error)
    }
  }

  /*
    Reads a Nova TextDocument object and splits its content
    into an array of lines for tag searching.
    Accepts a Nova TextDocument object and returns an array of tag
    matches as ListItem objects.
  */
  searchOpenDocument(textDocument) {
    let range           = new Range(0, textDocument.length)
    let documentContent = textDocument.getTextInRange(range)
    let lines           = documentContent.split(textDocument.eol)
    let documentMatches = this.searchLines(lines)

    documentMatches.forEach((listItem) => {
      listItem.path   = textDocument.path
      listItem.remote = textDocument.isRemote
    })

    return documentMatches
  }

  /*
    Searches a document line by line for tags and returns an
    array of ToDoListItem objects for a specific document. Accepts the
    entire contents of a document.
  */
  searchLines(documentLines) {
    let documentMatches          = []
    let docmentLineStartPosition = 0

    for(let i = 0; i < documentLines.length; i++) {
      let lineMatches = this.searchLine(documentLines[i])

      lineMatches.forEach((match) => {
        let listItem      = new ListItem(match.name)

        // Tag must be recorded separately from name in order to reset name after changing grouping.
        listItem.tag      = match.name
        listItem.line     = i + 1
        listItem.column   = match.column
        listItem.position = docmentLineStartPosition + (match.column - 1)
        listItem.comment  = match.comment

        documentMatches  = documentMatches.concat(listItem)
      })

      docmentLineStartPosition += documentLines[i].length
    }

    return documentMatches
  }

  /*
    Searches a line of code for tags
    and returns an array of objects containing the tag,
    column number of the match as well as the text
    (most likely a comment) following the tag.
  */
  searchLine(line) {
    let matchRegex  = new RegExp(`${this._config.tags.join('|')}`)
    let lineMatches = []

    this._config.tags.forEach((tag) => {
      let lineMatchIndex

      if (this._config.caseSensitiveMatching == true) {
        lineMatchIndex = line.indexOf(tag)
      } else {
        lineMatchIndex = line.toLowerCase().indexOf(tag.toLowerCase())
      }

      while(lineMatchIndex >= 0) {
        this.extractCommentFromLine(tag, lineMatchIndex, line)

        if (this.isTag(tag, lineMatchIndex, line)) {
          lineMatches = [...lineMatches, {
            name: tag,
            column: lineMatchIndex + 1,
            comment: this.extractCommentFromLine(tag, lineMatchIndex, line)
          }]
        }

        lineMatchIndex = line.indexOf(tag, (lineMatchIndex + 1))
      }
    })

    return lineMatches
  }

  /*
    Returns the line after the tag and the : or ] character, trimming any whitespace.
  */
  extractCommentFromLine(tag, lineMatchIndex, line) {
    let comment = line.substring(lineMatchIndex + (tag.length + 1))

    return comment.trim()
  }

  /*
    Returns true if tag at the currently evaluated index is followed by a : or ],
    in which case it is recognized as a tag.
  */
  isTag(tag, lineMatchIndex, line) {
    let prevChar = line.charAt(lineMatchIndex - 1)
    let nextChar = line.charAt(lineMatchIndex + tag.length)

    if ((nextChar == ':' || nextChar == ']' || (this._config._whitespaceTagging && (nextChar == ' ' || nextChar == "\t"))) && (prevChar !== '_')) {
      return true
    } else {
      return false
    }
  }
}
