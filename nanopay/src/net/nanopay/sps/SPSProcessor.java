package net.nanopay.sps;

import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.nanos.logger.Logger;
import net.nanopay.sps.exceptions.ClientErrorException;
import net.nanopay.sps.exceptions.HostErrorException;
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

  public GeneralRequestResponse GeneralReqService(GeneralRequestPacket generalRequestPacket)
    throws ClientErrorException, HostErrorException {
    return (GeneralRequestResponse) parse(request(generalRequestPacket));
  }

  public BatchDetailGeneralResponse BatchDetailReqService(BatchDetailRequestPacket batchDetailRequestPacket)
    throws ClientErrorException, HostErrorException {
    return (BatchDetailGeneralResponse) parse(request(batchDetailRequestPacket));
  }

  public DetailResponse DetailInfoService(BatchDetailRequestPacket batchDetailRequestPacket)
    throws ClientErrorException, HostErrorException {
    return (DetailResponse) parse(request(batchDetailRequestPacket));
  }

  private String request(RequestPacket requestPacket) {
    X x = getX();
    Logger logger = (Logger) x.get("logger");
    SPSConfig spsConfig = (SPSConfig) x.get("spsConfig");

    String url = spsConfig.getUrl();
    String requestMsg = requestPacket.toSPSString();

    CloseableHttpClient httpClient = HttpClients.createDefault();
    HttpPost post = new HttpPost(url);

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
}
