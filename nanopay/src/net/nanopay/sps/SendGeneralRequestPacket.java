package net.nanopay.sps;

import foam.core.ContextAgent;
import foam.core.X;
import foam.nanos.logger.Logger;
import net.nanopay.sps.model.GeneralRequestPacket;
import net.nanopay.sps.model.UserInfo;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicNameValuePair;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

public class SendGeneralRequestPacket implements ContextAgent {

  @Override
  public void execute(X x) {
    Logger logger = (Logger) x.get("logger");

    String testData = "20<FS>2010<FS>10<FS>20180619115959<FS><FS>ZYX80<FS>[NAME]John Jones[/NAME][ACCT]C[/ACCT]" +
      "[OTHER]1234567890-0001[/OTHER][LOCATION]NANOPAY[/LOCATION][TYPE]P[/TYPE][SECC]WEB[/SECC][PTC]S[/PTC]<FS><FS>" +
      "122000247<FS>9988998899<FS>9999<FS>550.00<FS><FS><FS><FS><FS><FS>EV<FS><FS><FS><FS>";

    GeneralRequestPacket generalRequestPacket = new GeneralRequestPacket();
    UserInfo userInfo = new UserInfo();

    int msgNum = 20;
    int packetNum = 2010;
    int messageModifierCode = 10;
    String localTransactionTime = "20180619115959";
    String textMsg = "";
    String TID = "ZYX80";

    // userInfo
    String name = "John Jones";
    String acct = "C";
    String other = "1234567890-0001";
    String location = "NANOPAY";
    String type = "P";
    String secc = "WEB";
    String ptc = "S";


    String MICR = "";
    String routeCode = "122000247";
    String account = "9988998899";
    String checkNum = "9999";
    String amount = "550.00";
    String invoice = "";
    String clerkID = "";
    // not used
    String maxDetailItemsPerTransmission = "";
    String socialSecurityNum = "";
    String itemID = "";
    String optionsSelected = "";
    String driversLicense = "";
    String DLStateCode = "";
    String dateOfBirth = "";
    String phoneNumber = "";

    try {
      String url = "https://spaysys.com/cgi-bin/cgiwrap-noauth/dl4ub/tinqpstpbf.cgi";

      HttpClient client = new DefaultHttpClient();
      HttpPost post = new HttpPost(url);

      List<NameValuePair> urlParameters = new ArrayList<>();
      urlParameters.add(new BasicNameValuePair("packet", testData));
      post.setEntity(new UrlEncodedFormEntity(urlParameters));

      HttpResponse response = client.execute(post);

      System.out.println("Sending 'POST' request to URL : " + url);
      System.out.println("Post parameters : " + post.getEntity());
      System.out.println("Response Code : " +
        response.getStatusLine().getStatusCode());

      BufferedReader rd = new BufferedReader(
        new InputStreamReader(response.getEntity().getContent()));

      StringBuilder result = new StringBuilder();
      String line;
      while ((line = rd.readLine()) != null) {
        result.append(line);
      }

      System.out.println(result.toString());


    } catch (IOException e) {
      e.printStackTrace();
    }


  }
}
