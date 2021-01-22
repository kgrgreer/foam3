package net.nanopay.invoice.test;

import foam.core.X;
import foam.dao.DAO;
import foam.dao.GUIDDAO;
import foam.dao.MDAO;
import foam.dao.SequenceNumberDAO;
import foam.nanos.auth.Address;
import foam.nanos.auth.User;
import foam.nanos.test.Test;
import net.nanopay.account.Account;
import net.nanopay.account.DigitalAccount;
import net.nanopay.fx.ascendantfx.AscendantFXUser;
import net.nanopay.invoice.BillingInvoicesCron;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.model.InvoiceStatus;
import net.nanopay.tx.InvoicedFeeLineItem;
import net.nanopay.tx.TransactionLineItem;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.Date;

public class BillingInvoicesCronTest extends Test {
  private User owner, payer, payee;
  private Account ownerAccount, payerAccount, payeeAccount, payeeUSDAccount;
  private DAO localAccountDAO, localUserDAO, localTransactionDAO, ascendantFXUserDAO;

  public void runTest(X x) {
    x = setUpDAOs(x);
    setUpUsers(x);
    setUpAccounts(x);

    resetTransactions(x);
    Test_BusinessCreatedBeforeFeb2019(x);

    resetTransactions(x);
    Test_BusinessCreatedBetweenFeb1andJune30_2019(x);

    resetTransactions(x);
    Test_BusinessCreatedBetweenJuly1andAug31_2019(x);

    resetTransactions(x);
    Test_BusinessCreatedBetweenSept1andSept15_2019(x);

    resetTransactions(x);
    Test_BusinessCreatedAfterSept152019(x);
  }

  private X setUpDAOs(X x) {
    x = x.put("localUserDAO", new SequenceNumberDAO(new MDAO(User.getOwnClassInfo())));
    x = x.put("invoiceDAO", new SequenceNumberDAO(new MDAO(Invoice.getOwnClassInfo())));
    x = x.put("localAccountDAO", new GUIDDAO(new MDAO(Account.getOwnClassInfo())));
    x = x.put("localTransactionDAO", new GUIDDAO(new MDAO(Transaction.getOwnClassInfo())));
    x = x.put("ascendantFXUserDAO", new SequenceNumberDAO(new MDAO(AscendantFXUser.getOwnClassInfo())));

    localUserDAO        = (DAO) x.get("localUserDAO");
    localAccountDAO     = (DAO) x.get("localAccountDAO");
    localTransactionDAO = (DAO) x.get("localTransactionDAO");
    ascendantFXUserDAO  = (DAO) x.get("ascendantFXUserDAO");
    return x;
  }

  private void setUpUsers(X x) {
    owner = createUser(x, "Fee owner");
    payer = createUser(x, "Payer business");
    payee = createUser(x, "Payee business");
  }

  private void setUpAccounts(X x) {
    ownerAccount = createAccount(x, owner, "CAD");
    payerAccount = createAccount(x, payer, "CAD");
    payeeAccount = createAccount(x, payee, "CAD");
    payeeUSDAccount = createAccount(x, payee, "USD");
  }

  private void resetTransactions(X x) {
    localTransactionDAO.removeAll();
    createTransaction(x, LocalDate.of(2019, 9, 15), payeeAccount, 75);
    createTransaction(x, LocalDate.of(2019, 9, 16), payeeAccount, 75);
    createTransaction(x, LocalDate.of(2019, 10, 1), payeeAccount, 75);
    createTransaction(x, LocalDate.of(2019, 12, 1), payeeAccount, 75);
    createTransaction(x, LocalDate.of(2020, 1, 1), payeeAccount, 75);
  }

