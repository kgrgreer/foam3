#!/usr/bin/env node
// Build and Deploy a FOAM Application
//
// Tools
//   foam3/tools/genjs.js
//     - collects and minifies .js files into a single foam-bin.js file
//     - uses the UglifyJS library to minimize the size of the packaged .js files
//   foam3/tools/genjava.js
//     - generates .java files from .js models
//     - copies .jrl files into /target/journals
//     - TODO: copy .flow files into /target/documents
//     - create /target/javaFiles file containing list of modified or static .java files
//     - build pom.xml from accumulated javaDependencies
//     - call maven to update dependencies if pom.xml updated
//     - call javac to compile files in javaFiles
//     - create a Maven pom.xml file with accumulated POM javaDependencies information
//
// Directory Structure:
//   /deployments
//     /u           - default deployment if not JOURNAL_CONFIG not specified with -J
//       /resources - deployment speicific resources
//   /build
//     /src         - java source files created by genJava
//     /classes     - compiled java class files created with javac (called by genJava)
//   /target
//     /MANIFEST.MF - JAR manifest file, used when creating project .jar file with jar
//     /classes
//       /documents
//       /images
//       /journals
//       /webroot
//     /documents    - All .flow documents are copied here by genJava
//     /journals     - All journal.0 files created by genJava
//     /package      - Designation for .tar.gz files
//     /javaFiles    - A list of all java files to be compiled by javac, created by genJava
//     /lib          - 3rd party java .jar library files created by gradle (or maven)
//   /opt/<pom.name>
//     /bin
//     /etc
//     /keys
//     /logs
//     /target
//     /documents
//     /journals
//     /lib
//     /saf
//     /var
//
// Differences from build.sh:
//  1. -S replaced with -$
//  2. Does not write empty .0 journal files
//  3. Usage displays available tasks
//  4. -X lets you explicitly execute a comma delimited set of tasks
//  5. migrate_journals was removed, but no longer used by build.sh either
//  6. remove PID / DAEMON support
//  7. -XcleanLib will cause pom.xml to be regenerated and maven to be rerun
//
// TODO:
//   - move to FOAM
//   - rename NANOPAY to PROJECT
//   - merge build and target
//   - should genjs extract version from POM?
//   - extract common code to a library
//   - support tasks: in POM
//   - explicitly list dependencies and descriptions with tasks
//   - only add deployments/u when -u specified

const child_process = require('child_process');
const fs            = require('fs');
const path          = require('path');
const os            = require('os');

// Top-Level Loaded POM Object, not be be confused with POM, which is the name of POM(s) to be loaded
var PROJECT;

// Short-form of PROJECT.version
var VERSION;


globalThis.foam = {
  POM: function (pom) {
    // console.log('POM:', pom);
    PROJECT = pom;
    VERSION = pom.version;
  }
};
require('./pom.js');

process.on('unhandledRejection', e => {
  console.error("ERROR: Unhandled promise rejection ", e);
  process.exit(1);
});


var summary = [];
var depth   = 1;
var tasks   = [];


function execSync(cmd, options) {
  console.log('\x1b[0;32mExec: ' + cmd + '\x1b[0;0m');
  return child_process.execSync(cmd, options);
}


function task(f) {
  tasks.push(f.name);
  var fired = false;
  var rec   = [ ];
  globalThis[f.name] = function() {
    if ( fired ) return;
    fired = true;
    summary.push(rec);

    info(`Starting Task :: ${f.name}`);
    var start = Date.now();
    rec[0] = ''.padEnd(2*depth) + f.name;
    rec[2] = start;
    depth++;
    f();
    depth--;
    var end = Date.now();
    var dur = ((end-start)/1000).toFixed(1);
    info(`Finished Task :: ${f.name} in ${dur} seconds`);
    rec[1] = dur;
  }
}

function processArgs() {
  const args = process.argv.slice(2);
  for ( var i = 0 ; i < args.length ; i++ ) {
    var arg = args[i];
    if ( arg.startsWith('-') ) {
      for ( var j = 1 ; j < arg.length ; j++ ) {
        var a = arg.charAt(j);
        var d = ARGS[a];
        if ( d ) {
          d[1](arg.substring(j+1));
          if ( a >= 'A' && a <= 'Z' ) break;
        } else {
          console.log('Unknown argument "' + a + '"');
          ARGS['h'][1]();
        }
      }
    }
  }
}


function exportEnv(name, value) {
  console.log(`export ${name}="${value}"`);
  process.env[name] = value;
}


