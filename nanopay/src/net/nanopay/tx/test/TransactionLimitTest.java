package net.nanopay.tx.test;


import foam.core.X;
import foam.dao.DAO;
import foam.dao.MDAO;
import foam.dao.SequenceNumberDAO;
import foam.nanos.ruler.Operations;
import foam.nanos.ruler.RulerDAO;
import foam.nanos.ruler.RulerProbe;
import foam.nanos.ruler.TestedRule;
import foam.nanos.test.Test;
import foam.test.TestUtils;
import net.nanopay.account.DigitalAccount;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.bank.CABankAccount;
import net.nanopay.tx.ruler.AccountTransactionLimitRule;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;
import net.nanopay.tx.ruler.TransactionLimitProbeInfo;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.INSTANCE_OF;

public class TransactionLimitTest extends Test {

  DigitalAccount sender_, receiver_;
  CABankAccount senderBank_;
  AccountTransactionLimitRule rule;

  public void runTest(X x) {
    createAccounts(x);
    populateSenderAccount(x);
    DAO ruleDAO = new SequenceNumberDAO(new MDAO(foam.nanos.ruler.Rule.getOwnClassInfo()));
    x = x.put("ruleDAO", ruleDAO);
    DAO txnDAO = (DAO) x.get("localTransactionDAO");
    txnDAO = new RulerDAO(x, txnDAO, "transactionDAO");
    createRule(x);
    x = x.put("localTransactionDAO", txnDAO);
    testTransactionLimitProbe(x);
    testRule(x);
    testUpdatedRule(x);
  }

  public void testTransactionLimitProbe(X x) {
    DAO txDAO = (DAO) x.get("localTransactionDAO");
    Transaction tx = new Transaction();
    tx.setAmount(5000L);
    tx.setSourceAccount(sender_.getId());
    tx.setDestinationAccount(receiver_.getId());
    RulerProbe probe = new RulerProbe();
    probe.setObject(tx);
    probe.setOperation(Operations.CREATE);
    probe = (RulerProbe) txDAO.cmd_(x, probe);
    TestedRule txRule = null;
    for ( TestedRule testedRule : probe.getAppliedRules() ) {
      if ( testedRule.getName() == "transactionLimits" ) {
        txRule = testedRule;
        break;
      }
    }
    test(((TransactionLimitProbeInfo)txRule.getProbeInfo()).getRemainingLimit() == 10000, "Remaining limit is 10000");
    test(txRule != null, "Probe for transaction limit was found");
    test(txRule.getPassed(), "Transaction is to go through successfully");
    System.out.println(txRule.getMessage());

    tx.setAmount(20000L);
    probe.clearAppliedRules();
    probe = (RulerProbe) txDAO.cmd_(x, probe);
    for ( TestedRule testedRule : probe.getAppliedRules() ) {
      if ( testedRule.getName() == "transactionLimits" ) {
        txRule = testedRule;
        break;
      }
    }
    test(((TransactionLimitProbeInfo)txRule.getProbeInfo()).getRemainingLimit() == 10000, "Remaining limit is 10000");
    test(! txRule.getPassed(), "Transaction fails to go through because of the limit.");

  }

  public void testRule(X x) {
    DAO txDAO = (DAO) x.get("localTransactionDAO");
    Transaction tx = new Transaction();
    tx.setAmount(9990L);
    tx.setSourceAccount(sender_.getId());
    tx.setDestinationAccount(receiver_.getId());
    tx = (Transaction) txDAO.put_(x, tx);
    test(tx instanceof Transaction, "transaction for 9990 went though successfully. Limit is 10000");

    Transaction tx2 = new Transaction();
    tx2.setAmount(20L);
    tx2.setSourceAccount(sender_.getId());
    tx2.setDestinationAccount(receiver_.getId());
    test(TestUtils.testThrows(
      () -> txDAO.put_(x, tx2),
      "Your limit is exceeded",
      RuntimeException.class), "next transaction for 100L throws exception");

    Transaction tx3 = new Transaction();
    tx3.setAmount(10L);
    tx3.setSourceAccount(sender_.getId());
    tx3.setDestinationAccount(receiver_.getId());
    tx3 = (Transaction) txDAO.put_(x, tx3);
    test(tx3 instanceof Transaction, "transaction for 10 went though successfully. Limit is 10000");
  }

  public void testUpdatedRule(X x) {
    AccountTransactionLimitRule r = (AccountTransactionLimitRule) ((DAO) x.get("ruleDAO")).find(rule);
    r.setLimit(20000L);
    r = (AccountTransactionLimitRule) ((DAO) x.get("ruleDAO")).put(r);
    DAO txDAO = (DAO) x.get("localTransactionDAO");

    Transaction tx = new Transaction();
    tx.setAmount(10000L);
    tx.setSourceAccount(sender_.getId());
    tx.setDestinationAccount(receiver_.getId());
    txDAO.put_(x, tx);
    test(tx instanceof Transaction, "transaction for 10000 went though successfully after limit was updated to 20000");
  }

  public void createAccounts(X x) {
    DigitalAccount sender = new DigitalAccount();
    sender.setOwner(1L);
    sender.setDenomination("CAD");
    sender_ = (DigitalAccount) ((DAO) x.get("localAccountDAO")).put(sender);

    DigitalAccount receiver = new DigitalAccount();
    receiver.setOwner(1L);
    receiver.setDenomination("CAD");
    receiver_ = (DigitalAccount) ((DAO) x.get("localAccountDAO")).put(receiver);

    senderBank_ = (CABankAccount) ((DAO)x.get("localAccountDAO")).find(AND(EQ(CABankAccount.OWNER, 1L), INSTANCE_OF(CABankAccount.class)));
    if ( senderBank_ == null ) {
      senderBank_ = new CABankAccount();
      senderBank_.setAccountNumber("2131412443534534");
      senderBank_.setOwner(1L);
    } else {
      senderBank_ = (CABankAccount)senderBank_.fclone();
    }
    senderBank_.setStatus(BankAccountStatus.VERIFIED);
    senderBank_ = (CABankAccount) ((DAO)x.get("localAccountDAO")).put_(x, senderBank_).fclone();
  }

  public void populateSenderAccount(X x) {
    Transaction tx = new Transaction();
    tx.setAmount(10000000000L);
    tx.setSourceAccount(senderBank_.getId());
    tx.setDestinationAccount(sender_.getId());
    tx = (Transaction) ((DAO) x.get("localTransactionDAO")).put_(x, tx).fclone();
    tx.setStatus(TransactionStatus.COMPLETED);
    ((DAO) x.get("localTransactionDAO")).put_(x, tx);
  }

  public void createRule(X x) {

//    AccountTransactionLimitRule limitRule2 = new AccountTransactionLimitRule();
//    limitRule2.setLimit(100L);
//    limitRule2.setDaoKey("transactionDAO");
//    rule2 = (AccountTransactionLimitRule) ((DAO)x.get("ruleDAO")).put(limitRule2).fclone();

AccountTransactionLimitRule limitRule = new AccountTransactionLimitRule();
     limitRule.setLimit(10000L);
     limitRule.setDaoKey("transactionDAO");
     rule = (AccountTransactionLimitRule) ((DAO)x.get("ruleDAO")).put(limitRule).fclone();

  }
}
