package net.nanopay.invoice;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import net.nanopay.bank.BankAccount;
import net.nanopay.contacts.Contact;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.model.Business;

/**
 * This DAO decorator sets the destination account on invoices.
 */
public class InvoiceSetDstAccountDAO extends ProxyDAO {
  public DAO localUserDAO_;

  public InvoiceSetDstAccountDAO(X x, DAO delegate) {
    super(x, delegate);
    localUserDAO_ = (DAO) x.get("localUserDAO");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    // if ( obj == null ) throw new RuntimeException("Cannot put null");

    // Invoice invoice = (Invoice) obj;

    // // Ignore updates. We only care about new invoices in this decorator.
    // if ( getDelegate().inX(x).find(invoice.getId()) != null ) {
    //   return super.put_(x, obj);
    // }

    // User payee = (User) localUserDAO_.inX(x).find(invoice.getPayeeId());

    // if ( payee instanceof Business || payee instanceof Contact )  {
    //   BankAccount payeeBankAccount = BankAccount.findDefault(x, payee, invoice.getDestinationCurrency());

    //   if ( payeeBankAccount == null ) {
    //     throw new RuntimeException("Cannot send money to " + payee.label() + " because they do not have a " + invoice.getDestinationCurrency() + " bank account.");
    //   }

    //   invoice.setDestinationAccount(payeeBankAccount.getId());
    // }

    return super.put_(x, obj);
  }
}
