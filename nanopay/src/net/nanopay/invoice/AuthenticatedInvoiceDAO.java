package net.nanopay.invoice;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.nanos.auth.User;
import foam.nanos.auth.AuthService;
import net.nanopay.invoice.model.Invoice;
import java.security.AccessControlException;

import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;

import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.OR;

public class AuthenticatedInvoiceDAO extends ProxyDAO {

  public final static String GLOBAL_INVOICE_READ = "invoice.read.x";
  protected AuthService auth;

  public AuthenticatedInvoiceDAO(X x, DAO delegate) {
    super(x, delegate);
    auth = (AuthService) x.get("auth");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    User user = this.getUser(x);
    Invoice invoice = (Invoice) obj;

    if (invoice == null) {
      throw new RuntimeException("Cannot put null");
    }
    // Check if the user is the creator of the invoice or if the user is admin.
    if (! this.isRelated(user, invoice) && ! auth.check(x, GLOBAL_INVOICE_READ)) {
      throw new RuntimeException("Permission denied");
    }
    // Whether the invoice exist or not, utilize put method and dao will handle it.
    return getDelegate().put_(x, invoice);
  }

  @Override
  public FObject find_(X x, Object id) {
    User user = this.getUser(x);
    Invoice invoice = (Invoice) super.find_(x, id);

    if (invoice != null) {
      // Check if user is related to the invoice, or user is admin,
      // or user has the authentication.
      if (! this.isRelated(user, invoice) && ! auth.check(x, GLOBAL_INVOICE_READ)) {
        throw new RuntimeException("Permission denied");
      }
    }
    return invoice;
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    User user = this.getUser(x);
    long id = user.getId();
    boolean global = auth.check(x, GLOBAL_INVOICE_READ);

    // If user has the global access permission, get all the invoices; otherwise,
    // only return related invoices.
    DAO dao = global ? getDelegate() :
        getDelegate().where(OR(EQ(Invoice.PAYEE_ID, id), EQ(Invoice.PAYER_ID, id)));
    return dao.select_(x, sink, skip, limit, order, predicate);
  }

  protected User getUser(X x) {
    User user = (User) x.get("user");
    if (user == null) {
      throw new AccessControlException("User is not logged in");
    }
    return user;
  }

  // If the user is payee or payer of the invoice.
  protected boolean isRelated(User user, Invoice invoice) {
    long id = user.getId();
    return (long) invoice.getPayeeId() == id || (long) invoice.getPayerId() == id;
  }
}
