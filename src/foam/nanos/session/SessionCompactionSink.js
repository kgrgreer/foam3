/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.session',
  name: 'SessionCompactionSink',
  extends: 'foam.dao.ProxySink',

  documentation: 'Do not delegate MedusaEntries for Sessions',

  javaImports: [
    'foam.nanos.medusa.MedusaEntry'
  ],

  methods: [
    {
      name: 'put',
      javaCode: `
      MedusaEntry entry = (MedusaEntry) obj;
      if ( ! "localSessionDAO".equals(entry.getNSpecName()) ) {
        getDelegate().put(obj, sub);
      }
      `
    }
  ]
});
