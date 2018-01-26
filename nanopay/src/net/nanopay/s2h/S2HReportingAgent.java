package net.nanopay.s2h;

import foam.core.*;
import foam.dao.DAO;
import foam.nanos.auth.User;
import net.nanopay.invoice.model.Invoice;
import static foam.mlang.MLang.*;
import foam.nanos.notification.email.EmailMessage;
import foam.nanos.notification.email.EmailService;
import foam.dao.ListSink;
import net.nanopay.model.*;
import net.nanopay.tx.model.Transaction;

import java.text.NumberFormat;
import java.util.*;
import java.util.Currency;


public class S2HReportingAgent
  implements ContextAgent
{
  String [] recipients;
  Calendar calendar = Calendar.getInstance();
  Calendar dayStart = Calendar.getInstance();
  Calendar dayEnd = Calendar.getInstance();

  public S2HReportingAgent(){
    calendar.setTime(new Date());
    int year = calendar.get(Calendar.YEAR);
    int month = calendar.get(Calendar.MONTH);
    int day = calendar.get(Calendar.DAY_OF_MONTH);
    dayEnd.set(year, month, day, 0, 0, 0);
    dayStart.setTimeInMillis(dayEnd.getTimeInMillis()- 1213200000);
    dayEnd.setTimeInMillis(dayEnd.getTimeInMillis()- 1000);
  }

  public S2HReportingAgent(int Startyear, int Startmonth, int Startday){
    dayStart.set(Startyear, Startmonth, Startday,0,0,0);
    dayEnd.setTime(new Date());
  }

  public S2HReportingAgent(int Startyear, int Startmonth, int Startday, int Endyear, int Endmonth, int Endday){
    dayStart.set(Startyear, Startmonth, Startday,0,0,0);
    dayEnd.set(Endyear, Endmonth, Endday+1,0,0,0);
    dayEnd.setTimeInMillis(dayEnd.getTimeInMillis()- 1000);
  }

  public void execute(X x)
  {
    DAO userDAO = (DAO) x.get("userDAO");
    DAO invoiceDAO = (DAO) x.get("invoiceDAO");
    DAO transactionDAO = (DAO) x.get("localTransactionDAO");

    //sets up an email to be sent
    //TODO replace with S2H's email
    if ( recipients.length == 0 ){
      System.out.println("NO EMAIL SET");
      return;
    }
    EmailService email = (EmailService) x.get("email");
    EmailMessage message = new EmailMessage();
    HashMap<String, Object> args = new HashMap<>();
    message.setTo(recipients);

    //retrieves invoices that were paid the day that passed
    DAO timeInvoice = invoiceDAO.where(AND(
      EQ(Invoice.PAYEE_ID, 2),
      OR(
        AND(
          GTE(Invoice.PAYMENT_DATE, dayStart.getTime()),
          LTE(Invoice.PAYMENT_DATE, dayEnd.getTime())),
        AND(
          GTE(Invoice.ISSUE_DATE, dayStart.getTime()),
          LTE(Invoice.ISSUE_DATE, dayEnd.getTime())))));
    DAO timeTransaction = transactionDAO.where(AND(
      EQ(Transaction.PAYEE_ID, 2),
      AND(
        GTE(Transaction.DATE, dayStart.getTime()),
        LTE(Transaction.DATE, dayEnd.getTime()))));



    //makes a list of the DAO information
    List<Invoice> invoicesList = (List)((ListSink)timeInvoice.select(new ListSink())).getData();
    List<Transaction> transactionList = (List)((ListSink)timeTransaction.select(new ListSink())).getData();
    double sum = 0.0;
    StringBuilder list = new StringBuilder("");
    NumberFormat formatter = NumberFormat.getCurrencyInstance();
    args.put("auto","MESSAGE WAS SENT AUTOMATICALLY");
    if ( ! invoicesList.isEmpty() ){
      list.append( "<tr><th style=\"text-align: left\">Invoice #</th>");
      list.append( "<th style=\"text-align: left\">Issue Date:</th>");
      list.append( "<th style=\"text-align: left\">Payer Name:</th>");
      list.append( "<th style=\"text-align: left\">Status:</th>");
      list.append( "<th style=\"text-align: right\">Amount:</th></tr>");
      for (Invoice invoice : invoicesList){
        list.append( "<tr><td style=\"text-align: left\">"+ invoice.getInvoiceNumber() +"</td>");
        list.append( "<td style=\"text-align: left\">"+ invoice.getIssueDate() +"</td>");
        list.append( "<td style=\"text-align: left\">"+ userDAO.find(invoice.getPayerId()).getProperty(User.ORGANIZATION.getName()) +"</td>");
        list.append( "<td style=\"text-align: left\">"+ invoice.getStatus() +"</td>");
        list.append( "<td style=\"text-align: right\">"+ formatter.format(invoice.getAmount()) +"</td></tr>");
        sum += invoice.getAmount();
      }
      list.append( "<tr><td style=\"text-align: left\"></td>");
      list.append( "<td style=\"text-align: left\"></td>");
      list.append( "<td style=\"text-align: left\"><b>TOTAL</b></td>");
      list.append( "<td style=\"text-align: left\"></td>");
      list.append( "<td style=\"text-align: right\"><b>"+ formatter.format(sum) +"</b></td></tr>");
      args.put("title1", "Invoices between: <b>"+ dayStart.getTime() +"</b> and <b>"+ dayEnd.getTime() +"</b> ");
      args.put("list1", list);
      list = new StringBuilder("");
      sum = 0.0;
    }

    if ( ! transactionList.isEmpty() ){
      list.append( "<tr><th style=\"text-align: left\">Transaction #</th>");
      list.append( "<th style=\"text-align: left\">Transaction Date:</th>");
      list.append( "<th style=\"text-align: left\">Payer Name:</th>");
      list.append( "<th style=\"text-align: left\">Status:</th>");
      list.append( "<th style=\"text-align: right\">Amount:</th></tr>");
      for (Transaction transaction : transactionList){
        list.append( "<tr><td style=\"text-align: left\">"+ transaction.getId()+"</td>");
        list.append( "<td style=\"text-align: left\">" + transaction.getDate() + "</td>");
        list.append( "<td style=\"text-align: left\">"+userDAO.find(transaction.getPayerId()).getProperty(User.ORGANIZATION.getName())+ "</td>");
        list.append( "<td style=\"text-align: left\">" + transaction.getStatus() + "</td>");
        list.append( "<td style=\"text-align: right\">"+  formatter.format(transaction.getAmount()) +"</td></tr>");
        sum += transaction.getAmount();
      }
      list.append( "<tr><td style=\"text-align: left\"></td>");
      list.append( "<td style=\"text-align: left\"></td>");
      list.append( "<td style=\"text-align: left\"><b>TOTAL</b></td>");
      list.append( "<td style=\"text-align: left\"></td>");
      list.append( "<td style=\"text-align: right\"><b>"+  formatter.format(sum) +"</b></td></tr>");
      args.put("title2", "Transactions between: <b>"+dayStart.getTime()+"</b> and <b>"+dayEnd.getTime()+" </b> ");
      args.put("list2", list);
    }

    //sends an email following the email template
    email.sendEmailFromTemplate(null, message, "s2h-invoice-snap", args);
  }
  public void setRecipients(String[] people)
  {
    recipients = people;
  }
}