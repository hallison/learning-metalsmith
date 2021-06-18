const path = require("path");
const glob = require("glob");
const yaml = require("js-yaml");
const fs = require("fs");
const debug = require("debug")("plugins/data");

const parsers = {
  ".json": JSON.parse,
  ".yaml": yaml.safeLoad,
  ".yml": yaml.safeLoad,
};

const plugin = function(options) {
  options = options || {
    directory: "data",
  };

  return function(files, metalsmith, done) {
    setImmediate(done);

    var metadata = metalsmith.metadata();
    var currentDirectory = metadata.directory;
    var extensions = Object.keys(parsers);
    var globDataFiles = `${options.directory}/**.{yaml,yml,json}`;

    glob(globDataFiles, function(fail, dataFiles) {
      if (fail) {
        throw fail;
      }

      (!dataFiles.length) && done(new Error("Data files not found"));

      dataFiles.forEach(function(data) {
        var fileName = path.basename(data);
        var extension = path.extname(fileName);
        var dataKey = fileName.replace(extension, "");
        var dataContent = fs.readFileSync(data, 'utf8');
        var parse = parsers[extension];

        debug("data", {
          fileName,
          extension,
          dataKey,
          dataContent,
          parse,
        });

        if (!~extensions.indexOf(extension)) {
          done(new Error(`Unsupported data type "${extension}"`));
        }

        if (dataContent.length) {
          try {
            metadata[dataKey] = parse(dataContent);
          } catch(fail) {
            throw fail;
          }
        } else {
          done(new Error(`Data file "${fileName}" is empty`));
        }
      })
    });
  };
}

module.exports = plugin;
