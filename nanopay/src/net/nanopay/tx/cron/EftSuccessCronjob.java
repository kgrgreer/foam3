package net.nanopay.tx.cron;

import foam.core.ContextAgent;
import foam.core.Detachable;
import foam.core.FObject;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.dao.ListSink;
import foam.dao.Sink;
import net.nanopay.tx.model.Transaction;

import java.util.Arrays;
import java.util.Calendar;
import java.util.List;
import net.nanopay.cico.model.TransactionStatus;

import static foam.mlang.MLang.EQ;

public class EftSuccessCronjob implements ContextAgent {

  @Override
  public void execute(X x){
    DAO transactionDAO = (DAO) x.get("localTransactionDAO");
    List<Integer> cadHolidays = Arrays.asList(1, 50, 89, 141, 183, 218, 246, 281, 316, 359, 360);
    Calendar daySent = Calendar.getInstance();
    int i =0;
    while ( i < 3 ) {
      daySent.add(Calendar.DAY_OF_YEAR, -1);
      if ( daySent.get(Calendar.DAY_OF_WEEK) != 7 && daySent.get(Calendar.DAY_OF_WEEK) != 1 && !cadHolidays.contains(daySent.get(Calendar.DAY_OF_YEAR)) ) {
        i = i + 1;
      }
    }
    transactionDAO.where(EQ(Transaction.CICO_STATUS, TransactionStatus.PENDING)).select( new AbstractSink() {
      @Override
      public void put(Object o, Detachable d) {
        Transaction txn = (Transaction) o;
        //reference number contains date when csv is generated in milliseconds and 5-digit random number
        String refStr = txn.getReferenceNumber().substring(0, txn.getReferenceNumber().length() - 5);
        long refNo = Long.parseLong(refStr);
        Calendar refDate = Calendar.getInstance();
        refDate.setTimeInMillis(refNo);
        if ( refDate.get(Calendar.DAY_OF_YEAR) <= daySent.get(Calendar.DAY_OF_YEAR) ) {
          txn.setCicoStatus(TransactionStatus.ACCEPTED);
          //transactionDAO.put_(x, txn);
        }
      }
    });
  }
}

