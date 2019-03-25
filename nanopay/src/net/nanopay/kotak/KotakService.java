package net.nanopay.kotak;

import com.google.api.client.auth.oauth2.ClientCredentialsTokenRequest;
import com.google.api.client.auth.oauth2.TokenResponse;
import com.google.api.client.auth.oauth2.TokenResponseException;
import com.google.api.client.http.GenericUrl;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import foam.core.*;
import foam.lib.json.OutputterMode;
import foam.nanos.logger.Logger;
import net.nanopay.kotak.model.paymentResponse.AcknowledgementType;
import net.nanopay.kotak.model.reversal.Reversal;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.xml.sax.SAXException;

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

  public final String clientId = "l7xx9aff4c89f1fb4b26b8bf1d9961479558";
  public final String clientSecret = "25dd555a98e24a0ba0a5a94aa37d1555";
  public final String accessTokenUrl="https://apigwuat.kotak.com:8443/auth/oauth/v2/token";
  public final String key = "f21b637173f39e3059464da061a57f46";
  public final String paymentUrl = "https://apigwuat.kotak.com:8443/LastMileEnc/pay";
  public final String reversaltUrl = "https://apigwuat.kotak.com:8443/LastMileEnc/rev";

  public KotakService(X x) {
    setX(x);
    this.host = null;
  }

  public KotakService(X x, String host) {
    setX(x);
    this.host = host;
  }


  public String getAccessToken() {
    String token = null;
    try {
      TokenResponse response = new ClientCredentialsTokenRequest(new NetHttpTransport(), new JacksonFactory(),
        new GenericUrl(accessTokenUrl))
        .set("client_id", clientId)
        .set("client_secret", clientSecret)
        .execute();

      token = response.getAccessToken();

      System.out.println("Access token: " + token);
    } catch (TokenResponseException e) {
      if (e.getDetails() != null) {
        System.err.println("Error: " + e.getDetails().getError());
        if (e.getDetails().getErrorDescription() != null) {
          System.err.println(e.getDetails().getErrorDescription());
        }
        if (e.getDetails().getErrorUri() != null) {
          System.err.println(e.getDetails().getErrorUri());
        }
      } else {
        System.err.println(e.getMessage());
      }
    } catch (IOException e) {
      e.printStackTrace();
    }

    return token;
  }

  @Override
  public AcknowledgementType submitPayment(FObject request) {
    CloseableHttpClient httpClient = HttpClients.createDefault();
    String token = getAccessToken();

    HttpPost post = new HttpPost(paymentUrl);
    post.addHeader("Authorization", "Bearer " + token);

    KotakXMLOutputter xmlOutputter = new KotakXMLOutputter(OutputterMode.NETWORK);
    xmlOutputter.output(request);

    String xmlData = xmlOutputter.toString();
    System.out.println("payment xml: ");
    System.out.println(xmlData);

    String response;
    try {
      String encryptedData = KotakEncryption.encrypt(xmlData, key);
      System.out.println("encryptedData: " + encryptedData);

      post.setEntity(new StringEntity(encryptedData, Encoding));

      CloseableHttpResponse httpResponse = httpClient.execute(post);

      try {
        BufferedReader rd = new BufferedReader(new InputStreamReader(httpResponse.getEntity().getContent()));
        StringBuilder sb = new StringBuilder();
        String line;
        while ( (line = rd.readLine()) != null ) {
          sb.append(line);
        }
        response = sb.toString();

        // System.out.println("payment response: " + response);

        String testResponse = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
        "<Payment xmlns=\"http://www.kotak.com/schemas/CMS_Generic/Payment_Response.xsd\">\n" +
        "    <AckHeader>\n" +
        "        <MessageId>apiErrorCodes2</MessageId>\n" +
        "        <StatusCd>VAL_ERR</StatusCd>\n" +
        "        <StatusRem>VAL_ERR_46-Duplicate MessageId.</StatusRem>\n" +
        "    </AckHeader>\n" +
        "</Payment>";

        DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
        DocumentBuilder db = dbf.newDocumentBuilder();
        Document document = db.parse(new ByteArrayInputStream(response.getBytes()));

        Element ackHeader = (Element) document.getElementsByTagName("AckHeader").item(0);

        String messageId = ackHeader.getElementsByTagName("MessageId").item(0).getFirstChild().getNodeValue();
        System.out.println("messageId: " + messageId);

        String statusCd = ackHeader.getElementsByTagName("StatusCd").item(0).getFirstChild().getNodeValue();
        System.out.println("statusCd: " + statusCd);

        String statusRem = ackHeader.getElementsByTagName("StatusRem").item(0).getFirstChild().getNodeValue();
        System.out.println("statusRem: " + statusRem);
      } catch (ParserConfigurationException | SAXException e) {
        e.printStackTrace();
      } finally {
        httpResponse.close();
      }
    } catch (IOException | GeneralSecurityException e) {
      e.printStackTrace();
    } finally {
      try {
        httpClient.close();
      } catch (IOException e) {
        e.printStackTrace();
      }
    }

    return null;
  }

  @Override
  public Reversal submitReversal(Reversal request) {
    CloseableHttpClient httpClient = HttpClients.createDefault();
    String token = getAccessToken();

    HttpPost post = new HttpPost(reversaltUrl);
    post.addHeader("Authorization", "Bearer " + token);

    KotakXMLOutputter xmlOutputter = new KotakXMLOutputter(OutputterMode.NETWORK);
    xmlOutputter.output(request);

    String xmlData = xmlOutputter.toString();
    System.out.println("reversal xml: ");
    System.out.println(xmlData);

    String response;
    try {
      String encryptedData = KotakEncryption.encrypt(xmlData, key);
      System.out.println("encryptedData: " + encryptedData);

      post.setEntity(new StringEntity(encryptedData, Encoding));

      CloseableHttpResponse httpResponse = httpClient.execute(post);

      try {
        BufferedReader rd = new BufferedReader(new InputStreamReader(httpResponse.getEntity().getContent()));
        StringBuilder sb = new StringBuilder();
        String line;
        while ( (line = rd.readLine()) != null ) {
          sb.append(line);
        }
        response = sb.toString();

        System.out.println("reversal response: " + response);
      } finally {
        httpResponse.close();
      }
    } catch (IOException | GeneralSecurityException e) {
      e.printStackTrace();
    } finally {
      try {
        httpClient.close();
      } catch (IOException e) {
        e.printStackTrace();
      }
    }

    return null;
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
          Node node = (Node) children.next();
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
