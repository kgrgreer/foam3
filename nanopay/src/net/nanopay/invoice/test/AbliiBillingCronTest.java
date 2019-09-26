package net.nanopay.invoice.test;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.Address;
import foam.nanos.test.Test;
import net.nanopay.account.Account;
import net.nanopay.admin.model.ComplianceStatus;
import net.nanopay.bank.BankAccount;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.bank.CABankAccount;
import net.nanopay.invoice.AbliiBillingCron;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.model.Business;
import net.nanopay.tx.AbliiTransaction;
import net.nanopay.tx.model.Transaction;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.Date;

import static foam.mlang.MLang.*;

public class AbliiBillingCronTest extends Test {
  private Address ca_ON;
  private Address us_NY;
  private Business payer, payee;
  private BankAccount payerBankAccount;
  private final long NANOPAY_FEE_ACCOUNT_ID = 2;

  public void runTest(X x) {
    setUpAddress(x);
    setUpBusinesses(x);
    testSept(x);
    testOct(x);
//    testNov(x);
//    testDec(x);
  }

  /**
   * The billing month is September 2019.
   */
  private void testSept(X x) {
    YearMonth billingMonth = YearMonth.of(2019, 9);
    LocalDate startDate = billingMonth.atDay(1);
    LocalDate endDate = billingMonth.atEndOfMonth();
    AbliiBillingCron cron = new AbliiBillingCron(startDate, endDate);
    DAO invoiceDAO = (DAO) x.get("invoiceDAO");
    DAO accountDAO = (DAO) x.get("localAccountDAO");
    Account feeAccount = (Account) accountDAO.find(NANOPAY_FEE_ACCOUNT_ID);
    Invoice invoice;

    // business created before 2019.2
    createAbliiTransaction(x, billingMonth.atDay(5));
    updatePayerCreatedBefore(x, 2019, 2, 1);
    cron.execute(x);
    invoice = (Invoice) invoiceDAO.find(
      AND(
        EQ(Invoice.PAYER_ID, payer.getId()),
        EQ(Invoice.PAYEE_ID, feeAccount.getOwner())));
    test(invoice.getAmount() == 0, "September Billing invoice amount.");

    // business created before 2019.7
    createAbliiTransaction(x, billingMonth.atDay(5));
    updatePayerCreatedBefore(x, 2019, 7, 1);
    cron.execute(x);
    invoice = (Invoice) invoiceDAO.find(
      AND(
        EQ(Invoice.PAYER_ID, payer.getId()),
        EQ(Invoice.PAYEE_ID, feeAccount.getOwner())));
    test(invoice.getAmount() == 0, "September Billing invoice amount.");

    // business created before 2019.9
    createAbliiTransaction(x, billingMonth.atDay(5));
    updatePayerCreatedBefore(x, 2019, 9, 1);
    cron.execute(x);
    invoice = (Invoice) invoiceDAO.find(
      AND(
        EQ(Invoice.PAYER_ID, payer.getId()),
        EQ(Invoice.PAYEE_ID, feeAccount.getOwner())));
    test(invoice.getAmount() == 0, "September Billing invoice amount.");

    // business created before 2019.9.16
    createAbliiTransaction(x, billingMonth.atDay(5));
    createAbliiTransaction(x, billingMonth.atDay(20));
    updatePayerCreatedBefore(x, 2019, 9, 16);
    cron.execute(x);
    invoice = (Invoice) invoiceDAO.find(
      AND(
        EQ(Invoice.PAYER_ID, payer.getId()),
        EQ(Invoice.PAYEE_ID, feeAccount.getOwner())));
    test(invoice.getAmount() == 0, "September Billing invoice amount.");

    // business created before 2019.10.1
    createAbliiTransaction(x, billingMonth.atDay(20));
    updatePayerCreatedBefore(x, 2019, 9, 20);
    (new AbliiBillingCron(billingMonth.atDay(19), endDate)).execute(x);
    invoice = (Invoice) invoiceDAO.find(
      AND(
        EQ(Invoice.PAYER_ID, payer.getId()),
        EQ(Invoice.PAYEE_ID, feeAccount.getOwner())));
    test(invoice.getAmount() == 75, "September Billing invoice amount.");
  }

