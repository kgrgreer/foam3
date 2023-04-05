/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaUniqueDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Nodes retain the last x entries in an MDAO. Test and alarm on duplicates.`,

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.UniqueConstraintException',
    'foam.log.LogLevel',
    'foam.nanos.er.EventRecord'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      MedusaEntry entry = (MedusaEntry) obj;
      if ( getDelegate().find_(x, entry.getId()) != null ) {
        ((DAO) x.get("eventRecordDAO")).put(new EventRecord(x, this, "Medusa Duplicate Index", entry.toString(), LogLevel.WARN, null));
        throw new UniqueConstraintException("MedusaEntry duplicate index: "+entry.getIndex());
      }
      // test for missing hash
      if ( foam.util.SafetyUtil.isEmpty(entry.getHash()) ) {
        throw new java.lang.IllegalArgumentException("MedusaEntry missing hash: "+entry.getIndex());
      }

      return getDelegate().put_(x, entry);
      `
    }
  ]
});
