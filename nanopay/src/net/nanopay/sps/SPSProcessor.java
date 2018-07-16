package net.nanopay.sps;

import foam.core.ContextAwareSupport;
import net.nanopay.sps.model.*;
import net.nanopay.sps.utils.RequestPacket;
import net.nanopay.sps.utils.ResponsePacket;
import org.apache.http.NameValuePair;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicNameValuePair;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

public class SPSProcessor extends ContextAwareSupport {

  public final String URL = "https://spaysys.com/cgi-bin/cgiwrap-noauth/dl4ub/tinqpstpbf.cgi";

  public void sendGeneralReqAndParseResp() {
    GeneralRequestPacket generatedData = generateTestGeneralRequest();
    GeneralRequestResponse generalRequestResponse = (GeneralRequestResponse) request(generatedData);
    System.out.println(generalRequestResponse);
  }

  public void sendBatchDetailReqAndParseResp() {
    BatchDetailRequestPacket generatedData = generateTestBatchDetailRequest();
    BatchDetailGeneralResponse batchDetailGeneralResponse = (BatchDetailGeneralResponse) request(generatedData);
    System.out.println(batchDetailGeneralResponse);
  }

  public ResponsePacket request(RequestPacket requestPacket) {
    //Logger logger = (Logger) x.get("logger");

    String requestMsg = requestPacket.toSPSString();

    CloseableHttpClient httpClient = HttpClients.createDefault();
    HttpPost post = new HttpPost(URL);

    List<NameValuePair> urlParameters = new ArrayList<>();
    urlParameters.add(new BasicNameValuePair("packet", requestMsg));

    ResponsePacket responsePacket = null;

    try {
      post.setEntity(new UrlEncodedFormEntity(urlParameters));
      CloseableHttpResponse httpResponse = httpClient.execute(post);

      try {
        BufferedReader rd = new BufferedReader(new InputStreamReader(httpResponse.getEntity().getContent()));
        StringBuilder sb = new StringBuilder();
        String line;
        while ( (line = rd.readLine()) != null ) {
          sb.append(line);
        }

        String response = sb.toString();
        String responsePacketType = response.substring(4, 8);

        switch ( responsePacketType ) {
          case "2011":
            // GeneralRequestResponse
            GeneralRequestResponse generalRequestResponse = new GeneralRequestResponse();
            generalRequestResponse.parseSPSResponse(response);
            responsePacket = generalRequestResponse;
            break;
          case "2031":
            // BatchDetailGeneralResponse
            BatchDetailGeneralResponse batchDetailGeneralResponse = new BatchDetailGeneralResponse();
            batchDetailGeneralResponse.parseSPSResponse(response);
            responsePacket = batchDetailGeneralResponse;
            break;
          case "2033":
            // DetailResponse
            DetailResponse detailResponse = new DetailResponse();
            detailResponse.parseSPSResponse(response);
            responsePacket = detailResponse;
            break;
          case "2090":
            // RequestMessageAndErrors
            RequestMessageAndErrors requestMessageAndErrors = new RequestMessageAndErrors();
            requestMessageAndErrors.parseSPSResponse(response);
            responsePacket = requestMessageAndErrors;
            break;
          case "2091":
            // HostError
            HostError hostError = new HostError();
            hostError.parseSPSResponse(response);
            responsePacket = hostError;
            break;
        }
      } finally {
        httpResponse.close();
      }
    } catch (IOException e) {
      // logger.error(e);
      e.printStackTrace();
    } finally {
      try {
        httpClient.close();
      } catch (IOException e) {
        // logger.error(e);
        e.printStackTrace();
      }
    }

    return responsePacket;
  }

  private GeneralRequestPacket generateTestGeneralRequest() {
//    String testData = "20<FS>2010<FS>10<FS>20180711115959<FS><FS>ZYX80<FS>[NAME]John Jones[/NAME][ACCT]C[/ACCT]" +
//      "[OTHER]1234567890-0001[/OTHER][LOCATION]NANOPAY[/LOCATION][TYPE]P[/TYPE][SECC]WEB[/SECC][PTC]S[/PTC]<FS><FS>" +
//      "122000247<FS>9988998899<FS>9999<FS>550.00<FS><FS><FS><FS><FS><FS>EV<FS><FS><FS><FS>";

    GeneralRequestPacket generalRequestPacket = new GeneralRequestPacket();
    UserInfo userInfo = new UserInfo();

    generalRequestPacket.setMsgType(20);
    generalRequestPacket.setPacketType(2010);
    generalRequestPacket.setMessageModifierCode(10);
    generalRequestPacket.setLocalTransactionTime("20180715115959");
    //not used
    //generalRequestPacketTest.setTextMsg("");
    generalRequestPacket.setTID("ZYX80");

    // user info
    userInfo.setName("John Jones");
    userInfo.setAcct("C");
    userInfo.setOther("1234567890-0001");
    userInfo.setLocation("NANOPAY");
    userInfo.setType("P");
    userInfo.setSecc("WEB");
    userInfo.setPtc("S");
    generalRequestPacket.setUserInfo(userInfo);

    generalRequestPacket.setMICR("");
    generalRequestPacket.setRouteCode("122000247");
    generalRequestPacket.setAccount("9988998899");
    generalRequestPacket.setCheckNum("9999");
    generalRequestPacket.setAmount("550.00");
    generalRequestPacket.setInvoice("");
    generalRequestPacket.setClerkID("");
    // not used
    //generalRequestPacketTest.setMaxDetailItemsPerTransmission("");
    generalRequestPacket.setSocialSecurityNum("");
    generalRequestPacket.setItemID("");
    generalRequestPacket.setOptionsSelected("EV");
    generalRequestPacket.setDriversLicense("");
    generalRequestPacket.setDLStateCode("");
    generalRequestPacket.setDateOfBirth("");
    generalRequestPacket.setPhoneNumber("");

    return generalRequestPacket;
  }

  private BatchDetailRequestPacket generateTestBatchDetailRequest() {
    // String testData = "20<FS>2030<FS>60<FS>20180711115959<FS>ZYX80<FS><FS><FS><FS><FS><FS><FS><FS><FS>5<FS>0<FS><FS>";

    BatchDetailRequestPacket batchDetailRequestPacket = new BatchDetailRequestPacket();

    batchDetailRequestPacket.setMsgType(20);
    batchDetailRequestPacket.setPacketType(2030);
    batchDetailRequestPacket.setMessageModifierCode(60);
    batchDetailRequestPacket.setLocalTransactionTime("20180715115959");
    batchDetailRequestPacket.setTID("ZYX80");

    batchDetailRequestPacket.setOptionallyEnteredDate("");
    batchDetailRequestPacket.setCheckApprovalCount("");
    batchDetailRequestPacket.setCheckApprovalAmount("");
    batchDetailRequestPacket.setDeclineCount("");
    batchDetailRequestPacket.setDeclineAmount("");
    batchDetailRequestPacket.setVoidCount("");
    batchDetailRequestPacket.setVoidAmount("");
    batchDetailRequestPacket.setMaxDetailItemsPerTransmission("5");
    batchDetailRequestPacket.setSyncCounter("0");
    batchDetailRequestPacket.setCreditCount("");
    batchDetailRequestPacket.setCreditAmount("");

    return batchDetailRequestPacket;
  }
}