  private void Test_BusinessCreatedBeforeFeb2019(X x) {
    updatePayerCreated(x, LocalDate.of(2019, 1, 1));

    test(true, "Billing for September 2019 - Business created before Feb in 2019");
    YearMonth sept_2019 = YearMonth.of(2019, 9);
    Invoice invoice = generateMonthlyBillingInvoice(x, sept_2019);
    test(invoice.getAmount() == 0, "-> No fee charge for domestic payments");

    createTransaction(x, LocalDate.of(2019, 9, 16), payeeUSDAccount, 500);
    invoice = generateMonthlyBillingInvoice(x, sept_2019);
    test(invoice.getAmount() == 500
      && invoice.getStatus() == InvoiceStatus.SCHEDULED
      , "-> Charge fee for international payment immediately");

    // AscendantFX user
    ascendantFXUserDAO.put(
      new AscendantFXUser.Builder(x)
        .setUser(payer.getId())
        .build()
    );
    invoice = generateMonthlyBillingInvoice(x, sept_2019);
    test(invoice.getAmount() == 0, "-> No fee charge (domestic + international) for AscendantFX user");
    ascendantFXUserDAO.removeAll();

    test(true, "-> Billing after promotion");
    LocalDate oct1_2019 = LocalDate.of(2019, 10, 1);
    LocalDate jan1_2020 = LocalDate.of(2020, 1, 1);
    createTransaction(x, oct1_2019, payeeUSDAccount, 500);
    invoice = generateBillingInvoice(x, oct1_2019, jan1_2020);
    test(invoice.getAmount() == 500 + 75 + 75 + 75
        && invoice.getStatus() == InvoiceStatus.SCHEDULED
      , "   -> Charge domestic and international fees");
    test(invoice.getPaymentDate().compareTo(new Date()) == 1, "-> Billing invoice payment date should be scheduled");
  }

  private void Test_BusinessCreatedBetweenFeb1andJune30_2019(X x) {
    updatePayerCreated(x, LocalDate.of(2019, 6, 1));

    test(true, "Billing for September 2019 - Business created between February 1 and June 30 in 2019");
    YearMonth sept_2019 = YearMonth.of(2019, 9);
    Invoice invoice = generateMonthlyBillingInvoice(x, sept_2019);
    test(invoice.getAmount() == 0, "-> No fee charge for domestic payments");

    createTransaction(x, LocalDate.of(2019, 9, 16), payeeUSDAccount, 500);
    invoice = generateMonthlyBillingInvoice(x, sept_2019);
    test(invoice.getAmount() == 500
        && invoice.getStatus() == InvoiceStatus.SCHEDULED
      , "-> Charge fee for international payment immediately");

    // AscendantFX user
    ascendantFXUserDAO.put(
      new AscendantFXUser.Builder(x)
        .setUser(payer.getId())
        .build()
    );
    invoice = generateMonthlyBillingInvoice(x, sept_2019);
    test(invoice.getAmount() == 0, "-> No fee charge (domestic + international) for AscendantFX user");
    ascendantFXUserDAO.removeAll();

    test(true, "-> Billing after promotion");
    LocalDate oct1_2019 = LocalDate.of(2019, 10, 1);
    LocalDate jan1_2020 = LocalDate.of(2020, 1, 1);
    createTransaction(x, oct1_2019, payeeUSDAccount, 500);
    invoice = generateBillingInvoice(x, oct1_2019, jan1_2020);
    test(invoice.getAmount() == 500 + 75 + 75 + 75
        && invoice.getStatus() == InvoiceStatus.SCHEDULED
      , "   -> Charge domestic and international fees");
    test(invoice.getPaymentDate().compareTo(new Date()) == 1, "-> Billing invoice payment date should be scheduled");
  }

