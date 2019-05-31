package net.nanopay.invoice;

import foam.core.*;
import foam.dao.DAO;
import foam.dao.ArraySink;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.Group;
import foam.nanos.auth.User;
import foam.nanos.notification.email.EmailMessage;
import foam.util.Emails.EmailsUtility;
import foam.util.SafetyUtil;
import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.util.*;
import net.nanopay.invoice.model.Invoice;
import static foam.mlang.MLang.*;


// Creates an email for all scheduled invoices getting paid the next day
public class ScheduledEmail
  implements ContextAgent {

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

    // Grabs all invoices whose payment days are tomorrow
    DAO invoiceListDAO = invoiceDAO.where(
      AND(
        GTE(Invoice.PAYMENT_DATE,startTime.getTime()),
        LTE(Invoice.PAYMENT_DATE,endTime.getTime()),
        EQ(Invoice.SCHEDULED_EMAIL_SENT,false)
      )
    );
    List<Invoice>    invoicesList = (List)((ArraySink)invoiceListDAO.select(new ArraySink())).getArray();
    NumberFormat     formatter    = NumberFormat.getCurrencyInstance();
    SimpleDateFormat dateFormat   = new SimpleDateFormat("dd-MMM-YYYY");
    EmailMessage            message;
    HashMap<String, Object> args;
    User                    user;
    User                    payee;
    Group                   group;
    AppConfig               config;
    String                  accountVar;

    // Goes to each invoice and sends the payer an email about the payment coming
    for (Invoice invoice: invoicesList){
      accountVar = SafetyUtil.isEmpty(invoice.getInvoiceNumber()) ? "N/A" : invoice.getInvoiceNumber();
      args    = new HashMap<>();
      message = new EmailMessage();
      user    = (User) userDAO.find(invoice.getPayerId());
      group   = (Group) x.get("group");
      config  = group.getAppConfig(x);
      payee   = (User) userDAO.find(invoice.getPayeeId());
      message.setTo(new String[]{user.getEmail()});
      dueDate.setTime(invoice.getPaymentDate());
      args.put("account", accountVar);
      args.put("amount",  formatter.format(invoice.getAmount()/100.00));
      args.put("date",    dateFormat.format(invoice.getPaymentDate()));
      args.put("link",    config.getUrl());
      args.put("name",    user.getFirstName());
      args.put("toEmail", payee.getEmail());
      EmailsUtility.sendEmailFromTemplate(x, user, message, "schedule-paid", args);
      invoice = (Invoice) invoice.fclone();
      invoice.setScheduledEmailSent(true);
      invoiceDAO.put(invoice);
    }
  }
}