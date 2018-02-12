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
    ArraySink payerBankAccountList = new ArraySink();
    ArraySink payeeBankAccountList = new ArraySink();

    bankAccountDAO_.where(
        AND(
            EQ(BankAccount.OWNER, payerAccount.getId()),
            EQ(BankAccount.STATUS, "Verified")
        ))
        .limit(1).select(payerBankAccountList);
    bankAccountDAO_.where(
        AND(
            EQ(BankAccount.OWNER, payeeAccount.getId()),
            EQ(BankAccount.STATUS, "Verified")
        ))
        .limit(1).select(payeeBankAccountList);

    // if the user's balance is not enough to make the payment, do cash in first
    if ( payerAccount.getBalance() < total ) {
      if ( payerBankAccountList.getArray().size() == 0 )
        throw new RuntimeException("The payer don't have bank account and the balance is Insufficient");
      long cashInAmount = total - payerAccount.getBalance();
      Transaction transaction = new Transaction.Builder(x)
          .setPayeeId(payerAccount.getId())
          .setPayerId(payerAccount.getId())
          .setAmount(cashInAmount)
          .setType(TransactionType.CASHIN)
          .setBankAccountId(( (BankAccount) payerBankAccountList.getArray().get(0) ).getId())
          .build();
      super.put_(x, transaction);
    }

    // Make a payment
    FObject originalTx = null;
    originalTx = super.put_(x, obj);

    // if the user's balance is not enough to make the payment, do cash in first
    if ( payeeAccount.getBalance() >= total ) {
      if ( payeeBankAccountList.getArray().size() == 0 )
        throw new RuntimeException("The payee doesn't have a verified bank account.");
      Transaction transaction = new Transaction.Builder(x)
          .setPayeeId(payeeAccount.getId())
          .setPayerId(payeeAccount.getId())
          .setAmount(total)
          .setType(TransactionType.CASHOUT)
          .setBankAccountId(( (BankAccount) payeeBankAccountList.getArray().get(0) ).getId())
          .build();
      super.put_(x, transaction);
    } else {
      throw new RuntimeException("Transaction is not success");
    }

    return originalTx;
  }
}