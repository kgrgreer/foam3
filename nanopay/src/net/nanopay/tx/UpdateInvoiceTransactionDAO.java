package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.model.PaymentStatus;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

public class UpdateInvoiceTransactionDAO
    extends ProxyDAO {
  protected DAO invoiceDAO_;

  public UpdateInvoiceTransactionDAO(X x, DAO delegate) {
    setDelegate(delegate);
    setX(x);
    invoiceDAO_ = (DAO) getX().get("invoiceDAO");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    Transaction transaction = (Transaction) obj;
    Invoice invoice = (Invoice) invoiceDAO_.find(transaction.getInvoiceId());

    if ( transaction.getInvoiceId() != 0 ) {
      if ( invoice == null ) {
        throw new RuntimeException("Invoice not found");
      }
      if ( "Paid".equals(invoice.getStatus()) && transaction.getStatus() != TransactionStatus.DECLINED ) {
        throw new RuntimeException("Invoice already paid");
      }
    }
    FObject ret = super.put_(x, obj);


    // find invoice
    if ( transaction.getPayerId() != transaction.getPayeeId() ) {

      if ( transaction.getStatus() == TransactionStatus.COMPLETED ) {
        invoice.setPaymentId(transaction.getId());
        invoice.setPaymentDate(transaction.getDate());
        invoice.setPaymentMethod(PaymentStatus.CHEQUE);
        invoiceDAO_.put(invoice);
      }
      if ( transaction.getStatus() == TransactionStatus.PENDING ) {
        invoice.setPaymentId(transaction.getId());
        invoice.setPaymentDate(transaction.getDate());
        invoice.setPaymentMethod(PaymentStatus.PENDING);
        invoiceDAO_.put(invoice);
      }
      if(transaction.getStatus() == TransactionStatus.DECLINED){
        invoice.setPaymentId(transaction.getId());
        invoice.setPaymentDate(transaction.getDate());
        invoice.setPaymentMethod(PaymentStatus.UNSUCCESS);
        invoiceDAO_.put(invoice);
      }
    }

    return ret;
  }
}
