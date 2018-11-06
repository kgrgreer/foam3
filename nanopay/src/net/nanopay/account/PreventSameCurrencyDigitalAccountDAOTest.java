package net.nanopay.account;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.core.FObject;
import foam.nanos.auth.User;
import foam.test.TestUtils;
import java.util.List;
import net.nanopay.bank.CABankAccount;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.fx.FXQuote;
import net.nanopay.fx.FXService;
import net.nanopay.payment.PaymentService;
import foam.nanos.auth.Address;
import static foam.mlang.MLang.*;
import net.nanopay.fx.ExchangeRateStatus;
import net.nanopay.fx.FeesFields;
import net.nanopay.payment.Institution;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.TransactionQuote;
import net.nanopay.tx.TransactionPlan;
import net.nanopay.fx.ascendantfx.AscendantFXTransaction;
import net.nanopay.tx.Transfer;
import net.nanopay.tx.FeeTransfer;

import net.nanopay.account.DigitalAccount;


public class PreventSameCurrencyDigitalAccountDAOTest
    extends foam.nanos.test.Test {

  X x_;

  @Override
  public void runTest(X x) {
    x_ = x;
    testPreventSameCurrencyDigitalAccount();

  }


  public void testPreventSameCurrencyDigitalAccount(){
    DAO accountDAO = (DAO) x_.get("localAccountDAO");
    DigitalAccount account = new DigitalAccount();
    account.setDenomination("INR");
    account.setOwner(1002);
    FObject acct =  accountDAO.put(account);
    DigitalAccount account2 = new DigitalAccount();
    account2.setDenomination("INR");
    account2.setOwner(1002);
    test(TestUtils.testThrows(() -> accountDAO.put(account2), "A digital account with same currency: " + account.getDenomination() + " already exists.", RuntimeException.class),"prevent same currency digital account throws an exception");
    DigitalAccount clonedacct = (DigitalAccount) acct.fclone();
    clonedacct.setIsDefault(true);
    clonedacct = (DigitalAccount) accountDAO.put(clonedacct);
    test(clonedacct.getIsDefault(), "Digital Account was updated." );
    DigitalAccount account3 = new DigitalAccount();
    account3.setDenomination("GBP");
    account3.setOwner(1002);
    account3 = (DigitalAccount) accountDAO.put(account3);
    test("GBP".equals(account3.getDenomination()), "We can add other currency Digital Account." );
    accountDAO.remove_(x_, clonedacct);
    accountDAO.remove_(x_, account3);
  }

}
