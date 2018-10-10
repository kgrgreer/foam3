package net.nanopay.invoice;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.AuthenticationException;
import foam.nanos.auth.AuthorizationException;
import foam.nanos.auth.User;
import foam.nanos.auth.AuthService;
import net.nanopay.invoice.model.Invoice;

import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.OR;
import static foam.mlang.MLang.NEQ;
import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.NOT;

public class AuthenticatedInvoiceDAO extends ProxyDAO {

  public final static String GLOBAL_INVOICE_READ = "invoice.read.*";
  public final static String GLOBAL_INVOICE_DELETE = "invoice.delete.*";
  protected AuthService auth;

  public AuthenticatedInvoiceDAO(X x, DAO delegate) {
    super(x, delegate);
    auth = (AuthService) x.get("auth");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    User user = this.getUser(x);
    Invoice invoice = (Invoice) obj;

    if ( invoice == null ) {
      throw new IllegalArgumentException("Cannot put null");
    }
    // Check if the user has global access permission.
    if ( ! auth.check(x, GLOBAL_INVOICE_READ) ) {
      // Check if the user is the creator of the invoice
      if ( ! this.isRelated(user, invoice) ) {
        throw new AuthorizationException();
      }
      // Check if invoice is draft,  
      if ( invoice.getDraft() ) {
        Invoice check = (Invoice) super.find_(x, invoice.getId());
        // If invoice currently exists and is not created by current user -> throw exception.
        if ( check != null && (invoice.getCreatedBy() != user.getId()) ) {
          throw new AuthorizationException();
        }
      }
    }
    // Whether the invoice exist or not, utilize put method and dao will handle it.
    return getDelegate().put_(x, invoice);
  }

  @Override
  public FObject find_(X x, Object id) {
    User user = this.getUser(x);
    Invoice invoice = (Invoice) super.find_(x, id);

    if ( invoice != null && ! auth.check(x, GLOBAL_INVOICE_READ)) {
      // Check if user is related to the invoice
      if ( ! this.isRelated(user, invoice) ) {
        throw new AuthorizationException();
      }
      // limiting draft invoice to those who created the invoice.
      if ( invoice.getDraft() && ( invoice.getCreatedBy() != user.getId() ) ) {
        throw new AuthorizationException();
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
    // only return related invoices and drafts that user created
    DAO dao = global ? getDelegate() : getDelegate().
      where(
        AND(
          OR(EQ(Invoice.PAYEE_ID, id), EQ(Invoice.PAYER_ID, id)), 
          NOT(AND(EQ(Invoice.DRAFT, true), NEQ(Invoice.CREATED_BY, id)))));
    return dao.select_(x, sink, skip, limit, order, predicate);
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    User user = this.getUser(x);
    Invoice invoice = (Invoice) obj;

    if ( ! (auth.check(x, GLOBAL_INVOICE_DELETE) || user.getId() == invoice.getCreatedBy()) ) {
      throw new AuthorizationException();
    }

    if ( ! invoice.getDraft() ) {
      throw new AuthorizationException("Only invoice drafts can be deleted.");
    }
    return getDelegate().remove_(x, obj);
  }

  @Override
  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
    User user = this.getUser(x);
    boolean global = auth.check(x, GLOBAL_INVOICE_DELETE);

    DAO dao = global ? getDelegate().where(EQ(Invoice.DRAFT, true))
        : getDelegate().where(AND(EQ(Invoice.CREATED_BY, user.getId()), EQ(Invoice.DRAFT, true)));
    dao.removeAll_(x, skip, limit, order, predicate);
  }

  protected User getUser(X x) {
    User user = (User) x.get("user");
    if ( user == null ) {
      throw new AuthenticationException();
    }
    return user;
  }

  // If the user is payee or payer of the invoice.
  protected boolean isRelated(User user, Invoice invoice) {
    long id = user.getId();
    boolean isPayee = (long) invoice.getPayeeId() == id;
    boolean isPayer = (long) invoice.getPayerId() == id;
    return  isPayee || isPayer;
  }
}