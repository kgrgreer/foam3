package net.nanopay.invoice;

import foam.core.*;
import foam.dao.DAO;
import foam.dao.ArraySink;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.Group;
import foam.nanos.auth.User;
import foam.nanos.notification.email.EmailMessage;
import foam.nanos.notification.email.EmailService;
import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.util.*;
import net.nanopay.invoice.model.Invoice;
import static foam.mlang.MLang.*;


// Creates an email for all scheduled invoices getting paid the next day
public class ScheduledEmail
  implements ContextAgent {
  private static final int TYPE_DAO_COUNT = 3;
  public void execute(X x) {
    Calendar today      = Calendar.getInstance();
    Calendar startTime  = Calendar.getInstance();
    Calendar endTime    = Calendar.getInstance();
    Calendar dueDate    = Calendar.getInstance();
    DAO      invoiceDAO = (DAO) x.get("invoiceDAO");
    DAO      userDAO    = (DAO) x.get("userDAO");
    DAO      groupDAO   = (DAO) x.get("groupDAO");

    // Get todays date and captures the time period of tomorrow.
    today.setTime(new Date());
    startTime.set(today.get(Calendar.YEAR),today.get(Calendar.MONTH),today.get(Calendar.DAY_OF_MONTH)+1,0,0,0);
    startTime.setTimeInMillis(startTime.getTimeInMillis() - 1000);
    endTime.setTimeInMillis(startTime.getTimeInMillis() + (1000*60*60*24) );

    DAO[] daoList = new DAO[TYPE_DAO_COUNT];

    // Grabs all invoices whose payment days are tomorrow
    daoList[0] = scheduledInv(startTime, endTime, invoiceDAO);
    // Grabs all invoices whose due date are tomorrow
    daoList[1] = unpaidInv(startTime, endTime, invoiceDAO);
    // Grabs all invoices whose due date has passed 
    daoList[2] = overdueInv(startTime, endTime, invoiceDAO);
    String displaySchedule = "";
    String displayUnpaid = "";
    String displayOverdue = "";
    for(int i = 0; i < TYPE_DAO_COUNT; i++) {
      switch(i) {
        case 0:
          displaySchedule = toDisplaymakeScheduledInvoices((List)((ArraySink)daoList[0].select(new ArraySink())).getArray());
          break;
        case 1:
          displayUnpaid = toDisplaymakeScheduledInvoices((List)((ArraySink)daoList[0].select(new ArraySink())).getArray());
          break;
        case 2:
          displayOverdue = toDisplaymakeScheduledInvoices((List)((ArraySink)daoList[0].select(new ArraySink())).getArray());
          break;
      }
    }




    List<Invoice>    invoicesList = (List)((ArraySink)invoiceListDAO.select(new ArraySink())).getArray();
    EmailService     email        = (EmailService) x.get("email");
    NumberFormat     formatter    = NumberFormat.getCurrencyInstance();
    SimpleDateFormat dateFormat   = new SimpleDateFormat("dd-MMM-YYYY");
    EmailMessage            message;
    HashMap<String, Object> args;
    User                    user;
    User                    payee;
    Group                   group;
    AppConfig               config;

    // Goes to each invoice and sends the payer an email about the payment coming
    for (Invoice invoice: invoicesList){
      args    = new HashMap<>();
      message = new EmailMessage();
      user    = (User) userDAO.find(invoice.getPayerId());
      group   = (Group) groupDAO.find(user.getGroup());
      config  = group.getAppConfig(x);
      payee   = (User) userDAO.find(invoice.getPayeeId());
      message.setTo(new String[]{user.getEmail()});
      dueDate.setTime(invoice.getPaymentDate());
      args.put("account", invoice.getId());
      args.put("amount",  formatter.format(invoice.getAmount()/100.00));
      args.put("date",    dateFormat.format(invoice.getPaymentDate()));
      args.put("link",    config.getUrl());
      args.put("name",    user.getFirstName());
      args.put("toEmail", payee.getEmail());
      email.sendEmailFromTemplate(x, user, message, "schedule-paid", args);
      invoice = (Invoice) invoice.fclone();
      invoice.setScheduledEmailSent(true);
      invoiceDAO.put(invoice);
    }
  }
  private DAO scheduledInv(Calendar startTime, Calendar endTime, DAO invoiceDAO) {
    return invoiceDAO.where(
      AND(
        GTE(Invoice.PAYMENT_DATE, startTime.getTime()),
        LTE(Invoice.PAYMENT_DATE, endTime.getTime()),
        EQ(Invoice.SCHEDULED_EMAIL_SENT, false)
      )
    );
  }
  private DAO unpaidInv(Calendar startTime, Calendar endTime, DAO invoiceDAO) {
    return invoiceDAO.where(
      AND(
        GTE(Invoice.DUE_DATE, startTime.getTime()),
        LTE(Invoice.DUE_DATE, endTime.getTime()),
        EQ(Invoice.PAYMENT_DATE, null) // TODO test whether property not set actually equals null
      )
    );
  }
  private DAO overdueInv(Calendar startTime, Calendar endTime, DAO invoiceDAO) {
    return invoiceDAO.where(
      AND(
        LTE(Invoice.DUE_DATE, startTime.getTime())
      )
    );
  }
  private String makeEmailStringInvoices(List<Invoice> invoicesList, X x, DAO userDAO, String midString) {
    String combination = "";
    String email = "";
    String amount = "";
    User payer;
    try {
      for (Invoice scheInv : scheduledInvoicesList) {
        payer = (User)userDAO.find(scheInv.getPayerId());
        email = payer == null ? "Unknown" : payer.getEmail();
        // Add the currency symbol and currency (CAD/USD, or other valid currency)
        amount = scheInv.findDestinationCurrency(x).format(scheInv.getAmount()) + " " + scheInv.getDestinationCurrency();
        combination += "Invoice #:" + scheInv.getInvoiceNumber() + midString + scheInv.getPaymentDate() + " to " + email + " for amount " + amount + "<br>";
      }
    } catch(Exception e) {
      return "Invoice List is either empty or an issue has occured. Please login to portal for an update."
    }
    return combination;
  }
  private String makeScheduledInvoices(List<Invoice> scheduledInvoicesList, X x, DAO userDAO) {
    String combination = "";
    String email = "";
    String amount = "";
    User payer;
    for (Invoice scheInv : scheduledInvoicesList) {
      payer = (User)userDAO.find(scheInv.getPayerId());
      email = payer == null ? "Unknown" : payer.getEmail();
      // Add the currency symbol and currency (CAD/USD, or other valid currency)
      amount = scheInv.findDestinationCurrency(x).format(scheInv.getAmount()) + " " + scheInv.getDestinationCurrency();
      combination += "Invoice #:" + scheInv.getInvoiceNumber() + " is Scheduled for " + scheInv.getPaymentDate() + " to " + email + " for amount " + amount + "\n\n";
    }
  }
  private String makeUnpaidInvoices(List<Invoice> unpaidInvoicesList, X x, DAO userDAO) {
    String combination = "";
    String email = "";
    String amount = "";
    User payer;
    for (Invoice scheInv : unpaidInvoicesList) {
      payer = (User)userDAO.find(scheInv.getPayerId());
      email = payer == null ? "Unknown" : payer.getEmail();
      // Add the currency symbol and currency (CAD/USD, or other valid currency)
      amount = scheInv.findDestinationCurrency(x).format(scheInv.getAmount()) + " " + scheInv.getDestinationCurrency();
      combination += "Invoice #:" + scheInv.getInvoiceNumber() + " is due for payment on " + scheInv.getDueDate() + " to " + email + " for amount " + amount + "\n\n";
    }
  }
  private String makeOverdueInvoices(List<Invoice> overdueInvoicesList, X x, DAO userDAO) {
    String combination = "";
    String email = "";
    String amount = "";
    User payer;
    for (Invoice scheInv : unpaidInvoicesList) {
      payer = (User)userDAO.find(scheInv.getPayerId());
      email = payer == null ? "Unknown" : payer.getEmail();
      // Add the currency symbol and currency (CAD/USD, or other valid currency)
      amount = scheInv.findDestinationCurrency(x).format(scheInv.getAmount()) + " " + scheInv.getDestinationCurrency();
      combination += "Invoice #:" + scheInv.getInvoiceNumber() + " is Overdue, due date was scheduled for " + scheInv.getPaymentDate() + " to " + email + " for amount " + amount + "\n\n";
    }
  }
}
