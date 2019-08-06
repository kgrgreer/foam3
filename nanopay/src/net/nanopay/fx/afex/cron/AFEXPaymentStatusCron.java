package net.nanopay.fx.afex.cron;

import foam.core.ContextAgent;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.logger.Logger;

import java.util.Calendar;
import java.util.List;

import net.nanopay.fx.afex.AFEXServiceProvider;
import net.nanopay.fx.afex.AFEXTransaction;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import static foam.mlang.MLang.*;



public class AFEXPaymentStatusCron implements ContextAgent {


  @Override
  public void execute(X x) {
    Logger logger = (Logger) x.get("logger");
    DAO transactionDAO = (DAO) x.get("localTransactionDAO");
    AFEXServiceProvider afexServiceProvider = (AFEXServiceProvider) x.get("afexServiceProvider");
    
    Calendar currentDate = Calendar.getInstance();

    ArraySink sink = (ArraySink) transactionDAO
    .where(
      AND(
          EQ(Transaction.STATUS, TransactionStatus.SENT),
          INSTANCE_OF(AFEXTransaction.class)
        )
      )
    .select(new ArraySink());
    List<Transaction> pendingTransactions = sink.getArray();
    for (Transaction transaction : pendingTransactions) {
      Calendar txnCompletionDate = Calendar.getInstance();
      if ( transaction.getCompletionDate() != null ) {
        txnCompletionDate.setTime(transaction.getCompletionDate());
        if ( txnCompletionDate.get(Calendar.DAY_OF_YEAR) <= currentDate.get(Calendar.DAY_OF_YEAR) ) {
          Transaction txn = afexServiceProvider.updatePaymentStatus(transaction);
          transaction.setStatus(txn.getStatus());
          transactionDAO.put(transaction.fclone());
        }
      }
    }
  }
}