package net.nanopay.kotak;

import foam.core.ContextAgent;
import foam.core.Detachable;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.notification.email.EmailMessage;
import foam.nanos.notification.email.EmailService;
import net.nanopay.kotak.schemas.cms_generic.reversal_request.Details;
import net.nanopay.kotak.schemas.cms_generic.reversal_request.Header;
import net.nanopay.kotak.xmlns.cms_generic_service.CMSGenericService;
import net.nanopay.kotak.xmlns.cms_generic_service.WebAPI;
import net.nanopay.tx.KotakCOTransaction;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import javax.xml.ws.Holder;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import static foam.mlang.MLang.*;

public class KotakReversalProcessor implements ContextAgent {

  @Override
  public void execute(X x) {

    DAO    transactionDAO = (DAO) x.get("localTransactionDAO");
    DAO    bankAccountDAO = (DAO) x.get("localAccountDAO");
    DAO    userDAO        = (DAO) x.get("localUserDAO");
    Logger logger         = (Logger) x.get("logger");

    CMSGenericService cmsGenericService = new CMSGenericService();
    WebAPI webAPI = cmsGenericService.getCMSGenericWebAPI();

    // reversal request header
    Header requestHeader = new Header();

    String reversalMessageId = UUID.randomUUID().toString();
    requestHeader.setReqId(reversalMessageId);
    // todo: NANOPAY? need confirm with kotak
    requestHeader.setMsgSrc("NANOPAY");
    // todo: ClientCode is provided by kotak
    requestHeader.setClientCode("TEMPTEST1");

    Date now = new Date();
    SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");
    requestHeader.setDatePost(formatter.format(now));

    Details details = new Details();

    transactionDAO
      .where(AND(
        INSTANCE_OF(KotakCOTransaction.class),
        EQ(Transaction.STATUS, TransactionStatus.CANCELLED)
      )).select(new AbstractSink() {
      @Override
      public void put(Object obj, Detachable sub) {
        try {
          KotakCOTransaction kotakCOTxn = (KotakCOTransaction) ((KotakCOTransaction) obj).fclone();
          User payee = (User) userDAO.find(EQ(User.ID, kotakCOTxn.getPayee().getId()));

          details.getMsgId().add(kotakCOTxn.getKotakMsgId());

          // transactionDAO.put(kotakCOTxn);
        } catch (Exception e) {
          logger.error(e);
        }
      }
    });

    Holder<net.nanopay.kotak.schemas.cms_generic.reversal_response.Header> responseHeader = new Holder<>();
    Holder<net.nanopay.kotak.schemas.cms_generic.reversal_response.Details> responseDetails = new Holder<>();

    // send request to kotak, assume get the response
    webAPI.reversal(requestHeader, details, responseHeader, responseDetails);

    String reversalResponseReqId = responseHeader.value.getReqId();
    String reversalResponseMsgSrc = responseHeader.value.getMsgSrc();
    String reversalResponseClientCode = responseHeader.value.getClientCode();
    String reversalResponseDatePost = responseHeader.value.getDatePost();


    List<net.nanopay.kotak.schemas.cms_generic.reversal_response.RevDetail> revDetailList =
      responseDetails.value.getRevDetail();

    for ( int i = 0; i < revDetailList.size(); i++ ) {
      String msgId = revDetailList.get(i).getMsgId();
      String statusCode = revDetailList.get(i).getStatusCode();
      String statusDesc = revDetailList.get(i).getStatusDesc();
      String utr = revDetailList.get(i).getUTR();



      KotakCOTransaction kotakCOTxn = (KotakCOTransaction) transactionDAO.find(AND(
        EQ(KotakCOTransaction.KOTAK_MSG_ID, msgId)
        //EQ(KotakCOTransaction.INST_REF_NO, instRefNo)
      ));

      kotakCOTxn.setReversalStatusCode(statusCode);
      kotakCOTxn.setReversalStatusDesc(statusDesc);
      kotakCOTxn.setUTRNumber(utr);

      switch ( statusCode ) {
        case "RE":
          // todo
          break;
        case "AR":
          // todo
          break;
        case "DF":
          // todo
          break;
        case "Error-101":
          // todo
          break;
        case "Error-99":
          // todo
          break;
        case "CR":
          // todo
          break;
        case "C":
          // todo
          break;
        case "UP":
          // todo
          break;
        case "U":
          // todo
          break;
        case "CF":
          // todo
          break;
      }

    }

  }

  public static void sendEmail(X x, String subject, String content) {
    EmailService emailService = (EmailService) x.get("email");
    EmailMessage message = new EmailMessage();

    message.setTo(new String[]{"zac@nanopay.net"});
    message.setSubject(subject);
    message.setBody(content);
    emailService.sendEmail(message);
  }
}
