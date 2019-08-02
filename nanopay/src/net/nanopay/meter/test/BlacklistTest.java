package net.nanopay.meter.test;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.nanos.test.Test;
import foam.util.Auth;
import net.nanopay.account.Account;
import net.nanopay.admin.model.ComplianceStatus;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.bank.CABankAccount;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.tx.model.Transaction;


public class BlacklistTest extends Test {

  @Override
  public void runTest(X x) {  
    DAO accountDAO = (DAO) x.get("accountDAO");
    DAO bareUserDAO = (DAO) x.get("bareUserDAO");
    DAO invoiceDAO = (DAO) x.get("invoiceDAO");
    DAO transactionDAO = (DAO) x.get("transactionDAO");

    ////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////// SETUP ////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////

    // Setup the business admin and account to pay from
    bareUserDAO.where(foam.mlang.MLang.EQ(User.EMAIL, "busadmin@example.com")).removeAll();
    User busAdmin = new User();
    busAdmin.setEmail("busadmin@example.com");
    busAdmin.setGroup("smeBusinessAdmin");
    busAdmin.setEmailVerified(true); // Required to send or receive money.
    busAdmin = (User) bareUserDAO.put(busAdmin);
    X busAdminContext = Auth.sudo(x, busAdmin);

    accountDAO.where(foam.mlang.MLang.EQ(Account.NAME, "Blacklist Tests business admin test account")).removeAll();
    CABankAccount busAdminBankAccount = new CABankAccount();
    busAdminBankAccount.setName("Blacklist Tests business admin test account");
    busAdminBankAccount.setDenomination("CAD");
    busAdminBankAccount.setAccountNumber("12345678");
    busAdminBankAccount.setInstitution(1);
    busAdminBankAccount.setBranchId("12345");
    busAdminBankAccount.setStatus(BankAccountStatus.VERIFIED);
    busAdminBankAccount = (CABankAccount) busAdmin.getAccounts(busAdminContext).put_(x, busAdminBankAccount);


    // Setup destination for invoice
    bareUserDAO.where(foam.mlang.MLang.EQ(User.EMAIL, "employee2@example.com")).removeAll();
    User employee2 = new User();
    employee2.setEmail("employee2@example.com");
    employee2.setGroup("smeBusinessEmployee");
    employee2.setEmailVerified(true); // Required to send or receive money.
    employee2.setCompliance(ComplianceStatus.PASSED);
    employee2 = (User) bareUserDAO.put(employee2);
    //X employee2Context = Auth.sudo(x, employee2);


    ///////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////// TEST CODE ///////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////

    Invoice invoice = new Invoice();
    invoice.setAmount(1);
    invoice.setPayerId(busAdmin.getId());
    invoice.setPayeeId(employee2.getId());
    invoice.setDestinationCurrency("CAD");
    invoice.setAccount(busAdminBankAccount.getId());

    // Use system context to create invoice since invoice must exist for testing
    // the `transaction` below.
    invoice = (Invoice) invoiceDAO.put(invoice);

    Transaction transaction = new Transaction();
    transaction.setSourceAccount(invoice.getAccount());
    transaction.setDestinationAccount(invoice.getDestinationAccount());
    transaction.setPayerId(invoice.getPayerId());
    transaction.setPayeeId(invoice.getPayeeId());
    transaction.setAmount(invoice.getAmount());
    transaction.setInvoiceId(invoice.getId());
    try { 
      Transaction result = (Transaction) transactionDAO.inX(busAdminContext).put(transaction);
      test(result == null, "Transaction not created until business passes compliance passing proper compliance.");
    } catch (Throwable t) {
      t.printStackTrace();
      test(false, "Unexpected exception: " + t);
    }

    Invoice invoice2 = new Invoice();
    invoice2.setAmount(2);
    invoice2.setPayerId(busAdmin.getId());
    invoice2.setPayeeId(employee2.getId());
    invoice2.setDestinationCurrency("CAD");
    invoice2.setAccount(busAdminBankAccount.getId());
    try {
      invoiceDAO.inX(busAdminContext).put(invoice2);
    } catch (Throwable t) {
      test(true, "Invoice not created until business passes compliance passing proper compliance.");
    }

    // Set compliance to passed and try to put the invoice and transaction again
    busAdmin = (User) busAdmin.fclone();
    busAdmin.setCompliance(ComplianceStatus.PASSED);
    busAdmin = (User) bareUserDAO.put(busAdmin);
    busAdminContext = Auth.sudo(x, busAdmin);

    invoice2 = (Invoice) invoiceDAO.inX(busAdminContext).put(invoice2);
    Transaction transaction2 = new Transaction();
    transaction2.setSourceAccount(invoice2.getAccount());
    transaction2.setDestinationAccount(invoice2.getDestinationAccount());
    transaction2.setPayerId(invoice2.getPayerId());
    transaction2.setPayeeId(invoice2.getPayeeId());
    transaction2.setAmount(invoice2.getAmount());
    transaction2.setInvoiceId(invoice2.getId());

    try {
      Transaction result = (Transaction) transactionDAO.inX(busAdminContext).put(transaction2);
      test(result != null, "Successfully put the transaction to the TransactionDAO after setting compliance to passed.");
    } catch (Throwable t) {
      test(false, "Unexpected exception putting transaction: " + t);
    }
  }
}
