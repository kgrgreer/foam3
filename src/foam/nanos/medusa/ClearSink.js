/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ClearSink',
  extends: 'foam.dao.AbstractSink',

  documentation: `Clear 'data' from old MedusaEntryDAO entries and cleanup MedusaRegistry.  Delete entries which are not compactible.`,

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
    }
  ],

  methods: [
    {
      name: 'put',
      javaCode: `
      MedusaEntry entry = (MedusaEntry) ((FObject)obj).fclone();
      getRegistry().notify(getX(), entry);
      if ( entry.getCompactible() ) {
        MedusaEntry.DATA.clear(entry);
        MedusaEntry.TRANSIENT_DATA.clear(entry);
        MedusaEntry.OBJECT.clear(entry);
        getDao().put(entry);
      } else {
        getDao().remove(entry);
      }
      `
    }
  ]
});
