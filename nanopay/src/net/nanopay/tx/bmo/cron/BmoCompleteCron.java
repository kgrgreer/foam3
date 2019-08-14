package net.nanopay.tx.bmo.cron;

import foam.core.ContextAgent;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import net.nanopay.tx.bmo.cico.BmoCITransaction;
import net.nanopay.tx.bmo.cico.BmoCOTransaction;
import net.nanopay.tx.bmo.cico.BmoTransaction;
import net.nanopay.tx.bmo.cico.BmoVerificationTransaction;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

public class BmoCompleteCron implements ContextAgent {

  @Override
  public void execute(X x) {
    DAO transactionDAO = (DAO) x.get("localTransactionDAO");
    Logger logger = new PrefixLogger(new String[] {"BMO"}, (Logger) x.get("logger"));

    ArraySink arraySink = (ArraySink) transactionDAO.where(MLang.AND(
      MLang.EQ(Transaction.STATUS, TransactionStatus.SENT),
      MLang.OR(
        MLang.INSTANCE_OF(BmoCITransaction.getOwnClassInfo()),
        MLang.INSTANCE_OF(BmoCOTransaction.getOwnClassInfo()),
        MLang.INSTANCE_OF(BmoVerificationTransaction.getOwnClassInfo())
      )
    )).select(new ArraySink());
    List<Transaction> transactions = arraySink.getArray();

    for ( Transaction bmoTransaction : transactions ) {

      try {
        // if the transaction is not settled, do nothing
        if ( ! ((BmoTransaction)bmoTransaction).getSettled() ) continue;


        if ( bmoTransaction.getProcessDate() != null && bmoTransaction.getCompletionDate() != null ) {
          LocalDate today = LocalDate.now();
          LocalDate processDate = bmoTransaction.getProcessDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
          // currently, the expected completion date if 1 day after the process date,
          // we set the completion date and process date when we submit the transaction to bmo.
          LocalDate expectedCompletionDate = bmoTransaction.getCompletionDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();


          // now, we will only compare the expected completion date,
          // we can also compare process date + X day if we want to more flexibility
          if ( expectedCompletionDate.isEqual(today) || expectedCompletionDate.isBefore(today) ) {
            bmoTransaction = (Transaction) bmoTransaction.fclone();
            bmoTransaction.setStatus(TransactionStatus.COMPLETED);
            transactionDAO.inX(x).put(bmoTransaction);
          }
        }
      } catch ( Exception e ) {
        logger.error("Error when mark the transaction: " + bmoTransaction.getId() + " as completed.", e);
      }
    }

  }


}
