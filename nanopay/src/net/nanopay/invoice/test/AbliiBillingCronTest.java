package net.nanopay.invoice.test;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.Address;
import foam.nanos.test.Test;
import net.nanopay.admin.model.ComplianceStatus;
import net.nanopay.bank.BankAccount;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.bank.CABankAccount;
import net.nanopay.invoice.AbliiBillingCron;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.model.Business;
import net.nanopay.tx.AbliiTransaction;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.Date;

import static foam.mlang.MLang.EQ;

public class AbliiBillingCronTest extends Test {
  private Address ca_ON;
  private Business payer, payee;
  private BankAccount payerBankAccount;

  public void runTest(X x) {
    setUpAddress(x);
    setUpBusinesses(x);
    test1(x);
  }

  private void test1(X x) {
    YearMonth billingMonth = YearMonth.of(2019, 9);
    LocalDate startDate = billingMonth.atDay(1);
    LocalDate endDate = billingMonth.atEndOfMonth();
    AbliiBillingCron cron = new AbliiBillingCron(startDate, endDate);

    createAbliiTransaction(x, billingMonth.atDay(5));
    updatePayerCreatedBefore(x, 2019, 2);
    cron.execute(x);

    DAO invoiceDAO = (DAO) x.get("invoiceDAO");
    Invoice invoice = (Invoice) invoiceDAO.find(EQ(Invoice.PAYER_ID, payer.getId()));
    test(invoice.getAmount() == 0, "Billing invoice amount.");
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
    localTransactionDAO.put(
      new AbliiTransaction.Builder(x)
        .setInvoiceId(invoice.getId())
        .setPayerId(payer.getId())
        .setPayeeId(payee.getId())
        .setSourceAccount(payerBankAccount.getId())
        .setAmount(invoice.getAmount())
        .setCreated(getDate(created))
        .build()
    );
  }

  private void updatePayerCreatedBefore(X x, int year, int month) {
    LocalDate localDate = LocalDate.of(year, month, 1).minusDays(1);
    DAO localBusinessDAO = (DAO) x.get("localBusinessDAO");
    payer.setCreated(getDate(localDate));
    payer = (Business) localBusinessDAO.put(payer).fclone();
  }

  private void setUpAddress(X x) {
    ca_ON = new Address.Builder(x)
      .setCountryId("CA")
      .setRegionId("ON")
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
