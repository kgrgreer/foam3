/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.u2.wizard.data',
  name: 'Loader',
  proxy: true,
  nullStrategy: true,

  methods: [
    {
      name: 'load',
      async: true
    }
  ]
});
