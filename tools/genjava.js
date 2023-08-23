/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// FOAM Java related build tool. Builds:
//     - generates .java files from .js models
//     - copies .jrl files into /target/journals
//     - TODO: copy .flow files into /target/documents
//     - create /target/javacfiles file containing list of modified or static .java files
//     - build pom.xml from accumulated javaDependencies
//     - call maven to update dependencies if pom.xml updated
//     - call javac to compile files in javacfiles
//     - create a Maven pom.xml file with accumulated POM javaDependencies information

console.log('[GENJAVA] Starting');

const startTime = Date.now();

const fs_   = require('fs');
const exec_ = require('child_process');
const path_ = require('path');

require('../src/foam_node.js');

var [argv, X, flags] = require('./processArgs.js')(
  '',
  {
    d:             './build/classes/java/main', // TODO: build/classes should be sufficient, but doesn't work with rest of build
    builddir:      './target',
    javacParams:   '--release 11',
    repo:          'http://repo.maven.apache.org/maven2/', // should be https?
    outdir:        '', // default value set below
    pom:           'pom'
  },
  {
    buildlib:      false, // generate Maven pom.xml
    checklib:      false, // generate Maven pom.xml for checking dependencies vulnerabilities
    buildjournals: false, // generate journal.0 files
    genjava:       true,  // generate .java source from model files
    javac:         false, // compile generated and static .java files
    verbose:       false  // print extra status information
  }
);

X.outdir           = path_.resolve(path_.normalize(X.outdir || (X.builddir + '/src/java')));
X.javaFiles        = [];
X.journalFiles     = [];
X.journalOutput    = {};
X.javaDependencies = [];

X.pom.split(',').forEach(pom => foam.require(pom, false, true));

X.journaldir = X.builddir + '/journals/';
X.libdir     = X.builddir + '/lib';

// If genjava is disabled, then override foam.loadFiles so that the POM
// structure is loaded but .js files aren't.
if ( ! flags.genjava ) {
  foam.loadFiles = function() {};
}


// Promote all UNUSED Models to USED
// 2 passes in case interfaces generated new classes in 1st pass
for ( var i = 0 ; i < 2 ; i++ )
  for ( var key in foam.UNUSED )
    try { foam.maybeLookup(key); } catch(x) { }

var mCount = 0, jCount = 0;
// Build Java Classes
for ( var key in foam.USED ) try {
  mCount++;
  if ( foam.maybeLookup(key).model_.targetJava(X) ) {
    jCount++;
  }
} catch(x) {}

console.log(`END GENJAVA: ${jCount}/${mCount} models processed, ${X.javaFiles.length} Java files created in ${Math.round((Date.now()-startTime)/1000)}s.`);

// console.log(X.javaFiles);
// console.log(foam.poms);


var found = 0;


function writeFileIfUpdated(file, txt) {
  if ( fs_.existsSync(file) && ( fs_.readFileSync(file).toString() === txt ) )
    return false;

  fs_.writeFileSync(file, txt);
  return true;
}


function execSync(cmd, options) {
  console.log('\x1b[0;32mExec: ' + cmd + '\x1b[0;0m');
  return exec_.execSync(cmd, options);
}


function verbose() {
  if ( flags.verbose ) console.log.apply(console, arguments);
}


function isExcluded(pom, f) {
  var ex = pom.excludes;
  if ( ! ex ) return false;
  for ( var i = 0 ; i < ex.length ; i++ ) {
    var p = ex[i];
    if ( p.endsWith('*') ) p = p.substring(0, p.length-1);

    if (
      f.endsWith(p) ||
      ( f.endsWith('.js') && f.substring(0, f.length-3).endsWith(p) ) )
    {
      return true;
    }
  }

  return false;
}


