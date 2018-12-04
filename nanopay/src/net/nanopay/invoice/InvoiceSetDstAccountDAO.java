package net.nanopay.invoice;

import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.NOT;
import static foam.mlang.MLang.INSTANCE_OF;

import java.util.List;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.User;
import foam.util.SafetyUtil;
import net.nanopay.account.DigitalAccount;
import net.nanopay.bank.BankAccount;
import net.nanopay.contacts.Contact;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.model.InvoiceStatus;

// check if Payee is a User or Contact
// if user check if User has a bank account
//    if yes destination account is set to User account
//    else destination account set to Payer owned Holding Account (Digital Account)
// else /* User is a Contact */
//    if Contact has a bank Account destination account set to Contact bank account //TODO: this flow is for future implementation
//    else destination account set to Payer owned Holding Account (Digital Account)

public class InvoiceSetDstAccountDAO extends ProxyDAO {

  public final static String INVOICE_HOLDING_ACCOUNT = "invoice.holdingAccount";

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
    if ( invoice.getStatus() == InvoiceStatus.PENDING_ACCEPTANCE  || invoice.getStatus() == InvoiceStatus.IN_TRANSIT || invoice.getStatus() == InvoiceStatus.DEPOSITING_MONEY || invoice.getPayerId() != currentUser.getId() ||
      ! SafetyUtil.equals(invoice.getDestinationCurrency(), "CAD") || ! SafetyUtil.equals(invoice.getSourceCurrency(), "CAD")) {
      return super.put_(x, obj);
    }

    DAO bareUserDAO = ((DAO) x.get("bareUserDAO")).inX(x);
    User payer = (User) bareUserDAO.find(invoice.getPayerId());
    User payee = (User) bareUserDAO.find(invoice.getPayeeId());

    if ( payer == null ) {
      throw new RuntimeException("Payer of invoiceID" + invoice.getId() + " is not set." );
    }

    DAO contactDAO = ((DAO) x.get("contactDAO")).inX(x);
    Contact contact = (Contact) contactDAO.find(invoice.getPayeeId());

    // What is the payee? A) or B)
    //A) Contact:
    if ( contact != null ) {
      // Has the payee signed up yet?
      payee = getUserByEmail(bareUserDAO, contact.getEmail());
      if ( payee != null ) {
        //1) Contact is also a signed up User
        // Payee is User Flow
        // Switch payee to real user if they've signed up.
        invoice.setPayeeId(contact.getBusinessId());
        // Check if payee has a bank account if not set holdingAccount(default Payer's DigitalAccount)
        if ( auth.check(x, INVOICE_HOLDING_ACCOUNT) ) accountSetting(x, payee, payer, invoice);
      } else {
        //2) Contact is just a Contact
        // Payee is Contact FLOW
        // Set invoice external flag on invoice
        invoice.setExternal(true);
        // Real user has not joined yet, set the holding account to the payer's DigitalAccount that we'll
        // send the money to when the payer pays the invoice.
        if ( auth.check(x, INVOICE_HOLDING_ACCOUNT) ) setDigitalAccount(x, invoice, payer);
      }
    } else {
      //B) User:
      if ( auth.check(x, INVOICE_HOLDING_ACCOUNT) )  accountSetting(x, payee, payer, invoice);
    }

    return super.put_(x, invoice);
  }

  public User getUserByEmail(DAO bareUserDAO, String emailAddress) {
    User user = (User) bareUserDAO.find(AND(
      EQ(User.EMAIL, emailAddress),
      NOT(INSTANCE_OF(Contact.class))));
    if ( user != null ) return user;
    return null;
  }

  public boolean checkIfUserHasBankAccount(X x, User payee, Invoice invoice){
    // Check if payee has a default BankAccount for invoice.getDestinationCurrency()
    BankAccount bA = BankAccount.findDefault(x, payee, invoice.getDestinationCurrency());
    if ( bA != null ) {
      invoice.setDestinationAccount(bA.getId());
      return true;
    }
    return false;
  }

  public void setDigitalAccount(X x, Invoice invoice, User payer){
    // Confirmation that destinationCurrency is CAD done in 'checkIfUserHasBankAccount'. This flow is not for international payments
    DigitalAccount dA = DigitalAccount.findDefault(x, payer, "CAD");
    if ( dA != null ) {
      invoice.setDestinationAccount(dA.getId());
    } else {
      throw new RuntimeException("UserID " + payer.getId() + " does not have a default CAD DigitalAccount." );
    }
  }

  public void accountSetting(X x, User payee, User payer, Invoice invoice){
    if ( ! checkIfUserHasBankAccount(x, payee, invoice) )
      // payee has no bankAccount, set the holding account to the payer's DigitalAccount that we'll
      // send the money from when the payer pays the invoice.
      setDigitalAccount(x, invoice, payer);
  }
}
