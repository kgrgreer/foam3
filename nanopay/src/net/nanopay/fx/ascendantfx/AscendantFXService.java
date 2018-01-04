package net.nanopay.fx.ascendantfx;

import foam.core.*;
import net.nanopay.fx.ascendantfx.model.*;

import javax.xml.bind.DatatypeConverter;
import javax.xml.namespace.QName;
import javax.xml.soap.*;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class AscendantFXService
    extends ContextAwareSupport
    implements AscendantFX
{
  public static final String HOST = "https://afxlink-test.ascendantfx.com/AFXLinkCustom.svc";

  protected static final ThreadLocal<MessageFactory> mf = new ThreadLocal<MessageFactory>() {
    @Override
    protected MessageFactory initialValue() {
      try {
        return MessageFactory.newInstance(SOAPConstants.SOAP_1_2_PROTOCOL);
      } catch (Throwable t) {
        throw new RuntimeException(t);
      }
    }
  };

  protected static final ThreadLocal<SOAPConnectionFactory> scf = new ThreadLocal<SOAPConnectionFactory>() {
    @Override
    protected SOAPConnectionFactory initialValue() {
      try {
        return SOAPConnectionFactory.newInstance();
      } catch (Throwable t) {
        throw new RuntimeException(t);
      }
    }
  };

  protected final String username_;
  protected final String password_;

  public AscendantFXService(X x, String username, String password) {
    setX(x);
    this.username_ = username;
    this.password_ = password;
  }

  @Override
  public GetQuoteResult getQuote(GetQuoteRequest request) {
    try {
      // initialize soap message
      SOAPMessage message = createSOAPMessage("GetQuote", request);
      // send soap message
      SOAPMessage response = sendMessage(message, "GetQuote");
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
      SOAPMessage response = sendMessage(message, "AcceptQuote");
      // parse response
      return (AcceptQuoteResult) parseMessage(response, AcceptQuoteResult.class);
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }

  @Override
  public SubmitDealResult submitDeal(SubmitDealRequest request) {
    try {
      // initialize soap message
      SOAPMessage message = createSOAPMessage("SubmitDeal", request);
      // send soap message
      SOAPMessage response = sendMessage(message, "SubmitDeal");
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
      SOAPMessage response = sendMessage(message, "SubmitIncomingDeal");
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
      SOAPMessage response = sendMessage(message, "GetAccountBalance");
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
      SOAPMessage response = sendMessage(message, "ValidateIBAN");
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
      SOAPMessage response = sendMessage(message, "AddPayee");
      // parse response
      return (PayeeOperationResult) parseMessage(response, PayeeOperationResult.class);
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }

  @Override
  public PayeeOperationResult updatePayee(PayeeOperationRequest request) {
    try {
      // initialize soap message
      SOAPMessage message = createSOAPMessage("UpdatePayee", request);
      // send soap message
      SOAPMessage response = sendMessage(message, "UpdatePayee");
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
      SOAPMessage response = sendMessage(message, "DeletePayee");
      // parse response
      return (PayeeOperationResult) parseMessage(response, PayeeOperationResult.class);
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }

  @Override
  public GetPayeeInfoResult getPayeeInfo(GetPayeeInfoRequest request) {
    try {
      // initialize soap message
      SOAPMessage message = createSOAPMessage("GetPayeeInfo", request);
      // send soap message
      SOAPMessage response = sendMessage(message, "GetPayeeInfo");
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
      SOAPMessage response = sendMessage(message, "PostDeal");
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
      SOAPMessage response = sendMessage(message, "PostDealConfirmation");
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
      SOAPMessage response = sendMessage(message, "PayeeInfoValidation");
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
      SOAPMessage response = sendMessage(message, "GetAccountActivity");
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
      SOAPMessage response = sendMessage(message, "IncomingFundStatusCheck");
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
      SOAPMessage response = sendMessage(message, "GetQuoteTBA");
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
      SOAPMessage response = sendMessage(message, "AcceptAndSubmitDealTBA");
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
      SOAPMessage response = sendMessage(message, "GetIncomingPaymentInstruction");
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
      SOAPMessage message = mf.get().createMessage();
      SOAPPart part = message.getSOAPPart();

      // get envelope, header, and body
      SOAPEnvelope envelope = part.getEnvelope();
      SOAPHeader header = envelope.getHeader();
      SOAPBody body = envelope.getBody();

      envelope.removeNamespaceDeclaration(envelope.getPrefix());
      envelope.addNamespaceDeclaration("s", "http://www.w3.org/2003/05/soap-envelope");
      envelope.addNamespaceDeclaration("a", "http://www.w3.org/2005/08/addressing");
      envelope.addNamespaceDeclaration("u", "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd");
      envelope.setPrefix("s");
      header.setPrefix("s");
      body.setPrefix("s");

      SOAPElement action = header.addChildElement("Action", "a");
      action.addAttribute(new QName("s:mustUnderstand"), "1");
      action.addTextNode("http://tempuri.org/IAFXLinkRESTServiceCustom/" + method);

      SOAPElement to = header.addChildElement("To", "a");
      to.addAttribute(new QName("s:mustUnderstand"), "1");
      to.addTextNode("https://afxlink-test.ascendantfx.com/AFXLinkCustom.svc");

      SOAPElement security = header.addChildElement("Security", "o", "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd");
      security.addAttribute(new QName("s:mustUnderstand"), "1");

      SOAPElement usernameToken = security.addChildElement("UsernameToken", "o");
      SOAPElement username = usernameToken.addChildElement("Username", "o");
      username.addTextNode(this.username_);

      SOAPElement password = usernameToken.addChildElement("Password", "o");
      password.addAttribute(new QName("Type"), "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText");
      password.addTextNode(this.password_);

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
      List<PropertyInfo> props = obj.getClassInfo().getAxiomsByClass(PropertyInfo.class);
      Iterator i = props.iterator();

      while (i.hasNext()) {
        PropertyInfo prop = (PropertyInfo) i.next();
        if ( prop.get(obj) == null || ! prop.isSet(obj) ) continue;
        SOAPElement child = element.addChildElement(prop.getName(), "a");

        if ( prop instanceof AbstractFObjectPropertyInfo ) {
          addBody(child, (FObject) prop.get(obj));
        } else if ( prop instanceof AbstractFObjectArrayPropertyInfo ) {
          FObject[] objs = (FObject[]) prop.get(obj);
          for ( FObject o : objs ) {
            addBody(child.addChildElement(o.getClass().getSimpleName(), "a"), o);
          }
        } else {
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
   * @param message SOAP message to send
   * @param method url endpoint
   * @return SOAP message response
   */
  protected SOAPMessage sendMessage(SOAPMessage message, String method) {
    SOAPConnection conn = null;

    try {
      conn = scf.get().createConnection();
      return conn.call(message, HOST + "/" + method);
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

      while ( i.hasNext() ) {
        PropertyInfo prop = (PropertyInfo) i.next();
        Iterator children = element.getChildElements(new QName("http://www.afx.com", prop.getName(), "b"));

        while ( children.hasNext() ) {
          SOAPElement child = (SOAPElement) children.next();
          if ( child.getLocalName().equals(prop.getName()) ) {
            if ( prop instanceof AbstractFObjectPropertyInfo ) {
              FObject value = (FObject) getX().create(prop.getValueClass());
              parseBody(child, value);
              prop.set(obj, value);
            } else if ( prop instanceof AbstractFObjectArrayPropertyInfo ) {
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
              prop.set(obj, DatatypeConverter.parseDateTime(child.getValue()).getTime());
            } else {
              prop.setFromString(obj, child.getValue());
              break;
            }
          }
        }
      }
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }
}