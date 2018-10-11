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
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.UUID;

import static foam.mlang.MLang.*;

public class KotakPaymentProcessor implements ContextAgent {

  @Override
  public void execute(X x) {

    DAO    transactionDAO = (DAO) x.get("localTransactionDAO");
    DAO    bankAccountDAO = (DAO) x.get("localAccountDAO");
    DAO    userDAO        = (DAO) x.get("localUserDAO");
    Logger logger         = (Logger) x.get("logger");

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

          // todo: check it's B2B or P2P
          Boolean isP2P = true;
          PaymentRequest paymentRequest = new PaymentRequest();

          // should be a unique 16 character reference
          // todo: use something like uuid
          String paymentMessageId = UUID.randomUUID().toString();
          paymentRequest.setMessageId(paymentMessageId);
          kotakCOTxn.setMessageId(paymentMessageId);

          // todo: NANOPAY? need confirm with kotak
          paymentRequest.setMsgSource("NANOPAY");

          // todo: provided by kotak
          paymentRequest.setClientCode("TEMPTEST1");

          // todo: Payee Bank IFSC Code.
          // BankAccount bankAccount = (BankAccount) bankAccountDAO.find(t.getDestinationAccount());
          // paymentRequest.setRecBrCd(bankAccount.getBranch());

          // todo: need check with kotak for BeneCode

          paymentRequest.setBeneMb(payee.getPhoneNumber());
          paymentRequest.setBeneAddr1(payee.getAddress().getAddress());
          paymentRequest.setTelephoneNo(payee.getPhoneNumber());
          paymentRequest.setChgBorneBy(kotakCOTxn.getChargeBorneBy());
          String sentDate = formatter.format(new Date());
          paymentRequest.setInstDt(sentDate);
          kotakCOTxn.setSentDate(sentDate);

          if ( isP2P ) {
            // for P2P, use EndToEndIdentification received from pacs008, which is reference number
            paymentRequest.setInstRefNo(kotakCOTxn.getReferenceNumber());
            paymentRequest.setTxnAmnt(kotakCOTxn.getAmount());
            paymentRequest.setPaymentDt(formatter.format(kotakCOTxn.getCreated()));
            paymentRequest.setBeneAcctNo(String.valueOf(kotakCOTxn.getDestinationAccount()));
            paymentRequest.setBeneName(kotakCOTxn.getPayee().getFirstName() + " " + kotakCOTxn.getPayee().getLastName());
            paymentRequest.setBeneEmail(kotakCOTxn.getPayee().getEmail());
            paymentRequest.setPaymentRef(kotakCOTxn.getReferenceNumber());
          } else {
            if ( kotakCOTxn.getInvoiceId() != 0 ) {
              DAO     invoiceDAO = (DAO) x.get("invoiceDAO");
              Invoice invoice    = (Invoice) invoiceDAO.find(kotakCOTxn.getInvoiceId());

              // for B2B, use the invoice number
              paymentRequest.setInstRefNo(invoice.getInvoiceNumber());
              paymentRequest.setTxnAmnt(invoice.getAmount());
              paymentRequest.setPaymentDt(formatter.format(invoice.getCreated()));
              paymentRequest.setBeneAcctNo(String.valueOf(invoice.getDestinationAccount()));
              paymentRequest.setBeneName(invoice.getPayee().getFirstName() + " " + invoice.getPayee().getLastName());
              paymentRequest.setBeneEmail(invoice.getPayee().getEmail());
            }
          }

          // send request to kotak, assume get the response
          PaymentResponse paymentResponse = new PaymentResponse();

          String txnId = kotakCOTxn.getId();
          String paymentStatusCode = paymentResponse.getStatusCd();
          switch ( paymentStatusCode ) {
            case "000":
              kotakCOTxn.setStatus(TransactionStatus.COMPLETED);
              break;
            case "001":
              kotakCOTxn.setStatus(TransactionStatus.FAILED);
              sendEmail(x, "Kotak Transaction - XML Schema validation failed",
                "Correct XML and re-submit payment with a new Message ID. TransactionId: " + txnId);
              break;
            case "002":
              kotakCOTxn.setStatus(TransactionStatus.FAILED);
              sendEmail(x, "Kotak Transaction - Duplicate Message Id",
                "Correct the Message ID in XML and re-submit payment with the new Message ID. TransactionId: " + txnId);
              break;
            case "003":
              kotakCOTxn.setStatus(TransactionStatus.FAILED);
              sendEmail(x, "Kotak Transaction - Invalid Client Code",
                "Correct the Client code in XML and re-submit payment with the new Client Code. TransactionId: " + txnId);
              break;
            case "004":
              kotakCOTxn.setStatus(TransactionStatus.FAILED);
              sendEmail(x, "Kotak Transaction - Duplicate Instrument Ref Number within Request",
                "Check if the payment has been accidentally sent twice or the EndtoEndID sent by Interac is duplicate. TransactionId: " + txnId);
              break;
            case "005":
              kotakCOTxn.setStatus(TransactionStatus.FAILED);
              sendEmail(x, "Kotak Transaction - Request Partially Accepted",
                "Check with Kotak Operations on the issue and resubmit the payment with a new Message ID. TransactionId: " + txnId);
              break;
            case "006":
              kotakCOTxn.setStatus(TransactionStatus.FAILED);
              sendEmail(x, "Kotak Transaction - Instrument rejected due to data validation failure",
                "Check with Kotak Operations on the issue and resubmit the payment with a new Message ID. TransactionId: " + txnId);
              break;
            case "007":
              kotakCOTxn.setStatus(TransactionStatus.SENT);
              sendEmail(x, "Kotak Transaction - Instrument validated successfully",
                "Check with Kotak Operations if it can be marked as complete. TransactionId: " + txnId);
              break;
            case "008":
              kotakCOTxn.setStatus(TransactionStatus.FAILED);
              sendEmail(x, "Kotak Transaction - Invalid Web service consumer IP address",
                "Check with Kotak Operations on the issue and resubmit the payment with a new Message ID. TransactionId: " + txnId);
              break;
            case "009":
              kotakCOTxn.setStatus(TransactionStatus.FAILED);
              sendEmail(x, "Kotak Transaction - All Instruments rejected due to data validation failure",
                "Check with Kotak Operations on the issue and resubmit the payment with a new Message ID. TransactionId: " + txnId);
              break;
            case "010":
              kotakCOTxn.setStatus(TransactionStatus.FAILED);
              sendEmail(x, "Kotak Transaction - Default user not found for given client",
                "Check with Kotak Operations on the issue and resubmit the payment with a new Message ID. TransactionId: " + txnId);
              break;
            case "011":
              kotakCOTxn.setStatus(TransactionStatus.FAILED);
              sendEmail(x, "Kotak Transaction - System encountered severe error. Please contact kotak admin",
                "Check with Kotak Operations on the issue and resubmit the payment with a new Message ID. TransactionId: " + txnId);
              break;
          }


          kotakCOTxn.setPaymentStatusCode(paymentStatusCode);
          kotakCOTxn.setPaymentStatusRem(paymentResponse.getStatusRem());
          kotakCOTxn.setInstRefNo(paymentResponse.getInstRefNo());
          kotakCOTxn.setInstStatusCd(paymentResponse.getInstStatusCd());
          kotakCOTxn.setInstStatusRem(paymentResponse.getInstStatusRem());
          kotakCOTxn.setError(paymentResponse.getError());
          kotakCOTxn.setErrorCode(paymentResponse.getCode());
          kotakCOTxn.setErrorReason(paymentResponse.getReason());
          kotakCOTxn.setInvalidFieldName(paymentResponse.getInvalidField());
          kotakCOTxn.setInvalidFieldValue(paymentResponse.getSubmittedFieldValue());

          transactionDAO.put(kotakCOTxn);
        } catch (Exception e) {
          logger.error(e);
        }
      }
    });
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
