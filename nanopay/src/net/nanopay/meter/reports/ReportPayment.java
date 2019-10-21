package net.nanopay.meter.reports;

import foam.core.X;
import foam.dao.DAO;
import foam.dao.ArraySink;
import foam.mlang.MLang;
import foam.nanos.auth.User;
import net.nanopay.account.Account;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;
import net.nanopay.exchangeable.Currency;

import java.util.UUID;
import java.util.*;
import java.util.function.Function;

public class ReportPayment extends AbstractReport {

  public final static int NUM_ELEMENTS = 25;

  void appendTransaction(X x, StringBuilder builder, String invoiceID, Transaction transaction) {
    // Get the sender and receiver
    Account sourceAccount = transaction.findSourceAccount(x);
    User sender = (sourceAccount != null) ? sourceAccount.findOwner(x) : null;
    Account destinationAccount = transaction.findDestinationAccount(x);
    User receiver = (destinationAccount != null) ? destinationAccount.findOwner(x) : null;
    DAO currencyDAO = ((DAO) x.get("currencyDAO"));

    // Build the CSV line
    builder.append(buildCSVLine(
      NUM_ELEMENTS,
      invoiceID,
      nullCheckToString(transaction.getStatus(), Object::toString),
      transaction.getId(),
      transaction.getReferenceNumber(),
      transaction.getParent(),
      "N/A", // gateway transaction id
      nullCheckToString(transaction.getCreated(), Object::toString),
      nullCheckToString(transaction.getProcessDate(), Object::toString),
      nullCheckToString(transaction.getCompletionDate(), Object::toString),
      "N/A", // settlement status
      transaction.getType(),
      "N/A", // dispute status
      nullCheckToString(sender, (s) -> Long.toString(s.getId())),
      nullCheckToString(sender, User::label),
      nullCheckToString(sender, User::getEmail),
      nullCheckToString(receiver, (r) -> Long.toString(r.getId())),
      nullCheckToString(receiver, User::label),
      nullCheckToString(receiver, User::getEmail),
      ((Currency) currencyDAO.find(transaction.getSourceCurrency())).format(transaction.getAmount()),
      ((Currency) currencyDAO.find(transaction.getDestinationCurrency())).format(transaction.getDestinationAmount()),
      transaction.getSourceCurrency(),
      transaction.getDestinationCurrency(),
      "N/A", // location name
      "N/A", // location id
      "N/A"  // gateway name
    ));
  }

  void buildSummaryReport(X x, StringBuilder builder, String invoiceID, Transaction root) {
    // Append the transaction
    appendTransaction(x, builder, invoiceID, root);

    // Lookup and append any child transactions
    List children = ((ArraySink)root.getChildren(x).select(new ArraySink())).getArray();
    for ( Object obj : children ) {
      buildSummaryReport(x, builder, invoiceID, (Transaction) obj);
    }
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
        MLang.LTE(Transaction.CREATED, endDate)
      )
    ).select(new ArraySink())).getArray();

    Map<String, Transaction> rootTransactions = new HashMap<>();
    for ( Object obj : transactions ) {
      Transaction transaction = (Transaction) obj;
      Transaction parent = transaction;
      for ( Transaction iter = transaction; iter != null; iter = iter.findParent(x) ) {
        parent = iter;
      }
      String invoiceId = UUID.randomUUID().toString();
      long invoiceIdL = parent.getInvoiceId();
      if ( invoiceIdL != 0 ) 
        invoiceId = Long.toString(invoiceIdL);
      rootTransactions.put(invoiceId, parent);
    }

    StringBuilder sb = new StringBuilder();
    sb.append(buildCSVLine(
      NUM_ELEMENTS,
      "Payment ID",
      "Transaction Status",
      "Transaction ID",
      "Transaction Reference Number",
      "Transaction Parent ID",
      "Transaction ID from gateway",
      "Transaction Request Date",
      "Transaction Process Date",
      "Date Settled",
      "Settlement Status",
      "Transaction Type",
      "Dispute Status",
      "Sender User ID",
      "Sender Name",
      "Sender Email",
      "Receiver User ID",
      "Receiver Name",
      "Receiver Email",
      "Amount Attempted",
      "Amount Settled",
      "Source Currency",
      "Destination Currency",
      "Location Name",
      "Location ID",
      "Gateway Name"
    ));

    for ( Map.Entry<String, Transaction> entry : rootTransactions.entrySet() ) {
      // Retrieve the status of the overall transaction
      TransactionStatus status = entry.getValue().getState(x);

      // Create summary line
      sb.append(
        buildCSVLine(
          NUM_ELEMENTS,
          entry.getKey(),
          status.getName()
        )
      );

      // Build summary report for each of the transactions under the summary report
      buildSummaryReport(x, sb, entry.getKey(), entry.getValue());
    }

    return sb.toString();
  }
}

