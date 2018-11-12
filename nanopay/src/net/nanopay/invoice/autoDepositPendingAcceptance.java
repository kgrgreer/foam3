package net.nanopay.invoice;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.AuthenticationException;
import foam.nanos.auth.AuthorizationException;
import foam.nanos.auth.User;
import foam.util.Auth;
import net.nanopay.account.Account;
import net.nanopay.bank.BankAccount;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.model.InvoiceStatus;
import net.nanopay.tx.model.Transaction;


// check if Payee has a bankAccount to deposit any PENDING_ACCEPTANCE invoices

public class AutoDepositPendingAcceptance extends ProxyDAO {
  public AutoDepositPendingAcceptance(X x, DAO delegate) {
    super(x, delegate);
  }
  protected BankAccount bA;
  @Override
  public FObject put_(X x, FObject obj) {
    if ( obj == null ) {
      throw new RuntimeException("Cannot put null");
    }
    System.out.println("In auto deposit decorator");
    AuthService auth = (AuthService) x.get("auth");
    Invoice invoice = (Invoice) obj;
    DAO userDAO = ((DAO) x.get("localUserDAO")).inX(x);
    User payee = (User) userDAO.find(invoice.getPayeeId());
    if ( payee == null ) { return super.put_(x, invoice); }
    boolean blah = checkIfUserHasBankAccount(x, payee, invoice);
    System.out.println("so far so good: invoice.getStatus() = " + invoice.getStatus() + " checkIfUserHasBankAccount(x, payee, invoice) = " + blah );
    if ( auth.check(x, "invoice.holdingAccount") && invoice.getStatus() == InvoiceStatus.PENDING_ACCEPTANCE && blah && ! invoice.getAutoPay()) {
      // Try to deposit
      doTransactionToBankAccount(x, invoice);
    }
    return super.put_(x, invoice);
  }

  private void doTransactionToBankAccount(X x, Invoice invoice) {
    System.out.println("about to make the transaction to payee ");
    DAO transactionDAO = (DAO) x.get("transactionDAO");
    try {
      Transaction txn = new Transaction();
      txn.setPayeeId(invoice.getPayeeId());
      txn.setSourceAccount(invoice.getDestinationAccount());
      txn.setDestinationAccount(bA.getId());
      txn.setAmount(invoice.getAmount());
      txn.setPayerId(invoice.getPayerId());
      invoice.setDestinationAccount(bA.getId());
      invoice.setAutoPay(true);
      transactionDAO.put(txn);
      System.out.println("@ Auto deposit: InvoiceStatus = " + invoice.getStatus() + "trans Status -" + txn.getStatus() + " invoice payment -" + invoice.getPaymentMethod());
    } catch (Exception e) {
      System.out.println("ERROR in trans auto dep");
    }
    
  }

  private boolean checkIfUserHasBankAccount(X x, User payee, Invoice invoice){
    // Check if payee has a default BankAccount for invoice.getDestinationCurrency()
    bA = BankAccount.findDefault(x, payee, invoice.getDestinationCurrency());
    return bA != null;
  }
}
