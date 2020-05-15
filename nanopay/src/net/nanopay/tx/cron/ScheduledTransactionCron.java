package net.nanopay.tx.cron;

import foam.core.ContextAgent;
import foam.core.Detachable;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.nanos.notification.Notification;
import java.util.Date;
import net.nanopay.tx.model.TransactionStatus;
import net.nanopay.tx.model.Transaction;

import static foam.mlang.MLang.*;

public class ScheduledTransactionCron implements ContextAgent {
  @Override
  public void execute(X x){
    DAO transactionDAO = (DAO) x.get("localTransactionDAO");
    Date now = new Date();
    transactionDAO.where(AND(
      EQ(Transaction.STATUS, TransactionStatus.SCHEDULED),
      LTE(Transaction.SCHEDULED_TIME, now)
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
          DAO userDAO = (DAO) x.get("localUserDAO");
          User user = (User) userDAO.find(tx.findSourceAccount(x).getOwner());
          if ( user  != null)
            user.doNotify(x, notification);
        }
      }
    });
  }
}
