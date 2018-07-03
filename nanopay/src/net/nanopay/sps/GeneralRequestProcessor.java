package net.nanopay.sps;

import foam.core.ContextAgent;
import foam.core.X;
import foam.nanos.logger.Logger;
import net.nanopay.sps.model.GeneralRequestPacket;
import net.nanopay.sps.model.GeneralRequestResponse;
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

public class GeneralRequestProcessor {

  public void execute() {
    //Logger logger = (Logger) x.get("logger");

    String testData = "20<FS>2010<FS>10<FS>20180702115959<FS><FS>ZYX80<FS>[NAME]John Jones[/NAME][ACCT]C[/ACCT]" +
      "[OTHER]1234567890-0001[/OTHER][LOCATION]NANOPAY[/LOCATION][TYPE]P[/TYPE][SECC]WEB[/SECC][PTC]S[/PTC]<FS><FS>" +
      "122000247<FS>9988998899<FS>9999<FS>550.00<FS><FS><FS><FS><FS><FS>EV<FS><FS><FS><FS>";

    GeneralRequestPacket generalRequestPacketTest = new GeneralRequestPacket();
    UserInfo userInfoTest = new UserInfo();
    GeneralRequestResponse generalRequestResponse = new GeneralRequestResponse();

    generalRequestPacketTest.setMsgNum(20);
    generalRequestPacketTest.setPacketNum(2010);
    generalRequestPacketTest.setMessageModifierCode(10);
    generalRequestPacketTest.setLocalTransactionTime("20180702115959");
    generalRequestPacketTest.setTextMsg("");
    generalRequestPacketTest.setTID("ZYX80");

    // user info
    userInfoTest.setName("John Jones");
    userInfoTest.setAcct("C");
    userInfoTest.setOther("1234567890-0001");
    userInfoTest.setLocation("NANOPAY");
    userInfoTest.setType("P");
    userInfoTest.setSecc("WEB");
    userInfoTest.setPtc("S");
    generalRequestPacketTest.setUserInfo(userInfoTest);

    generalRequestPacketTest.setMICR("");
    generalRequestPacketTest.setRouteCode("122000247");
    generalRequestPacketTest.setAccount("9988998899");
    generalRequestPacketTest.setCheckNum("9999");
    generalRequestPacketTest.setAmount("550.00");
    generalRequestPacketTest.setInvoice("");
    generalRequestPacketTest.setClerkID("");
    // not used
    generalRequestPacketTest.setMaxDetailItemsPerTransmission("");
    generalRequestPacketTest.setSocialSecurityNum("");
    generalRequestPacketTest.setItemID("");
    generalRequestPacketTest.setOptionsSelected("EV");
    generalRequestPacketTest.setDriversLicense("");
    generalRequestPacketTest.setDLStateCode("");
    generalRequestPacketTest.setDateOfBirth("");
    generalRequestPacketTest.setPhoneNumber("");

    String generatedData = generalRequestPacketTest.toSPSString();


    System.out.println(generatedData);
    if (generatedData.equals(testData)) {
      System.out.println("right");
    }



    try {
      String url = "https://spaysys.com/cgi-bin/cgiwrap-noauth/dl4ub/tinqpstpbf.cgi";

      HttpClient client = new DefaultHttpClient();
      HttpPost post = new HttpPost(url);

      List<NameValuePair> urlParameters = new ArrayList<>();
      urlParameters.add(new BasicNameValuePair("packet", generatedData));
      post.setEntity(new UrlEncodedFormEntity(urlParameters));

      HttpResponse httpResponse = client.execute(post);

      System.out.println("Sending 'POST' request to URL : " + url);
      System.out.println("Post parameters : " + post.getEntity());
      System.out.println("Response Code : " +
        httpResponse.getStatusLine().getStatusCode());

      BufferedReader rd = new BufferedReader(
        new InputStreamReader(httpResponse.getEntity().getContent()));

      StringBuilder sb = new StringBuilder();
      String line;
      while ((line = rd.readLine()) != null) {
        sb.append(line);
      }

      String response = sb.toString();
      System.out.println(response);

      generalRequestResponse.parseSPSResponse(response);
      System.out.println("after parse");
      System.out.println(generalRequestResponse);


    } catch (IOException | IllegalAccessException | InstantiationException e) {
      e.printStackTrace();
    }


  }
}
