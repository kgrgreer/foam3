#!/usr/bin/env node

var dir = __dirname;
var foam_root = dir + '/../foam3';
var nanopay_root = dir + '/../nanopay';
var outdir = dir + '/swiftfoam/stubs';

var classpaths = [
  foam_root + '/src',
  nanopay_root + '/src',
  dir + '/src',
].join(',')

var command = [
  'node',
  foam_root + '/tools/genswift.js',
  dir + '/classes.js',
  outdir,
  classpaths,
].join(' ');

console.log(command);
var execSync = require('child_process').execSync
execSync(command, {stdio:[0,1,2], stderr:[0,1,2]});
execSync('cp ' + foam_root + '/swift_src/* ' + outdir);
