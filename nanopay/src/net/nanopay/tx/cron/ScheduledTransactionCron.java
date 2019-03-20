package net.nanopay.tx.cron;

import foam.core.ContextAgent;
import foam.dao.DAO;
import foam.core.X;
import foam.core.Detachable;
import net.nanopay.tx.model.TransactionStatus;
import net.nanopay.tx.model.Transaction;
import foam.dao.AbstractSink;
import java.util.Date;

import static foam.mlang.MLang.*;

public class ScheduledTransactionCron implements ContextAgent {
  @Override
  public void execute(X x){
    DAO transactionDAO = (DAO) x.get("localTransactionDAO");
    Date now = new Date();
    transactionDAO.where(EQ(Transaction.STATUS, TransactionStatus.SCHEDULED)).select( new AbstractSink() {
      @Override
      public void put(Object o, Detachable d) {
        Transaction tx = (Transaction) o;
        if ( tx.getScheduledTime().compareTo(now) <= 0 ) {
          tx.setStatus(tx.getInitialStatus());
          transactionDAO.put_(x, tx);
        }
      }
    });
  }
}