package net.nanopay.tx.cron;

import foam.core.ContextAgent;
import foam.core.Detachable;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.nanos.logger.Logger;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;
import net.nanopay.tx.alterna.AlternaCITransaction;
import net.nanopay.tx.alterna.AlternaCOTransaction;
import net.nanopay.fx.ascendantfx.AscendantFXTransaction;

import java.util.Calendar;
import java.util.Date;

import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.OR;
import static foam.mlang.MLang.INSTANCE_OF;

public class EftSuccessCronjob implements ContextAgent {
  @Override
  public void execute(X x){
    Logger logger = (Logger) x.get("logger");
    DAO transactionDAO = (DAO) x.get("localTransactionDAO");
    Calendar currentDate = Calendar.getInstance();

    transactionDAO
      .where(
             AND(
                 EQ(Transaction.STATUS, TransactionStatus.SENT),
                 OR(
                    INSTANCE_OF(AlternaCITransaction.class),
                    INSTANCE_OF(AlternaCOTransaction.class),
                    INSTANCE_OF(AscendantFXTransaction.class)
                 )
               )
             )
      .select( new AbstractSink() {
      @Override
      public void put(Object o, Detachable d) {
        Transaction txn = (Transaction) ((Transaction) o).deepClone();
        Calendar txnCompletionDate = Calendar.getInstance();

        if ( txn.getCompletionDate() != null ) {
          txnCompletionDate.setTime(txn.getCompletionDate());
          if ( txnCompletionDate.get(Calendar.DAY_OF_YEAR) <= currentDate.get(Calendar.DAY_OF_YEAR) ) {
            txn.setStatus(TransactionStatus.COMPLETED);
            transactionDAO.put(txn);
          }
        }
      }
    });

    logger.debug("EftSuccessCronjob finished");
  }
}