function processDir(pom, location, skipIfHasPOM) {
  verbose('\tdirectory:', location);
  var files = fs_.readdirSync(location, {withFileTypes: true});

  if ( skipIfHasPOM && files.find(f => f.name.endsWith('pom.js')) ) return;

  files.forEach(f => {
    var fn = location + '/' + f.name;
    if ( f.isDirectory() && ! f.name.startsWith('.') ) {
      // Prevent conflict with new build
      if ( f.name.endsWith('build2') ) return;

      if ( f.name.indexOf('android') != -1 ) return;
      if ( f.name.indexOf('examples') != -1 ) return;
      if ( ! isExcluded(pom, fn) ) processDir(pom, fn, true);
    } else if ( f.name.endsWith('.java') ) {
      if ( ! isExcluded(pom, fn) ) {
        verbose('\t\tjava source:', fn);
        found++;
        X.javaFiles.push(fn);
      }
    } else if ( f.name.endsWith('.jrl') ) {
      verbose('\t\tjournal source:', fn);
      addJournal(fn);
    }
  });
}

function loadLibs(pom) {
  pom.javaDependencies && pom.javaDependencies.forEach(d => X.javaDependencies.push([d, pom.path]));
}


// TODO: move to common library
function ensureDir(dir) {
  if ( ! fs_.existsSync(dir) ) {
    console.log('Creating directory', dir);
    fs_.mkdirSync(dir, {recursive: true});
  }
}


function addJournal(fn) {
  X.journalFiles.push(fn);
  if ( ! flags.buildjournals ) return;
  var i           = fn.lastIndexOf('/');
  var journalName = fn.substring(i+1, fn.length-4);
  var file        = fs_.readFileSync(fn).toString();

  if ( ! file.length ) return;

  file = `// The following ${(file || '').split('\n').length} lines were copied from "${path_.relative(process.cwd(), fn)}"\n` + file + '\n';
  X.journalOutput[journalName] = (X.journalOutput[journalName] || '') + file;
}


function outputJournals() {
  ensureDir(X.journaldir);

  if ( ! flags.buildjournals ) return;

  if ( fs_.existsSync(X.journaldir) ) {
    fs_.readdirSync(X.journaldir).forEach(f => fs_.rmSync(`${X.journaldir}/${f}`));
  } else {
    fs_.mkdirSync(X.journaldir, {recursive: true});
  }

  Object.keys(X.journalOutput).forEach(f => {
    fs_.writeFileSync(X.journaldir + f + '.0', X.journalOutput[f]);
  });

  // Write to journal_files is not needed, just for backward compatibility with find.sh
  fs_.writeFileSync(X.builddir + '/journal_files', X.journalFiles.join('\n') + '\n');

  console.log(`[GENJAVA] Generating ${Object.keys(X.journalOutput).length} journal files from ${X.journalFiles.length} sources.`);
}


