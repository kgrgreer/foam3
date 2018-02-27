package net.nanopay.cico;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import net.nanopay.cico.model.TransactionStatus;
import net.nanopay.cico.model.TransactionType;
import net.nanopay.model.BankAccount;
import net.nanopay.tx.model.Transaction;

public class RandomDepositBankAccountDAO
    extends ProxyDAO
{
  protected DAO transactionDAO_;

  public RandomDepositBankAccountDAO(X x, DAO delegate) {
    super(x, delegate);
    transactionDAO_ = (DAO) x.get("standardCICOTransactionDAO");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    BankAccount account = (BankAccount) obj;
    boolean newAccount = ( getDelegate().find(account.getId()) == null );

    // if new account and status is unverified make micro deposit
    // TODO: prevent a user from submitting their own status
    if ( newAccount && "Unverified".equals(account.getStatus()) ) {
      User user = (User) x.get("user");

      // generate random deposit amount and set in bank account model
      long randomDepositAmount = (long) (1 + Math.floor(Math.random() * 99));
      account.setRandomDepositAmount(randomDepositAmount);

      // create new transaction and store
      Transaction transaction = new Transaction.Builder(x)
          .setPayeeId(user.getId())
          .setPayerId(user.getId())
          .setBankAccountId(account.getId())
          .setAmount(randomDepositAmount)
          .setType(TransactionType.VERIFICATION)
          .setCicoStatus(TransactionStatus.NEW)
          .build();
      transactionDAO_.put(transaction);
    }

    return super.put_(x, account);
  }
}