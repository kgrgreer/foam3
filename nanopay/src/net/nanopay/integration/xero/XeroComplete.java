package net.nanopay.integration.xero;

import com.xero.api.XeroApiException;
import com.xero.api.XeroClient;

import static foam.mlang.MLang.*;

import com.xero.model.Account;
import com.xero.model.AccountType;
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
import net.nanopay.invoice.model.PaymentStatus;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;


public class XeroComplete
  implements WebAgent {

  XeroClient client_;

  // Syncs nano to xero if desyncing occurs
  private com.xero.model.Invoice resyncInvoice(XeroInvoice nano, com.xero.model.Invoice xero) {
    /*
    Info:   Function to make Xero match Nano object. Occurs when Nano object is updated and user is not logged into Xero
    Input:  nano: The currently updated object on the portal
            xero: The Xero object to be resynchronized
    Output: Returns the Xero Object after being updated from nano portal
    */
    Calendar due = Calendar.getInstance();
    due.setTime(nano.getDueDate());
    xero.setDueDate(due);
    xero.setAmountDue(new BigDecimal(nano.getAmount() / 100));
    switch (nano.getStatus().getName()) {
      case "Void": {
        xero.setStatus(InvoiceStatus.VOIDED);
        break;
      }
      case "Paid": {
        xero.setStatus(InvoiceStatus.PAID);
        break;
      }
      case "Draft": {
        xero.setStatus(InvoiceStatus.DRAFT);
        break;
      }
    }
    return xero;
  }

  // Add or Update Invoice
  private XeroInvoice addInvoice(X x, XeroInvoice nano, com.xero.model.Invoice xero) {
    /*
    Info:   Function to fill in information from xero into Nano portal
    Input:     x: The context that allows access to services
            nano: The object that will be filled in
            xero: The Xero object to be used
    Output: Returns the Nano Object after being filled in from Xero portal
    */
    User        user         = (User) x.get("user");
    XeroContact contact;
    Boolean     validContact = true;
    DAO         notification = (DAO) x.get("notificationDAO");
    Sink        sink         = new ArraySink();
    DAO         contactDAO   = (DAO) x.get("localContactDAO");
    contactDAO   = contactDAO.where(AND(
      INSTANCE_OF(XeroContact.class),
      EQ(
        XeroContact.ORGANIZATION,
        xero.getContact().getName())))
      .limit(1);
    contactDAO.select(sink);
    List list = ((ArraySink) sink).getArray();

    // Checks to verify that the contact exists in the Nano System before accepting the invoice in to the Nano system
    if ( list.size() == 0 ) {

      // Attempts to add the contact to the system if possible
      contact = new XeroContact();
      contact = addContact(contact, xero.getContact());
      contact.setOwner(user.getId());
      try {
        contactDAO.put(contact);
      } catch (Exception e) {

        // If the contact is not accepted into Nano portal send a notification informing user why data was not accepted
        Notification notify = new Notification();
        notify.setBody("Xero Contact #" +
          xero.getContact().getContactID() +
          "cannot sync due to the following required fields being empty:" +
          ((xero.getContact().getEmailAddress().equals(" ")) ? "[Email Address]" : "") +
          ((xero.getContact().getFirstName().equals(" ")) ? "[First Name]" : "") +
          ((xero.getContact().getLastName().equals(" ")) ? "[LastName]" : "") + ".");
        notification.put(notify);
        validContact = false;
      }
    } else {
      contact = (XeroContact) list.get(0);
      contact = (XeroContact) contact.fclone();
    }
    if ( ! validContact ) {
      return null;
    }
    if ( xero.getType() == InvoiceType.ACCREC ) {
      nano.setPayerId(contact.getId());
      nano.setPayeeId(user.getId());
    } else {
      nano.setPayerId(user.getId());
      nano.setPayeeId(contact.getId());
    }
    nano.setInvoiceNumber(xero.getInvoiceNumber());
    nano.setDestinationCurrency(xero.getCurrencyCode().value());
    nano.setIssueDate(xero.getDate().getTime());
    nano.setDueDate(xero.getDueDate().getTime());
    nano.setAmount((xero.getTotal().longValue()) * 100);
    switch (xero.getStatus().toString()) {
      case "DRAFT": {
        nano.setStatus(net.nanopay.invoice.model.InvoiceStatus.DRAFT);
        break;
      }
      case "VOIDED": {
        nano.setStatus(net.nanopay.invoice.model.InvoiceStatus.VOID);
        break;
      }
      case "PAID": {
        nano.setPaymentMethod(PaymentStatus.NANOPAY);
        nano.setStatus(net.nanopay.invoice.model.InvoiceStatus.PAID);
        break;
      }
      default:
        break;
    }
    nano.setDesync(false);
    nano.setXeroUpdate(true);
    return nano;
  }

  // Syncs nano to xero if desyncing occurs
  private com.xero.model.Contact resyncContact(XeroContact nano, com.xero.model.Contact xero) {
    /*
    Info:   Function to make Xero match Nano object. Occurs when Nano object is updated and user is not logged into Xero
    Input:  nano: The currently updated object on the portal
            xero: The Xero object to be resynchronized
    Output: Returns the Xero Object after being updated from nano portal
    */
    xero.setContactID(nano.getXeroId());
    xero.setName(nano.getOrganization());
    xero.setEmailAddress(nano.getEmail());
    xero.setFirstName(nano.getFirstName());
    xero.setLastName(nano.getLastName());
    return xero;
  }

  // Add or Update Contact
  private XeroContact addContact(XeroContact nano, com.xero.model.Contact xero) {
    /*
    Info:   Function to fill in information from xero into Nano portal
    Input:  nano: The object that will be filled in
            xero: The Xero object to be used
    Output: Returns the Nano Object after being filled in from Xero portal
    */
    nano.setXeroId(xero.getContactID());
    nano.setEmail((xero.getEmailAddress() == null) ? "" : xero.getEmailAddress());
    nano.setOrganization(xero.getName());
    nano.setFirstName((xero.getFirstName() == null) ? "" : xero.getFirstName());
    nano.setLastName((xero.getLastName() == null) ? "" : xero.getLastName());
    nano.setXeroUpdate(true);
    return nano;
  }

  public void execute(X x) {
    /*
    Info:   Function to fill in information from xero into Nano portal
    Input:  nano: The object that will be filled in
            xero: The Xero object to be used
    Output: Returns the Nano Object after being filled in from Xero portal
    */
    HttpServletResponse resp         = x.get(HttpServletResponse.class);
    DAO                 store        = (DAO) x.get("tokenStorageDAO");
    DAO                 notification = (DAO) x.get("notificationDAO");
    User                user         = (User) x.get("user");
    XeroConfig          config       = (XeroConfig) x.get("xeroConfig");
    TokenStorage        tokenStorage = (TokenStorage) store.find(user.getId());
    try {
      // Configures the client Object with the users token data
      XeroClient client_ = new XeroClient(config);
      client_.setOAuthToken(tokenStorage.getToken(), tokenStorage.getTokenSecret());

      // Retrieve only Invoices and Contacts created by Xero
      DAO invoiceDAO = (DAO) x.get("invoiceDAO");
      invoiceDAO = invoiceDAO.where(INSTANCE_OF(XeroInvoice.class));
      DAO contactDAO = (DAO) x.get("contactDAO");
      contactDAO = contactDAO.where(INSTANCE_OF(XeroContact.class));
      Sink sink;
      XeroInvoice xInvoice;
      XeroContact xContact;

      // Checks whether user has accounts to process payments onto the xero platform
      List<com.xero.model.Account> updatedAccount     = new ArrayList<>();
      Boolean                      hasSalesAccount    = false;
      Boolean                      hasExpensesAccount = false;
      for ( com.xero.model.Account xeroAccount : client_.getAccounts() ) {
        if ( "000".equals(xeroAccount.getCode()) ) {
          hasSalesAccount = true;
        }
        if ( "001".equals(xeroAccount.getCode()) ) {
          hasExpensesAccount = true;
        }
      }

      // Create an account object for the sales if one is not already created
      if ( ! hasSalesAccount ) {
        Account salesAccount = new Account();
        salesAccount.setEnablePaymentsToAccount(true);
        salesAccount.setType(AccountType.SALES);
        salesAccount.setCode("000");
        salesAccount.setName(user.getSpid().toString() + " Sales");
        salesAccount.setTaxType("NONE");
        salesAccount.setDescription("Sales account for invoices paid using the " +
          user.getSpid().toString() + " System");
        updatedAccount.add(salesAccount);
      }

      // Create an account object for the expenses if one is not already created
      if ( ! hasExpensesAccount ) {
        Account expensesAccount = new Account();
        expensesAccount.setEnablePaymentsToAccount(true);
        expensesAccount.setType(AccountType.EXPENSE);
        expensesAccount.setCode("001");
        expensesAccount.setName(user.getSpid().toString() + " Expenses");
        expensesAccount.setTaxType("NONE");
        expensesAccount.setDescription("Expenses account for invoices paid using the " +
          user.getSpid().toString() + " System");
        updatedAccount.add(expensesAccount);
      }
      if ( ! updatedAccount.isEmpty() ) {
        client_.createAccounts(updatedAccount);
      }

      // Go through each xero Contact and assess what should be done with it
      List<com.xero.model.Contact> updatedContact = new ArrayList<>();
      for ( com.xero.model.Contact xeroContact :  client_.getContacts() ) {
        sink = new ArraySink();
        sink = contactDAO.where(EQ(XeroContact.XERO_ID, xeroContact.getContactID()))
          .limit(1).select(sink);
        List list = ((ArraySink) sink).getArray();

        // Check if Contact already exists on the portal
        if (list.size() == 0) {
          xContact = new XeroContact();
        }else {
          xContact = (XeroContact) list.get(0);
          xContact = (XeroContact) xContact.fclone();

          // If the portal Contact was updated while logged out from xero
          if (xContact.getDesync()) {
            xeroContact = resyncContact( xContact, xeroContact );
            xContact.setDesync(false);
            contactDAO.put(xContact);
            updatedContact.add(xeroContact );
            continue;
          }
        }
        xContact = addContact(xContact,xeroContact);
        xContact.setOwner(user.getId());

        // Try to add the contact to portal
        try {
          contactDAO.put(xContact);
        } catch(Exception e) {

          // If the contact is not accepted into Nano portal send a notification informing user why data was not accepted
          Notification notify = new Notification();
          notify.setUserId(user.getId());
          notify.setBody("Xero Contact: " +xeroContact.getName()+
            " cannot sync due to the following required fields being empty:" +
            ((xContact.getEmail().isEmpty())?"[Email Address]":"")+
            ((xContact.getFirstName().isEmpty())?"[First Name]":"")+
            ((xContact.getLastName().isEmpty())?"[LastName]":"")+".");
          notification.put(notify);
        }
      }
      if ( ! updatedContact.isEmpty() ) {
        client_.updateContact(updatedContact);
      }

      //Get all Invoices from Xero
      List<com.xero.model.Invoice> updatedInvoices = new ArrayList<>();
      for ( com.xero.model.Invoice xeroInvoice :client_.getInvoices() ) {
        if (xeroInvoice.getStatus().value().toLowerCase().equals(InvoiceStatus.PAID.value().toLowerCase())) {
          continue;
        }
        sink = new ArraySink();
        sink = invoiceDAO.where(EQ(Invoice.INVOICE_NUMBER, xeroInvoice.getInvoiceNumber()))
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
            invoiceDAO.put(xInvoice);
            updatedInvoices.add( xeroInvoice );
            continue;
          }
        }
        xInvoice = addInvoice(x,xInvoice,xeroInvoice);
        if ( xInvoice == null ) {

          // If the invoice is not accepted into Nano portal send a notification informing user why data was not accepted
          Notification notify = new Notification();
          notify.setUserId(user.getId());
          notify.setBody("Xero Invoice # " +
            xeroInvoice.getInvoiceNumber()+
            " cannot sync due to an Invalid Contact: " +
            xeroInvoice.getContact().getName());
          notification.put(notify);
          continue;
        }
        invoiceDAO.put(xInvoice);
      }
      if ( ! updatedInvoices.isEmpty() ) {
        client_.updateInvoice(updatedInvoices);
      }
      resp.sendRedirect("/" + ( (tokenStorage.getPortalRedirect() == null) ? "" : tokenStorage.getPortalRedirect() ) );

    } catch ( XeroApiException e ) {
      e.printStackTrace();
      if ( e.getMessage().contains("token_rejected") || e.getMessage().contains("token_expired") ) {
        try {
          resp.sendRedirect("/service/xero");
        } catch ( IOException e1 ) {
          e1.printStackTrace();
        }
      }
      else {
        try {
          resp.sendRedirect("/" + ( (tokenStorage.getPortalRedirect() == null) ? "" : tokenStorage.getPortalRedirect() ) );
        } catch ( IOException e1 ) {
          e1.printStackTrace();
        }
      }
    } catch ( Exception e ) {
      e.printStackTrace();
    }
  }

}
