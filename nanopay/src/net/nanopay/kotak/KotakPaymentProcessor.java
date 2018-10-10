package net.nanopay.kotak;

import foam.core.ContextAgent;
import foam.core.Detachable;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
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
          Boolean isB2B = true;
          PaymentRequest paymentRequest = new PaymentRequest();

          // should be a unique 16 character reference
          // todo: use something like uuid
          String messageId = UUID.randomUUID().toString();
          paymentRequest.setMessageId(messageId);
          kotakCOTxn.setMessageId(messageId);

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
          paymentRequest.setInstDt(formatter.format(new Date()));

          if ( isB2B ) {
            // for B2B, use EndToEndIdentification received from pacs008, which is reference number
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

              // for p2p, use the invoice number
              paymentRequest.setInstRefNo(invoice.getInvoiceNumber());
              paymentRequest.setTxnAmnt(invoice.getAmount());
              paymentRequest.setPaymentDt(formatter.format(invoice.getCreated()));
              paymentRequest.setBeneAcctNo(String.valueOf(invoice.getDestinationAccount()));
              paymentRequest.setBeneName(invoice.getPayee().getFirstName() + " " + invoice.getPayee().getLastName());
              paymentRequest.setBeneEmail(invoice.getPayee().getEmail());
              paymentRequest.setInstDt(formatter.format(new Date()));
            }
          }

          // send request to kotak, assume get the response
          PaymentResponse paymentResponse = new PaymentResponse();

          kotakCOTxn.setStatusCode(paymentResponse.getStatusCd());
          kotakCOTxn.setStatusRem(paymentResponse.getStatusRem());
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
}
