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
package net.nanopay.tx.cron;

import foam.core.ContextAgent;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.cron.Cron;
import java.util.*;
import net.nanopay.fx.FXSummaryTransaction;
import net.nanopay.tx.ChainSummary;
import net.nanopay.tx.IntuitTransactionSummary;
import net.nanopay.tx.SummarizingTransaction;
import net.nanopay.tx.SummaryTransaction;
import net.nanopay.tx.TransactionSummary;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import static foam.mlang.MLang.*;

public class TransactionSummaryGenerator implements ContextAgent {
  @Override
  public void execute(X x) {
    DAO summaryTransactionDAO = (DAO) x.get("summaryTransactionDAO");
    DAO transactionDAO = (DAO) x.get("localTransactionDAO");
    Date lastRun = ((Cron)((DAO)x.get("cronDAO")).find("TransactionSummaryGenerator")).getLastRun();
    
    if (lastRun != null) {
      ArraySink txnLastModifiedSink = (ArraySink) transactionDAO.where(
        AND(
          GT(Transaction.LAST_MODIFIED, lastRun),
          NEQ(Transaction.SPID, "intuit")
        )
      ).select(new ArraySink());

      ArraySink intuitLastModifiedTxnSink = (ArraySink) transactionDAO.where(
        AND(
          GT(Transaction.LAST_MODIFIED, lastRun),
          EQ(Transaction.SPID, "intuit")
        )
      ).select(new ArraySink());

      HashSet<String> summaryTxnIds = setupTxnIdSet(x, txnLastModifiedSink.getArray());
      HashSet<String> intuitSummaryTxnIds = setupTxnIdSet(x, intuitLastModifiedTxnSink.getArray());
      List<Transaction> txnList = setupTxnListFromSet(x, summaryTxnIds);
      List<Transaction> intuitTxnList = setupTxnListFromSet(x, intuitSummaryTxnIds);
      generateTransactionSummaries(x, txnList, intuitTxnList);
    } else {
      ArraySink txnSink = (ArraySink) summaryTransactionDAO.where(
        NEQ(Transaction.SPID, "intuit")
      ).select(new ArraySink());

      ArraySink intuitTxnSink = (ArraySink) summaryTransactionDAO.where(
        EQ(Transaction.SPID, "intuit")
      ).select(new ArraySink());

      generateTransactionSummaries(x, txnSink.getArray(), intuitTxnSink.getArray());
    }
  }

  private void generateTransactionSummaries(X x, List txns, List intuitTxns) {
    DAO transactionSummaryDAO = (DAO) x.get("localTransactionSummaryDAO");
    for ( int i = 0; i < txns.size(); i++ ) {
      Transaction txn = (Transaction) txns.get(i);
      if ( txn instanceof SummaryTransaction ) {
        txn = (SummaryTransaction) txn;
      } else if ( txn instanceof FXSummaryTransaction ) {
        txn = (FXSummaryTransaction) txn;
      }

      SummarizingTransaction summarizingTransaction = (SummarizingTransaction) txn;
      ChainSummary chainSummary = summarizingTransaction.getChainSummary();
      TransactionSummary txnSummary = new TransactionSummary.Builder(x)
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
        .build();
      transactionSummaryDAO.put(txnSummary);
    }

    for ( int i = 0; i < intuitTxns.size(); i++ ) {
      Transaction txn = (Transaction) intuitTxns.get(i);
      if ( txn instanceof SummaryTransaction ) {
        txn = (SummaryTransaction) txn;
      } else if ( txn instanceof FXSummaryTransaction ) {
        txn = (FXSummaryTransaction) txn;
      }

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

  private List<Transaction> setupTxnListFromSet(X x, HashSet<String> txnIdSet) {
    DAO transactionDAO = (DAO) x.get("localTransactionDAO");
    List<Transaction> txnList = new ArrayList<>();
    for ( String id : txnIdSet ) {
      Transaction txn = (Transaction) transactionDAO.find(id);
      txnList.add(txn);
    }
    return txnList;
  }

  private HashSet<String> setupTxnIdSet(X x, List txns) {
    HashSet<String> txnIdSet = new HashSet<String>();
    for ( int i = 0; i < txns.size(); i++ ) {
      Transaction txn = (Transaction) txns.get(i);
      Transaction summaryTxn = txn.findRoot(x);
      txnIdSet.add(summaryTxn.getId());
    }
    return txnIdSet;
  }

}
