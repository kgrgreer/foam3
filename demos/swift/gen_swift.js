#!/usr/bin/env node

var dir = __dirname;
var root = dir + '/../..';

var classpaths = [
  dir + '/../../src',
  dir + '/c',
  dir + '/../../src/com/google/foam/demos/tabata',
].join(',')

var command = [
  'node',
//  '--inspect-brk',
  root + '/tools/genswift.c',
  dir + '/classes.c',
  dir + '/gen',
  classpaths,
].join(' ');

console.log(command);
require('child_process').execSync(command, {stdio:[0,1,2]});
