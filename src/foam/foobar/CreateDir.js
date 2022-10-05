/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.foobar',
  name: 'CreateDir',
  implements: ['foam.core.ContextAgent'],
  flags: ['node'],

  properties: [
    {
      name: 'fs_',
      factory: () => require('fs').promises
    },
    {
      class: 'String',
      name: 'path',
      required: true
    }
  ],

  methods: [
    async function execute () {
      await this.fs_.mkdir(this.path, { recursive: true });
    }
  ]
});
