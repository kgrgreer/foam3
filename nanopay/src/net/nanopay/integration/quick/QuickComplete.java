package net.nanopay.integration.quick;

import com.intuit.ipp.security.OAuth2Authorizer;
import com.intuit.oauth2.client.OAuth2PlatformClient;
import foam.core.X;
import foam.dao.DAO;
import foam.lib.json.JSONParser;
import foam.lib.json.Outputter;
import foam.nanos.auth.User;
import foam.nanos.http.WebAgent;
import net.nanopay.integration.quick.model.*;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.client.HttpClient;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.InputStreamReader;

public class QuickComplete
  implements WebAgent {

  QuickClientFactory factory;
  private QuickTokenStorage isValidToken(X x) {
    /*
    Info:   Function to check if the User has used Xero before
    Input:  x: The context to allow access to the tokenStorageDAO to view if there's an entry for the user
    Output: Returns the Class that contains the users Tokens to properly access Xero. If using Xero for the first time will create an empty Class to load the data in
    */
    DAO          store        = (DAO)  x.get("quickTokenStorageDAO");
    User         user         = (User) x.get("user");
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
      QuickInvoice[] invoice = getInvoices(tokenStorage,config);
      QuickCustomer[] customer = getCustomers ( tokenStorage,config);
      System.out.println(invoice.length);
      System.out.println(customer.length);
    } catch (Exception e) {
      e.printStackTrace();
    }
  }
  public QuickInvoice[] getInvoices(QuickTokenStorage ts, QuickConfig config){
    try {
      HttpClient httpclient = HttpClients.createDefault();
      Outputter jout = new Outputter();
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

      QuickQueryInvoiceResponse quick = new QuickQueryInvoiceResponse();
      quick = (QuickQueryInvoiceResponse) parser.parseString(line,quick.getClassInfo().getObjClass());
      QuickInvoices invoiceList = quick.getQueryResponse();
      QuickInvoice[] invoices = invoiceList.getInvoice();
      System.out.println(jout.stringify(invoices[0]));
      for (int i = 0; i<invoices.length; i++) {
        QuickInvoice invoice = invoices[i];
        System.out.println(invoice.toJSON());
      }
      return invoices;

    } catch (Exception e) {
      e.printStackTrace();
    }
    return null;
  }
  public QuickCustomer[] getCustomers(QuickTokenStorage ts, QuickConfig config){
    try {
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
      QuickCustomers customersList = quick.getQueryResponse();
      QuickCustomer[] customers = customersList.getCustomer();
      System.out.println(jout.stringify(customers[0]));
      for (int i = 0; i<customers.length; i++) {
        QuickCustomer customer = customers[i];
        System.out.println(customer.toJSON());
      }
      return customers;

    } catch (Exception e) {
      e.printStackTrace();
    }
    return null;
  }
}
