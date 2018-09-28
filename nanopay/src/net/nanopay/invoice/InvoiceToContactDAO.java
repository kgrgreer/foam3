package net.nanopay.invoice;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.AuthenticationException;
import foam.nanos.auth.User;
import foam.util.SafetyUtil;
import net.nanopay.account.HoldingAccount;
import net.nanopay.contacts.Contact;
import net.nanopay.invoice.model.Invoice;

import static foam.mlang.MLang.EQ;

/**
 * If the chosen payee for an invoice is a contact where the real user is
 * already on the platform, change the payee to the real user instead of the
 * contact. If the real user has not signed up yet, create the holding account
 * that will be used to store the money until the payee signs up to the platform
 * and accepts the payment.
 */
public class InvoiceToContactDAO extends ProxyDAO {
  public InvoiceToContactDAO(X x, DAO delegate) {
    super(x, delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    if ( obj == null ) {
      throw new RuntimeException("Cannot put null");
    }

    Invoice invoice = (Invoice) obj;
    Invoice existingInvoice = (Invoice) super.find(invoice.getId());

    // We only care about new invoices or invoices where the payeeId has been
    // changed in this decorator.
    if ( existingInvoice != null && existingInvoice.getPayeeId() == invoice.getPayeeId() ) {
      return super.put_(x, obj);
    }

    DAO contactDAO = (DAO) x.get("contactDAO");
    Contact contact = (Contact) contactDAO.find_(x, invoice.getPayeeId());

    // Is the payee a contact?
    if ( contact != null ) {
      // Has the real user signed up yet?
      DAO userDAO = (DAO) x.get("localUserDAO");
      User realUser = getUserByEmail(userDAO, contact.getEmail());
      if ( realUser != null ) {
        // Switch payee to real user if they've signed up.
        invoice.setPayeeId(realUser.getId());
      } else {
        // Real user has not joined yet, create the holding account that we'll
        // send the money to when the payer pays the invoice.
        if ( SafetyUtil.equals(invoice.getDestinationCurrency(), "CAD") ) {
          HoldingAccount holdingAcct = new HoldingAccount();
          holdingAcct.setInvoiceId(invoice.getId());
          holdingAcct.setDenomination("CAD");

          // For now we're going to let the payer own the holding account. In
          // the future we will make this a true escrow account.
          holdingAcct.setOwner(invoice.getPayerId());
          // Set invoice external flag on invoice
          invoice.setExternal(true);
          DAO accountDAO = (DAO) x.get("localAccountDAO");
          accountDAO.put_(x, holdingAcct);
        } else {
          // TODO: Set up an AFX holding account.
          throw new RuntimeException("Sending anything other than CAD to a contact is not supported yet.");
        }
      }
    }

    return super.put_(x, invoice);
  }

  public User getUserByEmail(DAO userDAO, String emailAddress) {
    return (User) userDAO.find(EQ(User.EMAIL, emailAddress));
  }
}
