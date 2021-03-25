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
import foam.mlang.predicate.Predicate;
import foam.nanos.cron.Cron;
import java.util.*;
import net.nanopay.tx.ChainSummary;
import net.nanopay.tx.SummarizingTransaction;
import net.nanopay.tx.TransactionSummary;
import net.nanopay.tx.model.Transaction;

import static foam.mlang.MLang.*;

public class TransactionSummaryAgent implements ContextAgent {
  String spid;
  public TransactionSummaryAgent(String spid) {
    this.spid = spid;
  }

  @Override
  public void execute(X x) {
    DAO summaryTransactionDAO = (DAO) x.get("summaryTransactionDAO");
    DAO transactionDAO = (DAO) x.get("tableViewTransactionDAO");
    Date lastRun = getLastRun(x);
    
    if ( lastRun != null ) {
      Predicate predicate = AND(
        GT(Transaction.LAST_MODIFIED, lastRun),
        EQ(Transaction.SPID, spid)
      );
      generateTransactionSummaries(x, predicate, transactionDAO);
    } else {
      Predicate predicate = EQ(Transaction.SPID, spid);
      generateTransactionSummaries(x, predicate, summaryTransactionDAO);
    }
  }

  public void generateTransactionSummaries(X x, Predicate predicate, DAO dao) {
    ArraySink txnSink = (ArraySink) dao.where(predicate).select(new ArraySink());
    HashSet<String> summaryTxnIds = setupTxnIdSet(x, txnSink.getArray());
    List<Transaction> txns = setupTxnListFromSet(x, summaryTxnIds);
    DAO transactionSummaryDAO = (DAO) x.get("localTransactionSummaryDAO");
    for ( int i = 0; i < txns.size(); i++ ) {
      Transaction txn = txns.get(i);
      SummarizingTransaction summarizingTransaction = (SummarizingTransaction) txn;
      ChainSummary chainSummary = summarizingTransaction.getChainSummary();

      TransactionSummary txnSummary = new TransactionSummary.Builder(x)
        .setId(txn.getId())
        .setCurrency(txn.getSourceCurrency())
        .setAmount(txn.getAmount())
        .setStatus(chainSummary.getStatus())
        .setCategory(chainSummary.getCategory())
        .setErrorCode(chainSummary.getErrorCode())
        .setErrorInfo(chainSummary.getErrorInfo())
        .setCreated(txn.getCreated())
        .setLastModified(txn.getLastModified())
        .build();
      if (txn.getPayer() != null) txnSummary.setPayer(txn.getPayer().getId());
      if (txn.getPayee() != null) txnSummary.setPayee(txn.getPayee().getId());
      txnSummary.setSummary(txnSummary.summarizeTransaction(x, txn));
      transactionSummaryDAO.put(txnSummary);
    }
  }

  public List<Transaction> setupTxnListFromSet(X x, HashSet<String> txnIdSet) {
    DAO transactionDAO = (DAO) x.get("tableViewTransactionDAO");
    List<Transaction> txnList = new ArrayList<>();
    for ( String id : txnIdSet ) {
      Transaction txn = (Transaction) transactionDAO.find(id);
      txnList.add(txn);
    }
    return txnList;
  }

  public HashSet<String> setupTxnIdSet(X x, List txns) {
    HashSet<String> txnIdSet = new HashSet<String>();
    for ( int i = 0; i < txns.size(); i++ ) {
      Transaction txn = (Transaction) txns.get(i);
      Transaction summaryTxn = txn.findRoot(x);
      txnIdSet.add(summaryTxn.getId());
    }
    return txnIdSet;
  }

  public Date getLastRun(X x) {
    return ((Cron)((DAO)x.get("cronDAO")).find("TransactionSummaryAgent")).getLastRun();
  }

}
