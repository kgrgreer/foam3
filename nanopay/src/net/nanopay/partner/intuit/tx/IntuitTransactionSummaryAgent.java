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
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.mlang.predicate.Predicate;
import foam.nanos.cron.Cron;
import java.util.*;
import net.nanopay.tx.ChainSummary;
import net.nanopay.tx.FeeSummaryTransactionLineItem;
import net.nanopay.tx.SummarizingTransaction;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.cron.TransactionSummaryAgent;

public class IntuitTransactionSummaryAgent extends TransactionSummaryAgent {
  public IntuitTransactionSummaryAgent(String spid) {
    super(spid);
  }

  @Override
  public void generateTransactionSummaries(X x, Predicate predicate, DAO dao) {
    ArraySink txnSink = (ArraySink) dao.where(predicate).select(new ArraySink());
    HashSet<String> summaryTxnIds = setupTxnIdSet(x, txnSink.getArray());
    List<Transaction> txns = setupTxnListFromSet(x, summaryTxnIds);
    DAO transactionSummaryDAO = (DAO) x.get("localTransactionSummaryDAO");
    for ( int i = 0; i < txns.size(); i++ ) {
      Transaction txn = txns.get(i);
      SummarizingTransaction summarizingTransaction = (SummarizingTransaction) txn;
      ChainSummary chainSummary = summarizingTransaction.getChainSummary();

      List<FeeSummaryTransactionLineItem> feeLineItems = new ArrayList<>();
      if ( txn.getLineItems().length > 0 ) {
        for ( var li : txn.getLineItems() ) {
          if ( li instanceof FeeSummaryTransactionLineItem ) feeLineItems.add((FeeSummaryTransactionLineItem) li);
        }
      }

      IntuitTransactionSummary intuitTxnSummary = new IntuitTransactionSummary.Builder(x)
        .setId(txn.getId())
        .setCurrency(txn.getSourceCurrency())
        .setAmount(txn.getAmount())
        .setStatus(chainSummary.getStatus())
        .setCategory(chainSummary.getCategory())
        .setErrorCode(chainSummary.getErrorCode())
        .setErrorInfo(chainSummary.getErrorInfo())
        .setCreated(txn.getCreated())
        .setLastModified(txn.getLastModified())
        .setExternalId(txn.getExternalId() != null ? txn.getExternalId() : "")
        .setExternalInvoiceId(txn.getExternalInvoiceId() != null ? txn.getExternalInvoiceId() : "")
        .build();
      if (txn.getPayer() != null) intuitTxnSummary.setPayer(txn.getPayer().getId());
      if (txn.getPayee() != null) intuitTxnSummary.setPayee(txn.getPayee().getId());
      if (feeLineItems.size() > 0) intuitTxnSummary.setFeeLineItem(feeLineItems.get(0));
      intuitTxnSummary.setSummary(intuitTxnSummary.summarizeTransaction(x, txn));
      transactionSummaryDAO.put(intuitTxnSummary);
    }
  }

  @Override
  public Date getLastRun(X x) {
    return ((Cron)((DAO)x.get("cronDAO")).find("IntuitTransactionSummaryAgent")).getLastRun();
  }
  
}
