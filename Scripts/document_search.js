const { ListItem } = require('./list_item.js')

exports.DocumentSearch = class DocumentSearch {
  constructor(config) {
    this.keywords              = config.keywords
    this.caseSensitiveMatching = config.caseSensitiveMatching
  }

  /*
    Opens a file into an array of lines for keyword searching.
    Accepts a file path and returns an array of keyword
    matches as ListItem objects.
  */
  searchFile(filePath) {
    let file        = nova.fs.open(filePath)
    let lines       = file.readlines()
    let fileMatches = this.searchLines(lines)

    fileMatches.forEach((listItem) => {
      listItem.path = file.path
    })

    file.close()

    return fileMatches
  }

  /*
    Reads a Nova TextDocument object and splits its content
    into an array of lines for keyword searching.
    Accepts a Nova TextDocument object and returns an array of keyword
    matches as ListItem objects.
  */
  searchOpenDocument(textDocument) {
    let range = new Range(0, textDocument.length)
    let documentContent = textDocument.getTextInRange(range)
    let lines = documentContent.split(textDocument.eol)
    let documentMatches = this.searchLines(lines)

    documentMatches.forEach((listItem) => {
      listItem.path = textDocument.path
    })

    return documentMatches
  }

  /*
    Searches a document line by line for keywords and returns an
    array of ToDoListItem objects for a specific document. Accepts the
    entire contents of a document.
  */
  searchLines(documentLines) {
    let documentMatches           = []
    let docmentLineStartPosition = 0

    for(let i = 0; i < documentLines.length; i++) {
      let lineMatches = this.searchLine(documentLines[i])

      lineMatches.forEach((match) => {
        let listItem      = new ListItem(match.name)

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
    Searches a line of code for keywords
    and returns an array of objects containing the keyword,
    column number of the match as well as the text
    (most likely a comment) following the keyword.
  */
  searchLine(line) {
    let matchRegex = new RegExp(`${this.keywords.join('|')}`)
    let lineMatches = []

    this.keywords.forEach((keyword) => {
      let lineMatchIndex

      if (this.caseSensitiveMatching == true) {
        lineMatchIndex = line.indexOf(keyword)
      } else {
        lineMatchIndex = line.toLowerCase().indexOf(keyword.toLowerCase())
      }

      while(lineMatchIndex >= 0) {
        this.extractCommentFromLine(keyword, lineMatchIndex, line)

        if (this.isTag(keyword, lineMatchIndex, line)) {
          lineMatches = [...lineMatches, {
            name: keyword,
            column: lineMatchIndex + 1,
            comment: this.extractCommentFromLine(keyword, lineMatchIndex, line)
          }]
        }

        lineMatchIndex = line.indexOf(keyword, (lineMatchIndex + 1))
      }
    })

    return lineMatches
  }

  /*
    Returns the line after the keyword and the : or ] character, trimming any whitespace.
  */
  extractCommentFromLine(keyword, lineMatchIndex, line) {
    let comment = line.substring(lineMatchIndex + (keyword.length + 1))

    return comment.trim()
  }

  /*
    Returns true if keyword at the currently evaluated index is followed by a : or ],
    in which case it is recognized as a tag.
  */
  isTag(keyword, lineMatchIndex, line) {
    let nextChar = line.charAt(lineMatchIndex + keyword.length)

    if (nextChar == ':' || nextChar == ']') {
      return true
    } else {
      return false
    }
  }
}
