package net.nanopay.invoice;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.AuthenticationException;
import foam.nanos.auth.User;
import foam.util.SafetyUtil;
import net.nanopay.account.DigitalAccount;
import net.nanopay.account.HoldingAccount;
import net.nanopay.contacts.Contact;
import net.nanopay.invoice.model.Invoice;

import static foam.mlang.MLang.EQ;

// check if Payee is a User or Contact
// if user check if User has a bank account
//    if yes dst account is set to User account
//    else dst account set to Payer owned Holding Account (Digital Account)
// else /* User is a Contact */
//    if Contact has a bank Account dst account set to Contact bank account //TODO: this flow is for future implementation
//    else dst account set to Payer owned Holding Account (Digital Account)

public class InvoiceSetDstAccountDAO extends ProxyDAO {
  public InvoiceSetDstAccountDAO(X x, DAO delegate) {
    super(x, delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    if ( obj == null ) {
      throw new RuntimeException("Cannot put null");
    }

    Invoice invoice = (Invoice) obj;
    Invoice existingInvoice = (Invoice) super.find(invoice.getId());

    // We only care about invoices where the dst account is not set
    if ( invoice.getDestinationAccount() != 0 ) {
      return super.put_(x, obj);
    }

    DAO userDAO = ((DAO) x.get("localUserDAO")).inX(x);
    DAO contactDAO = ((DAO) x.get("contactDAO")).inX(x);
    Contact contact = (Contact) contactDAO.find(invoice.getPayeeId());

    // Is the payee a contact?
    if ( contact != null ) {
      // Has the real user signed up yet?
      User realUser = getUserByEmail(userDAO, contact.getEmail());
      if ( realUser != null ) {
        // Switch payee to real user if they've signed up.
        invoice.setPayeeId(realUser.getId());
        // Check if realUser has a bank account
        boolean defaultCheck = checkIfUserHasAccount(x, realUser, invoice);
        if ( defaultCheck ) {
          // dstAccount set
          return super.put_(x, invoice);
        } else {
          // Real user has no bankAccount, create the holding account that we'll
          // send the money to when the payer pays the invoice.
          setDigitalAccount(x, invoice, userDAO);
        }
      } else {
        // Set invoice external flag on invoice
        invoice.setExternal(true);
        // Real user has not joined yet, create the holding account that we'll
        // send the money to when the payer pays the invoice.
        setDigitalAccount(x, invoice, userDAO);
      }
    }
    return super.put_(x, invoice);
  }

  public User getUserByEmail(DAO userDAO, String emailAddress) {
    return (User) userDAO.find(EQ(User.EMAIL, emailAddress));
  }

  public boolean checkIfUserHasAccount(X x, User realUser, Invoice invoice){
    // Check if realUser has a default BankAccount for invoice.getDestinationCurrency()
    BankAccount bA = BankAccount.findDefault(x, realUser, invoice.getDestinationCurrency());
    if ( bA == null ) {
      // Check if realUser has a default BankAccount regardless of Currency
      List accounts = ((ArraySink) realUser.getAccounts(x).where(
        AND(
          EQ(Account.IS_DEFAULT, true),
          NOT(INSTANCE_OF(DigitalAccount.class))))
            .select(new ArraySink())).getArray();
      if ( accounts.size() > 0 ) {
        // Take first found BankAccount
        invoice.setDestinationAccount(accounts[0]);
        return true;
      }
    } else {
      invoice.setDestinationAccount(bA);
      return true;
    }
    return false;
  }

  public void setDigitalAccount(X x, Invoice invoice, User payer){
    // Confirm that destinationCurrency is CAD. This flow is not for international payments
    if ( SafetyUtil.equals(invoice.getDestinationCurrency(), "CAD") ) {
      DigitalAccount dA = DigitalAccount.findDefault(x, payer, "CAD");
      if ( dA != null ) {
        invoice.setDestinationAccount(dA);
      } else {
        throw new RuntimeException("UserID " + payer.getId() + " does not have a default CAD DigitalAccount." );
      }
      // 1
      // User payer = userDAO.find(invoice.getPayerId());
      // if (payer != null) {
      //   digAcc = ((ArraySink) payer.getAccounts().where().select(new ArraySink())).getArray();
      // }
      // 2
      // HoldingAccount holdingAcct = new HoldingAccount();
      // holdingAcct.setInvoiceId(invoice.getId());
      // holdingAcct.setDenomination("CAD");

      // // For now we're going to let the payer own the holding account.
      // holdingAcct.setOwner(invoice.getPayerId());
      // DAO accountDAO = ((DAO) x.get("localAccountDAO")).inX(x);
      // holdingAcct = (HoldingAccount) accountDAO.put(holdingAcct);
    } else {
      // Not allowing a HoldingAccount(DigitalAccount) for FX. Payee and Payer must have a bankAccount for FX
      throw new RuntimeException("Sending anything other than CAD to a User without a BankAccount is not supported yet.");
    }
  }
}
