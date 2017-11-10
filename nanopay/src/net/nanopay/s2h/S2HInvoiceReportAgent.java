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

import java.text.NumberFormat;
import java.util.*;
import java.util.Currency;


public class S2HInvoiceReportAgent
        implements ContextAgent
{
  String [] recipients;
  Calendar calendar = Calendar.getInstance();
  Calendar dayStart = Calendar.getInstance();
  Calendar dayEnd = Calendar.getInstance();
  public S2HInvoiceReportAgent(){

    calendar.setTime(new Date());

    int year = calendar.get(Calendar.YEAR);
    int month = calendar.get(Calendar.MONTH);
    int day = calendar.get(Calendar.DAY_OF_MONTH);
    dayStart.set(year, month, day-14, 0, 0, 0);
    dayEnd.set(year, month, day, 0, 0, 0);
    dayEnd.setTimeInMillis(dayEnd.getTimeInMillis()- 1000);
  }
  public S2HInvoiceReportAgent(int Startyear, int Startmonth, int Startday){
    dayStart.set(Startyear, Startmonth, Startday,0,0,0);
    dayEnd.setTime(new Date());
  }
  public S2HInvoiceReportAgent(int Startyear, int Startmonth, int Startday, int Endyear, int Endmonth, int Endday){
    dayStart.set(Startyear, Startmonth, Startday,0,0,0);
    dayEnd.set(Endyear, Endmonth, Endday+1,0,0,0);
    dayEnd.setTimeInMillis(dayEnd.getTimeInMillis()- 1000);

  }
  public void execute(X x)
  {
    DAO userDAO = (DAO) x.get("userDAO");
    DAO invoiceDAO = (DAO) x.get("invoiceDAO");

    //retrieves invoices that were paid the day that passed
    DAO timeInvoice = invoiceDAO.where(AND(EQ(Invoice.PAYEE_ID, 2), OR(AND(GTE(Invoice.PAYMENT_DATE, dayStart.getTime()), LTE(Invoice.PAYMENT_DATE, dayEnd.getTime())),AND(GTE(Invoice.ISSUE_DATE, dayStart.getTime()), LTE(Invoice.ISSUE_DATE, dayEnd.getTime())))));

    //sets up an email to be sent
    EmailService email = (EmailService) x.get("email");
    EmailMessage message = new EmailMessage();
    HashMap<String, Object> args = new HashMap<>();
    message.setFrom("info@nanopay.net");
    message.setReplyTo("noreply@nanopay.net");

    //TODO replace with S2H's email
    if ( recipients.length == 0 ){
      System.out.println("NO EMAIL SET");
      return;
    }
    message.setTo(recipients);
    message.setSubject("S2H status");

    //makes a list of the DAO information
    List<Invoice> invoicesList = (List)((ListSink)timeInvoice.select(new ListSink())).getData();

    args.put("auto","MESSAGE WAS SENT AUTOMATICALLY");
    if (!invoicesList.isEmpty()) {
      double sum = 0.0;
      NumberFormat formatter = NumberFormat.getCurrencyInstance();
      String list="<tr><th align= \"center\">Invoice #</th><th style=\"text-align: left\">Issue Date:</th><th style=\"text-align: left\">Payer Name:</th><th style=\"text-align: left\">Status:</th><th style=\"text-align: right\">Amount:</th></tr>";
      for (Invoice invoice : invoicesList){
        list += "<tr><td align=\"left\">"+ invoice.getInvoiceNumber()+"</td><td style=\"text-align: left\">" + invoice.getIssueDate() + "</td><td style=\"text-align: left\">"+userDAO.find(invoice.getPayerId()).getProperty(User.ORGANIZATION.getName())+ "</td><td style=\"text-align: left\">" + invoice.getStatus() + "</td><td style=\"text-align: right\">"+  formatter.format(invoice.getAmount()) +"</td></tr>";
        sum += invoice.getAmount();
      }
      list +="<tr><td align=\"left\"></td><td style=\"text-align: left\"><b>TOTAL</b></td><td style=\"text-align: right\"><b>"+  formatter.format(sum) +"</b></td></tr>";
      args.put("title1", "Invoices between: ");
      args.put("list1", list);
      args.put("date1", dayStart.getTime());
      args.put("date2", dayEnd.getTime());
    }

    //sends an email following the email template
    email.sendEmailFromTemplate(message, "s2h-invoice-snap", args);
  }
  public void setRecipients(String[] people)
  {
    recipients = people;
  }
}