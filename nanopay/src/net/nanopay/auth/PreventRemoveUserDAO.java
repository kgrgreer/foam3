package net.nanopay.auth;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.mlang.sink.Count;
import foam.nanos.auth.User;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.tx.model.Transaction;

import static foam.mlang.MLang.EQ;
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


    total = ((Count) transactionDAO.where(
        EQ(Transaction.PAYER_ID, user.getId())).limit(1).select(count)).getValue();

    if ( total == 0 )
      total += ((Count) transactionDAO.where(
        EQ(Transaction.PAYEE_ID, user.getId())).limit(1).select(count)).getValue();

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
      return super.put_(x, obj);
    }
    return super.remove_(x, obj);
  }
}
