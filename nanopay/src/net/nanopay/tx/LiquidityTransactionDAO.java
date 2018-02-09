package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;

import java.util.Date;

import net.nanopay.cico.model.TransactionType;
import net.nanopay.model.Account;
import net.nanopay.model.BankAccount;
import net.nanopay.tx.model.Transaction;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;


public class LiquidityTransactionDAO
    extends ProxyDAO {
  protected DAO userDAO_;
  protected DAO transactionDAO_;
  protected DAO standardCICOTransactionDAO_;
  protected DAO accountDAO_;
  protected DAO bankAccountDAO_;

  public LiquidityTransactionDAO(X x, DAO delegate) {
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    Transaction txn = (Transaction) obj;

    // initialize our DAO
    standardCICOTransactionDAO_ = (DAO) x.get("standardCICOTransactionDAO");
    bankAccountDAO_ = (DAO) x.get("localBankAccountDAO");
    accountDAO_ = (DAO) x.get("localAccountDAO");

    // If It is a CICO Transaction, does not do anything.
    if ( txn.getPayeeId() == txn.getPayerId() ) {
      return super.put_(x, obj);
    }

    long total = txn.getTotal();

    // get payer and payee account
    Account payeeAccount = (Account) accountDAO_.find(txn.getPayeeId());
    Account payerAccount = (Account) accountDAO_.find(txn.getPayerId());

    // get payer and payee bank account
    BankAccount payerBankAccount = (BankAccount) ( (ArraySink) bankAccountDAO_.where(
        AND(
            EQ(BankAccount.OWNER, payerAccount.getId()),
            EQ(BankAccount.STATUS, "Verified")
        ))
        .limit(1).select(new ArraySink()) ).getArray().get(0);
    BankAccount payeeBankAccount = (BankAccount) ( (ArraySink) bankAccountDAO_.where(
        AND(
            EQ(BankAccount.OWNER, payeeAccount.getId()),
            EQ(BankAccount.STATUS, "Verified")
        ))
        .limit(1).select(new ArraySink()) ).getArray().get(0);

    // if the user's balance is not enough to make the payment, do cash in first
    if ( payerAccount.getBalance() < total ) {
      long cashinAmount = total - payerAccount.getBalance();
      Transaction transaction = new Transaction();
      transaction.setPayerId(payerAccount.getId());
      transaction.setPayeeId(payerAccount.getId());
      transaction.setAmount(cashinAmount);
      transaction.setType(TransactionType.CASHIN);
      transaction.setBankAccountId(payerBankAccount.getId());
      standardCICOTransactionDAO_.put(transaction);
    }

    // Make a payment
    FObject originalTx = null;
    try {
      originalTx = super.put_(x, obj);

      // if the user's balance is not enough to make the payment, do cash in first
      if ( payeeAccount.getBalance() >= total ) {

        Transaction transaction = new Transaction();
        transaction.setPayerId(payeeAccount.getId());
        transaction.setPayeeId(payeeAccount.getId());
        transaction.setAmount(total);
        transaction.setType(TransactionType.CASHOUT);
        transaction.setBankAccountId(payeeBankAccount.getId());
        standardCICOTransactionDAO_.put(transaction);
      }

    } catch ( RuntimeException exception ) {
      throw new RuntimeException("Transaction already refunded");
    }

    return originalTx;
    //

  }
}