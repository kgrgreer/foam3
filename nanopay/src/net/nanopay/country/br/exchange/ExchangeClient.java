/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */
package net.nanopay.country.br.exchange;

import foam.core.*;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.util.SafetyUtil;

import javax.xml.bind.DatatypeConverter;
import javax.xml.namespace.QName;
import javax.xml.soap.*;
import java.util.*;
import java.io.*;
import foam.nanos.logger.Logger;

import static foam.mlang.MLang.EQ;

public class ExchangeClient
  extends ContextAwareSupport
  implements Exchange
{
  protected Logger logger;

  public ExchangeClient(X x) {
    setX(x);
    logger = (Logger) x.get("logger");
  }

  protected ExchangeCredential getCredentials(X x) {
    ExchangeCredential credentials = null;
    DAO exchangeCredentialDAO = (DAO) x.get("exchangeCredentialDAO");
    List<ExchangeCredential> arr = ((ArraySink) exchangeCredentialDAO.inX(x).select(new ArraySink())).getArray();
    if ( arr.size() > 0 ) credentials = arr.get(0);

    if ( credentials == null ||
         SafetyUtil.isEmpty(credentials.getExchangeUsername()) ||
         SafetyUtil.isEmpty(credentials.getExchangePassword()) ||
         SafetyUtil.isEmpty(credentials.getExchangeUrl()) ) {
      logger.error(this.getClass().getSimpleName(), "Invalid credentials");
      throw new RuntimeException("Invalid credentials" );
    }
    return credentials;
  }

  @Override
  public InsertBoletoResponse insertBoleto(X x, InsertBoleto request) {
    try {
      SOAPMessage message = createSOAPMessage(x,"insertBoleto", request);
      long startTime = logRequest(message);
      SOAPMessage response = sendMessage(x, "insertBoleto", message);
      logResponse(response, startTime);
      return (InsertBoletoResponse) parseMessage(response, InsertBoletoResponse.class);
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }

  @Override
  public SearchBoletoResponse searchBoleto(X x, SearchBoleto request) {
    try {
      SOAPMessage message = createSOAPMessage(x, "searchBoleto", request);
      long startTime = logRequest(message);
      SOAPMessage response = sendMessage(x, "searchBoleto", message);
      logResponse(response, startTime);
      return (SearchBoletoResponse) parseMessage(response, SearchBoletoResponse.class);
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }

  @Override
  public BoletoStatusResponse getBoletoStatus(X x, GetBoletoStatus request) {
    try {
      SOAPMessage message = createSOAPMessage(x, "BoletoStatus", request);
      long startTime = logRequest(message);
      SOAPMessage response = sendMessage(x, "BoletoStatus", message);
      logResponse(response, startTime);
      return (BoletoStatusResponse) parseMessage(response, BoletoStatusResponse.class);
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }

  @Override
  public SearchTitularResponse searchTitular(X x, SearchTitular request) {
    try {
      SOAPMessage message = createSOAPMessage(x, "searchTitular", request);
      long startTime = logRequest(message);
      SOAPMessage response = sendMessage(x, "searchTitular", message);
      logResponse(response, startTime);
      return (SearchTitularResponse) parseMessage(response, SearchTitularResponse.class);
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }

  @Override
  public SearchTitularCapFinResponse searchTitularCapFin(X x, SearchTitularCapFin request) {
    try {
      SOAPMessage message = createSOAPMessage(x, "searchTitularCapFin", request);
      long startTime = logRequest(message);
      SOAPMessage response = sendMessage(x,"searchTitularCapFin", message);
      logResponse(response, startTime);
      return (SearchTitularCapFinResponse) parseMessage(response, SearchTitularCapFinResponse.class);
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }

  @Override
  public InsertTitularResponse insertTitular(X x, InsertTitular request) {
    try {
      SOAPMessage message = createSOAPMessage(x,"insertTitular", request);
      long startTime = logRequest(message);
      SOAPMessage response = sendMessage(x,"insertTitular", message);
      logResponse(response, startTime);
      return (InsertTitularResponse) parseMessage(response, InsertTitularResponse.class);
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }

  @Override
  public UpdateTitularResponse updateTitular(X x, UpdateTitular request) {
    try {
      SOAPMessage message = createSOAPMessage(x, "updateTitular", request);
      long startTime = logRequest(message);
      SOAPMessage response = sendMessage(x, "updateTitular", message);
      logResponse(response, startTime);
      return (UpdateTitularResponse) parseMessage(response, UpdateTitularResponse.class);
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }

  @Override
  public SearchNaturezaResponse searchNatureza(X x, SearchNatureza request) {
    try {
      SOAPMessage message = createSOAPMessage(x,"searchNatureza", request);
      long startTime = logRequest(message);
      SOAPMessage response = sendMessage(x,"searchNatureza", message);
      logResponse(response, startTime);
      return (SearchNaturezaResponse) parseMessage(response, SearchNaturezaResponse.class);
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }

  @Override
  public SearchMoedaResponse searchMoeda(X x, SearchMoeda request) {
    try {
      SOAPMessage message = createSOAPMessage(x,"searchMoeda", request);
      long startTime = logRequest(message);
      SOAPMessage response = sendMessage(x,"searchMoeda", message);
      logResponse(response, startTime);
      return (SearchMoedaResponse) parseMessage(response, SearchMoedaResponse.class);
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }

  @Override
  public SearchPaisResponse searchPais(X x, SearchPais request) {
    try {
      SOAPMessage message = createSOAPMessage(x,"searchPais", request);
      long startTime = logRequest(message);
      SOAPMessage response = sendMessage(x,"searchPais", message);
      logResponse(response, startTime);
      return (SearchPaisResponse) parseMessage(response, SearchPaisResponse.class);
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }

  @Override
  public CotacaoTaxaCambioResponse cotacaoTaxaCambio(X x, GetCotacaoTaxaCambio request) {
    try {
      SOAPMessage message = createSOAPMessage(x,"cotacaoTaxaCambio", request);
      long startTime = logRequest(message);
      SOAPMessage response = sendMessage(x,"cotacaoTaxaCambio", message);
      logResponse(response, startTime);
      return (CotacaoTaxaCambioResponse) parseMessage(response, CotacaoTaxaCambioResponse.class);
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }

  protected long logRequest(SOAPMessage message) {
    StringBuilder sbuf = new StringBuilder();
    sbuf.append("\n------------------------------------\n");
    sbuf.append("Soap Request--------------------------\n");
    try {
      ByteArrayOutputStream requestBaos = new ByteArrayOutputStream();
      message.writeTo(requestBaos);
      sbuf.append(requestBaos.toString());
    } catch (Throwable t) {
      logger.error(t.getMessage(), t);
    }
    sbuf.append("\n");
    logger.debug(sbuf.toString());
    return System.currentTimeMillis();
  }

  protected void logResponse(SOAPMessage response, long startTime) {
    StringBuilder sbuf = new StringBuilder();
    sbuf.append("Soap Response--------------------------\n");
    long estimatedTime = System.currentTimeMillis() - startTime;
    sbuf.append("Time Spent is: " + estimatedTime + "-----------------------\n");
    try {
      ByteArrayOutputStream responseBaos = new ByteArrayOutputStream();
      response.writeTo(responseBaos);
      sbuf.append(responseBaos.toString());
    } catch (Throwable t) {
      logger.error(t.getMessage(), t);
    }
    sbuf.append("\n");
    logger.debug(sbuf.toString());
  }

  /**
   * Initialize the SOAP message with namespace declarations and headers
   *
   * @param method method to use
   * @return newly initialized SOAPMessage
   */
  protected SOAPMessage createSOAPMessage(X x, String method, FObject object) {
    try {
      ExchangeCredential credentials = getCredentials(x);
      SOAPMessage message = MessageFactory.newInstance(SOAPConstants.SOAP_1_1_PROTOCOL).createMessage();
      SOAPPart part = message.getSOAPPart();

      // get envelope, header, and body
      String serverURI = "http://tempuri.org/";
      SOAPEnvelope envelope = part.getEnvelope();
      envelope.addNamespaceDeclaration("tem", serverURI);
      MimeHeaders headers = message.getMimeHeaders();
      headers.addHeader("SOAPAction", "http://tempuri.org/IExchange/" + method);

      SOAPHeader header = envelope.getHeader();
      SOAPBody body = envelope.getBody();
      SOAPElement outer = body.addChildElement(method, null, "http://tempuri.org/");
      addBody(outer, object, envelope);
      message.saveChanges();
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
  protected void addBody(SOAPElement element, FObject obj, SOAPEnvelope envelope) {
    if ( obj == null ) return;

    try {
      // walk the properties
      List<PropertyInfo> props = obj.getClassInfo().getAxiomsByClass(PropertyInfo.class);
      Iterator i = props.iterator();

      while (i.hasNext()) {
        PropertyInfo prop = (PropertyInfo) i.next();
        if ( prop.get(obj) == null || ! prop.isSet(obj) ) continue;
        SOAPElement child = element.addChildElement(prop.getName());
        Name outerName = envelope.createName("xmlns");
        child.addAttribute(outerName, "http://schemas.datacontract.org/2004/07/Exchange");

        if ( prop instanceof AbstractFObjectPropertyInfo ) {
          // add FObject properties
          addBody(child, (FObject) prop.get(obj), envelope);
        } else if ( prop instanceof AbstractFObjectArrayPropertyInfo ) {
          // add FObjectArray properties
          FObject[] objs = (FObject[]) prop.get(obj);
          for ( FObject o : objs ) {
            addBody(child.addChildElement(o.getClass().getSimpleName()), o, envelope);
          }
        } else if ( prop instanceof AbstractDatePropertyInfo) {
          // add Date property
          Calendar calendar = Calendar.getInstance();
          calendar.setTime((Date) prop.get(obj));
          child.addTextNode(DatatypeConverter.printDateTime(calendar));
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
  protected SOAPMessage sendMessage(X x, String method, SOAPMessage message) {
    SOAPConnection conn = null;
    ExchangeCredential credentials = getCredentials(x);

    try {
      conn = SOAPConnectionFactory.newInstance().createConnection();
      return conn.call(message, credentials.getExchangeUrl());
    } catch (Throwable t) {
      throw new RuntimeException(t);
    } finally {
      if ( conn != null ) {
        try { conn.close(); } catch (Throwable t) {}
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
        Iterator children = element.getChildElements();

        // walk the children to find correct element
        while ( children.hasNext() ) {
          SOAPElement child = (SOAPElement) children.next();
          // check that local name equals the property name
          if ( child.getLocalName().equalsIgnoreCase(prop.getName()) || child.getLocalName().equalsIgnoreCase(prop.getShortName()) ) {
            if ( prop instanceof AbstractFObjectPropertyInfo ) {
              // parse FObjectProperty
              FObject value = (FObject) getX().create(prop.getValueClass());
              parseBody(child, value);
              prop.set(obj, value);
            } else if ( prop instanceof AbstractFObjectArrayPropertyInfo ) {
              // parse FObjectArrayProperty
              List list = new ArrayList();
              Class of = Class.forName(((AbstractFObjectArrayPropertyInfo) prop).of());
              Iterator array = child.getChildElements();
              while ( array.hasNext() ) {
                SOAPElement arrayChild = (SOAPElement) array.next();
                FObject value = (FObject) getX().create(of);
                parseBody(arrayChild, value);
                list.add(value);
              }
              prop.set(obj, list.toArray());
            } else if ( prop instanceof AbstractDatePropertyInfo ) {
              // Parse XSD datetime
              if ( ! SafetyUtil.isEmpty(child.getValue()) ) {
                prop.set(obj, DatatypeConverter.parseDateTime(child.getValue()).getTime());
              }
            } else {
              // Parse simple type
              if ( ! SafetyUtil.isEmpty(child.getValue()) ) {
                prop.setFromString(obj, child.getValue());
              }
            }
          }
        }
      }
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }
}
