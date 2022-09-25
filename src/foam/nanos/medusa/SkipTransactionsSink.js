/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'SkipTransactionsSink',
  extends: 'foam.dao.ProxySink',

  documentation: 'Do not delegate MedusaEntries for Transactions',

  javaImports: [
    'foam.core.X',
    'foam.dao.ProxySink'
  ],

  javaCode: `
    public SkipTransactionsSink(X x, ProxySink delegate) {
      super(x, delegate);
    }
  `,

  methods: [
    {
      name: 'put',
      javaCode: `
      MedusaEntry entry = (MedusaEntry) obj;
      if ( ! "localTransactionDAO".equals(entry.getNSpecName()) ) {
        getDelegate().put(obj, sub);
      }
      `
    }
  ]
});
