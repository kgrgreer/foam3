var flags = {};
var otherLanguages = [ 'java', 'swift' ];

if ( process.argv.length > 2 ) {
  process.argv[2].split(',').forEach(function(f) {
    flags[f] = true;
  });

  // Default to language = javascript.
  if ( ! flags.js ) {
    flags.js = ! otherLanguages.some(function(lang) {
      return flags[lang];
    });
  }
}

var outfile = __dirname + '/../nanopay-bin.js';
if ( process.argv.length > 3 ) {
  outfile = process.argv[3];
}

var payload = '';
var env = {
  FOAM_FILES: function(files) {
    files.filter(function(f) {
      return f.flags ? flags[f.flags] : true;
    }).map(function(f) {
      return f.name;
    }).forEach(function(f) {
      var data = require('fs').readFileSync(__dirname + '/../nanopay/src/' + f + '.js').toString();
      payload += data;
    });
  }
};

var data = [ require('fs').readFileSync(__dirname + '/../nanopay/src/net/nanopay/files.js') ];

for ( var i = 0; i < data.length; i++ ) {
  with (env) { eval(data[i].toString()); }
}
require('fs').writeFileSync(outfile, payload);
