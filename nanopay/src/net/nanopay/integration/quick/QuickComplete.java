package net.nanopay.integration.quick;

import static foam.mlang.MLang.*;

import com.intuit.oauth2.client.OAuth2PlatformClient;
import foam.blob.BlobService;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.Sink;
import foam.lib.json.JSONParser;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.Group;
import foam.nanos.auth.User;
import foam.nanos.fs.File;
import foam.nanos.http.WebAgent;
import foam.nanos.logger.Logger;
import foam.nanos.notification.Notification;
import foam.util.SafetyUtil;
import net.nanopay.integration.quick.model.*;
import net.nanopay.invoice.model.InvoiceStatus;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.client.HttpClient;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

public class QuickComplete
  implements WebAgent {

  QuickClientFactory factory;
  User user;
  Logger logger;

  public void execute(X x) {

    // Code to reference all the information pertaining to contacts and Invoices
                   this.logger       = (Logger) x.get("logger");
    HttpServletRequest  req          = x.get(HttpServletRequest.class);
    HttpServletResponse resp         = x.get(HttpServletResponse.class);
                   this.user         = (User) x.get("user");
    Group               group        = this.user.findGroup(x);
    AppConfig           app          = group.getAppConfig(x);
    DAO                 configDAO    = (DAO) x.get("quickConfigDAO");
    QuickConfig         config       = (QuickConfig) configDAO.find(app.getUrl());
    DAO                 store        = (DAO) x.get("quickTokenStorageDAO");
    QuickTokenStorage   tokenStorage = (QuickTokenStorage) store.find(this.user.getId());

    try {
      //Call functions to retrieve data one by one
      QuickQueryContact[] customer = getCustomers(x, getRequest(x, tokenStorage, config, "customer") );
      QuickQueryContact[] vendor   = getVendors(x, getRequest(x, tokenStorage, config, "vendor"));
      QuickQueryInvoice[] invoice  = getInvoices(x, getRequest(x, tokenStorage, config, "invoice"));
      QuickQueryBill[]    bill     = getBills(x, getRequest(x, tokenStorage, config, "bill"));
      resp.sendRedirect("/" +  (SafetyUtil.isEmpty(tokenStorage.getPortalRedirect()) ? "" : tokenStorage.getPortalRedirect())  );
    } catch (Exception e) {
      e.printStackTrace();
      this.logger.error(e);
    }
  }

  public QuickQueryBill[] getBills(X x, String query) {
    try {
      if ( "null".equals(query) ) {
        throw new Throwable("No bills retrieved");
      }
      DAO notification = (DAO) x.get("notificationDAO");
      DAO invoiceDAO = (DAO) x.get("invoiceDAO");
      DAO contactDAO = (DAO) x.get("bareUserDAO");
      Sink sink;
      JSONParser parser = new JSONParser();
      QuickQueryBillResponse quick = (QuickQueryBillResponse) parser.parseString(query, QuickQueryBillResponse.getOwnClassInfo().getObjClass());
      QuickQueryBills billList = quick.getQueryResponse();
      QuickQueryBill[] bills = billList.getBill();
      for ( int i = 0; i < bills.length; i++ ) {
        QuickQueryBill invoice = bills[i];

        //Checks if the invoice has been paid
        if ( invoice.getBalance() == 0 ) {
          continue;
        }
        QuickInvoice portal;

        // Looks up for a previous bill if it exists then update if not create a new Instance of Invoice
        sink = new ArraySink();
        invoiceDAO.where(AND(
          INSTANCE_OF(QuickInvoice.class),
          EQ(
            QuickInvoice.QUICK_ID,
            invoice.getId())))
          .limit(1)
          .select(sink);
        List list = ((ArraySink) sink).getArray();
        if ( list.size() == 0 ) {
          portal = new QuickInvoice();
        } else {
          portal = (QuickInvoice) list.get(0);
          portal = (QuickInvoice) portal.fclone();

        }
        sink = new ArraySink();
        // Looks up for a previous contact if it exists then update if not send a notification telling the user doesn't exist

        contactDAO.where(AND(
          INSTANCE_OF(QuickContact.class),
          EQ(
            QuickContact.QUICK_ID,
            invoice.getVendorRef().getValue())))
          .limit(1)
          .select(sink);
        list = ((ArraySink) sink).getArray();
        if ( list.size() == 0 ) {
          Notification notify = new Notification();
          notify.setUserId(this.user.getId());
          String str = "Quick Bill # " +
            invoice.getId() +
            " can not be sync'd because Quick Contact # " +
            invoice.getVendorRef().getValue() +
            " is not in this system";
          notify.setBody(str);
          notification.put(notify);
          continue;
        } else {
          portal.setPayerId(((QuickContact) list.get(0)).getId());
        }
        portal.setPayeeId(this.user.getId());
        portal.setInvoiceNumber(invoice.getDocNumber());
        portal.setQuickId(invoice.getId());

        // TODO change to accept all currencys
        // Only allows CAD
        if ( ! "CAD".equals(invoice.getCurrencyRef().getValue()) ) {
          Notification notify = new Notification();
          notify.setUserId(this.user.getId());
          String s = "Quick Invoice # " +
            invoice.getId() +
            " can not be sync'd because the currency " +
            invoice.getCurrencyRef().getValue() +
            " is not supported in this system ";
          notify.setBody(s);
          notification.put(notify);
          continue;
        }
        portal.setDestinationCurrency(invoice.getCurrencyRef().getValue());
        portal.setIssueDate(getDate(x, invoice.getTxnDate()));
        portal.setDueDate(getDate(x, invoice.getDueDate()));
        portal.setStatus(InvoiceStatus.DRAFT);

        //TODO change to associate with different currency
        portal.setAmount(new BigDecimal(invoice.getBalance()).movePointRight(2).longValue());
        portal.setDesync(false);
        invoiceDAO.put(portal);
      }
      return bills;
    } catch ( Throwable e ){
      e.printStackTrace();
      this.logger.error(e);
    }
    return null;
  }

  public QuickQueryInvoice[] getInvoices(X x, String query) {
    try {
      if ( "null".equals(query) ) {
        throw new Throwable("No invoices retrieved");
      }

      DAO invoiceDAO = (DAO) x.get("invoiceDAO");
      DAO contactDAO = (DAO) x.get("bareUserDAO");
      Sink sink;
      DAO notification = (DAO) x.get("notificationDAO");
      JSONParser parser = new JSONParser();
      QuickQueryInvoiceResponse quick = (QuickQueryInvoiceResponse) parser.parseString(query, QuickQueryInvoiceResponse.getOwnClassInfo().getObjClass());
      QuickQueryInvoices invoiceList = quick.getQueryResponse();
      QuickQueryInvoice[] invoices = invoiceList.getInvoice();

      // Looks up for a previous Invoice if it exists then update if not create a new Instance of Invoice
      for ( int i = 0; i < invoices.length; i++ ) {
        QuickQueryInvoice invoice = invoices[i];
        if ( invoice.getBalance() == 0 ) {
          continue;
        }
        QuickInvoice portal;
        sink = new ArraySink();
        invoiceDAO.where(AND(
          INSTANCE_OF(QuickInvoice.class),
          EQ(
            QuickInvoice.QUICK_ID,
            invoice.getId())))
          .limit(1)
          .select(sink);
        List list = ((ArraySink) sink).getArray();
        if ( list.size() == 0 ) {
          portal = new QuickInvoice();
        } else {
          portal = (QuickInvoice) list.get(0);
          portal = (QuickInvoice) portal.fclone();
        }
        sink = new ArraySink();

        // Looks up for a previous contact if it exists then update if not send a notification telling the user doesn't exist
        contactDAO.where(AND(
          INSTANCE_OF(QuickContact.class),
          EQ(
            QuickContact.QUICK_ID,
            invoice.getCustomerRef().getValue())))
          .limit(1)
          .select(sink);
        list = ((ArraySink) sink).getArray();
        if ( list.size() == 0 ) {
          Notification notify = new Notification();
          notify.setUserId(this.user.getId());
          String s = "Quick Invoice # " +
            invoice.getId() +
            " can not be sync'd because Quick Contact # " +
            invoice.getCustomerRef().getValue() +
            " is not in this system ";
          notify.setBody(s);
          notification.put(notify);
          continue;
        } else {
          portal.setPayeeId(((QuickContact) list.get(0)).getId());
        }
        portal.setPayerId(this.user.getId());
        portal.setStatus(InvoiceStatus.UNPAID);
        portal.setInvoiceNumber(invoice.getDocNumber());
        portal.setQuickId(invoice.getId());

        // TODO change to accept all currencys
        // Only allows CAD
        if ( ! "CAD".equals(invoice.getCurrencyRef().getValue()) ) {
          Notification notify = new Notification();
          notify.setUserId(this.user.getId());
          String s = "Quick Invoice # " +
            invoice.getId() +
            " can not be sync'd because the currency " +
            invoice.getCurrencyRef().getValue() +
            " is not supported in this system ";
          notify.setBody(s);
          notification.put(notify);
          continue;
        }
        portal.setDestinationCurrency(invoice.getCurrencyRef().getValue());
        portal.setIssueDate(getDate(x, invoice.getTxnDate()));
        portal.setDueDate(getDate(x, invoice.getDueDate()));

        //TODO change to associate with different currency
        portal.setAmount(new BigDecimal(invoice.getBalance()).movePointRight(2).longValue());
        portal.setDesync(false);

        // get attachments
        foam.nanos.fs.File[] files = getAttachments(x, "invoice", invoice.getId());
        if ( files != null && files.length != 0 ) {
          portal.setInvoiceFile(files);
        }

        invoiceDAO.put(portal);
      }

      return invoices;
    } catch ( Throwable t ) {
      this.logger.error(t);
      return null;
    }
  }

  public foam.nanos.fs.File[] getAttachments(X x, String type, String value) {

    Group               group        = this.user.findGroup(x);
    AppConfig           app          = group.getAppConfig(x);
    BlobService         blobStore    = (BlobService) x.get("blobStore");
    DAO                 fileDAO      = (DAO) x.get("fileDAO");
    DAO                 configDAO    = (DAO) x.get("quickConfigDAO");
    DAO                 store        = (DAO) x.get("quickTokenStorageDAO");
    QuickConfig         config       = (QuickConfig) configDAO.find(app.getUrl());
    QuickTokenStorage   tokenStorage = (QuickTokenStorage) store.find(this.user.getId());
    JSONParser          parser       = x.create(JSONParser.class);

    QuickQueryAttachableResponse response = (QuickQueryAttachableResponse) parser.parseString(getRequest(x, tokenStorage, config, "attachment where " +
      "AttachableRef.EntityRef.Type = '" + type + "' and AttachableRef.EntityRef.value = '" + value + "'"), QuickQueryAttachableResponse.class);
    if ( response == null ) {
      return null;
    }

    QuickQueryAttachables queryResponse = response.getQueryResponse();
    if ( queryResponse == null ) {
      return null;
    }

    QuickQueryAttachable[] attachables = queryResponse.getAttachable();
    foam.nanos.fs.File[] files = new foam.nanos.fs.File[attachables.length];
    for ( int i = 0 ; i < attachables.length ; i++ ) {
      QuickQueryAttachable attachable = attachables[i];
      long filesize = attachable.getSize();

    }

    return files;
  }

  public QuickQueryContact[] getCustomers(X x, String query) {
    try {
      if( "null".equals(query) ) {
        throw new Throwable("No customers retrieved");
      }
      JSONParser parser = new JSONParser();
      QuickQueryCustomerResponse quick = new QuickQueryCustomerResponse();
      quick = (QuickQueryCustomerResponse) parser.parseString(query, quick.getClassInfo().getObjClass());
      QuickQueryCustomers customersList = quick.getQueryResponse();
      return importContacts(x, customersList.getCustomer());
    } catch ( Throwable e ) {
      e.printStackTrace();
      this.logger.error(e);
      return null;
    }
  }

  public QuickQueryContact[] getVendors(X x, String query) {
    try {
      if( "null".equals(query) ) {
        throw new Throwable("No Vendors retrieved");
      }
      JSONParser parser = new JSONParser();
      QuickQueryVendorResponse quick = new QuickQueryVendorResponse();
      quick = (QuickQueryVendorResponse) parser.parseString(query, quick.getClassInfo().getObjClass());
      QuickQueryVendors customersList = quick.getQueryResponse();
      return importContacts(x, customersList.getVendor());
    } catch ( Throwable e ) {
      e.printStackTrace();
      this.logger.error(e);
      return null;
    }
  }

  public Date getDate(X x, String str) {
    try {
      Date date = new SimpleDateFormat("yyyy-MM-dd").parse(str);
      return date;
    } catch ( Exception e ) {
      e.printStackTrace();
      this.logger.error(e);
      return null;
    }
  }

  public String getRequest(X x, QuickTokenStorage ts, QuickConfig config, String query) {

    // Get requests through querys
    HttpClient httpclient = HttpClients.createDefault();
    OAuth2PlatformClient client = (OAuth2PlatformClient) config.getOAuth();
    HttpGet httpget = new HttpGet(config.getIntuitAccountingAPIHost() + "/v3/company/" + ts.getRealmId() + "/query?query=select%20*%20from%20" + query);
    httpget.setHeader("Authorization", "Bearer " + ts.getAccessToken());
    httpget.setHeader("Content-Type", "application/json");
    httpget.setHeader("Api-Version", "alpha");
    httpget.setHeader("Accept", "application/json");
    try {
      HttpResponse response = httpclient.execute(httpget);
      BufferedReader rd = new BufferedReader(new InputStreamReader(response.getEntity().getContent()));
      if ( response.getStatusLine().getStatusCode() != 200 ) {
        throw new Exception("Get request failed");
      }
      return rd.readLine();
    } catch ( Exception e ) {
      e.printStackTrace();
      this.logger.error(e);
      return "null";
    }

  }
  public QuickQueryContact[] importContacts(X x, QuickQueryContact[] contacts) {

    // Looks up for a previous Contact if it exists then update if not create a new Instance of Contacts
    DAO contactDAO = (DAO) x.get("contactDAO");
    DAO notification = (DAO) x.get("notificationDAO");
    for ( int i = 0; i < contacts.length; i++ ) {
      QuickQueryContact customer = contacts[i];
      QuickQueryEMail email = customer.getPrimaryEmailAddr();
      QuickContact portal = new QuickContact();
      portal.setQuickId(customer.getId());
      Sink sink = new ArraySink();
      contactDAO.where(AND(
        INSTANCE_OF(QuickContact.class),
        EQ(
          QuickContact.QUICK_ID,
          customer.getId())))
        .limit(1)
        .select(sink);
      List list = ((ArraySink) sink).getArray();
      if ( list.size() == 0 ) {
        portal = new QuickContact();

        // Send a notifiaction if the Contact wont pass protal validation( ie. Doesnt have Fname/Lname/Company/Email
        if ( email == null || "".equals(customer.getGivenName()) || "".equals(customer.getFamilyName()) || "".equals(customer.getCompanyName()) ) {
          Notification notify = new Notification();
          notify.setUserId(this.user.getId());
          String str = "Quick Contact # " +
            customer.getId() +
            " can not be added because the contact is missing: " +
            (email == null ? "[Email]" : "") +
            ("".equals(customer.getGivenName()) ? " [Given Name] " : "") +
            ("".equals(customer.getCompanyName()) ? " [Company Name] " : "") +
            ("".equals(customer.getFamilyName()) ? " [Family Name] " : "");
          notify.setBody(str);
          notification.put(notify);
          continue;
        }
      } else {
        portal = (QuickContact) list.get(0);
        portal = (QuickContact) portal.fclone();
      }
      portal.setQuickId(customer.getId());
      portal.setEmail(email.getAddress());
      portal.setOrganization(customer.getCompanyName());
      portal.setFirstName(customer.getGivenName());
      portal.setLastName(customer.getFamilyName());
      contactDAO.put(portal);
    }
    return contacts;
  }
}
