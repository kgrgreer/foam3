package net.nanopay.kotak;

import foam.core.ContextAgent;
import foam.core.Detachable;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.lib.json.OutputterMode;
import foam.mlang.MLang;
import foam.nanos.auth.Address;
import foam.nanos.auth.Region;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.notification.Notification;
import foam.util.SafetyUtil;
import net.nanopay.account.Account;
import net.nanopay.bank.INBankAccount;
import net.nanopay.contacts.Contact;
import net.nanopay.kotak.model.paymentRequest.*;
import net.nanopay.kotak.model.paymentResponse.Acknowledgement;
import net.nanopay.kotak.model.paymentResponse.AcknowledgementType;
import net.nanopay.model.Business;
import net.nanopay.tx.KotakCOTransaction;
import net.nanopay.tx.TransactionEvent;
import net.nanopay.tx.bmo.BmoFormatUtil;
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
    KotakCredentials credentials = (KotakCredentials) x.get("kotakCredentials");

    transactionDAO
      .where(AND(
        INSTANCE_OF(KotakCOTransaction.class),
        EQ(Transaction.STATUS, TransactionStatus.PENDING)
      )).select(new AbstractSink() {
      @Override
      public void put(Object obj, Detachable sub) {
        try {
          KotakCOTransaction kotakCOTxn = (KotakCOTransaction) ((KotakCOTransaction) obj).fclone();
          kotakCOTxn.getTransactionEvents(x).inX(x).put(new TransactionEvent.Builder(x).setEvent("Transaction picked up by KotakPaymentProcessor.").build());
          INBankAccount destinationBankAccount = getAccountById(x, kotakCOTxn.getDestinationAccount());
          User payee = destinationBankAccount.findOwner(x);

          /**
           * Payment request Header
           */
          RequestHeaderType paymentHeader = new RequestHeaderType();
          String paymentMessageId = KotakUtils.getUniqueId();
          kotakCOTxn.setKotakMsgId(paymentMessageId);
          paymentHeader.setMessageId(paymentMessageId);
          paymentHeader.setBatchRefNmbr(paymentMessageId);
          paymentHeader.setMsgSource(credentials.getMsgSource());
          paymentHeader.setClientCode(credentials.getClientCode());

          /**
           * Payment request instruments section
           */
          net.nanopay.kotak.model.paymentRequest.InstrumentType requestInstrument = new net.nanopay.kotak.model.paymentRequest.InstrumentType();
          requestInstrument.setMyProdCode(credentials.getMyProdCode());
          requestInstrument.setPaymentDt(KotakUtils.getCurrentIndianDate());
          Date sentDate = new Date();
          kotakCOTxn.setSentDate(sentDate);
          requestInstrument.setRecBrCd(destinationBankAccount.getIfscCode());
          requestInstrument.setInstRefNo(paymentMessageId);
          requestInstrument.setAccountNo(credentials.getRemitterAcNo());
          requestInstrument.setTxnAmnt( ((double) kotakCOTxn.getAmount()) / 100.0);

          Address payeeAdd = getAddress(payee);

          requestInstrument.setBeneAcctNo(destinationBankAccount.getAccountNumber());
          requestInstrument.setBeneName(getName(payee));
          requestInstrument.setBeneMb(payee.getPhoneNumber());
          requestInstrument.setBeneAddr1(payeeAdd.getAddress());
          requestInstrument.setCountry(credentials.getRemitterCountry()); // this is the remitter country, it should be us.
          requestInstrument.setTelephoneNo(payee.getPhoneNumber());
          requestInstrument.setChgBorneBy(kotakCOTxn.getChargeBorneBy());

          String remitPurpose = getPurposeText(destinationBankAccount.getPurposeCode());
          String beneACType   = destinationBankAccount.getBeneAccountType();
          String relationShip = destinationBankAccount.getAccountRelationship().replace("/", " ");

          EnrichmentSetType type = new EnrichmentSetType();
          type.setEnrichment(new String[]{
            credentials.getRemitterName() + "~" +
            beneACType + "~" +
            credentials.getRemitterAddress() + "~" +
            credentials.getRemitterAcNo() + "~" +
            remitPurpose + "~~" +
            relationShip + "~"});
          requestInstrument.setEnrichmentSet(type);

          InstrumentListType instrumentList = new InstrumentListType();
          instrumentList.setInstrument(new InstrumentType[]{requestInstrument});

          /**
           * Init the request
           */
          Payment paymentRequest = new Payment();
          paymentRequest.setRequestHeader(paymentHeader);
          paymentRequest.setInstrumentList(instrumentList);

          KotakXMLOutputter xmlOutputter = new KotakXMLOutputter(OutputterMode.NETWORK);
          xmlOutputter.output(paymentRequest);
          kotakCOTxn.getTransactionEvents(x).inX(x).put(new TransactionEvent.Builder(x).setEvent("Kotak Xml Request: " + xmlOutputter.toString()).build());

          /**
           * Send request and parse the response
           */
          if ( credentials.getEnable() ) {
            KotakService kotakService = new KotakService(x);
            AcknowledgementType response = kotakService.submitPayment(paymentRequest);
            Acknowledgement ackHeader = response.getAckHeader();

            String paymentResponseStatusCode = ackHeader.getStatusCd();
            kotakCOTxn.setPaymentStatusCode(paymentResponseStatusCode);
            kotakCOTxn.getTransactionEvents(x).inX(x).put(new TransactionEvent.Builder(x).setEvent("paymentResponseStatusCode: " + paymentResponseStatusCode).build());

            String paymentResponseStatusRem = ackHeader.getStatusRem();
            kotakCOTxn.setPaymentStatusRem(paymentResponseStatusRem);
            kotakCOTxn.getTransactionEvents(x).inX(x).put(new TransactionEvent.Builder(x).setEvent("paymentResponseStatusRem: " + paymentResponseStatusRem).build());

            if ( paymentResponseStatusCode.equals("00") ) {
              kotakCOTxn.setStatus(TransactionStatus.SENT);
            } else if ( paymentResponseStatusCode.equals("VAL_ERR") ) {
              kotakCOTxn.setStatus(TransactionStatus.FAILED);
              kotakCOTxn.getTransactionEvents(x).inX(x).put(new TransactionEvent.Builder(x).setEvent("Transaction Failed.").build());
              sendNotification(x, "Kotak payment initialization failed. TransactionId: " + kotakCOTxn.getId() +
                ". Reason: " + kotakCOTxn.getPaymentStatusRem() + ".");
            }

            transactionDAO.put(kotakCOTxn);
          } else {
            kotakCOTxn.getTransactionEvents(x).inX(x).put(new TransactionEvent.Builder(x).setEvent("Kotak is not enabled.").build());
          }

        } catch (Exception e) {
          logger.error(e);
        }
      }
    });
  }

  private void sendNotification(X x, String body) {
    Notification notification = new Notification.Builder(x)
      .setNotificationType(body)
      .setGroupId("payment-ops")
      .setEmailIsEnabled(true)
      .build();

    ((DAO) x.get("localNotificationDAO")).put(notification);
  }

  public INBankAccount getAccountById(X x, long id) {
    DAO accountDAO = (DAO) x.get("localAccountDAO");

    Account account = (Account) accountDAO.inX(x).find(id);

    if ( ! (account instanceof INBankAccount) ) {
      throw new RuntimeException("Wrong bank account type");
    }

    return (INBankAccount) account;
  }

  public String getName(User user) {

    String displayName;

    if ( ! SafetyUtil.isEmpty(user.getBusinessName().trim()) ) {
      displayName = user.getBusinessName();
    } else if ( ! SafetyUtil.isEmpty(user.getOrganization().trim()) ) {
      displayName = user.getOrganization();
    } else {
      displayName = user.getFirstName() + " " + user.getLastName();
    }

    return displayName.length() > 40 ? displayName.substring(0, 40) : displayName;
  }

  public Address getAddress(User user) {
    Address address = null;

    if ( user instanceof Contact ) {
      address = ((Contact) user).getBusinessAddress();
    } else {
      address = user.getAddress();
    }

    return address;
  }

  public String getPurposeText(String purposeCode) {

    switch (purposeCode) {
      case "P0306":
        return "PAYMENTS_FOR_TRAVEL";

      case "P1306":
        return "TAX_PAYMENTS_IN_INDIA";

      case "P0011":
        return "EMI_PAYMENTS_FOR_REPAYMENT_OF_LOANS";

      case "P0103":
        return "ADVANCE_AGAINST_EXPORTS";

      default:
        return "TRADE_TRANSACTION";
    }
  }

}
