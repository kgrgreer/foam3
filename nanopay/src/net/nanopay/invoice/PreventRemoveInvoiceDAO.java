package net.nanopay.invoice;

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
import net.nanopay.account.HoldingAccount;

import java.lang.reflect.Array;
import java.util.List;

import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.IN;
import static foam.mlang.MLang.OR;

public class PreventRemoveInvoiceDAO
  extends ProxyDAO {
  /**
   * Prevents removing invoices associated to other transaction or accounts. 
  */

  public PreventRemoveInvoiceDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    DAO transactionDAO = (DAO) x.get("localTransactionDAO");
    DAO accountDAO = (DAO) x.get("localAccountDAO");

    Invoice invoice = (Invoice) obj;
    Count count = new Count();
    long total;

    total = ((Count) transactionDAO.where(
        IN(Transaction.INVOICE_ID, invoice.getId())).limit(1).select(count)).getValue();

    if ( total == 0 )
      total += ((Count) accountDAO.where(
          IN(HoldingAccount.INVOICE_ID, invoice.getId())).limit(1).select(count)).getValue();

    if ( total > 0 ) {
      invoice.setRemoved(false);
      return super.put_(x, invoice);
    }
    return super.remove_(x, invoice);
  }
}
