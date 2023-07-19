/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

const path_ = require('path');

exports.visitPOM = function(pom) {
  console.log('[Maven Builder] VISIT POM', pom.location);
  pom.pom.javaDependencies && pom.pom.javaDependencies.forEach(d => X.javaDependencies.push([d, pom.path]));
}

exports.end = function() {
  console.log('[Maven Builder] END');

  // Build Maven file
  //  ensureDir(X.libdir);
  var pom = foam.poms[0].pom;

  var versions     = {};
  var conflicts    = [];
  var dependencies = X.javaDependencies.map(d => {
    var [id, ...excludes] = d[0].split(' ');
    var [groupId, artifactId, version] = id.split(':');

    // Detect libs version conflict
    var lib = groupId + ':' + artifactId;
    versions[lib] = [...(versions[lib] || []), { id, loc: d[1] }];
    // mark as conflicted if a different version found
    if ( versions[lib].length == 2 && versions[lib][0].id === id ) versions[lib].pop();
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
    console.log('[Maven Builder] Detected libs version conflict:');
    var info = '';
    conflicts.forEach(c => {
      info += '\t' + c + '\n' +
        versions[c].map(d => '\t\t' + d['id'] + ' at ' + d['loc']).join('\n') + '\n';
    });
    console.log(info);
    throw new Error('Abort [Maven Builder] due to library versions conflict detected.');
  }

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

    <dependencies>${dependencies}</dependencies>
  </project>\n`.replaceAll(/^  /gm, '');

  if ( writeFileIfUpdated('pom.xml', pomxml) ) {
    console.log('[Maven Builder] Updating pom.xml with', X.javaDependencies.length, 'dependencies.');
    execSync(`mvn dependency:copy-dependencies -DoutputDirectory=${path_.join(process.cwd(), X.builddir + '/lib')}`, { stdio: 'inherit' });
  } else {
    console.log('[Maven Builder] Not Updating pom.xml. No changes to', X.javaDependencies.length, 'dependencies.');
  }
}
