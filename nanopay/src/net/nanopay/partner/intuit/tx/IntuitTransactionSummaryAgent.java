/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */
package net.nanopay.partner.intuit.tx;
import foam.core.X;
import foam.dao.DAO;
import java.util.Date;
import java.util.List;
import net.nanopay.tx.ChainSummary;
import net.nanopay.tx.SummarizingTransaction;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.cron.TransactionSummaryAgent;

public class IntuitTransactionSummaryAgent extends TransactionSummaryAgent {
  List txns;
  public IntuitTransactionSummaryAgent(List txns) {
    super();
    this.txns = txns;
  }

  public void generateTransactionSummaries(X x) {
    DAO transactionSummaryDAO = (DAO) x.get("localTransactionSummaryDAO");
    for ( int i = 0; i < txns.size(); i++ ) {
      Transaction txn = (Transaction) txns.get(i);
      SummarizingTransaction summarizingTransaction = (SummarizingTransaction) txn;
      ChainSummary chainSummary = summarizingTransaction.getChainSummary();

      IntuitTransactionSummary intuitTxnSummary = new IntuitTransactionSummary.Builder(x)
          .setId(txn.getId())
          .setCurrency(txn.getSourceCurrency())
          .setAmount(txn.getAmount())
          .setSummary(chainSummary.getSummary())
          .setStatus(chainSummary.getStatus())
          .setCategory(chainSummary.getCategory())
          .setErrorCode(chainSummary.getErrorCode())
          .setErrorInfo(chainSummary.getErrorInfo())
          .setCreated(new Date())
          .setLastModified(new Date())
          .setExternalId(txn.getExternalId() != null ? txn.getExternalId() : "")
          .setExternalInvoiceId(txn.getExternalInvoiceId() != null ? txn.getExternalInvoiceId() : "")
          .build();
        transactionSummaryDAO.put(intuitTxnSummary);
    }
  }
  
}
