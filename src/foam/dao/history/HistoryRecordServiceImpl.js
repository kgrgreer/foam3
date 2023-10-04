/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao.history',
  name: 'HistoryRecordServiceImpl',
  implements: [ 'foam.dao.history.HistoryRecordService' ],

  javaImports: [
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.order.Desc',
    'java.util.stream.Collectors',
    'java.util.List'
  ],

  methods: [
    {
      name: 'getRecord',
      type: 'HistoryRecord',
      args: 'Context x, foam.dao.DAO dao, String propertyName',
      javaCode: `
        if ( dao == null ) {
          throw new IllegalStateException("DAO does not exist");
        }
    
        if ( ! HistoryRecord.class.isAssignableFrom(dao.getOf().getObjClass()) ) {
          throw new IllegalStateException("DAO must be of HistoryRecord");
        }
        
        ArraySink sink = (ArraySink) dao.orderBy(new Desc(HistoryRecord.TIMESTAMP))
          .limit(1)
          .select(new ArraySink());
        
        return sink.getArray().size() > 0 ? (HistoryRecord) sink.getArray().get(0) : null;
      `
    },
    {
      name: 'getRecords',
      type: 'HistoryRecord[]',
      args: 'Context x, foam.dao.DAO dao, String propertyName',
      javaCode: `
        if ( dao == null ) {
          throw new IllegalStateException("DAO does not exist");
        }
    
        if ( ! HistoryRecord.class.isAssignableFrom(dao.getOf().getObjClass()) ) {
          throw new IllegalStateException("DAO must be of HistoryRecord");
        }
    
        List<HistoryRecord> records = ((ArraySink) dao.select(new ArraySink())).getArray();
        return records.stream()
          .filter(record -> hasPropertyUpdate(record, propertyName))
          .toArray(HistoryRecord[]::new);
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
