package net.nanopay.transactionservice;

import foam.core.FObject;
import foam.core.X;
import foam.dao.AbstractDAO;
import foam.dao.DAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import net.nanopay.common.model.Account;
import net.nanopay.common.model.User;
import net.nanopay.common.model.UserAccountInfo;
import net.nanopay.transactionservice.model.Transaction;


public class TransactionDAO
  extends AbstractDAO
{
  protected DAO userDAO_;

  protected UserAccountInfo getUserAccountInfo(User user) {
    Account account = (Account) user.getAccounts();
    if ( account.getAccountInfo() instanceof UserAccountInfo ) {
      return (UserAccountInfo) account.getAccountInfo();
    }
    return null;
  }

  protected DAO getUserDAO() {
    if ( userDAO_ == null ) {
      userDAO_ = (DAO) getX().get("userTestDAO");
    }
    return userDAO_;
  }

  @Override
  public FObject put_(X x, FObject fObject) throws RuntimeException {
    if ( fObject instanceof Transaction ) {
      Transaction transaction = (Transaction) fObject;

      long payeeId = transaction.getPayeeId();
      long payerId = transaction.getPayerId();


      if ( transaction.getAmount() <= 0 ) {
        throw new RuntimeException("Transaction amount must be greater than 0");
      }

      if ( payeeId == payerId ) {
        throw new RuntimeException("PayeeID and PayerID cannot be the same");
      }

      Long firstLock  = payerId < payeeId ? transaction.getPayerId() : transaction.getPayeeId();
      Long secondLock = payerId > payeeId ? transaction.getPayerId() : transaction.getPayeeId();

      synchronized ( firstLock ) {

        synchronized ( secondLock ) {

          try {
            User payee = (User) getUserDAO().find(transaction.getPayeeId());
            User payer = (User) getUserDAO().find(transaction.getPayerId());

            if (payee.getAccounts() == null) {
             throw new RuntimeException("Payee doesn't have any accounts");
            }

            if (payer.getAccounts() == null) {
              throw new RuntimeException("Payer doesn't have any accounts");
            }

            UserAccountInfo payeeAccountInfo = getUserAccountInfo(payee);
            if (payeeAccountInfo == null) {
              throw new RuntimeException("Payee missing UserAccountInfo");
            }

            UserAccountInfo payerAccountInfo = getUserAccountInfo(payer);
            if (payerAccountInfo == null) {
              throw new RuntimeException("Payer missing UserAccountInfo");
            }

            long amount = transaction.getAmount();

            if (payerAccountInfo.getBalance() >= amount) {
              payerAccountInfo.setBalance(payerAccountInfo.getBalance() - amount);
              payeeAccountInfo.setBalance(payeeAccountInfo.getBalance() + amount);

              getUserDAO().put(payer);
              getUserDAO().put(payee);
            } else {
              throw new RuntimeException("Payer doesn't have enough balance");
            }
          } catch (Exception err) {
            err.printStackTrace();
          }

        }
      }
    }
    return fObject;
  }

  @Override
  public FObject remove_(X x, FObject fObject) {
    return null;
  }

  @Override
  public FObject find_(X x, Object o) {
    return null;
  }

  @Override
  public Sink select_(X x, Sink sink, long l, long l1, Comparator comparator, Predicate predicate) {
    return null;
  }

}
