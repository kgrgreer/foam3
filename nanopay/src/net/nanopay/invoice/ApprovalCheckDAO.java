package net.nanopay.invoice;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.AuthService;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.model.PaymentStatus;

/**
 * When submitting a new payable invoice, set it's payment method to
 * PENDING_APPROVAL if the user doesn't have permission to pay invoices.
 */
public class ApprovalCheckDAO extends ProxyDAO {
  public ApprovalCheckDAO(X x, DAO delegate) {
    super(x, delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    Invoice invoice = (Invoice) obj;
    DAO delegate = getDelegate().inX(x);
    Invoice existingInvoice = (Invoice) delegate.find(invoice.getId());

    AuthService auth = (AuthService) x.get("auth");

    if ( existingInvoice == null && ! auth.check(x, "invoice.pay") ) {
      invoice = (Invoice) invoice.fclone();
      invoice.setPaymentMethod(PaymentStatus.PENDING_APPROVAL);
    }

    return super.put_(x, invoice);
  }
}
