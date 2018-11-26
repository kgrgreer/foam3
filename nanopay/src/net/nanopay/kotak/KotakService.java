package net.nanopay.kotak;

import foam.core.*;
import foam.nanos.logger.Logger;
import net.nanopay.kotak.model.paymentResponse.AcknowledgementType;
import net.nanopay.kotak.model.reversal.Reversal;

import javax.xml.bind.DatatypeConverter;
import javax.xml.namespace.QName;
import javax.xml.soap.*;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.*;

public class KotakService
  extends ContextAwareSupport
  implements Kotak
{
  protected final String host;
  protected Logger logger = (Logger) getX().get("logger");

  public KotakService(X x, String host) {
    setX(x);
    this.host = host;
  }

  @Override
  public AcknowledgementType initiatePayment(FObject request) {

    // initialize soap message
    SOAPMessage message = createPaymentSOAPMessage(request);
    // send soap message
    SOAPMessage response = sendMessage("Payment", message);

    System.out.println("======================================");

    // fake response
//    String testData =
//        "<SOAP-ENV:Envelope xmlns:SOAP-ENV=\"http://www.w3.org/2003/05/soap-envelope\">\n" +
//        "   <SOAP-ENV:Body>\n" +
//        "      <ns0:Payment xmlns:ns0=\"http://www.kotak.com/schemas/CMS_Generic/Payment_Response.xsd\">\n" +
//        "         <ns0:AckHeader>\n" +
//        "            <ns0:MessageId>171004081257000_3107</ns0:MessageId>\n" +
//        "            <ns0:StatusCd>000</ns0:StatusCd>\n" +
//        "            <ns0:StatusRem>All Instruments accepted Successfully.</ns0:StatusRem>\n" +
//        "         </ns0:AckHeader>\n" +
//        "      </ns0:Payment>\n" +
//        "   </SOAP-ENV:Body>\n" +
//        "</SOAP-ENV:Envelope>";

    String testData = "<SOAP-ENV:Envelope xmlns:SOAP-ENV=\"http://www.w3.org/2003/05/soap-envelope\"><SOAP-ENV:Body><ns0:Payment xmlns:ns0=\"http://www.kotak.com/schemas/CMS_Generic/Payment_Response.xsd\"><ns0:AckHeader><ns0:MessageId>171004081257000_3107</ns0:MessageId><ns0:StatusCd>000</ns0:StatusCd><ns0:StatusRem>All Instruments accepted Successfully.</ns0:StatusRem></ns0:AckHeader></ns0:Payment></SOAP-ENV:Body></SOAP-ENV:Envelope>";
    InputStream is = new ByteArrayInputStream(testData.getBytes());
    SOAPMessage fakeResponse = null;
    try {
      fakeResponse = MessageFactory.newInstance(SOAPConstants.SOAP_1_2_PROTOCOL).createMessage(null, is);
      System.out.println("fake response: " + fakeResponse);

      System.out.println("fake response");
      fakeResponse.writeTo(System.out);
      System.out.println(" ");

    } catch (IOException | SOAPException e) {
      e.printStackTrace();
    }
    // parse response
    return (AcknowledgementType) parseMessage(fakeResponse, AcknowledgementType.class);
    //return null;
  }


  @Override
  public Reversal initiateReversal(Reversal request) {
    // initialize soap message
    SOAPMessage message = createReversalSOAPMessage(request);

    // send soap message
    //SOAPMessage response = sendMessage("Payment", message);

    return null;
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
      SOAPEnvelope envelope = part.getEnvelope();
      envelope.addNamespaceDeclaration("pay", "http://www.kotak.com/schemas/CMS_Generic/Payment_Request.xsd");
      envelope.addNamespaceDeclaration("soap", "http://www.w3.org/2003/05/soap-envelope");

      SOAPBody body = envelope.getBody();

      SOAPElement bodyElement = body.addChildElement("Payment", "pay");
      SOAPElement requestHeaderBody = bodyElement.addChildElement("RequestHeader", "pay");

      addBody(requestHeaderBody, object, "pay");

      message.saveChanges();

      System.out.println("Request");
      message.writeTo(System.out);
      System.out.println(" ");

      return message;
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
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
      SOAPEnvelope envelope = part.getEnvelope();

      envelope.addNamespaceDeclaration("soap", "http://www.w3.org/2003/05/soap-envelope");
      envelope.addNamespaceDeclaration("rev", "http://www.kotak.com/schemas/CMS_Generic/Reversal_Request.xsd");

      SOAPBody body = envelope.getBody();

      SOAPElement bodyElement = body.addChildElement("Reversal", "rev");

      addBody(bodyElement, object, "rev");

      message.saveChanges();

      System.out.println("reversal");
      message.writeTo(System.out);
      System.out.println(" ");

      return message;
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }

  /**
   * Adds an FObject to a SOAPElement
   *
   * @param element element to add the object to
   * @param obj objec to add
   */
  protected void addBody(SOAPElement element, FObject obj, String prefix) {
    if ( obj == null ) return;

    try {
      // walk the properties
      List<PropertyInfo> props = obj.getClassInfo().getAxiomsByClass(PropertyInfo.class);
      Iterator i = props.iterator();

      while (i.hasNext()) {
        PropertyInfo prop = (PropertyInfo) i.next();
        // if ( prop.get(obj) == null || ! prop.isSet(obj) ) continue;
        SOAPElement child = element.addChildElement(prop.getName(), prefix);

        if ( prop instanceof AbstractFObjectPropertyInfo) {
          // add FObject properties
          addBody(child, (FObject) prop.get(obj), prefix);
        } else if ( prop instanceof AbstractFObjectArrayPropertyInfo ) {
          // add FObjectArray properties
          FObject[] objs = (FObject[]) prop.get(obj);
          for ( FObject o : objs ) {
            addBody(child.addChildElement(o.getClass().getSimpleName(), prefix), o, prefix);
          }
        } else if ( prop instanceof AbstractDatePropertyInfo) {
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
    } catch (Throwable t) {
      throw new RuntimeException(t);
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
    } catch (Throwable t) {
      throw new RuntimeException(t);
    } finally {
      if ( conn != null ) {
        try {
          conn.close();
        } catch (SOAPException e) {
          logger.error(e);
        }
      }
    }
  }


  /**
   * Parses the SOAP Message
   *
   * @param message the SOAP Message to part
   * @param clazz the class
   * @return the parsed response
   */
  protected FObject parseMessage(SOAPMessage message, Class clazz) {
    try {
      // parse the outer and inner message to get the body
      SOAPBody body = message.getSOAPBody();

      Iterator iterator = body.getChildElements();
      SOAPBodyElement outer = (SOAPBodyElement) iterator.next();
      //iterator = outer.getChildElements();
      //SOAPBodyElement inner = (SOAPBodyElement) iterator.next();

      FObject obj = (FObject) getX().create(clazz);
      parseBody(outer, obj);
      return obj;
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }


  /**
   * Parses the body of the SOAP message
   *
   * @param element the current SOAP element
   * @param obj the current FOBject
   */
  protected void parseBody(SOAPElement element, FObject obj) {
    if ( obj == null ) return;

    try {
      List<PropertyInfo> props = obj.getClassInfo().getAxiomsByClass(PropertyInfo.class);
      Iterator i = props.iterator();

      // walk object properties
      while ( i.hasNext() ) {
        PropertyInfo prop = (PropertyInfo) i.next();
        // get all child elements
        // Iterator children = element.getChildElements(new QName("http://www.kotak.com/schemas/CMS_Generic/Payment_Response.xsd", prop.getName(), "ns0"));

        Iterator children = element.getChildElements();


        System.out.println("children: " + children.toString());
        // walk the children to find correct element
        while ( children.hasNext() ) {
          SOAPElement child = (SOAPElement) children.next();
          // check that local name equals the property name

          System.out.println("propname: " + prop.getName());
          System.out.println("childlocalname: " + child.getLocalName());

          if ( child.getLocalName().equals(prop.getName()) ) {
            if ( prop instanceof AbstractFObjectPropertyInfo ) {
              // parse FObjectProperty
              FObject value = (FObject) getX().create(prop.getValueClass());
              parseBody(child, value);
              prop.set(obj, value);
            } else if ( prop instanceof AbstractFObjectArrayPropertyInfo ) {
              // parse FObjectArrayProperty
              List list = new ArrayList();
              Class of = Class.forName(((AbstractFObjectArrayPropertyInfo) prop).of());
              Iterator array = child.getChildElements(new QName("", of.getSimpleName(), "ns0"));
              while ( array.hasNext() ) {
                SOAPElement arrayChild = (SOAPElement) array.next();
                FObject value = (FObject) getX().create(of);
                parseBody(arrayChild, value);
                list.add(value);
              }
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
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }
}
