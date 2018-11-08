package net.nanopay.invoice;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.AuthenticationException;
import foam.nanos.auth.AuthorizationException;
import foam.nanos.auth.User;
import foam.util.Auth;
import foam.util.SafetyUtil;
import java.util.ArrayList;
import java.util.List;
import net.nanopay.account.Account;
import net.nanopay.account.DigitalAccount;
import net.nanopay.bank.BankAccount;
import net.nanopay.contacts.Contact;
import net.nanopay.invoice.model.Invoice;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.INSTANCE_OF;
import static foam.mlang.MLang.NOT;

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
    AuthService auth = (AuthService) x.get("auth");
    User currentUser = (User) x.get("user");
    Invoice invoice = (Invoice) obj;

    // We only care about invoices: 
    //   1) is a payable invoice(payer is current system user) 
    if ( invoice.getPayerId() != currentUser.getId() ) {
      return super.put_(x, obj);
    }
    
    if ( auth.check(x, "invoice.holdingAccount") ) {
      DAO userDAO = ((DAO) x.get("localUserDAO")).inX(x);
      User payer = (User) userDAO.find(invoice.getPayerId());
      User payee = (User) userDAO.find(invoice.getPayeeId());

      if ( payer == null ) {
        throw new RuntimeException("Payer of invoiceID" + invoice.getId() + " is not set." );
      }

      DAO contactDAO = ((DAO) x.get("contactDAO")).inX(x);
      Contact contact = (Contact) contactDAO.find(invoice.getPayeeId());

      // What is the payee? A) or B)
      //A) Contact:
      if ( contact != null && payee == null ) {
        // Has the payee signed up yet?
        payee = getUserByEmail(userDAO, contact.getEmail());
        if ( payee != null ) {
          //1) Contact is also a signed up User
          // Payee is User Flow
          // Switch payee to real user if they've signed up.
          invoice.setPayeeId(payee.getId());
          // Check if payee has a bank account if not set holdingAccount(default Payer's DigitalAccount)
          accountSetting(x, payee, payer, invoice);
        } else {
          //2) Contact is just a Contact
          // Payee is Contact FLOW
          // Set invoice external flag on invoice
          invoice.setExternal(true);
          // Real user has not joined yet, set the holding account to the payer's DigitalAccount that we'll
          // send the money to when the payer pays the invoice.
          setDigitalAccount(x, invoice, payer);
        }
      } else {
        //B) User:
        accountSetting(x, payee, payer, invoice);
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
    if ( bA != null ) {
      invoice.setDestinationAccount(bA.getId());
      return true;
    }
    // If Payee does not have a BankAccount for the correct dst currency.
    if ( ! SafetyUtil.equals(invoice.getDestinationCurrency(), "CAD") ) 
      throw new RuntimeException("Sorry this transaction cannot be made at time.");

    return false;
  }

  public void setDigitalAccount(X x, Invoice invoice, User payer){
    // Confirmation that destinationCurrency is CAD done in 'checkIfUserHasAccount'. This flow is not for international payments
    DigitalAccount dA = DigitalAccount.findDefault(x, payer, "CAD");
    if ( dA != null ) {
      invoice.setDestinationAccount(dA.getId());
    } else {
      throw new RuntimeException("UserID " + payer.getId() + " does not have a default CAD DigitalAccount." );
    }
  }

  public void accountSetting(X x, User payee, User payer, Invoice invoice){
    if ( ! checkIfUserHasAccount(x, payee, invoice) )
      // payee has no bankAccount, set the holding account to the payer's DigitalAccount that we'll
      // send the money from when the payer pays the invoice.
      setDigitalAccount(x, invoice, payer);
  }
}
