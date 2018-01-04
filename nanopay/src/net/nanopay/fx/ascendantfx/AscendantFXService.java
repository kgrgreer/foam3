package net.nanopay.fx.ascendantfx;

import foam.core.*;
import net.nanopay.fx.ascendantfx.model.*;
import org.apache.commons.io.IOUtils;

import javax.xml.namespace.QName;
import javax.xml.soap.*;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
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
      response.writeTo(System.out);
      return null;
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }

  @Override
  public AcceptQuoteResult acceptQuote(AcceptQuoteRequest request) {
    return null;
  }

  @Override
  public SubmitDealResult submitDeal(SubmitDealRequest request) {
    return null;
  }

  @Override
  public SubmitIncomingDealResult submitIncomingDeal(SubmitIncomingDealRequest request) {
    return null;
  }

  @Override
  public GetAccountBalanceResult getAccountBalance(GetAccountBalanceRequest request) {
    return null;
  }

  @Override
  public ValidateIBANResult validateIBAN(ValidateIBANRequest request) {
    return null;
  }

  @Override
  public PayeeOperationResult addPayee(PayeeOperationRequest request) {
    return null;
  }

  @Override
  public PayeeOperationResult updatePayee(PayeeOperationRequest request) {
    return null;
  }

  @Override
  public PayeeOperationResult deletePayee(PayeeOperationRequest request) {
    return null;
  }

  @Override
  public GetPayeeInfoResult getPayeeInfo(GetPayeeInfoRequest request) {
    return null;
  }

  @Override
  public PostDealResult postDeal(PostDealRequest request) {
    return null;
  }

  @Override
  public PostDealConfirmationResult postDealConfirmation(PostDealConfirmationRequest request) {
    return null;
  }

  @Override
  public PayeeInfoValidationResult validatePayeeInfo(PayeeInfoValidationRequest request) {
    return null;
  }

  @Override
  public GetAccountActivityResult getAccountActivity(GetAccountActivityRequest request) {
    return null;
  }

  @Override
  public IncomingFundStatusCheckResult checkIncomingFundsStatus(IncomingFundStatusCheckRequest request) {
    return null;
  }

  @Override
  public GetQuoteTBAResult getQuoteTBA(GetQuoteTBARequest request) {
    return null;
  }

  @Override
  public AcceptAndSubmitDealTBAResult acceptAndSubmitDealTBA(AcceptQuoteRequest request) {
    return null;
  }

  @Override
  public IncomingPaymentInstructionResult getIncomingPaymentInstruction(IncomingPaymentInstructionRequest request) {
    return null;
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
}