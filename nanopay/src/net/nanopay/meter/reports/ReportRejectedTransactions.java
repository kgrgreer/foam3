package net.nanopay.meter.reports;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.nanos.auth.User;
import net.nanopay.account.Account;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import java.util.*;

public class ReportRejectedTransactions extends AbstractReport {

  final static int NUM_ELEMENTS = 18;

  private void appendTransaction(X x, StringBuilder builder, Transaction transaction) {
    Account sourceAccount = transaction.findSourceAccount(x);
    User sender = (sourceAccount != null) ? sourceAccount.findOwner(x) : null;
    Account destinationAccount = transaction.findDestinationAccount(x);
    User receiver = (destinationAccount != null) ? destinationAccount.findOwner(x) : null;
    builder.append(buildCSVLine(NUM_ELEMENTS,
      transaction.getId(),
      nullCheckToString(transaction.getCreated(), Object::toString),
      "N/A",  // Settlement status
      nullCheckToString(transaction.getStatus(), Object::toString),
      transaction.getType(),
      "N/A",  // Dispute status
      nullCheckToString(sender, (s) -> Long.toString(s.getId())),
      nullCheckToString(sender, User::getEmail),
      nullCheckToString(sender, User::label),
      nullCheckToString(receiver, (r) -> Long.toString(r.getId())),
      nullCheckToString(receiver, User::getEmail),
      nullCheckToString(receiver, User::label),
      Long.toString(transaction.getAmount()),
      Long.toString(transaction.getDestinationAmount()),
      "N/A",  // Location name
      "N/A",  // Location id
      "N/A",  // Gateway
      "N/A"   // Transaction from gateway
    ));
  }

  // Create the transaction summary report
  public String createReport(X x, Date startDate, Date endDate) {

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
    DAO transactionDAO = (DAO) x.get("localTransactionDAO");

    List transactions = ((ArraySink) transactionDAO.where(
      MLang.AND(
        MLang.OR(
          MLang.GTE(Transaction.CREATED, startDate),
          MLang.GTE(Transaction.PROCESS_DATE, startDate),
          MLang.GTE(Transaction.COMPLETION_DATE, startDate)
        ),
        MLang.LTE(Transaction.CREATED, endDate),
        MLang.OR(
          MLang.EQ(Transaction.STATUS, TransactionStatus.DECLINED),
          MLang.EQ(Transaction.STATUS, TransactionStatus.REVERSE),
          MLang.EQ(Transaction.STATUS, TransactionStatus.REVERSE_FAIL),
          MLang.EQ(Transaction.STATUS, TransactionStatus.CANCELLED),
          MLang.EQ(Transaction.STATUS, TransactionStatus.FAILED)
        )
      )
    ).select(new ArraySink())).getArray();

    StringBuilder sb = new StringBuilder();
    sb.append(buildCSVLine(NUM_ELEMENTS,
      "Transaction ID",
      "Transaction Request Date",
      "Settlement Status",
      "Transaction Status",
      "Transaction Type",
      "Rejection Reason",
      "Sender User ID",
      "Sender Name",
      "Sender Email",
      "Receiver User ID",
      "Receiver Name",
      "Receiver Email",
      "Amount Attempted",
      "Amount Settled",
      "Location Name",
      "Location ID",
      "Gateway Name",
      "Transaction ID from gateway"
    ));

    for ( Object obj : transactions ) {
      Transaction transaction = (Transaction) obj;
      appendTransaction(x, sb, transaction);
    }

    return sb.toString();
  }

}
