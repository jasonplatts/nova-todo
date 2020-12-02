module.exports.FileLoader = class FileLoader {
  constructor(rootPath, keywords) {
    this.setRootPath(rootPath);
    this.keywords = keywords;
  }
  
  setRootPath(path) {
    this.rootPath = "/" + path.split("/").slice(3).join("/");
  }
  
  egrepExec() {
    return new Promise((resolve, reject) => {
      let returnValue = {
        status: 0,
        stdout: [],
        stderr: [],
      };
      
      let keywordQuery = this.keywords.join("|");
      
      // Helpful information on egrep options
      // https://unix.stackexchange.com/questions/282648/using-grep-with-the-exclude-dir-flag-to-exclude-multiple-directories
      let exclusions = [
        "--exclude-dir=node_modules",
        "--exclude-dir=packs",
        "--exclude-dir=packs-test",
        "--exclude-dir=tmp",
        "--exclude-dir=logs",
        "--exclude-dir=log"
      ];
      
      let options = {
        args: [keywordQuery, "-lIR", ...exclusions, this.rootPath]
      };
      
      let process = new Process("/usr/bin/egrep", options);
      
      process.onStdout((l) => {
        returnValue.stdout.push(l.trim());
      });
      
      process.onStderr((l) => {
        returnValue.stderr.push(l.trim());
      });
      
      process.onDidExit((status) => {
        returnValue.status = status;
        if (status === 0) {
          resolve(returnValue);
        } else {
          reject(returnValue);
        }
      });
      
      try {
        process.start();
      } catch (e) {
        returnValue.status = 128;
        returnValue.stderr = [e.message];
        reject(returnValue);
      } 
    });
  }
  
  mdFindExec() {
    return new Promise((resolve, reject) => {
      let returnValue = {
        status: 0,
        stdout: [],
        stderr: [],
      };
      
      let keywordQuery = "kMDItemTextContent == " + this.keywords.join(" || kMDItemTextContent == ");
      
      let options = {
        args: [keywordQuery, "-onlyin", this.rootPath]
      };
        
      let process = new Process("/usr/bin/mdfind", options);
      
      process.onStdout((l) => {
        returnValue.stdout.push(l.trim());
      });
      
      process.onStderr((l) => {
        returnValue.stderr.push(l.trim());
      });
      
      process.onDidExit((status) => {
        returnValue.status = status;
        if (status === 0) {
          resolve(returnValue);
        } else {
          reject(returnValue);
        }
      });
      
      try {
        process.start();
      } catch (e) {
        returnValue.status = 128;
        returnValue.stderr = [e.message];
        reject(returnValue);
      } 
    });
  }
}