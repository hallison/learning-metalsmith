const fs = require("fs");
const path = require("path");

// @TODO: Refactor to support patterns */*/*.<ext>
const find = function(directory, pattern) {
  var filesByPattern = [];
  var suffix = path.extname(pattern);
  var prefix = path.dirname(pattern);
  var glob = pattern.replace(`${prefix}/`, "").replace(suffix, "");
  var isRecursive = glob == "**";
  var pathPrefix = path.join(directory, prefix);

  try {
    var entries = fs.readdirSync(pathPrefix, {
      encoding: "utf-8",
      withFileTypes: true,
    });
  } catch(fail) {
    console.error(fail.toString())
    return [];
  }

  entries.forEach(function(entry) {
    var entryPath = path.join(pathPrefix, entry.name)

    if (entry.isDirectory() && isRecursive) {
      filesByPattern = filesByPattern.concat(find(entryPath, `${glob}${suffix}`));
    } else if (suffix == path.extname(entry.name)) {
      filesByPattern.push(entryPath);
    } else {
      null
    }
  });

  return filesByPattern;
}

const plugin = function(options) {
  options = options || {
    posts: "**.md",
  }

  return function(files, metalsmith, done) {
    setImmediate(done);

    var metadata = metalsmith.metadata();
    var collections = {};
    var foundFiles = {};

    // foundFiles[collection] = fileList.map(function(fileName) {
    //   return fileName.replace(`${metalsmith.source()}/`, "");
    // });
    Object.keys(options).map(function(collection) {
      var fileList = find(metalsmith.source(), options[collection])
        .map(function(fileName) {
          return fileName.replace(`${metalsmith.source()}/`, "");
        });

      if (fileList.length) {
        collections[collection] = [];
        fileList.map(function(fileName) {
          files[fileName] && collections[collection].push(files[fileName]);
        });
      }
    });

    metadata.collections = collections;

    console.log(metadata.collections)
  }
}

module.exports = plugin;
