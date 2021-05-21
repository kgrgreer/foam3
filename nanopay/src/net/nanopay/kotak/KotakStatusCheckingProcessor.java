package net.nanopay.kotak;

import foam.core.ContextAgent;
import foam.core.Detachable;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.nanos.logger.Logger;
import foam.nanos.notification.Notification;
import net.nanopay.kotak.model.reversal.DetailsType;
import net.nanopay.kotak.model.reversal.HeaderType;
import net.nanopay.kotak.model.reversal.Rev_DetailType;
import net.nanopay.kotak.model.reversal.Reversal;
import net.nanopay.tx.KotakPaymentTransaction;
import net.nanopay.tx.TransactionEvent;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import static foam.mlang.MLang.*;

public class KotakStatusCheckingProcessor implements ContextAgent {

  @Override
  public void execute(X x) {
    DAO    transactionDAO = (DAO) x.get("localTransactionDAO");
    Logger logger         = (Logger) x.get("logger");
    KotakCredentials credentials = (KotakCredentials) x.get("kotakCredentials");

    transactionDAO
      .where(AND(
        INSTANCE_OF(KotakPaymentTransaction.class),
        EQ(Transaction.STATUS, TransactionStatus.SENT)
      )).select(new AbstractSink() {
      @Override
      public void put(Object obj, Detachable sub) {

        getStatus(x, ((KotakPaymentTransaction) obj));

      }
    });
  }

  public void getStatus(X x, KotakPaymentTransaction kotakCOTxn) {
    DAO    transactionDAO = (DAO) x.get("localTransactionDAO");
    Logger logger         = (Logger) x.get("logger");
    KotakCredentials credentials = (KotakCredentials) x.get("kotakCredentials");

    kotakCOTxn = (KotakPaymentTransaction) ((KotakPaymentTransaction) kotakCOTxn).fclone();

    try {

      // Header
      HeaderType reversalHeader = new HeaderType();
      String queryReqId = KotakUtils.getUniqueId();
      reversalHeader.setReq_Id(queryReqId);
      kotakCOTxn.setQueryReqId(queryReqId);
      reversalHeader.setMsg_Src(credentials.getMsgSource());
      reversalHeader.setClient_Code(credentials.getClientCode());
      reversalHeader.setDate_Post(KotakUtils.getCurrentIndianDate());

      // Details
      DetailsType details = new DetailsType();
      details.setMsg_Id(new String[]{kotakCOTxn.getKotakMsgId()});

      // generate request
      Reversal request = new Reversal();
      request.setHeader(reversalHeader);
      request.setDetails(details);

      // send request and parse response
      KotakService kotakService = new KotakService(x);
      Reversal response = kotakService.submitReversal(request);

      kotakCOTxn.getTransactionEvents(x).inX(x).put(new TransactionEvent.Builder(x).setEvent("Checking status.").build());

      Rev_DetailType[] revDetails = response.getDetails().getRev_Detail();

      if ( revDetails.length == 1 ) {
        String statusCode = revDetails[0].getStatus_Code();
        kotakCOTxn.setQueryStatusCode(statusCode);

        String statusDesc = revDetails[0].getStatus_Desc();
        kotakCOTxn.setQueryStatusDesc(statusDesc);

        String utr = revDetails[0].getUTR();
        kotakCOTxn.setUTRNumber(utr);

        String spid = kotakCOTxn.getSpid();

        switch ( statusCode ) {
          case "Txn_Successful":
            kotakCOTxn.setStatus(TransactionStatus.COMPLETED);
            break;
          case "Txn_Failed": // Transaction Failed or IFT For Payment Hub Error
            kotakCOTxn.setStatus(TransactionStatus.DECLINED);
            sendNotification(x, "Kotak payment failed. TransactionId: " + kotakCOTxn.getId() + ". Reason: " + statusDesc + ".", spid);
            break;
          case "Txn_Rejected": // Transaction rejected by bank due to compliance
            kotakCOTxn.setStatus(TransactionStatus.DECLINED);
            sendNotification(x, "Kotak payment rejected. TransactionId: " + kotakCOTxn.getId() + ". Reason: " + statusDesc + ".", spid);
            break;
          case "Txn_Under Process": // Transaction is in process from banks end
            // todo: add operation for this when we designed the workflow
            kotakCOTxn.getTransactionEvents(x).inX(x).put(new TransactionEvent.Builder(x).setEvent("Txn_Under Process.").build());
            break;
          case "Txn_Hold": // Transaction kept on hold by bank
            // todo: add operation for this when we designed the workflow
            kotakCOTxn.getTransactionEvents(x).inX(x).put(new TransactionEvent.Builder(x).setEvent("Txn_Hold.").build());
            sendNotification(x, "Kotak payment on hold. TransactionId: " + kotakCOTxn.getId() + ". Reason: " + statusDesc + ".", spid);
            break;
          case "Txn_Not_Found": // Transaction Not Found
            // todo: add operation for this when we designed the workflow
            kotakCOTxn.getTransactionEvents(x).inX(x).put(new TransactionEvent.Builder(x).setEvent("Txn_Not_Found.").build());
            sendNotification(x, "Kotak payment not found. TransactionId: " + kotakCOTxn.getId() + ". Reason: " + statusDesc + ".", spid);
            break;
          case "System Error": // Some exceptions in processing
            // todo: add operation for this when we designed the workflow
            kotakCOTxn.getTransactionEvents(x).inX(x).put(new TransactionEvent.Builder(x).setEvent("System Error.").build());
            sendNotification(x, "System error has occurred for a Kotak payment. TransactionId: " + kotakCOTxn.getId() + ". Reason: " + statusDesc + ".", spid);
            break;
        }
      }

      transactionDAO.put(kotakCOTxn);

    } catch (Exception e) {
      logger.error(e);
    }
  }

  private void sendNotification(X x, String body, String spid) {
    Notification notification = new Notification.Builder(x)
      .setNotificationType(body)
      .setGroupId(spid + "-payment-ops")
      .build();

    ((DAO) x.get("localNotificationDAO")).put(notification);
  }
}
