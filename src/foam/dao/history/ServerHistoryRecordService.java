/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao.history;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.mlang.order.Desc;
import java.util.stream.Collectors;
import java.util.List;

public class ServerHistoryRecordService implements HistoryRecordService {
  @Override
  public HistoryRecord getRecord(X x, DAO dao, String propertyName) {
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
  }

  @Override
  public HistoryRecord[] getRecords(X x, DAO dao, String propertyName) {
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
  }

  private boolean hasPropertyUpdate(HistoryRecord record, String propertyName) {
    for ( PropertyUpdate update : record.getUpdates() ) {
      if ( update.getName().equals(propertyName) ) return true;
    }
    return false;
  }
}