  private void Test_BusinessCreatedBetweenJuly1andAug31_2019(X x) {
    updatePayerCreated(x, LocalDate.of(2019, 8, 15));

    test(true, "Billing from September to November 2019 - Business created between July 1 and August 31 in 2019");
    LocalDate sept1_2019 = LocalDate.of(2019, 9, 1);
    LocalDate nov30_2019 = LocalDate.of(2019, 11, 30);
    Invoice invoice = generateBillingInvoice(x, sept1_2019, nov30_2019);
    test(invoice.getAmount() == 0, "-> No fee charge for domestic payments");

    createTransaction(x, LocalDate.of(2019, 9, 16), payeeUSDAccount, 500);
    createTransaction(x, LocalDate.of(2019, 10, 1), payeeUSDAccount, 500);
    invoice = generateBillingInvoice(x, sept1_2019, nov30_2019);
    test(invoice.getAmount() == 500 + 500
        && invoice.getStatus() == InvoiceStatus.SCHEDULED
      , "-> Charge fee for international payment immediately");

    // AscendantFX user
    ascendantFXUserDAO.put(
      new AscendantFXUser.Builder(x)
        .setUser(payer.getId())
        .build()
    );
    invoice = generateBillingInvoice(x, sept1_2019, nov30_2019);
    test(invoice.getAmount() == 500, "-> Charge domestic and international fees for AscendantFX user starting from October");
    ascendantFXUserDAO.removeAll();

    test(true, "-> Billing after promotion");
    LocalDate dec1_2019 = LocalDate.of(2019, 10, 1);
    LocalDate jan1_2020 = LocalDate.of(2020, 1, 1);
    createTransaction(x, dec1_2019, payeeUSDAccount, 500);
    invoice = generateBillingInvoice(x, dec1_2019, jan1_2020);
    test(invoice.getAmount() == 500 + 500 + 75 + 75
        && invoice.getStatus() == InvoiceStatus.SCHEDULED
      , "   -> Charge domestic and international fees");
    test(invoice.getPaymentDate().compareTo(new Date()) == 1, "-> Billing invoice payment date should be scheduled");
  }

  private void Test_BusinessCreatedBetweenSept1andSept15_2019(X x) {
    updatePayerCreated(x, LocalDate.of(2019, 9, 12));

    test(true, "Billing from September to December 2019 - Business created between September 1 and September 15 in 2019");
    LocalDate sept1_2019 = LocalDate.of(2019, 9, 1);
    LocalDate dec31_2019 = LocalDate.of(2019, 12, 31);
    Invoice invoice = generateBillingInvoice(x, sept1_2019, dec31_2019);
    test(invoice.getAmount() == 0, "-> No fee charge for domestic payments");

    createTransaction(x, LocalDate.of(2019, 9, 16), payeeUSDAccount, 500);
    createTransaction(x, LocalDate.of(2019, 10, 1), payeeUSDAccount, 500);
    invoice = generateBillingInvoice(x, sept1_2019, dec31_2019);
    test(invoice.getAmount() == 500 + 500
        && invoice.getStatus() == InvoiceStatus.SCHEDULED
      , "-> Charge fee for international payment immediately");

    // AscendantFX user
    ascendantFXUserDAO.put(
      new AscendantFXUser.Builder(x)
        .setUser(payer.getId())
        .build()
    );
    invoice = generateBillingInvoice(x, sept1_2019, dec31_2019);
    test(invoice.getAmount() == 500, "-> Charge domestic and international fees for AscendantFX user starting from October");
    ascendantFXUserDAO.removeAll();

    test(true, "-> Billing after promotion");
    LocalDate jan1_2020 = LocalDate.of(2020, 1, 1);
    createTransaction(x, jan1_2020, payeeUSDAccount, 500);
    invoice = generateBillingInvoice(x, jan1_2020, jan1_2020);
    test(invoice.getAmount() == 500 + 75
        && invoice.getStatus() == InvoiceStatus.SCHEDULED
      , "   -> Charge domestic and international fees");
    test(invoice.getPaymentDate().compareTo(new Date()) == 1, "-> Billing invoice payment date should be scheduled");
  }

