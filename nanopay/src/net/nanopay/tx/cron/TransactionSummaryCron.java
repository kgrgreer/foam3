package net.nanopay.tx.cron;

import foam.core.ContextAgent;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import net.nanopay.tx.ChainSummary;
import net.nanopay.tx.IntuitTransactionSummary;
import net.nanopay.tx.SummaryTransaction;
import net.nanopay.tx.TransactionSummary;
import net.nanopay.tx.model.TransactionStatus;

import static foam.mlang.MLang.INSTANCE_OF;

public class TransactionSummaryCron implements ContextAgent {
  @Override
  public void execute(X x) {
    DAO transactionDAO = (DAO) x.get("localTransactionDAO");
    DAO transactionSummaryDAO = (DAO) x.get("localTransactionSummaryDAO");
    ArraySink sink = (ArraySink) transactionDAO.where(
      INSTANCE_OF(SummaryTransaction.class)
    ).select(new ArraySink());

    for ( int i = 0; i < sink.getArray().size(); i++ ) {
      SummaryTransaction summaryTxn = (SummaryTransaction) sink.getArray().get(i);
      TransactionSummary txnSummary;
      String id = summaryTxn.getId();
      TransactionStatus status = summaryTxn.getStatus();
      ChainSummary chainSummary = summaryTxn.getChainSummary();
      Long amount = summaryTxn.getAmount();

      if ( summaryTxn.getExternalId() == null && summaryTxn.getExternalInvoiceId() == null ) {
        txnSummary = new TransactionSummary.Builder(x)
          .setId(id)
          .setStatus(status)
          .setErrorCode(chainSummary.getErrorCode())
          .setAmount(amount)
          .build();
      } else {
        txnSummary = new IntuitTransactionSummary.Builder(x)
          .setId(id)
          .setStatus(status)
          .setErrorCode(chainSummary.getErrorCode())
          .setAmount(amount)
          .setExternalId(summaryTxn.getExternalId() != null ? summaryTxn.getExternalId() : "")
          .setExternalInvoiceId(summaryTxn.getExternalInvoiceId() != null ? summaryTxn.getExternalInvoiceId() : "")
          .build();
      }
      transactionSummaryDAO.put(txnSummary);
    }

  }
}