  /**
   * The billing month is October 2019.
   */
  private void testOct(X x) {
    YearMonth billingMonth = YearMonth.of(2019, 10);
    LocalDate startDate = billingMonth.atDay(1);
    LocalDate endDate = billingMonth.atEndOfMonth();
    AbliiBillingCron cron = new AbliiBillingCron(startDate, endDate);
    DAO invoiceDAO = (DAO) x.get("invoiceDAO");
    DAO accountDAO = (DAO) x.get("localAccountDAO");
    Account feeAccount = (Account) accountDAO.find(NANOPAY_FEE_ACCOUNT_ID);
    Invoice invoice;

    // business created before 2019.2
    createAbliiTransaction(x, billingMonth.atDay(5));
    updatePayerCreatedBefore(x, 2019, 2, 1);
    cron.execute(x);
    invoice = (Invoice) invoiceDAO.find(
      AND(
        EQ(Invoice.PAYER_ID, payer.getId()),
        EQ(Invoice.PAYEE_ID, feeAccount.getOwner())));
    test(invoice.getAmount() == 0, "October Billing invoice amount.");

    // business created before 2019.7
    createAbliiTransaction(x, billingMonth.atDay(5));
    updatePayerCreatedBefore(x, 2019, 7, 1);
    cron.execute(x);
    invoice = (Invoice) invoiceDAO.find(
      AND(
        EQ(Invoice.PAYER_ID, payer.getId()),
        EQ(Invoice.PAYEE_ID, feeAccount.getOwner())));
    test(invoice.getAmount() == 0, "October Billing invoice amount.");

    // business created before 2019.9
    createAbliiTransaction(x, billingMonth.atDay(5));
    updatePayerCreatedBefore(x, 2019, 9, 1);
    cron.execute(x);
    invoice = (Invoice) invoiceDAO.find(
      AND(
        EQ(Invoice.PAYER_ID, payer.getId()),
        EQ(Invoice.PAYEE_ID, feeAccount.getOwner())));
    test(invoice.getAmount() == 0, "October Billing invoice amount.");

    // business created before 2019.9.16
    createAbliiTransaction(x, billingMonth.atDay(5));
    updatePayerCreatedBefore(x, 2019, 9, 16);
    cron.execute(x);
    invoice = (Invoice) invoiceDAO.find(
      AND(
        EQ(Invoice.PAYER_ID, payer.getId()),
        EQ(Invoice.PAYEE_ID, feeAccount.getOwner())));
    test(invoice.getAmount() == 0, "October Billing invoice amount.");

    // business created before 2019.10.1
    createAbliiTransaction(x, billingMonth.atDay(5));
    updatePayerCreatedBefore(x, 2019, 10, 1);
    cron.execute(x);
    invoice = (Invoice) invoiceDAO.find(
      AND(
        EQ(Invoice.PAYER_ID, payer.getId()),
        EQ(Invoice.PAYEE_ID, feeAccount.getOwner())));
    test(invoice.getAmount() == 75, "October Billing invoice amount.");
  }

  private void createAbliiTransaction(X x, LocalDate created) {
    DAO invoiceDAO = (DAO) x.get("invoiceDAO");
    Invoice invoice = (Invoice) invoiceDAO.put(
      new Invoice.Builder(x)
        .setPayerId(payer.getId())
        .setPayeeId(payee.getId())
        .setAmount(1000L)
        .build()
    ).fclone();

    DAO localTransactionDAO = (DAO) x.get("localTransactionDAO");
    Transaction transaction =
      new AbliiTransaction.Builder(x)
        .setInvoiceId(invoice.getId())
        .setPayerId(payer.getId())
        .setPayeeId(payee.getId())
        .setSourceAccount(payerBankAccount.getId())
        .setAmount(invoice.getAmount())
        .build();
    transaction = (Transaction) localTransactionDAO.put(transaction).fclone();
    transaction.setCreated(getDate(created));
    localTransactionDAO.put(transaction);
  }

  private void updatePayerCreatedBefore(X x, int year, int month, int day) {
    LocalDate localDate = LocalDate.of(year, month, day).minusDays(1);
    DAO localBusinessDAO = (DAO) x.get("localBusinessDAO");
    payer.setCreated(getDate(localDate));
    payer = (Business) localBusinessDAO.put(payer).fclone();
  }

  private void setUpAddress(X x) {
    ca_ON = new Address.Builder(x)
      .setCountryId("CA")
      .setRegionId("ON")
      .build();
    us_NY = new Address.Builder(x)
      .setCountryId("US")
      .setRegionId("NY")
      .build();
  }

  private void setUpBusinesses(X x) {
    payer = findOrCreateBusiness(x, "payer@test.com");
    payerBankAccount = setUpBankAccountForBusiness(x, payer, "11111");

    payee = findOrCreateBusiness(x, "payee@test.com");
    setUpBankAccountForBusiness(x, payee, "22222");
  }

  private Business findOrCreateBusiness(X x, String email) {
    DAO localBusinessDAO = (DAO) x.get("localBusinessDAO");
    Business business = (Business) localBusinessDAO.find(EQ(Business.EMAIL, email));
    if ( business == null ) {
      business = new Business.Builder(x)
        .setEmail(email)
        .setBusinessName("AbliiBillingCronTest Business")
        .setAddress(ca_ON)
        .build();
    }
    business.setEmailVerified(true);
    business.setCompliance(ComplianceStatus.PASSED);
    return (Business) localBusinessDAO.put(business).fclone();
  }

  private BankAccount setUpBankAccountForBusiness(X x, Business business, String accountNumber) {
    return (BankAccount) business.getAccounts(x).put(
      new CABankAccount.Builder(x)
        .setAccountNumber(accountNumber)
        .setName("AbliiBillingCronTest Account")
        .setBranchId("00000")
        .setInstitutionNumber("000")
        .setStatus(BankAccountStatus.VERIFIED)
        .build()
    ).fclone();
  }

  private Date getDate(LocalDate localDate) {
    return Date.from(localDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
  }
}
