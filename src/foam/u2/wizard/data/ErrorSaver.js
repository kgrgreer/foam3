/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.data',
  name: 'ErrorSaver',
  extends: 'foam.u2.wizard.data.ProxySaver',

  methods: [
    async function save () {
      throw new Error('message from exception');
    }
  ]
});