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

    // We only care about invoices whose status is pendingAcceptance, inTransit, depositingMoney
    if ( invoice.getStatus() == InvoiceStatus.PENDING_ACCEPTANCE  ||
      invoice.getStatus() == InvoiceStatus.IN_TRANSIT ||
      invoice.getStatus() == InvoiceStatus.DEPOSITING_MONEY ||
      invoice.getPayerId() != currentUser.getId()) {
      return super.put_(x, obj);
  }

    DAO bareUserDAO = ((DAO) x.get("bareUserDAO")).inX(x);
    DAO contactDAO = ((DAO) x.get("contactDAO")).inX(x);
    User payer = (User) bareUserDAO.find(invoice.getPayerId());
    User payee = (User) bareUserDAO.find(invoice.getPayeeId());


    if ( payer == null ) {
      throw new RuntimeException("Payer of invoiceID" + invoice.getId() + " is not set." );
    }
    // If payee is a contact:
    // If payee is signed up as an agent, set payeeId to be their business
    // If not, set the external flag to true
    Contact potentialContact = (Contact) contactDAO.find(payee.getId());
    if ( potentialContact != null ) { // Payee is a contact
      User signedUpPayee = getUserByEmail(bareUserDAO, potentialContact.getEmail());
      if ( signedUpPayee != null ) {  // Contact has signed up, set payee id to be the assosciated business
        invoice.setPayeeId(potentialContact.getBusinessId());
      } else { // Contact has not signed up
        invoice.setExternal(true);
      }
    }

    if ( auth.check(x, INVOICE_HOLDING_ACCOUNT) )  { // Confirms that payer is an ablii user
      setDestinationAccount(x, payee, payer, invoice);
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

  public void setDestinationAccount(X x, User payee, User payer, Invoice invoice){
    // if payee has default account in destinationCurrency, set it as destination account
    BankAccount payeeBankAccount = BankAccount.findDefault(x, payee, invoice.getDestinationCurrency());
    if ( payeeBankAccount != null ) { 
      invoice.setDestinationAccount(payeeBankAccount.getId());
      return;
    }
    // if payee has no bank account, set the destination account to the payers digitalAccount in the destinationCurrency
    // NOTE: the following code can be enabelled for holding account capability
    DigitalAccount payerDigitalAccount = DigitalAccount.findDefault(x, payer, invoice.getDestinationCurrency());
    if ( payerDigitalAccount != null ) {
      invoice.setDestinationAccount(payerDigitalAccount.getId());
      return;
    }   
    throw new RuntimeException("UserID " + payee.getId() + " does not have a default account in" + invoice.getDestinationCurrency() );

  }
}
