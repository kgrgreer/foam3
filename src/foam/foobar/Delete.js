/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.foobar',
  name: 'Delete',
  implements: ['foam.core.ContextAgent'],
  flags: ['node'],

  imports: [
    'args as parentArgs',
    'allowedDirectories',
    'console',
    'protectedDirectories'
  ],

  properties: [
    {
      name: 'fs_',
      factory: () => require('fs').promises
    },
    {
      name: 'path_',
      factory: () => require('path')
    },
    {
      class: 'String',
      name: 'path',
      required: true
    },
    {
      class: 'Boolean',
      name: 'recursive'
    },
    {
      class: 'Boolean',
      name: 'force'
    }
  ],

  methods: [
    async function execute () {
      const absPath = this.path_.resolve(this.path);
      console.log("\033[31;1mDELETING\033[0m " + absPath);
      
      // Path must be in allowed directories
      for ( const allowedDir of this.allowedDirectories ) {
        if ( this.subdirOrEq(allowedDir, this.path) ) {
          break;
        }
        throw new Error(`attempted to delete outside allowed directories: ${absPath}`);
      }
      for ( const protectedDir of this.protectedDirectories ) {
        if ( protectedDir === absPath ) {
          throw new Error(`attempted to delete protected path: ${absPath}`);
        }
      }
      await this.fs_.rm(absPath, {
        recursive: this.recursive,
        force: this.force
      });
    },
    function subdirOrEq (parent, child) {
      const relPath = this.path_.relative(parent, child);
      return ! relPath.startsWith('..') && ! this.path_.isAbsolute(relPath);
    }
  ]
});