function ensureDir(dir) {
  if ( ! fs.existsSync(dir) ) {
    console.log('Creating directory', dir);
    fs.mkdirSync(dir, {recursive: true});
    return true;
  }
  return false;
}


function copyDir(src, dst) {
  fs.readdirSync(src).forEach(f => {
    fs.copyFileSync(path.join(src, f), path.join(dst, f));
  });
}


function emptyDir(dir) {
  rmdir(dir);
  ensureDir(dir);
}


function rmdir(dir) {
  if ( fs.existsSync(dir) && fs.lstatSync(dir).isDirectory() ) {
    fs.rmdirSync(dir, {recursive: true, force: true});
  }
}

function rmfile(file) {
  if ( fs.existsSync(file) && fs.lstatSync(file).isFile() ) {
    fs.rmSync(file, {force: true});
  }
}


function showSummary() {
  var s = 'Execution Summary:\n';
  summary.forEach(e => {
    if ( e[1] === undefined ) {
      var end = Date.now();
      var dur = ((end-e[2])/1000).toFixed(1);
      e[1] = dur;
    }
    s += e[0].padEnd(25) + ' ' + e[1].padStart(15) + 's\n';
  });
  info(s);
}


function quit(code) {
  showSummary();
  process.exit(code);
}


function info(msg) {
  console.log('\x1b[0;34mINFO ::', msg, '\x1b[0;0m');
}

function warning(msg) {
  console.log('\x1b[0;33mWARNING ::', msg, '\x1b[0;0m');
}

function error(msg) {
  console.log('\x1b[0;31mERROR ::', msg, '\x1b[0;0m');
  quit(1);
}



function manifest() {
  versions();
  var m = `
Manifest-Version: 1.0
Main-Class: foam.nanos.boot.Boot
Class-Path: *
Implementation-Title: ${PROJECT.name}
Implementation-Version: ${VERSION}
Specification-Version: ${NANOPAY_REVISION}
Implementation-Timestamp: ${new Date()}
${PROJECT.name}-Revision: ${NANOPAY_REVISION}
FOAM-Revision: ${FOAM_REVISION}
Implementation-Vendor: ${PROJECT.name}
`.trim() + '\n';

  if ( PROJECT.vendorId ) {
    m += `Implementation-Vendor-Id: ${PROJECT.vendorId || POM.name}\n`;
  }

  return m;
};


task(function showManifest() {
  console.log('Manifest:', manifest());
});


task(function install() {
  process.chdir(PROJECT_HOME);

  execSync('npm install');
  process.chdir('foam3');
  execSync('npm install');
  process.chdir('..');

  if ( IS_MAC ) {
    ensureDir(path.join(NANOPAY_HOME, 'journals'));
    ensureDir(path.join(NANOPAY_HOME, 'logs'));
    // fs.mkdirSync(path.join(NANOPAY_HOME, 'journals'), { recursive: true });
    // fs.mkdirSync(path.join(NANOPAY_HOME, 'logs'),     { recursive: true });
  }

  // git hooks
  execSync('git config core.hooksPath .githooks');
  execSync('git config submodule.recurse true');

  // install pkcs12
  if ( IS_MAC ) {
    exec('./tools/cert/copy-pkcs12.sh');
  }
});

// Function to deploy documents
task(function deployDocuments() {
  // TODO: Make part of genjava?
});

// Function to deploy journals
task(function deployJournals(directory) {
  console.log('JOURNAL_OUT: ', JOURNAL_OUT);
  console.log('JOURNAL_HOME:', JOURNAL_HOME);

  copyDir(JOURNAL_OUT, JOURNAL_HOME);
});


task(function cleanLib() {
  rmfile('pom.xml');
  emptyDir('./target/lib');
  genJava();
});


task(function clean() {
  if ( RUN_JAR || TEST || BENCHMARK ) {
    emptyDir(`${NANOPAY_HOME}/bin`);
    emptyDir(`${NANOPAY_HOME}/lib`);
  }

  emptyDir('./build');
  emptyDir('./target/journals'); // Don't remove whole directory to avoid removing java libs under ./target/lib
  // TODO: convert to Node to make Windows compatible
  execSync('rm -f foam-bin-*.js');
});


task(function copyLib() {
  copyDir('./target/lib', path.join(NANOPAY_HOME, 'lib'));
});

task(function genJS() {
  execSync(`node foam3/tools/genjs.js -version="${VERSION}" -flags=verbose -pom=${POM}`, { stdio: 'inherit' });
  // execSync(`node ./foam3/tools/genjs.js -pom=${POM}`, { stdio: 'inherit' });
});


