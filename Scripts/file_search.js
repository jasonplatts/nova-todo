const { Tag } = require('./tag.js')

exports.FileSearch = class FileSearch {
  constructor(filePath, config) {
    this.filePath              = filePath
    this.keywords              = config.keywords
    this.caseSensitiveMatching = config.caseSensitiveMatching
  }

  /*
  Searches a file line by line for keywords
  and returns an array of ToDoListItem objects
  for a specific file. Accepts a Nova file object.
  */
  search() {
    let file                  = nova.fs.open(this.filePath)
    let contents              = file.readlines()
    let fileMatches           = []
    let fileLineStartPosition = 0

    for(let i = 0; i < contents.length; i++) {
      let lineMatches = this.searchLine(contents[i])

      lineMatches.forEach((match) => {
        let tag      = new Tag(match.name)
        tag.filePath = file.path
        tag.line     = i + 1
        tag.column   = match.column
        tag.position = fileLineStartPosition + (match.column - 1)
        tag.comment  = match.comment

        fileMatches  = fileMatches.concat(tag)
      })

      fileLineStartPosition += contents[i].length
    }

    file.close()

    return fileMatches
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
          lineMatches.push(
            {
              name: keyword,
              column: lineMatchIndex + 1,
              comment: this.extractCommentFromLine(keyword, lineMatchIndex, line)
            }
          )

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
