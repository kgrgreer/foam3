package net.nanopay.fx.ascendantfx;

import foam.core.*;
import net.nanopay.fx.ascendantfx.model.*;

import javax.xml.bind.DatatypeConverter;
import javax.xml.namespace.QName;
import javax.xml.soap.*;
import java.util.*;
import java.io.*;
import foam.nanos.logger.Logger;

public class AscendantFXService
    extends ContextAwareSupport
    implements AscendantFX
{
  protected final String host_;
  protected final String username_;
  protected final String password_;
  protected Logger logger;

  public AscendantFXService(X x, String host, String username, String password) {
    setX(x);
    host_ = host;
    username_ = username;
    password_ = password;
    logger = (Logger) x.get("logger");
  }

  @Override
  public GetQuoteResult getQuote(GetQuoteRequest request) {
    try {
      StringBuffer sbuf = new StringBuffer();
      sbuf.append("\n------------------------------------\n");
      sbuf.append("Soap Request--------------------------\n");
      // initialize soap message
      SOAPMessage message = createSOAPMessage("GetQuote", request);
      ByteArrayOutputStream requestBaos = new ByteArrayOutputStream();
      message.writeTo(requestBaos);
      sbuf.append(requestBaos.toString());
      sbuf.append("\n");
      // send soap message
      sbuf.append("Soap Response--------------------------\n");
      SOAPMessage response = sendMessage("GetQuote", message);
      ByteArrayOutputStream responseBaos = new ByteArrayOutputStream();
      response.writeTo(responseBaos);
      sbuf.append(responseBaos.toString());
      sbuf.append("\n");
      logger.info(sbuf.toString());
      // parse response
      return (GetQuoteResult) parseMessage(response, GetQuoteResult.class);
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }

  @Override
  public AcceptQuoteResult acceptQuote(AcceptQuoteRequest request) {
    try {
      // initialize soap message
      SOAPMessage message = createSOAPMessage("AcceptQuote", request);
      // send soap message
      SOAPMessage response = sendMessage("AcceptQuote", message);
      // parse response
      return (AcceptQuoteResult) parseMessage(response, AcceptQuoteResult.class);
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }

  @Override
  public SubmitDealResult submitDeal(SubmitDealRequest request) {
    try {
      StringBuffer sbuf = new StringBuffer();
      sbuf.append("\n------------------------------------\n");
      sbuf.append("Soap Request--------------------------\n");
      // initialize soap message
      SOAPMessage message = createSOAPMessage("SubmitDeal", request);
      ByteArrayOutputStream requestBaos = new ByteArrayOutputStream();
      message.writeTo(requestBaos);
      sbuf.append(requestBaos.toString());
      sbuf.append("\n");
      // send soap message
      sbuf.append("Soap Response--------------------------\n");
      SOAPMessage response = sendMessage("SubmitDeal", message);
      ByteArrayOutputStream responseBaos = new ByteArrayOutputStream();
      response.writeTo(responseBaos);
      sbuf.append(responseBaos.toString());
      sbuf.append("\n");
      logger.info(sbuf.toString());
      // parse response
      return (SubmitDealResult) parseMessage(response, SubmitDealResult.class);
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }

  @Override
  public SubmitIncomingDealResult submitIncomingDeal(SubmitIncomingDealRequest request) {
    try {
      // initialize soap message
      SOAPMessage message = createSOAPMessage("SubmitIncomingDeal", request);
      // send soap message
      SOAPMessage response = sendMessage("SubmitIncomingDeal", message);
      // parse response
      return (SubmitIncomingDealResult) parseMessage(response, SubmitIncomingDealResult.class);
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }

  @Override
  public GetAccountBalanceResult getAccountBalance(GetAccountBalanceRequest request) {
    try {
      // initialize soap message
      SOAPMessage message = createSOAPMessage("GetAccountBalance", request);
      // send soap message
      SOAPMessage response = sendMessage("GetAccountBalance", message);
      // parse response
      return (GetAccountBalanceResult) parseMessage(response, GetAccountBalanceResult.class);
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }

  @Override
  public ValidateIBANResult validateIBAN(ValidateIBANRequest request) {
    try {
      // initialize soap message
      SOAPMessage message = createSOAPMessage("ValidateIBAN", request);
      // send soap message
      SOAPMessage response = sendMessage("ValidateIBAN", message);
      // parse response
      return (ValidateIBANResult) parseMessage(response, ValidateIBANResult.class);
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }

  @Override
  public PayeeOperationResult addPayee(PayeeOperationRequest request) {
    try {
      // initialize soap message
      SOAPMessage message = createSOAPMessage("AddPayee", request);
      // send soap message
      SOAPMessage response = sendMessage("AddPayee", message);
      // parse response
      return (PayeeOperationResult) parseMessage(response, PayeeOperationResult.class);
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }

  @Override
  public PayeeOperationResult updatePayee(PayeeOperationRequest request) {
    try {
      StringBuffer sbuf = new StringBuffer();
      sbuf.append("\n------------------------------------\n");
      sbuf.append("Soap Request--------------------------\n");
      // initialize soap message
      SOAPMessage message = createSOAPMessage("UpdatePayee", request);
      ByteArrayOutputStream requestBaos = new ByteArrayOutputStream();
      message.writeTo(requestBaos);
      sbuf.append(requestBaos.toString());
      sbuf.append("\n");
      // send soap message
      sbuf.append("Soap Response--------------------------\n");
      SOAPMessage response = sendMessage("UpdatePayee", message);
      ByteArrayOutputStream responseBaos = new ByteArrayOutputStream();
      response.writeTo(responseBaos);
      sbuf.append(responseBaos.toString());
      sbuf.append("\n");
      logger.info(sbuf.toString());
      // parse response
      return (PayeeOperationResult) parseMessage(response, PayeeOperationResult.class);
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }

  @Override
  public PayeeOperationResult deletePayee(PayeeOperationRequest request) {
    try {
      // initialize soap message
      SOAPMessage message = createSOAPMessage("DeletePayee", request);
      // send soap message
      SOAPMessage response = sendMessage("DeletePayee", message);
      // parse response
      return (PayeeOperationResult) parseMessage(response, PayeeOperationResult.class);
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }

  @Override
  public GetPayeeInfoResult getPayeeInfo(GetPayeeInfoRequest request) {
    try {
      StringBuffer sbuf = new StringBuffer();
      sbuf.append("\n------------------------------------\n");
      sbuf.append("Soap Request--------------------------\n");
      // initialize soap message
      SOAPMessage message = createSOAPMessage("GetPayeeInfo", request);
      ByteArrayOutputStream requestBaos = new ByteArrayOutputStream();
      message.writeTo(requestBaos);
      sbuf.append(requestBaos.toString());
      sbuf.append("\n");
      // send soap message
      sbuf.append("Soap Response--------------------------\n");
      SOAPMessage response = sendMessage("GetPayeeInfo", message);
      ByteArrayOutputStream responseBaos = new ByteArrayOutputStream();
      response.writeTo(responseBaos);
      sbuf.append(responseBaos.toString());
      sbuf.append("\n");
      logger.info(sbuf.toString());
      // parse response
      return (GetPayeeInfoResult) parseMessage(response, GetPayeeInfoResult.class);
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }

  @Override
  public PostDealResult postDeal(PostDealRequest request) {
    try {
      // initialize soap message
      SOAPMessage message = createSOAPMessage("PostDeal", request);
      // send soap message
      SOAPMessage response = sendMessage("PostDeal", message);
      // parse response
      return (PostDealResult) parseMessage(response, PostDealResult.class);
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }

  @Override
  public PostDealConfirmationResult postDealConfirmation(PostDealConfirmationRequest request) {
    try {
      // initialize soap message
      SOAPMessage message = createSOAPMessage("PostDealConfirmation", request);
      // send soap message
      SOAPMessage response = sendMessage("PostDealConfirmation", message);
      // parse response
      return (PostDealConfirmationResult) parseMessage(response, PostDealConfirmationResult.class);
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }

  @Override
  public PayeeInfoValidationResult validatePayeeInfo(PayeeInfoValidationRequest request) {
    try {
      // initialize soap message
      SOAPMessage message = createSOAPMessage("PayeeInfoValidation", request);
      // send soap message
      SOAPMessage response = sendMessage("PayeeInfoValidation", message);
      // parse response
      return (PayeeInfoValidationResult) parseMessage(response, PayeeInfoValidationResult.class);
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }

  @Override
  public GetAccountActivityResult getAccountActivity(GetAccountActivityRequest request) {
    try {
      // initialize soap message
      SOAPMessage message = createSOAPMessage("GetAccountActivity", request);
      // send soap message
      SOAPMessage response = sendMessage("GetAccountActivity", message);
      // parse response
      return (GetAccountActivityResult) parseMessage(response, GetAccountActivityResult.class);
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }

  @Override
  public IncomingFundStatusCheckResult checkIncomingFundsStatus(IncomingFundStatusCheckRequest request) {
    try {
      // initialize soap message
      SOAPMessage message = createSOAPMessage("IncomingFundStatusCheck", request);
      // send soap message
      SOAPMessage response = sendMessage("IncomingFundStatusCheck", message);
      // parse response
      return (IncomingFundStatusCheckResult) parseMessage(response, IncomingFundStatusCheckResult.class);
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }

  @Override
  public GetQuoteTBAResult getQuoteTBA(GetQuoteTBARequest request) {
    try {
      // initialize soap message
      SOAPMessage message = createSOAPMessage("GetQuoteTBA", request);
      // send soap message
      SOAPMessage response = sendMessage("GetQuoteTBA", message);
      // parse response
      return (GetQuoteTBAResult) parseMessage(response, GetQuoteTBAResult.class);
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }

  @Override
  public AcceptAndSubmitDealTBAResult acceptAndSubmitDealTBA(AcceptQuoteRequest request) {
    try {
      // initialize soap message
      SOAPMessage message = createSOAPMessage("AcceptAndSubmitDealTBA", request);
      // send soap message
      SOAPMessage response = sendMessage("AcceptAndSubmitDealTBA", message);
      // parse response
      return (AcceptAndSubmitDealTBAResult) parseMessage(response, AcceptAndSubmitDealTBAResult.class);
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }

  @Override
  public IncomingPaymentInstructionResult getIncomingPaymentInstruction(IncomingPaymentInstructionRequest request) {
    try {
      // initialize soap message
      SOAPMessage message = createSOAPMessage("GetIncomingPaymentInstruction", request);
      // send soap message
      SOAPMessage response = sendMessage("GetIncomingPaymentInstruction", message);
      // parse response
      return (IncomingPaymentInstructionResult) parseMessage(response, IncomingPaymentInstructionResult.class);
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }

  /**
   * Initialize the SOAP message with namespace declarations and headers
   *
   * @param method method to use
   * @return newly initialized SOAPMessage
   */
  protected SOAPMessage createSOAPMessage(String method, FObject object) {
    try {
      SOAPMessage message = MessageFactory.newInstance(SOAPConstants.SOAP_1_2_PROTOCOL).createMessage();
      SOAPPart part = message.getSOAPPart();

      // get envelope, header, and body
      SOAPEnvelope envelope = part.getEnvelope();
      SOAPHeader header = envelope.getHeader();
      SOAPBody body = envelope.getBody();

      // AFX doesn't seem to accept the default namespace prefixes
      // so override the default with the ones found in their message
      envelope.removeNamespaceDeclaration(envelope.getPrefix());
      envelope.addNamespaceDeclaration("s", "http://www.w3.org/2003/05/soap-envelope");
      envelope.addNamespaceDeclaration("a", "http://www.w3.org/2005/08/addressing");
      envelope.addNamespaceDeclaration("u", "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd");
      envelope.setPrefix("s");
      header.setPrefix("s");
      body.setPrefix("s");

      // add the "action" child element
      SOAPElement action = header.addChildElement("Action", "a");
      action.addAttribute(new QName("s:mustUnderstand"), "1");
      action.addTextNode("http://tempuri.org/IAFXLinkRESTServiceCustom/" + method);

      // add the "to" child element
      SOAPElement to = header.addChildElement("To", "a");
      to.addAttribute(new QName("s:mustUnderstand"), "1");
      to.addTextNode("https://afxlink-test.ascendantfx.com/AFXLinkCustom.svc");

      // add "security" child element
      SOAPElement security = header.addChildElement("Security", "o", "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd");
      security.addAttribute(new QName("s:mustUnderstand"), "1");

      // add username
      SOAPElement usernameToken = security.addChildElement("UsernameToken", "o");
      SOAPElement username = usernameToken.addChildElement("Username", "o");
      username.addTextNode(username_);

      // add password
      SOAPElement password = usernameToken.addChildElement("Password", "o");
      password.addAttribute(new QName("Type"), "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText");
      password.addTextNode(password_);

      // add outer and inner wrappers and then add request body
      SOAPElement outer = body.addChildElement(method, null, "http://tempuri.org/");
      SOAPElement inner = outer.addChildElement("request");
      inner.addAttribute(new QName("xmlns:a"), "http://www.afx.com");
      inner.addAttribute(new QName("xmlns:i"), "http://www.w3.org/2001/XMLSchema-instance");
      addBody(inner, object);
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
        if ( prop.get(obj) == null || ! prop.isSet(obj) ) continue;
        SOAPElement child = element.addChildElement(prop.getName(), "a");

        if ( prop instanceof AbstractFObjectPropertyInfo ) {
          // add FObject properties
          addBody(child, (FObject) prop.get(obj));
        } else if ( prop instanceof AbstractFObjectArrayPropertyInfo ) {
          // add FObjectArray properties
          FObject[] objs = (FObject[]) prop.get(obj);
          for ( FObject o : objs ) {
            addBody(child.addChildElement(o.getClass().getSimpleName(), "a"), o);
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
  protected SOAPMessage sendMessage(String method, SOAPMessage message) {
    SOAPConnection conn = null;

    try {
      conn = SOAPConnectionFactory.newInstance().createConnection();
      return conn.call(message, host_ + "/" + method);
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
      iterator = outer.getChildElements();
      SOAPBodyElement inner = (SOAPBodyElement) iterator.next();

      FObject obj = (FObject) getX().create(clazz);
      parseBody(inner, obj);
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
        Iterator children = element.getChildElements(new QName("http://www.afx.com", prop.getName(), "b"));

        // walk the children to find correct element
        while ( children.hasNext() ) {
          SOAPElement child = (SOAPElement) children.next();
          // check that local name equals the property name
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
              Iterator array = child.getChildElements(new QName("http://www.afx.com", of.getSimpleName(), "b"));
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
