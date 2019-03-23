package net.nanopay.tx.cron;

import foam.core.ContextAgent;
import foam.dao.DAO;
import foam.core.X;
import foam.core.Detachable;
import foam.nanos.notification.Notification;
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
    transactionDAO.where(AND(
      EQ(Transaction.STATUS, TransactionStatus.SCHEDULED),
      LT(Transaction.SCHEDULED_TIME, now)
    )).select( new AbstractSink() {
      @Override
      public void put(Object o, Detachable d) {
        Transaction tx = (Transaction) ((Transaction) o).fclone();
        tx.setStatus(tx.getInitialStatus());
        try {
          transactionDAO.put_(x, tx);
        } catch (Exception e) {
          Notification notification = new Notification();
          notification.setNotificationType("Scheduled transaction failed");
          notification.setBody("Your scheduled transaction for $" + tx.getAmount() + " failed. Reason: " + e.getMessage());
          notification.setUserId(tx.findSourceAccount(x).getOwner());
          ((DAO) x_.get("notificationDAO")).put(notification);
        }
      }
    });
  }
}
