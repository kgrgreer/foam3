package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import net.nanopay.cico.model.TransactionType;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.bank.BankAccount;
import net.nanopay.tx.model.Transaction;
import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;

public class BankAccountInvoiceDAO
  extends ProxyDAO
{
  protected DAO userDAO_;
  protected DAO bankAccountDAO_;

  public BankAccountInvoiceDAO(X x, DAO delegate) {
    setDelegate(delegate);
    setX(x);
    userDAO_        = (DAO) x.get("localUserDAO");
    bankAccountDAO_ = (DAO) x.get("localAccountDAO");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    // If It is a CICO Transaction, does not do anything.
    Transaction txn = (Transaction) obj;

    if ( txn.getDestinationAccount() == txn.getSourceAccount() ) return super.put_(x, obj);

    long payerId = txn.getSourceAccount();
    long amount  = txn.getAmount();

    if ( txn.getBankAccountId() == null ) return getDelegate().put_(x, obj);

    BankAccount bankAccount = (BankAccount) bankAccountDAO_.find(txn.getBankAccountId());

    if ( bankAccount == null ) throw new RuntimeException("Bank account doesn't exist");

    txn.setType(TransactionType.BANK_ACCOUNT_PAYMENT);

    return getDelegate().put_(x, obj);
  }
}