task(function packageFOAM() {
  genJava();
  genJS();
});


task(function genJava() {
//   commandLine 'bash', './gen.sh', "${project.genJavaDir}", "${project.findProperty("pom")?:"pom" }"
  var pom = POM;
  if ( DISABLE_LIVESCRIPTBUNDLER ) pom += ',./tools/journal_extras/disable_livescriptbundler/pom';
  if ( JOURNAL_CONFIG )
    JOURNAL_CONFIG.split(',').forEach(c => { pom += ',./deployment/' + c + '/pom' });
  var genjava = GEN_JAVA ? 'genjava,javac' : '-genjava,-javac';
  execSync(`node foam3/tools/genjava.js -flags=${genjava},buildjournals,buildlib,verbose -outdir=./build/src/java -javacParams='--release 11' -pom=${pom}`, { stdio: 'inherit' });
});


task(function buildJava() {
  genJava();
  copyLib();
});


// Function to build the JAR file
task(function buildJar() {
  versions();

  fs.writeFileSync('./target/MANIFEST.MF', manifest());
  execSync(`jar cfm ./target/lib/${PROJECT.name}-${VERSION}.jar ./target/MANIFEST.MF -C ./target/classes . -C ./build/classes/java/main .`);
});


// Function to package the files into a tar archive
task(function buildTar() {
  // Notice that the argument to the second -C is relative to the directory from the first -C, since -C
  // switches the current directory.
  execSync(`tar -a -cf ./target/package/${PROJECT.name}-deploy-2-${VERSION}.tar.gz -C ./deploy bin etc -C ../target lib`);
});


// Function to delete runtime journals
task(function deleteRuntimeJournals() {
  if ( DELETE_RUNTIME_JOURNALS ) {
    info('Runtime journals deleted.');
    emptyDir(JOURNAL_HOME);
  }
});


task(function deleteRuntimeLogs() {
  if ( DELETE_RUNTIME_LOGS ) {
    info('Runtime logs deleted.');
    emptyDir(LOG_HOME);
  }
});


task(function deployToHome() {
  copyDir('./deploy/bin', path.join(NANOPAY_HOME, 'bin'));
  copyDir('./deploy/etc', path.join(NANOPAY_HOME, 'etc'));
  copyDir('./target/lib', path.join(NANOPAY_HOME, 'lib'));
});


// Function to start Nanos
function startNanos(nanos_dir) {
  if ( RUN_JAR ) {
    var OPT_ARGS = ``;

    if ( RUN_USER ) OPT_ARGS += ` -U${RUN_USER}`;
    if ( WEB_PORT ) OPT_ARGS += ` -W${WEB_PORT}`;
    exec(`${NANOPAY_HOME}/bin/run.sh -Z${DAEMONIZE ? 1 : 0} -D${DEBUG ? 1 : 0} -S${DEBUG_SUSPEND ? 'y' : 'n'} -P${DEBUG_PORT} -N${NANOPAY_HOME} -C${CLUSTER} -H${HOST_NAME} -j${PROFILER ? 1 : 0} -J${PROFILER_PORT} -F${FS} -V$(VERSION) ${OPT_ARGS}`);
  } else {
    MESSAGE = `Starting NANOS ${INSTANCE}`;

    // process.chdir(PROJECT_HOME);

    JAVA_OPTS += ` -Dhostname=${HOST_NAME}`;

    if ( PROFILER ) {

    } else if ( DEBUG ) {
      JAVA_OPTS = `-agentlib:jdwp=transport=dt_socket,server=y,suspend=${DEBUG_SUSPEND ? 'y' : 'n'},address=*:${DEBUG_PORT} ${JAVA_OPTS}`
    }

    if ( WEB_PORT ) {
      JAVA_OPTS += ` -Dhttp.port=${WEB_PORT}`;
    }

    JAVA_OPTS += ` -Dnanos.webroot=${PWD}`;

    CLASSPATH = 'target/lib/*:build/classes/java/main';

    if ( TEST || BENCHMARK ) {

    }

    info('JAVA_OPTS:' + JAVA_OPTS);
    info(MESSAGE);

    if ( TEST || BENCHMARK ) {
      if ( TEST ) {
      } else if ( BENCHMARK ) {
      }
    } else if ( DAEMONIZE ) {
      /*
      nohup java -cp "$CLASSPATH" foam.nanos.boot.Boot &> /dev/null &
      echo $! > "$NANOS_PIDFILE"
      */
    } else {
      //             exec java -cp "$CLASSPATH" foam.nanos.boot.Boot

      // info('Environment'); console.log(process.env);
      // ??? What environmental variables does this use?
       exec(`java -cp "${CLASSPATH}" foam.nanos.boot.Boot`);
    }
  }

  console.log('Nanos started successfully');
}


