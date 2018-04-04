package net.nanopay.tx.cron;

import foam.core.ContextAgent;
import foam.core.Detachable;
import foam.core.FObject;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.dao.Sink;
import net.nanopay.cico.model.TransactionType;
import net.nanopay.tx.model.Transaction;

import java.util.Arrays;
import java.util.Calendar;
import java.util.List;
import net.nanopay.tx.model.TransactionStatus;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.NEQ;

public class EftSuccessCronjob implements ContextAgent {
  @Override
  public void execute(X x){
    DAO transactionDAO = (DAO) x.get("localTransactionDAO");
    List<Integer> cadHolidays = Arrays.asList(1, 50, 89, 141, 183, 218, 246, 281, 316, 359, 360);
    Calendar daySent = Calendar.getInstance();
    int i =0;
    while ( i < 2 ) {
      daySent.add(Calendar.DAY_OF_YEAR, -1);
      if ( daySent.get(Calendar.DAY_OF_WEEK) != 7 && daySent.get(Calendar.DAY_OF_WEEK) != 1 && !cadHolidays.contains(daySent.get(Calendar.DAY_OF_YEAR)) ) {
        i = i + 1;
      }
    }
    transactionDAO.where(AND(
      EQ(Transaction.STATUS, TransactionStatus.SENT),
      NEQ(Transaction.TYPE, TransactionType.CASHOUT)
    )).select( new AbstractSink() {
      @Override
      public void put(Object o, Detachable d) {
        Transaction txn = (Transaction) ((Transaction) o).deepClone();
        Calendar txnSettlementDate = Calendar.getInstance();
        if ( txn.getSettlementDate() != null ) {
          txnSettlementDate.setTime(txn.getSettlementDate());
          if ( txnSettlementDate.get(Calendar.DAY_OF_YEAR) <= daySent.get(Calendar.DAY_OF_YEAR) ) {
            txn.setStatus(TransactionStatus.COMPLETED);
            transactionDAO.put_(x, txn);
          }
        }
      }
    });
  }
}