function buildLibs() {
  // Build Maven file
  //  ensureDir(X.libdir);
  var pom = foam.poms[0];

  var versions     = {};
  var conflicts    = [];
  var dependencies = X.javaDependencies.map(d => {
    var [id, ...excludes] = d[0].split(' ');
    var [groupId, artifactId, version] = id.split(':');

    // Detect libs version conflict
    var lib = groupId + ':' + artifactId;
    versions[lib] = [...(versions[lib] || []), { id, loc: d[1] }];
    // mark as conflicted if a different version found
    if ( versions[lib].length == 2 && versions[lib][0].id === id ) {
      versions[lib].pop();
      // dependency already added to pom.xml
      return;
    }
    if ( versions[lib].length == 2 ) conflicts.push(lib);

    // Dependency exclusions
    var exclusions = '';
    excludes.forEach(e => {
      if ( e.startsWith('-') ) {
        const [groupId, artifactId] = e.slice(1).split(':');
        exclusions += `
          <exclusion>
            <groupId>${groupId}</groupId>
            <artifactId>${artifactId || '*'}</artifactId>
          </exclusion>
        `;
      }
    });

    return `
      <!-- Source: ${d[1]} -->
      <dependency>
        <groupId>${groupId}</groupId>
        <artifactId>${artifactId}</artifactId>
        <version>${version}</version>
        <exclusions>${exclusions}</exclusions>
      </dependency>
    `;
  }).join('');

  // Print versions conflict info and abort
  if ( conflicts.length > 0 ) {
    console.log('[GENJAVA] Detected libs version conflict:');
    var info = '';
    conflicts.forEach(c => {
      info += '\t' + c + '\n' +
        versions[c].map(d => '\t\t' + d['id'] + ' at ' + d['loc']).join('\n') + '\n';
    });
    console.log(info);
    throw new Error('Abort GENJAVA due to library versions conflict detected.');
  }

  var buildPlugins = flags.checklib ?
    `<build>
      <plugins>
        <plugin>
          <groupId>org.owasp</groupId>
          <artifactId>dependency-check-maven</artifactId>
          <version>8.3.1</version>
          <configuration>
            <assemblyAnalyzerEnabled>false</assemblyAnalyzerEnabled>
          </configuration>
          <executions>
            <execution>
              <goals>
                <goal>check</goal>
              </goals>
            </execution>
          </executions>
        </plugin>
      </plugins>
    </build>` : '';

  var pomxml = `<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>${pom.vendorId || pom.name}</groupId>
    <artifactId>${pom.name}</artifactId>
    <version>${pom.version}</version>

    <properties>
      <maven.compiler.source>1.7</maven.compiler.source>
      <maven.compiler.target>1.7</maven.compiler.target>
    </properties>

    ${buildPlugins}

    <dependencies>${dependencies}</dependencies>
  </project>\n`.replaceAll(/^  /gm, '');

  if ( writeFileIfUpdated('pom.xml', pomxml) ) {
    console.log('[GENJAVA] Updating pom.xml with', X.javaDependencies.length, 'dependencies.');
    if ( flags.buildlib )
      execSync(`mvn dependency:copy-dependencies -DoutputDirectory=${path_.join(process.cwd(), X.builddir + '/lib')}`, { stdio: 'inherit' });
  } else {
    console.log('[GENJAVA] Not Updating pom.xml. No changes to', X.javaDependencies.length, 'dependencies.');
  }
}


function javac() {
  // Only overwrite javaFiles when genjava:true
  if ( flags.genjava )
    fs_.writeFileSync(X.builddir + '/javacfiles', X.javaFiles.join('\n') + '\n');

  if ( ! fs_.existsSync(X.d) ) fs_.mkdirSync(X.d, {recursive: true});

  var cmd = `javac -parameters ${X.javacParams} -d ${X.d} -classpath "${X.d}:${X.libdir}/*" @${X.builddir}/javacfiles`;

  console.log('[GENJAVA] Compiling', X.javaFiles.length ,'java files:', cmd);
  try {
    exec_.execSync(cmd, {stdio: 'inherit'});
  } catch(x) {
    process.exit(1);
  }
  /*
  , (error, stdout, stderr) => {
    console.log('[GENJAVA] Finished Compiling');
    console.log(stdout);
    console.log(stderr);
    if ( error ) {
      console.log(error);
      process.exit(1);
    }
  });
  */
}


function processPOMs() {
  var seen = {};
  function processPOM(pom) {
    if ( seen[pom.location] ) return;
    loadLibs(pom);
    seen[pom.location] = true;
    verbose('[GENJAVA] Scanning POM for java files:', pom.location);
    processDir(pom, pom.location || '/', false);
  }

  foam.poms.forEach(processPOM);
  console.log(`[GENJAVA] Found ${found} java files.`);
}

// generate Maven pom.xml for checking dependencies vulnerabilities, no need to
// download the jar files and compile
if ( flags.checklib ) {
  processPOMs();
  buildLibs();
  process.exit(0);
}

if ( flags.javac || flags.buildlib || flags.buildjournals ) processPOMs();
if ( flags.buildlib )                                       buildLibs();
if ( flags.javac )                                          javac();
if ( flags.buildjournals )                                  outputJournals();
