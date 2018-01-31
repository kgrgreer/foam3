package net.nanopay.fresh;

import foam.core.*;
import foam.mlang.sink.Map;
import net.nanopay.fresh.FreshConfig;
import foam.nanos.http.WebAgent;
import net.nanopay.fresh.model.FreshToken;
import org.apache.http.HttpResponse;
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
//// Request parameters and other properties.
      System.out.println(body);
      httppost.setEntity(new StringEntity(body, ContentType.APPLICATION_FORM_URLENCODED));

//Execute and get the response.
      HttpResponse response = httpclient.execute(httppost);
      BufferedReader rd = new BufferedReader(new InputStreamReader(response.getEntity().getContent()));
      String line;
      line = rd.readLine();
      JSONParser parser = new JSONParser();
      FreshToken token = new FreshToken();
      parser.parseString(line,token.getClassInfo().getObjClass());
      System.out.println(line);
      System.out.println(token.getAccess_token());
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