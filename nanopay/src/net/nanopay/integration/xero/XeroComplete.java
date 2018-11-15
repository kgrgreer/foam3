package net.nanopay.integration.xero;

import com.xero.api.XeroApiException;
import com.xero.api.XeroClient;

import static foam.mlang.MLang.*;

import com.xero.model.*;
import foam.dao.ArraySink;
import foam.dao.Sink;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.Group;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.notification.Notification;
import foam.util.SafetyUtil;
import net.nanopay.integration.xero.model.XeroContact;
import net.nanopay.integration.xero.model.XeroInvoice;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.http.WebAgent;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;


public class XeroComplete
  implements WebAgent {

  XeroClient client_;

  // Syncs nano to xero if desyncing occurs
  private boolean resyncInvoice(X x, XeroInvoice nano, com.xero.model.Invoice xero) {
    /*
    Info:   Function to make Xero match Nano object. Occurs when Nano object is updated and user is not logged into Xero
    Input:  nano: The currently updated object on the portal
            xero: The Xero object to be resynchronized
    Output: Returns the Xero Object after being updated from nano portal
    */
    User        user         = (User) x.get("user");
    DAO         notification = (DAO) x.get("notificationDAO");
    try {
      List<Account> xeroAccountsList = client_.getAccounts();
      int j;
      boolean      isPayer      = true;

      // Determine if current user is the Payer
      if ( InvoiceType.ACCREC == xero.getType() ) {
        isPayer = false;
      }

      // Finds the account to be used to show a payment made in the system
      for ( j = 0; j < xeroAccountsList.size(); j++ ) {
        com.xero.model.Account xeroAccount = xeroAccountsList.get(j);

        // If the account doesn't have a code
        if (xeroAccount.getCode() == null){
          continue;
        }

        //Accounts Receivable Code
        if ( "000".equals(xeroAccount.getCode()) && ! isPayer ) {
          break;
        }

        //Accounts Payable Code
        if ( "001".equals(xeroAccount.getCode()) && isPayer ) {
          break;
        }
      }
      com.xero.model.Invoice xeroInvoice = xero;
      com.xero.model.Account xeroAccount = xeroAccountsList.get(j);
      List<Invoice> xeroInvoiceList      = new ArrayList<>();

      // Checks to see if the xero invoice was set to Authorized before; if not sets it to authorized
      if ( ! (InvoiceStatus.AUTHORISED == xeroInvoice.getStatus()) ) {
        xeroInvoice.setStatus(InvoiceStatus.AUTHORISED);
        xeroInvoiceList.add( xeroInvoice );
        client_.updateInvoice(xeroInvoiceList);
      }

      // Creates a payment for the full amount for the invoice and sets it paid to the dummy account on xero
      Payment payment = new Payment();
      payment.setInvoice(xeroInvoice);
      payment.setAccount(xeroAccount);
      Calendar cal = Calendar.getInstance();
      cal.setTime(new Date());
      payment.setDate(cal);
      payment.setAmount(BigDecimal.valueOf(nano.getAmount()).movePointLeft(2));
      List<Payment> paymentList = new ArrayList<>();
      paymentList.add(payment);
      client_.createPayments(paymentList);
      return true;
    } catch ( XeroApiException e ) {
      Logger logger =  (Logger) x.get("logger");
      logger.error(e);
      Notification notify = new Notification();
      notify.setUserId(user.getId());
      notify.setBody("Please check Invoice: " + nano.getInvoiceNumber() + " of Xero and try again");
      notification.put(notify);
      return false;
    } catch ( Exception e ) {
      Logger logger =  (Logger) x.get("logger");
      logger.error(e);
      Notification notify = new Notification();
      notify.setUserId(user.getId());
      notify.setBody("An error occured while syncing Invoice: " + nano.getInvoiceNumber() + " with Xero, Please try again");
      notification.put(notify);
      return false;
    }
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
    boolean     validContact = true;
    DAO         notification = (DAO) x.get("notificationDAO");
    Sink        sink         = new ArraySink();
    DAO         contactDAO   = (DAO) x.get("bareUserDAO");
    contactDAO = contactDAO.where(AND(
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
      nano.setStatus(net.nanopay.invoice.model.InvoiceStatus.DRAFT);
      nano.setDraft(true);
      nano.setInvoiceNumber(xero.getInvoiceNumber());
    } else {
      nano.setPayerId(user.getId());
      nano.setPayeeId(contact.getId());
      nano.setStatus(net.nanopay.invoice.model.InvoiceStatus.UNPAID);
    }
    nano.setXeroId(xero.getInvoiceID());
    nano.setDestinationCurrency(xero.getCurrencyCode().value());
    nano.setIssueDate(xero.getDate().getTime());
    nano.setDueDate(xero.getDueDate().getTime());
    //TODO: Change when the currency is not CAD and USD
    nano.setAmount((xero.getAmountDue().movePointRight(2)).longValue());
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
    nano.setEmail(SafetyUtil.isEmpty(xero.getEmailAddress()) ? "" : xero.getEmailAddress());
    nano.setOrganization(xero.getName());
    nano.setFirstName(SafetyUtil.isEmpty(xero.getFirstName()) ? "" : xero.getFirstName());
    nano.setLastName(SafetyUtil.isEmpty(xero.getLastName()) ? "" : xero.getLastName());
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
    DAO                 store        = (DAO) x.get("xeroTokenStorageDAO");
    DAO                 notification = (DAO) x.get("notificationDAO");
    User                user         = (User) x.get("user");
    XeroTokenStorage    tokenStorage = (XeroTokenStorage) store.find(user.getId());
    Group               group        = user.findGroup(x);
    AppConfig           app          = group.getAppConfig(x);
    DAO                 configDAO    = (DAO) x.get("xeroConfigDAO");
    XeroConfig          config       = (XeroConfig)configDAO.find(app.getUrl());

    try {
      // Configures the client Object with the users token data
      client_ = new XeroClient(config);
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
      boolean                      hasSalesAccount    = false;
      boolean                      hasExpensesAccount = false;
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
        } catch (Exception e) {

          // If the contact is not accepted into Nano portal send a notification informing user why data was not accepted
          Notification notify = new Notification();
          notify.setUserId(user.getId());
          notify.setBody("Xero Contact: " +xeroContact.getName()+
            " cannot sync due to the following required fields being empty:" +
            (SafetyUtil.isEmpty(xContact.getEmail())?"[Email Address]":"")+
            (SafetyUtil.isEmpty(xContact.getFirstName())?"[First Name]":"")+
            (SafetyUtil.isEmpty(xContact.getLastName())?"[LastName]":"")+".");
          notification.put(notify);
        }
      }
      if ( ! updatedContact.isEmpty() ) {
        client_.updateContact(updatedContact);
      }

      //Get all Invoices from Xero
      List<com.xero.model.Invoice> updatedInvoices = new ArrayList<>();
      for ( com.xero.model.Invoice xeroInvoice :client_.getInvoices() ) {
        if ( InvoiceStatus.PAID == xeroInvoice.getStatus()
          || InvoiceStatus.VOIDED == xeroInvoice.getStatus() ) {
          continue;
        }
        sink = new ArraySink();
        sink = invoiceDAO.where(EQ(XeroInvoice.XERO_ID, xeroInvoice.getInvoiceID()))
          .limit(1).select(sink);
        List list = ((ArraySink) sink).getArray();
        if ( list.size() == 0 ) {
          xInvoice = new XeroInvoice();
        } else {
          xInvoice = (XeroInvoice) list.get(0);
          xInvoice = (XeroInvoice) xInvoice.fclone();
          if ( xInvoice.getDesync() ) {
            if (resyncInvoice(x, xInvoice,xeroInvoice)){
              xInvoice.setDesync(false);
              invoiceDAO.put(xInvoice);
            }
            continue;
          }
        }
        //TODO: Remove this when we accept other currencies
        if ( ! (xeroInvoice.getCurrencyCode() == CurrencyCode.CAD || xeroInvoice.getCurrencyCode() == CurrencyCode.USD) ){
          Notification notify = new Notification();
          notify.setUserId(user.getId());
          notify.setBody("Xero Invoice # " +
            xeroInvoice.getInvoiceNumber()+
            " cannot sync due to portal only accepting CAD and USD");
          notification.put(notify);
          continue;
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
    } catch ( Exception e ) {
      Logger logger =  (Logger) x.get("logger");
      logger.error(e);
      if (e.getMessage().contains("token_rejected") || e.getMessage().contains("token_expired")) {
        try {
          resp.sendRedirect("/service/xero");
        } catch (IOException e1) {
          e1.printStackTrace();
        }
      } else {
        try {
          Notification notify = new Notification();
          notify.setUserId(user.getId());
          notify.setBody("An error occured while trying to sync the data: " + e.getMessage());
          notification.put(notify);
          resp.sendRedirect("/" + ((tokenStorage.getPortalRedirect() == null) ? "" : tokenStorage.getPortalRedirect()));
        } catch (IOException e1) {
          logger.error(e1);
        }
      }
    }
  }
}
