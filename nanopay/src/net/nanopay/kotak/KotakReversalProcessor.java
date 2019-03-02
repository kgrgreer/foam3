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
import net.nanopay.tx.KotakCOTransaction;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import static foam.mlang.MLang.*;

public class KotakReversalProcessor implements ContextAgent {

  @Override
  public void execute(X x) {
    DAO    transactionDAO = (DAO) x.get("localTransactionDAO");
    Logger logger         = (Logger) x.get("logger");

    // Header
    HeaderType reversalHeader = new HeaderType();
    String reversalMsgId = UUID.randomUUID().toString();
    reversalHeader.setReq_Id(reversalMsgId);
    // todo: NANOPAY? need confirm with kotak
    reversalHeader.setMsg_Src("NANOPAY");
    // todo: ClientCode will be provided by kotak
    reversalHeader.setClient_Code("TEMPTEST1");
    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
    reversalHeader.setDate_Post(sdf.format(new Date()));

    // Details
    DetailsType details = new DetailsType();
    List<String> msgIdList = new ArrayList<>();

    transactionDAO
      .where(AND(
        INSTANCE_OF(KotakCOTransaction.class),
        EQ(Transaction.STATUS, TransactionStatus.DECLINED)
      )).select(new AbstractSink() {
      @Override
      public void put(Object obj, Detachable sub) {
        try {
          KotakCOTransaction kotakCOTxn = (KotakCOTransaction) ((KotakCOTransaction) obj).fclone();

          msgIdList.add(kotakCOTxn.getKotakMsgId());

          kotakCOTxn.setReversalReqId(reversalMsgId);
          transactionDAO.put(kotakCOTxn);
        } catch (Exception e) {
          logger.error(e);
        }
      }
    });

    details.setMsg_Id((String[]) msgIdList.toArray());

    // generate request
    Reversal reversalRequest = new Reversal();
    reversalRequest.setHeader(reversalHeader);
    reversalRequest.setDetails(details);

    // send request and parse response
    KotakService kotakService = new KotakService(x, "https://apigw.kotak.com:8443/cms_generic_service");
    Reversal reversalResponse = kotakService.submitReversal(reversalRequest);

    HeaderType responseHeader = reversalResponse.getHeader();

    Rev_DetailType[] revDetails = reversalResponse.getDetails().getRev_Detail();
    for ( Rev_DetailType revDetail : revDetails ) {
      String msgId = revDetail.getMsg_Id();
      String statusCode = revDetail.getStatus_Code();
      String statusDesc = revDetail.getStatus_Desc();
      String utr = revDetail.getUTR();

      KotakCOTransaction kotakCOTxn = (KotakCOTransaction) transactionDAO.find(
        EQ(KotakCOTransaction.KOTAK_MSG_ID, msgId));

      kotakCOTxn = (KotakCOTransaction) kotakCOTxn.fclone();

      kotakCOTxn.setReversalStatusCode(statusCode);
      kotakCOTxn.setReversalStatusDesc(statusDesc);
      kotakCOTxn.setUTRNumber(utr);

      transactionDAO.put(kotakCOTxn);

      switch ( statusCode ) {
        case "C":
          // Reversal Request received by Kotak
          // todo: change reversal transaction status to sent
          break;
        case "U":
          // Reversal Request completed. Got Paid
          // todo: change reversal transaction status to completed
          break;
        case "RE":
          sendNotification(x, "Reversal Transaction Rejected. TransactionId: " + kotakCOTxn.getId() + ", kotakMsgId: " + msgId);
          break;
        case "AR":
          sendNotification(x, "Auth Rejected. TransactionId: " + kotakCOTxn.getId() + ", kotakMsgId: " + msgId);
          break;
        case "DF":
          sendNotification(x, "Funds Insufficient. TransactionId: " + kotakCOTxn.getId() + ", kotakMsgId: " + msgId);
          break;
        case "Error-101":
          sendNotification(x, "Data Not Found. TransactionId: " + kotakCOTxn.getId() + ", kotakMsgId: " + msgId);
          break;
        case "Error-99":
          sendNotification(x, "Transaction is in Progress. TransactionId: " + kotakCOTxn.getId() + ", kotakMsgId: "
            + msgId + ". Check with Kotak Operations on the status.");
          break;
        case "CR":
          sendNotification(x, "Activation Date Should Not Be Less Then Application Date. TransactionId: "
            + kotakCOTxn.getId() + ", kotakMsgId: " + msgId + ". Resend the reversal request with the correct dates.");
          break;
        case "UP":
          sendNotification(x, "Transaction Timeout 91. TransactionId: " + kotakCOTxn.getId() + ", kotakMsgId: "
            + msgId + ". Check with Kotak Operations on the status and resend transaction.");
          break;
        case "CF":
          sendNotification(x, "162 Account Does Not Exist. TransactionId: " + kotakCOTxn.getId() + ", kotakMsgId: " + msgId);
          break;
      }
    }
  }

  private void sendNotification(X x, String body) {
    Notification notification = new Notification.Builder(x)
      .setTemplate("KotakReversal")
      .setBody(body)
      .build();

    ((DAO) x.get("notificationDAO")).put(notification);
  }
}
