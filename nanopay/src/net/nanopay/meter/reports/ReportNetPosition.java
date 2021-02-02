package net.nanopay.meter.reports;

import foam.core.X;
import foam.dao.ArraySink;
import foam.mlang.MLang;
import foam.dao.DAO;
import foam.mlang.predicate.Predicate;
import net.nanopay.account.Account;
import net.nanopay.bank.BankAccount;
import net.nanopay.account.TrustAccount;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.cico.COTransaction;
import net.nanopay.tx.alterna.CsvUtil;
import net.nanopay.tx.alterna.AlternaSFTPService;

import java.util.*;
import java.util.function.Function;

import static foam.mlang.MLang.*;

public class ReportNetPosition extends AbstractReport {
  
  public final static int NUM_ELEMENTS = 6;

  // Create the transaction summary report
  public String createReport(X x) {

    /*
     * This report determines whether our net position without cash-in and cash-out transaction is zero.
     */

    StringBuilder report = new StringBuilder();

    // Set the headers for the report
    report.append(this.buildCSVLine(
      NUM_ELEMENTS, 
      "Trust Account", 
      "Currency Denomination", 
      "Trust Account Balance", 
      "Total Balance of all Accounts", 
      "Net Balance (Trust + Total)", 
      "Total Unprocessed Cash-Out Balance"));

    // Beyond finding out the total balance in the trust accounts and the total balance in all other accounts of the same denomonation
    // this report also outputs the amount of money that is currently being processed for cash-out

    // In order to calculate the current set of cash-out transactions that have not been accepted,
    // we need to find out the last time we submitted transactions to alterna and then skip back by the hold time

    // Calculate the completion data in the past to determine money in transit for CO transactions 
    // Calculate the most recent possible completion date
    Date now = new Date();
    AlternaSFTPService alternaSFTPService = (AlternaSFTPService) x.get("alternaSftp");
    int cutOffTime = alternaSFTPService.getCutOffTime();
    int holdTimeInBusinessDays = alternaSFTPService.getHoldTimeInBusinessDays();

    // Starting from today, go back one day at a time until we have the day that the last set of transactions 
    // were sent to alterna that should have cleared according to our hold time no transactions going to alterna
    Calendar lastSubmissionDate = Calendar.getInstance();
    lastSubmissionDate.setTime(now);
    int daysToGoBack = lastSubmissionDate.get(Calendar.HOUR_OF_DAY) < cutOffTime ? 
      (1 + holdTimeInBusinessDays) : // Go back one extra day if we are before the cutoff time for the current day
      (2 + holdTimeInBusinessDays);  // Go back two extra days if we are after the cutoff time for the current day
    int i = 0;
    while ( i < daysToGoBack ) {
      lastSubmissionDate.add(Calendar.DAY_OF_YEAR, -1);

      // Saturdays, sundays and holidays should be skipped when determining the number of days we go back
      if ( lastSubmissionDate.get(Calendar.DAY_OF_WEEK) != Calendar.SATURDAY
        && lastSubmissionDate.get(Calendar.DAY_OF_WEEK) != Calendar.SUNDAY
        && ! CsvUtil.cadHolidays.contains(lastSubmissionDate.get(Calendar.DAY_OF_YEAR)) ) {
        i = i + 1;
      }
    }

    // Get the associated DAOs
    DAO transactionDAO = (DAO) x.get("localTransactionDAO");
    DAO accountDAO = (DAO) x.get("localAccountDAO");

    // Get all accounts
    List accounts = ((ArraySink) accountDAO.select(new ArraySink())).getArray();

    // Save the trust accounts and balances
    List<TrustAccount> trustAccounts = new ArrayList<>();
    Map<String, Long> cashoutByDenomonation = new HashMap<>();
    Map<String, Long> balanceByDenomonation = new HashMap<>();

    // Go through each account to aggregate the totals across the system
    for (int j = 0; j < accounts.size(); j++)
    {
      Account account = (Account) accounts.get(j);

      // Save trust accounts
      if (account instanceof TrustAccount)
      {
        trustAccounts.add((TrustAccount)account);
        continue;
      }

      if (account instanceof BankAccount)
      {
        // Retrieve the current cashout value for the denomonation
        Long cashout = cashoutByDenomonation.get(account.getDenomination());
        if (cashout == null)
          cashout = Long.valueOf(0);

        // Retrieve all cash-out transactions after the last submission date
        List transactions = ((ArraySink) transactionDAO.where(
          MLang.AND(new Predicate[] {
            MLang.GTE(Transaction.COMPLETION_DATE, lastSubmissionDate),
            MLang.EQ(Transaction.DESTINATION_ACCOUNT, account.getId()),
            MLang.INSTANCE_OF(COTransaction.class)
          })
        )
        .select(new ArraySink())).getArray();

        // Add up all of the cash-out transactions
        for (int k = 0; k < transactions.size(); k++) {
          Transaction transaction = (Transaction)transactions.get(k);
          cashout += -transaction.getTotal(x, transaction.getSourceAccount());
        }

        // Replace the cashout value in the map
        cashoutByDenomonation.put(account.getDenomination(), cashout);
      }

      // Retrieve the current balance for the denomonation
      Long balance = balanceByDenomonation.get(account.getDenomination());
      if (balance == null)
        balance = Long.valueOf(0);

      // Replace the balance in the map
      balanceByDenomonation.put(account.getDenomination(), balance + (Long)account.findBalance(x));
    }

    // Output a line item in the report for each trust account
    for (TrustAccount trustAccount : trustAccounts)
    {
      String name = trustAccount.getName();
      String denomonation = trustAccount.getDenomination();
      long trustAccountBalance = (long)trustAccount.findBalance(x);
      long totalAccountBalance = balanceByDenomonation.containsKey(denomonation) ? (long)balanceByDenomonation.get(denomonation) : 0L;
      long cashoutBalance = cashoutByDenomonation.containsKey(denomonation) ? (long)cashoutByDenomonation.get(denomonation) : 0L;

      // Calculate the delta between what is in the trust account and the total of all the account balances
      long deltaBetweenTrustAccountAndTotalBalance = trustAccountBalance + totalAccountBalance;

      // Add line item to the report
      report.append(this.buildCSVLine(
        NUM_ELEMENTS, 
        name,
        denomonation,
        Long.toString(trustAccountBalance),
        Long.toString(totalAccountBalance),
        Long.toString(deltaBetweenTrustAccountAndTotalBalance),
        Long.toString(cashoutBalance)));
    }

    // Return the report
    return report.toString();
  }
}

