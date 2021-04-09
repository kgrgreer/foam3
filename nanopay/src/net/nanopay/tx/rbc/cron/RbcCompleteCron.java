package net.nanopay.tx.rbc.cron;

import foam.core.ContextAgent;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import net.nanopay.tx.rbc.RbcCITransaction;
import net.nanopay.tx.rbc.RbcCOTransaction;
import net.nanopay.tx.rbc.RbcTransaction;
import net.nanopay.tx.rbc.RbcVerificationTransaction;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

public class RbcCompleteCron implements ContextAgent {

  @Override
  public void execute(X x) {
    DAO transactionDAO = (DAO) x.get("localTransactionDAO");
    Logger logger = new PrefixLogger(new String[] {"RBC"}, (Logger) x.get("logger"));

    ArraySink arraySink = (ArraySink) transactionDAO.where(MLang.AND(
      MLang.EQ(Transaction.STATUS, TransactionStatus.SENT),
      MLang.OR(
        MLang.INSTANCE_OF(RbcCITransaction.getOwnClassInfo()),
        MLang.INSTANCE_OF(RbcCOTransaction.getOwnClassInfo()),
        MLang.INSTANCE_OF(RbcVerificationTransaction.getOwnClassInfo())
      )
    )).select(new ArraySink());
    List<Transaction> transactions = arraySink.getArray();

    for ( Transaction rbcTransaction : transactions ) {

      try {
        rbcTransaction = (Transaction) rbcTransaction.fclone();
        // if the transaction is not settled, do nothing
        if ( ! ((RbcTransaction)rbcTransaction).getSettled() ) continue;


        if ( rbcTransaction.getProcessDate() != null && rbcTransaction.getCompletionDate() != null ) {
          LocalDate today = LocalDate.now();
          LocalDate processDate = rbcTransaction.getProcessDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
          // currently, the expected completion date if 1 day after the process date,
          // we set the completion date and process date when we submit the transaction to rbc.
          LocalDate expectedCompletionDate = rbcTransaction.getCompletionDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();


          // now, we will only compare the expected completion date,
          // we can also compare process date + X day if we want to more flexibility
          if ( expectedCompletionDate.isEqual(today) || expectedCompletionDate.isBefore(today) ) {
            rbcTransaction = (Transaction) rbcTransaction.fclone();
            rbcTransaction.setStatus(TransactionStatus.COMPLETED);
            transactionDAO.inX(x).put(rbcTransaction);
          }
        }
      } catch ( Exception e ) {
        logger.error("Error when mark the transaction: " + rbcTransaction.getId() + " as completed.", e);
      }
    }

  }


}
