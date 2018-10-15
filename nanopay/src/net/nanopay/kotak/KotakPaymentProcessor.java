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
import net.nanopay.invoice.model.Invoice;
import net.nanopay.kotak.schemas.cms_generic.payment_request.InstrumentListType;
import net.nanopay.kotak.schemas.cms_generic.payment_request.InstrumentType;
import net.nanopay.kotak.schemas.cms_generic.payment_request.RequestHeaderType;
import net.nanopay.kotak.schemas.cms_generic.payment_response.Acknowledgement;
import net.nanopay.kotak.schemas.cms_generic.payment_response.FaultListType;
import net.nanopay.kotak.schemas.cms_generic.payment_response.FaultType;
import net.nanopay.kotak.xmlns.cms_generic_service.CMSGenericService;
import net.nanopay.kotak.xmlns.cms_generic_service.WebAPI;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import javax.xml.datatype.DatatypeFactory;
import javax.xml.datatype.XMLGregorianCalendar;
import javax.xml.ws.Holder;
import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.List;
import java.util.UUID;

import static foam.mlang.MLang.*;

public class KotakPaymentProcessor implements ContextAgent {

  @Override
  public void execute(X x) {
    DAO transactionDAO = (DAO) x.get("localTransactionDAO");
    DAO    bankAccountDAO = (DAO) x.get("localAccountDAO");
    DAO    userDAO        = (DAO) x.get("localUserDAO");
    Logger logger         = (Logger) x.get("logger");

    CMSGenericService cmsGenericService = new CMSGenericService();
    WebAPI webAPI = cmsGenericService.getCMSGenericWebAPI();

    // requestHeader
    RequestHeaderType requestHeader = new RequestHeaderType();
    // should be a unique 16 character reference
    // todo: use something like uuid
    String paymentMessageId = UUID.randomUUID().toString();
    requestHeader.setMessageId(paymentMessageId);

    // todo: NANOPAY? need confirm with kotak
    requestHeader.setMsgSource("NANOPAY");
    // todo: ClientCode is provided by kotak
    requestHeader.setClientCode("TEMPTEST1");

    // InstrumentList
    InstrumentListType requestInstrumentList = new InstrumentListType();

    transactionDAO
      .where(AND(
        INSTANCE_OF(KotakCOTransaction.class),
        EQ(Transaction.STATUS, TransactionStatus.PENDING)
      )).select(new AbstractSink() {
      @Override
      public void put(Object obj, Detachable sub) {
        try {
          KotakCOTransaction kotakCOTxn = (KotakCOTransaction) ((KotakCOTransaction) obj).fclone();
          User payee = (User) userDAO.find(EQ(User.ID, kotakCOTxn.getPayee().getId()));

          SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");
          GregorianCalendar gcal = new GregorianCalendar();

          // todo: check it's B2B or P2P
          Boolean isP2P = true;

          kotakCOTxn.setKotakMsgId(paymentMessageId);

          // Instrument
          InstrumentType requestInstrument = new InstrumentType();

          requestInstrument.setMyProdCode("NETPAY");
          // todo: time format
          gcal.setTime(kotakCOTxn.getCreated());
          XMLGregorianCalendar paymentDate = DatatypeFactory.newInstance().newXMLGregorianCalendar(gcal);
          requestInstrument.setPaymentDt(paymentDate);
          // todo: Payee Bank IFSC Code.
          // requestInstrument.setRecBrCd();
          // BankAccount bankAccount = (BankAccount) bankAccountDAO.find(t.getDestinationAccount());
          // paymentRequest.setRecBrCd(bankAccount.getBranch());
          // todo: need check with kotak for BeneCode
          // requestInstrument.setBeneCode();
          requestInstrument.setBeneMb(payee.getPhoneNumber());
          requestInstrument.setBeneAddr1(payee.getAddress().getAddress());
          requestInstrument.setCountry("IN");
          requestInstrument.setState(payee.getAddress().getRegionId());
          requestInstrument.setTelephoneNo(payee.getPhoneNumber());
          requestInstrument.setChgBorneBy(kotakCOTxn.getChargeBorneBy());
          Date sentDate = new Date();
          gcal.setTime(sentDate);
          XMLGregorianCalendar date = DatatypeFactory.newInstance().newXMLGregorianCalendar(gcal);
          requestInstrument.setInstDt(date);
          kotakCOTxn.setSentDate(sentDate);
          if (isP2P) {
            // for P2P, use EndToEndIdentification received from pacs008, which is reference number
            requestInstrument.setInstRefNo(kotakCOTxn.getReferenceNumber());
            requestInstrument.setTxnAmnt(BigDecimal.valueOf(kotakCOTxn.getAmount()));
            requestInstrument.setBeneAcctNo(String.valueOf(kotakCOTxn.getDestinationAccount()));
            requestInstrument.setBeneName(kotakCOTxn.getPayee().getFirstName() + " " + kotakCOTxn.getPayee().getLastName());
            requestInstrument.setBeneEmail(kotakCOTxn.getPayee().getEmail());
            requestInstrument.setPaymentRef(kotakCOTxn.getReferenceNumber());
          } else {
            if ( kotakCOTxn.getInvoiceId() != 0 ) {
              DAO     invoiceDAO = (DAO) x.get("invoiceDAO");
              Invoice kotakInvoice    = (Invoice) invoiceDAO.find(kotakCOTxn.getInvoiceId());
              // for B2B, use the invoice number
              requestInstrument.setInstRefNo(kotakInvoice.getInvoiceNumber());
              requestInstrument.setTxnAmnt(BigDecimal.valueOf(kotakInvoice.getAmount()));
              requestInstrument.setBeneAcctNo(String.valueOf(kotakInvoice.getDestinationAccount()));
              requestInstrument.setBeneName(kotakInvoice.getPayee().getFirstName() + " " + kotakInvoice.getPayee().getLastName());
              requestInstrument.setBeneEmail(kotakInvoice.getPayee().getEmail());
            }
          }
          kotakCOTxn.setInstRefNo(requestInstrument.getInstRefNo());
          requestInstrumentList.getInstrument().add(requestInstrument);

          transactionDAO.put(kotakCOTxn);

        } catch (Exception e) {
          logger.error(e);
        }
      }
    });

    Holder<Acknowledgement> ackHeader = new Holder<>();
    Holder<net.nanopay.kotak.schemas.cms_generic.payment_response.InstrumentListType> responseInstrumentList = new Holder<>();
    Holder<FaultListType> responseFaultList = new Holder<>();

    // send payment request to kotak
    webAPI.payment(requestHeader, requestInstrumentList, ackHeader, responseInstrumentList, responseFaultList);

    String paymentResponseMessageId = ackHeader.value.getMessageId();
    String paymentResponseStatusCode = ackHeader.value.getStatusCd();
    String paymentResponseStatusRem = ackHeader.value.getStatusRem();

    List<net.nanopay.kotak.schemas.cms_generic.payment_response.InstrumentType> instList =
      responseInstrumentList.value.getInstrument();

    List<FaultType> faultList = responseFaultList.value.getFault();

    switch ( paymentResponseStatusCode ) {
      case "000": // All Instruments accepted Successfully
        setStatusToDeclinedOrCompleted(x, paymentResponseMessageId, paymentResponseStatusCode, paymentResponseStatusRem, instList, faultList);
        break;
      case "001": // XML Schema validation failed
        setStatusToFailed(x, paymentResponseMessageId, paymentResponseStatusCode, paymentResponseStatusRem, instList, faultList);
        sendEmail(x, "Kotak Transaction - XML Schema validation failed",
          "Correct XML and re-submit payments with a new Message ID. MessageId: " + paymentResponseMessageId);
        break;
      case "002": // Duplicate Message Id
        setStatusToFailed(x, paymentResponseMessageId, paymentResponseStatusCode, paymentResponseStatusRem, instList, faultList);
        sendEmail(x, "Kotak Transaction - Duplicate Message Id",
          "Correct the Message ID in XML and re-submit payment with the new Message ID. MessageId: " + paymentResponseMessageId);
        break;
      case "003": // Invalid Client Code
        setStatusToFailed(x, paymentResponseMessageId, paymentResponseStatusCode, paymentResponseStatusRem, instList, faultList);
        sendEmail(x, "Kotak Transaction - Invalid Client Code",
          "Correct the Client code in XML and re-submit payments with the new Client Code. MessageId: " + paymentResponseMessageId);
        break;
      case "004": // Duplicate Instrument Ref Number within Request
        setStatusToFailed(x, paymentResponseMessageId, paymentResponseStatusCode, paymentResponseStatusRem, instList, faultList);
        sendEmail(x, "Kotak Transaction - Duplicate Instrument Ref Number within Request",
          "Check if the payment has been accidentally sent twice or the EndtoEndID sent by Interac is duplicate. MessageId: " + paymentResponseMessageId);
        break;
      case "005": // Request Partially Accepted
        setStatusToDeclinedOrCompleted(x, paymentResponseMessageId, paymentResponseStatusCode, paymentResponseStatusRem, instList, faultList);
        sendEmail(x, "Kotak Transaction - Request Partially Accepted",
          "Check with Kotak Operations on the issue and resubmit the unaccepted payments with a new Message ID. MessageId: " + paymentResponseMessageId);
        break;
      case "008": // Invalid Web service consumer IP address
        setStatusToFailed(x, paymentResponseMessageId, paymentResponseStatusCode, paymentResponseStatusRem, instList, faultList);
        sendEmail(x, "Kotak Transaction - Invalid Web service consumer IP address",
          "Check with Kotak Operations on the issue and resubmit the payment with a new Message ID. MessageId: " + paymentResponseMessageId);
        break;
      case "009": // All Instruments rejected due to data validation failure
        setStatusToFailed(x, paymentResponseMessageId, paymentResponseStatusCode, paymentResponseStatusRem, instList, faultList);
        sendEmail(x, "Kotak Transaction - All Instruments rejected due to data validation failure",
          "Check with Kotak Operations on the issue and resubmit the payment with a new Message ID. MessageId: " + paymentResponseMessageId);
        break;
      case "010": // Default user not found for given client
        setStatusToFailed(x, paymentResponseMessageId, paymentResponseStatusCode, paymentResponseStatusRem, instList, faultList);
        sendEmail(x, "Kotak Transaction - Default user not found for given client",
          "Check with Kotak Operations on the issue and resubmit the payment with a new Message ID. MessageId: " + paymentResponseMessageId);
        break;
      case "011": // System encountered severe error. Please contact admin
        setStatusToFailed(x, paymentResponseMessageId, paymentResponseStatusCode, paymentResponseStatusRem, instList, faultList);
        sendEmail(x, "Kotak Transaction - System encountered severe error. Please contact kotak admin",
          "Check with Kotak Operations on the issue and resubmit the payment with a new Message ID. MessageId: " + paymentResponseMessageId);
        break;
    }
  }