task(function getNanopayGitHash() {
  var out;

  try {
    out = execSync('git describe --exact-match HEAD', {stdio: 'ignore'});
  } catch (x) {
    out = execSync('git rev-parse --short HEAD');
  }

  NANOPAY_REVISION = out.toString().trim();
});


task(function getFOAMGitHash() {
  FOAM_REVISION = execSync('cd foam3; git rev-parse --short HEAD').toString().trim();
});


task(function versions() {
  getNanopayGitHash();
  getFOAMGitHash();

  console.log(`Application Version: ${VERSION}`);
  console.log(`${PROJECT.name} revision:    ${NANOPAY_REVISION}`);
  console.log(`FOAM revision:       ${FOAM_REVISION}`);
});


task(function setupDirs() {
  ensureDir(`${PROJECT_HOME}/.foam`);
  ensureDir(NANOPAY_HOME);
  ensureDir('./target/lib2');
  ensureDir(`${NANOPAY_HOME}/lib`);
  ensureDir(`${NANOPAY_HOME}/bin`);
  ensureDir(`${NANOPAY_HOME}/etc`);
  ensureDir(LOG_HOME);
  ensureDir(JOURNAL_OUT);
  ensureDir(JOURNAL_HOME);
  ensureDir(DOCUMENT_HOME);
  ensureDir(DOCUMENT_OUT);
});


function buildEnv(m) {
  globalThis.ENV = m;

  Object.keys(m).forEach(k => {
    let val = m[k];
    Object.defineProperty(globalThis, k, {
      get: function()  { return typeof val === 'function' ? val() : val; },
      set: function(v) { val = v; }
    });
    globalThis[k] = val;
  });
}


function exec(s) {
  /** Export environment variables befor calling execSync. **/
  Object.keys(ENV).forEach(k => {
    var v = globalThis[k];
    exportEnv(k, v);
  });

  return execSync(s, { stdio: 'inherit' })
}


var
  PWD                       = process.cwd(),
  BENCHMARK                 = false,
  BUILD_ONLY                = false,
  CLEAN_BUILD               = false,
  CLUSTER                   = false,
  DAEMONIZE                 = false,
  DEBUG_PORT                = 8000,
  DEBUG_SUSPEND             = false,
  DEBUG                     = false,
  DELETE_RUNTIME_JOURNALS   = false,
  DELETE_RUNTIME_LOGS       = false,
  DISABLE_LIVESCRIPTBUNDLER = false,
  EXPLICIT_JOURNALS         = '',
  FS                        = 'rw',
  GEN_JAVA                  = true,
  HOST_NAME                 = 'localhost',
  INSTANCE                  = 'localhost',
  IS_MAC                    = process.platform === 'darwin',
  IS_LINUX                  = process.platform === 'linux',
  JOURNAL_CONFIG            = '',
  MODE                      = '',
  PACKAGE                   = false,
  POM                       = 'pom',
  PROFILER                  = false,
  PROFILER_PORT             = 8849,
  RESOURCES                 = '',
  RESTART_ONLY              = false,
  RESTART                   = false,
  RUN_JAR                   = false,
  RUN_USER                  = '',
  STOP_ONLY                 = false,
  TEST                      = false,
  WEB_PORT                  = null,
  FOAM_REVISION,
  NANOPAY_REVISION
;

// Environment Variables which are exported when updated
buildEnv({
  NANOPAY_ROOT:      () => ( TEST || BENCHMARK ) ? '/tmp' : '/opt',
  NANOPAY_HOME:      () => NANOPAY_ROOT + ( ( INSTANCE !== 'localhost' ) ? `/${PROJECT.name}_` + INSTANCE : `/${PROJECT.name}`),
  DOCUMENT_HOME:     () => `${NANOPAY_HOME}/documents`,
  DOCUMENT_OUT:      () => `${NANOPAY_HOME}/target/documents`,
  JAVA_OPTS:         '',
  JAVA_TOOL_OPTIONS: () => JAVA_OPTS,
  JOURNAL_HOME:      () => `${NANOPAY_HOME}/journals`,
  JOURNAL_OUT:       () => `${PROJECT_HOME}/target/journals`,
  LOG_HOME:          () => `${NANOPAY_HOME}/logs`,
  NANOS_PIDFILE:     '/tmp/nanos.pid',
  PROJECT_HOME:      process.cwd()
});


