'use strict'

const FUNCTIONS = require('./functions.js')

/*
 Class provides interface to macOS egrep command line functionality.
*/
exports.WorkspaceSearch = class WorkspaceSearch {
  constructor(path, config) {
    this._path   = path
    this._config = config
  }

  // Helpful information on egrep options
  // https://unix.stackexchange.com/questions/282648/using-grep-with-the-exclude-dir-flag-to-exclude-multiple-directories
  static get EGREP_EXCLUSIONS() {
    return [
      '--exclude-dir=node_modules',
      '--exclude-dir=packs',
      '--exclude-dir=packs-test',
      '--exclude-dir=tmp',
      '--exclude-dir=logs',
      '--exclude-dir=log'
    ]
  }

  /*
    Returns files containing matching tags.
  */
  async search() {
    try {
      let egrepResponse = await this.egrepExec()

      return egrepResponse.stdout
    } catch (error) {
      return []
    }
  }

  egrepExec() {
    return new Promise((resolve, reject) => {
      let processResponse = {
        status: 0,
        stdout: [],
        stderr: [],
      }
      let tagQuery = this._config.tags.join('|')

      /*
        Option descriptions
        -l --files-with-matches - Suppresses normal output, instead printing name of each input file,
        therefore, scanning stops on the first match.
        -I - Process binary files as if they do not contain matching data.
        -R -recursive - Read all files under each directory.
        -i --ignore-case - Ignore case when matching the pattern.
      */
      let options = {
        args: [tagQuery, '-lIRi', ...WorkspaceSearch.EGREP_EXCLUSIONS, FUNCTIONS.normalizePath(this._path)]
      }

      let process = new Process('/usr/bin/egrep', options)

      let processDisposables = new CompositeDisposable

      processDisposables.add(process.onStdout((l) => {
        processResponse.stdout = [...processResponse.stdout, l.trim()]
      }))

      processDisposables.add(process.onStderr((l) => {
        processResponse.stderr = [...processResponse.stderr, l.trim()]
      }))

      processDisposables.add(process.onDidExit((exitStatus) => {
        /*
          As per Nova API documentation, onDidExit provides as a callback argument,
          the exit status of the subprocess.
        */
        processResponse.status = exitStatus

        if (exitStatus === 0) {
          processDisposables.dispose()
          resolve(processResponse)
        } else {
          processDisposables.dispose()
          reject()
        }
      }))

      process.start()
    })
  }
}
