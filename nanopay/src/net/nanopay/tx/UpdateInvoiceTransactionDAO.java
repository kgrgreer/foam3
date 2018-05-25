package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.model.PaymentStatus;
import net.nanopay.tx.model.Transaction;

public class UpdateInvoiceTransactionDAO
  extends ProxyDAO
{
  protected DAO invoiceDAO_;

  public UpdateInvoiceTransactionDAO(X x, DAO delegate) {
    setDelegate(delegate);
    setX(x);
    invoiceDAO_ = (DAO) getX().get("invoiceDAO");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    FObject     ret         = super.put_(x, obj);
    Transaction transaction = (Transaction) obj;

    // find invoice
    if ( transaction.getPayerId() != transaction.getPayeeId() ) {
      if ( transaction.getInvoiceId() != 0 ) {
        Invoice invoice = (Invoice) invoiceDAO_.find(transaction.getInvoiceId());
        if ( invoice == null ) {
          throw new RuntimeException("Invoice not found");
        }
        if ( "Paid".equals(invoice.getStatus()) ) {
          throw new RuntimeException("Invoice already paid");
        }
        invoice.setPaymentId(transaction.getId());
        invoice.setPaymentDate(transaction.getDate());
        invoice.setPaymentMethod(PaymentStatus.CHEQUE);
        invoiceDAO_.put(invoice);
      }
    }

    return ret;
  }
}
