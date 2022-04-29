/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.u2.wizard.data',
  name: 'Saver',
  proxy: true,
  nullStrategy: true,

  methods: [
    {
      name: 'save',
      async: true
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.wizard.data',
  name: 'NullSaver',
  implements: [ 'foam.u2.wizard.data.Saver' ],

  methods: [
    function save() {}
  ]
});
