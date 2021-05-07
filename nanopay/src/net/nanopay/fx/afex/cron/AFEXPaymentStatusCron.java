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

package net.nanopay.fx.afex.cron;

import foam.core.ContextAgent;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.logger.Logger;

import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;

import net.nanopay.fx.afex.AFEXFundingTransaction;
import net.nanopay.fx.afex.AFEXServiceProvider;
import net.nanopay.fx.afex.AFEXTransaction;
import net.nanopay.fx.afex.CreateTradeResponse;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import static foam.mlang.MLang.*;



public class AFEXPaymentStatusCron implements ContextAgent {


  @Override
  public void execute(X x) {
    Logger logger = (Logger) x.get("logger");
    DAO transactionDAO = (DAO) x.get("localTransactionDAO");
    DAO traderesponseDAO = (DAO) x.get("afexTradeResponseDAO");
    AFEXServiceProvider afexServiceProvider = (AFEXServiceProvider) x.get("afexServiceProvider");
    
    ArraySink sink = (ArraySink) transactionDAO
    .where(
      AND(
          EQ(Transaction.STATUS, TransactionStatus.SENT),
          OR(
            INSTANCE_OF(AFEXTransaction.class),
            INSTANCE_OF(AFEXFundingTransaction.class)
          )
        )
      )
    .select(new ArraySink());
    List<AFEXTransaction> pendingTransactions = sink.getArray();
    for (AFEXTransaction transaction : pendingTransactions) {
      try{
        LocalDateTime now = LocalDateTime.now();
        if ( transaction.getCompletionDate() != null ) {
          LocalDateTime completionDate =  LocalDateTime.ofInstant(transaction.getCompletionDate().toInstant(), ZoneId.systemDefault());
          if ( now.isAfter(completionDate) ) {
            transactionDAO.put(afexServiceProvider.updatePaymentStatus(transaction));
          }
       } else {
         // Check trade response value date for date
         CreateTradeResponse response = (CreateTradeResponse) traderesponseDAO.find(EQ(CreateTradeResponse.TRADE_NUMBER,transaction.getAfexTradeResponseNumber()));
         try {
           Date valueDate = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss").parse(response.getValueDate());
           LocalDateTime completionDate =  LocalDateTime.ofInstant(valueDate.toInstant(), ZoneId.systemDefault());
           if ( now.isAfter(completionDate) ) {
             transactionDAO.put(afexServiceProvider.updatePaymentStatus(transaction));
           }
         } catch (Exception e){
           // error parsing value date so check the status now
           transactionDAO.put(afexServiceProvider.updatePaymentStatus(transaction));
         }
       }
      } catch(Throwable t){
        logger.error("Error fetching status for transaction: " + transaction.getId(), t);
      }

    }
  }
}
