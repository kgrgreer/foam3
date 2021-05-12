package net.nanopay.tx.rbc.cron;

import foam.core.ContextAgent;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import net.nanopay.meter.clearing.ClearingTimesTrait;
import net.nanopay.tx.rbc.RbcCITransaction;
import net.nanopay.tx.rbc.RbcCOTransaction;
import net.nanopay.tx.rbc.RbcTransaction;
import net.nanopay.tx.rbc.RbcVerificationTransaction;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
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
        // if the transaction is not settled, do nothing
        if ( ! ((RbcTransaction)rbcTransaction).getSettled() ) continue;

        ClearingTimesTrait traits = (ClearingTimesTrait) rbcTransaction;
        if ( traits.getProcessDate() != null && traits.getEstimatedCompletionDate() != null ) {
          // currently, the estimated completion date calculated based on the process date in the clearingTimeService,
          // we set the estimated completion date and process date when we submit the transaction to rbc (i.e. status = SENT)
          LocalDate expectedCompletionDate = traits.getEstimatedCompletionDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();

          // only compare the expected completion date to see if the transaction is complete
          LocalDate today = LocalDate.now();
          if ( expectedCompletionDate.isEqual(today) || expectedCompletionDate.isBefore(today) ) {
            rbcTransaction = (Transaction) rbcTransaction.fclone();
            rbcTransaction.setStatus(TransactionStatus.COMPLETED);
            rbcTransaction.setCompletionDate(new Date());
            transactionDAO.inX(x).put(rbcTransaction);
          }
        }
      } catch ( Exception e ) {
        logger.error("Error when mark the transaction: " + rbcTransaction.getId() + " as completed.", e);
      }
    }

  }
}
