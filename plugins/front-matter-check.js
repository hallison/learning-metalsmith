module.exports = function() {
  return function(files, base, done) {
    setImmediate(done);
    Object.keys(files).map(function(target) {
      var data = files[target];
      Object.keys(data)
            .filter(key => key.match(/\W/))
            .map((key) => {
              data[
                key
                  .replace(/\W\w/g, characters => characters.toUpperCase())
                  .replace(/\W/g, "")
              ] = data[key];
              delete data[key];
            });
    });
  }
}
