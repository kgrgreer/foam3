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
    setDelegate(delegate);
    setX(x);
  }

  protected BankAccount bA;

  @Override
  public FObject put_(X x, FObject obj) {
    if ( obj == null ) {
      throw new RuntimeException("Cannot put null");
    }
    AuthService auth = (AuthService) x.get("auth");
    Invoice invoice = (Invoice) obj;
    DAO userDAO = ((DAO) x.get("localUserDAO")).inX(x);
    User payee = (User) userDAO.find(invoice.getPayeeId());
    if ( payee == null ) { return super.put_(x, invoice); }
    if ( auth.check(x, "invoice.holdingAccount") && 
      invoice.getStatus() == InvoiceStatus.PENDING_ACCEPTANCE && 
      checkIfUserHasBankAccount(x, payee, invoice)) {
      // Try to deposit
      doTransactionToBankAccount(x, invoice);
      return invoice;
    }
    return super.put_(x, invoice);
  }

  private void doTransactionToBankAccount(X x, Invoice invoice) {
    DAO transactionDAO = (DAO) x.get("transactionDAO");
    try {
      Transaction txn = new Transaction();
      txn.setPayeeId(invoice.getPayeeId());
      txn.setSourceAccount(invoice.getDestinationAccount());
      txn.setDestinationAccount(bA.getId());
      txn.setAmount(invoice.getAmount());
      txn.setPayerId(invoice.getPayerId());
      txn.setInvoiceId(invoice.getId());
      invoice.setDestinationAccount(bA.getId());
      txn = (Transaction)transactionDAO.put(txn);
    } catch (Exception e) {
      throw new RuntimeException("Auto transfer of funds from InvoiceId: " + invoice.getId() + " to payeeId: " + invoice.getPayeeId() + " failed.");
    }
  }

  private boolean checkIfUserHasBankAccount(X x, User payee, Invoice invoice){
    // Check if payee has a default BankAccount for invoice.getDestinationCurrency()
    bA = BankAccount.findDefault(x, payee, invoice.getDestinationCurrency());
    return bA != null;
  }
}
