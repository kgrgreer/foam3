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
//     - create /target/javacfiles file containing list of modified or static .java files
//     - build pom.xml from accumulated javaDependencies
//     - call maven to update dependencies if pom.xml updated
//     - call javac to compile files in javacfiles
//     - create a Maven pom.xml file with accumulated POM javaDependencies information
//
// Directory Structure:
//   /deployments
//     /u           - default deployment if not JOURNAL_CONFIG not specified with -J
//     /resources   - deployment speicific resources
//   /build
//     /src         - java source files created by genJava
//     /classes     - compiled java class files created with javac (called by genJava)
//   /target
//     /MANIFEST.MF - JAR manifest file, used when creating project .jar file with jar
//     /classes
//       /documents
//       /images
//       /journals
//     /documents    - All .flow documents are copied here by genJava
//     /journals     - All journal.0 files created by genJava
//     /package      - Designation for .tar.gz files
//     /javacfiles   - A list of all java files to be compiled by javac, created by genJava
//     /lib          - 3rd party java .jar library files created by gradle (or maven)
//     /webroot      - jetty resource base directory for jar build
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
//  6. remove PID / DAEMON support (no longer true???)
//  7. -XcleanLib will cause pom.xml to be regenerated and maven to be rerun
//
// TODO:
//   - should Makers be responsible for building target directories?
//   - merge build and target
//   - explicitly list dependencies and descriptions with tasks
//   - only add deployments/u when -u specified
//
// diskutil erasevolume HFS+ RAM_Disk $(hdiutil attach -nomount ram://1000000)
// ln -s /Volumes/RAM_DISK /path/to/project/build2

/*
diskutil erasevolume HFS+ 'RAMDisk' `hdiutil attach -nomount ram://848000`
mkdir /Volumes/RamDisk/build
rm -rf ~/NANOPAY/build
ln -s /Volumes/RamDisk/build ~/NANOPAY/build
*/

const fs                = require('fs');
const { join }          = require('path');
const { copyDir, copyFile, emptyDir, ensureDir, execSync, rmdir, rmfile, spawn } = require('./buildlib');


// Build configs
var
  PWD                       = process.cwd(),
  BENCHMARK                 = false,
  BENCHMARKS                = '',
  BUILD_ONLY                = false,
  CLEAN_BUILD               = false,
  CLUSTER                   = false,
  DAEMONIZE                 = false,
  DEBUG_PORT                = 8000,
  DEBUG_SUSPEND             = false,
  DEBUG                     = false,
  DELETE_RUNTIME_JOURNALS   = false,
  DELETE_RUNTIME_LOGS       = false,
  EXPLICIT_JOURNALS         = '',
  FS                        = 'rw',
  GEN_JAVA                  = true,
  HOST_NAME                 = 'localhost',
  INSTANCE                  = 'localhost',
//  IS_MAC                    = process.platform === 'darwin',
//  IS_LINUX                  = process.platform === 'linux',
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
  TESTS                     = '',
  WEB_PORT                  = null,
  VULNERABILITY_CHECK       = false,
  VULNERABILITY_CHECK_SCORE = 9, // CVSS score (LOW:0..5 , MEDIUM:5..7 , HIGH:7..9 , CRITICAL:9..10, IGNORE:11) to fail the build
  FOAM_REVISION,
  PROJECT_REVISION
;

// Top-Level Loaded POM Object, not be be confused with POM, which is the name of POM(s) to be loaded
var PROJECT;

// Short-form of PROJECT.version
var VERSION;

// Root POM tasks and exports
var TASKS, EXPORTS;

// These are different for an unknown historic reason and should be merged.
var BUILD_DIR  = './build2', TARGET_DIR = './build2';
// var BUILD_DIR  = './build', TARGET_DIR = './target';

globalThis.foam = {
  POM: function (pom) {
    // console.log('POM:', pom);
    PROJECT = pom;
    VERSION = pom.version;
    TASKS   = pom.tasks;
  }
};

require(PWD + '/pom.js');

process.on('unhandledRejection', e => {
  console.error("ERROR: Unhandled promise rejection ", e);
  process.exit(1);
});


