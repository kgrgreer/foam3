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


public class s2hDailyEmailAgent
        implements ContextAgent
{
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
    dayStart.set(year, month, day-1, 0, 0, 0);
    dayEnd.set(year, month, day, 0, 0, 0);
    dayEnd.setTimeInMillis(dayEnd.getTimeInMillis()- 1000);


    DAO paidInvoices = invoiceDAO.where( AND( EQ( Invoice.PAYEE_ID, 2 ), AND( GTE( Invoice.PAYMENT_DATE, dayStart.getTime() ), LTE( Invoice.PAYMENT_DATE, dayEnd.getTime() ) ) ) );
    DAO overdueInvoices = invoiceDAO.where( AND( EQ( Invoice.PAYEE_ID, 2 ), AND( LTE( Invoice.DUE_DATE, dayEnd.getTime() ), EQ( Invoice.PAYMENT_ID, 0 ) ) ) );


    EmailService email = (EmailService) x.get("email");
    EmailMessage message = new EmailMessage();
    HashMap<String, Object> args = new HashMap<>();
    message.setFrom("info@nanopay.net");
    message.setReplyTo("noreply@nanopay.net");
    message.setTo(new String[]{"waseem@nanopay.net"});
    message.setSubject("S2H status");
    List<Invoice> paidList = (List)((ListSink)paidInvoices.select(new ListSink())).getData();
    List<Invoice> overdueList = (List)((ListSink)overdueInvoices.select(new ListSink())).getData();
    args.put("auto","MESSAGE WAS SENT AUTOMATICALLY");
    if (!paidList.isEmpty()) {
      args.put("title1", "\tPAID invoices as of end of day: ");
      args.put("list1", getList(paidList, userDAO));
      args.put("date1",dayEnd.getTime());
    }
    if (!overdueList.isEmpty()) {
      args.put("title2", "\t\tOVERDUE invoices as of end of day: ");
      args.put("list2", getList(overdueList, userDAO));
      args.put("date2",dayEnd.getTime());
    }



    email.sendEmailFromTemplate(message, "s2h-invoice-update",args);
  }
  public String getList(List<Invoice> invoices , DAO user)
  {
    NumberFormat formatter = NumberFormat.getCurrencyInstance();
    String list="<tr><th align= \"center\">Invoice #</th><th style=\"text-align: left\">Payer Name:</th><th style=\"text-align: right\">Amount:</th></tr>";
    for (Invoice invoice : invoices){
      list += "<tr><td align=\"left\">"+ invoice.getInvoiceNumber()+"</td><td style=\"text-align: left\">"+user.find(invoice.getPayerId()).getProperty(User.ORGANIZATION.getName())+ "</td><td style=\"text-align: right\">"+  formatter.format(invoice.getAmount()) +"</td></tr>";
    }
    return list;
  }
}