package net.nanopay.meter.reports;

import foam.core.X;
import foam.dao.DAO;
import foam.dao.ArraySink;
import foam.nanos.auth.User;
import foam.mlang.predicate.Predicate;
import foam.mlang.MLang;
import net.nanopay.account.Account;
import net.nanopay.contacts.Contact;
import net.nanopay.fx.FXTransaction;
import net.nanopay.model.Business;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;
import net.nanopay.tx.DigitalTransaction;
import net.nanopay.tx.cico.COTransaction;
import net.nanopay.tx.cico.CITransaction;
import java.util.Date;
import java.util.Calendar;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

// Transaction Summary Report by User
// Cash-In, Digital, Cash-Out
// By Account per User
// Calculate for 'last' month by default
public class ReportTransaction {

  // Create the transaction summary report
  public String[] createReport(X x, Date startDate, Date endDate) {

    // Constant for comma separator
    final String COMMA_SEPARATOR = ", ";

    // Set start date to the default if it isn't already set
    if (startDate == null)
    {
      Calendar c = Calendar.getInstance();
      c.add(Calendar.MONTH, -1);
      c.set(Calendar.DAY_OF_MONTH, 1);
      c.set(Calendar.HOUR_OF_DAY, 0);
      c.set(Calendar.MINUTE, 0);
      c.set(Calendar.SECOND, 0);
      c.set(Calendar.MILLISECOND, 0);
      startDate = c.getTime();
    }

    // Set the end date to the default if it isn't already set
    if (endDate == null)
    {
      Calendar c = Calendar.getInstance();
      c.set(Calendar.DAY_OF_MONTH, c.getActualMaximum(Calendar.DAY_OF_MONTH));
      c.set(Calendar.HOUR_OF_DAY, 23);
      c.set(Calendar.MINUTE, 59);
      c.set(Calendar.SECOND, 59);
      c.set(Calendar.MILLISECOND, 999);
      endDate = c.getTime();
    }

    // retrieve the daos
    DAO accountDAO = (DAO) x.get("accountDAO");
    DAO transactionDAO = (DAO) x.get("localTransactionDAO");

    // per user, get all
    DAO userDAO = (DAO) x.get("userDAO");
    List users = ((ArraySink) userDAO.where(
      MLang.AND(new Predicate[] {
        MLang.INSTANCE_OF(User.class),
        MLang.NOT(MLang.INSTANCE_OF(Contact.class)),
        MLang.EQ(Business.ONBOARDED, true)
      })
    ).select(new ArraySink())).getArray();

    // To Add - Payment ID, Transaction Gateway ID, Settlement Status, Dispute Status, Location name, Location ID, Gateway Name
    // Setup the column headers for the report
    StringBuilder trasactionDetailBuffer = new StringBuilder();
    trasactionDetailBuffer.append("User Email, User ID, Tx ID, Tx Reference, Tx Created, Tx Requested, Tx Settled, Tx Status, Tx Type, Tx Sender ID, Tx Sender Name, Tx Sender Email, Tx Receiver ID, Tx Receiver Name, Tx Receiver Email, Tx Amount Attempted, Tx Amount Settled");
    trasactionDetailBuffer.append(System.getProperty("line.separator"));

    // Set the column headers for the summary
    StringBuilder transactionSummaryBuffer = new StringBuilder();
    transactionSummaryBuffer.append("User Email, UserID, Total");
    for (TransactionStatus status : TransactionStatus.values())
    {
      transactionSummaryBuffer
        .append(COMMA_SEPARATOR)
        .append(status.getLabel());
    }
    transactionSummaryBuffer.append(System.getProperty("line.separator"));

    // Users without transactions
    int usersWithoutTransactions = 0;

    // Go through each user
    for (Object u : users) {
      User user = (User) u;
      DAO filteredAccountDAO = user.getAccounts(x);
      List accounts = ((ArraySink) filteredAccountDAO.select(new ArraySink())).getArray();

      // Transaction information
      Map<TransactionStatus, Integer> statusMap = new HashMap<>();
      for (TransactionStatus status : TransactionStatus.values())
      {
        statusMap.put(status, 0);
      }
      int totalTransactions = 0;
      int sentTransactions = 0;
      int failedTransactions = 0;
      int pendingTransactions = 0;
      int declinedTransactions = 0;
      int successfulTransactions = 0;

      // Go through each digital account
      for (Object a : accounts) {
        Account account = (Account) a;
        List transactions = ((ArraySink) transactionDAO.where(
          MLang.AND( new Predicate[] {
            MLang.OR( new Predicate[] {
              MLang.EQ(Transaction.SOURCE_ACCOUNT, account.getId()),
              MLang.EQ(Transaction.DESTINATION_ACCOUNT, account.getId()),
            }),
            MLang.OR( new Predicate[] {
              MLang.INSTANCE_OF(CITransaction.class),
              MLang.INSTANCE_OF(COTransaction.class),
              MLang.INSTANCE_OF(DigitalTransaction.class),
              MLang.INSTANCE_OF(FXTransaction.class),
            }),
            MLang.OR( new Predicate[] {
              MLang.GTE(Transaction.CREATED, startDate),
              MLang.GTE(Transaction.PROCESS_DATE, startDate),
              MLang.GTE(Transaction.COMPLETION_DATE, startDate)
            }),
            MLang.LTE(Transaction.CREATED, endDate)
          })
        ).select(new ArraySink())).getArray();

        // List all transactions
        for (Object t : transactions) {
          Transaction transaction = (Transaction) t;

          // Get the sender and receiver
          Account sourceAccount = transaction.findSourceAccount(x);
          User sender = (sourceAccount != null) ? sourceAccount.findOwner(x) : null;
          Account destinationAccount = transaction.findDestinationAccount(x);
          User receiver = (destinationAccount != null) ? destinationAccount.findOwner(x) : null;

          trasactionDetailBuffer
            .append(user.getEmail()).append(COMMA_SEPARATOR)
            .append(user.getId()).append(COMMA_SEPARATOR)
            .append(transaction.getId()).append(COMMA_SEPARATOR)
            .append(transaction.getExternalInvoiceId()).append(COMMA_SEPARATOR)
            .append(transaction.getCreated()).append(COMMA_SEPARATOR)
            .append(transaction.getProcessDate()).append(COMMA_SEPARATOR)
            .append(transaction.getCompletionDate()).append(COMMA_SEPARATOR)
            .append(transaction.getStatus().toString()).append(COMMA_SEPARATOR)
            .append(transaction.getType()).append(COMMA_SEPARATOR)
            .append(sender != null ? sender.getId() : "").append(COMMA_SEPARATOR)
            .append(sender != null ? sender.toSummary() : "").append(COMMA_SEPARATOR)
            .append(sender != null ? sender.getEmail() : "").append(COMMA_SEPARATOR)
            .append(receiver != null ? receiver.getId() : "").append(COMMA_SEPARATOR)
            .append(receiver != null ? receiver.toSummary() : "").append(COMMA_SEPARATOR)
            .append(receiver != null ? receiver.getEmail() : "").append(COMMA_SEPARATOR)
            .append(-transaction.getTotal(x, transaction.getSourceAccount())).append(COMMA_SEPARATOR)
            .append(System.getProperty("line.separator"));

          // Update aggregates
          totalTransactions++;
          statusMap.put(transaction.getStatus(), statusMap.get(transaction.getStatus()) + 1);
        }
      }

      // Check if there were any transactions for the current user
      if (totalTransactions != 0)
      {
        // Update the transaction summary buffer
        transactionSummaryBuffer
          .append(user.getEmail()).append(COMMA_SEPARATOR)
          .append(user.getId()).append(COMMA_SEPARATOR)
          .append(totalTransactions);

        // Go through all statuses
        for (TransactionStatus status : TransactionStatus.values())
        {
          transactionSummaryBuffer
            .append(COMMA_SEPARATOR)
            .append(statusMap.get(status));
        }

        // Append a new line
        transactionSummaryBuffer
          .append(System.getProperty("line.separator"));
      } else {
        usersWithoutTransactions++;
      }
    }

    // Return the reports
    return new String[] {
      trasactionDetailBuffer.toString(),
      transactionSummaryBuffer.toString(),
      "Users without transactions: " + usersWithoutTransactions
    };
}}
