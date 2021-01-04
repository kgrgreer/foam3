package net.nanopay.kotak;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.INSTANCE_OF;

import java.util.Date;

import foam.core.ContextAgent;
import foam.core.Detachable;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.lib.json.OutputterMode;
import foam.nanos.auth.Address;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.notification.Notification;
import foam.util.SafetyUtil;
import net.nanopay.account.Account;
import net.nanopay.bank.CABankAccount;
import net.nanopay.bank.INBankAccount;
import net.nanopay.contacts.Contact;
import net.nanopay.kotak.model.paymentRequest.EnrichmentSetType;
import net.nanopay.kotak.model.paymentRequest.InstrumentListType;
import net.nanopay.kotak.model.paymentRequest.InstrumentType;
import net.nanopay.kotak.model.paymentRequest.Payment;
import net.nanopay.kotak.model.paymentRequest.RequestHeaderType;
import net.nanopay.kotak.model.paymentResponse.Acknowledgement;
import net.nanopay.kotak.model.paymentResponse.AcknowledgementType;
import net.nanopay.model.Business;
import net.nanopay.tx.KotakPaymentTransaction;
import net.nanopay.tx.TransactionEvent;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

public class KotakPaymentProcessor implements ContextAgent {
  @Override
  public void execute(X x) {
    DAO    transactionDAO = (DAO) x.get("localTransactionDAO");
    DAO    userDAO        = (DAO) x.get("localUserDAO");
    Logger logger         = (Logger) x.get("logger");
    KotakCredentials credentials = (KotakCredentials) x.get("kotakCredentials");

    transactionDAO
      .where(AND(
        INSTANCE_OF(KotakPaymentTransaction.class),
        EQ(Transaction.STATUS, TransactionStatus.PENDING)
      )).select(new AbstractSink() {
      @Override
      public void put(Object obj, Detachable sub) {
        try {
          KotakPaymentTransaction kotakTransaction = (KotakPaymentTransaction) ((KotakPaymentTransaction) obj).fclone();
          Transaction root = kotakTransaction.findRoot(x);
          kotakTransaction.getTransactionEvents(x).inX(x).put(new TransactionEvent.Builder(x).setEvent("Transaction picked up by KotakPaymentProcessor.").build());
          INBankAccount destinationBankAccount = getAccountById(x, kotakTransaction.getDestinationAccount());
          User payee = destinationBankAccount.findOwner(x);
          Account sourceBankAccount = root.findSourceAccount(x);
          Business payer = (Business) sourceBankAccount.findOwner(x);
          User signingOfficer = payer.findSigningOfficer(x);

          /**
           * Payment request Header
           */
          RequestHeaderType paymentHeader = new RequestHeaderType();
          String paymentMessageId = KotakUtils.getUniqueId();
          kotakTransaction.setKotakMsgId(paymentMessageId);
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
          kotakTransaction.setSentDate(sentDate);
          requestInstrument.setRecBrCd(destinationBankAccount.getIfscCode());
          requestInstrument.setInstRefNo(paymentMessageId);
          requestInstrument.setAccountNo(credentials.getRemitterAcNo());
          requestInstrument.setTxnAmnt( ((double) kotakTransaction.getAmount()) / 100.0);

          Address payeeAdd = getAddress(payee);

          requestInstrument.setBeneAcctNo(destinationBankAccount.getAccountNumber());
          requestInstrument.setBeneName(getName(payee).replaceAll("[^A-Za-z0-9]"," "));
          requestInstrument.setBeneMb(payee.getPhoneNumber());
          requestInstrument.setBeneAddr1(payeeAdd.getAddress().replaceAll("[^A-Za-z0-9]"," "));
          requestInstrument.setCountry(payer.getAddress().getCountryId());
          requestInstrument.setTelephoneNo(payee.getPhoneNumber());
          requestInstrument.setChgBorneBy(kotakTransaction.getChargeBorneBy());

          String beneACType   = destinationBankAccount.getBeneAccountType();

          String remitPurpose = kotakTransaction.getPurposeCode();
          String relationShip = kotakTransaction.getAccountRelationship().replaceAll("[^A-Za-z0-9]"," ");
          // Todo remove after all kotakpaymentTransactions have line items
          if ( SafetyUtil.isEmpty(remitPurpose) ) {
            remitPurpose = getPurposeText(destinationBankAccount.getPurposeCode());
          }
          if ( SafetyUtil.isEmpty(relationShip) ) {
            relationShip = destinationBankAccount.getAccountRelationship().replaceAll("[^A-Za-z0-9]"," ");
          }

          EnrichmentSetType type = new EnrichmentSetType();
          type.setEnrichment(new String[]{
            signingOfficer.getLegalName().replaceAll("[^A-Za-z0-9]"," ") + "~" +
            beneACType + "~" +
            payer.getAddress().getAddress().replaceAll("[^A-Za-z0-9]"," ") + "~" +
            payer.getId() + "~" +
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
          kotakTransaction.getTransactionEvents(x).inX(x).put(new TransactionEvent.Builder(x).setEvent("Kotak Xml Request: " + xmlOutputter.toString()).build());

          /**
           * Send request and parse the response
           */
          if ( credentials.getEnable() ) {
            KotakService kotakService = new KotakService(x);
            AcknowledgementType response = kotakService.submitPayment(paymentRequest);
            Acknowledgement ackHeader = response.getAckHeader();

            String paymentResponseStatusCode = ackHeader.getStatusCd();
            kotakTransaction.setPaymentStatusCode(paymentResponseStatusCode);
            kotakTransaction.getTransactionEvents(x).inX(x).put(new TransactionEvent.Builder(x).setEvent("paymentResponseStatusCode: " + paymentResponseStatusCode).build());

            String paymentResponseStatusRem = ackHeader.getStatusRem();
            kotakTransaction.setPaymentStatusRem(paymentResponseStatusRem);
            kotakTransaction.getTransactionEvents(x).inX(x).put(new TransactionEvent.Builder(x).setEvent("paymentResponseStatusRem: " + paymentResponseStatusRem).build());

            if ( paymentResponseStatusCode.equals("00") ) {
              kotakTransaction.setStatus(TransactionStatus.SENT);
            } else if ( paymentResponseStatusCode.equals("VAL_ERR") ) {
              kotakTransaction.setStatus(TransactionStatus.FAILED);
              kotakTransaction.getTransactionEvents(x).inX(x).put(new TransactionEvent.Builder(x).setEvent("Transaction Failed.").build());
              sendNotification(x, "Kotak payment initialization failed. TransactionId: " + kotakTransaction.getId() +
                ". Reason: " + kotakTransaction.getPaymentStatusRem() + ".", payer.getSpid());
            }

            transactionDAO.put(kotakTransaction);
          } else {
            kotakTransaction.getTransactionEvents(x).inX(x).put(new TransactionEvent.Builder(x).setEvent("Kotak is not enabled.").build());
          }

        } catch (Exception e) {
          logger.error(e);
        }
      }
    });
  }

  private void sendNotification(X x, String body, String spid) {
    Notification notification = new Notification.Builder(x)
      .setNotificationType(body)
      .setGroupId(spid + "-payment-ops")
      .build();

    ((DAO) x.get("localNotificationDAO")).put(notification);
  }

  public INBankAccount getAccountById(X x, String id) {
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
