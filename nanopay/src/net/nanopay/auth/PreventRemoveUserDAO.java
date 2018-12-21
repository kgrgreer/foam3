package net.nanopay.auth;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.mlang.sink.Count;
import foam.nanos.auth.User;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.tx.model.Transaction;

import java.lang.reflect.Array;
import java.util.List;

import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.IN;
import static foam.mlang.MLang.OR;

public class PreventRemoveUserDAO
  extends ProxyDAO {

  public PreventRemoveUserDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    User user = (User) obj;

    Count count = new Count();
    long total;
    DAO transactionDAO = (DAO) x.get("localTransactionDAO");
    DAO invoiceDAO = (DAO) x.get("invoiceDAO");

    List accounts= ((ArraySink) user.getAccounts(x).select(new ArraySink())).getArray();

    total = ((Count) transactionDAO.where(
        IN(Transaction.SOURCE_ACCOUNT, accounts)).limit(1).select(count)).getValue();

    if ( total == 0 )
      total += ((Count) transactionDAO.where(
        IN(Transaction.DESTINATION_ACCOUNT, accounts)).limit(1).select(count)).getValue();

    if ( total == 0 ) {
      total += ((Count) invoiceDAO.where(
        EQ(Invoice.PAYEE_ID, user.getId())).limit(1).select(count)).getValue();
    }

    if ( total == 0 ) {
      total += ((Count) invoiceDAO.where(
        EQ(Invoice.PAYER_ID, user.getId())).limit(1).select(count)).getValue();
    }

    if ( total > 0 ) {
      user.setEnabled(false);
      return super.put_(x, user);
    }
    return super.remove_(x, obj);
  }
}
