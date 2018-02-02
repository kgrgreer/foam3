package net.nanopay.fresh;

import foam.core.*;
import foam.lib.json.Outputter;
import foam.mlang.sink.Map;
import net.nanopay.b2b.model.Business;
import net.nanopay.fresh.FreshConfig;
import foam.nanos.http.WebAgent;
import net.nanopay.fresh.model.*;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.client.HttpClient;
import foam.lib.json.JSONParser;
import org.json.JSONObject;


import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.URI;
import java.util.HashMap;
import java.util.List;


public class FreshBook
  implements WebAgent
{
  public void execute(X x)
  {
    HttpServletRequest req = ( HttpServletRequest ) x.get( HttpServletRequest.class );
    HttpServletResponse resp = ( HttpServletResponse ) x.get( HttpServletResponse.class );
    PrintWriter out = ( PrintWriter ) x.get( PrintWriter.class );

    FreshConfig config = new FreshConfig();
    config.setCode(req.getParameter("code"));

    try {
      //Sends the client info to FreshBooks to retrieve the access Token
      HttpClient httpclient = HttpClients.createDefault();
      HttpPost httppost = new HttpPost("https://api.freshbooks.com/auth/oauth/token");
      httppost.setHeader("Content-Type","application/json");
      httppost.setHeader("Api-Version","alpha");
      String body = "{ \n" +
        "\"grant_type\": \""+config.getGrant_type()+"\",\n" +
        "\"client_secret\": \""+config.getClient_secret()+"\",\n" +
        "\"code\": \""+config.getCode()+"\",\n" +
        "\"client_id\": \""+config.getClient_id()+"\",\n" +
        "\"redirect_uri\": \""+config.getRedirect_uri()+"\"\n" +
        "}";
      System.out.println(body);
      httppost.setEntity(new StringEntity(body, ContentType.APPLICATION_FORM_URLENCODED));
      HttpResponse response = httpclient.execute(httppost);

      //Reads in the response
      BufferedReader rd = new BufferedReader(new InputStreamReader(response.getEntity().getContent()));
      String line;
      line = rd.readLine();
      JSONParser parser = new JSONParser();
      FreshToken token = new FreshToken();

      //Parses the response and sets to a model that matches
      token = (FreshToken) parser.parseString(line,token.getClassInfo().getObjClass());
      System.out.println(line);
      System.out.println(token.getAccess_token());

      //Second call to api to retrieve the user using the accessToken
      HttpGet httpget =  new HttpGet("https://api.freshbooks.com/auth/api/v1/users/me");
      httpget.setHeader("Authorization", "Bearer "+token.getAccess_token());
      httpget.setHeader("Content-Type","application/json");
      httpget.setHeader("Api-Version","alpha");
      response = httpclient.execute(httpget);
      rd = new BufferedReader(new InputStreamReader(response.getEntity().getContent()));
      line = rd.readLine();
      System.out.println(line);
      FreshResponse fResponse = new FreshResponse();

      //Parses the response and sets to a model that matches
      Outputter jout = new Outputter();
      fResponse = (FreshResponse) parser.parseString(line,fResponse.getClassInfo().getObjClass());
      System.out.println(jout.stringify(fResponse));
      System.out.println((FreshCurrent) fResponse.getResponse());
      FreshCurrent current = (FreshCurrent) fResponse.getResponse();
      FreshBusiness business = (FreshBusiness) current.getBusiness_memberships()[0].getBusiness();

      //Get the account id to start grabbing invoices
      String accountId = business.getAccount_id();
      System.out.println(accountId);


      httpclient = HttpClients.createDefault();
      httpget =  new HttpGet("https://api.freshbooks.com/accounting/account/"+accountId+"/invoices/invoices");
      System.out.println(httpget.getURI());
      httpget.setHeader("Authorization", "Bearer "+token.getAccess_token());
      httpget.setHeader("Content-Type","application/json");
      httpget.setHeader("Api-Version","alpha");
      response = httpclient.execute(httpget);
      rd = new BufferedReader(new InputStreamReader(response.getEntity().getContent()));
      line = rd.readLine();
      System.out.println(line);

      FreshInvoiceResponse fLResponse = new FreshInvoiceResponse();
      fLResponse = (FreshInvoiceResponse) parser.parseString(line,fLResponse.getClassInfo().getObjClass());
      FreshInvoice[] invoices = (FreshInvoice[]) fLResponse.getResponse().getResult().getInvoices();
      System.out.println(invoices[0]);
      System.out.println(jout.stringify(invoices[0]));

      DAO invoiceDAO = (DAO) getX().get("invoiceDAO");
      Invoice account = new Invoice();
      account

      out.println("<HTML>" +
        "<H1> MADE IT</H1>"+

        "</HTML>");

    }catch (Throwable e){
      System.out.println("*******************************BAD NEWS");
      e.printStackTrace();
      return;
    }

  }
}