  private void setStatusToDeclinedOrCompleted(X x,
                                              String paymentResponseMessageId,
                                              String paymentResponseStatusCode,
                                              String paymentResponseStatusRem,
                                              List<net.nanopay.kotak.schemas.cms_generic.payment_response.InstrumentType> instList,
                                              List<FaultType> faultList) {
    DAO transactionDAO = (DAO) x.get("localTransactionDAO");

    for ( int i = 0; i < instList.size(); i++ ) {
      net.nanopay.kotak.schemas.cms_generic.payment_response.InstrumentType responseInstrument = instList.get(i);
      FaultType fault = faultList.get(i);

      String instRefNo = responseInstrument.getInstRefNo();
      KotakCOTransaction kotakCOTxn = (KotakCOTransaction) transactionDAO.find(AND(
        EQ(KotakCOTransaction.KOTAK_MSG_ID, paymentResponseMessageId),
        EQ(KotakCOTransaction.INST_REF_NO, instRefNo)
      ));

      kotakCOTxn = (KotakCOTransaction) kotakCOTxn.fclone();

      String txnId = kotakCOTxn.getId();
      if ( responseInstrument.getInstStatusCd().equals("006") ) {
        kotakCOTxn.setStatus(TransactionStatus.DECLINED);
        sendEmail(x, "Instrument rejected due to data validation failure", "TransactionId: " + txnId);
      } else if ( responseInstrument.getInstStatusCd().equals("007") ) {
        kotakCOTxn.setStatus(TransactionStatus.COMPLETED);
      }

      kotakCOTxn.setPaymentStatusCode(paymentResponseStatusCode);
      kotakCOTxn.setPaymentStatusRem(paymentResponseStatusRem);
      kotakCOTxn.setInstStatusCd(responseInstrument.getInstStatusCd());
      kotakCOTxn.setInstStatusRem(responseInstrument.getInstStatusRem());
      kotakCOTxn.setErrorList(responseInstrument.getErrorList().getError().toArray(new String[]{}));
      kotakCOTxn.setErrorCode(fault.getCode());
      kotakCOTxn.setErrorReason(fault.getReason());
      kotakCOTxn.setInvalidFieldName(fault.getInvalidField());
      kotakCOTxn.setInvalidFieldValue(fault.getSubmittedFieldValue());

      transactionDAO.put(kotakCOTxn);
    }
  }

