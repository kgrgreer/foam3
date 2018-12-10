package net.nanopay.kotak;

import foam.core.ContextAgent;
import foam.core.Detachable;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.notification.Notification;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.kotak.model.paymentRequest.InitiateRequest;
import net.nanopay.kotak.model.paymentRequest.RequestHeaderType;
import net.nanopay.kotak.model.paymentResponse.Acknowledgement;
import net.nanopay.kotak.model.paymentResponse.AcknowledgementType;
import net.nanopay.kotak.model.paymentResponse.FaultListType;
import net.nanopay.kotak.model.paymentResponse.FaultType;
import net.nanopay.tx.KotakCOTransaction;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import java.util.*;

import static foam.mlang.MLang.*;

public class KotakPaymentProcessor implements ContextAgent {
  @Override
  public void execute(X x) {
    DAO    transactionDAO = (DAO) x.get("localTransactionDAO");
    DAO    bankAccountDAO = (DAO) x.get("localAccountDAO");
    DAO    userDAO        = (DAO) x.get("localUserDAO");
    Logger logger         = (Logger) x.get("logger");

    RequestHeaderType paymentHeader = new RequestHeaderType();
    String paymentMessageId = UUID.randomUUID().toString();
    paymentHeader.setMessageId(paymentMessageId);
    // todo: MsgSource is NANOPAY? need confirm with kotak
    paymentHeader.setMsgSource("NANOPAY");
    // todo: ClientCode is provided by kotak
    paymentHeader.setClientCode("TEMPTEST1");

    List<net.nanopay.kotak.model.paymentRequest.InstrumentType> instruments = new ArrayList<>();

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

          // todo: check it's B2B or P2P
          Boolean isP2P = true;

          kotakCOTxn.setKotakMsgId(paymentMessageId);

          // Instrument
          net.nanopay.kotak.model.paymentRequest.InstrumentType requestInstrument = new net.nanopay.kotak.model.paymentRequest.InstrumentType();

          requestInstrument.setMyProdCode("NETPAY");
          requestInstrument.setPaymentDt(kotakCOTxn.getCreated());
          // todo: Payee Bank IFSC Code.
          // requestInstrument.setRecBrCd();
          // todo: need check with kotak for BeneCode
          // requestInstrument.setBeneCode();
          requestInstrument.setBeneMb(payee.getPhoneNumber());
          requestInstrument.setBeneAddr1(payee.getAddress().getAddress());
          requestInstrument.setCountry("IN");
          requestInstrument.setState(payee.getAddress().getRegionId());
          requestInstrument.setTelephoneNo(payee.getPhoneNumber());
          requestInstrument.setChgBorneBy(kotakCOTxn.getChargeBorneBy());
          // todo: check if sentDate is a business date
          Date sentDate = new Date();
          requestInstrument.setInstDt(sentDate);
          kotakCOTxn.setSentDate(sentDate);

          if ( isP2P ) {
            // for P2P, use EndToEndIdentification received from pacs008, which is reference number
            requestInstrument.setInstRefNo(kotakCOTxn.getReferenceNumber());
            requestInstrument.setTxnAmnt((double) kotakCOTxn.getAmount());
            requestInstrument.setBeneAcctNo(String.valueOf(kotakCOTxn.getDestinationAccount()));
            requestInstrument.setBeneName(kotakCOTxn.getPayee().getFirstName() + " " + kotakCOTxn.getPayee().getLastName());
            requestInstrument.setBeneEmail(kotakCOTxn.getPayee().getEmail());
            requestInstrument.setPaymentRef(kotakCOTxn.getReferenceNumber());
          } else {
            if ( kotakCOTxn.getInvoiceId() != 0 ) {
              DAO     invoiceDAO    = (DAO) x.get("invoiceDAO");
              Invoice kotakInvoice  = (Invoice) invoiceDAO.find(kotakCOTxn.getInvoiceId());
              // for B2B, use the invoice number
              requestInstrument.setInstRefNo(kotakInvoice.getInvoiceNumber());
              requestInstrument.setTxnAmnt((double) kotakInvoice.getAmount());
              requestInstrument.setBeneAcctNo(String.valueOf(kotakInvoice.getDestinationAccount()));
              requestInstrument.setBeneName(kotakInvoice.getPayee().getFirstName() + " " + kotakInvoice.getPayee().getLastName());
              requestInstrument.setBeneEmail(kotakInvoice.getPayee().getEmail());
            }
          }
          kotakCOTxn.setInstRefNo(requestInstrument.getInstRefNo());

          instruments.add(requestInstrument);

          transactionDAO.put(kotakCOTxn);

        } catch (Exception e) {
          logger.error(e);
        }
      }
    });

    net.nanopay.kotak.model.paymentRequest.InstrumentListType instrumentList =
      new net.nanopay.kotak.model.paymentRequest.InstrumentListType();
    instrumentList.setInstrument((net.nanopay.kotak.model.paymentRequest.InstrumentType[]) instruments.toArray());

    // generate request
    InitiateRequest paymentRequest = new InitiateRequest();
    paymentRequest.setRequestHeader(paymentHeader);
    paymentRequest.setInstrumentList(instrumentList);

    // send request and parse response
    KotakService kotakService = new KotakService(x, "https://apigw.kotak.com:8443/cms_generic_service");
    AcknowledgementType response = kotakService.submitPayment(paymentRequest);

    Acknowledgement ackHeader = response.getAckHeader();
    net.nanopay.kotak.model.paymentResponse.InstrumentListType responseInstrumentList = response.getInstrumentList();
    FaultListType responseFaultList = response.getFaultList();

    String paymentResponseMsgId = ackHeader.getMessageId();
    String paymentResponseStatusCode = ackHeader.getStatusCd();
    String paymentResponseStatusRem = ackHeader.getStatusRem();

    List<net.nanopay.kotak.model.paymentResponse.InstrumentType> instList = Arrays.asList(responseInstrumentList.getInstrument());
    List<FaultType> faultList = Arrays.asList(responseFaultList.getFault());

    switch ( paymentResponseStatusCode ) {
      case "000": // All Instruments accepted Successfully
        setStatusToDeclinedOrCompleted(x, paymentResponseMsgId, paymentResponseStatusCode, paymentResponseStatusRem, instList, faultList);
        break;
      case "001": // XML Schema validation failed
        setStatusToFailed(x, paymentResponseMsgId, paymentResponseStatusCode, paymentResponseStatusRem, instList, faultList);
        sendNotification(x, "XML Schema validation failed. Correct XML and re-submit payments with a new Message ID. MessageId: " + paymentResponseMsgId);
        break;
      case "002": // Duplicate Message Id
        setStatusToFailed(x, paymentResponseMsgId, paymentResponseStatusCode, paymentResponseStatusRem, instList, faultList);
        sendNotification(x, "Duplicate Message Id. Correct the Message ID in XML and re-submit payment with the new Message ID. MessageId: " + paymentResponseMsgId);
        break;
      case "003": // Invalid Client Code
        setStatusToFailed(x, paymentResponseMsgId, paymentResponseStatusCode, paymentResponseStatusRem, instList, faultList);
        sendNotification(x, "Invalid Client Code. Correct the Client code in XML and re-submit payments with the new Client Code. MessageId: " + paymentResponseMsgId);
        break;
      case "004": // Duplicate Instrument Ref Number within Request
        setStatusToFailed(x, paymentResponseMsgId, paymentResponseStatusCode, paymentResponseStatusRem, instList, faultList);
        sendNotification(x, "Duplicate Instrument Ref Number within Request. Check if the payment has been accidentally sent twice or the EndtoEndID sent by Interac is duplicate. MessageId: " + paymentResponseMsgId);
        break;
      case "005": // Request Partially Accepted
        setStatusToDeclinedOrCompleted(x, paymentResponseMsgId, paymentResponseStatusCode, paymentResponseStatusRem, instList, faultList);
        sendNotification(x, "Request Partially Accepted. Check with Kotak Operations on the issue and resubmit the unaccepted payments with a new Message ID. MessageId: " + paymentResponseMsgId);
        break;
      case "008": // Invalid Web service consumer IP address
        setStatusToFailed(x, paymentResponseMsgId, paymentResponseStatusCode, paymentResponseStatusRem, instList, faultList);
        sendNotification(x, "Invalid Web service consumer IP address. Check with Kotak Operations on the issue and resubmit the payment with a new Message ID. MessageId: " + paymentResponseMsgId);
        break;
      case "009": // All Instruments rejected due to data validation failure
        setStatusToFailed(x, paymentResponseMsgId, paymentResponseStatusCode, paymentResponseStatusRem, instList, faultList);
        sendNotification(x, "All Instruments rejected due to data validation failure. Check with Kotak Operations on the issue and resubmit the payment with a new Message ID. MessageId: " + paymentResponseMsgId);
        break;
      case "010": // Default user not found for given client
        setStatusToFailed(x, paymentResponseMsgId, paymentResponseStatusCode, paymentResponseStatusRem, instList, faultList);
        sendNotification(x, "Default user not found for given client. Check with Kotak Operations on the issue and resubmit the payment with a new Message ID. MessageId: " + paymentResponseMsgId);
        break;
      case "011": // System encountered severe error. Please contact admin
        setStatusToFailed(x, paymentResponseMsgId, paymentResponseStatusCode, paymentResponseStatusRem, instList, faultList);
        sendNotification(x, "System encountered severe error. Please contact kotak admin. Check with Kotak Operations on the issue and resubmit the payment with a new Message ID. MessageId: " + paymentResponseMsgId);
        break;
    }
  }

  private void setStatusToDeclinedOrCompleted(X x,
                                              String paymentResponseMsgId,
                                              String paymentResponseStatusCode,
                                              String paymentResponseStatusRem,
                                              List<net.nanopay.kotak.model.paymentResponse.InstrumentType> instList,
                                              List<FaultType> faultList) {
    DAO transactionDAO = (DAO) x.get("localTransactionDAO");

    for ( int i = 0; i < instList.size(); i++ ) {
      net.nanopay.kotak.model.paymentResponse.InstrumentType responseInstrument = instList.get(i);
      FaultType fault = faultList.get(i);

      String instRefNo = responseInstrument.getInstRefNo();
      KotakCOTransaction kotakCOTxn = (KotakCOTransaction) transactionDAO.find(AND(
        EQ(KotakCOTransaction.KOTAK_MSG_ID, paymentResponseMsgId),
        EQ(KotakCOTransaction.INST_REF_NO, instRefNo)
      ));

      kotakCOTxn = (KotakCOTransaction) kotakCOTxn.fclone();

      String txnId = kotakCOTxn.getId();
      if ( responseInstrument.getInstStatusCd().equals("006") ) {
        kotakCOTxn.setStatus(TransactionStatus.DECLINED);
        sendNotification(x, "Instrument rejected due to data validation failure. TransactionId: " + txnId);
      } else if ( responseInstrument.getInstStatusCd().equals("007") ) {
        kotakCOTxn.setStatus(TransactionStatus.COMPLETED);
      }

      kotakCOTxn.setPaymentStatusCode(paymentResponseStatusCode);
      kotakCOTxn.setPaymentStatusRem(paymentResponseStatusRem);
      kotakCOTxn.setInstStatusCd(responseInstrument.getInstStatusCd());
      kotakCOTxn.setInstStatusRem(responseInstrument.getInstStatusRem());
      kotakCOTxn.setErrorList(responseInstrument.getErrorList().getError());
      kotakCOTxn.setErrorCode(fault.getCode());
      kotakCOTxn.setErrorReason(fault.getReason());
      kotakCOTxn.setInvalidFieldName(fault.getInvalidField());
      kotakCOTxn.setInvalidFieldValue(fault.getSubmittedFieldValue());

      transactionDAO.put(kotakCOTxn);
    }
  }

  private void setStatusToFailed(X x,
                                 String paymentResponseMsgId,
                                 String paymentResponseStatusCode,
                                 String paymentResponseStatusRem,
                                 List<net.nanopay.kotak.model.paymentResponse.InstrumentType> instList,
                                 List<FaultType> faultList) {
    DAO transactionDAO = (DAO) x.get("localTransactionDAO");

    for ( int i = 0; i < instList.size(); i++ ) {
      net.nanopay.kotak.model.paymentResponse.InstrumentType responseInstrument = instList.get(i);
      FaultType fault = faultList.get(i);

      String instRefNo = responseInstrument.getInstRefNo();
      KotakCOTransaction kotakCOTxn = (KotakCOTransaction) transactionDAO.find(AND(
        EQ(KotakCOTransaction.KOTAK_MSG_ID, paymentResponseMsgId),
        EQ(KotakCOTransaction.INST_REF_NO, instRefNo)
      ));

      kotakCOTxn = (KotakCOTransaction) kotakCOTxn.fclone();

      kotakCOTxn.setStatus(TransactionStatus.FAILED);

      kotakCOTxn.setPaymentStatusCode(paymentResponseStatusCode);
      kotakCOTxn.setPaymentStatusRem(paymentResponseStatusRem);
      kotakCOTxn.setInstStatusCd(responseInstrument.getInstStatusCd());
      kotakCOTxn.setInstStatusRem(responseInstrument.getInstStatusRem());
      kotakCOTxn.setErrorList(responseInstrument.getErrorList().getError());
      kotakCOTxn.setErrorCode(fault.getCode());
      kotakCOTxn.setErrorReason(fault.getReason());
      kotakCOTxn.setInvalidFieldName(fault.getInvalidField());
      kotakCOTxn.setInvalidFieldValue(fault.getSubmittedFieldValue());

      transactionDAO.put(kotakCOTxn);
    }
  }

  private void sendNotification(X x, String body) {
    Notification notification = new Notification.Builder(x)
      .setTemplate("KotakPayment")
      .setBody(body)
      .build();

    ((DAO) x.get("notificationDAO")).put(notification);
  }
}
