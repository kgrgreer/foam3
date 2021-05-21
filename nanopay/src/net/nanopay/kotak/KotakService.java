package net.nanopay.kotak;

import com.google.api.client.auth.oauth2.ClientCredentialsTokenRequest;
import com.google.api.client.auth.oauth2.TokenResponse;
import com.google.api.client.http.GenericUrl;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import foam.core.*;
import foam.dao.DAO;
import foam.lib.json.OutputterMode;
import foam.nanos.alarming.Alarm;
import foam.nanos.alarming.AlarmReason;
import foam.nanos.logger.Logger;
import net.nanopay.kotak.model.paymentResponse.Acknowledgement;
import net.nanopay.kotak.model.paymentResponse.AcknowledgementType;
import net.nanopay.kotak.model.paymentResponse.FaultListType;
import net.nanopay.kotak.model.paymentResponse.InstrumentListType;
import net.nanopay.kotak.model.reversal.DetailsType;
import net.nanopay.kotak.model.reversal.HeaderType;
import net.nanopay.kotak.model.reversal.Rev_DetailType;
import net.nanopay.kotak.model.reversal.Reversal;
import org.apache.commons.io.IOUtils;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

import javax.xml.XMLConstants;
import javax.xml.bind.DatatypeConverter;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.soap.*;
import java.io.*;
import java.net.MalformedURLException;
import java.net.URL;
import java.security.GeneralSecurityException;
import java.text.SimpleDateFormat;
import java.util.*;

import static org.apache.xml.serialize.OutputFormat.Defaults.Encoding;

public class KotakService extends ContextAwareSupport implements Kotak {
  protected final String host;
  protected Logger logger = (Logger) getX().get("logger");

  public KotakService(X x) {
    setX(x);
    this.host = null;
  }

  public KotakService(X x, String host) {
    setX(x);
    this.host = host;
  }

  @Override
  public AcknowledgementType submitPayment(FObject request) {
    KotakCredentials credentials = (KotakCredentials) getX().get("kotakCredentials");
    String encryptionKey = credentials.getEncryptionKey();
    String paymentUrl = credentials.getPaymentUrl();

    CloseableHttpClient httpClient = HttpClients.createDefault();
    String token = getAccessToken();

    HttpPost post = new HttpPost(paymentUrl);
    post.addHeader("Authorization", "Bearer " + token);

    KotakXMLOutputter xmlOutputter = new KotakXMLOutputter(OutputterMode.NETWORK);
    xmlOutputter.output(request);

    String xmlData = xmlOutputter.toString();

    AcknowledgementType acknowledgementType = new AcknowledgementType();
    acknowledgementType.setAckHeader(new Acknowledgement());
    acknowledgementType.setInstrumentList(new InstrumentListType());
    acknowledgementType.setFaultList(new FaultListType());

    String response;
    try {
      String encryptedData = KotakEncryption.encrypt(xmlData, encryptionKey);
      post.setEntity(new StringEntity(encryptedData, Encoding));
      CloseableHttpResponse httpResponse = httpClient.execute(post);

      try(BufferedReader rd = new BufferedReader(new InputStreamReader(httpResponse.getEntity().getContent()))) {
        StringBuilder sb = new StringBuilder();
        String line;
        while ( (line = rd.readLine()) != null ) {
          sb.append(line);
        }
        response = sb.toString();

        DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
        dbf.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);

        DocumentBuilder db = dbf.newDocumentBuilder();
        Document document = db.parse(new ByteArrayInputStream(response.getBytes()));

        Element ackHeader = (Element) document.getElementsByTagName("AckHeader").item(0);

        Node messageId = ackHeader.getElementsByTagName("MessageId").item(0).getFirstChild();
        if ( messageId != null ) acknowledgementType.getAckHeader().setMessageId(messageId.getNodeValue());

        Node statusCd = ackHeader.getElementsByTagName("StatusCd").item(0).getFirstChild();
        if ( statusCd != null ) acknowledgementType.getAckHeader().setStatusCd(statusCd.getNodeValue());

        Node statusRem = ackHeader.getElementsByTagName("StatusRem").item(0).getFirstChild();
        if ( statusRem != null ) acknowledgementType.getAckHeader().setStatusRem(statusRem.getNodeValue());

      } catch (ParserConfigurationException | SAXException e) {
        logger.error(e);
      } finally {
        httpResponse.close();
      }
    } catch (IOException | GeneralSecurityException e) {
      logger.error(e);
    } finally {
      try {
        httpClient.close();
      } catch (IOException e) {
        logger.error(e);
      }
    }

