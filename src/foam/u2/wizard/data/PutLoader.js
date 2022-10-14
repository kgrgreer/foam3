/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.data',
  name: 'PutLoader',
  extends: 'foam.u2.wizard.data.ProxyLoader',
  documentation: `
    A ProxyLoader which does a DAO put in order to get the resulting updated
    object after mutations by DAO decorators.
  `,

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao'
    }
  ],

  methods: [
    async function load(...a) {
      const result = await this.delegate.load(...a);
      return await this.dao.put(result);
    }
  ]
});
