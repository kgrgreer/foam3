package net.nanopay.invoice.test;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.Address;
import foam.nanos.test.Test;
import net.nanopay.admin.model.ComplianceStatus;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.bank.CABankAccount;
import net.nanopay.invoice.AbliiBillingCron;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.model.Business;
import net.nanopay.tx.model.Transaction;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.Date;

import static foam.mlang.MLang.EQ;

public class AbliiBillingCronTest extends Test {
  private Address ca_ON;
  private Business payer, payee;

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

    createTransaction(x, billingMonth.atDay(5));
    updatePayerCreatedBefore(x, 2019, 2);
    cron.execute(x);

    DAO invoiceDAO = (DAO) x.get("invoiceDAO");
    Invoice invoice = (Invoice) invoiceDAO.find(EQ(Invoice.PAYER_ID, payer.getId()));
    test(invoice.getAmount() == 75, "Billing invoice amount.");
  }

  private void createTransaction(X x, LocalDate created) {
    DAO localTransactionDAO = (DAO) x.get("localTransactionDAO");
    localTransactionDAO.put(
      new Transaction.Builder(x)
        .setPayerId(payer.getId())
        .setPayeeId(payee.getId())
        .setAmount(1000l)
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
    setUpBankAccountForBusiness(x, payer, "11111");

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

  private void setUpBankAccountForBusiness(X x, Business business, String accountNumber) {
    business.getAccounts(x).put(
      new CABankAccount.Builder(x)
        .setAccountNumber(accountNumber)
        .setName("AbliiBillingCronTest Account")
        .setBranchId("00000")
        .setInstitutionNumber("000")
        .setStatus(BankAccountStatus.VERIFIED)
        .build()
    );
  }

  private Date getDate(LocalDate localDate) {
    return Date.from(localDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
  }
}
