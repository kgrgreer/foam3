/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.data',
  name: 'ContextLoader',
  implements: ['foam.u2.wizard.data.Loader'],

  properties: [
    {
      class: 'foam.u2.wizard.PathProperty',
      name: 'path'
    },
  ],

  methods: [
    async function load() {
      return this.path.f(this.__subContext__);
    }
  ]
});