  private void Test_BusinessCreatedAfterSept152019(X x) {
    updatePayerCreated(x, LocalDate.of(2019, 9, 16));

    test(true, "Billing for September 2019 - Business created after September 15 in 2019");
    YearMonth sept_2019 = YearMonth.of(2019, 9);
    Invoice invoice = generateMonthlyBillingInvoice(x, sept_2019);
    test(invoice.getAmount() == 75 + 75
        && invoice.getStatus() == InvoiceStatus.SCHEDULED
      , "-> Charge fee for domestic payments immediately");

    createTransaction(x, LocalDate.of(2019, 9, 16), payeeUSDAccount, 500);
    invoice = generateMonthlyBillingInvoice(x, sept_2019);
    test(invoice.getAmount() == 500 + 75 + 75
        && invoice.getStatus() == InvoiceStatus.SCHEDULED
      , "-> Charge fee for international payment immediately");

    // AscendantFX user
    ascendantFXUserDAO.put(
      new AscendantFXUser.Builder(x)
        .setUser(payer.getId())
        .build()
    );
    invoice = generateMonthlyBillingInvoice(x, sept_2019);
    test(invoice.getAmount() == 500 + 75 + 75, "-> Charge domestic and international fees for AscendantFX user");
    ascendantFXUserDAO.removeAll();

    test(true, "-> Billing without promotion");
    LocalDate sept1_2019 = LocalDate.of(2019, 9, 1);
    LocalDate jan1_2020 = LocalDate.of(2020, 1, 1);
    invoice = generateBillingInvoice(x, sept1_2019, jan1_2020);
    test(invoice.getAmount() == 500 + 75 + 75 + 75 + 75 + 75
        && invoice.getStatus() == InvoiceStatus.SCHEDULED
      , "   -> Charge domestic and international fees");
    test(invoice.getPaymentDate().compareTo(new Date()) == 1, "-> Billing invoice payment date should be scheduled");
  }

  private Invoice generateMonthlyBillingInvoice(X x, YearMonth billingMonth) {
    LocalDate startDate = billingMonth.atDay(1);
    LocalDate endDate = billingMonth.atEndOfMonth();
    return generateBillingInvoice(x, startDate, endDate);
  }

  private Invoice generateBillingInvoice(X x, LocalDate startDate, LocalDate endDate) {
    BillingInvoicesCron cron = new BillingInvoicesCron(startDate, endDate, ownerAccount);
    cron.execute(x);
    return cron.getInvoiceByPayer().get(payer.getId());
  }

  private void createTransaction(X x, LocalDate created, Account payeeAccount, long feeAmount) {
    net.nanopay.tx.HistoricStatus[] h = new net.nanopay.tx.HistoricStatus[1];
    h[0] = new net.nanopay.tx.HistoricStatus();
    h[0].setStatus(TransactionStatus.COMPLETED);
    h[0].setTimeStamp(getDate(created));

    localTransactionDAO.put_(x,
      new Transaction.Builder(x)
        .setSourceAccount(payerAccount.getId())
        .setSourceCurrency(payerAccount.getDenomination())
        .setDestinationAccount(payeeAccount.getId())
        .setDestinationCurrency(payeeAccount.getDenomination())
        .setAmount(1000L)
        .setStatusHistory(h)
        .setLineItems(new TransactionLineItem[] {
          new InvoicedFeeLineItem.Builder(x)
            .setAmount(feeAmount)
            .setCurrency(payerAccount.getDenomination())
            .build() })
        .setStatus(TransactionStatus.COMPLETED)
        .setSpid("nanopay")
        .build()
    );
  }

  private void updatePayerCreated(X x, LocalDate localDate) {
    payer.setCreated(getDate(localDate));
    payer = (User) localUserDAO.put(payer).fclone();
  }

  private User createUser(X x, String name) {
    return (User) localUserDAO.put(
      new User.Builder(x)
        .setFirstName(name)
        .setAddress(new Address())
        .build()
    ).fclone();
  }

  private Account createAccount(X x, User user, String denomination) {
    return (Account) localAccountDAO.put(
      new DigitalAccount.Builder(x)
        .setOwner(user.getId())
        .setDenomination(denomination)
        .build()
    ).fclone();
  }

  private Date getDate(LocalDate localDate) {
    return Date.from(localDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
  }
}
