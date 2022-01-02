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
globalThis.FOAM_FLAGS = { 'java': true, 'node': true, 'debug': true, 'js': false, 'swift': false };

// Enable FOAMLink mode but only if FOAMLINK_DATA is set in environment
var foamlinkMode = process.env.hasOwnProperty('FOAMLINK_DATA');
if ( foamlinkMode ) {
  globalThis.FOAMLINK_DATA = process.env['FOAMLINK_DATA'];
}

var logger = {};
logger.debug = () => {};

// Store debug files but only if DEBUG_DATA_DIR is set in environment
var debugDataDir = null;
if ( process.env.hasOwnProperty('DEBUG_DATA_DIR') ) {
  debugDataDir = process.env['DEBUG_DATA_DIR'];
  logger.debug = (...args) => {
    fs_.appendFileSync(path_.join(debugDataDir, 'debugLog.jrl'),
      args.join('p({"type": "debug", "value": ' + JSON.stringify(args) + '})\n')
    );
  };
}

require('../src/foam_node.js');
require('../src/foam/nanos/nanos.js');
require('../src/foam/support/support.js');

var srcPath = __dirname + "/../src/";

if ( ! (
  process.argv.length == 4 ||
  process.argv.length == 5 ||
  process.argv.length == 6 ) ) {
  console.log("USAGE: genjava.js input-path output-path src-path(optional) files-to-update (optional)");
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
  logger.debug('INCREMENTAL', process.argv[5]);
}

var indir = process.argv[2];
indir = path_.resolve(path_.normalize(indir));

// TODO: remove
function createBlacklist(bl) {
  var blacklist = {};

return {};

  bl.forEach(function(cls) {
    blacklist[cls] = true;
  });

  [
    'FObject',
    'foam.core.AbstractEnum',
    'foam.core.AbstractInterface',
    'foam.core.Property',
    'foam.core.String',
'foam.core.Boolean',
'foam.core.Method',
'foam.java.Class',
'foam.core.Action',

    // These have hand written java impls so we don't want to clobber them.
    // TODO: Change gen.sh to prefer hand written java files over generated.
    'foam.dao.LimitedDAO',
    'foam.dao.OrderedDAO',
    'foam.dao.SkipDAO',

    // TODO: These models currently don't compile in java but could be updated to
    // compile properly.
    'foam.blob.BlobBlob',
    'foam.dao.CompoundDAODecorator',
    'foam.dao.DAOInterceptor',
    'foam.dao.FlowControl',
    'foam.dao.sync.SyncRecord',
    'foam.dao.sync.VersionedSyncRecord',
    'foam.mlang.Expressions',
    'foam.nanos.menu.MenuBar',

    'foam.box.Context',
  //  'foam.box.HTTPBox',
  //  'foam.box.SessionClientBox',
    'foam.box.SocketBox',
    'foam.box.WebSocketBox',
    'foam.box.TimeoutBox',
    'foam.box.RetryBox',
    'foam.dao.TTLCachingDAO',
    'foam.dao.CachingDAO',
    'foam.dao.CompoundDAODecorator',
    'foam.dao.InterceptedDAO',
    'foam.dao.DeDupDAO',
    'foam.dao.IDBDAO',
    'foam.dao.LoggingDAO',
    'foam.dao.MDAO',
    'foam.dao.RequestResponseClientDAO',
    'foam.dao.SyncDAO',
    'foam.dao.TimingDAO'
  ].forEach(function(cls) {
    blacklist[cls] = true;
  });

  return blacklist;
}


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
var blacklist     = createBlacklist(externalFile.blacklist);

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
logger.debug('fileWhitelist', fileWhitelist);
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
      console.log('************************** PROXY', cls.id);
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
    console.log('======================================================== register', m.id);
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

  if ( generatedJava[javaClass.id] || blacklist[javaClass.id] ) return;

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

console.log('------------------------ GENERATING EXPLICIT CLASSES');
javaClasses.forEach(generateJava);

console.log('------------------------ GENERATING EXTRA CLASSES');

extraJavaClasses.forEach(generateJava);
