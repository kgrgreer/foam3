/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.agents',
  name: 'ValueAgent',
  documentation: `
    This context agent exports each key of 'value'.
  `,

  properties: [
    {
      name: 'value',
      class: 'Map'
    }
  ],

  methods: [
    async function execute() {
      return this.__subContext__.createSubContext(this.value);
    }
  ]
});
