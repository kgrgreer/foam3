package net.nanopay.contacts;

import java.util.ArrayList;
import java.util.List;
import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import net.nanopay.account.Account;
import net.nanopay.tx.model.Transaction;

import static foam.mlang.MLang.*;

public class CheckContactTransDAO extends ProxyDAO {
  public DAO transactionDAO_;

  public CheckContactTransDAO(X x, DAO delegate) {
    super(x, delegate);
    transactionDAO_ = ((DAO) x.get("localTransactionDAO")).inX(getX());
  }

  @Override
  public FObject remove_(X x, FObject obj) {

    Contact contact = (Contact) obj;

    DAO accountDAO = (DAO) x.get("accountDAO");

    List<Account> accounts = ((ArraySink) accountDAO.where(EQ(Account.OWNER, contact.getId())).select(new ArraySink())).getArray();
    
    
    for ( Account account : accounts ) {
      Transaction txn = (Transaction) transactionDAO_.find(
        OR(EQ(Transaction.DESTINATION_ACCOUNT, account.getId()),
           EQ(Transaction.SOURCE_ACCOUNT, account.getId()))
        );
      if ( txn != null ) throw new RuntimeException("Cannot delete this contact!");
    }

    return super.remove_(x, obj);
  }
}
