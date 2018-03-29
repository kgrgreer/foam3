package net.nanopay.s2h;

import foam.core.*;
import foam.dao.DAO;
import foam.nanos.auth.User;
import net.nanopay.invoice.model.Invoice;
import static foam.mlang.MLang.*;
import foam.nanos.notification.email.EmailMessage;
import foam.nanos.notification.email.EmailService;
import foam.dao.ArraySink;
import net.nanopay.model.*;

import java.text.NumberFormat;
import java.util.*;
import java.util.Currency;


public class S2HDailyEmailAgent
  implements ContextAgent
{
  String [] recipients;
  Calendar calendar = Calendar.getInstance();
  Calendar dayStart = Calendar.getInstance();
  Calendar dayEnd = Calendar.getInstance();
  public void execute(X x)
  {
    DAO userDAO = (DAO) x.get("userDAO");
    DAO invoiceDAO = (DAO) x.get("invoiceDAO");
    Calendar calendar = Calendar.getInstance();
    Calendar dayStart = Calendar.getInstance();
    Calendar dayEnd = Calendar.getInstance();
    calendar.setTime(new Date());
    int year = calendar.get(Calendar.YEAR);
    int month = calendar.get(Calendar.MONTH);
    int day = calendar.get(Calendar.DAY_OF_MONTH);

    //TODO replace with S2H's email
    if ( recipients.length == 0 ){
      System.out.println("NO EMAIL SET");
      return;
    }
    //sets up an email to be sent
    EmailService email = (EmailService) x.get("email");
    EmailMessage message = new EmailMessage();
    HashMap<String, Object> args = new HashMap<>();
    message.setTo(recipients);

    //set to the day that just passed
    dayStart.set(year, month, day-1, 0, 0, 0);
    dayEnd.set(year, month, day, 0, 0, 0);
    dayEnd.setTimeInMillis(dayEnd.getTimeInMillis()- 1000);

    //retrieves invoices that were paid the day that passed
    DAO paidInvoices = invoiceDAO.where(
      AND(
        EQ(Invoice.PAYEE_ID, 2),
        GTE(Invoice.PAYMENT_DATE, dayStart.getTime()),
        LTE(Invoice.PAYMENT_DATE, dayEnd.getTime())));

    //retrieves all Overdue invoices
    DAO overdueInvoices = invoiceDAO.where(
      AND(
        EQ(Invoice.PAYEE_ID, 2),
        LTE(Invoice.DUE_DATE, dayEnd.getTime()),
        EQ(Invoice.PAYMENT_ID, 0)));


    //makes a list of the DAO information
    List<Invoice> paidList =    (List)((ArraySink)   paidInvoices.select(new ArraySink())).getArray();
    List<Invoice> overdueList = (List)((ArraySink)overdueInvoices.select(new ArraySink())).getArray();

    args.put("auto","MESSAGE WAS SENT AUTOMATICALLY");
    if ( ! paidList.isEmpty() ) {
      args.put("title1", "PAID invoices as of end of day: ");
      args.put("list1", getList(paidList, userDAO,""));
      args.put("date1", dayEnd.getTime());
    }
    if ( ! overdueList.isEmpty() ) {
      args.put("title2", "OVERDUE invoices as of end of day: ");
      args.put("list2", getList(overdueList, userDAO, "Days Overdue:"));
      args.put("date2", dayEnd.getTime());
    }

    //sends an email following the email template
    email.sendEmailFromTemplate(null, message, "s2h-invoice-update", args);
  }
  private String getList(List<Invoice> invoices, DAO user,String dayTitle)
  {
    double sum = 0.0;
    NumberFormat formatter = NumberFormat.getCurrencyInstance();
    StringBuilder list = new StringBuilder("");
    list.append("<tr><th style=\"text-align: left\">Invoice #</th>");
    list.append("<th style=\"text-align: left\">Payer Name:</th>");
    if( ! dayTitle.isEmpty() ) {
      list.append("<th style=\"text-align: right\">"+ dayTitle +"</th>");
    }
    list.append("<th style=\"text-align: right\">Amount:</th></tr>");

    for (Invoice invoice : invoices){
      list.append( "<tr><td style=\"text-align: left\">"+ invoice.getInvoiceNumber()+"</td>");
      list.append( "<td style=\"text-align: left\">"+ user.find(invoice.getPayerId()).getProperty(User.ORGANIZATION.getName()) +"</td>");
      if( ! dayTitle.isEmpty() ) {
        list.append( "<td style=\"text-align: right\">" +
          (dayEnd.getTimeInMillis() - invoice.getDueDate().getTime()) / 86400000
          + "</td>");
      }
      list.append( "<td style=\"text-align: right\">" + formatter.format(invoice.getAmount()) + "</td></tr>");
      sum += invoice.getAmount();

    }
    list.append( "<tr><td style=\"text-align: left\"></td>");
    list.append( "<td style=\"text-align: left\"><b>TOTAL</b></td>");
    if( ! dayTitle.isEmpty() ){
      list.append("<td style=\"text-align: right\"></td>");
    }
    list.append( "<td style=\"text-align: right\"><b>"+ formatter.format(sum) +"</b></td></tr>");
    return list.toString();
  }
  public void setRecipients(String[] people)
  {
    recipients = people;
  }
}
