/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.alarming',
  name: 'OMName',
  ids: ['name'],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public OMName(String name) {
            setName(name);
          }
        `);
      }
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'name',
      storageTransient: true
    }
  ]
});
