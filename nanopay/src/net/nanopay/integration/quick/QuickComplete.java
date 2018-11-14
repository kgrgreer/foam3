package net.nanopay.integration.quick;

import static foam.mlang.MLang.*;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.Sink;
import foam.lib.json.JSONParser;
import foam.lib.json.Outputter;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.Group;
import foam.nanos.auth.User;
import foam.nanos.http.WebAgent;
import foam.nanos.notification.Notification;
import foam.util.SafetyUtil;
import net.nanopay.integration.quick.model.*;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
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

  public void execute(X x) {
    DAO                 store        = (DAO) x.get("quickTokenStorageDAO");
    HttpServletRequest  req          = (HttpServletRequest) x.get(HttpServletRequest.class);
    HttpServletResponse resp         = (HttpServletResponse) x.get(HttpServletResponse.class);
    User                user         = (User) x.get("user");
    Group               group        = user.findGroup(x);
    AppConfig           app          = group.getAppConfig(x);
    DAO                 configDAO    = (DAO) x.get("quickConfigDAO");
    QuickConfig         config       = (QuickConfig) configDAO.find(app.getUrl());
    QuickTokenStorage   tokenStorage = (QuickTokenStorage) store.find(user.getId());

    try {
      QuickQueryContact[] customer = getCustomers(x, getRequest(tokenStorage, config, "customer") );
      QuickQueryContact[] vendor   = getVendors(x, getRequest(tokenStorage, config, "vendor"));
      QuickQueryInvoice[] invoice  = getInvoices(x, getRequest(tokenStorage, config, "invoice"));
      QuickQueryBill[]    bill     = getBills(x, getRequest(tokenStorage, config, "bill"));
      resp.sendRedirect("/" +  (SafetyUtil.isEmpty(tokenStorage.getPortalRedirect()) ? "" : tokenStorage.getPortalRedirect())  );
    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  public QuickQueryBill[] getBills(X x, String query) {
    if("null".equals(query)){
      return null;
    }
    DAO notification = (DAO) x.get("notificationDAO");
    DAO invoiceDAO   = (DAO) x.get("invoiceDAO");
    DAO contactDAO   = (DAO) x.get("bareUserDAO");
    Sink sink;
    JSONParser parser = new JSONParser();
    QuickQueryBillResponse quick = (QuickQueryBillResponse) parser.parseString(query, QuickQueryBillResponse.getOwnClassInfo().getObjClass());
    QuickQueryBills billList = quick.getQueryResponse();
    QuickQueryBill[] bills = billList.getBill();
    for (int i = 0; i < bills.length; i++) {
      QuickQueryBill invoice = bills[i];
      if( invoice.getBalance() == 0){
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
      if (list.size() == 0) {
        portal = new QuickInvoice();
      } else {
        portal = (QuickInvoice) list.get(0);
        portal = (QuickInvoice) portal.fclone();

      }
      sink = new ArraySink();
      contactDAO.where(AND(
        INSTANCE_OF(QuickContact.class),
        EQ(
          QuickContact.QUICK_ID,
          invoice.getVendorRef().getValue())))
        .limit(1)
        .select(sink);
        list = ((ArraySink) sink).getArray();
      if (list.size() == 0) {
        Notification notify = new Notification();
        notify.setUserId(user.getId());
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
      portal.setPayeeId(user.getId());
      portal.setInvoiceNumber(invoice.getDocNumber());
      portal.setQuickId(invoice.getId());
      if (!"CAD".equals(invoice.getCurrencyRef().getValue())) {
        Notification notify = new Notification();
        notify.setUserId(user.getId());
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
      portal.setIssueDate(getDate(invoice.getTxnDate()));
      portal.setDueDate(getDate(invoice.getDueDate()));
      portal.setAmount(new BigDecimal(invoice.getTotalAmt()).movePointRight(2).longValue());
      portal.setDesync(false);
      invoiceDAO.put(portal);
    }
    return bills;
  }

  public QuickQueryInvoice[] getInvoices(X x, String query) {
    if("null".equals(query)){
      return null;
    }

    DAO invoiceDAO = (DAO) x.get("invoiceDAO");
    DAO contactDAO = (DAO) x.get("bareUserDAO");
    Sink sink;
    DAO notification = (DAO) x.get("notificationDAO");

    JSONParser parser = new JSONParser();
    QuickQueryInvoiceResponse quick = (QuickQueryInvoiceResponse) parser.parseString(query, QuickQueryInvoiceResponse.getOwnClassInfo().getObjClass());
    QuickQueryInvoices invoiceList = quick.getQueryResponse();
    QuickQueryInvoice[] invoices = invoiceList.getInvoice();
    for (int i = 0; i < invoices.length; i++) {
      QuickQueryInvoice invoice = invoices[i];
      if( invoice.getBalance() == 0){
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
      if (list.size() == 0) {
        portal = new QuickInvoice();
      } else {
        portal = (QuickInvoice) list.get(0);
        portal = (QuickInvoice) portal.fclone();
      }
      sink = new ArraySink();
      contactDAO.where(AND(
        INSTANCE_OF(QuickContact.class),
        EQ(
          QuickContact.QUICK_ID,
          invoice.getCustomerRef().getValue())))
        .limit(1)
        .select(sink);
      list = ((ArraySink) sink).getArray();
      if (list.size() == 0) {
        Notification notify = new Notification();
        notify.setUserId(user.getId());
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
      portal.setPayerId(user.getId());
      portal.setStatus(net.nanopay.invoice.model.InvoiceStatus.UNPAID);
      portal.setInvoiceNumber(invoice.getDocNumber());
      portal.setQuickId(invoice.getId());
      if (!"CAD".equals(invoice.getCurrencyRef().getValue())) {
        Notification notify = new Notification();
        notify.setUserId(user.getId());
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
      portal.setIssueDate(getDate(invoice.getTxnDate()));
      portal.setDueDate(getDate(invoice.getDueDate()));
      portal.setAmount(new BigDecimal(invoice.getTotalAmt()).movePointRight(2).longValue());
      portal.setDesync(false);
      invoiceDAO.put(portal);

    }
    return invoices;
  }

  public QuickQueryContact[] getCustomers(X x, String query) {
    if("null".equals(query)){
      return null;
    }
    JSONParser parser = new JSONParser();
    QuickQueryCustomerResponse quick = new QuickQueryCustomerResponse();
    quick = (QuickQueryCustomerResponse) parser.parseString(query, quick.getClassInfo().getObjClass());
    QuickQueryCustomers customersList = quick.getQueryResponse();
    return importContacts(x, customersList.getCustomer());
  }

  public QuickQueryContact[] getVendors(X x, String query) {
    if("null".equals(query)){
      return null;
    }
    JSONParser parser = new JSONParser();
    QuickQueryVendorResponse quick = new QuickQueryVendorResponse();
    quick = (QuickQueryVendorResponse) parser.parseString(query, quick.getClassInfo().getObjClass());
    QuickQueryVendors customersList = quick.getQueryResponse();
    return importContacts(x, customersList.getVendor());
  }

  public Date getDate(String str) {
    try {
      Date date = new SimpleDateFormat("yyyy-MM-dd").parse(str);
      return date;
    } catch (Exception e) {
      return null;
    }
  }

  public String getRequest(QuickTokenStorage ts, QuickConfig config, String query) {
    HttpClient httpclient = HttpClients.createDefault();
    HttpGet httpget = new HttpGet(config.getIntuitAccountingAPIHost() + "/v3/company/" + ts.getRealmId() + "/query?query=select%20*%20from%20" + query);
    httpget.setHeader("Authorization", "Bearer " + ts.getAccessToken());
    httpget.setHeader("Content-Type", "application/json");
    httpget.setHeader("Api-Version", "alpha");
    httpget.setHeader("Accept", "application/json");
    try {
      HttpResponse response = httpclient.execute(httpget);
      BufferedReader rd = new BufferedReader(new InputStreamReader(response.getEntity().getContent()));
      if (response.getStatusLine().getStatusCode() != 200) {
        throw new Exception("Get request failed");
      }
      return rd.readLine();
    } catch (Exception e) {
      e.printStackTrace();
      return "null";
    }

  }
  public QuickQueryContact[] importContacts(X x, QuickQueryContact[] contacts){
    DAO contactDAO = (DAO) x.get("contactDAO");
    DAO notification = (DAO) x.get("notificationDAO");
    for (int i = 0; i < contacts.length; i++) {
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
      if (list.size() == 0) {
        portal = new QuickContact();
        if (email == null || "".equals(customer.getGivenName()) || "".equals(customer.getFamilyName()) || "".equals(customer.getCompanyName())) {
          Notification notify = new Notification();
          notify.setUserId(user.getId());
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
