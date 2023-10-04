/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao.history;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import java.util.stream.Collectors;
import java.util.List;

public class ServerHistoryRecordService implements HistoryRecordService {
  @Override
  public HistoryRecord getRecord(X x, DAO dao, String propertyName) {
    return null;
  }

  @Override
  public HistoryRecord[] getRecords(X x, DAO dao, String propertyName) {
    if ( dao == null ) {
      throw new IllegalStateException("DAO does not exist");
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
