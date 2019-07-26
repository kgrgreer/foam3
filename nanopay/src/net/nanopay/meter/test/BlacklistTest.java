package net.nanopay.meter.test;

import foam.core.X;
import foam.dao.*;
import foam.nanos.test.Test;
import foam.nanos.auth.AuthorizationException;
import foam.nanos.auth.User;
import foam.util.Auth;

import net.nanopay.account.Account;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.bank.CABankAccount;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.tx.model.Transaction;
import net.nanopay.admin.model.ComplianceStatus;


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
    invoice = (Invoice) invoiceDAO.inX(busAdminContext).put(invoice);

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

    // Set compliance to passed and try to put the transaction again
    busAdmin = (User) busAdmin.fclone();
    busAdmin.setCompliance(ComplianceStatus.PASSED);
    busAdmin = (User) bareUserDAO.put(busAdmin);
    busAdminContext = Auth.sudo(x, busAdmin);
    try {
      Transaction result = (Transaction) transactionDAO.inX(busAdminContext).put(transaction);
      test(result != null, "Successfully put the transaction to the TransactionDAO after setting compliance to passed.");
    } catch (Throwable t) {
      test(false, "Unexpected exception putting transaction: " + t);
    }
  }
}