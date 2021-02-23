/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
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
package net.nanopay.partner.treviso.cron;

import foam.core.ContextAgent;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.logger.Logger;

import java.util.Calendar;
import java.util.List;

import net.nanopay.partner.treviso.tx.TrevisoTransaction;
import net.nanopay.partner.treviso.TrevisoService;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import static foam.mlang.MLang.*;

public class TrevisoTransactionStatusCron implements ContextAgent {

  @Override
  public void execute(X x) {
    Logger logger = (Logger) x.get("logger");
    DAO transactionDAO = (DAO) x.get("localTransactionDAO");
    TrevisoService trevisoService = (TrevisoService) x.get("trevisoService");

    ArraySink sink = (ArraySink) transactionDAO
      .where(
        AND(
          EQ(Transaction.STATUS, TransactionStatus.SENT),
          INSTANCE_OF(TrevisoTransaction.class)
        )
      )
      .select(new ArraySink());
    List<Transaction> pendingTransactions = sink.getArray();

    Calendar currentDate = Calendar.getInstance();
    for (Transaction transaction : pendingTransactions) {
      try{
        Calendar txnCompletionDate = Calendar.getInstance();
        if ( transaction.getCompletionDate() != null ) {
          txnCompletionDate.setTime(transaction.getCompletionDate());
          if ( txnCompletionDate.get(Calendar.DAY_OF_YEAR) <= currentDate.get(Calendar.DAY_OF_YEAR) ) {
            transaction = (Transaction) transaction.fclone();
            transactionDAO.put(trevisoService.updateTransactionStatus(transaction));
          }
        }
      } catch(Throwable t){
        logger.error("Error fetching status for transaction: " + transaction.getId(), t);
      }

    }
  }
}