function setenv() {
  if ( TEST || BENCHMARK ) {
    rmdir(NANOPAY_HOME)
  }

  setupDirs();

  /*
  if [[ ! -w $NANOPAY_HOME && $TEST -ne 1 && $BENCHMARK -ne 1 ]]; then
      error "$NANOPAY_HOME is not writable! Please run 'sudo chown -R $USER /opt' first."
      quit 1
  fi

  PID_FILE="nanos.pid"
  if [[ ! -z "$INSTANCE" ]]; then
      PID_FILE="nanos_${INSTANCE}.pid"
  fi
  export NANOS_PIDFILE="/tmp/${PID_FILE}"

  */
  JAVA_OPTS += ` -DNANOPAY_HOME=${NANOPAY_HOME}`;
  JAVA_OPTS += ` -DJOURNAL_HOME=${JOURNAL_HOME}`;
  JAVA_OPTS += ` -DDOCUMENT_HOME=${DOCUMENT_HOME}`;

  /*
  if [[ -z $JAVA_HOME ]]; then
    if [[ $IS_MAC -eq 1 ]]; then
      warning "Java home isn't properly configured!"
    elif [[ $IS_LINUX -eq 1 ]]; then
      JAVA_HOME=$(dirname $(dirname $(readlink -f $(which javac))))
    fi
  fi

  if [ "$MODE" == "TEST" ] || [ "$MODE" == "BENCHMARK" ]; then
      JAVA_OPTS="-enableassertions ${JAVA_OPTS}"
  fi
  */
}


