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
import java.util.*;
import net.nanopay.invoice.model.Invoice;
import static foam.mlang.MLang.*;


// Creates an email for all scheduled invoices getting paid the next day
public class ScheduledEmail
  implements ContextAgent {
  // private static final int TYPE_DAO_COUNT = 3;
  public void execute(X x) {
    Calendar today      = Calendar.getInstance();
    Calendar startTime  = Calendar.getInstance();
    Calendar endTime    = Calendar.getInstance();
    //Calendar dueDate    = Calendar.getInstance();
    DAO      invoiceDAO = (DAO) x.get("invoiceDAO");
    DAO      userDAO    = (DAO) x.get("userDAO");
    DAO      groupDAO   = (DAO) x.get("groupDAO");

    // Get todays date and captures the time period of tomorrow.
    today.setTime(new Date());
    startTime.set(today.get(Calendar.YEAR),today.get(Calendar.MONTH),today.get(Calendar.DAY_OF_MONTH)+1,0,0,0);
    startTime.setTimeInMillis(startTime.getTimeInMillis() - 1000);
    endTime.setTimeInMillis(startTime.getTimeInMillis() + (1000*60*60*24) );
 
    List<User> userList = (List)((ArraySink)userDAO.select(new ArraySink())).getArray();
    EmailService email = (EmailService) x.get("email");
    EmailMessage            message;
    HashMap<String, Object> args;
    Group                   group;
    AppConfig               config;
    List<Invoices> tempList;
    List<Invoices> tempListSched;
    int scheduledCount;
    int unPaidCount;
    int overdueCount;
    Boolean check1;
    Boolean check2;
    Boolean check3;
    Boolean isSme;
    String schedulePortion = "";
    String unPaidPortion = "";
    String overduePortion = "";
    String displaySchedule;
    String displayUnpaid;
    String displayOverdue;
    String emailTemplate;

    // Goes to each user and sends a report email
    for (User user: userList){
      if ( user == null ) continue;
      // Templating for Scheduled Invoices
      tempListSched = scheduledInv(startTime, endTime, invoiceDAO);
      scheduledCount = tempListSched.length;
      if ( check1 = scheduledCount == 0 ) {
        schedulePortion = "";
      } else {
        displaySchedule = makeEmailStringInvoices(tempListSched, x, user, " is Scheduled for ");
        schedulePortion = "<h3>Scheduled Invoices:</h3><p>" + displaySchedule + "</p><div><p>Please ensure that you have <strong>sufficient funds</strong> in your account - No additional action is required. To view the invoice please login to the portal.</p></div>";
      }
      // Templating for Unpaid Invoices
      tempList = unpaidInv(startTime, endTime, invoiceDAO);
      unPaidCount = tempList.length;
      if ( check2 = unPaidCount == 0 ) {
        unPaidPortion = "";
      } else {
        displayUnpaid = makeEmailStringInvoices(tempList, x, user, " is due for payment on ");
        unPaidPortion = "<h3>Unpaid Invoices:</h3><p>" + displayUnpaid + "</p><div><p>Please ensure that you have <strong>sufficient funds</strong> in your account - No additional action is required. To view the invoice please login to the portal.</p></div>";
      }
      // Templating for Overdue Invoices
      tempList = overdueInv(invoiceDAO);
      overdueCount = tempList.length;
      if ( check3 = overdueCount == 0 ) {
        overduePortion = "";
      } else {
        displayOverdue = makeEmailStringInvoices(tempList, x, user, " is Overdue, due date was scheduled for ");
        overduePortion = "<h3>Overdue Invoices:</h3><p>" + displayOverdue + "</p><div><p>This is a curtisy reminder to avoid any further late penalties. To view the invoice and/or make a payment please login to the portal.</p></div>";
      }
      // If no invoice in any section do not send the report email to this user
      if ( check1 && check2 && check3 ) continue;

      args    = new HashMap<>();
      message = new EmailMessage();
      group   = (Group) groupDAO.find(user.getGroup());
      config  = group.getAppConfig(x);
      isSme = group.isDescendantOf("sme", groupDAO);
      emailTemplate = isSme ? "ablii-daily-invoice-report" : "nanopay-daily-invoice-report";
      message.setTo(new String[]{user.getEmail()});
      args.put("name", user.label());
      args.put("scheduledCount", scheduledCount);
      args.put("unPaidCount", unPaidCount);
      args.put("overDueCount", overdueCount);
      args.put("schedulePortion", schedulePortion);
      args.put("unPaidPortion", unPaidPortion);
      args.put("overduePortion", overduePortion);
      args.put("link",    config.getUrl());
      email.sendEmailFromTemplate(x, user, message, emailTemplate, args);
      setPropertyOnScheduledInvoices(tempListSched);
    }
  }
  private void setPropertyOnScheduledInvoices(List<Invoice> tempListSched) {
    for(Invoice invoice : tempListSched) {
      invoice = (Invoice) invoice.fclone();
      invoice.setScheduledEmailSent(true);
      invoiceDAO.put(invoice);
    }
  }
  private List scheduledInv(Calendar startTime, Calendar endTime, DAO invoiceDAO) {
    // Grabs all invoices whose payment days are tomorrow
    return (List)((ArraySink)invoiceDAO.where(
      AND(
        GTE(Invoice.PAYMENT_DATE, startTime.getTime()),
        LTE(Invoice.PAYMENT_DATE, endTime.getTime()),
        EQ(Invoice.SCHEDULED_EMAIL_SENT, false)
      )
    ).select(new ArraySink())).getArray();
  }
  private List unpaidInv(Calendar startTime, Calendar endTime, DAO invoiceDAO) {
    // Grabs all payable invoices whose due date are tomorrow
    return (List)((ArraySink)invoiceDAO.where(
      AND(
        EQ(Invoice.PAYER_ID, user.getId()),
        GTE(Invoice.DUE_DATE, startTime.getTime()),
        LTE(Invoice.DUE_DATE, endTime.getTime()),
        EQ(Invoice.STATUS, InvoiceStatus.UNPAID) // TODO test whether property not set actually equals null
      )
    ).select(new ArraySink())).getArray();
  }
  private List overdueInv(DAO invoiceDAO) {
    // Grabs all payable invoices whose due date has passed
    return (List)((ArraySink)invoiceDAO.where(
      AND(
        EQ(Invoice.PAYER_ID, user.getId()),
        EQ(Invoice.STATUS, InvoiceStatus.OVERDUE)
      )
    ).select(new ArraySink())).getArray();
  }
  private String makeEmailStringInvoices(List<Invoice> invoicesList, X x, User payer, String midString) {
    if ( invoicesList.length == 0 ) { return "0"; }
    String combination = "";
    String email = "";
    String amount = "";
   //  User payer;
    try {
      for (Invoice scheInv : scheduledInvoicesList) {
        // payer = (User)userDAO.find(scheInv.getPayerId());
        email = payer.getEmail();
        // Add the currency symbol and currency (CAD/USD, or other valid currency)
        amount = scheInv.findDestinationCurrency(x).format(scheInv.getAmount()) + " " + scheInv.getDestinationCurrency();
        combination += "<p><strong>Invoice #:" + scheInv.getInvoiceNumber() + "</strong>" + midString + scheInv.getPaymentDate() + " to <strong>" + email + "</strong> for amount " + amount + "</p><br>";
      }
    } catch(Exception e) {
      return "Invoice List is either empty or an issue has occured. Please login to portal for an update.";
    }
    return combination;
  }
}
