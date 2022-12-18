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
    'foam.nanos.medusa.MedusaRegistry',
    'java.util.HashMap',
    'java.util.Map'
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
      class: 'Long',
      name: 'cleared'
    },
    {
      class: 'Long',
      name: 'removed'
    },
    {
      class: 'Map',
      name: 'clearable',
      javaFactory: 'return new HashMap();'
    }
  ],

  methods: [
    {
      name: 'put',
      javaCode: `
      MedusaEntry entry = (MedusaEntry) ((FObject)obj).fclone();
      getRegistry().notify(getX(), entry);
      if ( ! entry.getCompactible() ) {
        getDao().remove(entry);
        setRemoved(getRemoved() + 1);
      } else {
        Boolean clearable = (Boolean) getClearable().get(entry.getNSpecName());
        if ( clearable == null ) {
          Compaction compaction = (Compaction) ((DAO) getX().get("compactionDAO")).find(entry.getNSpecName());
          if ( compaction != null &&
               compaction.getClearable() ) {
            clearable = true;
          } else {
            clearable = false;
          }
          getClearable().put(entry.getNSpecName(), clearable);
        }
        if ( clearable ) {
          MedusaEntry.DATA.clear(entry);
          MedusaEntry.TRANSIENT_DATA.clear(entry);
          MedusaEntry.OBJECT.clear(entry);
          getDao().put(entry);
          setCleared(getCleared() + 1);
        }
      }
      `
    }
  ]
});
