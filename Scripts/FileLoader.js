module.exports.FileLoader = class FileLoader {
  constructor(rootPath) {
    this.setRootPath(rootPath);
    this.keywords = ["FIXME", "TODO"];
  }
  
  setRootPath(path) {
    this.rootPath = "/" + path.split("/").slice(3).join("/");
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
        console.log("HERE", l);
        returnValue.stderr.push(l.trim());
      });
      
      process.onDidExit((status) => {
        returnValue.status = status;
        if (status === 0) {
          resolve(returnValue);
        } else {
          console.log("HERE", l);
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