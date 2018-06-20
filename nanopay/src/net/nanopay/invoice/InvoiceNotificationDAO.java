package net.nanopay.invoice;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import net.nanopay.invoice.model.Invoice;

import java.util.Date;

public class InvoiceNotificationDAO extends ProxyDAO {

  protected DAO userDAO_;

  public InvoiceNotificationDAO(X x, DAO delegate) {
    super(x, delegate);
    userDAO_ = (DAO) x.get("localUserDAO");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    Invoice invoice = (Invoice) obj;
    User    payer   = (User) userDAO_.find_(x, invoice.getPayerId() );

    // Set the timestamp on the invoice here
    invoice.setIssueDate(new Date());

    // Makes sure the notification isn't sent if the creator is the receiver
    if ( payer.getId() == invoice.getCreatedBy() )
      return getDelegate().put_(x, obj);

    // Put to the DAO
    invoice = (Invoice) super.put_(x, invoice);
    return invoice;
  }
}