const ARGS = {
  b: [ 'run all benchmarks.',
    () => MODE = 'BENCHMARK' ],
  B: [ 'benchmarkId1,benchmarkId2,... : Run listed benchmarks.',
    args => { ARGS.b(); BENCHMARKS = args; } ],
  c: [ 'Clean generated code before building.  Required if generated classes have been removed.',
    () => CLEAN_BUILD = true ],
  C: [ '<true | false> Enable Medusa clustering.',
    args => CLUSTER = args ],
  d: [ 'Run with JDPA debugging enabled on port 8000',
    () => DEBUG = true ],
  D: [ 'PORT : JDPA debugging enabled on port PORT.',
    args => { ARGS.d(); DEBUG_PORT = args; } ],
  e: [ 'Skipping genJava task.',
    () => {
      warning('Skipping genJava task');
      GEN_JAVA = false;
    } ],
  E: [ 'EXPLICIT_JOURNALS :',
    args => EXPLICIT_JOURNALS = '-E' + args ],
  F: [ '<rw | ro> : File System Read-Write (default) or Read-Only',
    args => FS = args ],
  g: [ 'Output running/notrunning status of daemonized nanos.',
    () => { statusNanos(); quit(0); } ],
  h: [ 'Print usage information.',
    () => {
      console.log('Usage: build.js [OPTIONS]\n\nOptions are:');
      Object.keys(ARGS).forEach(a => {
        console.log('  -' + a + ': ' + ARGS[a][0]);
      });
      tasks.sort();
      console.log('\nTasks:', tasks.join(', '));
      quit(0);
    } ],
  i: [ 'Install npm and git hooks',
    () => { install(); quit(0); } ],
  j: [ 'Delete runtime journals, build, and run app as usual.',
    () => DELETE_RUNTIME_JOURNALS = true ],
  J: [ 'JOURNAL_CONFIG : additional journal configuration. See find.sh - deployment/CONFIG i.e. deployment/staging',
    args => {
//      POM = POM ? POM + ',' args : args;
      JOURNAL_CONFIG = args;
      // TODO: handle GRADLE_CONFIG elsewhere
    } ],
  k: [ 'Package up a deployment tarball.',
    () => { BUILD_ONLY = PACKAGE = true; } ],
  l: [ 'Delete runtime logs.',
    () => DELETE_RUNTIME_LOGS = true ],
  m: [ "Enable Medusa clustering. Not required for 'nodes'. Same as -Ctrue",
    () => CLUSTER = true ],
  N: [ `NAME : start another instance with given instance name. Deployed to /opt/${PROJECT.name}_NAME.`,
    args => { INSTANCE = HOST_NAME = args; NANOS_PIDFILE=`/tmp/nanos_${INSTANCE}.pid`; info('INSTANCE =', args); } ],
  o: [ "Build only - don't start nanos.",
    () => BUILD_ONLY = true ],
  p: [ 'Enable profiling on default port',
    () => PROFILER = true ],
  P: [ "pom file : name and path of the root pom file. Defaults to 'pom' at the root of the project.",
    args => { POM = args; info('POM=' + POM); } ],
  r: [ 'Start nanos with whatever was last built.',
    () => RESTART_ONLY = true ],
  R: [ 'deployment directories with resources to add to Jar file',
    args => { RESOURCES = args; } ],
  s: [ 'Stop a running daemonized nanos.',
    () => STOP_ONLY = true ],
  '$': [ 'When debugging, start suspended.', // renamed from 'S' in build.sh
    () => { DEBUG_SUSPEND = true; } ],
  t: [ 'Run All tests.',
    () => { TEST = true; MODE = 'test'; DELETE_RUNTIME_JOURNALS = true; } ],
  T: [ 'testId1,testId2,... : Run listed tests.',
    args => {
      TEST  = true;
      TESTS = args;
      DELETE_RUNTIME_JOURNALS = true;
    } ],
  u: [ 'Run from jar. Intented for Production deployments.',
    () => RUN_JAR = true ],
  U: [ 'User to run as',
    args => RUN_USER = args ],
  v: [ 'java compile only, no code generation.',
    () => {
      versions();
      quit(0);
    } ],
  V: [ 'VERSION : Updates the project version in POM file to the given version in major.minor.path.hotfix format',
    args => {
      VERSION = args;
      info('VERSION=' + VERSION);
    } ],
  w: [ 'Disable liveScriptBundler service. (development only)',
    () => DISABLE_LIVESCRIPTBUNDLER = true ],
  W: [ 'PORT : HTTP Port. NOTE: WebSocketServer will use PORT+1',
    args => { WEB_PORT = args; info('WEB_PORT=' + WEB_PORT); } ],
  x: [ 'Check dependencies for known vulnerabilities.',
    () => {
      info('Checking dependencies for vulnerabilities...');
      execSync('gradle dependencyCheckAnalyze --info');
      // mvn dependency:analyze-only
      quit(0);
    } ],
  X: [ 'Execute a list of tasks.',
    args => {
      args.split(',').forEach(t => {
        var f = globalThis[t];
        if ( f ) {
          f();
        } else {
          console.log('Unknown Command:', t);
        }
      });
      quit(0);
    } ],
  z: [ 'Daemonize into the background, will write PID into $PIDFILE environment variable.',
    () => DAEMONIZE = true ],
  '?': [ 'Usage',
    () => ARGS.h() ]
};


function statusNanos() {
  if ( ! fs.existsSync(NANOS_PIDFILE) ) {
    info('NANOS not running.');
  } else if ( execSync(`kill -9 $(cat "${NANOS_PIDFILE}") &>/dev/null`) ) {
    info('NANOS running.');
  } else {
    rmfile(NANOS_PIDFILE);
    error('Stale PID file.');
  }
}


function stopNanos() {
  console.log('Stopping Nanos server...');
  try {
    execSync('killall -SIGTERM nanos', { stdio: 'ignore' });
    console.log('Nanos server stopped successfully.');
  } catch (error) {
    // console.error('Error occurred while stopping Nanos server:', error);
  }

  deleteRuntimeJournals();
  deleteRuntimeLogs();
}



// ############################
// # Build steps
// ############################

task(function all() {
  processArgs();
  setenv();

  stopNanos();

  if ( STOP_ONLY ) quit(0);

  if ( CLEAN_BUILD && ! RESTART_ONLY ) {
    clean();
  }

  setupDirs();

  if ( DISABLE_LIVESCRIPTBUNDLER || PACKAGE ) {
    packageFOAM();
  }

  if ( ! RESTART_ONLY ) {
    buildJava();
    deployDocuments();
    deployJournals();

    if ( RUN_JAR ) {
      buildJar();
    }
    // ???: Why is this?
    if ( RUN_JAR || TEST || BENCHMARK ) {
      deployToHome();
    }
  }

  if ( PACKAGE ) {
    buildTar();
  }

  if ( ! BUILD_ONLY ) {
    showSummary();
    startNanos();
  }
});

all();

quit(0);

// IS_AWS no longer used
// a note on 'c' clean on the current build.
// if you issue 'c', and compilation fails, you need clean again to get a succesful deployment.
