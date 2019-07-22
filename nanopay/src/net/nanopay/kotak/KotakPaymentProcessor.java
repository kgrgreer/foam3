package net.nanopay.kotak;

import foam.core.ContextAgent;
import foam.core.Detachable;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.notification.Notification;
import net.nanopay.kotak.model.paymentRequest.Payment;
import net.nanopay.kotak.model.paymentRequest.RequestHeaderType;
import net.nanopay.kotak.model.paymentResponse.Acknowledgement;
import net.nanopay.kotak.model.paymentResponse.AcknowledgementType;
import net.nanopay.tx.KotakCOTransaction;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import static foam.mlang.MLang.*;

public class KotakPaymentProcessor implements ContextAgent {
  @Override
  public void execute(X x) {
    DAO    transactionDAO = (DAO) x.get("localTransactionDAO");
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
          User payee = (User) userDAO.find(EQ(User.ID, kotakCOTxn.getPayeeId()));

          RequestHeaderType paymentHeader = new RequestHeaderType();
          String paymentMessageId = KotakUtils.getUniqueId();
          kotakCOTxn.setKotakMsgId(paymentMessageId);
          paymentHeader.setMessageId(paymentMessageId);
          paymentHeader.setBatchRefNmbr(paymentMessageId);
          paymentHeader.setMsgSource("NANOPAY");
          paymentHeader.setClientCode("TESTAPI");

          List<net.nanopay.kotak.model.paymentRequest.InstrumentType> instruments = new ArrayList<>();
          net.nanopay.kotak.model.paymentRequest.InstrumentType requestInstrument = new net.nanopay.kotak.model.paymentRequest.InstrumentType();
          requestInstrument.setMyProdCode("NETPAY");
          requestInstrument.setPaymentDt(KotakUtils.getCurrentIndianDate());
          Date sentDate = new Date();
          kotakCOTxn.setSentDate(sentDate);
          requestInstrument.setRecBrCd(kotakCOTxn.getIFSCCode());
          requestInstrument.setInstRefNo(paymentMessageId);
          requestInstrument.setAccountNo(String.valueOf(kotakCOTxn.getSourceAccount()));
          requestInstrument.setTxnAmnt((double) kotakCOTxn.getAmount());

          requestInstrument.setBeneAcctNo(String.valueOf(kotakCOTxn.getDestinationAccount()));
          requestInstrument.setBeneName(kotakCOTxn.getPayee().getFirstName() + " " + kotakCOTxn.getPayee().getLastName());
          requestInstrument.setBeneEmail(kotakCOTxn.getPayee().getEmail());
          requestInstrument.setBeneMb(payee.getPhoneNumber());
          requestInstrument.setBeneAddr1(payee.getAddress().getAddress());
          requestInstrument.setCountry("IN");
          requestInstrument.setState(payee.getAddress().getRegionId());
          requestInstrument.setTelephoneNo(payee.getPhoneNumber());
          requestInstrument.setChgBorneBy(kotakCOTxn.getChargeBorneBy());

          instruments.add(requestInstrument);

          net.nanopay.kotak.model.paymentRequest.InstrumentListType instrumentList =
            new net.nanopay.kotak.model.paymentRequest.InstrumentListType();
          instrumentList.setInstrument((net.nanopay.kotak.model.paymentRequest.InstrumentType[]) instruments.toArray());

          // generate request
          Payment paymentRequest = new Payment();
          paymentRequest.setRequestHeader(paymentHeader);
          paymentRequest.setInstrumentList(instrumentList);

          // send request and parse response
          KotakService kotakService = new KotakService(x);

          AcknowledgementType response = kotakService.submitPayment(paymentRequest);

          Acknowledgement ackHeader = response.getAckHeader();

          String paymentResponseStatusCode = ackHeader.getStatusCd();
          kotakCOTxn.setPaymentStatusCode(paymentResponseStatusCode);

          String paymentResponseStatusRem = ackHeader.getStatusRem();
          kotakCOTxn.setPaymentStatusRem(paymentResponseStatusRem);

          if ( paymentResponseStatusCode.equals("00") ) {
            kotakCOTxn.setStatus(TransactionStatus.SENT);
          } else if ( paymentResponseStatusCode.equals("VAL_ERR") ) {
            kotakCOTxn.setStatus(TransactionStatus.FAILED);
            sendNotification(x, "Kotak payment initialization failed. TransactionId: " + kotakCOTxn.getId() +
              ". Reason: " + kotakCOTxn.getPaymentStatusRem() + ".");
          }

          transactionDAO.put(kotakCOTxn);

        } catch (Exception e) {
          logger.error(e);
        }
      }
    });
  }

  private void sendNotification(X x, String body) {
    Notification notification = new Notification.Builder(x)
      .setTemplate("KotakPayment")
      .setBody(body)
      .build();

    ((DAO) x.get("localNotificationDAO")).put(notification);
  }
}
