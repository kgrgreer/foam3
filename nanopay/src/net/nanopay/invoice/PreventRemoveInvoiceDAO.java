package net.nanopay.invoice;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.mlang.sink.Count;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.tx.model.Transaction;
import net.nanopay.account.HoldingAccount;

import static foam.mlang.MLang.EQ;

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
        EQ(Transaction.INVOICE_ID, invoice.getId())).limit(1).select(count)).getValue();

    if ( total == 0 )
      total += ((Count) accountDAO.where(
          EQ(HoldingAccount.INVOICE_ID, invoice.getId())).limit(1).select(count)).getValue();

    if ( total > 0 ) {
      invoice = (Invoice) invoice.fclone();
      invoice.setRemoved(true);
      return super.put_(x, invoice);
    }
    return super.remove_(x, invoice);
  }
}