  private void setStatusToFailed(X x,
                                 String paymentResponseMessageId,
                                 String paymentResponseStatusCode,
                                 String paymentResponseStatusRem,
                                 List<net.nanopay.kotak.schemas.cms_generic.payment_response.InstrumentType> instList,
                                 List<FaultType> faultList) {
    DAO transactionDAO = (DAO) x.get("localTransactionDAO");

    for ( int i = 0; i < instList.size(); i++ ) {
      net.nanopay.kotak.schemas.cms_generic.payment_response.InstrumentType responseInstrument = instList.get(i);
      FaultType fault = faultList.get(i);

      String instRefNo = responseInstrument.getInstRefNo();
      KotakCOTransaction kotakCOTxn = (KotakCOTransaction) transactionDAO.find(AND(
        EQ(KotakCOTransaction.KOTAK_MSG_ID, paymentResponseMessageId),
        EQ(KotakCOTransaction.INST_REF_NO, instRefNo)
      ));

      kotakCOTxn = (KotakCOTransaction) kotakCOTxn.fclone();

      kotakCOTxn.setStatus(TransactionStatus.FAILED);

      kotakCOTxn.setPaymentStatusCode(paymentResponseStatusCode);
      kotakCOTxn.setPaymentStatusRem(paymentResponseStatusRem);
      kotakCOTxn.setInstStatusCd(responseInstrument.getInstStatusCd());
      kotakCOTxn.setInstStatusRem(responseInstrument.getInstStatusRem());
      kotakCOTxn.setErrorList(responseInstrument.getErrorList().getError().toArray(new String[]{}));
      kotakCOTxn.setErrorCode(fault.getCode());
      kotakCOTxn.setErrorReason(fault.getReason());
      kotakCOTxn.setInvalidFieldName(fault.getInvalidField());
      kotakCOTxn.setInvalidFieldValue(fault.getSubmittedFieldValue());

      transactionDAO.put(kotakCOTxn);
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
