/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.blob',
  name: 'Blob',

  proxy: true,

  methods: [
    {
      name: 'read',
      async: true,
      type: 'Long',
      args: [
        {
          name: 'out',
          javaType: 'java.io.OutputStream'
        },
        {
          name: 'offset',
          type: 'Long'
        },
        {
          name: 'length',
          type: 'Long'
        }
      ]
    },
    // TODO: Decide on whether we're adding properties and especially
    // read-only properties to interfaces.  It seems inconsistent to
    // use .getSize() in JS when most other property like things are
    // done with just .size
    {
      name: 'getSize',
      type: 'Long'
    }
  ]
});
