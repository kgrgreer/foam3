/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

exports.description = 'Execute tasks defined in POMs.';

const b_    = require('./buildlib');


var taskName;


exports.init = function(arg) {
  if ( ! arg ) console.error('[Task Maker] Task name argument required.');
  taskName = arg;
}


exports.visitPOM = function(pom) {
  if ( ! pom.tasks ) return;

  var tasks = {};
  pom.tasks.forEach(t => tasks[t.name] = t);

  if ( tasks[taskName] ) {
    try {
      console.log(`[Task Maker] Executing ${taskName} from ${pom.name}`);
      console.log(foam.cwd, pom.location, pom.path);
      tasks[taskName].call(b_, pom);
    } catch(x) {
      console.warn('[Task Maker] Error executing task:', x);
    }
  }
}
