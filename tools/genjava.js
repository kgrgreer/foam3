/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

var path_ = require('path');
var fs_   = require('fs');

process.on('unhandledRejection', function(e) {
  console.error("ERROR: Unhandled promise rejection ", e);
  process.exit(1);
});

// enable FOAM java support.
globalThis.FOAM_FLAGS = {
  'java':    true,
  'genjava': true,
  'node':    true,
  'debug':   true,
  'js':      false,
  'swift':   false
};

// Enable FOAMLink mode but only if FOAMLINK_DATA is set in environment
var foamlinkMode = process.env.hasOwnProperty('FOAMLINK_DATA');
if ( foamlinkMode ) {
  globalThis.FOAMLINK_DATA = process.env['FOAMLINK_DATA'];
}

require('../src/foam_node.js');
require('../src/foam/nanos/nanos.js');
require('../src/foam/support/support.js');

var srcPath = __dirname + "/../src/";

if ( ! (
  process.argv.length == 4 ||
  process.argv.length == 5 ||
  process.argv.length == 6 ) ) {
  console.log("USAGE: genjava.js input-path output-path src-path(optional) files-to-update(optional)");
  process.exit(1);
}

if ( process.argv.length > 4 && process.argv[4] !== '--' ) {
  srcPath = process.argv[4];
  if ( ! srcPath.endsWith('/') ) {
    srcPath = srcPath + '/';
  }
}

var incrementalMeta = null;
if ( process.argv.length > 5  &&
     process.argv[5] !== '--' &&
     process.argv[5] != '' ) {
  incrementalMeta = JSON.parse(process.argv[5]);
}

var indir = path_.resolve(path_.normalize(process.argv[2]));

function ensurePath(p) {
  var i     = 1 ;
  var parts = p.split(path_.sep);
  var path  = '/' + parts[0];

  while ( i < parts.length ) {
    try {
      var stat = fs_.statSync(path);
      if ( ! stat.isDirectory() ) throw path + 'is not a directory';
    } catch(e) {
      fs_.mkdirSync(path);
    }

    path += path_.sep + parts[i++];
  }
}


function writeFileIfUpdated(outfile, buildJavaSource, opt_result) {
  if (! ( fs_.existsSync(outfile) && (fs_.readFileSync(outfile).toString() == buildJavaSource))) {
    fs_.writeFileSync(outfile, buildJavaSource);
    if ( opt_result !== undefined) opt_result.push(outfile);
  }
}


var externalFile  = require(indir);
var fileWhitelist = null;

/*
// Set file whitelist from parsed argument, but only if foamlink is enabled
if ( incrementalMeta !== null && foamlinkMode ) {
  fileWhitelist = {}; // set
  for ( var i = 0; i < incrementalMeta.modified.length; i++ ) {
    let relativePath = path_.relative(process.cwd(), incrementalMeta.modified[i]);
    fileWhitelist[relativePath] = true;
  }
}
console.log('**************************** fileWhiteList', fileWhitelist);
*/

const CLASS_TYPES = [
  {
    name: 'classes',
    build: cls => cls.buildJavaClass()
  },
  {
    name: 'abstractClasses',
    // TODO: needed?
    build: cls => cls.buildJavaClass(foam.java.Class.create({abstract: true}))
  },
  {
    name: 'skeletons',
    build: cls => foam.java.Skeleton.create({of: cls}).buildJavaClass()
  },
  {
    name: 'proxies',
    build: cls => {
      var proxy = foam.core.Model.create({
        package: cls.package,
        name: 'Proxy' + cls.name,
        implements: [cls.id],
        properties: [
          {
            class: 'Proxy',
            of: cls.id,
            name: 'delegate'
          }
        ]
      });

      proxy.source = cls.model_.source;

      return proxy.buildClass().buildJavaClass();
    }
  }
];

var outdir = process.argv[3];
outdir = path_.resolve(path_.normalize(outdir));

var extraJavaClasses = [];
var javaClasses      = [];

foam.__context__ = foam.__context__.createSubContext({
  registerFactory: function(m, factory) {
     this.__proto__.registerFactory.call(this, m, factory);
     extraJavaClasses.push(factory);
  }
});


CLASS_TYPES.forEach(ct => externalFile[ct.name].forEach(clsName => {
  if ( foam.Array.isInstance(clsName) ) clsName = clsName[1];
  if ( ! foam.isRegistered(clsName) ) {
    console.log('Add to files.js: ', "  { name: '" + clsName + "', flags: ['java'] },");
  }
}));


CLASS_TYPES.forEach(ct => externalFile[ct.name].forEach(clsName => {
  if ( foam.Array.isInstance(clsName) ) clsName = clsName[1];
  try {
    var cls = foam.lookup(clsName);

    javaClasses.push(ct.build(cls));
  } catch (x) {
    console.log('Unable to build: ', x, cls, ct.name);
    process.exit(1);
  }
}));

var generatedJava = {};
var flagFilter = foam.util.flagFilter(['java']);

function generateJava(javaClass) {
  if ( ! javaClass ) return;

  if ( foam.Function.isInstance(javaClass) ) {
    javaClass = javaClass();
  }

  if ( javaClass.name === 'SimpleTxnId' ) debugger;
  if ( javaClass.flags && ! javaClass.flags.includes('java') ) return;
  if ( generatedJava[javaClass.id] ) return;

  // Could be Class, Interface or Enum
  if ( javaClass.buildJavaClass ) {
    javaClass = javaClass.buildJavaClass();
  }

  generatedJava[javaClass.id] = true;

  console.log('generating', javaClass.id + '.java');
  var outfile = outdir + path_.sep + javaClass.id.replace(/\./g, path_.sep) + '.java';

  ensurePath(outfile);
  writeFileIfUpdated(outfile, javaClass.toJavaSource());
}

var missing = {};
var found = {};

for ( var key in foam.UNUSED ) try { foam.lookup(key); } catch(x) { }

javaClasses.forEach(function(c) {
  if ( c.id.indexOf('nanopay') == -1 ) {
    if ( ! c.model_.flags || ! c.model_.flags.includes('java') ) {
      if ( c.id == 'foam.core.Glyph' ) debugger;
      console.log("********************************* MISSING flags: ['java'] in ", c.id);
      missing[c.id] = true;
    } else {
      console.log("********************************* FOUND ", c.id);
      found[c.id] = true;
    }
  }

  generateJava(c);
});
//console.log(missing);
console.log(found);
console.log('****** EXTRA', extraJavaClasses);
extraJavaClasses.forEach(generateJava);

console.log('************************* START GENERATING flags: java files.');
for ( var key in foam.USED ) {
  try {
    var c = foam.lookup(key);
    if ( c.model_.flags && c.model_.flags.includes('java') )
      generateJava(c);
  } catch(x) {}
}
console.log('************************* END GENERATING flags: java files.');
