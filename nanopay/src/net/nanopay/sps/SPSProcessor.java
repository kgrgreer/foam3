package net.nanopay.sps;

import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.nanos.logger.Logger;
import net.nanopay.sps.exceptions.ClientErrorException;
import net.nanopay.sps.exceptions.HostErrorException;
import net.nanopay.sps.model.*;
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

  public static final String URL = "https://spaysys.com/cgi-bin/cgiwrap-noauth/dl4ub/tinqpstpbf.cgi";

  public GeneralRequestResponse GeneralReqService(GeneralRequestPacket generalRequestPacket)
    throws ClientErrorException, HostErrorException {
    return (GeneralRequestResponse) parse(request(generalRequestPacket));
  }

  public BatchDetailGeneralResponse BatchDetailReqService(BatchDetailRequestPacket batchDetailRequestPacket)
    throws ClientErrorException, HostErrorException {
    return (BatchDetailGeneralResponse) parse(request(batchDetailRequestPacket));
  }

  private String request(RequestPacket requestPacket) {
    X x = getX();
    Logger logger = (Logger) x.get("logger");

    String requestMsg = requestPacket.toSPSString();

    CloseableHttpClient httpClient = HttpClients.createDefault();
    HttpPost post = new HttpPost(URL);

    List<NameValuePair> urlParameters = new ArrayList<>();
    urlParameters.add(new BasicNameValuePair("packet", requestMsg));
    String response = null;

    try {
      post.setEntity(new UrlEncodedFormEntity(urlParameters));
      CloseableHttpResponse httpResponse = httpClient.execute(post);

      try {
        if (httpResponse.getStatusLine().getStatusCode() == 200) {
          BufferedReader rd = new BufferedReader(new InputStreamReader(httpResponse.getEntity().getContent()));
          StringBuilder sb = new StringBuilder();
          String line;
          while ( (line = rd.readLine()) != null ) {
            sb.append(line);
          }
          response = sb.toString();
        } else {
          logger.warning("http status code was not 200");
        }
      } finally {
        httpResponse.close();
      }
    } catch (IOException e) {
      logger.error(e);
    } finally {
      try {
        httpClient.close();
      } catch (IOException e) {
        logger.error(e);
      }
    }

    return response;
  }

  private ResponsePacket parse(String response) throws ClientErrorException, HostErrorException {
    String responsePacketType = response.substring(4, 8);
    ResponsePacket responsePacket = null;

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
        throw new ClientErrorException(requestMessageAndErrors);
      case "2091":
        // HostError
        HostError hostError = new HostError();
        hostError.parseSPSResponse(response);
        throw new HostErrorException(hostError);
    }

    return responsePacket;
  }

  public void test() {
    try {
      ResponsePacket responsePacket1 = GeneralReqService(generateTestGeneralRequest());
      System.out.println("generalRequestResponse: " + responsePacket1);

      ResponsePacket responsePacket2 = BatchDetailReqService(generateTestBatchDetailRequest());
      System.out.println("batchDetailGeneralResponse: " + responsePacket2);
    } catch (ClientErrorException e) {
      System.out.println(e.getError());
    } catch (HostErrorException e) {
      System.out.println(e.getError());
    }
  }

  private GeneralRequestPacket generateTestGeneralRequest() {
    GeneralRequestPacket generalRequestPacket = new GeneralRequestPacket();
    UserInfo userInfo = new UserInfo();

    generalRequestPacket.setMsgType(20);
    generalRequestPacket.setPacketType(2010);
    generalRequestPacket.setMessageModifierCode(10);
    generalRequestPacket.setLocalTransactionTime("20180716115959");
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
    BatchDetailRequestPacket batchDetailRequestPacket = new BatchDetailRequestPacket();

    batchDetailRequestPacket.setMsgType(20);
    batchDetailRequestPacket.setPacketType(2030);
    batchDetailRequestPacket.setMessageModifierCode(60);
    batchDetailRequestPacket.setLocalTransactionTime("20180714115959");
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
