package net.nanopay.tx.test;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.INSTANCE_OF;

import foam.core.X;
import foam.dao.DAO;
import foam.dao.GUIDDAO;
import foam.dao.MDAO;
import foam.nanos.auth.User;
import foam.nanos.dao.Operation;
import foam.nanos.ruler.RuleGroup;
import foam.nanos.ruler.RulerDAO;
import foam.nanos.ruler.RulerProbe;
import foam.nanos.ruler.TestedRule;
import foam.nanos.test.Test;
import net.nanopay.account.DigitalAccount;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.bank.CABankAccount;
import net.nanopay.liquidity.tx.TxLimitEntityType;
import net.nanopay.liquidity.tx.TxLimitRule;
import net.nanopay.tx.DigitalTransaction;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;
import net.nanopay.tx.ruler.TransactionLimitProbeInfo;

public class TransactionLimitTest extends Test {

  DigitalAccount sender_, receiver_;
  CABankAccount senderBank_;
  TxLimitRule rule;

  public void runTest(X x) {
    createAccounts(x);
    populateSenderAccount(x);
    DAO ruleDAO = new GUIDDAO(new MDAO(foam.nanos.ruler.Rule.getOwnClassInfo()));
    x = x.put("ruleDAO", ruleDAO);
    DAO txnDAO = (DAO) x.get("localTransactionDAO");
    txnDAO = new RulerDAO(x, txnDAO, "transactionDAO");
    createRule(x);
    x = x.put("localTransactionDAO", txnDAO);
    testTransactionLimitProbe(x);
  }

  public void testTransactionLimitProbe(X x) {
    DAO txDAO = (DAO) x.get("localTransactionDAO");
    DigitalTransaction tx = new DigitalTransaction();
    tx.setAmount(5000L);
    tx.setSourceAccount(sender_.getId());
    tx.setDestinationAccount(receiver_.getId());
    RulerProbe probe = new RulerProbe();
    probe.setObject(tx);
    probe.setOperation(Operation.CREATE);
    probe = (RulerProbe) txDAO.cmd_(x, probe);
    TestedRule txRule = null;
    for ( TestedRule testedRule : probe.getAppliedRules() ) {
      if ( testedRule.getName() == "txlimits" ) {
        txRule = testedRule;
        break;
      }
    }
    if ( txRule == null ) return;
    test(((TransactionLimitProbeInfo)txRule.getProbeInfo()).getRemainingLimit() == 10000, "Remaining limit is 10000");
    test(txRule != null, "Probe for transaction limit was found");
    test(txRule.getPassed(), "Transaction is to go through successfully");
    System.out.println(txRule.getMessage());

    tx.setAmount(20000L);
    probe.clearAppliedRules();
    probe = (RulerProbe) txDAO.cmd_(x, probe);
    for ( TestedRule testedRule : probe.getAppliedRules() ) {
      if ( testedRule.getName() == "txlimits" ) {
        txRule = testedRule;
        break;
      }
    }
    test(((TransactionLimitProbeInfo)txRule.getProbeInfo()).getRemainingLimit() == 10000, "Remaining limit is 10000");
    test(! txRule.getPassed(), "Transaction fails to go through because of the limit.");

  }

  public void createAccounts(X x) {
    User sender = TransactionTestUtil.createUser(x);
    User receiver = TransactionTestUtil.createUser(x);

    receiver_ = DigitalAccount.findDefault(x, receiver, "CAD");
    sender_ = DigitalAccount.findDefault(x,sender, "CAD");

    senderBank_ = new CABankAccount();
    senderBank_.setAccountNumber("2131412443534534");
    senderBank_.setOwner(sender.getId());
    senderBank_.setStatus(BankAccountStatus.VERIFIED);
    senderBank_ = (CABankAccount) ((DAO)x.get("localAccountDAO")).put_(x, senderBank_).fclone();
  }

  public void populateSenderAccount(X x) {
    Transaction tx = new Transaction();
    tx.setAmount(10000000000L);
    tx.setSourceAccount(senderBank_.getId());
    tx.setDestinationAccount(sender_.getId());
    tx = (Transaction) ((DAO) x.get("localTransactionDAO")).put_(x, tx).fclone();
    if (tx.getStatus() != TransactionStatus.COMPLETED) {
      tx.setStatus(TransactionStatus.COMPLETED);
      ((DAO) x.get("localTransactionDAO")).put_(x, tx);
    }
  }

  public void createRule(X x) {
    TxLimitRule txLimitRule = new TxLimitRule();
    txLimitRule.setLimit(10000L);
    txLimitRule.setDenomination("CAD");
    txLimitRule.setApplyLimitTo(TxLimitEntityType.BUSINESS);
    txLimitRule.setBusinessToLimit(sender_.getOwner());
    txLimitRule.setDaoKey("transactionDAO");
    rule = (TxLimitRule) ((DAO)x.get("ruleDAO")).put(txLimitRule).fclone();
  }
}
