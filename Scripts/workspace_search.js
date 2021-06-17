const FUNCTIONS = require('./functions.js')

/*
 Class provides interface to macOS egrep command line functionality.
*/
exports.WorkspaceSearch = class WorkspaceSearch {
  constructor(path, config) {
    this.path   = path
    this.config = config
  }

  /*
    Returns files containing matching tags.
  */
  search() {
    return new Promise((resolve, reject) => {
      let files = this.egrepExec()

      files.then((response, reject) => {
        resolve(response.stdout)
      })
      files.catch((alert) => {
        reject(alert)
      })
    })
  }

  egrepExec() {
    return new Promise((resolve, reject) => {
      let returnValue = {
        status: 0,
        stdout: [],
        stderr: [],
      }

      let tagQuery = this.config.tags.join('|')

      // Helpful information on egrep options
      // https://unix.stackexchange.com/questions/282648/using-grep-with-the-exclude-dir-flag-to-exclude-multiple-directories
      let exclusions = [
        '--exclude-dir=node_modules',
        '--exclude-dir=packs',
        '--exclude-dir=packs-test',
        '--exclude-dir=tmp',
        '--exclude-dir=logs',
        '--exclude-dir=log'
      ]

      // Option descriptions
      // -l --files-with-matches - Suppresses normal output, instead printing name of each input file,
      // therefore, scanning stops on the first match.
      // -I - Process binary files as if they do not contain matching data.
      // -R -recursive - Read all files under each directory.
      // -i --ignore-case - Ignore case when matching the pattern.
      let options = {
        args: [tagQuery, '-lIRi', ...exclusions, FUNCTIONS.normalizePath(this.path)]
      }

      let process = new Process('/usr/bin/egrep', options)

      process.onStdout((l) => {
        returnValue.stdout = [...returnValue.stdout, l.trim()]
      })

      process.onStderr((l) => {
        returnValue.stderr = [...returnValue.stderr, l.trim()]
      })

      process.onDidExit((status) => {
        returnValue.status = status
        if (status === 0) {
          resolve(returnValue)
        } else {
          reject(returnValue)
        }
      })

      try {
        process.start()
      } catch (e) {
        returnValue.status = 128
        returnValue.stderr = [e.message]
        reject(returnValue)
      }
    })
  }
}
