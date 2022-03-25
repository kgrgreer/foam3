/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaEntryNoRemoveDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Block/discard DAO remove operations.`,

  methods: [
    {
      name: 'remove_',
      javaCode: `
      throw new UnsupportedOperationException("remove");
      `
    }
   ]
});
