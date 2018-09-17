package net.nanopay.integration.xero;

import com.xero.api.XeroApiException;
import com.xero.api.XeroClient;

import static foam.mlang.MLang.*;

import com.xero.model.InvoiceStatus;
import com.xero.model.InvoiceType;
import foam.dao.ArraySink;
import foam.dao.Sink;
import foam.nanos.auth.User;
import foam.nanos.notification.Notification;
import net.nanopay.integration.xero.model.XeroContact;
import net.nanopay.integration.xero.model.XeroInvoice;
import net.nanopay.invoice.model.Invoice;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.http.WebAgent;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.util.Calendar;
import java.util.List;


public class XeroComplete
  implements WebAgent {

  XeroClient client_;

  // Syncs nano to xero if desyncing occurs
  private com.xero.model.Invoice resyncInvoice(XeroInvoice nano, com.xero.model.Invoice xero) {

    xero.setAmountDue( new BigDecimal(nano.getAmount()/100));
    Calendar due = Calendar.getInstance();
    due.setTime(nano.getDueDate());
    xero.setDueDate(due);
    switch (nano.getStatus()) {
      case "Void":  { xero.setStatus(InvoiceStatus.VOIDED); break; }
      case "Paid":  { xero.setStatus(InvoiceStatus.PAID)  ; break; }
      case "Draft": { xero.setStatus(InvoiceStatus.DRAFT) ; break; }
    }
    return xero;
  }
  private XeroInvoice addInvoice(X x, XeroInvoice nano, com.xero.model.Invoice xero) {
    User                user       = (User) x.get("user");
    XeroContact         contact;
    Boolean             validContact = true;
    DAO                 notification = (DAO) x.get("notificationDAO");
    Sink                sink       = new ArraySink();
    DAO                 contactDAO = (DAO) x.get("contactDAO");
                        contactDAO = contactDAO.where(INSTANCE_OF(XeroContact.class));
    contactDAO.where(EQ(XeroContact.ORGANIZATION, xero.getContact().getName()))
      .limit(1).select(sink);
    List list = ((ArraySink) sink).getArray();
    if (list.size() == 0) {
      contact = new XeroContact();
      contact = addContact(contact,xero.getContact());
      try{
        System.out.println(contact.toJSON());
        contactDAO.put(contact);
      }catch(Exception e){
        Notification notify = new Notification();
        notify.setBody("Xero Contact #" +xero.getContact().getContactID()+ "cannot sync due to the following required fields being empty:" +((xero.getContact().getEmailAddress()==" ")?"[Email Address]":"")+((xero.getContact().getFirstName()==" ")?"[First Name]":"")+((xero.getContact().getLastName()==" ")?"[LastName]":"")+".");
        notification.put(notify);
        validContact = false;
      }
    }else {
      contact = (XeroContact) list.get(0);
      contact = (XeroContact) contact.fclone();
    }
    System.out.println(contact);
    if ( ! validContact ){ return null;}
    if (xero.getType().equals(InvoiceType.ACCREC)) {
      nano.setPayerId(contact.getUserId());
      nano.setPayeeId(user.getId());
    } else {
      nano.setPayerId(user.getId());
      nano.setPayeeId(contact.getUserId());
    }
    nano.setInvoiceNumber(xero.getInvoiceID());
    nano.setDestinationCurrency(xero.getCurrencyCode().value());
    nano.setIssueDate(xero.getDate().getTime());
    nano.setDueDate(xero.getDueDate().getTime());
    nano.setAmount((xero.getTotal().longValue())*100);
    nano.setStatus(xero.getStatus().value());
    nano.setDesync(false);

    return nano;
  }

  // Syncs nano to xero if desyncing occurs
  private com.xero.model.Contact resyncContact(XeroContact nano, com.xero.model.Contact xero) {
    xero.setContactID(nano.getXeroId());
    xero.setName(nano.getOrganization());
    xero.setEmailAddress(nano.getEmail());
    xero.setFirstName(nano.getFirstName());
    xero.setLastName(nano.getLastName());
    return xero;
  }
  private XeroContact addContact(XeroContact nano, com.xero.model.Contact xero) {
    nano.setXeroId(xero.getContactID());
    nano.setEmail( (xero.getEmailAddress()==null) ? "" :xero.getEmailAddress() );
    nano.setOrganization(xero.getName());
    nano.setFirstName( (xero.getFirstName()==null) ? "" :xero.getFirstName() );
    nano.setLastName( (xero.getLastName()==null) ? "" :xero.getLastName() );
    return nano;
  }

  public void execute(X x) {

    HttpServletResponse resp         = (HttpServletResponse) x.get(HttpServletResponse.class);
    PrintWriter         out          = (PrintWriter) x.get(PrintWriter.class);
    DAO                 store        = (DAO) x.get("tokenStorageDAO");
    DAO                 notification = (DAO) x.get("notificationDAO");

    User                user         = (User) x.get("user");
    TokenStorage        tokenStorage = (TokenStorage) store.find(user.getId());
    out.print(
      "<html>" +
        "<h1>" +
        "SYNC IN PROGRESS" +
        "</h1>" +
      "</html>");
    try {
      XeroConfig config = new XeroConfig();

      // Retrieve only Invoices and Contacts created by Xero
      DAO invoiceDAO = (DAO) x.get("invoiceDAO");
      invoiceDAO = invoiceDAO.where(INSTANCE_OF(XeroInvoice.class));
      DAO contactDAO = (DAO) x.get("contactDAO");
      contactDAO = contactDAO.where(INSTANCE_OF(XeroContact.class));
      client_ = new XeroClient(config);
      Sink sink;
      XeroInvoice xInvoice;
      XeroContact xContact;

      client_.setOAuthToken(tokenStorage.getToken(), tokenStorage.getTokenSecret());

      // Get all Contacts from Xero
      List<com.xero.model.Contact> xeroContactList = client_.getContacts();
      for ( int i = 0; i < xeroContactList.size(); i++ ) {
        com.xero.model.Contact xeroContact = xeroContactList.get(i);
        sink = new ArraySink();
        sink = contactDAO.where(EQ(XeroContact.XERO_ID, xeroContact.getContactID()))
          .limit(1).select(sink);
        List list = ((ArraySink) sink).getArray();

        if (list.size() == 0) {
          xContact = new XeroContact();
        }else {
          xContact = (XeroContact) list.get(0);
          xContact = (XeroContact) xContact.fclone();

          if (xContact.getDesync()) {
            xeroContact = resyncContact(xContact, xeroContact);
            xContact.setDesync(false);
            System.out.println(xContact.toJSON());
            contactDAO.put(xContact);
            xeroContactList.add( i, xeroContact );
            continue;
          }
        }
        System.out.println(xContact);
        System.out.println(xeroContact.toString());

        xContact = addContact(xContact,xeroContact);
        try{
          System.out.println(xContact.toJSON());

          contactDAO.put(xContact);
        }catch(Exception e){
          Notification notify = new Notification();
          notify.setUserId(user.getId());
          notify.setBody("Xero Contact: " +xeroContact.getName()+ " cannot sync due to the following required fields being empty:" +((xContact.getEmail().isEmpty())?"[Email Address]":"")+((xContact.getFirstName().isEmpty())?"[First Name]":"")+((xContact.getLastName().isEmpty())?"[LastName]":"")+".");
          notification.put(notify);
        }
      }
      client_.updateContact(xeroContactList);

      // Get all Invoices from Xero
      List<com.xero.model.Invoice> xeroInvoiceList = client_.getInvoices();
      for ( int i = 0; i < xeroInvoiceList.size(); i++ ) {
        com.xero.model.Invoice xeroInvoice = xeroInvoiceList.get(i);
        sink = new ArraySink();
        sink = invoiceDAO.where(EQ(Invoice.INVOICE_NUMBER, xeroInvoice.getInvoiceID()))
          .limit(1).select(sink);
        List list = ((ArraySink) sink).getArray();
        if ( list.size() == 0 ) {
          xInvoice = new XeroInvoice();
        } else {
          xInvoice = (XeroInvoice) list.get(0);
          xInvoice = (XeroInvoice) xInvoice.fclone();
          if ( xInvoice.getDesync() ) {
            xeroInvoice = resyncInvoice(xInvoice,xeroInvoice);
            xInvoice.setDesync(false);
            System.out.println(xInvoice.toJSON());

            invoiceDAO.put(xInvoice);
            xeroInvoiceList.add( i, xeroInvoice );
            continue;
          }
        }
        System.out.println(xInvoice);
        System.out.println(xeroInvoice);
        xInvoice = addInvoice(x,xInvoice,xeroInvoice);
        if ( xInvoice == null ) {
          Notification notify = new Notification();
          notify.setUserId(user.getId());
          notify.setBody("Xero Invoice # " +xeroInvoice.getInvoiceID()+ " cannot sync due to an Invalid Contact: " +xeroInvoice.getContact().getName());
          notification.put(notify);
          continue;
        }
        System.out.println(xInvoice.toJSON());
        invoiceDAO.put(xInvoice);
      }
      client_.updateInvoice(xeroInvoiceList);

      resp.sendRedirect("/"+tokenStorage.getPortalRedirect());

    } catch ( XeroApiException e ) {
      if ( e.getMessage().contains("token_rejected") ) {
        try {
          resp.sendRedirect("/service/xero?portRedirect="+tokenStorage.getPortalRedirect());
        } catch ( IOException e1 ) {
          e1.printStackTrace();
        }
      }
    } catch ( Exception e ) {
      e.printStackTrace();
    }
  }

}
