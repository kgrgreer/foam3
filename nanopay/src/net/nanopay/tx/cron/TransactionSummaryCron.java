package net.nanopay.tx.cron;

import foam.core.ContextAgent;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.cron.Cron;
import java.util.Date;
import net.nanopay.fx.FXSummaryTransaction;
import net.nanopay.integration.ErrorCode;
import net.nanopay.tx.ChainSummary;
import net.nanopay.tx.IntuitTransactionSummary;
import net.nanopay.tx.SummaryTransaction;
import net.nanopay.tx.TransactionSummary;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import static foam.mlang.MLang.*;

public class TransactionSummaryCron implements ContextAgent {
  @Override
  public void execute(X x) {
    DAO summaryTransactionDAO = (DAO) x.get("summaryTransactionDAO");
    DAO transactionDAO = (DAO) x.get("localTransactionDAO");
    Date lastRun = ((Cron)((DAO)x.get("cronDAO")).find("TransactionSummaryCron")).getLastRun();
    
    if (lastRun != null) {
      // query transactions that have been modified since the lastRun and update the TransactionSummarys
      ArraySink txnSink = (ArraySink) transactionDAO.where(
        AND(
          GT(Transaction.LAST_MODIFIED, lastRun),
          NEQ(Transaction.SPID, "intuit")
        )
      ).select(new ArraySink());

      ArraySink intuitTxnSink = (ArraySink) transactionDAO.where(
        AND(
          GT(Transaction.LAST_MODIFIED, lastRun),
          EQ(Transaction.SPID, "intuit")
        )
      ).select(new ArraySink());

      // fetch summaryTxn ids from queried transactions and store in hashset. Create TransactionSummarys from hashset ids

    } else {
      ArraySink txnSink = (ArraySink) summaryTransactionDAO.where(
        NEQ(Transaction.SPID, "intuit")
      ).select(new ArraySink());

      ArraySink intuitTxnSink = (ArraySink) summaryTransactionDAO.where(
        EQ(Transaction.SPID, "intuit")
      ).select(new ArraySink());
      
      createTransactionSummaries(x, txnSink, intuitTxnSink);
    }
  }

  private void createTransactionSummaries(X x, ArraySink txnSink, ArraySink intuitTxnSink) {
    DAO transactionSummaryDAO = (DAO) x.get("localTransactionSummaryDAO");
    DAO errorCodeDAO = (DAO) x.get("errorCodeDAO");
    for ( int i = 0; i < txnSink.getArray().size(); i++ ) {
      Transaction txn = (Transaction) txnSink.getArray().get(i);
      if ( txn instanceof SummaryTransaction ) {
        txn = (SummaryTransaction) txn;
      } else if ( txn instanceof FXSummaryTransaction ) {
        txn = (FXSummaryTransaction) txn;
      }

      Long errorCode = txn.calculateErrorCode();
      ErrorCode errorCodeObj = (ErrorCode) errorCodeDAO.find(errorCode);
      TransactionSummary txnSummary = new TransactionSummary.Builder(x)
        .setId(txn.getId())
        .setStatus(txn.getStatus())
        .setErrorCode(errorCodeObj.getId())
        .setAmount(txn.getAmount())
        .setCreated(new Date())
        .setLastModified(new Date())
        .build();
      transactionSummaryDAO.put(txnSummary);
    }

    for ( int i = 0; i < intuitTxnSink.getArray().size(); i++ ) {
      Transaction txn = (Transaction) intuitTxnSink.getArray().get(i);
      if ( txn instanceof SummaryTransaction ) {
        txn = (SummaryTransaction) txn;
      } else if ( txn instanceof FXSummaryTransaction ) {
        txn = (FXSummaryTransaction) txn;
      }

      Long errorCode = txn.calculateErrorCode();
      ErrorCode errorCodeObj = (ErrorCode) errorCodeDAO.find(errorCode);
      IntuitTransactionSummary intuitTxnSummary = new IntuitTransactionSummary.Builder(x)
        .setId(txn.getId())
        .setStatus(txn.getStatus())
        .setErrorCode(errorCodeObj.getId())
        .setAmount(txn.getAmount())
        .setCreated(new Date())
        .setLastModified(new Date())
        .setExternalId(txn.getExternalId() != null ? txn.getExternalId() : "")
        .setExternalInvoiceId(txn.getExternalInvoiceId() != null ? txn.getExternalInvoiceId() : "")
        .build();
      transactionSummaryDAO.put(intuitTxnSummary);
    }
  }

}
