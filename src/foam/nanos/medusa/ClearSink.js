/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ClearSink',
  extends: 'foam.dao.AbstractSink',

  documentation: `Clear 'data' from old MedusaEntryDAO entries and cleanup MedusaRegistry`,

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.nanos.medusa.MedusaRegistry'
  ],

  javaCode: `
    public ClearSink(X x, DAO dao) {
      setX(x);
      setDao(dao);
    }
  `,
  
  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao'
    },
    {
      documentation: 'MedusaRegistry for the life of the Sink',
      name: 'registry',
      class: 'FObjectProperty',
      of: 'foam.nanos.medusa.MedusaRegistry',
      javaFactory: 'return (MedusaRegistry) getX().get("medusaRegistry");',
      visibility: 'HIDDEN',
    },
    {
      name: 'count',
      class: 'Long'
    },
    {
      name: 'maxIndex',
      class: 'Long'
    }
  ],

  methods: [
    {
      name: 'put',
      javaCode: `
      MedusaEntry entry = (MedusaEntry) ((FObject)obj).fclone();
      getRegistry().notify(getX(), entry);
      MedusaEntry.DATA.clear(entry);
      MedusaEntry.TRANSIENT_DATA.clear(entry);
      MedusaEntry.OBJECT.clear(entry);
      getDao().put(entry);
      setCount(getCount() + 1);
      if ( entry.getIndex() > getMaxIndex() ) {
        setMaxIndex(entry.getIndex());
      }
      `
    }
  ]
});