var summary = [];
var depth   = 1;
var tasks   = [];
var running = {};


function task(desc, dep, f) {
  if ( arguments.length == 1 ) {
    f    = desc;
    desc = '';
    dep  = [];
  }

  if ( ! tasks[f.name] )
    tasks[f.name] = [desc, dep];

  var fired = false;
  var rec   = [ ];

  var SUPER = globalThis[f.name] || function() { };
  globalThis[f.name] = function() {
    if ( fired ) return;
    fired = true;

    running[f.name] = (running[f.name] || 0) + 1;
    if ( running[f.name] === 1 ) {
      summary.push(rec);
      info(`Starting Task :: ${f.name}`);
      var start = Date.now();
      rec[0] = ''.padEnd(2*depth) + f.name;
      rec[2] = start;
      depth++;
    }

    f.bind(Object.assign({ SUPER }, EXPORTS))();

    running[f.name] -= 1;
    if ( running[f.name] === 0 ) {
      depth--;
      var end = Date.now();
      var dur = ((end-start)/1000).toFixed(1);
      info(`Finished Task :: ${f.name} in ${dur} seconds`);
      rec[1] = dur;
    }
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
  var jars = execSync(`find ${TARGET_DIR}/lib -type f -name "*.jar"`).toString()
      .replaceAll(`${TARGET_DIR}/lib/`, '  ').trim();
  var m = `
Manifest-Version: 1.0
Main-Class: foam.nanos.boot.Boot
Class-Path: ${jars}
Implementation-Title: ${PROJECT.name}
Implementation-Version: ${VERSION}
Specification-Version: ${PROJECT_REVISION}
Implementation-Timestamp: ${new Date()}
${PROJECT.name}-Revision: ${PROJECT_REVISION}
FOAM-Revision: ${FOAM_REVISION}
Implementation-Vendor: ${PROJECT.name}
`.trim() + '\n';

  if ( PROJECT.vendorId ) {
    m += `Implementation-Vendor-Id: ${PROJECT.vendorId || PROJECT.name}\n`;
  }

  return m;
};


task('Build web root directory for inclusion in JAR.', [], function jarWebroot() {
  JAR_INCLUDES += ` -C ${TARGET_DIR} webroot `;

  var webroot = TARGET_DIR + '/webroot';
  ensureDir(webroot);
  copyDir('./foam3/webroot', webroot);

  ensureDir(webroot + '/favicon');
  copyDir('./foam3/favicon', webroot + '/favicon');

  var foambin = `foam-bin-${VERSION}.js`;
  copyFile('./' + foambin, webroot + '/' + foambin);
});


task('Copy images from src sub directories to TARGET_DIR/images.', [], function jarImages() {
  JAR_INCLUDES += ` -C ${TARGET_DIR} images `;

  var images = TARGET_DIR + '/images';
  ensureDir(images);
  copyDir('./foam3/src/foam/u2/images',      images);
  copyDir('./foam3/src/foam/nanos/images',   images);
  copyDir('./foam3/src/foam/support/images', images);
});


task('Display generated JAR manifest file.', [], function showManifest() {
  console.log('Manifest:', manifest());
});


task('Show POM structure.', [], function showPOMStructure() {
  execSync(`node foam3/tools/pmake.js -flags=web,java -makers="Verbose" -pom=${POM}`, {stdio: 'inherit'});
});


task('Install npm and git hooks.', [], function install() {
  process.chdir(PROJECT_HOME);

  execSync('npm install');
  process.chdir('foam3');
  execSync('npm install');
  process.chdir('..');

//   if ( IS_MAC ) {
    ensureDir(join(APP_HOME, 'journals'));
    ensureDir(join(APP_HOME, 'logs'));
//  }

  // git hooks
  execSync('git config core.hooksPath .githooks');
  execSync('git config submodule.recurse true');

  // install pkcs12
//  if ( IS_MAC ) {
    exec('./tools/cert/copy-pkcs12.sh');
//  }
});


task('Deploy documents from DOCUMENT_OUT to DOCUMENT_HOME.', [], function deployDocuments() {
  console.log('DOCUMENT_OUT: ', DOCUMENT_OUT);
  console.log('DOCUMENT_HOME:', DOCUMENT_HOME);

  copyDir(DOCUMENT_OUT, DOCUMENT_HOME);
});


task('Deploy journal files from JOURNAL_OUT to JOURNAL_HOME.', [], function deployJournals() {
  console.log('JOURNAL_OUT: ', JOURNAL_OUT);
  console.log('JOURNAL_HOME:', JOURNAL_HOME);

  copyDir(JOURNAL_OUT, JOURNAL_HOME);
});


task('Deploy documents, journals and other resources.', [ 'deployDocuments', 'deployJournals', 'deployResources' ], function deploy() {
  deployDocuments();
  deployJournals();
  deployResources();
});


task('Copy additional files from RESOURCES directories to be added to Jar file.', [], function deployResources() {
  RESOURCES.split(',').forEach(res => {
    if ( ! res )
      return;

    var resDir = PROJECT_HOME + '/deployment/' + res + '/resources';
    if ( fs.existsSync(resDir) && fs.lstatSync(resDir).isDirectory() ) {
      copyDir(resDir, JOURNAL_HOME);
    }
  });
});


task('Cause regeneration of pom.xml and java lib directory.', [ 'genJava' ], function cleanLib() {
  rmfile('pom.xml');
  emptyDir(TARGET_DIR + '/lib');
  genJava();
});


task('Remove generated files.', [], function clean() {
  if ( RUN_JAR || TEST || BENCHMARK ) {
    emptyDir(`${APP_HOME}/bin`);
    emptyDir(`${APP_HOME}/lib`);
  }

  emptyDir(BUILD_DIR);
  emptyDir(TARGET_DIR + '/journals'); // Don't remove whole directory to avoid removing java libs under ./target/lib
  // TODO: convert to Node to make Windows compatible
  execSync('rm -f foam-bin*.js');
});


task('Copy Java libraries from TARGET_DIR/lib to APP_HOME/lib.', [], function copyLib() {
  copyDir(join(TARGET_DIR, 'lib'), join(APP_HOME, 'lib'));
});


task("Call pmake with JS Maker to build 'foam-bin.js'.", [], function genJS() {
//  execSync(`node foam3/tools/genjs.js -version="${VERSION}" -flags=xxxverbose -pom=${POM}`, { stdio: 'inherit' });
  execSync(`node foam3/tools/pmake.js -flags=web,-java -makers="JS" -pom=${POM}`, { stdio: 'inherit' });
});


task('Generate Java and JS packages.', [ 'genJava', 'genJS' ], function packageFOAM() {
  genJava();
  genJS();
});


task('Call pmake to generate & compile java, collect journals, call Maven and copy documents.', [], function genJava() {
//   commandLine 'bash', './gen.sh', "${project.genJavaDir}", "${project.findProperty("pom")?:"pom" }"
  var pom    = {};
  var addPom = k => { if ( k && ! pom[k] ) pom[k] = true };

  if ( POM )
    POM.split(',').forEach(c => addPom(c && `${PROJECT_HOME}/${c}`));

  if ( JOURNAL_CONFIG )
    JOURNAL_CONFIG.split(',').forEach(c => addPom(c && `${PROJECT_HOME}/deployment/${c}/pom`));

  pom = Object.keys(pom).join(',');

  var makers = VULNERABILITY_CHECK ? 'Maven' :
               GEN_JAVA ? 'Java,Maven,Javac,Journal' : 'Maven,Journal';
  execSync(`node foam3/tools/pmake.js -makers="${makers}" -flags=xxxverbose -d=${BUILD_DIR}/classes/java/main -builddir=${TARGET_DIR} -outdir=${BUILD_DIR}/src/java -javacParams='--release 11' -downloadLibs=${!VULNERABILITY_CHECK} -pom=${pom}`, { stdio: 'inherit' });
});

task('Check dependencies for known vulnerabilities.', ['genJava'], function checkDeps(score) {
  genJava();
  try {
    execSync(`mvn dependency-check:check -f ${BUILD_DIR} -DfailBuildOnCVSS=${score || VULNERABILITY_CHECK_SCORE}`, { stdio: 'inherit' });
  } catch (_) {
    // maven build error will be output to the console, no need to throw
  }
});

task('Generate and compile java source.', [ 'genJava', 'copyLib' ], function buildJava() {
  genJava();
  copyLib();
});


task('Build Java JAR file.', [ 'versions', 'jarWebroot', 'jarImages' ], function buildJar() {
  versions();
  jarWebroot();
  jarImages();

  rmfile(JAR_OUT);
  fs.writeFileSync(TARGET_DIR + '/MANIFEST.MF', manifest());
  execSync(`jar cfm ${JAR_OUT} ${TARGET_DIR}/MANIFEST.MF -C ${APP_HOME} journals -C ${APP_HOME} documents ${JAR_INCLUDES} -C ${BUILD_DIR}/classes/java/main .`);
});


task('Package files into a TAR archive', [], function buildTar() {
  // Notice that the argument to the second -C is relative to the directory from the first -C, since -C
  // switches the current directory.
  execSync(`tar -a -cf ${TARGET_DIR}/package/${PROJECT.name}-deploy-2-${VERSION}.tar.gz -C ./deploy bin etc -C ../ -C${TARGET_DIR} lib`);
});


task('Delete runtime journals.', [], function deleteRuntimeJournals() {
  if ( DELETE_RUNTIME_JOURNALS ) {
    info('Runtime journals deleted.');
    emptyDir(JOURNAL_HOME);
  }
});


task('Delete runtime logs.', [], function deleteRuntimeLogs() {
  if ( DELETE_RUNTIME_LOGS ) {
    info('Runtime logs deleted.');
    emptyDir(LOG_HOME);
  }
});


task('Copy required files to APP_HOME deployment directory.', [], function deployToHome() {
  copyDir('./foam3/tools/deploy/bin', join(APP_HOME, 'bin'));
  copyDir(TARGET_DIR + '/lib', join(APP_HOME, 'lib'));
});



task('Start NANOS application server.', [], function startNanos() {
  if ( RUN_JAR ) {
    var OPT_ARGS = ``;

    if ( RUN_USER ) OPT_ARGS += ` -U${RUN_USER}`;
    if ( WEB_PORT ) OPT_ARGS += ` -W${WEB_PORT}`;
    exec(`${APP_HOME}/bin/run.sh -Z${DAEMONIZE ? 1 : 0} -D${DEBUG ? 1 : 0} -S${DEBUG_SUSPEND ? 'y' : 'n'} -P${DEBUG_PORT} -n${PROJECT.name} -N${APP_HOME} -C${CLUSTER} -H${HOST_NAME} -j${PROFILER ? 1 : 0} -J${PROFILER_PORT} -F${FS} -V${VERSION} ${OPT_ARGS}`);
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

    JAVA_OPTS += ` -Dnanos.webroot=${PROJECT_HOME}`;

    CLASSPATH = `${TARGET_DIR}/lib/\*:${BUILD_DIR}/classes/java/main`;

    if ( TEST || BENCHMARK ) {
      JAVA_OPTS += ' -Dresource.journals.dir=journals';
      JAVA_OPTS += ' -DRES_JAR_HOME=' + JAR_OUT;

      if ( TEST ) {
        MESSAGE = 'Running tests...';
        JAVA_OPTS += ' -Dfoam.main=testRunnerScript';
        if ( TESTS ) JAVA_OPTS += ' -Dfoam.tests=' + TESTS;
      } else if ( BENCHMARK ) {
        MESSAGE = 'Running benchmarks...';
        JAVA_OPTS += ' -Dfoam.main=benchmarkRunnerScript';
        if ( BENCHMARKS ) JAVA_OPTS += ' -Dfoam.benchmarks=' + BENCHMARKS;
      }
    }

    info('JAVA_OPTS:' + JAVA_OPTS);
    info(MESSAGE);

    if ( TEST ) {
      try {
        exec(`java -jar ${JAR_OUT}`);
      } catch ( e ) {
        // Failing tests, no need to throw
      }
      process.exit(0);
    } else if ( BENCHMARK ) {
      exec(`java -jar ${JAR_OUT}`);
    } else if ( DAEMONIZE ) {
      var proc = spawn(`java -cp ${CLASSPATH} foam.nanos.boot.Boot`);
      writeToPidFile(proc.pid);
      console.log('Nanos started successfully');
    } else {
      //             exec java -cp "$CLASSPATH" foam.nanos.boot.Boot

      // info('Environment'); console.log(process.env);
      // ??? What environmental variables does this use?
       exec(`java -cp "${CLASSPATH}" foam.nanos.boot.Boot`);
    }
  }
});


task('Extract project git hash.', [], function getProjectGitHash() {
  var out = 'Unversioned';

  try {
    out = execSync('git describe --exact-match HEAD', {stdio: 'ignore'});
  } catch (x) {
    try {
      out = execSync('git rev-parse --short HEAD');
    } catch (_) {
      warning('Cannot determine project revision, no commit yet');
    }
  }

  PROJECT_REVISION = out.toString().trim();
});


task('Extract FOAM git hash.', [], function getFOAMGitHash() {
  FOAM_REVISION = execSync('git -C foam3 rev-parse --short HEAD').toString().trim();
});


task('Show version information.', [ 'getProjectGitHash', 'getFOAMGitHash'], function versions() {
  getProjectGitHash();
  getFOAMGitHash();

  console.log(`Application Version: ${VERSION}`);
  console.log(`${PROJECT.name} revision:    ${PROJECT_REVISION}`);
  console.log(`FOAM revision:       ${FOAM_REVISION}`);
});


task('Create empty build and deployment directory structures if required.', [], function setupDirs() {
  try {
    // ensureDir(`${PROJECT_HOME}/.foam`); // Only used by foamlink?
    ensureDir(APP_HOME);
    if ( ensureDir(TARGET_DIR + '/lib') ) {
      // Remove stale pom.xml if the /lib dir needed to be created
      // Wouldn't be necessary if pom.xml were written into the TARGET_DIR but then
      // you couldn't check it in to get dependbot warnings.
      rmfile('pom.xml');
    }
    ensureDir(`${APP_HOME}/lib`);
    ensureDir(`${APP_HOME}/bin`);
    ensureDir(`${APP_HOME}/etc`);
    ensureDir(LOG_HOME);
    ensureDir(JOURNAL_OUT);
    ensureDir(JOURNAL_HOME);
    ensureDir(DOCUMENT_HOME);
    ensureDir(DOCUMENT_OUT);
  } catch ( e ) {
    console.log(e);
    error(`Directory is not writable! Please run 'sudo chown -R $USER ${APP_ROOT}' first.`);
  }
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


function exportEnvs() {
  /** Export environment variables. **/
  Object.keys(ENV).forEach(k => {
    var v = globalThis[k];
    exportEnv(k, v);
  });
}


function exec(s) {
  exportEnvs();
  return execSync(s, { stdio: 'inherit' });
}


function writeToPidFile(pid) {
  fs.writeFileSync(NANOS_PIDFILE, pid.toString());
}


function readFromPidFile() {
  if ( fs.existsSync(NANOS_PIDFILE) )
    return fs.readFileSync(NANOS_PIDFILE).toString().trim();
}


// Environment Variables which are exported when updated
buildEnv({
  // App resources path
  APP_ROOT:          () => ( TEST || BENCHMARK ) ? '/tmp' : '/opt',
  APP_HOME:          () => APP_ROOT + ( ( INSTANCE !== 'localhost' ) ? `/${PROJECT.name}_` + INSTANCE : `/${PROJECT.name}`),
  JOURNAL_HOME:      () => `${APP_HOME}/journals`,
  DOCUMENT_HOME:     () => `${APP_HOME}/documents`,
  LOG_HOME:          () => `${APP_HOME}/logs`,
  JAR_OUT:           () => `${APP_HOME}/lib/${PROJECT.name}-${VERSION}.jar`,

  // Project resources path
  PROJECT_HOME:      PWD,
  JOURNAL_OUT:       () => `${PROJECT_HOME}/${TARGET_DIR}/journals`,
  DOCUMENT_OUT:      () => `${PROJECT_HOME}/${TARGET_DIR}/documents`,

  // Build options and pid
  JAVA_OPTS:         '',
  JAVA_TOOL_OPTIONS: () => JAVA_OPTS,
  JAR_INCLUDES:      '',
  NANOS_PIDFILE:     '/tmp/nanos.pid'
});


function setenv() {
  if ( TEST || BENCHMARK ) {
    rmdir(APP_HOME);
    JAVA_OPTS = '-enableassertions ' + JAVA_OPTS;
  }

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
  */
}


function usage() {
  console.log('Usage: build.js [OPTIONS]\n\nOptions are:');
  Object.keys(ARGS).forEach(a => {
    console.log('  -' + a + ': ' + ARGS[a][0]);
  });
  console.log('\nTasks:');

  var ts = { ...tasks };
  var depth = 1;
  function printTask(t) {
    if ( ! ts[t] ) return;
    delete ts[t];
    var [ desc, dep ] = tasks[t];
    var dep2 = dep.filter(d => ! ts[d]); // list of dependencies which appear elsewhere in tree
    var dstr = dep2.length ? ' [ ' + dep2.join(', ') + ' ]': '';
    console.log(''.padEnd(depth*2) + t.padEnd(27-depth*2) + desc + dstr);
    depth++;
    tasks[t][1].forEach(printTask);
    depth--;
  }
  Object.keys(ts).sort().forEach(t => {
    printTask(t);
  });
  quit(0);
}


const ARGS = {
  b: [ 'run all benchmarks.',
    () => { BENCHMARK = true; MODE = 'BENCHMARK'; DELETE_RUNTIME_JOURNALS = true; } ],
  B: [ 'benchmarkId1,benchmarkId2,... : Run listed benchmarks.',
    args => { ARGS.b[1](); BENCHMARKS = args; } ],
  c: [ 'Clean generated code before building.  Required if generated classes have been removed.',
    () => CLEAN_BUILD = true ],
  C: [ '<true | false> Enable Medusa clustering.',
    args => CLUSTER = args ],
  d: [ 'Run with JDPA debugging enabled on port 8000',
    () => DEBUG = true ],
  D: [ 'PORT : JDPA debugging enabled on port PORT.',
    args => { ARGS.d[1](); DEBUG_PORT = args; info('DEBUG_PORT=' + DEBUG_PORT); } ],
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
  h: [ 'Print usage information.', usage ],
  i: [ 'Install npm and git hooks',
    () => { install(); quit(0); } ],
  j: [ 'Delete runtime journals, build, and run app as usual.',
    () => DELETE_RUNTIME_JOURNALS = true ],
  J: [ 'JOURNAL_CONFIG : additional journal configuration. See find.sh - deployment/CONFIG i.e. deployment/staging',
    args => {
//      POM = POM ? POM + ',' args : args;
      JOURNAL_CONFIG += `,${args}` ;
    } ],
  k: [ 'Package up a deployment tarball.',
    () => { BUILD_ONLY = PACKAGE = true; } ],
  l: [ 'Delete runtime logs.',
    () => DELETE_RUNTIME_LOGS = true ],
  m: [ "Enable Medusa clustering. Not required for 'nodes'. Same as -Ctrue",
    () => CLUSTER = true ],
  N: [ `NAME : start another instance with given instance name. Deployed to /opt/${PROJECT.name}_NAME.`,
    args => { INSTANCE = HOST_NAME = args; NANOS_PIDFILE=`/tmp/nanos_${INSTANCE}.pid`; info('INSTANCE=' + args); } ],
  o: [ "Build only - don't start nanos.",
    () => BUILD_ONLY = true ],
  p: [ 'Enable profiling on default port',
    () => PROFILER = true ],
  P: [ "pom file : name and path of the root pom file. Defaults to 'pom' at the root of the project.",
    args => { POM = args; info('POM=' + POM); } ],
  r: [ 'Start nanos with whatever was last built.',
    () => RESTART_ONLY = true ],
  R: [ 'deployment directories with resources to add to Jar file',
    args => { RESOURCES += `${args}`; } ],
  s: [ 'Stop a running daemonized nanos.',
    () => STOP_ONLY = true ],
  '$': [ 'When debugging, start suspended.', // renamed from 'S' in build.sh
    () => { DEBUG_SUSPEND = true; } ],
  t: [ 'Run All tests.',
    () => {
      TEST = true;
      MODE = 'test';
      DELETE_RUNTIME_JOURNALS = true;
      JOURNAL_CONFIG += ',test';
    } ],
  T: [ 'testId1,testId2,... : Run listed tests.',
    args => {
      ARGS.t[1]();
      TESTS = args;
    } ],
  u: [ 'Run from jar. Intented for Production deployments.',
    () => {
      RUN_JAR = true;
      JOURNAL_CONFIG += ',u';
      RESOURCES      += ',u';
    } ],
  U: [ 'User to run as',
    args => RUN_USER = args ],
  v: [ 'show versions.',
    () => {
      versions();
      quit(0);
    } ],
  V: [ 'VERSION : Updates the project version in POM file to the given version in major.minor.path.hotfix format',
    args => {
      VERSION = args;
      info('VERSION=' + VERSION);
    } ],
  W: [ 'PORT : HTTP Port. NOTE: WebSocketServer will use PORT+1',
    args => { WEB_PORT = args; info('WEB_PORT=' + WEB_PORT); } ],
  x: [ 'Check dependencies for known vulnerabilities.',
    args => {
      VULNERABILITY_CHECK = true;
      checkDeps(args);
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
    () => ARGS.h[1]() ]
};


function statusNanos() {
  var pid = readFromPidFile();
  if ( ! pid ) {
    info('NANOS not running.');
  } else {
    try {
      execSync(`kill -0 ${pid} &>/dev/null`);
      info('NANOS running.');
    } catch (e) {
      rmfile(NANOS_PIDFILE);
      error('Stale PID file.');
    }
  }
}


task('Stop running NANOS server.', [ 'deleteRuntimeJournals', 'deleteRuntimeLogs' ], function stopNanos() {
  console.log('Stopping Nanos server...');

  var pid = readFromPidFile();
  try {
    if ( pid ) {
      execSync(`kill -9 ${pid} &>/dev/null`);
      rmfile(NANOS_PIDFILE);
    } else {
      execSync('killall -SIGTERM nanos', { stdio: 'ignore' });
    }
    console.log('Nanos server stopped successfully.');
  } catch (e) {
    if ( STOP_ONLY ) {
      console.log(e);
      error('Error occurred while stopping Nanos server.');
    }
  }

  deleteRuntimeJournals();
  deleteRuntimeLogs();
});


// ############################
// # Build steps
// ############################

task(
'Build everything specified by flags.',
[ 'clean', 'setupDirs', 'packageFOAM', 'buildJava', 'deploy', 'buildJar', 'deployToHome', 'buildTar', 'startNanos' ],
function all() {
  processArgs();
  setenv();

  stopNanos();

  if ( STOP_ONLY ) quit(0);

  if ( CLEAN_BUILD && ! RESTART_ONLY ) {
    clean();
  }

  setupDirs();

  if ( ! RESTART_ONLY ) {
    if ( PACKAGE || RUN_JAR || TEST || BENCHMARK ) {
      packageFOAM();
    }

    buildJava();
    deploy();

    // ???: Why is this?
    if ( RUN_JAR || TEST || BENCHMARK ) {
      buildJar();
      deployToHome();
    }

    if ( PACKAGE ) {
      buildTar();
    }
  }

  if ( ! BUILD_ONLY ) {
    showSummary();
    startNanos();
  }
});

// Install POM tasks
if ( TASKS ) {
  TASKS.forEach(f => task(f));

  // Exports local variables and functions for POM tasks
  EXPORTS = {
    JOURNAL_CONFIG,
    TARGET_DIR,
    copyDir,
    copyFile
  }
};

all();

quit(0);

// IS_AWS, IS_MAC, IS_LINUX are no longer used
// a note on 'c' clean on the current build.
// if you issue 'c', and compilation fails, you need clean again to get a succesful deployment.
