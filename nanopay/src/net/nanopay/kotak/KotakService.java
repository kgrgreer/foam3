package net.nanopay.kotak;

import foam.core.*;
import net.nanopay.kotak.model.paymentResponse.AcknowledgementType;
import net.nanopay.kotak.model.reversal.Reversal;

import javax.xml.soap.*;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Iterator;
import java.util.List;

public class KotakService
  extends ContextAwareSupport
  implements Kotak
{
  public KotakService(X x) {
    setX(x);
  }

  @Override
  public AcknowledgementType initiatePayment(FObject request) {

    SOAPMessage message = createSOAPMessage(request);

    return null;
  }

  @Override
  public Reversal initiateReversal(Reversal request) {
    throw new UnsupportedOperationException("Unimplemented method: initiateReversal");
  }

  /**
   * Initialize the SOAP message with namespace declarations and headers
   *
   * @return newly initialized SOAPMessage
   */
  protected SOAPMessage createSOAPMessage(FObject object) {
    try {
      // build connection
      SOAPConnectionFactory soapConnFactory = SOAPConnectionFactory.newInstance();
      SOAPConnection connection = soapConnFactory.createConnection();

      // build message body
      SOAPMessage message = MessageFactory.newInstance(SOAPConstants.SOAP_1_2_PROTOCOL).createMessage();
      //message.getMimeHeaders().setHeader("SOAPAction","http://WebXml.com.cn/getRegionDataset");

      SOAPPart part = message.getSOAPPart();
      SOAPEnvelope envelope = part.getEnvelope();
      envelope.addNamespaceDeclaration("pay", "http://www.kotak.com/schemas/CMS_Generic/Payment_Request.xsd");
      envelope.addNamespaceDeclaration("soap", "http://www.w3.org/2003/05/soap-envelope");

      SOAPBody body = envelope.getBody();

      SOAPElement bodyElement = body.addChildElement("Payment", "pay");
      SOAPElement requestHeaderBody = bodyElement.addChildElement("RequestHeader", "pay");

      addBody(requestHeaderBody, object);

      message.saveChanges();

      System.out.println("Request");
      message.writeTo(System.out);
      System.out.println(" ");


//
//      URL url = new URL("http://ws.webxml.com.cn/WebServices/WeatherWS.asmx");
//
//      SOAPMessage reply = connection.call(message, url);
//
//      reply.writeTo(System.out);
//      System.out.println(" ");

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
  protected void addBody(SOAPElement element, FObject obj) {
    if ( obj == null ) return;

    try {
      // walk the properties
      List<PropertyInfo> props = obj.getClassInfo().getAxiomsByClass(PropertyInfo.class);
      Iterator i = props.iterator();

      while (i.hasNext()) {
        PropertyInfo prop = (PropertyInfo) i.next();
        // if ( prop.get(obj) == null || ! prop.isSet(obj) ) continue;
        SOAPElement child = element.addChildElement(prop.getName(), "pay");

        if ( prop instanceof AbstractFObjectPropertyInfo) {
          // add FObject properties
          addBody(child, (FObject) prop.get(obj));
        } else if ( prop instanceof AbstractFObjectArrayPropertyInfo ) {
          // add FObjectArray properties
          FObject[] objs = (FObject[]) prop.get(obj);
          for ( FObject o : objs ) {
            addBody(child.addChildElement(o.getClass().getSimpleName(), "pay"), o);
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
}
