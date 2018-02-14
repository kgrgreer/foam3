package net.nanopay.invoice;

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


public class ScheduledEmail
  implements ContextAgent {
  Calendar today = Calendar.getInstance();
  Calendar endTime = Calendar.getInstance();

  public void execute(X x) {

    today.setTime(new Date());
    endTime.setTimeInMillis(today.getTimeInMillis() + 172740000);
    System.out.println(today);
    System.out.println(endTime);
    DAO invoiceDAO = (DAO) x.get("invoiceDAO");
    DAO userDAO = (DAO) x.get("userDAO");

    invoiceDAO = invoiceDAO.where(
      AND(
        GTE(Invoice.DUE_DATE,today.getTime()),
        LTE(Invoice.DUE_DATE,endTime.getTime())
      )
    );
    List<Invoice> invoicesList = (List)((ListSink)invoiceDAO.select(new ListSink())).getData();
    EmailService email = (EmailService) x.get("email");
    EmailMessage message = new EmailMessage();
    HashMap<String, Object> args;
    User user;
    for (Invoice invoice: invoicesList){
      args = new HashMap<>();
      user = (User) userDAO.find(invoice.getPayerId());
      args.put("amount", invoice.getAmount());
      args.put("account", invoice.getId());
      email.sendEmailFromTemplate(user, message, "invoiceNotification", args);

    }
  }
}