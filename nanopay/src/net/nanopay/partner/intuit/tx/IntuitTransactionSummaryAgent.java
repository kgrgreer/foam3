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
import foam.mlang.MLang;
import foam.mlang.predicate.Predicate;
import foam.nanos.cron.Cron;
import java.util.*;

import net.nanopay.ticket.RefundStatus;
import net.nanopay.ticket.RefundTicket;
import net.nanopay.tx.ChainSummary;
import net.nanopay.tx.FeeSummaryTransaction;
import net.nanopay.tx.FeeSummaryTransactionLineItem;
import net.nanopay.tx.SummarizingTransaction;
import net.nanopay.tx.bmo.cico.BmoVerificationTransaction;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.cron.TransactionSummaryAgent;
import net.nanopay.tx.model.TransactionStatus;

import static foam.mlang.MLang.*;

public class IntuitTransactionSummaryAgent extends TransactionSummaryAgent {
  String spid;
  public IntuitTransactionSummaryAgent(String spid) {
    super(spid);
    this.spid = spid;
  }

  @Override
  public void execute(X x) {
    DAO summaryTransactionDAO = (DAO) x.get("summaryTransactionDAO");
    DAO transactionDAO = (DAO) x.get("localTransactionDAO");
    Date lastRun = getLastRun(x);

    if ( lastRun != null ) {
      Predicate predicate = AND(
        GT(Transaction.LAST_MODIFIED, lastRun),
        EQ(Transaction.SPID, spid),
        NOT(INSTANCE_OF(net.nanopay.tx.creditengine.CreditCodeTransaction.getOwnClassInfo())),
        NOT(INSTANCE_OF(net.nanopay.tx.FeeSummaryTransaction.getOwnClassInfo())),
        NOT(INSTANCE_OF(BmoVerificationTransaction.getOwnClassInfo()))
      );
      generateTransactionSummaries(x, predicate, transactionDAO);

    } else {
      Predicate predicate = AND(
        EQ(Transaction.SPID, spid),
        NOT(INSTANCE_OF(net.nanopay.tx.creditengine.CreditCodeTransaction.getOwnClassInfo())),
        NOT(INSTANCE_OF(BmoVerificationTransaction.getOwnClassInfo()))
      );
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

      FeeSummaryTransactionLineItem feeLineItem = null;
      if ( txn.getLineItems().length > 0 ) {
        for ( var li : txn.getLineItems() ) {
          if ( li instanceof FeeSummaryTransactionLineItem ) {
            feeLineItem = (FeeSummaryTransactionLineItem) li;
            break;
          }
        }
      }

      IntuitTransactionSummary intuitTxnSummary;
      if ( txn instanceof FeeSummaryTransaction ) {
        intuitTxnSummary = new IntuitFeeTransactionSummary();
        intuitTxnSummary.setAssociate(txn.getAssociateTransaction());
      } else {
        intuitTxnSummary = new IntuitTransactionSummary();
        if ( (((ArraySink) txn.getAssociatedTransactions(x).select(new ArraySink())).getArray()).size() > 0 )
          intuitTxnSummary.setAssociate(((Transaction) ((((ArraySink) txn.getAssociatedTransactions(x).select(new ArraySink())).getArray()).get(0))).getId());
      }
      intuitTxnSummary.setId(txn.getId());
      intuitTxnSummary.setCurrency(txn.getSourceCurrency());
      intuitTxnSummary.setAmount(txn.getAmount());
      intuitTxnSummary.setStatus(chainSummary.getStatus());
      intuitTxnSummary.setCategory(chainSummary.getCategory());
      intuitTxnSummary.setErrorCode(chainSummary.getErrorCode());
      intuitTxnSummary.setErrorInfo(chainSummary.getErrorInfo());
      if ( intuitTxnSummary.getErrorCode() != 0  && intuitTxnSummary.getStatus() == TransactionStatus.PENDING) {
        intuitTxnSummary.setStatusDetail("Retry in progress");
      } else if ( intuitTxnSummary.getStatus() == TransactionStatus.PAUSED ) {
        intuitTxnSummary.setStatusDetail("Cancelation in progress");
      } else {
        intuitTxnSummary.setStatusDetail("");
      }
      intuitTxnSummary.setCreated(txn.getCreated());
      intuitTxnSummary.setLastModified(txn.getLastModified());
      intuitTxnSummary.setExternalId(txn.getExternalId() != null ? txn.getExternalId() : "");
      intuitTxnSummary.setExternalInvoiceId(txn.getExternalInvoiceId() != null ? txn.getExternalInvoiceId() : "");
      if (txn.getPayer() != null) intuitTxnSummary.setPayer(txn.getPayer().getId());
      if (txn.getPayee() != null) intuitTxnSummary.setPayee(txn.getPayee().getId());
      if (feeLineItem != null) intuitTxnSummary.setFee(feeLineItem.getTotalFee());
      intuitTxnSummary.setSummary(intuitTxnSummary.summarizeTransaction(x, txn));

      // Update status to paused if there is a ticket that is waiting for a sent transaction to complete
      DAO ticketDAO = (DAO) x.get("refundTicketDAO");
      ArraySink sink = new ArraySink();
      ticketDAO.where(MLang.AND(
        MLang.EQ(RefundTicket.REFUND_STATUS, RefundStatus.WAITING),
        MLang.EQ(RefundTicket.REFUND_TRANSACTION, txn.getId())
      )).select(sink);
      if ( sink.getArray().size() > 0 ) {
        intuitTxnSummary.setStatus(TransactionStatus.PAUSED);
      }

      transactionSummaryDAO.put(intuitTxnSummary);
    }
  }

  @Override
  public Date getLastRun(X x) {
    return ((Cron)((DAO)x.get("cronDAO")).find("IntuitTransactionSummaryAgent")).getLastRun();
  }

}
