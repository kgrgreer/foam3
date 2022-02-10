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


function writeFileIfUpdated(outfile, javaSource, opt_result) {
  if ( ! ( fs_.existsSync(outfile) && (fs_.readFileSync(outfile).toString() == javaSource))) {
    fs_.writeFileSync(outfile, javaSource);
    opt_result?.push(outfile);
  }
}


var externalFile  = require(indir);
var fileWhitelist = null;


const CLASS_TYPES = [
  {
    name: 'classes',
    build: cls => cls.buildJavaClass()
  },
  {
    name: 'abstractClasses',
    // TODO: needed?
    build: cls => cls.buildJavaClass(foam.java.Class.create({abstract: true, flags: [ 'java' ]}))
  },
  {
    name: 'skeletons',
    build: cls => foam.java.Skeleton.create({of: cls.id, flags: [ 'java' ]}).buildJavaClass()
  },
  {
    name: 'proxies',
    build: cls => {
      var proxy = foam.core.Model.create({
        package: cls.package,
        name: 'Proxy' + cls.name,
        implements: [cls.id],
        flags: [ 'java' ],
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

function generateJava(cls) {
  if ( ! cls ) { debugger; return; }

  if ( foam.Function.isInstance(cls) ) {
    debugger;
    cls = cls();
  }

  if ( generatedJava[cls.id] ) {
    console.log('WARNING *************************: Duplicate building of', cls.id);
    return;
  }

  var javaClass = cls.buildJavaClass ? cls.buildJavaClass() : cls;

  /*
  // Could be Class, Interface or Enum
  if ( javaClass.buildJavaClass ) {
  } else {
    debugger;
    console.log('****************************** CLASS NOT JAVACLASS', javaClass.id);
  }
  */

  generatedJava[cls.id] = true;
  var c2 = foam.maybeLookup(javaClass.id) || foam.CLASS(cls);
if ( ! c2 ) debugger;
  c2.model_.targetJava(outdir);
  /*
  console.log('generating(1)', cls.id + '.java');
  var outfile = outdir + path_.sep + javaClass.id.replace(/\./g, path_.sep) + '.java';

  ensurePath(outfile);
  if ( ! javaClass.toJavaSource ) debugger;
  writeFileIfUpdated(outfile, javaClass.toJavaSource());
  */
}

var missing = {};
var found   = {};

for ( var key in foam.UNUSED ) try { foam.lookup(key); } catch(x) { }

// console.log('**** SAFE ', foam.SAFE);
javaClasses.filter(c => ! foam.java.Class.isInstance(c)).forEach(function(/* foam.core.Class */ c) {
  if ( foam.Function.isInstance(c) ) c = c();

  foam.lookup(c.id).model_.targetJava(outdir);
});

javaClasses.filter(c => foam.java.Class.isInstance(c)).forEach(function(/* foam.java.Class */ c) {

  if ( false && c.id.indexOf('nanopay') != -1 ) {
    var cls = foam.maybeLookup(c.id);
    if ( ! cls ) return;
    var model = cls.model_;
    /*
    // if ( model.flags && model.flags.includes('java') ) {
    if ( false && ! model.flags || ! model.flags.includes('java') ) {
      var id = c.id.replaceAll('.', '/');

      if ( foam.SAFE[id] ) {
        console.log(`### egrep -v "${c.id}" tools/classes.js > /tmp/junk ; cp /tmp/junk tools/classes.js`);
        for ( var file of [
          'nanopay/src/net/nanopay/files.js',
          'interac/src/net/nanopay/interac/files.js',
          'nanopay/src/net/nanopay/iso8583/files.js',
          'nanopay/src/net/nanopay/flinks/utils/files.js',
          'nanopay/src/net/nanopay/fx/ascendantfx/model/files.js',
          'nanopay/src/net/nanopay/kotak/model/paymentResponse/files.js',
          'nanopay/src/net/nanopay/kotak/model/reversal/files.js',
          'nanopay/src/net/nanopay/kotak/model/paymentRequest/files.js',
          'nanopay/src/net/nanopay/iso20022/files.js'        ] )
        console.log(`### sed -i '' 's_"${id}"_"${id}", flags: [ "java" ]_g' ${file}`);
      }
    //        console.log("********************************* MISSING flags: ['java'] in ", c.id);
      missing[c.id] = true;
    }
    */
  }

  // TODO
  // generateJava(c);

  console.log('generating(1)', c.id + '.java');
  var outfile = outdir + path_.sep + c.id.replace(/\./g, path_.sep) + '.java';

  ensurePath(outfile);
  writeFileIfUpdated(outfile, c.toJavaSource());
});

// console.log('***** MISSING', missing);
console.log(found);
console.log('****** EXTRA', extraJavaClasses);

function maybeGenerateJava(c) {
  if ( foam.Function.isInstance(c) ) {
    c = c();
  }

  if ( c.model_.flags && ! c.model_.flags.includes('java') ) {
    // console.log('***** NOT GENERATING', c.id);
    return;
  }
  // console.log('***** GENERATING', c.id);
  generateJava(c);
}

extraJavaClasses.forEach(maybeGenerateJava);

console.log('************************* START GENERATING flags: java files.');
for ( var key in foam.USED ) {
  try {
    var c = foam.lookup(key);
    maybeGenerateJava(c);
  } catch(x) {}
}
console.log('************************* END GENERATING flags: java files.');
