/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.util.uid',
  name: 'GlobalSearchService',

  skeleton: true,

  methods: [
    {
      name: 'searchById',
      documentation: 'Search for objects by foam unique id across all DAOs',
      type: 'Map',
      async: true,
      args: [ 'Context x', 'String id' ]
    }
  ]
});
