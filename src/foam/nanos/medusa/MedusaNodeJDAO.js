/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaNodeJDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Skip writing to underlying JDAO if only transientDate.`,

  properties: [
    {
      name: 'mdao',
      class: 'foam.dao.DAOProperty'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(`
          public MedusaNodeJDAO(foam.core.X x, foam.dao.DAO mdao, foam.dao.DAO jdao) {
            setX(x);
            setOf(foam.nanos.medusa.MedusaEntry.getOwnClassInfo());
            setMdao(mdao);
            setDelegate(jdao);
          }
        `);
      }
    }
  ],

  methods: [
    {
      documentation: `Only write non-trasient data to underlying jdao (journal). The jdao put will also update it's delegate - the mdao. Otherwise just update the mdao - with storageTransient data.`,
      name: 'put_',
      javaCode: `
      MedusaEntry entry = (MedusaEntry) obj;
      if ( ! foam.util.SafetyUtil.isEmpty(entry.getData()) ) {
        return getDelegate().put_(x, obj);
      }
      return getMdao().put_(x, obj);
      `
    }
  ]
});
