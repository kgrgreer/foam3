/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.data',
  name: 'PayloadLoader',
  extends: 'foam.u2.wizard.data.ProxyLoader',


  properties: [
    {
      class: 'String',
      name: 'capabilityId'
    }
  ],

  methods: [
    async function load(...a) {
      const capable = await this.delegate.load(...a);
      const dao = capable.getCapablePayloadDAO();
      const payload = await dao.find(this.capabilityId);
    
      return payload.data;
    }
  ]
});
