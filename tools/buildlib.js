/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// Common library functions for use with build.js and pmake.js

const fs_   = require('fs');
const exec_ = require('child_process');
const path_ = require('path');


function adaptOrCreateArgs(X, args) {
  /**
    If listed arguments from are found in X, then adapt their value
    to appropriate type if an adapter based on their class: is available.
    Otherwise, create a binding in X if argument has a factory: or value:.
  **/
  const adapt = {
    'Boolean': function (v) {
      if ( typeof v === 'boolean' ) return v;

      if ( ! v ) return false;

      var s = v.toString().trim().toLowerCase();
      return s === 'true' || s === 't' || s === '1' || s === 'yes' || s === 'y' || s === 'on';
    }
  };

  args.forEach(a => {
    if ( X.hasOwnProperty(a.name) ) {
      if ( a.class && adapt[a.class] ) {
        X[a.name] = adapt[a.class](X[a.name]);
      }
    } else if ( a.factory ) {
      X[a.name] = a.factory();
    } else if ( a.value ) {
      X[a.name] = a.value;
    }
  });
}


function ensureDir(dir) {
  if ( ! fs_.existsSync(dir) ) {
    console.log('Creating directory', dir);
    fs_.mkdirSync(dir, {recursive: true});
    return true;
  }
  return false;
}


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


function isExcluded(pom, f) {
  var ex = pom.excludes;
  if ( ! ex ) return false;
  for ( var i = 0 ; i < ex.length ; i++ ) {
    var p = ex[i];
    if ( p.endsWith('*') ) p = p.substring(0, p.length-1);

    if ( f.endsWith(p) || ( f.endsWith('.js') && f.substring(0, f.length-3).endsWith(p) ) )
      return true;
  }

  return false;
}


function copyDir(src, dst) {
  /** Recursively copy a directory. **/
  ensureDir(dst);
  fs_.readdirSync(src).forEach(f => {
    var srcPath = path_.join(src, f);
    var dstPath = path_.join(dst, f);

    if ( fs_.lstatSync(srcPath).isDirectory() )
      copyDir(srcPath, dstPath);
    else
      copyFile(srcPath, dstPath);
  });
}


function emptyDir(dir) {
  rmdir(dir);
  ensureDir(dir);
}


function rmdir(dir) {
  if ( fs_.existsSync(dir) && fs_.lstatSync(dir).isDirectory() ) {
    fs_.rmdirSync(dir, {recursive: true, force: true});
  }
}


function rmfile(file) {
  if ( fs_.existsSync(file) && fs_.lstatSync(file).isFile() ) {
    fs_.rmSync(file, {force: true});
  }
}


function copyFile(src, dst) {
  fs_.copyFileSync(src, dst);
}


function spawn(s) {
  exportEnvs();

  console.log('Spawn: ', s);
  var [cmd, ...args] = s.split(' ');
  return exec_.spawn(cmd, args, { stdio: 'ignore' });
}


function comma(list, value) {
  return list ? list + ',' + value : value;
}


exports.comma              = comma;
exports.copyDir            = copyDir;
exports.copyFile           = copyFile;
exports.emptyDir           = emptyDir;
exports.ensureDir          = ensureDir;
exports.execSync           = execSync;
exports.isExcluded         = isExcluded;
exports.adaptOrCreateArgs  = adaptOrCreateArgs;
exports.rmdir              = rmdir;
exports.rmfile             = rmfile;
exports.spawn              = spawn;
exports.writeFileIfUpdated = writeFileIfUpdated;
