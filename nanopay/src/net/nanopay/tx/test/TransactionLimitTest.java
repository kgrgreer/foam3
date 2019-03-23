package net.nanopay.tx.test;


import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.MDAO;
import foam.dao.SequenceNumberDAO;
import foam.nanos.ruler.Rule;
import foam.nanos.ruler.RuleAction;
import foam.nanos.ruler.RuleEngine;
import foam.nanos.ruler.RulerDAO;
import foam.nanos.test.Test;
import foam.test.TestUtils;
import net.nanopay.account.Account;
import net.nanopay.account.DigitalAccount;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.bank.CABankAccount;
import net.nanopay.tx.TransactionLimitAccountRule;
import net.nanopay.tx.TransactionLimitState;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import java.util.HashMap;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.INSTANCE_OF;

public class TransactionLimitTest extends Test {

  DigitalAccount sender_, receiver_;
  CABankAccount senderBank_;
  TransactionLimitAccountRule rule, rule2;

  public void runTest(X x) {
    createAccounts(x);
    populateSenderAccount(x);
    DAO ruleDAO = new SequenceNumberDAO(new MDAO(foam.nanos.ruler.Rule.getOwnClassInfo()));
    x = x.put("ruleDAO", ruleDAO);
    DAO txnDAO = (DAO) x.get("localTransactionDAO");
    txnDAO = new RulerDAO(x, txnDAO, "transactionDAO");
    createRule(x);
    x = x.put("localTransactionDAO", txnDAO);
    testRule(x);
    testUpdatedRule(x);
  }

  public void testRule(X x) {
    DAO txDAO = (DAO) x.get("localTransactionDAO");
    Transaction tx = new Transaction();
    tx.setAmount(9990L);
    tx.setSourceAccount(sender_.getId());
    tx.setDestinationAccount(receiver_.getId());
    tx = (Transaction) txDAO.put_(x, tx);
    test(tx instanceof Transaction, "tx fro 9990 went though success. Limit is 10000");
    System.out.println(tx);

    Transaction tx2 = new Transaction();
    tx2.setAmount(20L);
    tx2.setSourceAccount(sender_.getId());
    tx2.setDestinationAccount(receiver_.getId());
    test(TestUtils.testThrows(
      () -> txDAO.put_(x, tx2),
      "LIMIT",
      RuntimeException.class), "100L throws exception");
    System.out.println(tx2);

    Transaction tx3 = new Transaction();
    tx3.setAmount(10L);
    tx3.setSourceAccount(sender_.getId());
    tx3.setDestinationAccount(receiver_.getId());
    tx3 = (Transaction) txDAO.put_(x, tx3);
    test(tx3 instanceof Transaction, "tx fro 9990 went though success. Limit is 10000");
  }

  public void testUpdatedRule(X x) {
    TransactionLimitAccountRule r = (TransactionLimitAccountRule) ((DAO) x.get("ruleDAO")).find(rule);
    r.setLimit(20000L);
    r = (TransactionLimitAccountRule) ((DAO) x.get("ruleDAO")).put(r);
    DAO txDAO = (DAO) x.get("localTransactionDAO");

    Transaction tx = new Transaction();
    tx.setAmount(10000L);
    tx.setSourceAccount(sender_.getId());
    tx.setDestinationAccount(receiver_.getId());
    txDAO.put_(x, tx);
    test(tx instanceof Transaction, "tx fro 9990 went though success. Limit is 10000");

    r = (TransactionLimitAccountRule) ((DAO) x.get("ruleDAO")).find(rule);
    r.setLimit(666L);
    r = (TransactionLimitAccountRule) ((DAO) x.get("ruleDAO")).put(r);
    System.out.print(r);

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

//    TransactionLimitAccountRule limitRule2 = new TransactionLimitAccountRule();
//    limitRule2.setLimit(100L);
//    limitRule2.setTempPeriod(3600000);
//    limitRule2.setDaoKey("transactionDAO");
//    rule2 = (TransactionLimitAccountRule) ((DAO)x.get("ruleDAO")).put(limitRule2).fclone();

     TransactionLimitAccountRule limitRule = new TransactionLimitAccountRule();
     limitRule.setLimit(10000L);
     limitRule.setTempPeriod(3600000);
     limitRule.setDaoKey("transactionDAO");
     rule = (TransactionLimitAccountRule) ((DAO)x.get("ruleDAO")).put(limitRule).fclone();

  }
}
