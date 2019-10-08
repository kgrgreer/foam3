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
import net.nanopay.model.Business;
import net.nanopay.tx.model.Transaction;
import foam.nanos.session.Session;
import foam.nanos.auth.Group;
import foam.nanos.auth.UserUserJunction;


public class BlacklistTest extends Test {

  @Override
  public void runTest(X x) {  
    DAO accountDAO = (DAO) x.get("accountDAO");
    DAO bareUserDAO = (DAO) x.get("bareUserDAO");
    DAO invoiceDAO = (DAO) x.get("invoiceDAO");
    DAO transactionDAO = (DAO) x.get("transactionDAO");
    DAO groupDAO = (DAO) x.get("groupDAO");

    ////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////// SETUP ////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////

    // Setup the business admin to pay from
    bareUserDAO.where(foam.mlang.MLang.EQ(User.EMAIL, "business@example.com")).removeAll();
    Business myBusiness = new Business();
    myBusiness.setBusinessName("MyBusiness");
    myBusiness.setEmail("busadmin@example.com");
    myBusiness.setGroup("smeBusinessAdmin");
    myBusiness.setEmailVerified(true); // Required to send or receive money.
    myBusiness = (Business) bareUserDAO.put(myBusiness);
    X myBusinessContext = Auth.sudo(x, myBusiness);

    // Setting the external business to pay to
    bareUserDAO.where(foam.mlang.MLang.EQ(User.EMAIL, "evilcorp@example.com")).removeAll();
    Business externalBusiness = new Business();
    externalBusiness.setEmail("evilcorp@example.com");
    externalBusiness.setBusinessName("EvilCorp");
    externalBusiness.setGroup("smeBusinessAdmin");
    externalBusiness.setEmailVerified(true); // Required to send or receive money.
    externalBusiness.setCompliance(ComplianceStatus.PASSED);
    externalBusiness = (Business) bareUserDAO.put(externalBusiness);
    X externalBusinessContext = Auth.sudo(x, externalBusiness);

    // setting up their respective accounts
    accountDAO.where(foam.mlang.MLang.EQ(Account.NAME, "Blacklist Tests myBusiness test account")).removeAll();
    CABankAccount myBusinessBankAccount = new CABankAccount();
    myBusinessBankAccount.setName("Blacklist Tests myBusiness test account");
    myBusinessBankAccount.setDenomination("CAD");
    myBusinessBankAccount.setAccountNumber("12345678");
    myBusinessBankAccount.setInstitution(1);
    myBusinessBankAccount.setBranchId("12345");
    myBusinessBankAccount.setStatus(BankAccountStatus.VERIFIED);
    myBusinessBankAccount = (CABankAccount) myBusiness.getAccounts(myBusinessContext).put_(x, myBusinessBankAccount);

    accountDAO.where(foam.mlang.MLang.EQ(Account.NAME, "Blacklist Tests externalBusiness test account")).removeAll();
    CABankAccount externalBusinessBankAccount = new CABankAccount();
    externalBusinessBankAccount.setName("Blacklist Tests externalBusiness test account");
    externalBusinessBankAccount.setDenomination("CAD");
    externalBusinessBankAccount.setAccountNumber("87654321");
    externalBusinessBankAccount.setInstitution(1);
    externalBusinessBankAccount.setBranchId("54321");
    externalBusinessBankAccount.setStatus(BankAccountStatus.VERIFIED);
    externalBusinessBankAccount = (CABankAccount) externalBusiness.getAccounts(externalBusinessContext).put_(x, externalBusinessBankAccount);

    ///////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////// TEST CODE ///////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////

    Invoice invoice = new Invoice();
    invoice.setAmount(1);
    invoice.setPayerId(myBusiness.getId());
    invoice.setPayeeId(externalBusiness.getId());
    invoice.setDestinationCurrency("CAD");
    invoice.setAccount(myBusinessBankAccount.getId());
    invoice.setDestinationAccount(externalBusinessBankAccount.getId());

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
      Transaction result = (Transaction) transactionDAO.inX(myBusinessContext).put(transaction);
      test(result == null, "Transaction not created until business passes compliance passing proper compliance.");
    } catch (Throwable t) {
      t.printStackTrace();
      test(false, "Unexpected exception: " + t);
    }

    Invoice invoice2 = new Invoice();
    invoice2.setAmount(2);
    invoice2.setPayerId(myBusiness.getId());
    invoice2.setPayeeId(externalBusiness.getId());
    invoice2.setDestinationCurrency("CAD");
    invoice2.setAccount(myBusinessBankAccount.getId());
    invoice2.setDestinationAccount(externalBusinessBankAccount.getId());
    try {
      invoiceDAO.inX(myBusinessContext).put(invoice2);
    } catch (Throwable t) {
      test(true, "Invoice not created until business passes compliance passing proper compliance.");
    }

    // Set compliance to passed, 2FA?, wiring up the user-agent session
    // and trying to put the invoice and payment transaction
    myBusiness = (Business) myBusiness.fclone();
    myBusiness.setCompliance(ComplianceStatus.PASSED);
    myBusiness = (Business) bareUserDAO.put(myBusiness);

    // Create a junction to signify that employee2 is an employee of the business.
    // UserUserJunction junc = new UserUserJunction();
    // junc.setSourceId(employee2.getId());
    // junc.setTargetId(busAdmin.getId());
    // junc.setGroup("smeBusinessAdmin");
    // DAO agentJunctionDAO = (DAO) x.get("agentJunctionDAO");
    // agentJunctionDAO.put(junc);

    // Session session = (Session) busAdminContext.get(Session.class);
    // session.setUserId(busAdmin.getId());
    // session.setAgentId(employee2.getId());
    // busAdminContext = session.applyTo(busAdminContext);

    try {
      invoice2 = (Invoice) invoiceDAO.inX(myBusinessContext).put(invoice2);
    } catch (Throwable t) {
      test(false, "Unexpected exception putting invoice after setting compliance to passed: " + t);
    }

    Transaction transaction2 = new Transaction();
    transaction2.setSourceAccount(invoice2.getAccount());
    transaction2.setDestinationAccount(invoice2.getDestinationAccount());
    transaction2.setPayerId(invoice2.getPayerId());
    transaction2.setPayeeId(invoice2.getPayeeId());
    transaction2.setAmount(invoice2.getAmount());
    transaction2.setInvoiceId(invoice2.getId());

    try {
      Transaction result = (Transaction) transactionDAO.inX(myBusinessContext).put(transaction2);
      test(result != null, "Successfully put the transaction to the TransactionDAO after setting compliance to passed.");
    } catch (Throwable t) {
      test(false, "Unexpected exception putting transaction after setting compliance to passed: " + t);
    }
  }
}