    return acknowledgementType;
  }

  @Override
  public Reversal submitReversal(Reversal request) {
    KotakCredentials credentials = (KotakCredentials) getX().get("kotakCredentials");
    String encryptionKey = credentials.getEncryptionKey();
    String reversaltUrl = credentials.getReversaltUrl();

    CloseableHttpClient httpClient = HttpClients.createDefault();
    String token = getAccessToken();

    HttpPost post = new HttpPost(reversaltUrl);
    post.addHeader("Authorization", "Bearer " + token);

    KotakXMLOutputter xmlOutputter = new KotakXMLOutputter(OutputterMode.NETWORK);
    xmlOutputter.output(request);

    String xmlData = xmlOutputter.toString();

    Reversal reversal = new Reversal();
    reversal.setHeader(new HeaderType());

    String response;
    try {
      String encryptedData = KotakEncryption.encrypt(xmlData, encryptionKey);
      post.setEntity(new StringEntity(encryptedData, Encoding));
      CloseableHttpResponse httpResponse = httpClient.execute(post);

      try (BufferedReader rd = new BufferedReader(new InputStreamReader(httpResponse.getEntity().getContent()));) {
        StringBuilder sb = new StringBuilder();
        String line;
        while ( (line = rd.readLine()) != null ) {
          sb.append(line);
        }
        response = sb.toString();

        DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
        dbf.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);

        DocumentBuilder db = dbf.newDocumentBuilder();
        Document document = db.parse(new ByteArrayInputStream(response.getBytes()));

        // parse Header
        Element header = (Element) document.getElementsByTagName("Header").item(0);
        Node reqId = header.getElementsByTagName("Req_Id").item(0).getFirstChild();
        if ( reqId != null ) reversal.getHeader().setReq_Id(reqId.getNodeValue());

        Node msgSrc = header.getElementsByTagName("Msg_Src").item(0).getFirstChild();
        if ( msgSrc != null ) reversal.getHeader().setMsg_Src(msgSrc.getNodeValue());

        Node clientCode = header.getElementsByTagName("Client_Code").item(0).getFirstChild();
        if ( clientCode != null ) reversal.getHeader().setClient_Code(clientCode.getNodeValue());

        Node datePost = header.getElementsByTagName("Date_Post").item(0).getFirstChild();
        if ( datePost != null) reversal.getHeader().setDate_Post(datePost.getNodeValue());

        // parse Details
        Element details = (Element) document.getElementsByTagName("Details").item(0);
        NodeList revDetails = details.getElementsByTagName("Rev_Detail");

        DetailsType detailsType = new DetailsType();
        Rev_DetailType[] revDetailsArr = new Rev_DetailType[revDetails.getLength()];
        for (int i = 0; i < revDetails.getLength(); i++) {
          revDetailsArr[i] = new Rev_DetailType();
        }
        detailsType.setRev_Detail(revDetailsArr);
        reversal.setDetails(detailsType);

        for ( int i = 0; i < revDetails.getLength(); i++ ) {
          Element revDetail = (Element) revDetails.item(i);
          Node msgId = revDetail.getElementsByTagName("Msg_Id").item(0).getFirstChild();
          if ( msgId != null ) reversal.getDetails().getRev_Detail()[i].setMsg_Id(msgId.getNodeValue());

          Node statusCode = revDetail.getElementsByTagName("Status_Code").item(0).getFirstChild();
          if ( statusCode != null ) reversal.getDetails().getRev_Detail()[i].setStatus_Code(statusCode.getNodeValue());

          Node statusDesc = revDetail.getElementsByTagName("Status_Desc").item(0).getFirstChild();
          if ( statusDesc != null ) reversal.getDetails().getRev_Detail()[i].setStatus_Desc(statusDesc.getNodeValue());

          Node UTR = revDetail.getElementsByTagName("UTR").item(0).getFirstChild();
          if ( UTR != null ) reversal.getDetails().getRev_Detail()[i].setUTR(UTR.getNodeValue());
        }
      } catch (ParserConfigurationException | SAXException e) {
        logger.error(e);
      } finally {
        httpResponse.close();
      }
    } catch (IOException | GeneralSecurityException e) {
      logger.error(e);
    } finally {
      try {
        httpClient.close();
      } catch (IOException e) {
        logger.error(e);
      }
    }

    return reversal;
  }


  public String getAccessToken() {
    KotakCredentials credentials = (KotakCredentials) getX().get("kotakCredentials");
    String accessTokenUrl = credentials.getAccessTokenUrl();
    String clientId = credentials.getClientId();
    String clientSecret = credentials.getClientSecret();

    String token = null;
    try {
      TokenResponse response = new ClientCredentialsTokenRequest(new NetHttpTransport(), new JacksonFactory(),
        new GenericUrl(accessTokenUrl))
        .set("client_id", clientId)
        .set("client_secret", clientSecret)
        .execute();

      token = response.getAccessToken();
    } catch (IOException e) {
      ((DAO) getX().get("alarmDAO")).put(new Alarm.Builder(getX()).setName("Kotak getToken").setReason(AlarmReason.TIMEOUT).build());
      logger.error(e);
    }

    return token;
  }


  @Override
  public AcknowledgementType submitSOAPPayment(FObject request) {
    // initialize soap message
    SOAPMessage message = createPaymentSOAPMessage(request);

    // send soap message
    SOAPMessage response = sendMessage("Payment", message);

    // fake payment response for testing
    String testData = "<SOAP-ENV:Envelope xmlns:SOAP-ENV=\"http://www.w3.org/2003/05/soap-envelope\"><SOAP-ENV:Body>" +
      "<ns0:Payment xmlns:ns0=\"http://www.kotak.com/schemas/CMS_Generic/Payment_Response.xsd\">" +
      "<ns0:AckHeader><ns0:MessageId>171004081257000_3107</ns0:MessageId><ns0:StatusCd>000</ns0:StatusCd>" +
      "<ns0:StatusRem>All Instruments accepted Successfully.</ns0:StatusRem></ns0:AckHeader></ns0:Payment>" +
      "</SOAP-ENV:Body></SOAP-ENV:Envelope>";
    InputStream is = new ByteArrayInputStream(testData.getBytes());
    SOAPMessage testResponse = null;
    try {
      testResponse = MessageFactory.newInstance(SOAPConstants.SOAP_1_2_PROTOCOL).createMessage(null, is);
    } catch (IOException | SOAPException e) {
      logger.error(e);
    }
    // parse response
    return (AcknowledgementType) parseSOAPMessage(testResponse, AcknowledgementType.class);
  }


  @Override
  public Reversal submitSOAPReversal(Reversal request) {
    // initialize soap message
    SOAPMessage message = createReversalSOAPMessage(request);

    // send soap message
    SOAPMessage response = sendMessage("Reversal", message);

    // fake payment response for testing
    String testData = "<SOAP-ENV:Envelope xmlns:SOAP-ENV=\"http://www.w3.org/2003/05/soap-envelope\"><SOAP-ENV:Body>" +
      "<ns0:Reversal xmlns:ns0=\"http://www.kotak.com/schemas/CMS_Generic/Reversal_Response.xsd\"><ns0:Header>" +
      "<ns0:Req_Id>171004081257000</ns0:Req_Id><ns0:Msg_Src>MUTUALIND</ns0:Msg_Src><ns0:Client_Code>TEMPTEST1</ns0:Client_Code>" +
      "<ns0:Date_Post>2017-11-18</ns0:Date_Post></ns0:Header><ns0:Details><ns0:Rev_Detail><ns0:Msg_Id>171004081257000_3107</ns0:Msg_Id>" +
      "<ns0:Status_Code>Error-99</ns0:Status_Code><ns0:Status_Desc>Transaction is in Progress</ns0:Status_Desc>" +
      "<ns0:UTR ns1:nil=\"true\" xmlns:ns1=\"http://www.w3.org/2001/XMLSchema-instance\"/></ns0:Rev_Detail></ns0:Details>" +
      "</ns0:Reversal></SOAP-ENV:Body></SOAP-ENV:Envelope>";

    InputStream is = new ByteArrayInputStream(testData.getBytes());
    SOAPMessage testResponse = null;
    try {
      testResponse = MessageFactory.newInstance(SOAPConstants.SOAP_1_2_PROTOCOL).createMessage(null, is);
    } catch (IOException | SOAPException e) {
      logger.error(e);
    }

    // parse response
    return (Reversal) parseSOAPMessage(testResponse, Reversal.class);
  }


  /**
   * Initialize the Kotak payment SOAP message with namespace declarations and headers
   *
   * @return newly initialized SOAPMessage
   */
  protected SOAPMessage createPaymentSOAPMessage(FObject object) {
    try {
      // build message body
      SOAPMessage message = MessageFactory.newInstance(SOAPConstants.SOAP_1_2_PROTOCOL).createMessage();
      SOAPPart part = message.getSOAPPart();

      // get envelope, header, and body
      SOAPEnvelope envelope = part.getEnvelope();
      SOAPHeader header = envelope.getHeader();
      SOAPBody body = envelope.getBody();

      envelope.removeNamespaceDeclaration(envelope.getPrefix());
      envelope.addNamespaceDeclaration("pay", "http://www.kotak.com/schemas/CMS_Generic/Payment_Request.xsd");
      envelope.addNamespaceDeclaration("soap", "http://www.w3.org/2003/05/soap-envelope");
      envelope.setPrefix("soap");
      header.setPrefix("soap");
      body.setPrefix("soap");

      SOAPElement bodyElement = body.addChildElement("Payment", "pay");

      addBody(bodyElement, object, "pay");

      message.saveChanges();

      return message;
    } catch (SOAPException e) {
      logger.error(e);
    }
    return null;
  }

  /**
   * Initialize the Kotak reversal SOAP message with namespace declarations and headers
   *
   * @return newly initialized SOAPMessage
   */
  protected SOAPMessage createReversalSOAPMessage(FObject object) {
    try {
      // build message body
      SOAPMessage message = MessageFactory.newInstance(SOAPConstants.SOAP_1_2_PROTOCOL).createMessage();
      SOAPPart part = message.getSOAPPart();

      // get envelope, header, and body
      SOAPEnvelope envelope = part.getEnvelope();
      SOAPHeader header = envelope.getHeader();
      SOAPBody body = envelope.getBody();

      envelope.removeNamespaceDeclaration(envelope.getPrefix());
      envelope.addNamespaceDeclaration("soap", "http://www.w3.org/2003/05/soap-envelope");
      envelope.addNamespaceDeclaration("rev", "http://www.kotak.com/schemas/CMS_Generic/Reversal_Request.xsd");
      envelope.setPrefix("soap");
      header.setPrefix("soap");
      body.setPrefix("soap");

      SOAPElement bodyElement = body.addChildElement("Reversal", "rev");

      addBody(bodyElement, object, "rev");

      message.saveChanges();

      return message;
    } catch (SOAPException e) {
      logger.error(e);
    }
    return null;
  }

  /**
   * Adds an FObject to a SOAPElement
   *
   * @param element element to add the object to
   * @param obj objec to add
   * @param prefix prefix of child element
   */
  protected void addBody(SOAPElement element, FObject obj, String prefix) {
    if ( obj == null ) return;

    try {
      // walk the properties
      List<PropertyInfo> props = obj.getClassInfo().getAxiomsByClass(PropertyInfo.class);
      Iterator i = props.iterator();

      while ( i.hasNext() ) {
        PropertyInfo prop = (PropertyInfo) i.next();
        // if ( prop.get(obj) == null || ! prop.isSet(obj) ) continue;
        SOAPElement child = element.addChildElement(prop.getName(), prefix);

        if ( prop instanceof AbstractFObjectPropertyInfo ) {
          // add FObject properties
          addBody(child, (FObject) prop.get(obj), prefix);
        } else if ( prop instanceof AbstractFObjectArrayPropertyInfo ) {
          // add FObjectArray properties
          FObject[] objs = (FObject[]) prop.get(obj);
          for ( FObject o : objs ) {
            addBody(child.addChildElement(o.getClass().getSimpleName(), prefix), o, prefix);
          }
        } else if ( prop instanceof AbstractDatePropertyInfo ) {
          // add Date property
          Calendar calendar = Calendar.getInstance();
          calendar.setTime((Date) prop.get(obj));

          SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
          String dateStr = sdf.format(calendar.getTime());
          child.addTextNode(dateStr);
        }
        else if ( prop instanceof AbstractArrayPropertyInfo ) {
          // add ObjectArray properties
          Object[] objs = (Object[]) prop.get(obj);
          int jMax = objs.length - 1;
          StringBuilder sb = new StringBuilder();
          for ( int j = 0; j < objs.length; j++ ) {
            sb.append(objs[j].toString());
            if ( j != jMax ) {
              sb.append(", ");
            }
          }
          child.addTextNode(sb.toString());
        } else {
          // add simple types
          child.addTextNode(String.valueOf(prop.get(obj)));
        }
      }
    } catch (SOAPException e) {
      logger.error(e);
    }
  }


  /**
   * Sends a SOAP message to the given method
   *
   * @param method url endpoint
   * @param message SOAP message to send
   * @return SOAP message response
   */
  protected SOAPMessage sendMessage(String method, SOAPMessage message) {
    SOAPConnection conn = null;

    try {
      SOAPConnectionFactory soapConnFactory = SOAPConnectionFactory.newInstance();
      conn = soapConnFactory.createConnection();

      URL url = new URL(host + "/" + method);

      return conn.call(message, url);
    } catch (MalformedURLException | SOAPException e) {
      logger.error(e);
    } finally {
      if ( conn != null ) {
        try {
          conn.close();
        } catch (SOAPException e) {
          logger.error(e);
        }
      }
    }
    return null;
  }


  /**
   * Parses the SOAP Message
   *
   * @param message the SOAP Message to part
   * @param clazz the class
   * @return the parsed response
   */
  protected FObject parseSOAPMessage(SOAPMessage message, Class clazz) {
    try {
      SOAPBody body = message.getSOAPBody();

      Iterator iterator = body.getChildElements();
      SOAPBodyElement child = (SOAPBodyElement) iterator.next();

      FObject obj = (FObject) getX().create(clazz);
      parseSOAPBody(child, obj);
      return obj;
    } catch (SOAPException e) {
      logger.error(e);
    }
    return null;
  }


  /**
   * Parses the body of the SOAP message
   *
   * @param element the current SOAP element
   * @param obj the current FOBject
   */
  protected void parseSOAPBody(SOAPElement element, FObject obj) {
    if ( obj == null ) return;

    try {
      List<PropertyInfo> props = obj.getClassInfo().getAxiomsByClass(PropertyInfo.class);
      Iterator i = props.iterator();

      // walk object properties
      while ( i.hasNext() ) {
        PropertyInfo prop = (PropertyInfo) i.next();
        // get all child elements
        Iterator children = element.getChildElements();

        // walk the children to find correct element
        while ( children.hasNext() ) {
          javax.xml.soap.Node node = (javax.xml.soap.Node) children.next();
          if ( node.getNodeType() == Node.TEXT_NODE && element.getLocalName().equals(prop.getName()) ) {
            prop.setFromString(obj, node.getValue());
          } else if ( node.getNodeType() == Node.ELEMENT_NODE ) {
            SOAPElement child = (SOAPElement) node;
            // check that local name equals the property name
            if ( child.getLocalName().equals(prop.getName()) ) {
              if ( prop instanceof AbstractFObjectPropertyInfo ) {
                // parse FObjectProperty
                FObject value = (FObject) getX().create(prop.getValueClass());
                parseSOAPBody(child, value);
                prop.set(obj, value);
              } else if ( prop instanceof AbstractFObjectArrayPropertyInfo ) {
                // parse FObjectArrayProperty
                List list = new ArrayList();
                Class of = Class.forName(((AbstractFObjectArrayPropertyInfo) prop).of());
                FObject value = (FObject) getX().create(of);
                Iterator array = child.getChildElements();
                while ( array.hasNext() ) {
                  SOAPElement arrayChild = (SOAPElement) array.next();
                  parseSOAPBody(arrayChild, value);
                }
                list.add(value);
                prop.set(obj, list.toArray());
              } else if ( prop instanceof AbstractDatePropertyInfo ) {
                // Parse XSD datetime
                prop.set(obj, DatatypeConverter.parseDateTime(child.getValue()).getTime());
              } else {
                // Parse simple type
                prop.setFromString(obj, child.getValue());
              }
            }
          }
        }
      }
    } catch (ClassNotFoundException e) {
      logger.error(e);
    }
  }
}
