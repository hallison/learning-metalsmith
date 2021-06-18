const metalsmith = require("metalsmith");
const markdown = require("metalsmith-markdown");

const package = require("./package.json");

const logger = function(files, base, done) {
  setImmediate(done);
  Object.keys(files).map(function(source) {
    var data = files[source];
    console.log({ source: source, data: data });
  });
}

const checkFail = function(fail) {
  if (fail) {
    throw fail;
  }
}

const site = metalsmith(__dirname);

site.metadata({
  package: package,
  title: undefined,
  publishingDate: undefined,
  cover: undefined,
});

site.source("./content");
site.destination("./deploy");
site.clean(true);
site.use(markdown());

site.build(checkFail);
