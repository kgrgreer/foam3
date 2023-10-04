/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao.history',
  name: 'HistoryRecordServiceServer',
  implements: [ 'foam.dao.history.HistoryRecordService' ],

  javaImports: [
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.order.Desc',
    'java.util.stream.Collectors',
    'java.util.List',

    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'getRecord',
      type: 'HistoryRecord',
      args: 'Context x, String daoKey, String propertyName',
      javaCode: `
        DAO dao = getHistoryDAO(x, daoKey)
          .orderBy(new Desc(HistoryRecord.TIMESTAMP))
          .limit(1);
        
        List<HistoryRecord> records = getRecords_(x, dao, propertyName);
        return records.size() > 0 ? records.get(0) : null;
      `
    },
    {
      name: 'getRecordById',
      type: 'HistoryRecord',
      args: 'Context x, String daoKey, Object id, String propertyName',
      javaCode: `
        DAO dao = getHistoryDAO(x, daoKey)
          .where(EQ(HistoryRecord.OBJECT_ID, id))
          .orderBy(new Desc(HistoryRecord.TIMESTAMP))
          .limit(1);
        
        List<HistoryRecord> records = getRecords_(x, dao, propertyName);
        return records.size() > 0 ? records.get(0) : null;
      `
    },
    {
      name: 'getRecords',
      type: 'List<HistoryRecord>',
      args: 'Context x, String daoKey, String propertyName',
      javaCode: `
        DAO dao = getHistoryDAO(x, daoKey).orderBy(new Desc(HistoryRecord.TIMESTAMP));
        return getRecords_(x, dao, propertyName);
      `
    },
    {
      name: 'getRecordsById',
      type: 'List<HistoryRecord>',
      args: 'Context x, String daoKey, Object id, String propertyName',
      javaCode: `
        DAO dao = getHistoryDAO(x, daoKey)
          .where(EQ(HistoryRecord.OBJECT_ID, id))
          .orderBy(new Desc(HistoryRecord.TIMESTAMP));
        return getRecords_(x, dao, propertyName);
      `
    },
    {
      name: 'getHistoryDAO',
      visibility: 'private',
      type: 'DAO',
      args: 'Context x, String daoKey',
      javaCode: `
        DAO dao = (DAO) x.get(daoKey);

        if ( dao == null ) {
          throw new IllegalStateException("DAO does not exist");
        }
    
        if ( ! HistoryRecord.class.isAssignableFrom(dao.getOf().getObjClass()) ) {
          throw new IllegalStateException("DAO must be of HistoryRecord");
        }

        return dao;
      `
    },
    {
      name: 'getRecords_',
      visibility: 'private',
      type: 'List<HistoryRecord>',
      args: 'Context x, DAO dao, String propertyName',
      javaCode: `
        List<HistoryRecord> records = ((ArraySink) dao
          .select(new ArraySink()))
          .getArray();

        return records.stream()
          .filter(record -> hasPropertyUpdate(record, propertyName))
          .collect(Collectors.toList());
      `
    },
    {
      name: 'hasPropertyUpdate',
      visibility: 'private',
      type: 'boolean',
      args: 'HistoryRecord record, String propertyName',
      javaCode: `
        for ( PropertyUpdate update : record.getUpdates() ) {
          if ( update.getName().equals(propertyName) ) return true;
        }
        return false;
      `
    }
  ]
});
