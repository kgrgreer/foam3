package net.nanopay.meter.report.test;

/*
 * This test is used to alert that when the predicate structure is changed, corresponding changes for predicates check
 * in various reports may have to be made also.
 */

import foam.core.X;
import foam.dao.*;
import foam.mlang.predicate.*;
import foam.nanos.auth.User;
import foam.nanos.ruler.RuleGroup;
import net.nanopay.account.DigitalAccount;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.bank.CABankAccount;
import net.nanopay.meter.report.PaymentReport;
import net.nanopay.meter.report.RejectedTransactionReport;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import java.util.Date;
import static foam.mlang.MLang.*;

public class ReportPredicateTest extends foam.nanos.test.Test {
  DAO txnDAO;
  DAO accDAO;
  DAO userDAO;
  User sender;
  User receiver;
  CABankAccount sender_CA;
  CABankAccount receiver_CA;
  DigitalAccount sender_Dig;
  DigitalAccount receiver_Dig;

  public void runTest(X x) {
    DAO ruleGroupDAO = (DAO) x.get("ruleGroupDAO");
    DAO paymentReportDAO = (DAO) x.get("paymentReportDAO");
    DAO rejectedTransactionReportDAO = (DAO) x.get("rejectedTransactionReportDAO");

    txnDAO = (DAO) x.get("localTransactionDAO");
    accDAO = (DAO) x.get("localAccountDAO");
    userDAO = (DAO) x.get("localUserDAO");

    sender = addUser(x, "reportPredicateTest1@transactiontest.ca");
    receiver = addUser(x, "reportPredicateTest2@transactiontest.ca");

    setup();
    RuleGroup alterna = (RuleGroup) ruleGroupDAO.find("AlternaPlanner").fclone();
    RuleGroup bmo = (RuleGroup) ruleGroupDAO.find("BMOPlanner").fclone();
    alterna.setEnabled(false);
    bmo.setEnabled(true);
    ruleGroupDAO.put(alterna);
    ruleGroupDAO.put(bmo);

    Transaction txn = new Transaction();
    txn.setAmount(1000000);
    txn.setCreated(new Date());
    txn.setSourceAccount(sender_CA.getId());
    txn.setDestinationAccount(sender_Dig.getId());
    txn = (Transaction) txnDAO.put(txn).fclone();
    txn.setStatus(TransactionStatus.COMPLETED);
    txnDAO.put(txn);


    txn = new Transaction();
    txn.setCreated(new Date());
    txn.setStatus(TransactionStatus.DECLINED);
    txn.setAmount(333);
    txn.setPayeeId(receiver.getId());
    txn.setPayerId(sender.getId());
    txn = (Transaction) txnDAO.put(txn).fclone();

    try {
      ArraySink sink1 = (ArraySink) paymentReportDAO.select(new ArraySink());
      test(sink1 != null, "The basic predicate for PaymentReport has no error");
    } catch (Exception e) {
      test(false, "The basic predicate for PaymentReport is not the right structure");
    }

    try {
      ArraySink sink1 = (ArraySink) rejectedTransactionReportDAO.select(new ArraySink());
      test(sink1 != null, "The basic predicate for RejectedTransactionReport has no error");
    } catch (Exception e) {
      test(false, "The basic predicate for RejectedTransactionReport is not the right structure");
    }

    try {
      ArraySink sink2 = (ArraySink) paymentReportDAO
        .where(
            AND(
              GT(PaymentReport.DATE_RANGE, new Date()),
              LT(PaymentReport.DATE_RANGE, new Date())
            )).select(new ArraySink());
      test(sink2 != null, "The advanced predicate for PaymentReport has no error");
    } catch (Exception e) {
      test(false, "The advanced predicate for PaymentReport is not the right structure");
    }

    try {
      ArraySink sink2 = (ArraySink) rejectedTransactionReportDAO
        .where(
            AND(
              GT(RejectedTransactionReport.DATE_RANGE, new Date()),
              LT(RejectedTransactionReport.DATE_RANGE, new Date())
            )).select(new ArraySink());
      test(sink2 != null, "The advanced predicate for RejectedTransactionReport has no error");
    } catch (Exception e) {
      test(false, "The advanced predicate for RejectedTransactionReport is not the right structure");
    }

  }

  public void setup() {
    sender_CA = (CABankAccount) (accDAO.find(
      AND(
        EQ(CABankAccount.OWNER, sender.getId()),
        INSTANCE_OF(CABankAccount.class)))).fclone();
    sender_Dig = (DigitalAccount) (accDAO.find(
      AND(
        EQ(DigitalAccount.OWNER, sender.getId()),
        INSTANCE_OF(DigitalAccount.class)))).fclone();

    receiver_CA = (CABankAccount) (accDAO.find(
      AND(
        EQ(CABankAccount.OWNER, receiver.getId()),
        INSTANCE_OF(CABankAccount.class)))).fclone();
    receiver_Dig = (DigitalAccount) (accDAO.find(
      AND(
        EQ(DigitalAccount.OWNER, receiver.getId()),
        INSTANCE_OF(DigitalAccount.class)))).fclone();
  }

  private User addUser(X x, String email) {
    User user;
    DigitalAccount dAcc1;
    CABankAccount bank;

    user = (User) userDAO.inX(x).find(EQ(User.EMAIL, email));
    if ( user == null ) {
      user = new User();
      user.setEmail(email);
      user.setFirstName("Francis");
      user.setLastName("Filth");
      user.setEmailVerified(true);
      user.setGroup("business");
      user.setSpid("test");
      user = (User) userDAO.put(user);
      user = (User) user.fclone();
    }

    dAcc1 = (DigitalAccount) accDAO.inX(x).find(
      AND(
        EQ(DigitalAccount.OWNER, user.getId()),
        EQ(DigitalAccount.DENOMINATION, "CAD"),
        INSTANCE_OF(DigitalAccount.class)));
    if ( dAcc1 == null ) {
      dAcc1 = new DigitalAccount();
      dAcc1.setOwner(user.getId());
      dAcc1.setDenomination("CAD");
      accDAO.put(dAcc1);
    }

    bank = (CABankAccount) accDAO.inX(x).find(
      AND(
        EQ(CABankAccount.OWNER, user.getId()),
        INSTANCE_OF(CABankAccount.class)));

    if ( bank == null ) {
      bank = new CABankAccount();
      bank.setStatus(BankAccountStatus.VERIFIED);
      bank.setAccountNumber("12345678");
      bank.setInstitutionNumber("123");
      bank.setBranchId("12334");
      bank.setOwner(user.getId());
      accDAO.put(bank);
    }

    return user;
  }

}
