package net.nanopay.integration.quick;

import static foam.mlang.MLang.*;

import com.intuit.ipp.security.OAuth2Authorizer;
import com.intuit.oauth2.client.OAuth2PlatformClient;
import com.sun.xml.bind.v2.TODO;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.Sink;
import foam.lib.json.JSONParser;
import foam.lib.json.Outputter;
import foam.nanos.auth.User;
import foam.nanos.http.WebAgent;
import foam.nanos.notification.Notification;
import net.nanopay.integration.quick.model.*;
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
  User  user;
  private QuickTokenStorage isValidToken(X x) {
    /*
    Info:   Function to check if the User has used Xero before
    Input:  x: The context to allow access to the tokenStorageDAO to view if there's an entry for the user
    Output: Returns the Class that contains the users Tokens to properly access Xero. If using Xero for the first time will create an empty Class to load the data in
    */
    DAO          store        = (DAO)  x.get("quickTokenStorageDAO");
                 user         = (User) x.get("user");

    QuickTokenStorage tokenStorage = (QuickTokenStorage) store.find(user.getId());

    // If the user has never tried logging in to Xero before
    if ( tokenStorage == null ) {
      tokenStorage = new QuickTokenStorage();
      tokenStorage.setId(user.getId());
      tokenStorage.setAccessToken(" ");
      tokenStorage.setCsrf(" ");
      tokenStorage.setRealmId(" ");
    }
    return tokenStorage;
  }

  public void execute(X x) {
    HttpServletRequest  req          = (HttpServletRequest) x.get(HttpServletRequest.class);
    HttpServletResponse resp         = (HttpServletResponse) x.get(HttpServletResponse.class);
    DAO                 store        = (DAO) x.get("quickTokenStorageDAO");
    QuickConfig         config       = (QuickConfig) x.get("quickConfig");
    QuickTokenStorage   tokenStorage = isValidToken(x);
    QuickOauth          auth         = (QuickOauth) x.get("quickAuth");
    String              code         = req.getParameter("code");
    String              state        = req.getParameter("state");
    String              realm        = req.getParameter("realmId");
    try {
      OAuth2PlatformClient client = (OAuth2PlatformClient) auth.getOAuth();
      OAuth2Authorizer oauth = new OAuth2Authorizer(tokenStorage.getAccessToken()); //set access token obtained from BearerTokenResponse
      QuickQueryCustomer[] customer = getCustomers (x, tokenStorage,config);
      QuickQueryInvoice[] invoice = getInvoices(x, tokenStorage,config);
      QuickQueryBill[] bill = getBills(x, tokenStorage,config);

      System.out.println(invoice.length);
      System.out.println(bill.length);
      System.out.println(customer.length);
      resp.sendRedirect("/");
    } catch (Exception e) {
      e.printStackTrace();
    }
  }
  public QuickQueryBill[] getBills(X x,QuickTokenStorage ts, QuickConfig config){
    try {
      DAO        invoiceDAO   = (DAO) x.get("invoiceDAO");
      DAO        contactDAO   = (DAO) x.get("bareUserDAO");
      Sink       sink         = new ArraySink();
      HttpClient httpclient   = HttpClients.createDefault();
      DAO        notification = (DAO) x.get("notificationDAO");

      System.out.println(ts.getAccessToken());
      HttpGet httpget =  new HttpGet(config.getIntuitAccountingAPIHost()+"/v3/company/"+ts.getRealmId()+"/query?query=select%20*%20from%20bill");
      httpget.setHeader("Authorization", "Bearer "+ts.getAccessToken());
      httpget.setHeader("Content-Type","application/json");
      httpget.setHeader("Api-Version","alpha");
      httpget.setHeader("Accept","application/json");
      HttpResponse response = httpclient.execute(httpget);
      BufferedReader  rd = new BufferedReader(new InputStreamReader(response.getEntity().getContent()));
      String line;
      line = rd.readLine();
      System.out.println(line);
      JSONParser parser = new JSONParser();
      System.out.println("*************************");
      QuickQueryBillResponse quick = (QuickQueryBillResponse) parser.parseString(line, QuickQueryBillResponse.getOwnClassInfo().getObjClass());
      QuickQueryBills billList = quick.getQueryResponse();
      QuickQueryBill[] bills = billList.getBill();
      for (int i = 0; i<bills.length; i++) {
        QuickQueryBill invoice = bills[i];
        QuickInvoice portal = new QuickInvoice();
        QuickQueryNameValue vendor = invoice.getVendorRef();
        System.out.println(vendor);
        contactDAO   = contactDAO.where(AND(
          INSTANCE_OF(QuickContact.class),
          EQ(
            QuickContact.QUICK_ID,
            vendor.getValue())))
          .limit(1);
        contactDAO.select(sink);
        List list = ((ArraySink) sink).getArray();
        if ( list.size() == 0 ) {
          Notification notify = new Notification();
          String str = "Quick Bill # " +
            invoice.getId() +
            "can not be sync'd because Quick Contact # " +
            vendor.getValue() +
            "is not in this system";
          notify.setBody(str);
          notification.put(notify);
          continue;
        } else {
          portal.setPayerId( ( (QuickInvoice) list.get(0) ).getId());
        }
        portal.setPayeeId(user.getId());
        portal.setInvoiceNumber(invoice.getDocNumber());
        portal.setQuickId(invoice.getId());
        portal.setDestinationCurrency(invoice.getCurrencyRef().getValue());
        portal.setIssueDate( getDate(invoice.getTxnDate()));
        portal.setDueDate(getDate(invoice.getDueDate()));
        portal.setAmount(new BigDecimal(invoice.getTotalAmt()).movePointRight(2).longValue());
        portal.setDesync(false);
        System.out.println(portal);
        invoiceDAO.put(portal);
      }
      return bills;

    } catch (Exception e) {
      e.printStackTrace();
    }
    return null;
  }

  public QuickQueryInvoice[] getInvoices(X x, QuickTokenStorage ts, QuickConfig config){
    try {
      DAO        invoiceDAO   = (DAO) x.get("invoiceDAO");
      DAO        contactDAO   = (DAO) x.get("bareUserDAO");
      Sink       sink         = new ArraySink();
      HttpClient httpclient   = HttpClients.createDefault();
      DAO        notification = (DAO) x.get("notificationDAO");

      System.out.println(ts.getAccessToken());
      HttpGet httpget =  new HttpGet(config.getIntuitAccountingAPIHost()+"/v3/company/"+ts.getRealmId()+"/query?query=select%20*%20from%20invoice");
      httpget.setHeader("Authorization", "Bearer "+ts.getAccessToken());
      httpget.setHeader("Content-Type","application/json");
      httpget.setHeader("Api-Version","alpha");
      httpget.setHeader("Accept","application/json");
      HttpResponse response = httpclient.execute(httpget);
      BufferedReader  rd = new BufferedReader(new InputStreamReader(response.getEntity().getContent()));
      String line;
      line = rd.readLine();
      System.out.println(line);
      JSONParser parser = new JSONParser();
      System.out.println("*************************");
      QuickQueryInvoiceResponse quick = (QuickQueryInvoiceResponse) parser.parseString(line, QuickQueryInvoiceResponse.getOwnClassInfo().getObjClass());
      QuickQueryInvoices invoiceList = quick.getQueryResponse();
      QuickQueryInvoice[] invoices = invoiceList.getInvoice();
      for (int i = 0; i<invoices.length; i++) {
        QuickQueryInvoice invoice = invoices[i];
        QuickInvoice portal = new QuickInvoice();
        QuickQueryNameValue cust = invoice.getCustomerRef();
        contactDAO   = contactDAO.where(AND(
          INSTANCE_OF(QuickContact.class),
          EQ(
            QuickContact.QUICK_ID,
            cust.getValue())))
          .limit(1);
        contactDAO.select(sink);
        List list = ((ArraySink) sink).getArray();
        if ( list.size() == 0 ) {
          Notification notify = new Notification();
          String s = "Quick Invoice #" +
            invoice.getId() +
            "can not be sync'd because Quick Contact #" +
            cust.getValue() +
            "is not in this system";
          notify.setBody(s);
          System.out.println(s);
          notification.put(notify);
          continue;
        } else {
          portal.setPayeeId( ( (QuickContact) list.get(0) ).getId());
        }
        portal.setPayerId(user.getId());
        portal.setStatus(net.nanopay.invoice.model.InvoiceStatus.UNPAID);
        portal.setInvoiceNumber(invoice.getDocNumber());
        portal.setQuickId(invoice.getId());
        if ( ! "CAD".equals(invoice.getCurrencyRef().getValue())){
          Notification notify = new Notification();
          String s = "Quick Invoice #" +
            invoice.getId() +
            "can not be sync'd because the currency" +
            invoice.getCurrencyRef().getValue() +
            "is not supported in this system";
          notify.setBody(s);
          System.out.println(s);
          notification.put(notify);
          continue;
        }
        portal.setDestinationCurrency(invoice.getCurrencyRef().getValue());
        portal.setIssueDate( getDate(invoice.getTxnDate()));
        portal.setDueDate(getDate(invoice.getDueDate()));
        portal.setAmount(new BigDecimal(invoice.getTotalAmt()).movePointRight(2).longValue());
        portal.setDesync(false);
        System.out.println(portal);
        invoiceDAO.put(portal);

      }
      return invoices;

    } catch (Exception e) {
      e.printStackTrace();
    }
    return null;
  }
  public QuickQueryCustomer[] getCustomers(X x, QuickTokenStorage ts, QuickConfig config){
    try {
      DAO        contactDAO   = (DAO) x.get("contactDAO");
      DAO        notification = (DAO) x.get("notificationDAO");
      HttpClient httpclient = HttpClients.createDefault();
      Outputter jout = new Outputter();
      System.out.println(ts.getAccessToken());
      HttpGet httpget =  new HttpGet(config.getIntuitAccountingAPIHost()+"/v3/company/"+ts.getRealmId()+"/query?query=select%20*%20from%20Customer");
      httpget.setHeader("Authorization", "Bearer "+ts.getAccessToken());
      httpget.setHeader("Content-Type","application/json");
      httpget.setHeader("Api-Version","alpha");
      httpget.setHeader("Accept","application/json");
      HttpResponse response = httpclient.execute(httpget);
      BufferedReader  rd = new BufferedReader(new InputStreamReader(response.getEntity().getContent()));
      String line;
      line = rd.readLine();
      System.out.println(line);
      JSONParser parser = new JSONParser();

      QuickQueryCustomerResponse quick = new QuickQueryCustomerResponse();
      quick = (QuickQueryCustomerResponse) parser.parseString(line,quick.getClassInfo().getObjClass());
      QuickQueryCustomers customersList = quick.getQueryResponse();
      QuickQueryCustomer[] customers = customersList.getCustomer();
      System.out.println(jout.stringify(customers[0]));
      for (int i = 0; i<customers.length; i++) {
        QuickQueryCustomer customer = customers[i];
        QuickQueryEMail email = customer.getPrimaryEmailAddr();
        QuickContact portal = new QuickContact();
        System.out.println(customer.toJSON());
        System.out.println(customer);
        portal.setQuickId(customer.getId());
        if (email == null || "".equals(customer.getGivenName()) || "".equals(customer.getFamilyName()) || "".equals(customer.getCompanyName()) ) {
          Notification notify = new Notification();
          String str ="Quick Contact #" +
            customer.getId() +
            "can not be added because the contact is missing: " +
            (email == null?"[Email]":"") +
            ("".equals(customer.getGivenName()) ?"[Given Name]":"") +
            ("".equals(customer.getCompanyName()) ?"[Company Name]":"") +
            ("".equals(customer.getFamilyName()) ?"[Family Name]":"");
          notify.setBody(str);
          System.out.println(str);
          notification.put(notify);
          continue;
        }
        portal.setEmail( email.getAddress() );
        portal.setOrganization( customer.getCompanyName() );
        portal.setFirstName( customer.getGivenName());
        portal.setLastName( customer.getFamilyName() );
        System.out.println(portal);
        contactDAO.put(portal);
      }
      return customers;

    } catch (Exception e) {
      e.printStackTrace();
    }
    return null;
  }
  public Date getDate(String str){
    try {
      Date date=new SimpleDateFormat("yyyy-MM-dd").parse(str);
      return date;
    } catch ( Exception e ) {
      return null;
    }
  }
}
