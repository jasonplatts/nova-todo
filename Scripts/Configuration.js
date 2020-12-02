module.exports.Configuration = class Configuration {
  getKeywords() {
    let keywords = [
      "broken", "bug", "debug", "deprecated", "example", "error",
      "err", "fail", "fatal", "hack", "idea", "info", "note", "optimize", "question",
      "refactor", "remove", "review", "task", "trace", "update", "warn", "warning"
    ];
    
    keywords = keywords.filter(elem => {
        return nova.workspace.config.get(`todo.workspace-keyword-${elem}`)
    });
    
    keywords = keywords.map(elem => { return elem.toUpperCase() });
    
    return keywords;
 }
}